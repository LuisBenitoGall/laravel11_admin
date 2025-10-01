<?php

namespace App\Policies;

use Illuminate\Auth\Access\Response;

//Models:
use App\Models\Category;
use App\Models\User;

class CategoryPolicy{
    /**
     * Create a new policy instance.
     */
    public function __construct(){
        //
    }

    /**
     * Concede todo a super-admin (o el rol que prefieras).
     */
    public function before(User $user, string $ability): ?bool{
        return $user->hasRole('super-admin') ? true : null;
    }

    /**
     * Listar categorías de un módulo.
     * Uso: $this->authorize('viewAny', [Category::class, $moduleSlug])
     */
    public function viewAny(User $user, string $module): Response{
        if (!$this->sameCompanyContext()) {
            return Response::deny('No hay empresa activa.');
        }

        return $user->can($this->perm('view', $module))
            ? Response::allow()
            : Response::deny("No puedes listar categorías de {$module}.");
    }

    /**
     * Ver una categoría concreta.
     */
    public function view(User $user, Category $category): Response{
        if (!$this->sameCompanyContext($category)) {
            return Response::deny('Empresa no coincide con la actual.');
        }

        return $user->can($this->perm('view', $category->module))
            ? Response::allow()
            : Response::deny('No puedes ver esta categoría.');
    }

    /**
     * Crear en un módulo.
     * Uso: $this->authorize('create', [Category::class, $moduleSlug])
     */
    public function create(User $user, string $module): Response{
        if (!$this->sameCompanyContext()) {
            return Response::deny('No hay empresa activa.');
        }

        return $user->can($this->perm('create', $module))
            ? Response::allow()
            : Response::deny("No puedes crear categorías en {$module}.");
    }

    /**
     * Actualizar una categoría.
     */
    public function update(User $user, Category $category): Response{
        if (!$this->sameCompanyContext($category)) {
            return Response::deny('Empresa no coincide con la actual.');
        }

        return $user->can($this->perm('update', $category->module))
            ? Response::allow()
            : Response::deny('No puedes editar esta categoría.');
    }

    /**
     * Eliminar una categoría.
     */
    public function delete(User $user, Category $category): Response{
        if (!$this->sameCompanyContext($category)) {
            return Response::deny('Empresa no coincide con la actual.');
        }

        return $user->can($this->perm('delete', $category->module))
            ? Response::allow()
            : Response::deny('No puedes eliminar esta categoría.');
    }

    /**
     * Restaurar (soft deletes).
     */
    public function restore(User $user, Category $category): Response{
        if (!$this->sameCompanyContext($category)) {
            return Response::deny('Empresa no coincide con la actual.');
        }

        return $user->can($this->perm('restore', $category->module))
            ? Response::allow()
            : Response::deny('No puedes restaurar esta categoría.');
    }

    /**
     * Borrado forzado (si lo usas).
     */
    public function forceDelete(User $user, Category $category): Response{
        if (!$this->sameCompanyContext($category)) {
            return Response::deny('Empresa no coincide con la actual.');
        }

        return $user->can($this->perm('force-delete', $category->module))
            ? Response::allow()
            : Response::deny('No puedes borrar definitivamente esta categoría.');
    }

    /**
     * Mover categoría dentro del árbol.
     * Uso: $this->authorize('move', [$category, $newParent])
     */
    public function move(User $user, Category $category, ?Category $newParent = null): Response{
        if (!$this->sameCompanyContext($category)) {
            return Response::deny('Empresa no coincide con la actual.');
        }
        if ($newParent && ($newParent->company_id !== $category->company_id || $newParent->module !== $category->module)) {
            return Response::deny('Padre de otra empresa o módulo.');
        }

        return $user->can($this->perm('move', $category->module))
            ? Response::allow()
            : Response::deny('No puedes mover esta categoría.');
    }

    /**
     * Asignar categoría a otra entidad (productos, etc.).
     * Uso: $this->authorize('assign', [$category, $targetModuleSlug])
     */
    public function assign(User $user, Category $category, string $targetModule): Response{
        if (!$this->sameCompanyContext($category)) {
            return Response::deny('Empresa no coincide con la actual.');
        }
        // Por defecto el targetModule debe coincidir con $category->module
        if ($targetModule !== $category->module) {
            return Response::deny('Módulo destino no coincide.');
        }

        return $user->can($this->perm('assign', $category->module))
            ? Response::allow()
            : Response::deny('No puedes asignar esta categoría.');
    }

    /* ================= Helpers ================= */

    /**
     * Verifica que la empresa actual (session) exista y coincida con la del recurso (si aplica).
     * Adapta este método si usas otro origen para la empresa activa.
     */
    protected function sameCompanyContext(?Category $category = null): bool{
        $currentCompanyId = (int) (session('company_id') ?? 0);
        if ($currentCompanyId <= 0) {
            return false;
        }
        return $category ? ((int)$category->company_id === $currentCompanyId) : true;
    }

    /**
     * Construye el nombre de permiso por módulo.
     * Ej.: categories.products.view
     */
    protected function perm(string $action, string $module): string{
        return "categories.{$module}.{$action}";
    }
}
