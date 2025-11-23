<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

// Models:
use App\Models\Account;
use App\Models\CompanyAccount;
use App\Models\CrmAccountTmp;
use App\Models\CrmAccount;
use App\Models\Company;
use App\Models\Currency;
use App\Models\User;
use App\Models\Workplace;

class PromoteCrmAccounts extends Command
{
    /**
     * Command: php artisan crm:promote-accounts
     */
    protected $signature = 'crm:promote-accounts
                            {--company=1 : ID de la empresa del ERP (tenant) a la que se asignan las cuentas}
                            {--chunk=500 : Tamaño de lote para procesar registros}
                            {--only-external-id= : Procesar sólo una cuenta concreta por external_id}
                            {--dry-run : Simula la importación sin guardar cambios}';

    protected $description = 'Promociona cuentas desde crm_accounts_tmp a crm_accounts y tablas asociadas';

    public function handle()
    {
        $tenantCompanyId   = (int) ($this->option('company') ?: 1);
        $chunkSize         = (int) ($this->option('chunk') ?: 500);
        $onlyExternalId    = $this->option('only-external-id');
        $dryRun            = (bool) $this->option('dry-run');

        $this->info("Promocionando cuentas desde crm_accounts_tmp para company_id={$tenantCompanyId}"
            . ($dryRun ? ' [DRY RUN]' : ''));

        // Plan de cuenta de empresa
        $accountPlan = Account::select('id', 'rate')
            ->where('slug', 'free')
            ->where('status', 1)
            ->first();

        if (! $accountPlan) {
            $this->error('No se ha encontrado la cuenta de empresa con slug "free" y status=1.');
            return Command::FAILURE;
        }

        // Moneda EUR
        $currency = Currency::select('id')->where('code', 'EUR')->first();
        if (! $currency) {
            $this->error('No se ha encontrado la moneda EUR.');
            return Command::FAILURE;
        }
        $eurCurrencyId = $currency->id;

        // Tabla de países
        $countryCodes = [
            'Alemania' => 'DE',
            'Arabia Saudí' => 'SA',
            'Argentina' => 'AR',
            'Austria' => 'AT',
            'Bélgica' => 'BE',
            'Bolivia' => 'BO',
            'CHILE' => 'CL',
            'Colombia' => 'CO',
            'Costa Rica' => 'CR',
            'España' => 'ES',
            'Español' => 'ES',
            'Málaga' => 'ES',
            'Estado Unidos' => 'US',
            'Estados Unidos' => 'US',
            'France' => 'FR',
            'Francia' => 'FR',
            'Irlanda' => 'IE',
            'Italia' => 'IT',
            'Líbano' => 'LB',
            'México' => 'MX',
            'Países Bajos' => 'NL',
            'Panamá' => 'PA',
            'Portugal' => 'PT',
            'Puerto Rico' => 'PR',
            'Reino Unido' => 'GB',
            'Republica Dominicana' => 'DO',
            'República Dominicana' => 'DO',
            'Suiza' => 'CH',
            'Uruguay' => 'UY',
        ];

        // Query base sobre la tabla temporal
        $baseQuery = CrmAccountTmp::query();

        if ($onlyExternalId) {
            $baseQuery->where('external_id', $onlyExternalId);
        }

        $total = (clone $baseQuery)->count();
        if ($total === 0) {
            $this->warn('No hay registros en crm_accounts_tmp que coincidan con el filtro.');
            return Command::SUCCESS;
        }

        $this->info("Total registros a procesar: {$total}");

        // Caches en memoria para no repetir queries absurdas
        $ownerCache    = []; // 'Nombre Apellidos' => user_id
        $companyCache  = []; // nif => Company
        $processed     = 0;
        $createdCompanies = 0;
        $reusedCompanies  = 0;
        $createdAccounts  = 0;
        $updatedAccounts  = 0;
        $errors        = 0;

        // Procesamos en chunks para no petarnos la RAM
        $baseQuery->orderBy('id')
            ->chunkById($chunkSize, function ($rows) use (
                $tenantCompanyId,
                $dryRun,
                $eurCurrencyId,
                $countryCodes,
                $accountPlan,
                &$ownerCache,
                &$companyCache,
                &$processed,
                &$createdCompanies,
                &$reusedCompanies,
                &$createdAccounts,
                &$updatedAccounts,
                &$errors
            ) {
                $closure = function () use (
                    $rows,
                    $tenantCompanyId,
                    $eurCurrencyId,
                    $countryCodes,
                    $accountPlan,
                    &$ownerCache,
                    &$companyCache,
                    &$processed,
                    &$createdCompanies,
                    &$reusedCompanies,
                    &$createdAccounts,
                    &$updatedAccounts,
                    &$errors
                ) {
                    foreach ($rows as $tmp) {
                        try {
                            $ownerId = $this->resolveOwnerId($tmp, $ownerCache);
                            [$company, $created] = $this->resolveCompany($tmp, $ownerId, $accountPlan, $companyCache);
                            if ($created) {
                                $createdCompanies++;
                            } elseif ($company) {
                                $reusedCompanies++;
                            }

                            [$crmAccount, $justCreated] = $this->syncCrmAccount(
                                $tmp,
                                $tenantCompanyId,
                                $company,
                                $ownerId,
                                $eurCurrencyId,
                                $countryCodes
                            );

                            if ($justCreated) {
                                $createdAccounts++;
                            } else {
                                $updatedAccounts++;
                            }

                            // Guardamos referencia de crm_account_id en la tabla tmp
                            $tmp->crm_account_id = $crmAccount->id;
                            $tmp->save();

                            $processed++;

                            if ($processed % 500 === 0) {
                                $this->info("Procesadas {$processed} cuentas...");
                            }

                        } catch (\Throwable $e) {
                            $errors++;
                            $this->error("Error procesando tmp_id={$tmp->id}: {$e->getMessage()}");
                        }
                    }
                };

                if ($dryRun) {
                    // En dry run no persistimos nada
                    $this->comment('DRY RUN: simulando chunk de ' . count($rows) . ' registros (sin transacción).');
                    // Ejecutamos el closure pero NO guardamos nada realmente,
                    // así que aquí podrías comentar las llamadas a save() si quieres ser más estricto.
                } else {
                    DB::transaction($closure);
                }
            });

        $this->info("Proceso terminado.");
        $this->info("Registros procesados: {$processed}");
        $this->info("Empresas creadas:    {$createdCompanies}");
        $this->info("Empresas reutilizadas: {$reusedCompanies}");
        $this->info("Cuentas CRM creadas: {$createdAccounts}");
        $this->info("Cuentas CRM actualizadas: {$updatedAccounts}");
        $this->info("Errores: {$errors}");

        return Command::SUCCESS;
    }

