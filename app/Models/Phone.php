<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use libphonenumber\PhoneNumberUtil;
use libphonenumber\PhoneNumberFormat;

class Phone extends Model{
    use SoftDeletes;

    protected $table = 'phones';

    protected $dates = ['deleted_at', 'verified_at', 'created_at', 'updated_at'];

    protected $fillable = [
        'phoneable_type',
        'phoneable_id',
        'e164',
        'country_id',
        'ext',
        'type',
        'label',
        'is_primary',
        'is_whatsapp',
        'is_verified',
        'verified_at',
        'notes',
    ];

    protected $casts = [
        'is_primary'  => 'boolean',
        'is_whatsapp' => 'boolean',
        'is_verified' => 'boolean',
    ];

    public function phoneable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Añade o actualiza los teléfonos proporcionados para un owner.
     * - No toca teléfonos no mencionados (modo no destructivo).
     * - Garantiza 1 primario por owner.
     *
     * @param Model $owner User|Company|CrmContact
     * @param array $items lista de strings u objetos con metadatos
     * @param array $options ['default_region' => 'ES']
     * @return \Illuminate\Support\Collection<Phone>
     */
    public static function addOrUpdateFor(Model $owner, array $items, array $options = []): Collection{
        return DB::transaction(function () use ($owner, $items, $options) {
            [$normalized, $wantsPrimaryAny] = static::normalizeItems($items, $options);

            // Dedupe por e164 manteniendo el primero
            $seen = [];
            $filtered = [];
            foreach ($normalized as $row) {
                if (!isset($seen[$row['e164']])) {
                    $filtered[] = $row;
                    $seen[$row['e164']] = true;
                }
            }

            $ownerKey = [
                'phoneable_type' => get_class($owner),
                'phoneable_id'   => $owner->getKey(),
            ];

            $createdOrUpdated = [];

            foreach ($filtered as $row) {
                // Buscar existente (incluye soft-deleted) por owner + e164
                /** @var Phone|null $existing */
                $existing = static::withTrashed()
                    ->where($ownerKey)
                    ->where('e164', $row['e164'])
                    ->first();

                if ($existing) {
                    if ($existing->trashed()) {
                        $existing->restore();
                    }

                    // Actualizar metadatos
                    $existing->fill([
                        'type'        => $row['type'],
                        'label'       => $row['label'],
                        'ext'         => $row['ext'],
                        'is_whatsapp' => $row['is_whatsapp'],
                        // is_primary se gestiona luego para garantizar unicidad
                    ]);

                    // Aplicar is_primary de la entrada, si viene
                    if ($row['is_primary'] === true) {
                        static::unsetPrimaryForOwner($owner);
                        $existing->is_primary = true;
                    }

                    $existing->save();
                    $createdOrUpdated[] = $existing;
                } else {
                    // Crear nuevo
                    $phone = new static();
                    $phone->fill(array_merge($ownerKey, [
                        'e164'        => $row['e164'],
                        'country_id'  => null, // por decisión tuya, no mapeamos
                        'type'        => $row['type'],
                        'label'       => $row['label'],
                        'ext'         => $row['ext'],
                        'is_whatsapp' => $row['is_whatsapp'],
                        'is_verified' => false,
                        'verified_at' => null,
                        'is_primary'  => false, // lo resolvemos luego
                    ]));

                    $phone->save();

                    if ($row['is_primary'] === true) {
                        static::unsetPrimaryForOwner($owner);
                        $phone->is_primary = true;
                        $phone->save();
                    }

                    $createdOrUpdated[] = $phone;
                }
            }

            // Si no hay primario aún, y el owner no tenía ninguno, promueve el primero creado/actualizado
            if (!$wantsPrimaryAny && !static::ownerHasPrimary($owner) && count($createdOrUpdated) > 0) {
                static::unsetPrimaryForOwner($owner);
                $first = $createdOrUpdated[0];
                $first->is_primary = true;
                $first->save();
            }

            return static::forOwner($owner)->get();
        });
    }

