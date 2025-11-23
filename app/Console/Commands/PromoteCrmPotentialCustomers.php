<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

// Models:
use App\Models\CrmPotentialCustomerTmp;
use App\Models\CrmContact;
use App\Models\User;
use App\Models\UserAddress;
use App\Models\UserNote;

class PromoteCrmPotentialCustomers extends Command
{
    /**
     * Command:
     *  php artisan crm:promote-potential-customers
     *  php artisan crm:promote-potential-customers --dry-run
     *  php artisan crm:promote-potential-customers --only-external-id=...
     */
    protected $signature = 'crm:promote-potential-customers
                            {--company=1 : ID de la empresa del ERP (tenant) a la que se asignan los contactos}
                            {--chunk=500 : Tamaño de lote para procesar registros}
                            {--only-external-id= : Procesar sólo un potencial concreto por external_id}
                            {--dry-run : Simula la promoción sin guardar cambios}';

    protected $description = 'Promociona clientes potenciales desde crm_potential_customers_tmp a users / crm_contacts y tablas asociadas';

    public function handle()
    {
        $tenantCompanyId = (int) ($this->option('company') ?: 1);
        $chunkSize       = (int) ($this->option('chunk') ?: 500);
        $onlyExternalId  = $this->option('only-external-id');
        $dryRun          = (bool) $this->option('dry-run');

        $this->info("Promocionando clientes potenciales desde crm_potential_customers_tmp para company_id={$tenantCompanyId}"
            . ($dryRun ? ' [DRY RUN]' : ''));

        // Query base
        $baseQuery = CrmPotentialCustomerTmp::query();

        if ($onlyExternalId) {
            $baseQuery->where('external_id', $onlyExternalId);
        }

        $total = (clone $baseQuery)->count();

        if ($total === 0) {
            $this->warn('No hay registros en crm_potential_customers_tmp que coincidan con el filtro.');
            return Command::SUCCESS;
        }

        $this->info("Total registros a procesar: {$total}");

        // Cachés en memoria para no repetir queries absurdas
        $userCache       = []; // email => User
        $ownerCache      = []; // owner full name => owner_id
        $processed       = 0;
        $createdUsers    = 0;
        $updatedUsers    = 0;
        $createdContacts = 0;
        $updatedContacts = 0;
        $errors          = 0;

        $baseQuery->orderBy('id')
            ->chunkById($chunkSize, function ($rows) use (
                $tenantCompanyId,
                $dryRun,
                &$userCache,
                &$ownerCache,
                &$processed,
                &$createdUsers,
                &$updatedUsers,
                &$createdContacts,
                &$updatedContacts,
                &$errors
            ) {
                $closure = function () use (
                    $rows,
                    $tenantCompanyId,
                    &$userCache,
                    &$ownerCache,
                    &$processed,
                    &$createdUsers,
                    &$updatedUsers,
                    &$createdContacts,
                    &$updatedContacts,
                    &$errors
                ) {
                    foreach ($rows as $tmp) {
                        try {
                            $result = $this->processSinglePotentialCustomer(
                                $tmp,
                                $tenantCompanyId,
                                $userCache,
                                $ownerCache
                            );

                            $createdUsers    += $result['created_users']    ?? 0;
                            $updatedUsers    += $result['updated_users']    ?? 0;
                            $createdContacts += $result['created_contacts'] ?? 0;
                            $updatedContacts += $result['updated_contacts'] ?? 0;

                            $processed++;

                            if ($processed % 500 === 0) {
                                $this->info("Procesados {$processed} clientes potenciales...");
                            }

                        } catch (\Throwable $e) {
                            $errors++;
                            $this->error("Error procesando tmp_id={$tmp->id}: {$e->getMessage()}");
                        }
                    }
                };

                if ($dryRun) {
                    // DRY RUN: no ejecutamos el closure para no guardar nada
                    $this->comment('DRY RUN: simulando chunk de ' . count($rows) . ' registros (sin escritura).');
                    // Si algún día quieres dry-run “real” con lógica interna,
                    // habría que pasar $dryRun hasta processSinglePotentialCustomer
                    // y condicionar los ->save() allí.
                } else {
                    DB::transaction($closure);
                }
            });

        $this->info("Proceso terminado.");
        $this->info("Registros procesados:         {$processed}");
        $this->info("Usuarios creados:             {$createdUsers}");
        $this->info("Usuarios actualizados:        {$updatedUsers}");
        $this->info("Contactos CRM creados:        {$createdContacts}");
        $this->info("Contactos CRM actualizados:   {$updatedContacts}");
        $this->info("Errores:                      {$errors}");

        return Command::SUCCESS;
    }

