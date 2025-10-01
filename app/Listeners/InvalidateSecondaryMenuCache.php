<?php

namespace App\Listeners;

use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Session;

class InvalidateSecondaryMenuCache{
    /**
     * Create the event listener.
     */
    public function __construct(){
        //
    }

    /**
     * Ejecuta el listener.
     */
    public function handle($event): void{
        $user = $event->user ?? auth()->user();
        $companyId = session('currentCompany');

        if (!$user || !$companyId) return;

        $cacheKey = "secondary_menu_user_{$user->id}_company_{$companyId}";
        Cache::forget($cacheKey);
    }
}
