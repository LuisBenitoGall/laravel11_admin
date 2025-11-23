<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

// Models:
use App\Models\CostCenter;
use App\Models\CrmMarketingCampaignsTmp;
use App\Models\Currency;
use App\Models\MarketingCampaign;
use App\Models\User;

class PromoteCrmCampaigns extends Command
{
    /**
     * Command:
     *  php artisan crm:promote-campaigns
     *  php artisan crm:promote-campaigns --dry-run
     *  php artisan crm:promote-campaigns --only-external-id=...
     */
    protected $signature = 'crm:promote-campaigns
                            {--company=1 : ID de la empresa del ERP (tenant) a la que se asignan las campañas}
                            {--chunk=500 : Tamaño de lote para procesar registros}
                            {--only-external-id= : Procesar sólo una campaña concreta por external_id}
                            {--dry-run : Simula la promoción sin guardar cambios}';

    protected $description = 'Promociona campañas desde crm_marketing_campaigns_tmps a marketing_campaigns y tablas asociadas';

    public function handle()
    {
        $tenantCompanyId = (int) ($this->option('company') ?: 1);
        $chunkSize       = (int) ($this->option('chunk') ?: 500);
        $onlyExternalId  = $this->option('only-external-id');
        $dryRun          = (bool) $this->option('dry-run');

        $this->info("Promocionando campañas desde crm_marketing_campaigns_tmps para company_id={$tenantCompanyId}"
            . ($dryRun ? ' [DRY RUN]' : ''));

        // Moneda EUR (para mapear la columna currency = 'Euro')
        $eurCurrency = Currency::select('id')->where('code', 'EUR')->first();
        if (! $eurCurrency) {
            $this->error('No se ha encontrado la moneda EUR.');
            return Command::FAILURE;
        }
        $eurCurrencyId = $eurCurrency->id;

        // Query base
        $baseQuery = CrmMarketingCampaignsTmp::query();

        if ($onlyExternalId) {
            $baseQuery->where('external_id', $onlyExternalId);
        }

        $total = (clone $baseQuery)->count();

        if ($total === 0) {
            $this->warn('No hay registros en crm_marketing_campaigns_tmps que coincidan con el filtro.');
            return Command::SUCCESS;
        }

        $this->info("Total registros a procesar: {$total}");

        // Cachés / contadores
        $ownerCache       = []; // "Nombre Apellidos" => user_id
        $costCenterCache  = []; // nombre centro coste (lower) => CostCenter
        $processed        = 0;
        $createdCampaigns = 0;
        $updatedCampaigns = 0;
        $errors           = 0;

        $baseQuery->orderBy('id')
            ->chunkById($chunkSize, function ($rows) use (
                $tenantCompanyId,
                $dryRun,
                $eurCurrencyId,
                &$ownerCache,
                &$costCenterCache,
                &$processed,
                &$createdCampaigns,
                &$updatedCampaigns,
                &$errors
            ) {
                $closure = function () use (
                    $rows,
                    $tenantCompanyId,
                    $eurCurrencyId,
                    &$ownerCache,
                    &$costCenterCache,
                    &$processed,
                    &$createdCampaigns,
                    &$updatedCampaigns,
                    &$errors
                ) {
                    foreach ($rows as $tmp) {
                        try {
                            [$campaign, $created, $updated] = $this->processSingleCampaign(
                                $tmp,
                                $tenantCompanyId,
                                $eurCurrencyId,
                                $ownerCache,
                                $costCenterCache
                            );

                            if ($created) {
                                $createdCampaigns++;
                            } elseif ($updated) {
                                $updatedCampaigns++;
                            }

                            $processed++;

                            if ($processed % 200 === 0) {
                                $this->info("Procesadas {$processed} campañas...");
                            }

                        } catch (\Throwable $e) {
                            $errors++;
                            $this->error("Error procesando tmp_id={$tmp->id}: {$e->getMessage()}");
                        }
                    }
                };

                if ($dryRun) {
                    $this->comment('DRY RUN: simulando chunk de ' . count($rows) . ' registros (sin escritura).');
                    // Si quisieras ver logs internos, podrías ejecutar $closure()
                    // pero entonces tendrías que proteger los save() dentro de processSingleCampaign.
                } else {
                    DB::transaction($closure);
                }
            });

        $this->info("Proceso terminado.");
        $this->info("Registros procesados:       {$processed}");
        $this->info("Campañas creadas:           {$createdCampaigns}");
        $this->info("Campañas actualizadas:      {$updatedCampaigns}");
        $this->info("Errores:                    {$errors}");

        return Command::SUCCESS;
    }

