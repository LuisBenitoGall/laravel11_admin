<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

//Concerns:
use App\Concerns\HasContactTypes;

// Models
use App\Models\Company;
use App\Models\CrmAccount;
use App\Models\CrmAccountTmp;
use App\Models\CrmContact;     // tabla final de contactos CRM
use App\Models\CrmContactTmp;
use App\Models\Phone;
use App\Models\User;
use App\Models\UserCompany;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Traits\HasRoles;

class PromoteCrmContacts extends Command
{
    /**
     * Command: php artisan crm:promote-contacts
     */
    protected $signature = 'crm:promote-contacts
                            {--company=1 : ID de la empresa del ERP (tenant) a la que se asignan los contactos}
                            {--chunk=500 : Tamaño de lote para procesar registros}
                            {--only-external-id= : Procesar sólo un contacto concreto por external_id}
                            {--only-account-id= : Procesar sólo contactos asociados a un crm_account_id concreto}
                            {--dry-run : Simula la importación sin guardar cambios}';

    protected $description = 'Promociona contactos desde crm_contacts_tmp a usuarios / crm_contacts y tablas asociadas';

    public function handle()
    {
        $tenantCompanyId = (int) ($this->option('company') ?: 1);
        $chunkSize       = (int) ($this->option('chunk') ?: 500);
        $onlyExternalId  = $this->option('only-external-id');
        $onlyAccountId   = $this->option('only-account-id');
        $dryRun          = (bool) $this->option('dry-run');

        $this->info("Promocionando contactos desde crm_contacts_tmp para company_id={$tenantCompanyId}"
            . ($dryRun ? ' [DRY RUN]' : ''));

        // Query base
        $baseQuery = CrmContactTmp::query();

        if ($onlyExternalId) {
            $baseQuery->where('external_id', $onlyExternalId);
        }

        if ($onlyAccountId) {
            $baseQuery->where('crm_account_id', $onlyAccountId);
        }

        $total = (clone $baseQuery)->count();

        if ($total === 0) {
            $this->warn('No hay registros en crm_contacts_tmp que coincidan con el filtro.');
            return Command::SUCCESS;
        }

        $this->info("Total registros a procesar: {$total}");

        // Cachés en memoria para no repetir queries absurdas
        $userCache       = []; // clave por email u otra cosa => User
        $accountCache    = []; // crm_account_id / normalized_name => CrmAccount
        $ownerCache      = []; // 'Nombre Apellidos' => user_id
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
                &$accountCache,
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
                    &$accountCache,
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
                            $result = $this->processSingleContact(
                                $tmp,
                                $tenantCompanyId,
                                $userCache,
                                $accountCache,
                                $ownerCache
                            );

                            $createdUsers    += $result['created_users']    ?? 0;
                            $updatedUsers    += $result['updated_users']    ?? 0;
                            $createdContacts += $result['created_contacts'] ?? 0;
                            $updatedContacts += $result['updated_contacts'] ?? 0;

                            $processed++;

                            if ($processed % 500 === 0) {
                                $this->info("Procesados {$processed} contactos...");
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
                } else {
                    DB::transaction($closure);
                }
            });

        $this->info("Proceso terminado.");
        $this->info("Registros procesados:       {$processed}");
        $this->info("Usuarios creados:           {$createdUsers}");
        $this->info("Usuarios actualizados:      {$updatedUsers}");
        $this->info("Contactos CRM creados:      {$createdContacts}");
        $this->info("Contactos CRM actualizados: {$updatedContacts}");
        $this->info("Errores:                    {$errors}");

        return Command::SUCCESS;
    }

    /**
     * Procesa un único registro de crm_contacts_tmp.
     */
    protected function processSingleContact(
        CrmContactTmp $tmp,
        int $tenantCompanyId,
        array &$userCache,
        array &$accountCache,
        array &$ownerCache
    ): array {
        $createdUsers    = 0;
        $updatedUsers    = 0;
        $createdContacts = 0;
        $updatedContacts = 0;

        // 1) Owner (propietario del contacto)
        $ownerId = $this->resolveOwnerIdForContact($tmp, $ownerCache);

        // 2) Usuario asociado al contacto
        [$user, $userCreated, $userUpdated] = $this->resolveUserForContact($tmp, $tenantCompanyId, $userCache);
        if (! $user) {
            // Sin usuario no tiene sentido crear contacto CRM
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

        // 3) Cuenta CRM asociada (si existe)
        $account = $this->resolveAccountForContact($tmp, $accountCache);

        // 4) Vinculación User ↔ Company y teléfonos
        $this->syncUserCompanyAndPhones($tmp, $user, $account);

        // 5) Contacto CRM
        [$crmContact, $contactCreated, $contactUpdated] = $this->syncCrmContact(
            $tmp,
            $tenantCompanyId,
            $user,
            $account,
            $ownerId
        );

        if ($contactCreated) {
            $createdContacts++;
        }
        if ($contactUpdated) {
            $updatedContacts++;
        }

        // 6) Si quieres marcar algo en la fila tmp, este es el sitio
        $this->markTmpRowStatus($tmp, $crmContact, $user, $account);

        return [
            'created_users'    => $createdUsers,
            'updated_users'    => $updatedUsers,
            'created_contacts' => $createdContacts,
            'updated_contacts' => $updatedContacts,
        ];
    }

    /**
     * Localiza / crea el owner (tabla users) a partir del campo owner de la tmp.
     * Usa caché para no repetir consultas.
     */
    protected function resolveOwnerIdForContact(CrmContactTmp $tmp, array &$ownerCache): int
    {
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
     * Localiza o crea el usuario (tabla users) asociado al contacto.
     *
     * @return array [User|null $user, bool $created, bool $updated]
     */
    protected function resolveUserForContact(
        CrmContactTmp $tmp,
        int $tenantCompanyId,
        array &$userCache
    ): array {
        $email = trim((string) $tmp->email);
        $cacheKey = $email !== '' ? 'email:' . $email : null;

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
            // Creamos usuario nuevo
            $randomPassword = Str::random(8);

            $sex = null;
            if ($tmp->sex === 'Hombre') {
                $sex = 'h';
            } elseif ($tmp->sex === 'Mujer') {
                $sex = 'm';
            }

            $user = new User();
            $user->name     = $tmp->user_name;
            $user->surname  = $tmp->surname;
            $user->email    = $email !== '' ? $email : null;
            $user->sex      = $sex;
            // $user->nif   = ... // si algún día decides de dónde sacarlo
            $user->password = bcrypt($randomPassword);
            $user->isAdmin  = false;
            $user->status   = 1;

            if (! empty($tmp->created_date)) {
                try {
                    $user->created_at = Carbon::parse($tmp->created_date);
                } catch (\Throwable $e) {
                    $user->created_at = Carbon::now();
                }
            } else {
                $user->created_at = Carbon::now();
            }

            $user->save();

            // Rol invitado
            try {
                $user->assignRole(config('constants.ROLE_INVITADO_NAME_'));
            } catch (\Throwable $e) {
                // Si falla el rol, no rompemos la importación
            }

            $created = true;
        } else {
            // Podrías actualizar datos del usuario aquí si quieres.
            // De momento respetamos el comportamiento original (no tocar).
            $updated = false;
        }

        if ($cacheKey) {
            $userCache[$cacheKey] = $user;
        } else {
            $userCache['id:' . $user->id] = $user;
        }

        return [$user, $created, $updated];
    }

    /**
     * Localiza la cuenta CRM asociada al contacto.
     * Prioriza crm_account_id, si no, normalized_company_name.
     *
     * @return CrmAccount|null
     */
    protected function resolveAccountForContact(
        CrmContactTmp $tmp,
        array &$accountCache
    ): ?CrmAccount {
        // 1) Si ya hay crm_account_id, usamos eso
        if (! empty($tmp->crm_account_id)) {
            $cacheKey = 'id:' . $tmp->crm_account_id;

            if (isset($accountCache[$cacheKey])) {
                return $accountCache[$cacheKey];
            }

            $account = CrmAccount::find($tmp->crm_account_id);
            if ($account) {
                $accountCache[$cacheKey] = $account;
                return $account;
            }
        }

        // 2) Si hay normalized_company_name, intentamos buscar por normalized_name
        if (! empty($tmp->normalized_company_name)) {
            $cacheKey = 'norm:' . $tmp->normalized_company_name;

            if (isset($accountCache[$cacheKey])) {
                return $accountCache[$cacheKey];
            }

            $account = CrmAccount::select('crm_accounts.id', 'crm_accounts.linked_company_id', 'crm_accounts.normalized_name')
                ->where('crm_accounts.normalized_name', $tmp->normalized_company_name)
                ->first();

            if ($account) {
                // Actualizamos crm_account_id en la tabla tmp
                $tmp->crm_account_id = $account->id;
                $tmp->save();

                $accountCache[$cacheKey] = $account;
                $accountCache['id:' . $account->id] = $account;

                return $account;
            }
        }

        return null;
    }

    /**
     * Crea o actualiza el registro en la tabla definitiva de contactos CRM.
     *
     * @return array [CrmContact $contact, bool $created, bool $updated]
     */
    protected function syncCrmContact(
        CrmContactTmp $tmp,
        int $tenantCompanyId,
        ?User $user,
        ?CrmAccount $account,
        int $ownerId
    ): array {
        if (! $user) {
            return [new CrmContact(), false, false];
        }

        $query = CrmContact::query()
            ->where('company_id', $tenantCompanyId)
            ->where('user_id', $user->id);

        if ($account) {
            $query->where('crm_account_id', $account->id);
        } else {
            $query->whereNull('crm_account_id');
        }

        $contact = $query->first();
        $created = false;
        $updated = false;

        if (! $contact) {
            $contact = new CrmContact();
            $contact->company_id = $tenantCompanyId;
            $contact->user_id    = $user->id;
            $created = true;
        } else {
            $updated = true;
        }

        $contact->crm_account_id   = $account?->id;
        $contact->contact_type     = $this->mapContactType($tmp->contact_type);
        $contact->position         = $tmp->position;
        $contact->department       = $tmp->department;
        $contact->cost_center      = $tmp->cost_center;
        $contact->last_year_service = $tmp->last_year_service? $tmp->last_year_service:null;
        $contact->owner_id         = $ownerId;
        $contact->status           = 1;
        $contact->observations     = $tmp->description;

        if ($created && ! $contact->created_at) {
            $contact->created_at = $user->created_at ?? Carbon::now();
        }

        $contact->save();

        return [$contact, $created, $updated];
    }

    /**
     * Sincroniza UserCompany y teléfonos a partir de la fila tmp.
     */
    protected function syncUserCompanyAndPhones(
        CrmContactTmp $tmp,
        ?User $user,
        ?CrmAccount $account
    ): void {
        if (! $user) {
            return;
        }

        // Vinculación usuario ↔ empresa (si hay linked_company_id)
        if ($account && $account->linked_company_id) {
            $exists = UserCompany::where('user_id', $user->id)
                ->where('company_id', $account->linked_company_id)
                ->exists();

            if (! $exists) {
                $uc = new UserCompany();
                $uc->user_id    = $user->id;
                $uc->company_id = $account->linked_company_id;
                $uc->position   = $tmp->position;
                $uc->department = $tmp->department;
                $uc->save();
            }
        }

        // Teléfono móvil principal
        if (! empty($tmp->mobile)) {
            $number = $this->normalizePhone($tmp->mobile, 32); // ajusta longitud si hace falta

            if ($number) {
                Phone::firstOrCreate(
                    [
                        'phoneable_type' => User::class,
                        'phoneable_id'   => $user->id,
                        'e164'           => $number,
                    ],
                    [
                        'type' => 'mobile',
                    ]
                );
            }
        }

        // Teléfono privado 1
        if (! empty($tmp->phone_private1)) {
            $number = $this->normalizePhone($tmp->phone_private1, 32); // ajusta longitud si hace falta

            if ($number) {
                Phone::firstOrCreate(
                    [
                        'phoneable_type' => User::class,
                        'phoneable_id'   => $user->id,
                        'e164'           => $number,
                    ],
                    [
                        'type' => 'mobile', // conservamos tu lógica original
                    ]
                );
            }
        }
    }

    /**
     * Mapea el texto de contact_type de Dynamics a tu código interno.
     */
    protected function mapContactType(?string $label): ?string
    {
        if (! $label) {
            return null;
        }

        $map = [
            'Artista'               => 'arti',
            'Cliente Potencial'     => 'clp',
            'Clientes'              => 'cl',
            'Colaboradores'         => 'colb',
            'Conferencias'          => 'conf',
            'Gabinete de comunicación' => 'gbco',
            'Institucionales'       => 'inst',
            'Medios de comunicación'=> 'mdco',
            'Newsletter'            => 'newl',
            'Otros contactos'       => 'otrc',
            'Patronato'             => 'patr',
            'Proveedores'           => 'pr',
        ];

        return $map[$label] ?? null;
    }

    /**
     * Marca la fila temporal como procesada o guarda algún estado.
     * De momento no hace nada; aquí puedes añadir columnas tipo processed_at, etc.
     */
    protected function markTmpRowStatus(
        CrmContactTmp $tmp,
        ?CrmContact $crmContact = null,
        ?User $user = null,
        ?CrmAccount $account = null
    ): void {
        // No-op por ahora
    }

    /**
     * Normaliza un número de teléfono:
     *  - se queda solo con dígitos y '+' inicial
     *  - si queda vacío o demasiado largo, devuelve null
     */
    protected function normalizePhone(?string $raw, int $maxLen = 32): ?string
    {
        if (! $raw) {
            return null;
        }

        $raw = trim($raw);

        // Permitimos un '+' inicial y el resto dígitos
        // 1) quitamos todo lo que no sea dígito ni '+'
        $clean = preg_replace('/[^\d+]/u', '', $raw);

        // 2) si hay más de un '+', nos quedamos con el primero y el resto se limpian
        if (substr_count($clean, '+') > 1) {
            // quitar todos los '+' y dejar solo el primero si estaba al principio
            $clean = ltrim($clean, '+');
            $clean = '+' . $clean;
        }

        // 3) si no tiene dígitos, no es un teléfono
        if (! preg_match('/\d+/', $clean)) {
            return null;
        }

        // 4) límite de longitud para no romper la columna e164
        if (mb_strlen($clean) > $maxLen) {
            return null;
        }

        return $clean;
    }


    // NO TOCAR: referencia de la lógica original en bruto
    protected function myLogica(){
        $ownerId = 1;

        $currentCompanyId = 1;

        $data = CrmContactTmp::all();

        $contact_types = [
            'Artista' => 'arti',
            'Cliente Potencial' => 'clp',
            'Clientes' => 'cl',
            'Colaboradores' => 'colb',
            'Conferencias' => 'conf',
            'Gabinete de comunicación' => 'gbco',
            'Institucionales' => 'inst',
            'Medios de comunicación' => 'mdco',
            'Newsletter' => 'newl',
            'Otros contactos' => 'otrc',
            'Patronato' => 'patr',
            'Proveedores' => 'pr'
        ];

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

                $sex = $r->sex == 'Hombre'? 'h':($r->sex == 'Mujer'? 'm':null);

                $user = new User();
                $user->name = $r->user_name;
                $user->surname = $r->surname;
                $user->email = $r->email;
                $user->sex = $sex;
                $user->nif = $r->nif? $r->nif:null;
                $user->password = bcrypt($random_password);
                $user->isAdmin = false;
                $user->status = 1;
                $user->created_at = $r->created_date? $r->created_date:Carbon::now();
                $user->save();

                //Guardamos rol:
                $user->assignRole(config('constants.ROLE_INVITADO_NAME_'));
            }

            //Vinculamos usuario a empresa:
            $crm_account = false;
            if($r->normalized_company_name){
                $crm_account = CrmAccount::select('crm_accounts.id', 'crm_accounts.linked_company_id')
                ->where('crm_accounts.normalized_name', $r->normalized_company_name)
                ->first();

                //Actualizamos en CrmContactTmp:
                if($crm_account){
                    $r->crm_account_id = $crm_account->id;
                    $r->save();
                }
            }

            if($crm_account && $crm_account->linked_company_id){
                $uc = new UserCompany();
                $uc->user_id = $user->id;
                $uc->company_id = $crm_account->linked_company_id;
                $uc->position = $r->position;
                $uc->department = $r->department;
                $uc->save();    
            }

            //Teléfonos:
            if($r->mobile){
                $ph = new Phone();
                $ph->phoneable_type = 'App\Models\User';
                $ph->phoneable_id = $user->id;
                $ph->e164 = preg_replace('/\\s+/', '', $r->mobile);  
                $ph->type = 'mobile';  
                $ph->save();
            }
            if($r->phone_private1){
                $ph1 = new Phone();
                $ph1->phoneable_type = 'App\Models\User';
                $ph1->phoneable_id = $user->id;
                $ph1->e164 = preg_replace('/\\s+/', '', $r->phone_private1);  
                $ph1->type = 'mobile';  
                $ph1->save();    
            }

            //Tipo de contacto:
            $contact_type = $r->contact_type && isset($contact_types[$r->contact_type])? $contact_types[$r->contact_type]:null;

            $cc = new CrmContact();
            $cc->company_id =  $currentCompanyId;
            $cc->user_id = $user->id;
            $cc->crm_account_id = $crm_account? $crm_account->id:null;      //Se importan muchos contactos sin vinculación con cuenta ni empresa.
            $cc->contact_type = $contact_type;
            $cc->position = $r->position;
            $cc->department = $r->department;
            $cc->cost_center = $r->cost_center;
            $cc->last_year_service = $r->last_year_service;
            $cc->owner_id = $ownerId;
            //$cc->is_main = null;
            $cc->status = 1;
            $cc->observations = $r->description;
            $cc->created_at = $user->created_at;
            $cc->save();
        }
    }
}
