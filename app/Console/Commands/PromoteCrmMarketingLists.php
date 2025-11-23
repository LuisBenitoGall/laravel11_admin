<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

// Models:
use App\Models\CrmMarketingListTmp;
use App\Models\MarketingList;      // ajusta si tu modelo se llama distinto
use App\Models\User;
use App\Models\CrmContact;

class PromoteCrmMarketingLists extends Command
{
    /**
     * Command:
     *  php artisan crm:promote-marketing-lists
     *  php artisan crm:promote-marketing-lists --dry-run
     *  php artisan crm:promote-marketing-lists --only-external-id=...
     */
    protected $signature = 'crm:promote-marketing-lists
                            {--company=1 : ID de la empresa del ERP (tenant) a la que se asignan las listas}
                            {--chunk=500 : Tamaño de lote para procesar registros}
                            {--only-external-id= : Procesar sólo una lista concreta por external_id}
                            {--dry-run : Simula la promoción sin guardar cambios}';

    protected $description = 'Promociona listas de marketing desde crm_marketing_lists_tmp a marketing_lists y tablas asociadas';

    public function handle()
    {
        $tenantCompanyId = (int) ($this->option('company') ?: 1);
        $chunkSize       = (int) ($this->option('chunk') ?: 500);
        $onlyExternalId  = $this->option('only-external-id');
        $dryRun          = (bool) $this->option('dry-run');

        $this->info("Promocionando listas de marketing desde crm_marketing_lists_tmp para company_id={$tenantCompanyId}"
            . ($dryRun ? ' [DRY RUN]' : ''));

        // Query base
        $baseQuery = CrmMarketingListTmp::query();

        if ($onlyExternalId) {
            $baseQuery->where('external_id', $onlyExternalId);
        }

        $total = (clone $baseQuery)->count();

        if ($total === 0) {
            $this->warn('No hay registros en crm_marketing_lists_tmp que coincidan con el filtro.');
            return Command::SUCCESS;
        }

        $this->info("Total registros a procesar: {$total}");

        // Cachés / contadores básicos
        $listCache       = []; // clave => MarketingList
        $processed       = 0;
        $createdLists    = 0;
        $updatedLists    = 0;
        $linkedMembers   = 0;
        $errors          = 0;

        $baseQuery->orderBy('id')
            ->chunkById($chunkSize, function ($rows) use (
                $tenantCompanyId,
                $dryRun,
                &$listCache,
                &$processed,
                &$createdLists,
                &$updatedLists,
                &$linkedMembers,
                &$errors
            ) {
                $closure = function () use (
                    $rows,
                    $tenantCompanyId,
                    &$listCache,
                    &$processed,
                    &$createdLists,
                    &$updatedLists,
                    &$linkedMembers,
                    &$errors
                ) {
                    foreach ($rows as $tmp) {
                        try {
                            $result = $this->processSingleMarketingList(
                                $tmp,
                                $tenantCompanyId,
                                $listCache
                            );

                            $createdLists  += $result['created_lists']  ?? 0;
                            $updatedLists  += $result['updated_lists']  ?? 0;
                            $linkedMembers += $result['linked_members'] ?? 0;

                            $processed++;

                            if ($processed % 200 === 0) {
                                $this->info("Procesadas {$processed} listas de marketing...");
                            }

                        } catch (\Throwable $e) {
                            $errors++;
                            $this->error("Error procesando tmp_id={$tmp->id}: {$e->getMessage()}");
                        }
                    }
                };

                if ($dryRun) {
                    $this->comment('DRY RUN: simulando chunk de ' . count($rows) . ' registros (sin escritura).');
                    // Si algún día quieres dry-run con lógica interna,
                    // toca pasar el flag hasta processSingleMarketingList y no hacer save() allí.
                } else {
                    DB::transaction($closure);
                }
            });

        $this->info("Proceso terminado.");
        $this->info("Registros procesados:          {$processed}");
        $this->info("Listas creadas:                {$createdLists}");
        $this->info("Listas actualizadas:           {$updatedLists}");
        $this->info("Miembros vinculados (aprox.):  {$linkedMembers}");
        $this->info("Errores:                       {$errors}");

        return Command::SUCCESS;
    }

    /**
     * Procesa un único registro de crm_marketing_lists_tmp.
     */
    protected function processSingleMarketingList(
        CrmMarketingListTmp $tmp,
        int $tenantCompanyId,
        array &$listCache
    ): array {
        // 1) Owner
        $ownerId = $this->resolveOwnerId($tmp);

        // 2) Lista definitiva
        [$list, $created, $updated] = $this->resolveMarketingList(
            $tmp,
            $tenantCompanyId,
            $ownerId,
            $listCache
        );

        // 3) Miembros (de momento 0, porque no tenemos mapping de miembros)
        $linkedMembers = 0; // $this->syncListMembers($tmp, $list);

        // 4) Guardar list_id en la tmp
        $this->markTmpRowStatus($tmp, $list);

        return [
            'created_lists'  => $created ? 1 : 0,
            'updated_lists'  => $updated ? 1 : 0,
            'linked_members' => $linkedMembers,
        ];
    }

