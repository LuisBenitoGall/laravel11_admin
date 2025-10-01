<?php

namespace App\Providers;

use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider{
    /**
     * Register any application services.
     */
    public function register(): void{
        
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void{
        $locale = Session::get('locale', config('app.locale'));
        App::setLocale($locale);  

        Inertia::share([
            'msg' => fn () => session('msg'),
            'alert' => fn () => session('alert'),
            'new_functionality' => fn () => session()->get('new_functionality')
        ]);

        //Permisos Spatie de Super-Administrador:
        Gate::before(function ($user, $ability) {
            return $user->hasRole('Super Admin') ? true : null;
        });
    }
}
