<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

//Models:
use App\Models\CompanyModule;
use App\Models\CompanySetting;
// use App\Models\Employee;
// use App\Models\Module;
use App\Models\User;
use App\Models\UserCompany;
use App\Models\UserLoginCode;

//Notifications:
use App\Notifications\LoginCodeNotification;

class AuthenticatedSessionController extends Controller{
    /**
     * Display the login view.
     */
    public function create(): Response{
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
            'APP_FULL_NAME' => env('APP_FULL_NAME'),
            'APP_NAME' => env('APP_NAME'),
            'recaptchaSiteKey'   => config('services.recaptcha.site_key')
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse{
        // 1) Validación de campos (email, password, remember, etc.)
        $data = $request->validated();

        // 2) Buscar usuario por email
        $user = User::where('email', $data['email'])->first();

        // 3) Comprobar credenciales manualmente
        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => [trans('auth.failed')],
            ]);
        }

        // 4) Limpiar cualquier intento pendiente anterior
        $request->session()->forget('pending_login');

        // 5) Generar código de verificación (6 dígitos, por ejemplo)
        $code = random_int(100000, 999999);

        // 6) Guardar código en BD
        UserLoginCode::create([
            'user_id'    => $user->id,
            'code'       => $code,
            'expires_at' => Carbon::now()->addMinutes(10),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        // 7) Guardar estado de login pendiente en sesión
        $request->session()->put('pending_login', [
            'user_id'  => $user->id,
            'remember' => !empty($data['remember']),
            'email'    => $user->email,
        ]);

        // 8) Enviar email con el código
        $user->notify(new LoginCodeNotification($code));

        // 9) Redirigir a la pantalla de verificación de código
        return redirect()->route('login.verify.show');






        // $request->authenticate();   //Va a app\Http\Requests\Auth\LoginRequest.php

        // $request->session()->regenerate();

        // // Nota: la inclusión del campo `avatar` para Inertia se gestiona en
        // // HandleInertiaRequests::share(), por lo que no necesitamos mutar el
        // // objeto Auth::user() aquí y evitamos llamadas a métodos no tipados
        // // por el analizador.

        // //Empresas vinculadas al usuario:
        // $companies = UserCompany::userCompanies();

        // //Empresa actual:
        // //if($companies->count() == 1){
        //     //session(['currentCompany' => $companies[0]->id]); 
        //     session(['currentCompany' => 1]); 

        //     //Módulos de la empresa:
        //     $companyModules = CompanyModule::getCompanyModules($companies[0]->id);
        //     session(['companyModules' => $companyModules]);

        //     //Configuración de la empresa:
        //     $settings = CompanySetting::companySettings($companies[0]->id);
        //     session(['companySettings' => $settings]);

        // }elseif($companies->count() == 0){
        //     session()->flash('error', __('usuario_sin_empresa'));
        //     $this->destroy($request);

        // }else{
            
        // }

        //return redirect()->intended(route('dashboard.index', absolute: false));
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

    /**
     * Extra (más adelante): método privado para inicializar contexto de empresa
     * a usar en el paso 2 cuando el login ya está completado.
     */
    protected function initCompanyContextFor(User $user, Request $request): void{
        $companies = UserCompany::userCompanies(); // asumo que ya filtra por user auth

        // Aquí ya no fijes a 1 por deporte, usa la lógica que te interese:
        if ($companies->count() > 0) {
            $currentCompanyId = (int) $companies[0]->id;
            session(['currentCompany' => $currentCompanyId]);

            // Módulos de la empresa:
            $companyModules = CompanyModule::getCompanyModules($currentCompanyId);
            session(['companyModules' => $companyModules]);

            // Configuración de la empresa:
            $settings = CompanySetting::companySettings($currentCompanyId);
            session(['companySettings' => $settings]);
        }
    }
}