    /**
     * Resuelve el owner (User) a partir de tmp->owner ("Nombre Apellidos").
     * Si no hay owner, devuelve 1 como fallback.
     */
    protected function resolveOwnerId(CrmMarketingListTmp $tmp): int
    {
        $ownerName = trim((string) $tmp->owner);

        if ($ownerName === '') {
            return 1; // superadmin / system user
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

        return $user->id;
    }

    /**
     * Localiza o crea la lista definitiva de marketing.
     *
     * @return array [MarketingList $list, bool $created, bool $updated]
     */
        /**
     * Localiza o crea la lista definitiva de marketing.
     *
     * @return array [MarketingList $list, bool $created, bool $updated]
     */
    protected function resolveMarketingList(
        CrmMarketingListTmp $tmp,
        int $tenantCompanyId,
        int $ownerId,
        array &$listCache
    ): array {
        $externalId = trim((string) $tmp->external_id);
        $name       = trim((string) $tmp->list_name);

        if ($name === '' && $externalId === '') {
            // Lista sin nombre ni external_id: la ignoramos
            throw new \RuntimeException('Registro sin list_name ni external_id.');
        }

        // 🔹 Mapear tipo de lista ("Dinámico" / "Estático") a boolean
        $rawType   = trim((string) $tmp->type);
        $isDynamic = false;

        if ($rawType !== '') {
            // aceptamos "Dinámico" / "Dinamico" con o sin acento, may/min
            $normalized = mb_strtolower($rawType, 'UTF-8');
            $isDynamic  = in_array($normalized, ['dinámico', 'dinamico'], true);
        }

        // Clave de caché
        $cacheKey = $externalId !== ''
            ? 'ext:' . $externalId
            : 'name:' . $tenantCompanyId . ':' . mb_strtolower($name);

        if (isset($listCache[$cacheKey])) {
            return [$listCache[$cacheKey], false, false];
        }

        // Query de búsqueda
        $q = MarketingList::query()->where('company_id', $tenantCompanyId);

        if ($externalId !== '' && $this->marketingListHasColumn('external_id')) {
            $q->where('external_id', $externalId);
        } else {
            $q->where('name', $name);
        }

        $list    = $q->first();
        $created = false;
        $updated = false;

        // Fechas
        $createdAt  = $this->parseDateTimeFromTmp($tmp->created_date);
        $lastUsedAt = $this->parseDateTimeFromTmp($tmp->last_use);

        $slug = $name !== '' ? Str::slug($name) : Str::uuid()->toString();

        if (! $list) {
            $list   = new MarketingList();
            $created = true;

            $list->company_id   = $tenantCompanyId;
            $list->name         = $name !== '' ? $name : 'Lista sin nombre';
            $list->slug         = $slug;
            $list->status       = 1;
            $list->is_dynamic   = $isDynamic;                 // ← boolean, no el string
            $list->members_count = $tmp->num_members ?: 0;
            $list->last_used_at  = $lastUsedAt;
            $list->created_by    = $ownerId;
            $list->updated_by    = $ownerId;
            $list->owner_id      = $ownerId;

            if ($this->marketingListHasColumn('external_id')) {
                $list->external_id = $externalId ?: null;
            }

            if ($createdAt) {
                $list->created_at = $createdAt;
            }

        } else {
            // Actualización “suave”
            $updated = true;

            $list->name          = $name !== '' ? $name : $list->name;
            $list->slug          = $slug;
            // Sólo pisamos is_dynamic si viene algún valor en type
            if ($rawType !== '') {
                $list->is_dynamic = $isDynamic;
            }
            $list->members_count = $tmp->num_members ?? $list->members_count;
            $list->last_used_at  = $lastUsedAt ?: $list->last_used_at;
            $list->updated_by    = $ownerId;
            $list->owner_id      = $ownerId;

            if ($externalId !== '' && $this->marketingListHasColumn('external_id')) {
                $list->external_id = $externalId;
            }
        }

        $list->save();

        $listCache[$cacheKey] = $list;

        return [$list, $created, $updated];
    }

    /**
     * Helper para saber si la tabla marketing_lists tiene cierta columna.
     * (para no reventar si no has creado external_id ahí).
     */
    protected function marketingListHasColumn(string $column): bool
    {
        static $columns = null;

        if ($columns === null) {
            $table = (new MarketingList())->getTable();
            $columns = collect(\Schema::getColumnListing($table))->flip();
        }

        return $columns->has($column);
    }

    /**
     * Enlaza miembros (usuarios / contactos) a la lista.
     * De momento lo dejamos como stub: sin membresías porque
     * no has indicado de dónde salen.
     */
    protected function syncListMembers(
        CrmMarketingListTmp $tmp,
        MarketingList $list
    ): int {
        // Aquí, cuando tengas el mapping, haces:
        // - buscar contactos por algo
        // - rellenar tabla pivot
        return 0;
    }

    /**
     * Marca la fila temporal como procesada, guarda list_id, etc.
     */
    protected function markTmpRowStatus(
        CrmMarketingListTmp $tmp,
        ?MarketingList $list = null
    ): void {
        if ($list && ! $tmp->list_id) {
            $tmp->list_id = $list->id;
        }

        $tmp->save();
    }

    /**
     * Parse genérico de fecha/hora desde la columna tmp (puede ser string o DateTime).
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
     * Punto para lógica “en bruto” si algún día quieres probar cosas sin chunks.
     * NO TOCO TU MÉTODO.
     */
    protected function myLogica()
    {
        $data = CrmMarketingListTmp::all();

        $ownerId = 1;
        $currentCompanyId = 1;

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

            $slug = $r->list_name? Str::slug($r->list_name):'';

            $l = new MarketingList();
            $l->ownerId = $ownerId;
            $l->company_id = $currentCompanyId;
            $l->name = $r->list_name;
            $l->slug = $slug;
            $l->status = 1;
            $l->is_dynamic = $r->type;
            $l->members_count = $r->num_members;
            $l->last_used_at = $r->last_use;
            $l->created_by = $ownerId;
            $l->updated_by = $ownerId;
            $l->created_at = $r->created_date;
            $l->save();

            $r->list_id = $l->id;
            $r->save();
        }
    }
}
