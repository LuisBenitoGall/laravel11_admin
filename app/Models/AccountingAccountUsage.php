<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class AccountingAccountUsage extends Model{
    use SoftDeletes;

    protected $table = 'accounting_account_usages';

    // Evita “string mágicos” en todo el código
    public const SIDE_OUTPUT = 'output'; // Repercutido
    public const SIDE_INPUT  = 'input';  // Soportado

    protected $fillable = [
        'company_id',
        'account_id',          // tu columna se llama account_id (no accounting_account_id)
        'usage_code',
        'context_type',
        'context_id',
        'is_default',
        'notes',
        'context_key',
        'iva_type_id',
        'side',
        'locked',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'is_default' => 'bool',
        'locked'     => 'bool',
    ];

    /* --------------------------------
     | Relaciones
     | -------------------------------*/

    public function account(){
        // Ajusta el namespace si tu modelo se llama distinto
        return $this->belongsTo(AccountingAccount::class, 'account_id');
    }

    public function ivaType(){
        return $this->belongsTo(IvaType::class, 'iva_type_id');
    }

    // Por si usas el usage en otros contextos (polimórfico opcional)
    public function context(){
        return $this->morphTo(__FUNCTION__, 'context_type', 'context_id');
    }

    /* --------------------------------
     | Scopes útiles
     | -------------------------------*/

    public function scopeCompany($query, int $companyId)
    {
        return $query->where('company_id', $companyId);
    }

    public function scopeSide($query, string $side)
    {
        return $query->where('side', $side);
    }

    public function scopeIva($query, $ivaTypeId)
    {
        return $query->where('iva_type_id', $ivaTypeId);
    }

    public function scopeForIvaSet($query, $ivaTypeIds){
        $ids = collect($ivaTypeIds)
        ->map(function ($v) {
            if (is_array($v))  return $v['id'] ?? null;
            if (is_object($v)) return $v->id ?? null;
            return $v;
        })
        ->filter()
        ->unique()
        ->values()
        ->all();

        if (empty($ids)) {
            // nada que buscar; evita whereIn([]) según el driver
            return $query->whereRaw('1 = 0');
        }

        return $query->whereIn('iva_type_id', $ids);
    }

    protected static function booted(){
        static::saving(function (self $m) {
            // Si es un usage de IVA y falta el espejo, complétalo
            if ($m->usage_code === 'iva' && $m->context_type === \App\Models\IvaType::class) {
                if (empty($m->iva_type_id)) {
                    $m->iva_type_id = $m->context_id ?: null;
                }
            }
        });
    }
}