    /**
     * Procesa una única fila temporal y la vuelca a marketing_campaigns.
     *
     * @return array [MarketingCampaign $campaign, bool $created, bool $updated]
     */
    protected function processSingleCampaign(
        CrmMarketingCampaignsTmp $tmp,
        int $tenantCompanyId,
        int $eurCurrencyId,
        array &$ownerCache,
        array &$costCenterCache
    ): array {
        // 1) Owner
        $ownerId = $this->resolveOwnerId($tmp, $ownerCache);

        // 2) Moneda
        $currencyId = null;
        $currencyLabel = trim((string) $tmp->currency);
        if ($currencyLabel !== '' && mb_strtolower($currencyLabel, 'UTF-8') === 'euro') {
            $currencyId = $eurCurrencyId;
        }

        // 3) Centro de coste
        $costCenterId = $this->resolveCostCenterId($tmp, $tenantCompanyId, $costCenterCache);

        // 4) Status
        $status = $this->mapStatusReasonToStatus($tmp->status_reason);

        // 5) Buscar campaña existente
        $query = MarketingCampaign::query()->where('company_id', $tenantCompanyId);

        if ($tmp->external_id) {
            $query->where('external_id', $tmp->external_id);
        } elseif ($tmp->campaign_code) {
            $query->where('campaign_code', $tmp->campaign_code);
        }

        $campaign = $query->first();
        $created  = false;
        $updated  = false;

        $createdAt = $tmp->created_date instanceof Carbon
            ? $tmp->created_date
            : ($tmp->created_date ? Carbon::parse($tmp->created_date) : null);

        if (! $campaign) {
            $campaign = new MarketingCampaign();
            $created  = true;

            $campaign->company_id   = $tenantCompanyId;
            $campaign->owner_id     = $ownerId;
            $campaign->name         = $tmp->name ?: 'Campaña sin nombre';
            $campaign->campaign_code = $tmp->campaign_code ?: null;
            $campaign->campaign_type = $tmp->campaign_type ?: null;
            $campaign->description   = $tmp->description ?: null;
            $campaign->total_cost    = $tmp->total_cost ?? 0;
            $campaign->expected_cost = null; // si quieres puedes calcular algo aquí
            $campaign->currency_id   = $currencyId;
            $campaign->promote_code  = $tmp->promote_code ?: null;
            $campaign->start_at      = $tmp->start_at ?: null;
            $campaign->finish_at     = $tmp->finish_at ?: null;
            $campaign->cost_center_id = $costCenterId;
            $campaign->status        = $status;
            $campaign->external_id   = $tmp->external_id ?: null;
            $campaign->source_system = 'dynamics_365';
            $campaign->source_type   = 'campaign';
            $campaign->is_quick      = false;
            $campaign->created_by    = $ownerId;
            $campaign->updated_by    = $ownerId;

            if ($createdAt) {
                $campaign->created_at = $createdAt;
            }

        } else {
            $updated = true;

            $campaign->owner_id       = $ownerId;
            $campaign->name           = $tmp->name ?: $campaign->name;
            $campaign->campaign_code  = $tmp->campaign_code ?: $campaign->campaign_code;
            $campaign->campaign_type  = $tmp->campaign_type ?: $campaign->campaign_type;
            $campaign->description    = $tmp->description ?: $campaign->description;
            if ($tmp->total_cost !== null) {
                $campaign->total_cost = $tmp->total_cost;
            }
            if ($currencyId !== null) {
                $campaign->currency_id = $currencyId;
            }
            $campaign->promote_code   = $tmp->promote_code ?: $campaign->promote_code;
            $campaign->start_at       = $tmp->start_at ?: $campaign->start_at;
            $campaign->finish_at      = $tmp->finish_at ?: $campaign->finish_at;
            $campaign->cost_center_id = $costCenterId ?: $campaign->cost_center_id;
            $campaign->status         = $status ?: $campaign->status;
            if ($tmp->external_id) {
                $campaign->external_id = $tmp->external_id;
            }
            $campaign->source_system  = $campaign->source_system ?: 'dynamics_365';
            $campaign->source_type    = $campaign->source_type ?: 'campaign';
            $campaign->is_quick       = false;
            $campaign->updated_by     = $ownerId;
        }

        $campaign->save();

        return [$campaign, $created, $updated];
    }

