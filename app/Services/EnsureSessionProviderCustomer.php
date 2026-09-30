<?php

namespace App\Services;

use App\Models\CustomerProvider;
use App\Support\CompanyContext;
use Illuminate\Support\Facades\Auth;
use InvalidArgumentException;
use RuntimeException;

/**
 * Asegura customer_providers con provider_id = empresa en sesión.
 * Idempotente. No escribe CRM.
 */
class EnsureSessionProviderCustomer
{
    public function __construct(private CompanyContext $companyContext) {}

    public function ensureCompany(int $customerCompanyId): CustomerProvider
    {
        $providerId = $this->providerId();
        if ($customerCompanyId === $providerId) {
            throw new InvalidArgumentException('El cliente no puede ser la empresa en sesión.');
        }

        return CustomerProvider::ensureCompanyCustomer(
            $customerCompanyId,
            $providerId,
            Auth::id()
        );
    }

    public function ensureUser(int $userId): CustomerProvider
    {
        $providerId = $this->providerId();

        return CustomerProvider::ensureUserCustomer(
            $userId,
            $providerId,
            Auth::id()
        );
    }

    private function providerId(): int
    {
        $id = (int) $this->companyContext->id();
        if ($id <= 0) {
            throw new RuntimeException('No hay empresa en sesión.');
        }

        return $id;
    }
}
