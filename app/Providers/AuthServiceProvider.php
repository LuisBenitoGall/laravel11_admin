<?php

namespace App\Providers;

//Models:
use App\Models\Category;

//Policies:
use App\Policies\CategoryPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as BaseAuthServiceProvider;

class AuthServiceProvider extends BaseAuthServiceProvider{
    /**
     * Mapea modelos → policies.
     */
    protected $policies = [
        Category::class => CategoryPolicy::class,
        // añade aquí más mapeos cuando los vayas creando
    ];

    public function boot(): void{
        $this->registerPolicies();
        // Aquí podrías definir Gates adicionales si los necesitas.
    }
}
