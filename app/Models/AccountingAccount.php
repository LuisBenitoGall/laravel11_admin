<?php
// app/Models/AccountingAccount.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Support\ToBool;

class AccountingAccount extends Model{
    /**
     * 1. Creada por.
     * 2. Actualizada por.
     * 3. Guardar cuenta.
     * 4. Cuentas contables por empresa y modo.
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
     * 3. Guardar cuenta.
     */
    public static function saveAccount(array $data, int $companyId): self{

        $code = trim((string)($data['code'] ?? $data['manual_code'] ?? ''));
        $code = $code !== '' ? $code : null;

        return DB::transaction(function () use ($data, $companyId, $code){
            $ac = new AccountingAccount();
            $ac->company_id         = $companyId;
            $ac->code               = $code;
            $ac->name               = $data['name'];
            $ac->level              = $data['level'];
            $ac->nature             = $data['nature'];
            $ac->normal_side        = self::normalSideByNature($data['nature']);

            $ac->currency_id         = $data['currency_id'] ?? null;


            $ac->status             = ToBool::cast($data['status']   ?? null, false);
            $ac->notes              = $data['notes'] ?? null;
            $ac->created_by         = Auth::id();
            $ac->updated_by         = Auth::id();
            $ac->save();

            return $ac;
        });
    }

    /**
     * 4. Cuentas contables por empresa y modo.
     */
    public static function getAccountingAccountsByLevel($company_id, $level = false){
        $data = AccountingAccount::select('id', DB::raw("CONCAT(code, ' - ', name) as accounting_account"))
        ->where('company_id', $company_id)
        ->where('status', 1)
        ->when($level, function($q) use($level) {
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
        // Evita N+1: si vas a usar masivo, precarga parent recursivo con técnica adecuada
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

    public static function natureCodes(): array{
        return [
            self::NATURE_ASSET,
            self::NATURE_LIABILITY,
            self::NATURE_EQUITY,
            self::NATURE_INCOME,
            self::NATURE_EXPENSE,
        ];
    }

    public static function natureLabels(?callable $t = null): array{
        // $t es un closure de traducción opcional: fn($key) => __('...')
        $t = $t ?: fn ($k) => $k;

        return [
            self::NATURE_ASSET     => __('activos'),
            self::NATURE_LIABILITY => __('pasivos'),
            self::NATURE_EQUITY    => __('patrimonio_neto'),
            self::NATURE_INCOME    => __('ingresos'),
            self::NATURE_EXPENSE   => __('gastos'),
        ];
    }

    public static function normalSideByNature(string $nature): ?string{
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
            // Reglas rápidas de integridad

            // Si tiene padre, calcula level = parent.level + 1; si no, 0
            if ($model->parent_id) {
                if (!$model->relationLoaded('parent')) {
                    $model->load('parent');
                }
                $parent = $model->parent;
                $model->level = $parent ? (int) $parent->level + 1 : 0;

                // Naturaleza del hijo debe ser compatible con el árbol
                if ($parent && $parent->nature !== $model->nature) {
                    // Permitimos diferencias solo si el padre es agrupador.
                    // Si quieres forzar igualdad estricta, descomenta exception.
                    // throw new \RuntimeException('La naturaleza del hijo debe coincidir con la del padre.');
                }
            } else {
                $model->level = $model->level ?? 0;
            }

            // No permitir marcar como grupo una cuenta ya postable con usos
            if ($model->isDirty('is_group') && $model->is_group === true) {
                // Aquí podrías chequear si tiene movimientos en mayor
                // if ($model->hasLedgerEntries()) throw new \RuntimeException('No se puede convertir en grupo: ya tiene apuntes.');
            }

            // Si la cuenta es conciliable y no tiene currency_id, ok; si tiene currency_id y es no conciliable, lo permitimos pero no es lo ideal.
            // Endurecer regla si quieres:
            // if ($model->currency_id && !$model->reconcile) throw new \RuntimeException('Solo las cuentas conciliables pueden tener currency_id.');
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
        // Aquí iría la lógica de mover apuntes, concilios y usos a $target.
        // Dejar como stub para no inventar el mayor.
        // $this->moveLedgerEntriesTo($target);
        // $this->usages()->update(['account_id' => $target->id]);
        $this->blocked = true;
        $this->status  = 0;
        $this->save();
    }
}
