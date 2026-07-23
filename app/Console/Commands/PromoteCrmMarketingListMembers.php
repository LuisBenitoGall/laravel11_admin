<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

// Concerns:
use App\Concerns\HasSalutation;

// Models:
use App\Models\Account;
use App\Models\Category;
use App\Models\Company;
use App\Models\CompanyAccount;
use App\Models\CrmAccount;
use App\Models\CrmContact;
use App\Models\CrmContactMessage;
use App\Models\CrmMarketingListMemberTmp;
use App\Models\MarketingListUser;
use App\Models\Phone;
use App\Models\User;
use App\Models\UserAddress;
use App\Models\UserCompany;
use App\Models\Workplace;

class PromoteCrmMarketingListMembers extends Command
{
    /**
     * Command:
     *  php artisan crm:promote-marketing-list-members
     *  php artisan crm:promote-marketing-list-members --dry-run
     *  php artisan crm:promote-marketing-list-members --only-list=3
     *  php artisan crm:promote-marketing-list-members --only-email=foo@bar.com
     */
    protected $signature = 'crm:promote-marketing-list-members
                            {--company=1 : ID de la empresa del ERP (tenant) a la que se asignan los datos}
                            {--chunk=500 : Tamaño de lote para procesar registros}
                            {--only-list= : Procesar sólo miembros de una lista concreta (marketing_list_id)}
                            {--only-email= : Procesar sólo registros para un email concreto}
                            {--dry-run : Simula la promoción sin guardar cambios}';

    protected $description = 'Promociona miembros desde crm_marketing_list_members_tmp a users / crm_contacts / marketing_list_users y tablas asociadas';