    /**
     * Devuelve el ID del owner a partir del campo owner de la tabla temporal.
     * Usa caché en memoria para no repetir queries.
     */
    protected function resolveOwnerId(CrmAccountTmp $tmp, array &$ownerCache): int
    {
        $ownerName = trim((string) $tmp->owner);

        if ($ownerName === '') {
            // fallback: usuario 1 como propietario por defecto
            return 1;
        }

        if (isset($ownerCache[$ownerName])) {
            return $ownerCache[$ownerName];
        }

        // Intentamos buscar por "name surname"
        $owner = User::whereRaw("TRIM(CONCAT(name, ' ', surname)) = ?", [$ownerName])->first();

        if (! $owner) {
            $owner = new User();
            $owner->name    = $ownerName; // si quieres split, aquí lo harías
            $owner->surname = null;
            $owner->isAdmin = 1;
            $owner->status  = 1;
            $owner->email   = null; // por si tienes unique en email, mejor dejarlo null
            $owner->save();
        }

        return $ownerCache[$ownerName] = $owner->id;
    }


    /**
     * Crea o recupera la Company asociada a la cuenta temporal.
     *
     * Regla:
     *  - Si hay NIF: se busca por NIF.
     *  - Si NO hay NIF pero hay nombre: se busca por nombre.
     *  - Si no hay ni NIF ni nombre: no se crea nada.
     *
     * Devuelve [Company|null, bool created]
     */
    protected function resolveCompany(
        CrmAccountTmp $tmp,
        int $ownerId,
        Account $accountPlan,
        array &$companyCache
    ): array {
        $nif   = trim((string) $tmp->nif);
        $name  = trim((string) $tmp->account_name);

        // Si no hay datos suficientes, no creamos empresa maestra
        if ($nif === '' && $name === '') {
            return [null, false];
        }

        // Clave de cache: prioriza NIF, si no, nombre en minúsculas
        $cacheKey = $nif !== ''
            ? 'nif:' . $nif
            : 'name:' . mb_strtolower($name);

        if (isset($companyCache[$cacheKey])) {
            return [$companyCache[$cacheKey], false];
        }

        // Query de búsqueda
        $q = Company::query();
        if ($nif !== '') {
            $q->where('nif', $nif);
        } else {
            $q->where('name', $name);
        }

        $company = $q->first();
        $created = false;

        if (! $company) {
            $baseSlug = $name !== '' ? $name : ($nif !== '' ? $nif : Str::uuid()->toString());

            $company = new Company();
            $company->name       = $name !== '' ? $name : $nif;
            $company->slug       = Str::slug($baseSlug);
            $company->nif        = $nif !== '' ? $nif : null;
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
            $wp->name       = 'Sede ' . $company->name;
            $wp->slug       = 'sede-' .  Str::slug($company->name);
            $wp->featured   = 1;
            $wp->nif_norm   = null;
            $wp->save();

            $created = true;
        }

        $companyCache[$cacheKey] = $company;

        return [$company, $created];
    }

