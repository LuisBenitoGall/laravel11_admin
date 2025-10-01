<?php

namespace App\Traits;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

trait HasUserPermissionsTrait{
    /**
     * 1. Resolver permisos de usuario.
     */
    
    /**
     * 1. Resolver permisos de usuario.
     */
    public function resolvePermissions(array $required): array {
        $permissions = [];

        foreach($required as $perm){
            try{
                $permissions[$perm] = auth()->user()->can($perm)? true : false;
            }catch (\Throwable $e){
                $permissions[$perm] = false;
            }
        }
        return $permissions;
    }

}