    /**
     * Procesa un único registro de crm_potential_customers_tmp.
     */
    protected function processSinglePotentialCustomer(
        CrmPotentialCustomerTmp $tmp,
        int $tenantCompanyId,
        array &$userCache,
        array &$ownerCache
    ): array {
        $createdUsers    = 0;
        $updatedUsers    = 0;
        $createdContacts = 0;
        $updatedContacts = 0;

        // 1) Owner del potencial
        $ownerId = $this->resolveOwnerIdForPotential($tmp, $ownerCache);

        // 2) Usuario asociado (por email)
        [$user, $userCreated, $userUpdated] = $this->resolveUserForPotentialCustomer($tmp, $userCache);

        if (! $user) {
            // Si no hay usuario, no tiene sentido crear contacto
            $this->warn("Fila tmp_id={$tmp->id}: sin usuario resolvido (email vacío o inválido). Se omite.");
            return [
                'created_users'    => 0,
                'updated_users'    => 0,
                'created_contacts' => 0,
                'updated_contacts' => 0,
            ];
        }

        if ($userCreated) {
            $createdUsers++;
        }
        if ($userUpdated) {
            $updatedUsers++;
        }

        // Guardamos user_id en la tmp (como hacías en myLogica)
        $tmp->user_id = $user->id;
        $tmp->save();

        // 3) Contacto CRM (cliente potencial)
        [$contact, $contactCreated, $contactUpdated] = $this->syncCrmContactForPotentialCustomer(
            $tmp,
            $tenantCompanyId,
            $user,
            $ownerId
        );

        if ($contactCreated) {
            $createdContacts++;
        }
        if ($contactUpdated) {
            $updatedContacts++;
        }

        // 4) Dirección y nota asociada
        $this->syncUserAddressAndNote($tmp, $user, $ownerId, $tenantCompanyId);

        // 5) Si quieres marcar la fila tmp como procesada, aquí:
        $this->markTmpRowStatus($tmp, $contact, $user);

        return [
            'created_users'    => $createdUsers,
            'updated_users'    => $updatedUsers,
            'created_contacts' => $createdContacts,
            'updated_contacts' => $updatedContacts,
        ];
    }

    /**
     * Resuelve el owner (usuario interno) a partir de tmp->owner, con caché.
     */
    protected function resolveOwnerIdForPotential(
        CrmPotentialCustomerTmp $tmp,
        array &$ownerCache
    ): int {
        $ownerName = trim((string) $tmp->owner);

        if ($ownerName === '') {
            return 1; // fallback: usuario 1
        }

        if (isset($ownerCache[$ownerName])) {
            return $ownerCache[$ownerName];
        }

        $owner = User::whereRaw("TRIM(CONCAT(name, ' ', surname)) = ?", [$ownerName])->first();

        if (! $owner) {
            $owner = new User();
            $owner->name    = $ownerName;
            $owner->surname = null;
            $owner->isAdmin = 1;
            $owner->status  = 1;
            $owner->email   = null;
            $owner->save();
        }

        return $ownerCache[$ownerName] = $owner->id;
    }

