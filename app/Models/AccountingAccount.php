<?php
// app/Models/AccountingAccount.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

// Models:
use App\Models\AccountingAccountType;
use App\Models\AccountingAccountUsage;
use App\Models\IvaType;
use App\Models\Company;
use App\Models\User;
use App\Models\Currency;

class AccountingAccount extends Model{
    /**
     * 1. Creada por.
     * 2. Actualizada por.
     * 3. Guardar cuenta (manual).
     * 3.1. Prefijo de cuenta contable.
     * 3.2. Sufijo de cuenta contable.
     * 4. Cuentas contables por empresa y modo.
     * 5. Crear cuenta por perfil (auto)
     */

    use HasFactory, SoftDeletes;

    // Tabla y claves
    protected $table = 'accounting_accounts';

    // Sin fillables para evitar sustos; manipula campo a campo o usa $guarded = [];
    protected $guarded = [];

    // Casts
    protected $casts = [
        'is_group'        => 'boolean',
        'reconcile'       => 'boolean',
        'blocked'         => 'boolean',
        'featured'        => 'boolean',
        'opening_balance' => 'decimal:2',
        'status'          => 'integer',
    ];

    // Constantes de naturaleza (sin enum)
    public const NATURE_ASSET     = 'asset';
    public const NATURE_LIABILITY = 'liability';
    public const NATURE_EQUITY    = 'equity';
    public const NATURE_INCOME    = 'income';
    public const NATURE_EXPENSE   = 'expense';

    // Constantes lado normal
    public const SIDE_DEBIT  = 'debit';
    public const SIDE_CREDIT = 'credit';