    /**
     * Crea o actualiza la CrmAccount a partir de la fila temporal.
     * Devuelve [CrmAccount, bool created]
     */
    protected function syncCrmAccount(
        CrmAccountTmp $tmp,
        int $tenantCompanyId,
        ?Company $linkedCompany,
        int $ownerId,
        int $eurCurrencyId,
        array $countryCodes
    ): array {
        // Moneda
        $currencyId = $tmp->currency === 'Euro' ? $eurCurrencyId : null;

        // Fecha de creación (viene en created_date)
        $createdAt = Carbon::now();
        if ($tmp->created_date) {
            try {
                $createdAt = Carbon::createFromFormat('d/m/Y H:i', $tmp->created_date);
            } catch (\Throwable $e) {
                // si falla el parseo, dejamos now()
            }
        }

        // País
        $countryCode = null;
        if ($tmp->country1 && isset($countryCodes[$tmp->country1])) {
            $countryCode = $countryCodes[$tmp->country1];
        }

        // Nombre normalizado
        $normalizedName = $tmp->account_name ? Str::slug($tmp->account_name) : null;

        // Buscamos por external_id si existe
        $crmQuery = CrmAccount::query();

        if ($tmp->external_id) {
            $crmQuery->where('external_id', $tmp->external_id);
        } else {
            $crmQuery->where('company_id', $tenantCompanyId)
                     ->where('name', $tmp->account_name);
        }

        $crm     = $crmQuery->first();
        $created = false;

        if (! $crm) {
            $crm     = new CrmAccount();
            $created = true;
        }

        $crm->company_id            = $tenantCompanyId;
        $crm->linked_company_id     = $linkedCompany?->id;  // <- AQUÍ se arrastra company_id
        $crm->name                  = $tmp->account_name;
        $crm->normalized_name       = $normalizedName;
        $crm->currency_id           = $currencyId;
        $crm->owner_id              = $ownerId;
        $crm->billing_street        = $tmp->address1_street1;
        $crm->billing_city          = $tmp->city;
        $crm->billing_state         = $tmp->province1;
        $crm->billing_postal_code   = $tmp->cp1;
        $crm->billing_country_code  = $countryCode;
        $crm->shipping_street       = $tmp->address1_street2;
        $crm->shipping_city         = $tmp->city;
        $crm->shipping_state        = $tmp->province1;
        $crm->shipping_postal_code  = $tmp->cp1;
        $crm->shipping_country_code = $countryCode;
        $crm->description           = $tmp->description;
        $crm->external_id           = $tmp->external_id;
        $crm->main_phone            = $tmp->main_phone;
        $crm->main_contact          = $tmp->main_contact;
        $crm->main_email            = $tmp->main_email;
        $crm->status                = 1;
        $crm->created_by            = $crm->created_by ?: $ownerId;
        $crm->updated_by            = $ownerId;

        if ($created) {
            $crm->created_at = $createdAt;
        }

        $crm->save();

        return [$crm, $created];
    }

    // protected function myLogica(){
    //     $data = CrmAccountTmp::all();

    //     $ownerId = 1;
    //     $currentCompanyId = 1;

    //     //Cuentas de empresa
    //     $account = Account::select('id', 'rate')
    //     ->where('slug', 'free')
    //     ->where('status', 1)
    //     ->first();

    //     //Moneda:
    //     $currency = Currency::select('id')->where('code', 'EUR')->first();

    //     //Países:
    //     $country_codes = [
    //         'Alemania' => 'DE',
    //         'Arabia Saudí' => 'SA',
    //         'Argentina' => 'AR',
    //         'Austria' => 'AT',
    //         'Bélgica' => 'BE',
    //         'Bolivia' => 'BO',
    //         'CHILE' => 'CL',
    //         'Colombia' => 'CO',
    //         'Costa Rica' => 'CR',
    //         'España' => 'ES',
    //         'Español' => 'ES',
    //         'Málaga' => 'ES',
    //         'Estado Unidos' => 'US',
    //         'Estados Unidos' => 'US',
    //         'France' => 'FR',
    //         'Francia' => 'FR',
    //         'Irlanda' => 'IE',
    //         'Italia' => 'IT',
    //         'Líbano' => 'LB',
    //         'México' => 'MX',
    //         'Países Bajos' => 'NL',
    //         'Panamá' => 'PA',
    //         'Portugal' => 'PT',
    //         'Puerto Rico' => 'PR',
    //         'Reino Unido' => 'GB',
    //         'Republica Dominicana' => 'DO',
    //         'República Dominicana' => 'DO',
    //         'Suiza' => 'CH',
    //         'Uruguay' => 'UY',
    //     ];

