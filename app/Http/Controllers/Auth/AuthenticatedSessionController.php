<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Session;
use Inertia\Inertia;
use Inertia\Response;

//Models:
use App\Models\CompanyModule;
use App\Models\CompanySetting;
// use App\Models\Employee;
// use App\Models\Module;
use App\Models\User;
use App\Models\UserCompany;

class AuthenticatedSessionController extends Controller{
    /**
     * Display the login view.
     */
    public function create(): Response{
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
            'APP_FULL_NAME' => env('APP_FULL_NAME'),
            'APP_NAME' => env('APP_NAME')
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse{
        $request->authenticate();   //Va a app\Http\Requests\Auth\LoginRequest.php

        $request->session()->regenerate();

        // Nota: la inclusión del campo `avatar` para Inertia se gestiona en
        // HandleInertiaRequests::share(), por lo que no necesitamos mutar el
        // objeto Auth::user() aquí y evitamos llamadas a métodos no tipados
        // por el analizador.

        //Empresas vinculadas al usuario:
        $companies = UserCompany::userCompanies();

        //Empresa actual:
        if($companies->count() == 1){
            session(['currentCompany' => $companies[0]->id]); 

            //Módulos de la empresa:
            $companyModules = CompanyModule::getCompanyModules($companies[0]->id);
            session(['companyModules' => $companyModules]);

            //Configuración de la empresa:
            $settings = CompanySetting::companySettings($companies[0]->id);
            session(['companySettings' => $settings]);

        }elseif($companies->count() == 0){
            session()->flash('error', __('usuario_sin_empresa'));
            $this->destroy($request);

        }else{
            
        }

        return redirect()->intended(route('dashboard.index', absolute: false));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse{
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