    /**
     * 1. Creada por.
     */
    public function createdBy(){
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * 2. Actualizada por.
     */
    public function updatedBy(){
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * 3. Guardar cuenta (creación manual tradicional).
     */
    public static function saveAccount(array $data, int $companyId): self{
        $defaultDigits = 5; // TODO: sustituir por setting de empresa cuando exista

        // Normaliza inputs relevantes
        $manual = isset($data['manual_code']) ? trim((string)$data['manual_code']) : '';
        $manual = $manual !== '' ? $manual : null;

        // Flags calculados FUERA (y los pasamos al closure)
        $isGroup   = !empty($data['is_group']);
        $reconcile = !$isGroup && !empty($data['reconcile']);

        return DB::transaction(function () use ($data, $companyId, $manual, $defaultDigits, $isGroup, $reconcile) {

            // 1) Resolver CODE
            if ($manual !== null) {
                $exists = static::query()
                    ->where('company_id', $companyId)
                    ->where('code', $manual)
                    ->lockForUpdate()
                    ->exists();

                if ($exists) {
                    throw ValidationException::withMessages([
                        'manual_code' => [__('codigo_ya_existe_en_empresa')],
                    ]);
                }
                $finalCode = $manual;

            } else {
                // Asistente por niveles
                [$levelId, $prefix] = self::buildPrefixFromLevels($data);
                if (!$levelId || !$prefix) {
                    throw ValidationException::withMessages([
                        'manual_code' => [__('requerido_si_no_asistente')],
                        'level1'      => [__('requerido_si_no_manual')],
                    ]);
                }

                if (!empty($data['digits'])) {
                    $suffix    = (string) $data['digits']; // respeta ceros a la izquierda
                    $finalCode = $prefix . $suffix;
                } else {
                    $finalCode = self::nextSequentialCode($companyId, $prefix, $defaultDigits);
                }

                $dup = static::query()
                    ->where('company_id', $companyId)
                    ->where('code', $finalCode)
                    ->lockForUpdate()
                    ->exists();

                if ($dup) {
                    throw ValidationException::withMessages([
                        'digits' => [__('codigo_ya_existe_intenta_otro')],
                    ]);
                }
            }

            // 2) Jerarquía
            $parent = null;
            $level  = 0;
            if (!empty($data['parent_id'])) {
                $parent = self::query()
                    ->where('company_id', $companyId)
                    ->whereKey($data['parent_id'])
                    ->lockForUpdate()
                    ->first();

                if (!$parent) {
                    throw new \RuntimeException(__('cuenta_padre_no_pertenece_empresa'));
                }
                if (!$parent->is_group) {
                    throw new \RuntimeException(__('cuenta_padre_debe_ser_agrupadora'));
                }
                $level = (int) $parent->level + 1;
            }

            // 3) Crear cuenta
            $ac = new self();
            $ac->company_id   = $companyId;
            $ac->code         = $finalCode;
            $ac->name         = $data['name'];
            $ac->nature       = $data['nature'];
            $ac->normal_side  = self::normalSideByNature($data['nature']);

            // Jerarquía
            $ac->parent_id    = $parent ? $parent->id : null;
            $ac->level        = $level;

            // Grupo / operativa
            $ac->is_group     = $isGroup ? 1 : 0;
            $ac->reconcile    = $isGroup ? 0 : ($reconcile ? 1 : 0);
            $ac->currency_id  = $isGroup ? null : ($data['currency_id'] ?? null);

            // opening_balance NUNCA null
            $ac->opening_balance = $isGroup
                ? 0.0
                : (isset($data['opening_balance']) && $data['opening_balance'] !== ''
                    ? (float) str_replace(',', '.', (string) $data['opening_balance'])
                    : 0.0);

            // Miscelánea
            $ac->status       = !empty($data['status']) ? 1 : 0;
            $ac->notes        = $data['notes'] ?? null;
            $ac->created_by   = Auth::id();
            $ac->updated_by   = Auth::id();

            $ac->save();

            return $ac;
        });
    }

    /**
     * 3.1. Prefijo de cuenta contable (PGC).
     *
     * @return array{0:int|null,1:string|null} [levelId, prefix]
     */
    protected static function buildPrefixFromLevels(array $data): array{
        $levelId = $data['level4'] ?? $data['level3'] ?? $data['level2'] ?? $data['level1'] ?? null;
        if (!$levelId) return [null, null];

        $type = AccountingAccountType::select('id', 'code')->find($levelId);
        if (!$type || $type->code === null || $type->code === '') return [null, null];

        // Prefijo de 4 posiciones, rellenando a la derecha con '0'
        $prefix = str_pad((string)$type->code, 4, '0', STR_PAD_RIGHT);

        return [$levelId, $prefix];
    }

    /**
     * 3.2. Siguiente código secuencial dentro del prefijo.
     */
    protected static function nextSequentialCode(int $companyId, string $prefix, int $defaultDigits): string{
        $last = static::query()
            ->where('company_id', $companyId)
            ->where('code', 'like', $prefix . '%')
            ->orderByRaw('LENGTH(code) DESC')
            ->orderBy('code', 'DESC')
            ->lockForUpdate()
            ->first();

        if ($last && isset($last->code) && strpos($last->code, $prefix) === 0) {
            $suffix = substr($last->code, 4); // todo lo que sigue al prefijo
            $width  = max(strlen($suffix), $defaultDigits);
            $next   = (int) ltrim($suffix, '0');

            $next++;
            $suffixNext = str_pad((string)$next, $width, '0', STR_PAD_LEFT);

            return $prefix . $suffixNext;
        }

        // No existe ninguna: construye 000..001 con ancho defaultDigits
        $suffix = str_pad('1', $defaultDigits, '0', STR_PAD_LEFT);
        return $prefix . $suffix;
    }

    /**
     * 4. Cuentas contables por empresa y modo.
     */
    public static function getAccountingAccountsByLevel($company_id, $level = false){
        $data = AccountingAccount::select('id', DB::raw("CONCAT(code, ' - ', name) as accounting_account"))
            ->where('company_id', $company_id)
            ->where('status', 1)
            ->when($level, function ($q) use ($level) {
                $q->where('level', $level);
            })
            ->get();

        return $data;
    }


    /*
    |--------------------------------------------------------------------------
    | Relaciones
    |--------------------------------------------------------------------------
    */
    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function parent()
    {
        return $this->belongsTo(self::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(self::class, 'parent_id')->orderBy('code');
    }

    public function currency()
    {
        return $this->belongsTo(Currency::class, 'currency_id');
    }

    // Usos asociados (clientes, proveedores, bancos, perfiles globales, etc.)
    public function usages()
    {
        return $this->hasMany(AccountingAccountUsage::class, 'account_id');
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */
    public function scopeForCompany(Builder $q, $companyId)
    {
        return $q->where('company_id', $companyId);
    }

    public function scopeGroups(Builder $q)
    {
        return $q->where('is_group', true);
    }

    public function scopePostable(Builder $q)
    {
        return $q->where('is_group', false);
    }

    public function scopeNature(Builder $q, string $nature)
    {
        return $q->where('nature', $nature);
    }

    public function scopeConciliable(Builder $q, bool $yes = true)
    {
        return $q->where('reconcile', $yes);
    }

    public function scopeActive(Builder $q)
    {
        return $q->where('status', 1)->whereNull('deleted_at');
    }

    public function scopeSearch(Builder $q, ?string $term)
    {
        if (!$term) return $q;
        $t = trim($term);
        return $q->where(function (Builder $qq) use ($t) {
            $qq->where('code', 'like', "%{$t}%")
               ->orWhere('name', 'like', "%{$t}%");
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Accessors / Helpers
    |--------------------------------------------------------------------------
    */
    // Compatibles con 7.4+: getters estilo clásico
    public function getIsPostableAttribute(): bool
    {
        return !$this->is_group;
    }

    public function getPathAttribute(): string
    {
        // Camino de códigos padres->hijo, útil para mostrar árbol
        $segments = [];
        $node = $this;
        while ($node) {
            $segments[] = $node->code;
            $node = $node->parent;
        }
        return implode(' / ', array_reverse($segments));
    }

    public function expectsDebit(): bool
    {
        return $this->normal_side === self::SIDE_DEBIT;
    }

    public function expectsCredit(): bool
    {
        return $this->normal_side === self::SIDE_CREDIT;
    }

    public function isConciliable(): bool
    {
        return (bool) $this->reconcile;
    }

    public function isBlocked(): bool
    {
        return (bool) $this->blocked;
    }

    public function canPost(): bool
    {
        return !$this->is_group && !$this->blocked;
    }

    public static function natureCodes(): array
    {
        return [
            self::NATURE_ASSET,
            self::NATURE_LIABILITY,
            self::NATURE_EQUITY,
            self::NATURE_INCOME,
            self::NATURE_EXPENSE,
        ];
    }

    public static function natureLabels(?callable $t = null): array
    {
        $t = $t ?: fn ($k) => $k;

        return [
            self::NATURE_ASSET     => __('activos'),
            self::NATURE_LIABILITY => __('pasivos'),
            self::NATURE_EQUITY    => __('patrimonio_neto'),
            self::NATURE_INCOME    => __('ingresos'),
            self::NATURE_EXPENSE   => __('gastos'),
        ];
    }

    public static function normalSideByNature(string $nature): ?string
    {
        return in_array($nature, [self::NATURE_ASSET, self::NATURE_EXPENSE], true)
            ? self::SIDE_DEBIT
            : (in_array($nature, [self::NATURE_LIABILITY, self::NATURE_EQUITY, self::NATURE_INCOME], true)
                ? self::SIDE_CREDIT
                : null);
    }

    /*
    |--------------------------------------------------------------------------
    | Lifecycle hooks
    |--------------------------------------------------------------------------
    */
    protected static function booted()
    {
        static::saving(function (self $model) {
            // Si tiene padre, calcula level = parent.level + 1; si no, 0
            if ($model->parent_id) {
                if (!$model->relationLoaded('parent')) {
                    $model->load('parent');
                }
                $parent = $model->parent;
                $model->level = $parent ? (int) $parent->level + 1 : 0;
            } else {
                $model->level = $model->level ?? 0;
            }

            // Reglas varias omitidas (ver versión anterior para endurecer)
        });
    }

    /*
    |--------------------------------------------------------------------------
    | Operaciones administrativas (stubs utilitarios)
    |--------------------------------------------------------------------------
    */
    public function renumber(string $newCode): void
    {
        // Valida unicidad por empresa fuera, antes de guardar
        $this->code = $newCode;
        $this->save();
    }

    public function block(): void
    {
        $this->blocked = true;
        $this->save();
    }

    public function unblock(): void
    {
        $this->blocked = false;
        $this->save();
    }

    public function mergeInto(AccountingAccount $target): void
    {
        $this->blocked = true;
        $this->status  = 0;
        $this->save();
    }

    /*
    |--------------------------------------------------------------------------
    | 5) Creación de cuentas automáticas por PERFIL (IVA, customer, supplier, bank, ...)
    |--------------------------------------------------------------------------
    | Entrada (ejemplos):
    |   - IVA:      ['profile'=>'iva','side'=>'output','iva_type_id'=>X,'code'=>?,'name'=>...]
    |   - Cliente:  ['profile'=>'customer','entity_id'=>X,'code'=>?,'name'=>...]
    |   - Proveedor:['profile'=>'supplier','entity_id'=>X,'code'=>?,'name'=>...]
    |   - Banco:    ['profile'=>'bank','bank_id'=>X,'code'=>?,'name'=>...]
    */
    public static function createForProfile(int $companyId, array $data): self{
        // Deriva plantilla de naturaleza/lado/usage
        $tpl = self::resolveProfileTemplate($data);

        return DB::transaction(function () use ($companyId, $data, $tpl) {

            // 1) Resolver CODE (único por empresa si viene; si no, autogenerar por perfil)
            $finalCode = null;
            $manual    = isset($data['code']) ? trim((string)$data['code']) : '';

            if ($manual !== '') {
                $exists = static::query()
                    ->where('company_id', $companyId)
                    ->where('code', $manual)
                    ->lockForUpdate()
                    ->exists();

                if ($exists) {
                    throw ValidationException::withMessages([
                        'code' => [__('codigo_ya_existe_en_empresa')],
                    ]);
                }
                $finalCode = $manual;
            } else {
                $finalCode = self::autoCodeForProfile($companyId, $tpl, 5); // defaultDigits=5
            }

            // 2) Crear cuenta
            $account = new self();
            $account->company_id      = $companyId;
            $account->code            = $finalCode; // puede ser null si así lo decides
            $account->name            = (string) ($data['name'] ?? '');
            $account->nature          = $tpl['nature'];
            $account->normal_side     = $tpl['normal_side'];
            $account->is_group        = 0;
            $account->reconcile       = !empty($tpl['reconcile']);
            $account->currency_id     = null;
            $account->opening_balance = 0.0;
            $account->status          = 1;
            $account->notes           = $data['notes'] ?? null;
            $account->created_by      = Auth::id();
            $account->updated_by      = Auth::id();
            $account->save();

            // 3) Vincular USO (usage): clave por company + usage_code + contexto (+ side si aplica)
            $usageWhere = [
                'company_id'   => $companyId,
                'usage_code'   => $tpl['usage_code'],
                'context_type' => $tpl['context_type'],
                'context_id'   => $tpl['context_id'],
            ];
            if (isset($tpl['side'])) {
                $usageWhere['side'] = $tpl['side'];
            }

            // Valores a actualizar/crear (no enviar context_key: es columna generada)
            $values = [
                'account_id' => $account->id,
                'is_default' => $tpl['is_default'] ?? 0,
                'locked'     => $tpl['locked'] ?? 0,
                'notes'      => $tpl['usage_notes'] ?? null,
                'created_by' => Auth::id(),
                'updated_by' => Auth::id(),
            ];

            // 👇 Relleno espejo para front antiguo: iva_type_id = context_id cuando es IVA
            if ($tpl['usage_code'] === 'iva') {
                $values['iva_type_id'] = $tpl['context_id'];
            }

            AccountingAccountUsage::updateOrCreate($usageWhere, $values);

            return $account;
        });
    }

    /**
     * Deriva plantilla por perfil: nature, normal_side, reconcile y metadatos de uso.
     * $data['profile'] obligatorio. Para IVA se requiere $data['side'] y $data['iva_type_id'].
     */
    protected static function resolveProfileTemplate(array $data): array
    {
        $profile = (string) ($data['profile'] ?? '');

        // Valores por defecto
        $tpl = [
            'usage_code'  => null,
            'context_type'=> null,
            'context_id'  => null,
            'context_key' => null,
            'side'        => null,
            'nature'      => null,
            'normal_side' => null,
            'reconcile'   => false,
            'is_default'  => 0,
            'locked'      => 0,
        ];

        switch ($profile) {
            case 'iva':
                // Requiere lado y tipo de IVA
                $side = (string) ($data['side'] ?? '');
                if (!in_array($side, ['input','output'], true)) {
                    throw new \InvalidArgumentException('IVA: lado inválido');
                }
                $ivaTypeId = isset($data['iva_type_id']) ? (int) $data['iva_type_id'] : 0;
                if ($ivaTypeId <= 0) {
                    throw new \InvalidArgumentException('IVA: tipo requerido');
                }

                $tpl['usage_code']  = 'iva';
                $tpl['context_type']= IvaType::class;
                $tpl['context_id']  = $ivaTypeId;
                $tpl['side']        = $side;
                $tpl['nature']      = $side === 'output' ? self::NATURE_LIABILITY : self::NATURE_ASSET;
                $tpl['normal_side'] = $side === 'output' ? self::SIDE_CREDIT   : self::SIDE_DEBIT;
                $tpl['reconcile']   = false;
                break;

            case 'customer':
                $tpl['usage_code']  = 'customer';
                $tpl['context_type']= \App\Models\CrmAccount::class; // ajusta a tu modelo real
                $tpl['context_id']  = isset($data['entity_id']) ? (int)$data['entity_id'] : null;
                $tpl['nature']      = self::NATURE_ASSET;
                $tpl['normal_side'] = self::SIDE_DEBIT;
                $tpl['reconcile']   = true;
                break;

            case 'supplier':
                $tpl['usage_code']  = 'supplier';
                $tpl['context_type']= \App\Models\CrmAccount::class;
                $tpl['context_id']  = isset($data['entity_id']) ? (int)$data['entity_id'] : null;
                $tpl['nature']      = self::NATURE_LIABILITY;
                $tpl['normal_side'] = self::SIDE_CREDIT;
                $tpl['reconcile']   = true;
                break;

            case 'bank':
                $tpl['usage_code']  = 'bank';
                $tpl['context_type']= \App\Models\Bank::class; // ajusta si procede
                $tpl['context_id']  = isset($data['bank_id']) ? (int)$data['bank_id'] : null;
                $tpl['nature']      = self::NATURE_ASSET;
                $tpl['normal_side'] = self::SIDE_DEBIT;
                $tpl['reconcile']   = true;
                break;

            case 'cash':
                $tpl['usage_code']  = 'cash';
                $tpl['context_type']= null;
                $tpl['context_id']  = null;
                $tpl['nature']      = self::NATURE_ASSET;
                $tpl['normal_side'] = self::SIDE_DEBIT;
                $tpl['reconcile']   = true;
                break;

            default:
                throw new \InvalidArgumentException('Perfil no soportado: ' . $profile);
        }

        return $tpl;
    }

    /**
     * Generación automática de código cuando no se envía uno manual.
     * Ajusta prefijos por perfil/side. Override por config():
     *  - accounting.iva_output_prefix (defecto '4770')
     *  - accounting.iva_input_prefix  (defecto '4720')
     */
    protected static function autoCodeForProfile(int $companyId, array $tpl, int $defaultDigits): ?string
    {
        // Si no quieres autogenerar para algún perfil, devuelve null y listo.
        $prefix = null;

        if ($tpl['usage_code'] === 'iva') {
            // IVA: 4770x... (repercutido) / 4720x... (soportado)
            $prefix = $tpl['side'] === 'output'
                ? (string) (config('accounting.iva_output_prefix', '4770'))
                : (string) (config('accounting.iva_input_prefix',  '4720'));
        } elseif ($tpl['usage_code'] === 'customer') {
            $prefix = (string) (config('accounting.customer_prefix', '4300'));
        } elseif ($tpl['usage_code'] === 'supplier') {
            $prefix = (string) (config('accounting.supplier_prefix', '4000'));
        } elseif ($tpl['usage_code'] === 'bank') {
            $prefix = (string) (config('accounting.bank_prefix', '5720'));
        } elseif ($tpl['usage_code'] === 'cash') {
            $prefix = (string) (config('accounting.cash_prefix', '5700'));
        }

        if ($prefix === null || $prefix === '') {
            return null; // permite crear sin código si así lo decides
        }

        // Asegura longitud mínima 4 para reciclar nextSequentialCode()
        $prefix = str_pad($prefix, 4, '0', STR_PAD_RIGHT);

        return self::nextSequentialCode($companyId, $prefix, $defaultDigits);
    }
}