    /**
     * Localiza o crea el usuario asociado al potencial.
     *
     * @return array [User|null $user, bool $created, bool $updated]
     */
    protected function resolveUserForPotentialCustomer(
        CrmPotentialCustomerTmp $tmp,
        array &$userCache
    ): array {
        $email = trim((string) $tmp->email);
        $cacheKey = $email !== '' ? 'email:' . mb_strtolower($email) : null;

        if ($cacheKey && isset($userCache[$cacheKey])) {
            return [$userCache[$cacheKey], false, false];
        }

        $user    = null;
        $created = false;
        $updated = false;

        if ($email !== '') {
            $user = User::where('email', $email)->first();
        }

        if (! $user) {
            if ($email === '') {
                // Sin email no inventamos usuario
                return [null, false, false];
            }

            // Nombre y apellidos “limpios”
            $nameRaw    = $tmp->name ? trim($tmp->name) : '';
            $surnameRaw = $tmp->surname ? trim($tmp->surname) : '';

            // Si no hay nombre, lo sacamos del email (antes de @)
            if ($nameRaw === '') {
                $localPart = strstr($email, '@', true) ?: $email;
                // quitamos puntos/guiones/underscores y lo normalizamos
                $localPart = str_replace(['.', '_', '-'], ' ', $localPart);
                $nameRaw   = ucwords(mb_strtolower($localPart, 'UTF-8'));
            } else {
                $nameRaw = ucwords(mb_strtolower($nameRaw, 'UTF-8'));
            }

            if ($surnameRaw !== '') {
                $surnameRaw = ucwords(mb_strtolower($surnameRaw, 'UTF-8'));
            } else {
                $surnameRaw = null;
            }

            // Creamos usuario nuevo
            $randomPassword = Str::random(8);

            $user = new User();
            $user->name     = $nameRaw ?: 'Contacto'; // nunca null
            $user->surname  = $surnameRaw;
            $user->email    = $email;
            $user->password = bcrypt($randomPassword);
            $user->isAdmin  = false;
            $user->status   = 1;

            // created_at desde created_date de tmp, si existe
            $createdAt = Carbon::now();
            if (! empty($tmp->created_date)) {
                try {
                    $createdAt = $tmp->created_date instanceof Carbon
                        ? $tmp->created_date
                        : Carbon::parse($tmp->created_date);
                } catch (\Throwable $e) {
                    // si falla, nos quedamos con now()
                }
            }
            $user->created_at = $createdAt;

            $user->save();

            // Rol invitado
            try {
                $user->assignRole(config('constants.ROLE_INVITADO_NAME_'));
            } catch (\Throwable $e) {
                // si no existe el rol, que no reviente la importación
            }

            $created = true;
        } else {
            // Aquí podrías actualizar nombre/apellidos si quieres,
            // pero de momento no tocamos usuarios existentes.
            $updated = false;
        }

        if ($cacheKey) {
            $userCache[$cacheKey] = $user;
        }

        return [$user, $created, $updated];
    }

    /**
     * Crea o actualiza el CrmContact a partir del potencial.
     * contact_type aquí será siempre 'clp'.
     *
     * @return array [CrmContact $contact, bool $created, bool $updated]
     */
    protected function syncCrmContactForPotentialCustomer(
        CrmPotentialCustomerTmp $tmp,
        int $tenantCompanyId,
        ?User $user,
        int $ownerId
    ): array {
        if (! $user) {
            return [new CrmContact(), false, false];
        }

        $contactType = 'clp';

        // Buscamos contacto existente para ese user + company + tipo clp
        $query = CrmContact::query()
            ->where('company_id', $tenantCompanyId)
            ->where('user_id', $user->id)
            ->where('contact_type', $contactType);

        $contact = $query->first();
        $created = false;
        $updated = false;

        if (! $contact) {
            $contact = new CrmContact();
            $contact->company_id   = $tenantCompanyId;
            $contact->user_id      = $user->id;
            $contact->contact_type = $contactType;
            $created = true;
        } else {
            $updated = true;
        }

        $contact->crm_account_id = null; // potencial sin cuenta asignada
        $contact->owner_id       = $ownerId;
        $contact->status         = 1;
        $contact->observations   = $tmp->issue ?: $tmp->description;

        // created_at: si es nuevo y tenemos created_date en tmp, la aprovechamos
        if ($created && ! $contact->created_at) {
            $createdAt = $user->created_at ?? Carbon::now();

            if (! empty($tmp->created_date)) {
                try {
                    $createdAt = $tmp->created_date instanceof Carbon
                        ? $tmp->created_date
                        : Carbon::parse($tmp->created_date);
                } catch (\Throwable $e) {
                    // dejamos la que hubiera
                }
            }

            $contact->created_at = $createdAt;
        }

        $contact->save();

        return [$contact, $created, $updated];
    }

