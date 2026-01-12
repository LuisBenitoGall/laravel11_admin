<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
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
        $siteKey    = config('services.recaptcha.site_key');
        $strictAuth = config('security.strict_auth');

        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
            'APP_FULL_NAME' => env('APP_FULL_NAME'),
            'APP_NAME' => env('APP_NAME'),
            'recaptchaSiteKey' => $siteKey,
            'recaptchaEnabled' => $strictAuth && !empty($siteKey)
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => [trans('auth.failed')],
            ]);
        }

        //Verificación email:
        if($user && !$user->email_verified_at){
            $user->email_verified_at = Carbon::now();
            $user->save();   
        }

        // ✅ ¿Alguna empresa vinculada exige 2FA?
        // Ajusta nombres de tablas/pivot si difieren
        $requires2fa = DB::table('user_companies') // o el pivot real
            ->join('company_settings', function ($join) {
                $join->on('company_settings.company_id', '=', 'user_companies.company_id')
                     ->whereNull('company_settings.deleted_at');
            })
            ->where('user_companies.user_id', $user->id)
            ->where('company_settings.require_2fa', 1)
            ->exists();

        // Si NO requiere 2FA -> login normal
        if (! $requires2fa) {
            Auth::login($user, !empty($data['remember']));
            $request->session()->regenerate();

            // aquí ya decides si mandas al selector de empresa, dashboard, intended, etc.
            return redirect()->intended(route('dashboard.index'));
            // o route('companies.select') si tu flujo obliga a seleccionar empresa
        }

        // Si SÍ requiere 2FA -> tu flujo actual
        $request->session()->forget('pending_login');

        $code = random_int(100000, 999999);

        UserLoginCode::create([
            'user_id'    => $user->id,
            'code'       => $code,
            'expires_at' => Carbon::now()->addMinutes(10),
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        $request->session()->put('pending_login', [
            'user_id'  => $user->id,
            'remember' => !empty($data['remember']),
            'email'    => $user->email,
        ]);

        $user->notify(new LoginCodeNotification($code));

        return redirect()->route('login.verify.show');
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
