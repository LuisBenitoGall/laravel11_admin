<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Company;
use App\Models\Product;
use App\Models\User;
use App\Services\CompanyContext;

class ProductPolicy
{
    /**
     * Super Admin: lo permitimos todo sin hacer preguntas incómodas.
     */
    public function before(?User $user, string $ability): ?bool
    {
        if ($user && method_exists($user, 'hasRole') && $user->hasRole('Super Admin')) {
            return true;
        }

        return null; // sigue con el resto de checks
    }

    /**
     * Contexto A: listado/backoffice (index).
     */
    public function viewAny(User $user): bool
    {
        return $this->canManageCatalog($user)
            && $this->hasActionPermission($user, 'products.index');
    }

    /**
     * Contexto A o B:
     * - Si el producto es de la empresa en sesión => reglas de gestión (A).
     * - Si es de otra empresa => reglas de catálogo ajeno/público (B).
     */
    public function view(?User $user, Product $product): bool
    {
        if ($this->isOwnCompanyProduct($product)) {
            // Contexto A (backoffice)
            if (!$user) {
                return false;
            }

            return $this->canManageCatalog($user)
                && $this->hasActionPermission($user, 'products.show');
        }

        // Contexto B (catálogo ajeno)
        return $this->canViewExternalCatalogProduct($product);
    }

    /**
     * Contexto A: crear.
     */
    public function create(User $user): bool
    {
        return $this->canManageCatalog($user)
            && $this->hasActionPermission($user, 'products.create');
    }

    /**
     * Contexto A: editar/actualizar (solo catálogo propio).
     */
    public function update(User $user, Product $product): bool
    {
        return $this->isOwnCompanyProduct($product)
            && $this->canManageCatalog($user)
            && $this->hasActionPermission($user, 'products.update');
    }

    /**
     * Contexto A: eliminar (solo catálogo propio).
     * Nota: los bloqueos por referencias (ventas/compras/stock/series...) NO son Policy; son regla de negocio.
     */
    public function delete(User $user, Product $product): bool
    {
        return $this->isOwnCompanyProduct($product)
            && $this->canManageCatalog($user)
            && $this->hasActionPermission($user, 'products.destroy');
    }

    /**
     * Contexto A: búsqueda interna (si la tienes separada del index).
     * Si tu search es solo "index con filtros", puedes omitir esto y reutilizar viewAny.
     */
    public function search(User $user): bool
    {
        return $this->canManageCatalog($user)
            && $this->hasActionPermission($user, 'products.search');
    }

    /**
     * Contexto B: búsqueda pública/ajena (ecommerce / catálogo externo).
     * - NO requiere módulo activo ni module_products en currentCompany.
     * - La query igualmente debe filtrar status=1 y on_sale=1 en el repositorio/controller.
     *
     * Úsalo en el endpoint que sirva búsqueda externa:
     *   $this->authorize('searchExternal', Product::class);
     */
    public function searchExternal(?User $user = null): bool
    {
        // Según tu spec, el acceso externo no depende de permisos del usuario.
        // Si mañana quieres restringir a usuarios logueados, aquí es donde lo haces.
        return true;
    }

    /* -----------------------------------------------------------------
     | Helpers (privados)
     | ----------------------------------------------------------------- */

    private function canManageCatalog(User $user): bool
    {
        $companyId = $this->currentCompanyId();
        if ($companyId <= 0) {
            return false;
        }

        // Guardas generales del Contexto A:
        return $this->isModuleActiveForCompany($companyId)
            && $this->hasModulePermission($user);
    }

    private function isOwnCompanyProduct(Product $product): bool
    {
        $companyId = $this->currentCompanyId();
        return $companyId > 0 && (int) $product->company_id === $companyId;
    }

    /**
     * Contexto B: solo productos públicos.
     */
    private function canViewExternalCatalogProduct(Product $product): bool
    {
        // Regla: solo activos y a la venta
        if ((int) $product->status !== 1) {
            return false;
        }
        if ((int) $product->on_sale !== 1) {
            return false;
        }

        // Regla: la empresa propietaria debe tener catálogo público habilitado
        $company = $product->company ?? null;
        if (!$company instanceof Company) {
            // Si no está cargada la relación, intenta recuperarla sin liarla mucho.
            $company = Company::query()->find($product->company_id);
        }

        return $company instanceof Company && $this->isCompanyCatalogPublic($company);
    }

    /**
     * Define aquí tu "flag de empresa pública".
     * Ajusta estos nombres a tu schema real.
     */
    private function isCompanyCatalogPublic(Company $company): bool
    {
        return (bool) (
            ($company->catalog_public ?? false) ||
            ($company->catalog_enabled ?? false) ||
            ($company->ecommerce_enabled ?? false) ||
            ($company->public_catalog_enabled ?? false)
        );
    }

    private function hasModulePermission(User $user): bool
    {
        return $this->userCan($user, 'module_products');
    }

    private function hasActionPermission(User $user, string $permission): bool
    {
        return $this->userCan($user, $permission);
    }

    private function userCan(User $user, string $permission): bool
    {
        // Compatible con Spatie Permissions y con Gate nativo.
        if (method_exists($user, 'hasPermissionTo')) {
            return $user->hasPermissionTo($permission);
        }

        return $user->can($permission);
    }

    private function currentCompanyId(): int
    {
        // Preferimos tu CompanyContext; fallback a session.
        try {
            $ctx = app(CompanyContext::class);
            $id = (int) $ctx->id();
            if ($id > 0) {
                return $id;
            }
        } catch (\Throwable $e) {
            // Ignoramos; fallback
        }

        return (int) session('currentCompany', 0);
    }

    /**
     * Comprueba si el módulo Products está activo para la empresa.
     * Ajusta el modelo/tabla a tu implementación real (CompanyModule, modules, etc.).
     */
    private function isModuleActiveForCompany(int $companyId): bool
    {
        // Si tienes un servicio tipo ModuleContext/CompanyModules, úsalo aquí.
        // Ejemplo genérico (ajusta namespaces/modelos):
        if (class_exists(\App\Models\CompanyModule::class)) {
            return \App\Models\CompanyModule::query()
                ->where('company_id', $companyId)
                ->where(function ($q) {
                    $q->where('module', 'products')
                      ->orWhere('module_key', 'products')
                      ->orWhere('module_id', $this->productsModuleIdIfExists());
                })
                ->where('enabled', 1)
                ->exists();
        }

        // Si no tienes modelo, como mínimo no bloqueamos por defecto.
        // Pero idealmente esto NUNCA debería quedarse así.
        return true;
    }

    private function productsModuleIdIfExists(): ?int
    {
        // Placeholder por si tu tabla usa module_id.
        return null;
    }
}