    /**
     * Sincroniza: tras la operación, el owner tendrá exactamente los números enviados.
     * - Crea nuevos y restaura soft-deleted.
     * - Actualiza metadatos de los existentes.
     * - Soft-delete de los no enviados.
     * - Garantiza 1 primario por owner.
     *
     * @param Model $owner
     * @param array $items
     * @param array $options
     * @return \Illuminate\Support\Collection<Phone>
     */
    public static function syncFor(Model $owner, array $items, array $options = []): Collection{
        return DB::transaction(function () use ($owner, $items, $options) {
            [$normalized, $wantsPrimaryAny] = static::normalizeItems($items, $options);

            // Dedupe por e164 manteniendo el primero
            $seen = [];
            $filtered = [];
            foreach ($normalized as $row) {
                if (!isset($seen[$row['e164']])) {
                    $filtered[] = $row;
                    $seen[$row['e164']] = true;
                }
            }

            $ownerKey = [
                'phoneable_type' => get_class($owner),
                'phoneable_id'   => $owner->getKey(),
            ];

            $keptE164 = [];

            // Upsert-like manual respetando soft-deletes y el unique compuesto
            foreach ($filtered as $row) {
                /** @var Phone|null $existing */
                $existing = static::withTrashed()
                    ->where($ownerKey)
                    ->where('e164', $row['e164'])
                    ->first();

                if ($existing) {
                    if ($existing->trashed()) {
                        $existing->restore();
                    }
                    $existing->fill([
                        'type'        => $row['type'],
                        'label'       => $row['label'],
                        'ext'         => $row['ext'],
                        'is_whatsapp' => $row['is_whatsapp'],
                    ]);
                    // is_primary se resolverá tras el loop
                    $existing->save();
                    $keptE164[] = $existing->e164;
                } else {
                    $phone = new static();
                    $phone->fill(array_merge($ownerKey, [
                        'e164'        => $row['e164'],
                        'country_id'  => null,
                        'type'        => $row['type'],
                        'label'       => $row['label'],
                        'ext'         => $row['ext'],
                        'is_whatsapp' => $row['is_whatsapp'],
                        'is_verified' => false,
                        'verified_at' => null,
                        'is_primary'  => false,
                    ]));
                    $phone->save();
                    $keptE164[] = $phone->e164;
                }
            }

            // Soft-delete de los no incluidos
            static::forOwner($owner)
                ->whereNotIn('e164', $keptE164)
                ->get()
                ->each(function (Phone $p) {
                    $p->delete();
                });

            // Resolver primario único
            // 1) Si alguno en la entrada marcaba is_primary, deja solo el primero como primary
            if ($wantsPrimaryAny) {
                static::unsetPrimaryForOwner($owner);
                foreach ($filtered as $row) {
                    if ($row['is_primary']) {
                        $target = static::forOwner($owner)->where('e164', $row['e164'])->first();
                        if ($target) {
                            $target->is_primary = true;
                            $target->save();
                            break;
                        }
                    }
                }
            }

            // 2) Si no había ninguno marcado y el owner sigue sin primario, promueve el primero que exista
            if (!static::ownerHasPrimary($owner)) {
                $first = static::forOwner($owner)->orderBy('id')->first();
                if ($first) {
                    $first->is_primary = true;
                    $first->save();
                }
            }

            return static::forOwner($owner)->get();
        });
    }

