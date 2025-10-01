<?php

namespace App\Providers;

//Models:
use App\Models\Category;
use App\Models\CustomerProvider;

//Policies:
use App\Policies\CategoryPolicy;
use App\Policies\CustomerProviderPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as BaseAuthServiceProvider;

class AuthServiceProvider extends BaseAuthServiceProvider{
    /**
     * Mapea modelos → policies.
     */
    protected $policies = [
        Category::class => CategoryPolicy::class,
        CustomerProvider::class => CustomerProviderPolicy::class,
        // añade aquí más mapeos cuando los vayas creando
    ];

    public function boot(): void{
        $this->registerPolicies();
        // Aquí podrías definir Gates adicionales si los necesitas.
    }
}
