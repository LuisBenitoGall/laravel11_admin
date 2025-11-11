<?php

namespace App\Policies;

use Illuminate\Auth\Access\Response;
use App\Models\Category;
use App\Models\User;

class CategoryPolicy{
    /**
     * Concede todo a super-admin (o el rol que prefieras).
     */
    public function before(User $user, string $ability): ?bool
    {
        return $user->hasRole('super-admin') ? true : null;
    }

    /**
     * Listar categorías de un environment.
     * Uso: $this->authorize('viewAny', [Category::class, $companyId, $environment])
     */
    public function viewAny(User $user, int $companyId, string $environment): Response
    {
        if (!$this->assertCompanyContext($companyId)) {
            return Response::deny('No hay empresa activa o no coincide con el contexto.');
        }

        // Si el environment es "sectors", exigimos que el módulo de negocio "companies" esté disponible.
        if (!$this->hasBusinessModule($user, $companyId, $environment)) {
            return Response::deny('El módulo requerido no está habilitado para la empresa actual.');
        }

        return $user->can($this->perm('view', $environment))
            ? Response::allow()
            : Response::deny("No puedes listar categorías de {$environment}.");
    }

    /**
     * Ver una categoría concreta.
     * Uso: $this->authorize('view', [$category, $companyId, $environment])
     */
    public function view(User $user, Category $category, int $companyId, string $environment): Response
    {
        if (!$this->assertCompanyContext($companyId, $category)) {
            return Response::deny('Empresa no coincide con la actual.');
        }

        return $user->can($this->perm('view', $environment))
            ? Response::allow()
            : Response::deny('No puedes ver esta categoría.');
    }

    /**
     * Crear en un environment.
     * Uso: $this->authorize('create', [Category::class, $companyId, $environment])
     */
    public function create(User $user, int $companyId, string $environment): Response
    {
        if (!$this->assertCompanyContext($companyId)) {
            return Response::deny('No hay empresa activa o no coincide con el contexto.');
        }

        if (!$this->hasBusinessModule($user, $companyId, $environment)) {
            return Response::deny('El módulo requerido no está habilitado para la empresa actual.');
        }

        return $user->can($this->perm('create', $environment))
            ? Response::allow()
            : Response::deny("No puedes crear categorías en {$environment}.");
    }

    /**
     * Actualizar una categoría.
     * Uso: $this->authorize('update', [$category, $companyId, $environment])
     */
    public function update(User $user, Category $category, int $companyId, string $environment): Response
    {
        if (!$this->assertCompanyContext($companyId, $category)) {
            return Response::deny('Empresa no coincide con la actual.');
        }

        return $user->can($this->perm('update', $environment))
            ? Response::allow()
            : Response::deny('No puedes editar esta categoría.');
    }

    /**
     * Activar/Desactivar (toggle) una categoría.
     */
    public function toggle(User $user, Category $category, int $companyId, string $environment): Response
    {
        if (!$this->assertCompanyContext($companyId, $category)) {
            return Response::deny('Empresa no coincide con la actual.');
        }

        return $user->can($this->perm('update', $environment))
            ? Response::allow()
            : Response::deny('No puedes cambiar el estado de esta categoría.');
    }

    /**
     * Eliminar una categoría.
     */
    public function delete(User $user, Category $category, int $companyId, string $environment): Response
    {
        if (!$this->assertCompanyContext($companyId, $category)) {
            return Response::deny('Empresa no coincide con la actual.');
        }

        return $user->can($this->perm('delete', $environment))
            ? Response::allow()
            : Response::deny('No puedes eliminar esta categoría.');
    }

    /**
     * Restaurar (soft deletes).
     */
    public function restore(User $user, Category $category, int $companyId, string $environment): Response
    {
        if (!$this->assertCompanyContext($companyId, $category)) {
            return Response::deny('Empresa no coincide con la actual.');
        }

        return $user->can($this->perm('restore', $environment))
            ? Response::allow()
            : Response::deny('No puedes restaurar esta categoría.');
    }

    /**
     * Borrado forzado.
     */
    public function forceDelete(User $user, Category $category, int $companyId, string $environment): Response
    {
        if (!$this->assertCompanyContext($companyId, $category)) {
            return Response::deny('Empresa no coincide con la actual.');
        }

        return $user->can($this->perm('force-delete', $environment))
            ? Response::allow()
            : Response::deny('No puedes borrar definitivamente esta categoría.');
    }

    /**
     * Mover categoría dentro del árbol.
     * Uso: $this->authorize('move', [$category, $companyId, $environment])
     */
    public function move(User $user, Category $category, int $companyId, string $environment): Response
    {
        if (!$this->assertCompanyContext($companyId, $category)) {
            return Response::deny('Empresa no coincide con la actual.');
        }

        return $user->can($this->perm('move', $environment))
            ? Response::allow()
            : Response::deny('No puedes mover esta categoría.');
    }

    /**
     * Operaciones masivas.
     * Uso: $this->authorize('manageBulk', [Category::class, $companyId, $environment])
     */
    public function manageBulk(User $user, int $companyId, string $environment): Response
    {
        if (!$this->assertCompanyContext($companyId)) {
            return Response::deny('No hay empresa activa o no coincide con el contexto.');
        }

        return $user->can($this->perm('manage-bulk', $environment))
            ? Response::allow()
            : Response::deny('No puedes operar en lote sobre categorías.');
    }

    /* ================= Helpers ================= */

    /**
     * Comprueba que la empresa en sesión coincide con $companyId
     * y, si hay categoría, que pertenece a esa empresa.
     */
    protected function assertCompanyContext(int $companyId, ?Category $category = null): bool
    {
        $currentCompanyId = (int) (session('company_id') ?? 0);
        if ($currentCompanyId <= 0 || $currentCompanyId !== (int) $companyId) {
            return false;
        }
        return $category ? ((int) $category->company_id === $currentCompanyId) : true;
    }

    /**
     * Mapea environment a “módulo de negocio” para controles adicionales.
     * p.ej. sectors -> companies
     */
    protected function businessModuleFor(string $environment): string
    {
        return match ($environment) {
            'sectors'   => 'companies',
            default     => $environment, // customers -> customers, providers -> providers, crm -> crm
        };
    }

    /**
     * Verifica que el módulo de negocio esté disponible para la empresa.
     * Ajusta a tu estructura real de sesión.
     */
    protected function hasBusinessModule(User $user, int $companyId, string $environment): bool
    {
        $required = $this->businessModuleFor($environment);

        // Si guardas slugs de módulos en sesión:
        $enabledSlugs = (array) session('modules_slugs', []); // ej. ['companies','crm', ...]
        if (!empty($enabledSlugs)) {
            return in_array($required, $enabledSlugs, true);
        }

        // Si solo guardas IDs, aquí tocaría resolver el slug desde BD si lo necesitas.
        return true;
    }

    /**
     * Construye el nombre de permiso por environment.
     * Ej.: categories.sectors.view
     */
    protected function perm(string $action, string $environment): string
    {
        return "categories.{$environment}.{$action}";
    }
}
