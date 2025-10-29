<?php

namespace App\Providers;

use App\Support\CompanyContext;
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
        $this->app->scoped(CompanyContext::class, function () {
            return new CompanyContext();
        });   
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void{
        if(! $this->app->runningInConsole()){
            $locale = Session::get('locale', config('app.locale'));
            App::setLocale($locale);  

            Inertia::share([
                'alert' => fn () => session('alert'),
                'msg' => fn () => session('msg'),

                'menuLocales' => config('constants.MENU_LOCALES_'),
                'menuChat' => config('constants.MENU_CHAT_'),
                'menuCustom' => config('constants.MENU_CUSTOM_'),
                'menuNotifications' => config('constants.MENU_NOTIFICATIONS_'),

                'new_functionality' => fn () => session()->get('new_functionality'),
            ]);
        }

        //Permisos Spatie de Super-Administrador:
        Gate::before(function ($user, $ability) {
            return $user->hasRole('Super Admin') ? true : null;
        });
    }
}
