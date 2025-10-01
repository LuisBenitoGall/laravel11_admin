<?php

namespace App\Traits;

use Illuminate\Support\Collection;
use Spatie\Permission\Models\Role;

trait HasCompanyPermissions{
    /**
     * 1. Obtener el rol del usuario en una empresa específica.
     * 2. Verificar si el usuario tiene un rol específico en una empresa.
     * 3. Obtener todos los permisos del usuario en una empresa específica.
     * 4. Verificar si el usuario tiene un permiso específico en una empresa.
     * 5. Shortcut: verificar si el usuario tiene un permiso en la empresa activa (desde session).
     */
    
    /**
     * 1. Obtener el rol del usuario en una empresa específica.
     */
    public function getCompanyRoles(int $companyId): Collection{
        return $this->roles->filter(fn ($role) => $role->company_id === $companyId);
    }

    /**
     * 2. Verificar si el usuario tiene un rol específico en una empresa.
     */
    public function hasCompanyRole(string $roleName, int $companyId): bool{
        return $this->getCompanyRoles($companyId)->contains(fn ($role) => $role->name === "{$companyId}/{$roleName}");
    }

    /**
     * 3. Obtener todos los permisos del usuario en una empresa específica.
     */
    public function getCompanyPermissions(int $companyId): Collection{
        return $this->getCompanyRoles($companyId)
                    ->flatMap(fn ($role) => $role->permissions)
                    ->unique('id');
    }

    /**
     * 4. Verificar si el usuario tiene un permiso específico en una empresa.
     */
    public function hasCompanyPermission(string $permissionName, int $companyId): bool{
        return $this->getCompanyPermissions($companyId)
                    ->pluck('name')
                    ->contains($permissionName);
    }

    /**
     * 5. Shortcut: verificar si el usuario tiene un permiso en la empresa activa (desde session).
     */
    public function hasPermissionInCurrentCompany(string $permissionName): bool{
        $companyId = session('current_company_id');

        if (!$companyId) {
            return false;
        }

        return $this->hasCompanyPermission($permissionName, $companyId);
    }
}
