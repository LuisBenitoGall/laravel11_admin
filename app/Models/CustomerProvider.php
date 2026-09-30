<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use InvalidArgumentException;

class CustomerProvider extends Model
{
    /**
     * 1. Creada por.
     * 2. Actualizada por.
     * 3. Relación con la empresa en sesión.
     * 4. Lado de la relación.
     * 5. Relación con cliente.
     * 6. Relación con proveedor.
     * 7. Cliente empresa / particular / proveedor.
     * 8. Asegurar CP (XOR).
     * 9. Cliente particular de la sesión.
     */

    use SoftDeletes;

    protected $table = 'customer_providers';

    protected $dates = ['deleted_at'];

    protected $fillable = [
        'customer_id',
        'user_customer_id',
        'provider_id',
        'status',
        'default_currency_id',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'settings' => 'array',
    ];

    protected static function booted(): void
    {
        static::saving(function (self $model) {
            $hasCompany = $model->customer_id !== null;
            $hasUser = $model->user_customer_id !== null;
            if ($hasCompany === $hasUser) {
                throw new InvalidArgumentException(
                    'customer_providers XOR: exactamente uno de customer_id / user_customer_id'
                );
            }
            if ($hasCompany && (int) $model->customer_id === (int) $model->provider_id) {
                throw new InvalidArgumentException(
                    'customer_providers: customer_id no puede coincidir con provider_id'
                );
            }
        });
    }

    /**
     * 1. Creada por.
     */
    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * 2. Actualizada por.
     */
    public function updatedBy()
    {
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
    public static function relationBetween(int $currentCompany, int $otherCompany): array
    {
        $rows = self::query()
            ->select('customer_id', 'provider_id')
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
            return (int) $r->provider_id === $currentCompany && (int) $r->customer_id === $otherCompany;
        });

        $asCustomer = $rows->contains(function ($r) use ($currentCompany, $otherCompany) {
            return (int) $r->customer_id === $currentCompany && (int) $r->provider_id === $otherCompany;
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
    public static function sideForCompanyPair(int $currentCompany, int $otherCompany): ?string
    {
        $rel = self::relationBetween($currentCompany, $otherCompany);

        if ($rel['customer'] && $rel['provider']) {
            return 'both';
        }
        if ($rel['customer']) {
            return 'customers';
        }
        if ($rel['provider']) {
            return 'providers';
        }

        return null;
    }

    /**
     * 5. Relación con cliente.
     */
    public static function isMyCustomer(int $currentCompany, int $otherCompany): bool
    {
        return self::relationBetween($currentCompany, $otherCompany)['customer'] === true;
    }

    /**
     * 6. Relación con proveedor.
     */
    public static function isMyProvider(int $currentCompany, int $otherCompany): bool
    {
        return self::relationBetween($currentCompany, $otherCompany)['provider'] === true;
    }

    /**
     * 7. Cliente empresa / particular / proveedor.
     */
    public function customer()
    {
        return $this->belongsTo(Company::class, 'customer_id');
    }

    public function userCustomer()
    {
        return $this->belongsTo(User::class, 'user_customer_id');
    }

    public function provider()
    {
        return $this->belongsTo(Company::class, 'provider_id');
    }

    /**
     * 8. Asegurar CP empresa–empresa (idempotente).
     */
    public static function ensureCompanyCustomer(int $customerId, int $providerId, ?int $actorId = null): self
    {
        return self::firstOrCreate(
            [
                'customer_id' => $customerId,
                'provider_id' => $providerId,
            ],
            [
                'user_customer_id' => null,
                'created_by' => $actorId,
                'updated_by' => $actorId,
            ]
        );
    }

    /**
     * 8.1. Asegurar CP particular–empresa (idempotente).
     */
    public static function ensureUserCustomer(int $userId, int $providerId, ?int $actorId = null): self
    {
        return self::firstOrCreate(
            [
                'user_customer_id' => $userId,
                'provider_id' => $providerId,
            ],
            [
                'customer_id' => null,
                'created_by' => $actorId,
                'updated_by' => $actorId,
            ]
        );
    }

    /**
     * 9. Cliente particular de la empresa en sesión (provider).
     */
    public static function isMyCustomerUser(int $providerId, int $userId): bool
    {
        return self::query()
            ->whereNull('deleted_at')
            ->where('provider_id', $providerId)
            ->where('user_customer_id', $userId)
            ->whereNull('customer_id')
            ->exists();
    }
}
