<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

// Models:
use App\Models\CostCenter;
use App\Models\CrmMarketingCampaignsExpressTmp;
use App\Models\Currency;
use App\Models\MarketingCampaign;
use App\Models\User;

class PromoteCrmCampaignsExpress extends Command
{
    /**
     * Command:
     *  php artisan crm:promote-campaigns-express
     *  php artisan crm:promote-campaigns-express --dry-run
     *  php artisan crm:promote-campaigns-express --only-external-id=...
     */
    protected $signature = 'crm:promote-campaigns-express
                            {--company=1 : ID de la empresa del ERP (tenant) a la que se asignan las campañas}
                            {--chunk=500 : Tamaño de lote para procesar registros}
                            {--only-external-id= : Procesar sólo una campaña express concreta por external_id}
                            {--dry-run : Simula la promoción sin guardar cambios}';

    protected $description = 'Promociona campañas express desde crm_marketing_campaigns_express_tmp a marketing_campaigns';

    public function handle()
    {
        $tenantCompanyId = (int) ($this->option('company') ?: 1);
        $chunkSize       = (int) ($this->option('chunk') ?: 500);
        $onlyExternalId  = $this->option('only-external-id');
        $dryRun          = (bool) $this->option('dry-run');

        $this->info("Promocionando campañas EXPRESS desde crm_marketing_campaigns_express_tmp para company_id={$tenantCompanyId}"
            . ($dryRun ? ' [DRY RUN]' : ''));

        // Query base
        $baseQuery = CrmMarketingCampaignsExpressTmp::query();

        if ($onlyExternalId) {
            $baseQuery->where('external_id', $onlyExternalId);
        }

        $total = (clone $baseQuery)->count();

        if ($total === 0) {
            $this->warn('No hay registros en crm_marketing_campaigns_express_tmp que coincidan con el filtro.');
            return Command::SUCCESS;
        }

        $this->info("Total registros a procesar: {$total}");

        // Cachés / contadores
        $ownerCache       = []; // "Nombre Apellidos" => user_id
        $processed        = 0;
        $createdCampaigns = 0;
        $updatedCampaigns = 0;
        $errors           = 0;

        $baseQuery->orderBy('id')
            ->chunkById($chunkSize, function ($rows) use (
                $tenantCompanyId,
                $dryRun,
                &$ownerCache,
                &$processed,
                &$createdCampaigns,
                &$updatedCampaigns,
                &$errors
            ) {
                $closure = function () use (
                    $rows,
                    $tenantCompanyId,
                    &$ownerCache,
                    &$processed,
                    &$createdCampaigns,
                    &$updatedCampaigns,
                    &$errors
                ) {
                    foreach ($rows as $tmp) {
                        try {
                            [$campaign, $created, $updated] = $this->processSingleExpressCampaign(
                                $tmp,
                                $tenantCompanyId,
                                $ownerCache
                            );

                            if ($created) {
                                $createdCampaigns++;
                            } elseif ($updated) {
                                $updatedCampaigns++;
                            }

                            $processed++;

                            if ($processed % 200 === 0) {
                                $this->info("Procesadas {$processed} campañas express...");
                            }

                        } catch (\Throwable $e) {
                            $errors++;
                            $this->error("Error procesando tmp_id={$tmp->id}: {$e->getMessage()}");
                        }
                    }
                };

                if ($dryRun) {
                    $this->comment('DRY RUN: simulando chunk de ' . count($rows) . ' registros (sin escritura).');
                    // Si quisieras ver logs internos en dry-run,
                    // tendrías que proteger los save() dentro de processSingleExpressCampaign.
                } else {
                    DB::transaction($closure);
                }
            });

        $this->info("Proceso terminado.");
        $this->info("Registros procesados:       {$processed}");
        $this->info("Campañas express creadas:   {$createdCampaigns}");
        $this->info("Campañas express actualizadas: {$updatedCampaigns}");
        $this->info("Errores:                    {$errors}");

        return Command::SUCCESS;
    }