    /**
     * Normaliza un array mixto de items a estructura interna.
     * Reglas:
     *  - Trim y colapsado de espacios.
     *  - E164 obligatorio; si no se puede parsear, se ignora la entrada.
     *  - type: mobile|landline|other (desconocidos → other).
     *  - is_whatsapp: boolean.
     *  - is_primary: boolean (se usa en resolución posterior).
     *
     * @param array $items
     * @param array $options ['default_region' => 'ES']
     * @return array [array $normalizedRows, bool $wantsPrimaryAny]
     */
    protected static function normalizeItems(array $items, array $options = []): array{
        $defaultRegion = $options['default_region'] ?? 'ES';
        $util = PhoneNumberUtil::getInstance();

        $normalized = [];
        $wantsPrimaryAny = false;

        foreach ($items as $item) {
            // Acepta string u objeto/array
            if (is_string($item)) {
                $raw = static::trimAllWhitespace($item);
                if ($raw === '') {
                    continue;
                }
                $e164 = static::toE164OrNull($util, $raw, $defaultRegion);
                if ($e164 === null) {
                    // ignorar si no parsea
                    continue;
                }

                $normalized[] = [
                    'e164'        => $e164,
                    'type'        => 'mobile',
                    'label'       => null,
                    'ext'         => null,
                    'is_whatsapp' => false,
                    'is_primary'  => false,
                ];
                continue;
            }

            if (is_array($item)) {
                $raw = isset($item['number']) ? static::trimAllWhitespace((string) $item['number']) : '';
                if ($raw === '') {
                    continue;
                }
                $e164 = static::toE164OrNull($util, $raw, $defaultRegion);
                if ($e164 === null) {
                    // ignorar si no parsea
                    continue;
                }

                $type = isset($item['type']) ? strtolower((string) $item['type']) : 'mobile';
                if (!in_array($type, ['mobile', 'landline', 'other'], true)) {
                    $type = 'other';
                }

                $row = [
                    'e164'        => $e164,
                    'type'        => $type,
                    'label'       => isset($item['label']) ? (string) $item['label'] : null,
                    'ext'         => isset($item['ext']) ? (string) $item['ext'] : null,
                    'is_whatsapp' => (bool) ($item['is_whatsapp'] ?? false),
                    'is_primary'  => (bool) ($item['is_primary'] ?? false),
                ];

                if ($row['is_primary']) {
                    $wantsPrimaryAny = true;
                }

                $normalized[] = $row;
            }
        }

        // Si hay varios con is_primary = true, solo el primero retiene el flag; el resto se apagan
        $foundPrimary = false;
        foreach ($normalized as &$row) {
            if ($row['is_primary'] && !$foundPrimary) {
                $foundPrimary = true;
            } else {
                $row['is_primary'] = false;
            }
        }
        unset($row);

        return [$normalized, $wantsPrimaryAny];
    }

    protected static function toE164OrNull(PhoneNumberUtil $util, string $raw, string $defaultRegion): ?string{
        try {
            // Permite números con o sin prefijo de país
            $parsed = $util->parse($raw, $defaultRegion);
            if (!$util->isValidNumber($parsed)) {
                return null;
            }
            return $util->format($parsed, PhoneNumberFormat::E164);
        } catch (\Throwable $e) {
            return null;
        }
    }

    protected static function trimAllWhitespace(string $value): string{
        // quita espacios, tabs y similares en todo el string
        $value = preg_replace('/\s+/u', '', $value ?? '');
        // normaliza posibles separadores raros
        return trim($value ?? '');
    }

    /**
     * Quita la marca de primario a todos los teléfonos del owner.
     */
    protected static function unsetPrimaryForOwner(Model $owner): void{
        static::forOwner($owner)->where('is_primary', true)->update(['is_primary' => false]);
    }

    protected static function ownerHasPrimary(Model $owner): bool{
        return static::forOwner($owner)->where('is_primary', true)->exists();
    }

    /**
     * Scope helper para owner.
     */
    public function scopeForOwner($query, Model $owner){
        return $query->where('phoneable_type', get_class($owner))
                     ->where('phoneable_id', $owner->getKey());
    }

    public function phones(){
        // Orden: primero el primario, luego por id
        return $this->morphMany(Phone::class, 'phoneable')
            ->orderByDesc('is_primary')
            ->orderBy('id');
    }

    /** Útil para no repetir lógica en vistas */
    public function primaryPhone(): ?string{
        $p = $this->phones->firstWhere('is_primary', true) ?: $this->phones->first();
        return $p?->e164;
    }

}
