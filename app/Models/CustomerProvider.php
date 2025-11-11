<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class CustomerProvider extends Model{
    /**
     * 1. Creada por.
     * 2. Actualizada por.
     * 3. Relación con la empresa en sesión.
     * 4. Lado de la relación.
     * 5. Relación con cliente.
     * 6. Relación con proveedor.
     */
    
    use SoftDeletes;

    protected $table = 'customer_providers';

    protected $dates = ['deleted_at'];

    protected $fillable = [
        'customer_id',
        'provider_id',
        'created_by',
        'updated_by'
    ];

    protected $casts = [
        'settings'   => 'array'
    ];

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
     * 3. Relación con la empresa en sesión.
     *
     * Devuelve si la empresa $currentCompany actúa como PROVEEDOR del par (el otro es su cliente)
     * y/o como CLIENTE del par (el otro es su proveedor). Considera soft deletes.
     *
     * @return array{customer: bool, provider: bool}
     *  - 'customer' => true  si $currentCompany es provider y $otherCompany es su customer
     *  - 'provider' => true  si $currentCompany es customer y $otherCompany es su provider
     */
    public static function relationBetween(int $currentCompany, int $otherCompany): array{
        $rows = self::query()
            ->select('customer_id','provider_id')
            ->whereNull('deleted_at')
            ->where(function ($q) use ($currentCompany, $otherCompany) {
                $q->where(function ($w) use ($currentCompany, $otherCompany) {
                    // current es PROVIDER, other es CUSTOMER
                    $w->where('provider_id', $currentCompany)
                      ->where('customer_id', $otherCompany);
                })->orWhere(function ($w) use ($currentCompany, $otherCompany) {
                    // current es CUSTOMER, other es PROVIDER
                    $w->where('customer_id', $currentCompany)
                      ->where('provider_id', $otherCompany);
                });
            })
            ->get();

        $asProvider = $rows->contains(function ($r) use ($currentCompany, $otherCompany) {
            return (int)$r->provider_id === $currentCompany && (int)$r->customer_id === $otherCompany;
        });

        $asCustomer = $rows->contains(function ($r) use ($currentCompany, $otherCompany) {
            return (int)$r->customer_id === $currentCompany && (int)$r->provider_id === $otherCompany;
        });

        return [
            'customer' => $asProvider,  // el otro es mi cliente
            'provider' => $asCustomer,  // el otro es mi proveedor
        ];
    }

    /**
     * 4. Lado de la relación.
     *
     * Devuelve el “lado” para usar en UI/rutas:
     * - 'customers'  si current actúa como proveedor del otro
     * - 'providers'  si current actúa como cliente del otro
     * - 'both'       si existen ambas relaciones (ida y vuelta)
     * - null         si no hay relación
     */
    public static function sideForCompanyPair(int $currentCompany, int $otherCompany): ?string{
        $rel = self::relationBetween($currentCompany, $otherCompany);

        if ($rel['customer'] && $rel['provider']) return 'both';
        if ($rel['customer']) return 'customers';
        if ($rel['provider']) return 'providers';
        return null;
    }

    /**
     * 5. Relación con cliente.
     */
    public static function isMyCustomer(int $currentCompany, int $otherCompany): bool{
        return self::relationBetween($currentCompany, $otherCompany)['customer'] === true;
    }

    /**
     * 6. Relación con proveedor.
     */
    public static function isMyProvider(int $currentCompany, int $otherCompany): bool{
        return self::relationBetween($currentCompany, $otherCompany)['provider'] === true;
    }
}
