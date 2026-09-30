<?php

namespace App\Policies;

use App\Models\User;
use App\Models\CustomerProvider;
use App\Support\CompanyContext;

class CustomerProviderPolicy
{
    // Roles/permisos Spatie que realmente existen en tu app
    // customers.*  y  providers.*  (index, create, show, update, destroy)
    // Nota: "edit" suele mapear a "update" a nivel de autorización.

    public function before(User $user, $ability)
    {
        // Atajo opcional para superadmin global, si lo usas
        if (method_exists($user, 'hasRole') && $user->hasRole('superadmin')) {
            return true;
        }
    }

    /* ======================
       Listados (viewAny)
       ====================== */

    public function viewAny(User $user): bool
    {
        // Puede listar si tiene permisos para ver clientes o proveedores.
        return $user->can('customers.index') || $user->can('providers.index');
    }

    /* ======================
       Ver una relación
       ====================== */

    public function view(User $user, CustomerProvider $cp): bool
    {
        $side = $this->whichSide($user, $cp);
        if ($side === 'provider') {
            return $user->can('customers.show');
        }
        if ($side === 'customer') {
            return $user->can('providers.show');
        }

        return false;
    }

    /* ======================
       Crear relación
       ====================== */

    public function create(User $user): bool
    {
        // Para create no hay modelo aún. Deducimos el lado con la empresa en sesión
        // y los IDs que vienen en la request (si los hay).
        $currentCompanyId = $this->currentCompanyId();
        $requestedCustomerId = (int) request()->input('customer_id');
        $requestedUserCustomerId = (int) request()->input('user_customer_id');
        $requestedProviderId = (int) request()->input('provider_id');

        if ($currentCompanyId && $requestedProviderId && $currentCompanyId === $requestedProviderId) {
            // Actúa como PROVEEDOR creando un cliente (empresa o particular)
            $ok = $this->userBelongsToCompany($user, $currentCompanyId);
            if ($requestedUserCustomerId > 0) {
                return $ok && ($user->can('customers.create') || $user->can('users.create'));
            }

            return $ok && $user->can('customers.create');
        }

        if ($currentCompanyId && $requestedCustomerId && $currentCompanyId === $requestedCustomerId) {
            // Actúa como CLIENTE creando un proveedor
            return $this->userBelongsToCompany($user, $currentCompanyId) && $user->can('providers.create');
        }

        // Si no podemos deducir lado, exige al menos uno de los permisos
        return $user->can('customers.create') || $user->can('providers.create') || $user->can('users.create');
    }

    /* ======================
       Actualizar relación
       ====================== */

    public function update(User $user, CustomerProvider $cp): bool
    {
        $side = $this->whichSide($user, $cp);
        if ($side === 'provider') {
            return $user->can('customers.update');
        }
        if ($side === 'customer') {
            return $user->can('providers.update');
        }

        return false;
    }

    /* ======================
       Eliminar relación
       ====================== */

    public function delete(User $user, CustomerProvider $cp): bool
    {
        $side = $this->whichSide($user, $cp);
        if ($side === 'provider') {
            return $user->can('customers.destroy');
        }
        if ($side === 'customer') {
            return $user->can('providers.destroy');
        }

        return false;
    }

    public function restore(User $user, CustomerProvider $cp): bool
    {
        // Si gestionas restores con softDeletes, mismo criterio que update
        $side = $this->whichSide($user, $cp);
        if ($side === 'provider') {
            return $user->can('customers.update');
        }
        if ($side === 'customer') {
            return $user->can('providers.update');
        }

        return false;
    }

    public function forceDelete(User $user, CustomerProvider $cp): bool
    {
        // Si realmente haces hard-deletes, mismo criterio que destroy
        return $this->delete($user, $cp);
    }

    /* ======================
       Helpers privados
       ====================== */

    /**
     * Determina desde qué lado actúa el usuario en esta relación:
     * - 'provider' si pertenece a la empresa proveedor del registro
     * - 'customer' si pertenece a la empresa cliente del registro
     * - null si no pertenece a ninguna
     *
     * Filas con user_customer_id (cliente particular): solo lado provider.
     */
    protected function whichSide(User $user, CustomerProvider $cp): ?string
    {
        if ($this->userBelongsToCompany($user, (int) $cp->provider_id)) {
            return 'provider';
        }
        if ($cp->customer_id && $this->userBelongsToCompany($user, (int) $cp->customer_id)) {
            return 'customer';
        }

        return null;
    }

    /**
     * Comprueba si el usuario pertenece a una company dada.
     * Asume relación many-to-many: $user->companies()
     */
    protected function userBelongsToCompany(User $user, int $companyId): bool
    {
        if ($companyId <= 0 || ! method_exists($user, 'companies')) {
            return false;
        }

        return $user->companies()->where('companies.id', $companyId)->exists();
    }

    /**
     * Obtiene la empresa en sesión (currentCompany / CompanyContext).
     */
    protected function currentCompanyId(): ?int
    {
        $fromCtx = app(CompanyContext::class)->id();
        if ($fromCtx) {
            return (int) $fromCtx;
        }
        $id = session('currentCompany') ?: session('company_id');

        return $id ? (int) $id : null;
    }
}
