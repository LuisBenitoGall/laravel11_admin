<?php

namespace App\Providers;

use App\Support\CompanyContext;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;
use Illuminate\Database\Eloquent\Builder;
use App\Support\Filters\AdHocFilterApplier;
use App\Models\CrmContact;
use App\Models\UserCompany;
use App\Observers\CrmContactObserver;
use App\Observers\UserCompanyObserver;

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

        // Mantiene sincronizado el cargo/departamento entre crm_contacts y user_companies
        // sea cual sea el punto de la app que los modifique (edición manual, importación CRM, etc.)
        CrmContact::observe(CrmContactObserver::class);
        UserCompany::observe(UserCompanyObserver::class);

        Builder::macro('applyAdhocFilters', function ($request, array $definitions) {
            /** @var \Illuminate\Database\Eloquent\Builder $this */
            return AdHocFilterApplier::apply($this, $request, $definitions);
        });
    }
}
