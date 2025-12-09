<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

// Models:
use App\Models\User;
use App\Models\UserLoginCode;
use App\Models\UserCompany;
use App\Models\CompanyModule;
use App\Models\CompanySetting;

class LoginVerificationController extends Controller
{
    /**
     * Muestra el formulario para introducir el código enviado por email.
     */
    public function create(Request $request): Response
    {
        $pending = $request->session()->get('pending_login');

        if (! $pending || empty($pending['user_id'])) {
            return redirect()
                ->route('login')
                ->with('status', __('Tu sesión de inicio ha caducado. Por favor, introduce de nuevo tus credenciales.'));
        }

        return Inertia::render('Auth/LoginVerify', [
            'email'  => $pending['email'] ?? null,
            'status' => session('status'),
        ]);
    }

    /**
     * Valida el código y completa el login.
     */
    public function store(Request $request): RedirectResponse
    {
        $pending = $request->session()->get('pending_login');

        if (! $pending || empty($pending['user_id'])) {
            return redirect()
                ->route('login')
                ->with('status', __('Tu sesión de inicio ha caducado. Por favor, introduce de nuevo tus credenciales.'));
        }

        $data = $request->validate([
            'code' => ['required', 'string', 'max:10'],
        ]);

        // Buscar código válido
        $loginCode = UserLoginCode::where('user_id', $pending['user_id'])
            ->where('code', $data['code'])
            ->whereNull('used_at')
            ->where('expires_at', '>', Carbon::now())
            ->latest()
            ->first();

        if (! $loginCode) {
            throw ValidationException::withMessages([
                'code' => [__('El código no es válido o ha caducado.')],
            ]);
        }

        // Marcar código como usado
        $loginCode->update([
            'used_at' => Carbon::now(),
        ]);

        // Loguear al usuario
        Auth::loginUsingId($pending['user_id'], $pending['remember'] ?? false);

        // Regenerar sesión para evitar fixation
        $request->session()->regenerate();

        $user = Auth::user();

        // ID de la sesión actual
        $currentSessionId = $request->session()->getId();

        if ($user && config('security.strict_auth')) {
            // Borrar TODAS las demás sesiones de ese usuario
            DB::table('sessions')
                ->where('user_id', $user->id)
                ->where('id', '!=', $currentSessionId)
                ->delete();
        }

        // Limpiar estado pendiente
        $request->session()->forget('pending_login');

        // Inicializar contexto de empresa
        $this->initCompanyContextFor($user, $request);

        // Redirigir a donde quisiera ir originalmente
        return redirect()->intended(route('dashboard.index', absolute: false));
    }

    /**
     * Inicializa la empresa activa y datos asociados, igual que hacías tras el login normal.
     */
    protected function initCompanyContextFor(User $user, Request $request): void
    {
        $companies = UserCompany::userCompanies();

        if ($companies->count() > 0) {
            $currentCompanyId = (int) $companies[0]->id;

            session(['currentCompany' => $currentCompanyId]);

            $companyModules = CompanyModule::getCompanyModules($currentCompanyId);
            session(['companyModules' => $companyModules]);

            $settings = CompanySetting::companySettings($currentCompanyId);
            session(['companySettings' => $settings]);
        }
    }
}