    /**
     * Procesa una fila de crm_marketing_campaigns_express_tmp y la vuelca a marketing_campaigns
     * marcada como is_quick = true.
     *
     * @return array [MarketingCampaign $campaign, bool $created, bool $updated]
     */
    protected function processSingleExpressCampaign(
        CrmMarketingCampaignsExpressTmp $tmp,
        int $tenantCompanyId,
        array &$ownerCache
    ): array {
        // 1) Owner
        $ownerId = $this->resolveOwnerId($tmp, $ownerCache);

        // 2) Status
        $status = $this->mapStatusReasonToStatus($tmp->status_reason);

        // 3) Buscar campaña existente:
        //    sólo campañas marcadas como is_quick = true
        $query = MarketingCampaign::query()
            ->where('company_id', $tenantCompanyId)
            ->where('is_quick', true);

        if ($tmp->external_id) {
            $query->where('external_id', $tmp->external_id);
        }

        $campaign = $query->first();
        $created  = false;
        $updated  = false;

        // Fechas
        $createdAt = $this->parseDateTimeFromTmp($tmp->created_date);
        $finishAt  = $this->parseDateTimeFromTmp($tmp->finish_at);

        if (! $campaign) {
            $campaign = new MarketingCampaign();
            $created  = true;

            $campaign->company_id     = $tenantCompanyId;
            $campaign->owner_id       = $ownerId;
            $campaign->name           = $tmp->name ?: 'Campaña express sin nombre';
            $campaign->campaign_code  = null;
            $campaign->campaign_type  = null;
            $campaign->description    = null;
            $campaign->total_cost     = 0;
            $campaign->expected_cost  = null;
            $campaign->currency_id    = null;
            $campaign->promote_code   = null;
            $campaign->start_at       = null;
            $campaign->finish_at      = $finishAt;
            $campaign->cost_center_id = null;
            $campaign->status         = $status;
            $campaign->external_id    = $tmp->external_id ?: null;
            $campaign->source_system  = 'dynamics_365';
            $campaign->source_type    = 'quick_campaign';
            $campaign->is_quick       = true;
            $campaign->created_by     = $ownerId;
            $campaign->updated_by     = $ownerId;

            // Campos específicos express
            $campaign->members_count  = (int) ($tmp->members_count ?? 0);
            $campaign->send_ok        = (int) ($tmp->send_ok ?? 0);
            $campaign->send_ko        = (int) ($tmp->send_ko ?? 0);
            $campaign->action         = $tmp->action ?: null;
            $campaign->priority       = $tmp->priority ?: null;
            $campaign->members_type   = $tmp->members_type ?: null;

            if ($createdAt) {
                $campaign->created_at = $createdAt;
            }

        } else {
            $updated = true;

            $campaign->owner_id      = $ownerId;
            $campaign->name          = $tmp->name ?: $campaign->name;
            $campaign->finish_at     = $finishAt ?: $campaign->finish_at;
            $campaign->status        = $status ?: $campaign->status;
            if ($tmp->external_id) {
                $campaign->external_id = $tmp->external_id;
            }
            $campaign->source_system = $campaign->source_system ?: 'dynamics_365';
            $campaign->source_type   = 'quick_campaign';
            $campaign->is_quick      = true;
            $campaign->updated_by    = $ownerId;

            // Campos express (actualizamos siempre con lo que venga)
            $campaign->members_count = (int) ($tmp->members_count ?? $campaign->members_count ?? 0);
            $campaign->send_ok       = (int) ($tmp->send_ok ?? $campaign->send_ok ?? 0);
            $campaign->send_ko       = (int) ($tmp->send_ko ?? $campaign->send_ko ?? 0);
            $campaign->action        = $tmp->action ?: $campaign->action;
            $campaign->priority      = $tmp->priority ?: $campaign->priority;
            $campaign->members_type  = $tmp->members_type ?: $campaign->members_type;
        }

        $campaign->save();

        return [$campaign, $created, $updated];
    }

    /**
     * Resuelve el owner (User) a partir de tmp->owner ("Nombre Apellidos").
     * Usa caché para no machacar la BD.
     */
    protected function resolveOwnerId(CrmMarketingCampaignsExpressTmp $tmp, array &$ownerCache): int
    {
        $ownerName = trim((string) $tmp->owner);

        if ($ownerName === '') {
            return 1; // usuario sistema / superadmin
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

        return 0;
    }

    /**
     * Parse genérico de fecha/hora desde valor mixto (string / DateTime / Carbon).
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
                // siguiente formato
            }
        }

        try {
            return Carbon::parse($raw);
        } catch (\Throwable $e) {
            return null;
        }
    }

    /**
     * Tu lógica “en bruto”. No la toco.
     */
    protected function myLogica()
    {
        $data = CrmMarketingCampaignsExpressTmp::all();

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

            $mc = new MarketingCampaign();
            $mc->owner_id = $ownerId;
            $mc->company_id = $currentCompanyId;
            $mc->name = $r->name;
            //$mc->campaign_code = $r->campaign_code;
            //$mc->campaign_code = $r->campaign_type;
            //$mc->description = $r->description;
            //$mc->total_cost = $r->total_cost;
            //$mc->expected_cost = 0;
            //$mc->currency_id = $currencyId;
            //$mc->promote_code = $r->promote_code;
            //$mc->start_at = $r->start_at;
            $mc->finish_at = $r->finish_at;
            //$mc->cost_center_id = $costCenterId;
            $mc->created_by = $ownerId; 
            $mc->updated_by = $ownerId;
            $mc->status = $r->status_reason;
            $mc->external_id = $r->external_id;
            //$mc->source_system = ?;
            //$mc->source_type = ?;
            $mc->is_quick = true; 
            $mc->members_count = $r->members_count;
            $mc->send_ok = $r->send_ok;
            $mc->send_ko = $r->send_ko;
            $mc->action = $r->action;
            $mc->priority = $r->priority;
            $mc->members_type = $r->members_type;
            $mc->created_at = $r->created_date;
            $mc->save();

        }
    }
}
