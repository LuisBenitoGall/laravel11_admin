<?php

namespace App\Traits;

use Illuminate\Support\Facades\Cache;

trait InvalidatesSecondaryMenuCache{
    /**
     * 1. Invalida la caché del menú lateral para un usuario en una empresa.
     * 2. Invalida la caché del menú lateral para el usuario autenticado en la empresa activa.
     */
    
    /**
     * 1. Invalida la caché del menú lateral para un usuario en una empresa.
     */
    public function invalidateSecondaryMenuCache(int $userId, int $companyId): void{
        $cacheKey = "secondary_menu_user_{$userId}_company_{$companyId}";
        Cache::forget($cacheKey);
    }

    /**
     * 2. Invalida la caché del menú lateral para el usuario autenticado en la empresa activa.
     */
    public function invalidateMenuForCurrentUser(): void{
        $user = auth()->user();
        $companyId = session('current_company_id');

        if ($user && $companyId) {
            $this->invalidateSecondaryMenuCache($user->id, $companyId);
        }
    }
}