    /**
     * Resuelve el owner (User) a partir de tmp->owner.
     * Usa caché para no machacar la BD a lo tonto.
     */
    protected function resolveOwnerId(CrmMarketingCampaignsTmp $tmp, array &$ownerCache): int
    {
        $ownerName = trim((string) $tmp->owner);

        if ($ownerName === '') {
            return 1; // fallback: usuario sistema / superadmin
        }

        if (isset($ownerCache[$ownerName])) {
            return $ownerCache[$ownerName];
        }

        $user = User::whereRaw("TRIM(CONCAT(name, ' ', surname)) = ?", [$ownerName])->first();

        if (! $user) {
            $user = new User();
            $user->name    = $ownerName;
            $user->surname = null;
            $user->isAdmin = 1;
            $user->status  = 1;
            $user->email   = null;
            $user->save();
        }

        return $ownerCache[$ownerName] = $user->id;
    }

    /**
     * Resuelve el centro de coste por nombre, creando si no existe.
     */
    protected function resolveCostCenterId(
        CrmMarketingCampaignsTmp $tmp,
        int $tenantCompanyId,
        array &$costCenterCache
    ): ?int {
        $name = trim((string) $tmp->cost_center);

        if ($name === '') {
            return null;
        }

        $key = mb_strtolower($tenantCompanyId . '|' . $name, 'UTF-8');

        if (isset($costCenterCache[$key])) {
            return $costCenterCache[$key]->id;
        }

        $cc = CostCenter::where('company_id', $tenantCompanyId)
            ->where('name', $name)
            ->first();

        if (! $cc) {
            $cc = new CostCenter();
            $cc->company_id = $tenantCompanyId;
            $cc->name       = $name;
            $cc->slug       = Str::slug($name) ?: Str::uuid()->toString();
            $cc->status     = 1;
            $cc->save();
        }

        $costCenterCache[$key] = $cc;

        return $cc->id;
    }

    /**
     * Mapea status_reason textual a status numérico:
     * 0: draft, 1: active, 2: finished, 3: cancelled
     */
    protected function mapStatusReasonToStatus(?string $statusReason): int
    {
        if (! $statusReason) {
            return 0;
        }

        $s = mb_strtolower(trim($statusReason), 'UTF-8');

        if (str_contains($s, 'cancel')) {
            return 3;
        }

        if (
            str_contains($s, 'finaliz') ||
            str_contains($s, 'cerrad')  ||
            str_contains($s, 'complet')
        ) {
            return 2;
        }

        if (
            str_contains($s, 'activo') ||
            str_contains($s, 'activa') ||
            str_contains($s, 'en curso')
        ) {
            return 1;
        }

        // default: borrador / indefinido
        return 0;
    }

    /**
     * Tu juguete “en bruto”. No lo toco.
     */
    protected function myLogica()
    {
        $data = CrmMarketingCampaignsTmp::all();

        $ownerId = 1;
        $currentCompanyId = 1;

        //Moneda:
        $currency = Currency::select('id')->where('code', 'EUR')->first();

        DB::beginTransaction();

        foreach ($data as $r) {
            //Buscamos si existe el propietario:
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

            //Moneda:
            $currencyId = $r->currency == 'Euro'? $currency->id:null;

            //Centro de coste:
            $costCenterId = null;
            if($r->cost_center){
                $cost_center = CostCenter::select('id')->where('name', $r->cost_center)->first();
                
                if(!$cost_center){
                    $cc_slug = Str::slug($r->cost_center);

                    $cost_center = new CostCenter();
                    $cost_center->company_id = $currentCompanyId;
                    $cost_center->name = $r->cost_center;
                    $cost_center->slug = $cc_slug;
                    $cost_center->status = 1;
                    $cost_center->save();
                }    

                $costCenterId = $cost_center->id;
            }

            $mc = new MarketingCampaign();
            $mc->owner_id = $ownerId;
            $mc->company_id = $currentCompanyId;
            $mc->name = $r->name;
            $mc->campaign_code = $r->campaign_code;
            $mc->description = $r->description;
            $mc->total_cost = $r->total_cost;
            $mc->expected_cost = 0;
            $mc->currency_id = $currencyId;
            $mc->promote_code = $r->promote_code;
            $mc->start_at = $r->start_at;
            $mc->finish_at = $r->finish_at;
            $mc->cost_center_id = $costCenterId;
            $mc->created_by = $ownerId; 
            $mc->updated_by = $ownerId;
            $mc->status = $r->status_reason;
            $mc->external_id = $r->external_id;
            $mc->source_system = null;
            $mc->source_type = $r->campaing_type;
            $mc->is_quick = false; 
            $mc->created_at = $r->created_date;
            $mc->save();
        }
    }
}