    public function handle()
    {
        $tenantCompanyId = (int) ($this->option('company') ?: 1);
        $chunkSize       = (int) ($this->option('chunk') ?: 500);
        $onlyListId      = $this->option('only-list');
        $onlyEmail       = $this->option('only-email');
        $dryRun          = (bool) $this->option('dry-run');

        $this->info("Promocionando miembros de listas de marketing (crm_marketing_list_members_tmp) para company_id={$tenantCompanyId}"
            . ($dryRun ? ' [DRY RUN]' : ''));

        // Query base: sólo registros pendientes
        $baseQuery = CrmMarketingListMemberTmp::query()
            ->where('is_done', false);

        if ($onlyListId) {
            $baseQuery->where('marketing_list_id', (int) $onlyListId);
        }

        if ($onlyEmail) {
            $baseQuery->where('email', $onlyEmail);
        }

        $total = (clone $baseQuery)->count();

        if ($total === 0) {
            $this->warn('No hay registros pendientes (is_done = 0) que coincidan con el filtro.');
            return self::SUCCESS;
        }

        $this->info("Total registros a procesar: {$total}");

        // Cachés en memoria:
        $userCache     = [];   // email => User
        $companyCache  = [];   // slug => Company
        $contactCache  = [];   // user_id => CrmContact
        $listCache     = [];   // marketing_list_id => exists / missing

        // Contadores:
        $processed         = 0;
        $createdUsers      = 0;
        $updatedUsers      = 0;
        $createdContacts   = 0;
        $updatedContacts   = 0;
        $attachedToCompany = 0;
        $phonesCreated     = 0;
        $membersLinked     = 0;
        $errors            = 0;

        $baseQuery->orderBy('id')
            ->chunkById($chunkSize, function ($rows) use (
                $tenantCompanyId,
                $dryRun,
                &$userCache,
                &$companyCache,
                &$contactCache,
                &$listCache,
                &$processed,
                &$createdUsers,
                &$updatedUsers,
                &$createdContacts,
                &$updatedContacts,
                &$attachedToCompany,
                &$phonesCreated,
                &$membersLinked,
                &$errors
            ) {
                $closure = function () use (
                    $rows,
                    $tenantCompanyId,
                    $dryRun,
                    &$userCache,
                    &$companyCache,
                    &$contactCache,
                    &$listCache,
                    &$processed,
                    &$createdUsers,
                    &$updatedUsers,
                    &$createdContacts,
                    &$updatedContacts,
                    &$attachedToCompany,
                    &$phonesCreated,
                    &$membersLinked,
                    &$errors
                ) {
                    foreach ($rows as $tmp) {
                        try {
                            $result = $this->processSingleMember(
                                $tmp,
                                $tenantCompanyId,
                                $dryRun,
                                $userCache,
                                $companyCache,
                                $contactCache,
                                $listCache
                            );

                            $createdUsers      += $result['created_users']       ?? 0;
                            $updatedUsers      += $result['updated_users']       ?? 0;
                            $createdContacts   += $result['created_contacts']    ?? 0;
                            $updatedContacts   += $result['updated_contacts']    ?? 0;
                            $attachedToCompany += $result['attached_companies']  ?? 0;
                            $phonesCreated     += $result['phones_created']      ?? 0;
                            $membersLinked     += $result['members_linked']      ?? 0;

                            $processed++;

                            if ($processed % 500 === 0) {
                                $this->info("Procesados {$processed} miembros...");
                            }

                        } catch (\Throwable $e) {
                            $errors++;
                            $this->error("Error procesando tmp_id={$tmp->id}: {$e->getMessage()}");
                        }
                    }
                };

                if ($dryRun) {
                    $this->comment('DRY RUN: simulando chunk de ' . count($rows) . ' registros...');
                    $closure(); // ejecutamos lógica pero sin saves reales
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
        $this->info("Usuarios vinculados a empresa: {$attachedToCompany}");
        $this->info("Teléfonos creados:           {$phonesCreated}");
        $this->info("Miembros vinculados a listas: {$membersLinked}");
        $this->info("Errores:                      {$errors}");

        return self::SUCCESS;
    }

    /**
     * Procesa un único registro de crm_marketing_list_members_tmp.
     */
    protected function processSingleMember(
        CrmMarketingListMemberTmp $tmp,
        int $tenantCompanyId,
        bool $dryRun,
        array &$userCache,
        array &$companyCache,
        array &$contactCache,
        array &$listCache
    ): array {
        $createdUsers      = 0;
        $updatedUsers      = 0;
        $createdContacts   = 0;
        $updatedContacts   = 0;
        $attachedCompanies = 0;
        $phonesCreated     = 0;
        $membersLinked     = 0;

        // 0) Owner
        $ownerId = $this->resolveOwnerIdFromTmp($tmp, $dryRun);

        // 1) Usuario
        [$user, $userCreated, $userUpdated] = $this->resolveUserForMember(
            $tmp,
            $dryRun,
            $userCache
        );

        if ($userCreated) {
            $createdUsers++;
        }
        if ($userUpdated) {
            $updatedUsers++;
        }

        if (! $user || ! $user->id) {
            // Sin usuario no seguimos, pero tampoco reventamos.
            return [
                'created_users'      => $createdUsers,
                'updated_users'      => $updatedUsers,
                'created_contacts'   => $createdContacts,
                'updated_contacts'   => $updatedContacts,
                'attached_companies' => $attachedCompanies,
                'phones_created'     => $phonesCreated,
                'members_linked'     => $membersLinked,
            ];
        }

        // 2) Empresa + CRM account + UserCompany
        [$company, $crmAccount, $attached] = $this->resolveCompanyForMember(
            $tmp,
            $tenantCompanyId,
            $dryRun,
            $companyCache,
            $user,
            $ownerId
        );

        if ($attached) {
            $attachedCompanies++;
        }

        // 3) Contacto CRM
        [$contact, $contactCreated, $contactUpdated] = $this->resolveContactForMember(
            $tmp,
            $tenantCompanyId,
            $dryRun,
            $contactCache,
            $user,
            $company,
            $crmAccount,
            $ownerId
        );

        if ($contactCreated) {
            $createdContacts++;
        }
        if ($contactUpdated) {
            $updatedContacts++;
        }

        // 4) Mensajes del contacto (description)
        $this->syncContactMessagesForMember($tmp, $dryRun, $contact);

        // 5) Subtipo de contacto → Category + pivot categorizables
        $this->attachContactSubtypeCategory($tmp, $tenantCompanyId, $dryRun, $user);

        // 6) Teléfonos
        $phonesCreated += $this->syncPhonesForMember($tmp, $dryRun, $user);

        // 7) Vincular a lista de marketing
        $membersLinked += $this->attachUserToMarketingList($tmp, $dryRun, $listCache, $user);

        // 8) Marcar como procesado
        if (! $dryRun) {
            $this->markTmpRowDone($tmp);
        }

        return [
            'created_users'      => $createdUsers,
            'updated_users'      => $updatedUsers,
            'created_contacts'   => $createdContacts,
            'updated_contacts'   => $updatedContacts,
            'attached_companies' => $attachedCompanies,
            'phones_created'     => $phonesCreated,
            'members_linked'     => $membersLinked,
        ];
    }

    /**
     * Resuelve el owner (usuario interno) a partir de tmp->owner.
     */
    protected function resolveOwnerIdFromTmp(CrmMarketingListMemberTmp $tmp, bool $dryRun): int
    {
        $ownerName = trim((string) $tmp->owner);

        if ($ownerName === '') {
            return 1; // fallback: superadmin / system
        }

        $user = User::whereRaw("TRIM(CONCAT(name, ' ', surname)) = ?", [$ownerName])->first();

        if (! $user && ! $dryRun) {
            $user = new User();
            $user->name    = $ownerName;
            $user->surname = null;
            $user->isAdmin = 1;
            $user->status  = 1;
            $user->email   = null;
            $user->save();
        }

        return $user?->id ?: 1;
    }

    /**
     * Localiza o crea el usuario asociado al miembro de lista.
     *
     * @return array [User|null $user, bool $created, bool $updated]
     */
    protected function resolveUserForMember(
        CrmMarketingListMemberTmp $tmp,
        bool $dryRun,
        array &$userCache
    ): array {
        $email = trim((string) $tmp->email);

        if ($email === '') {
            // Sin email es un drama controlable: no creamos usuario.
            return [null, false, false];
        }

        $cacheKey = mb_strtolower($email);
        if (isset($userCache[$cacheKey])) {
            return [$userCache[$cacheKey], false, false];
        }

        $created = false;
        $updated = false;

        $user = User::where('email', $email)->first();

        // Nombre & apellidos
        $firstName = $tmp->name ? trim($tmp->name) : $this->deriveNameFromEmail($email);
        $surname   = $tmp->surname ? trim($tmp->surname) : null;

        // Sex / salutation
        $sex = null;
        if ($tmp->sex === 'Hombre') {
            $sex = 'h';
        } elseif ($tmp->sex === 'Mujer') {
            $sex = 'm';
        }

        $salutationKey = $this->mapSalutationFromTmp($tmp->salutation);

        if ($user) {
            $origName       = $user->name;
            $origSurname    = $user->surname;
            $origSalutation = $user->salutation;

            if (! $user->name && $firstName) {
                $user->name = ucwords(mb_strtolower($firstName, 'UTF-8'));
            }
            if (! $user->surname && $surname) {
                $user->surname = ucwords(mb_strtolower($surname, 'UTF-8'));
            }
            if (! $user->sex && $sex) {
                $user->sex = $sex;
            }
            if (! $user->salutation && $salutationKey) {
                $user->salutation = $salutationKey;
            }
            if (! $user->nif && $tmp->nif) {
                $user->nif = $tmp->nif;
            }

            if (
                $user->name       !== $origName ||
                $user->surname    !== $origSurname ||
                $user->salutation !== $origSalutation
            ) {
                $updated = true;
                if (! $dryRun) {
                    $user->save();
                }
            }
        } else {
            // Crear
            $randomPassword = Str::random(8);

            $user = new User();
            $user->name       = ucwords(mb_strtolower($firstName, 'UTF-8'));
            $user->surname    = $surname ? ucwords(mb_strtolower($surname, 'UTF-8')) : null;
            $user->email      = $email;
            $user->sex        = $sex;
            $user->salutation = $salutationKey;
            $user->nif        = $tmp->nif ?: null;
            $user->password   = bcrypt($randomPassword);
            $user->isAdmin    = false;
            $user->status     = 1;

            $createdAt = $this->parseDateTimeFromTmp($tmp->created_date) ?: Carbon::now();
            $user->created_at = $createdAt;

            if (! $dryRun) {
                $user->save();
                $user->assignRole(config('constants.ROLE_INVITADO_NAME_'));
            }

            // Direcciones básicas (street1/2/3)
            if (! $dryRun) {
                foreach (['street1', 'street2', 'street3'] as $streetField) {
                    $street = trim((string) $tmp->{$streetField});
                    if ($street !== '') {
                        $ua = new UserAddress();
                        $ua->user_id = $user->id;
                        $ua->address = $street;
                        $ua->cp      = $tmp->cp ?: null;
                        $ua->save();
                    }
                }
            }

            $created = true;
        }

        $userCache[$cacheKey] = $user;

        return [$user, $created, $updated];
    }

    /**
     * Localiza o crea la empresa y su CRM account, vincula UserCompany.
     *
     * @return array [Company|null $company, CrmAccount|null $crmAccount, bool $attached]
     */
    protected function resolveCompanyForMember(
        CrmMarketingListMemberTmp $tmp,
        int $tenantCompanyId,
        bool $dryRun,
        array &$companyCache,
        ?User $user = null,
        ?int $ownerId = null
    ): array {
        $companyName = trim((string) $tmp->company);

        if ($companyName === '') {
            return [null, null, false];
        }

        $slug = Str::slug($companyName);
        $cacheKey = 'slug:' . $slug;

        /** @var Company|null $company */
        $company = $companyCache[$cacheKey] ?? null;

        if (! $company) {
            $company = Company::where('slug', $slug)->first();

            if (! $company && ! $dryRun) {
                $company = new Company();
                $company->name       = $companyName;
                $company->slug       = $slug;
                $company->nif        = null;
                $company->status     = 1;
                $company->created_by = $ownerId ?: 1;
                $company->updated_by = $ownerId ?: 1;
                $company->save();

                // Plan de cuenta por defecto
                $accountPlan = Account::select('id', 'rate')
                    ->where('slug', 'free')
                    ->where('status', 1)
                    ->first();

                if ($accountPlan) {
                    CompanyAccount::create([
                        'company_id' => $company->id,
                        'guardian'   => null,
                        'account_id' => $accountPlan->id,
                        'start_date' => Carbon::now(),
                        'end_date'   => config('constants.UNDEFINED_DATE_'),
                        'price'      => $accountPlan->rate,
                        'status'     => 1,
                    ]);
                }

                // Sede por defecto
                $wp = new Workplace();
                $wp->company_id = $company->id;
                $wp->name       = ucfirst(trans('textos.sede')) . ' ' . $company->name;
                $wp->slug       = Str::slug(trans('textos.sede') . '-' . $company->id);
                $wp->featured   = 1;
                $wp->save();
            }

            $companyCache[$cacheKey] = $company;
        }

        $crmAccount = null;
        $attached   = false;

        if ($company && ! $dryRun) {
            // Teléfono de empresa
            $companyPhone = $this->normalizePhone($tmp->company_phone);
            if ($companyPhone) {
                $existsCompanyPhone = Phone::where('phoneable_type', Company::class)
                    ->where('phoneable_id', $company->id)
                    ->where('e164', $companyPhone)
                    ->exists();

                if (! $existsCompanyPhone) {
                    $phc = new Phone();
                    $phc->phoneable_type = Company::class;
                    $phc->phoneable_id   = $company->id;
                    $phc->e164           = $companyPhone;
                    $phc->type           = 'mobile';
                    $phc->save();
                }
            }

            // CRM account de esa empresa dentro del tenant
            $crmAccount = CrmAccount::where('company_id', $tenantCompanyId)
                ->where('linked_company_id', $company->id)
                ->first();

            if (! $crmAccount) {
                $crmAccount = new CrmAccount();
                $crmAccount->company_id        = $tenantCompanyId;
                $crmAccount->linked_company_id = $company->id;
                $crmAccount->name              = $company->name;
                $crmAccount->normalized_name   = $company->slug;
                $crmAccount->owner_id          = $ownerId ?: 1;
                $crmAccount->main_phone        = $companyPhone;
                $crmAccount->status            = 1;
                $crmAccount->created_by        = $ownerId ?: 1;
                $crmAccount->updated_by        = $ownerId ?: 1;
                $crmAccount->save();
            }

            // Vincular UserCompany
            // Se crea o actualiza en cada ejecución para que no quede desincronizado
            // respecto al cargo/departamento reflejado en crm_contacts.
            if ($user && $user->id) {
                $exists = UserCompany::where('user_id', $user->id)
                    ->where('company_id', $company->id)
                    ->exists();

                $uc = UserCompany::firstOrNew([
                    'user_id'    => $user->id,
                    'company_id' => $company->id,
                ]);
                $uc->position   = $tmp->position ?: null;
                $uc->department = $tmp->department ?: null;
                $uc->save();

                if (! $exists) {
                    $attached = true;
                }
            }
        }

        return [$company, $crmAccount, $attached];
    }

    /**
     * Crea o actualiza el CrmContact asociado.
     *
     * @return array [CrmContact|null $contact, bool $created, bool $updated]
     */
    protected function resolveContactForMember(
        CrmMarketingListMemberTmp $tmp,
        int $tenantCompanyId,
        bool $dryRun,
        array &$contactCache,
        ?User $user = null,
        ?Company $company = null,
        ?CrmAccount $crmAccount = null,
        ?int $ownerId = null
    ): array {
        if (! $user || ! $user->id) {
            return [null, false, false];
        }

        $cacheKey = 'user:' . $user->id;
        if (isset($contactCache[$cacheKey])) {
            return [$contactCache[$cacheKey], false, false];
        }

        $contact = CrmContact::where('company_id', $tenantCompanyId)
            ->where('user_id', $user->id)
            ->first();

        $created = false;
        $updated = false;

        $mappedContactType = $this->mapContactTypeFromTmp($tmp->contact_type);

        if ($contact) {
            $origPosition    = $contact->position;
            $origDepartment  = $contact->department;
            $origCostCenter  = $contact->cost_center;
            $origContactType = $contact->contact_type;

            if ($tmp->position) {
                $contact->position = $tmp->position;
            }
            if ($tmp->department) {
                $contact->department = $tmp->department;
            }
            if ($tmp->cost_center) {
                $contact->cost_center = $tmp->cost_center;
            }
            if (! $contact->contact_type && $mappedContactType) {
                $contact->contact_type = $mappedContactType;
            }

            if (
                $contact->position     !== $origPosition ||
                $contact->department   !== $origDepartment ||
                $contact->cost_center  !== $origCostCenter ||
                $contact->contact_type !== $origContactType
            ) {
                $updated = true;
                if (! $dryRun) {
                    $contact->save();
                }
            }
        } else {
            $contact = new CrmContact();
            $contact->company_id     = $tenantCompanyId;
            $contact->user_id        = $user->id;
            $contact->crm_account_id = $crmAccount?->id; // puede ser null
            $contact->contact_type   = $mappedContactType ?: 'clp';
            $contact->position       = $tmp->position ?: null;
            $contact->department     = $tmp->department ?: null;
            $contact->cost_center    = $tmp->cost_center ?: null;
            $contact->owner_id       = $ownerId ?: 1;
            $contact->status         = 1;
            $contact->created_at     = $user->created_at ?: Carbon::now();

            if (! $dryRun) {
                $contact->save();
            }

            $created = true;
        }

        $contactCache[$cacheKey] = $contact;

        return [$contact, $created, $updated];
    }

    /**
     * Mensajes (description) → CrmContactMessage.
     */
    protected function syncContactMessagesForMember(
        CrmMarketingListMemberTmp $tmp,
        bool $dryRun,
        ?CrmContact $contact = null
    ): void {
        $description = trim((string) $tmp->description);

        if (! $contact || ! $contact->id) {
            return;
        }

        if ($description === '') {
            return;
        }

        // Si quisieras evitar duplicados exactos, aquí podrías comprobar.
        if (! $dryRun) {
            $msg = new CrmContactMessage();
            $msg->crm_contact_id = $contact->id;
            $msg->title          = null;
            $msg->message        = $description;
            $msg->origin         = 'otrc';
            $msg->status         = 1;
            $msg->save();
        }
    }

    /**
     * Subtipo de contacto → Category + pivot categorizables.
     */
    protected function attachContactSubtypeCategory(
        CrmMarketingListMemberTmp $tmp,
        int $tenantCompanyId,
        bool $dryRun,
        ?User $user = null
    ): void {
        if (! $user || ! $user->id) {
            return;
        }

        $rawSubtype = trim((string) $tmp->contact_subtype);
        if ($rawSubtype === '') {
            return;
        }

        if ($dryRun) {
            // No creamos categorías ni pivot en dry-run.
            return;
        }

        $slug = Str::slug(mb_strtolower($rawSubtype, 'UTF-8'));

        static $subtypeCache = []; // [company_id.slug => Category]
        $cacheKey = $tenantCompanyId . '.' . $slug;

        if (isset($subtypeCache[$cacheKey])) {
            $category = $subtypeCache[$cacheKey];
        } else {
            $category = Category::where('company_id', $tenantCompanyId)
                ->where('slug', $slug)
                ->where('module', 'users')
                ->where('depth', 0)
                ->first();

            if (! $category) {
                $category = new Category();
                $category->company_id = $tenantCompanyId;
                $category->module     = 'users';
                $category->depth      = 0;
                $category->name       = $rawSubtype;
                $category->slug       = $slug;

                // *** IMPORTANTE: path no puede ser null ***
                // Para categorías de raíz, que path sea el propio slug está bien.
                $category->path       = $slug;

                $category->status     = 1;
                $category->save();
            }

            $subtypeCache[$cacheKey] = $category;
        }

        DB::table('categorizables')->updateOrInsert(
            [
                'company_id'         => $tenantCompanyId,
                'category_id'        => $category->id,
                'categorizable_type' => User::class,
                'categorizable_id'   => $user->id,
            ],
            []
        );
    }

    /**
     * Crea teléfonos a partir de mobile / private_phone1.
     *
     * @return int número de teléfonos creados
     */
    protected function syncPhonesForMember(
        CrmMarketingListMemberTmp $tmp,
        bool $dryRun,
        ?User $user = null
    ): int {
        $created = 0;

        if (! $user || ! $user->id) {
            return 0;
        }

        foreach (['mobile', 'private_phone1'] as $field) {
            $normalized = $this->normalizePhone($tmp->{$field});
            if (! $normalized) {
                continue;
            }

            $alreadyExists = Phone::where('phoneable_type', User::class)
                ->where('phoneable_id', $user->id)
                ->where('e164', $normalized)
                ->exists();

            if ($alreadyExists) {
                continue;
            }

            if (! $dryRun) {
                $ph = new Phone();
                $ph->phoneable_type = User::class;
                $ph->phoneable_id   = $user->id;
                $ph->e164           = $normalized;
                $ph->type           = 'mobile';
                $ph->save();
            }

            $created++;
        }

        return $created;
    }

    /**
     * Vincula el usuario a la lista de marketing (tabla pivot marketing_list_users).
     *
     * @return int 0|1 si se ha creado el vínculo
     */
    protected function attachUserToMarketingList(
        CrmMarketingListMemberTmp $tmp,
        bool $dryRun,
        array &$listCache,
        ?User $user = null
    ): int {
        if (! $user || ! $user->id) {
            return 0;
        }

        $listId = (int) $tmp->marketing_list_id;
        if (! $listId) {
            return 0;
        }

        if (isset($listCache['missing:' . $listId])) {
            return 0;
        }

        if (! isset($listCache['exists:' . $listId])) {
            $existsList = DB::table('marketing_lists')->where('id', $listId)->exists();
            if (! $existsList) {
                $listCache['missing:' . $listId] = true;
                return 0;
            }
            $listCache['exists:' . $listId] = true;
        }

        $existsPivot = MarketingListUser::where('marketing_list_id', $listId)
            ->where('user_id', $user->id)
            ->exists();

        if ($existsPivot) {
            return 0;
        }

        if (! $dryRun) {
            $mlu = new MarketingListUser();
            $mlu->marketing_list_id = $listId;
            $mlu->user_id           = $user->id;
            $mlu->status            = 1;
            $mlu->observations      = null;
            $mlu->save();
        }

        return 1;
    }

    /**
     * Marca la fila temporal como procesada.
     */
    protected function markTmpRowDone(
        CrmMarketingListMemberTmp $tmp
    ): void {
        $tmp->is_done = 1;
        $tmp->save();
    }

    /**
     * Normaliza un teléfono.
     */
    protected function normalizePhone(?string $raw): ?string
    {
        $raw = trim((string) $raw);
        if ($raw === '') {
            return null;
        }

        $hasPlus = str_starts_with($raw, '+');
        $digits  = preg_replace('/\D+/', '', $raw);

        if ($digits === '') {
            return null;
        }

        $phone = ($hasPlus ? '+' : '') . $digits;

        if (strlen($phone) < 6 || strlen($phone) > 30) {
            return null;
        }

        return $phone;
    }

    /**
     * Parse genérico de fecha/hora desde la columna tmp.
     */
    protected function parseDateTimeFromTmp($value): ?Carbon
    {
        if (! $value) {
            return null;
        }

        if ($value instanceof Carbon) {
            return $value;
        }

        if ($value instanceof \DateTimeInterface) {
            return Carbon::instance($value);
        }

        $raw = trim((string) $value);
        if ($raw === '') {
            return null;
        }

        $formats = [
            'Y-m-d H:i:s',
            'Y-m-d',
            'd/m/Y H:i',
            'd/m/Y G:i',
            'd/m/Y',
        ];

        foreach ($formats as $format) {
            try {
                $dt = Carbon::createFromFormat($format, $raw);
                if ($dt !== false) {
                    return $dt;
                }
            } catch (\Throwable $e) {
                // siguiente
            }
        }

        try {
            return Carbon::parse($raw);
        } catch (\Throwable $e) {
            return null;
        }
    }

    /**
     * Nombre de emergencia a partir del email.
     */
    protected function deriveNameFromEmail(string $email): string
    {
        $local = explode('@', $email)[0] ?? $email;
        $local = preg_replace('/[\.\_\-\+]+/', ' ', $local);
        $local = trim($local);

        if ($local === '') {
            return 'Contacto';
        }

        return $local;
    }

    /**
     * Map de salutación desde texto libre al key de HasSalutation.
     */
    protected function mapSalutationFromTmp(?string $raw): ?string
    {
        $raw = trim((string) $raw);
        if ($raw === '') {
            return null;
        }

        $salutations = HasSalutation::salutationMap();
        $needle      = Str::slug(mb_strtolower($raw, 'UTF-8'));

        foreach ($salutations as $key => $meta) {
            $labelSlug = isset($meta['label']) ? Str::slug(mb_strtolower($meta['label'], 'UTF-8')) : null;
            $abbrSlug  = isset($meta['abbr'])  ? Str::slug(mb_strtolower($meta['abbr'],  'UTF-8')) : null;

            if ($needle === $labelSlug || $needle === $abbrSlug) {
                return $key;
            }
        }

        return null;
    }

    /**
     * Map de contact_type desde texto Dynamics → código interno.
     */
    protected function mapContactTypeFromTmp(?string $raw): string
    {
        $map = [
            'ayuntamiento'                  => 'ayu',
            'banco'                         => 'bco',
            'cliente potencial'             => 'clp',
            'clientes'                      => 'cl',
            'cofradía'                      => 'cof',
            'colaboradores'                 => 'colb',
            'comunidad autónoma'            => 'ca',
            'conferencias'                  => 'conf',
            'educación'                     => 'edu',
            'empresa'                       => 'emp',
            'fuerzas armadas'               => 'ffaa',
            'fundación'                     => 'fund',
            'gabinete de comunicación'      => 'gbco',
            'iglesia'                       => 'igl',
            'institucionales'               => 'inst',
            'medios de comunicación'        => 'mdco',
            'newsletter'                    => 'newl',
            'otros contactos'               => 'otrc',
            'patronato'                     => 'patr',
            'proveedores'                   => 'pr'
        ];

        $key = mb_strtolower(trim((string) $raw), 'UTF-8');

        return $map[$key] ?? 'clp';
    }

    /**
     * Punto para lógica “en bruto” si quieres probar cosas sin chunks ni opciones.
     * NO LO TOCO, lo rellenas tú si te apetece.
     */
    protected function myLogica()
    {
        $ownerId = 1;

        $currentCompanyId = 1;

        $data = CrmMarketingListMemberTmp::all();   

        //Cuentas de empresa
        $accountPlan = Account::select('id', 'rate')
        ->where('slug', 'free')
        ->where('status', 1)
        ->first();

        //Tratamiento:
        $salutations = HasSalutation::salutationMap();

        //Tipos de contacto:
        $contact_types = [
            'banco'             => 'bco',
            'cliente potencial' => 'clp',
            'clientes'          => 'cl',
            'fuerzas armadas'   => 'ffaa'
        ];

        //Subtipos de contacto:
        $contact_subtypes = Category::where('company_id', $currentCompanyId)
            ->where('module', 'users')
            ->where('depth', '0')
            ->orderBy('name', 'ASC')
            ->get();

        foreach($data as $r){
            //Propietario:
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

            $user = false;
            $crm_account = false;

            //Verificamos si existe usuario a través del email:
            if($r->email){
                $user = User::where('email', trim($r->email))->first();
            }   

            if(!$user){
                //Creamos usuario:
                $random_password = Str::random(8);

                $sex = $r->sex == 'Hombre'? 'h':($r->sex == 'Mujer'? 'm':null);

                $salutation = null;
                if($r->salutation){
                    $rawSal     = trim((string) $r->salutation);

                    if ($rawSal !== '') {
                        $needle = Str::slug(mb_strtolower($rawSal, 'UTF-8')); // "Señora" => "senora", "Sr." => "sr"

                        foreach ($salutations as $key => $meta) {
                            $labelSlug = isset($meta['label']) ? Str::slug(mb_strtolower($meta['label'], 'UTF-8')) : null;
                            $abbrSlug  = isset($meta['abbr'])  ? Str::slug(mb_strtolower($meta['abbr'],  'UTF-8')) : null;

                            if ($needle === $labelSlug || $needle === $abbrSlug) {
                                $salutation = $key;      // esta es la que guardas en users.salutation
                                break;
                            }
                        }
                    }    
                }

                $user = new User();
                $user->name = $r->user_name;
                $user->surname = $r->surname;
                $user->email = $r->email;
                $user->sex = $sex;
                $user->salutation = $salutation;
                $user->nif = $r->nif;
                $user->password = bcrypt($random_password);
                $user->isAdmin = false;
                $user->status = 1;
                $user->created_at = $r->created_date? $r->created_date:Carbon::now();
                $user->save();

                //Guardamos rol:
                $user->assignRole(config('constants.ROLE_INVITADO_NAME_'));

                //Direcciones:
                if($r->street1){
                    $ua = new UserAddress();
                    $ua->user_id = $user->id;
                    $ua->address = $r->street1;
                    $ua->cp = $r->cp;
                    $ua->save();
                }

                if($r->street2){
                    $ua2 = new UserAddress();
                    $ua2->user_id = $user->id;
                    $ua2->address = $r->street2;
                    $ua2->cp = $r->cp;
                    $ua2->save();
                }

                if($r->street3){
                    $ua3 = new UserAddress();
                    $ua3->user_id = $user->id;
                    $ua3->address = $r->street3;
                    $ua3->cp = $r->cp;
                    $ua3->save();
                }
            }

            //Vinculación a empresa:
            if($r->company){
                $company_slug = Str::slug($$r->company);

                $company = Company::where('slug', $company_slug)->first();

                if(!$company){
                    $company = new Company();
                    $company->name       = $r->company;
                    $company->slug       = $company_slug;
                    $company->nif        = null;
                    $company->status     = 1;
                    $company->created_by = $ownerId;
                    $company->updated_by = $ownerId;
                    $company->save();  

                    // Vinculamos la Company con el plan de cuenta
                    CompanyAccount::create([
                        'company_id' => $company->id,
                        'guardian'   => null,
                        'account_id' => $accountPlan->id,
                        'start_date' => Carbon::now(),
                        'end_date'   => config('constants.UNDEFINED_DATE_'),
                        'price'      => $accountPlan->rate,
                        'status'     => 1,
                    ]);

                    // Sede por defecto
                    $wp = new Workplace();
                    $wp->company_id = $company->id;
                    $wp->name       = ucfirst(trans('textos.sede')) . ' ' . $company->name;
                    $wp->slug       = Str::slug(trans('textos.sede') . '-' . $company->id);
                    $wp->featured   = 1;
                    $wp->save();  
                }

                $crm_account = false;
                if($company){
                    $crm_account = CrmAccount::select('crm_accounts.id', 'crm_accounts.linked_company_id')
                    ->where('crm_accounts.normalized_name', $company->slug)
                    ->first();
                }

                if($crm_account && $crm_account->linked_company_id){
                    $uc = new UserCompany();
                    $uc->user_id = $user->id;
                    $uc->company_id = $crm_account->linked_company_id;
                    $uc->position = $r->position;
                    $uc->department = $r->department;
                    $uc->save();    
                }

                //Teléfonos de la empresa:
                if($r->company_phone){
                    $phc = new Phone();
                    $phc->phoneable_type = 'App\Models\Company';
                    $phc->phoneable_id = $company->id;
                    $phc->e164 = preg_replace('/\\s+/', '', $r->company_phone);  
                    $phc->type = 'mobile';  
                    $phc->save();    
                }

                //Comprobamos si la empresa está entre contactos:
                $crm_account = CrmAccount::where('company_id', $currentCompanyId)
                ->where('linked_company_id', $company->id)
                ->first();

                if(!$crm_account){
                    $crm_account = new CrmAccount();
                    $crm_account->company_id = $currentCompanyId;
                    $crm_account->linked_company_id = $company->id;
                    $crm_account->name = $company->name;
                    $crm_account->normalized_name = $company->slug;
                    $crm_account->owner_id = $ownerId;
                    $crm_account->main_phone = $r->company_phone;
                    $crm_account->status = 1;
                    $crm_account->created_by = $ownerId;
                    $crm_account->updated_by = $ownerId;
                    $crm_account->save();
                }
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
            if($r->private_phone1){
                $ph1 = new Phone();
                $ph1->phoneable_type = 'App\Models\User';
                $ph1->phoneable_id = $user->id;
                $ph1->e164 = preg_replace('/\\s+/', '', $r->private_phone1);  
                $ph1->type = 'mobile';  
                $ph1->save();    
            }

            //Verificamos si existe como crm_contact:
            $crm_contact = CrmContact::where('company_id', $currentCompanyId)
            ->where('user_id', $user->id)
            ->first();

            if($crm_contact){
                if($r->position){
                    $crm_contact->position = $r->position;
                }

                if($r->department){
                    $crm_contact->department = $r->department;
                }

                if($r->cost_center){
                    $crm_contact->cost_center = $r->cost_center; 
                }

                $crm_contact->save();   

            }else{
                //Tipo de contacto:
                $contact_type = 'clp';
                if($r->contact_type){
                    $key = mb_strtolower(trim($r->contact_type), 'UTF-8'); // "Cliente Potencial" -> "cliente potencial"

                    if (isset($contact_types[$key])) {
                        $contact_type = $contact_types[$key];
                    }
                }

                $crm_contact = new CrmContact();
                $crm_contact->company_id =  $currentCompanyId;
                $crm_contact->user_id = $user->id;
                $crm_contact->crm_account_id = $crm_account? $crm_account->id:null;      //Se importan muchos contactos sin vinculación con cuenta ni empresa.
                $crm_contact->contact_type = $contact_type;
                $crm_contact->position = $r->position;
                $crm_contact->department = $r->department;
                $crm_contact->cost_center = $r->cost_center;
                $crm_contact->owner_id = $ownerId;
                //$crm_contact->is_main = null;
                $crm_contact->status = 1;
                $crm_contact->created_at = $user->created_at;
                $crm_contact->save();
            }

            //Mensajes del contacto:
            if($r->description && $r->description != ''){
                $msg = new CrmContactMessage();
                $msg->crm_contact_id = $crm_contact->id;
                $msg->title = null;
                $msg->message = $r->description;
                $msg->origin = 'otrc';
                $msg->status = 1;
                $msg->save();
            }

            //Vinculación a listado:
            if($r->marketing_list_id){
                $mlu = new MarketingListUser();
                $mlu->marketing_list_id = $r->marketing_list_id;
                $mlu->user_id = $user->id;
                $mlu->status = 1;
                $mlu->save();
            }

            //Categoría (subtipo de contacto) del usuario:
            if($r->contact_subtype && $user){
                // Normalizamos el texto
                $rawSubtype = trim($r->contact_subtype);
                $slug = Str::slug(mb_strtolower($rawSubtype, 'UTF-8'));

                // Cache opcional en memoria para no machacar la BD
                static $subtypeCache = []; // [company_id.slug => Category]

                $cacheKey = $currentCompanyId . '.' . $slug;

                if (isset($subtypeCache[$cacheKey])) {
                    $category = $subtypeCache[$cacheKey];
                } else {           
                    $category = Category::where('company_id', $currentCompanyId)
                        ->where('slug', $slug)
                        ->where('module', 'users')
                        ->where('depth', 0)
                        ->first();

                    if (! $category) {
                        $category = new Category();
                        $category->company_id = $currentCompanyId;
                        $category->module     = 'users';
                        $category->depth      = 0;
                        $category->name       = $rawSubtype;      // nombre tal cual viene
                        $category->slug       = $slug;
                        $category->status     = 1;                // o lo que uses por defecto
                        $category->save();
                    }

                    $subtypeCache[$cacheKey] = $category;
                }

                // Pivot en categorizables, evitando duplicados
                DB::table('categorizables')->updateOrInsert(
                    [
                        'company_id'         => $currentCompanyId,
                        'category_id'        => $category->id,
                        'categorizable_type' => \App\Models\User::class,
                        'categorizable_id'   => $user->id,
                    ],
                    [] // sin campos extra
                );
            }

            //Damos por pasado el registro:
            $r->is_done = 1;
            $r->save();
        }
    }    
}