    //     DB::beginTransaction();

    //     try {
    //         foreach($data as $r){
    //             //Buscamos si existe el propietario:
    //             if($r->owner){
    //                 $owner = User::whereRaw("CONCAT(name, ' ', surname) = ?", [      trim($r->owner)])->first();

    //                 if(!$owner){
    //                     $owner = new User();
    //                     $owner->name = trim($r->owner);   
    //                     $owner->surname = null;
    //                     $owner->isAdmin = 1;
    //                     $owner->status = 1;                     
    //                     $owner->save();
    //                 }

    //                 $ownerId = $owner->id;
    //             }

    //             //Creamos empresa si tiene nif:
    //             //if($r->nif){
    //                 //Verificamos que no exista nif:
    //                 $company = Company::where('nif', $r->nif)->first();

    //                 if(!$company){
    //                     $slug = $r->account_name? Str::slug($r->account_name):'';

    //                     $company = new Company();
    //                     $company->name = $r->account_name;
    //                     $company->slug = $slug;
    //                     $company->nif = trim($r->nif);
    //                     $company->status = 1;
    //                     $company->created_by = $ownerId;
    //                     $company->updated_by = $ownerId;
    //                     $company->save();

    //                     CompanyAccount::create([
    //                         'company_id' => $company->id,
    //                         'guardian' => NULL,
    //                         'account_id' => $account->id,
    //                         'start_date' => Carbon::now(),
    //                         'end_date' => config('constants.UNDEFINED_DATE_'),
    //                         'price' => $account->rate,
    //                         'status' => 1
    //                     ]);

    //                     $wp = new Workplace();
    //                     $wp->company_id = $company->id;
    //                     $wp->name = ucfirst(trans('textos.sede')).' '.$company->name;
    //                     $wp->slug = Str::slug(trans('textos.sede'));
    //                     $wp->featured = 1;
    //                     $wp->save();
    //                 }

    //                 $companyId = $company->id;
    //             //}

    //             //Moneda:
    //             $currencyId = $r->currency == 'Euro'? $currency->id:null;

    //             //Created_At:
    //             $createdAt = $r->created_at? Carbon::createFromFormat('d/m/Y H:i', $r->created_at)->format('Y-m-d H:i:s'):Carbon::now();

    //             $countryCode = $r->country1 && isset($country_codes[$r->country1])? $country_codes[$r->country1]:null;

    //             //Creamos cuenta CRM:
    //             $c = new CrmAccount();
    //             $c->company_id = $currentCompanyId;
    //             $c->linked_company_id = $company->id;
    //             $c->name = $r->account_name;
    //             $c->normalized_name = $slug;
    //             $c->currency_id = $currencyId;
    //             $c->owner_id = $ownerId;
    //             $c->billing_street = $r->address1_street1;
    //             $c->billing_city = $r->city;
    //             $c->billing_state = $r->province1;
    //             $c->billing_postal_code = $r->cp1;
    //             $c->billing_country_code = $countryCode;
    //             $c->shipping_street = $r->address1_street2;
    //             $c->shipping_city = $r->city;
    //             $c->shipping_state = $r->province1;
    //             $c->shipping_postal_code = $r->cp1;
    //             $c->shipping_country_code = $countryCode;
    //             $c->description = $r->description; 
    //             $c->external_id = $r->external_id;
    //             $c->main_phone = $r->main_phone;
    //             $c->main_contact = $r->main_contact;
    //             $c->main_email = $r->main_email;
    //             $c->status = 1;
    //             $c->created_by = $ownerId;
    //             $c->updated_by = $ownerId;
    //             $c->created_at = $createdAt;
    //             $c->save();    

    //             //Pasamos el crm_account_id a crm_accounts_tmp:
    //             $r->crm_account_id = $c->id;
    //             $r->save();            
    //         }

    //     } catch (\Throwable $e) {
    //         DB::rollBack();
    //         //fclose($handle);
    //         $this->error("Error general: {$e->getMessage()}");
    //         return Command::FAILURE;
    //     }
    // }

}