    /**
     * Direcciones y notas asociadas al potencial.
     */
    protected function syncUserAddressAndNote(
        CrmPotentialCustomerTmp $tmp,
        User $user,
        int $ownerId,
        int $tenantCompanyId
    ): void {
        // Dirección: solo cp, como en tu myLogica
        if (! empty($tmp->cp)) {
            UserAddress::firstOrCreate(
                [
                    'user_id' => $user->id,
                    'cp'      => $tmp->cp,
                ],
                []
            );
        }

        // Nota sobre el usuario
        if (! empty($tmp->description)) {
            $note = new UserNote();
            $note->company_id = $tenantCompanyId;
            $note->owner_id   = $ownerId;
            $note->contact_id = $user->id;
            $note->title      = 'Nota';
            $note->body       = $tmp->description;
            $note->relevance  = 3;
            $note->save();
        }
    }

    /**
     * Marca la fila temporal como procesada (si algún día añades processed_at, etc.).
     */
    protected function markTmpRowStatus(
        CrmPotentialCustomerTmp $tmp,
        ?CrmContact $contact = null,
        ?User $user = null
    ): void {
        // De momento no tocamos nada; si quieres tracking, este es el sitio.
    }

    /**
     * Punto para que metas tu lógica "en bruto" si quieres probar cosas
     * sin pasar por el sistema de chunks / opciones.
     * NO SE TOCA, lo dejas como referencia.
     */
    protected function myLogica()
    {
        $ownerId = 1;

        $currentCompanyId = 1;

        $data = CrmPotentialCustomerTmp::all();

        $contact_type = 'clp';

        foreach($data as $r){
            if($r->owner){
                $owner = User::whereRaw("CONCAT(name, ' ', surname) = ?", [trim($r->owner)])->first();

                if(!$owner){
                    $owner = new User();
                    $owner->name = trim($r->owner);   
                    $owner->surname = null;
                    $owner->isAdmin = 1;
                    $owner->status = 1;                     
                    $owner->save();
                }

                $ownerId = $owner->id;
            }

            //Verificamos si existe usuario a través del email:
            if($r->email){
                $user = User::where('email', trim($r->email))->first();
            }

            if(!$user){
                //Creamos usuario:
                $random_password = Str::random(8);

                $user = new User();
                $user->name = ucwords(mb_strtolower($r->name, 'UTF-8'));
                $user->surname = ucwords(mb_strtolower($r->surname, 'UTF-8'));
                $user->email = $r->email;
                $user->password = bcrypt($random_password);
                $user->isAdmin = false;
                $user->status = 1;
                $user->created_at = $r->created_date? $r->created_date:Carbon::now();
                $user->save();

                //Guardamos rol:
                $user->assignRole(config('constants.ROLE_INVITADO_NAME_'));
            }

            //Guardamos user_id en crm_potential_customers_tmp:
            $r->user_id = $user->id;
            $r->save();

            $cc = new CrmContact();
            $cc->company_id =  $currentCompanyId;
            $cc->user_id = $user->id;
            $cc->crm_account_id = null;      
            $cc->contact_type = $contact_type;
            $cc->owner_id = $ownerId;
            //$cc->is_main = null;
            $cc->status = 1;
            $cc->observations = $r->issue;
            $cc->created_at = $user->created_at;
            $cc->save();

            //Direcciones
            if($r->cp){
                $ad = new UserAddress();
                $ad->user_id = $user->id;
                $ad->cp = $r->cp;
                $ad->save();
            }

            //Notas sobre el usuario:
            if($r->description){
                $n = new UserNote();
                $n->company_id = $currentCompanyId;
                $n->owner_id = $ownerId;
                $n->contact_id = $user->id;
                $n->title = 'Nota';
                $n->body = $r->description;   
                $n->relevance = 3;
                $n->save();
            }
        }
    }
}
