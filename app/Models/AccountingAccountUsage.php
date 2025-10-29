<?php
// app/Models/AccountingAccountUsage.php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AccountingAccountUsage extends Model{
    use HasFactory, SoftDeletes;

    protected $table = 'accounting_account_usages';
    protected $guarded = [];

    protected $casts = [
        'is_default' => 'boolean',
    ];

    /*
    |--------------------------------------------------------------------------
    | Relaciones
    |--------------------------------------------------------------------------
    */
    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function account()
    {
        return $this->belongsTo(AccountingAccount::class, 'account_id');
    }

    // Polimórfica al “contexto”: cliente, proveedor, banco, etc.
    public function context()
    {
        return $this->morphTo(__FUNCTION__, 'context_type', 'context_id');
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

    public function scopeUsage(Builder $q, string $usageCode)
    {
        return $q->where('usage_code', $usageCode);
    }

    public function scopeGlobal(Builder $q)
    {
        return $q->whereNull('context_type')->whereNull('context_id');
    }

    public function scopeForContext(Builder $q, $model)
    {
        if (!$model) {
            return $q->whereNull('context_type')->whereNull('context_id');
        }
        return $q->where('context_type', get_class($model))
                 ->where('context_id', $model->getKey());
    }

    public function scopeDefault(Builder $q)
    {
        return $q->where('is_default', true);
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    /**
     * Resuelve la cuenta para un uso concreto dentro de una empresa y un contexto opcional.
     * Prioriza:
     *  1) Uso por contexto (cliente/proveedor/banco) marcado como default
     *  2) Uso por contexto cualquiera
     *  3) Uso global por empresa (sin contexto) default
     *  4) Uso global cualquiera
     */
    public static function resolveAccountId(int $companyId, string $usageCode, $contextModel = null): ?int
    {
        // 1 y 2: contexto
        if ($contextModel) {
            $base = static::query()
                ->forCompany($companyId)
                ->usage($usageCode)
                ->forContext($contextModel)
                ->orderByDesc('is_default')
                ->orderBy('id');

            $row = $base->first();
            if ($row) return $row->account_id;
        }

        // 3 y 4: global
        $row = static::query()
            ->forCompany($companyId)
            ->usage($usageCode)
            ->global()
            ->orderByDesc('is_default')
            ->orderBy('id')
            ->first();

        return $row ? $row->account_id : null;
    }

    /**
     * Asigna o sustituye la cuenta para un uso y contexto.
     * Respeta la unicidad (company, usage_code, context_key) definida en BD.
     */
    public static function setUsage(int $companyId, string $usageCode, int $accountId, $contextModel = null, bool $isDefault = true, ?string $notes = null): self
    {
        $attrs = [
            'company_id' => $companyId,
            'usage_code' => $usageCode,
            'account_id' => $accountId,
            'is_default' => $isDefault,
            'notes'      => $notes,
        ];

        if ($contextModel) {
            $attrs['context_type'] = get_class($contextModel);
            $attrs['context_id']   = $contextModel->getKey();
        } else {
            $attrs['context_type'] = null;
            $attrs['context_id']   = null;
        }

        // Upsert manual por la clave única lógica
        $existing = static::query()
            ->forCompany($companyId)
            ->usage($usageCode)
            ->when($contextModel, function (Builder $q) use ($contextModel) {
                $q->forContext($contextModel);
            }, function (Builder $q) {
                $q->whereNull('context_type')->whereNull('context_id');
            })
            ->first();

        if ($existing) {
            $existing->fill($attrs)->save();
            return $existing;
        }

        return static::create($attrs);
    }

    /**
     * Elimina el uso definido.
     */
    public static function clearUsage(int $companyId, string $usageCode, $contextModel = null): void
    {
        $q = static::query()->forCompany($companyId)->usage($usageCode);

        if ($contextModel) {
            $q->forContext($contextModel);
        } else {
            $q->whereNull('context_type')->whereNull('context_id');
        }

        $q->delete();
    }
}
