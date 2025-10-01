<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Event;
use App\Events\CompanyChanged;
use App\Listeners\UpdateSecondaryMenuCache;

class EventServiceProvider extends ServiceProvider{
    protected $listen = [
        CompanyChanged::class => [
            UpdateSecondaryMenuCache::class,
        ],
    ];
    
    /**
     * Register services.
     */
    public function register(): void{
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void{
        //
    }

    public function shouldDiscoverEvents(): bool{
        return false;
    }
}
