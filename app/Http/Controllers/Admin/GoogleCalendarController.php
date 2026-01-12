<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\GoogleCalendarIntegration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Laravel\Socialite\Facades\Socialite;

class GoogleCalendarController extends Controller
{
    public function redirect()
    {
        return Socialite::driver('google')
            ->scopes([
                'https://www.googleapis.com/auth/calendar',
            ])
            ->with([
                'access_type' => 'offline',
                'prompt' => 'consent',
            ])
            ->redirect();
    }

    public function callback(Request $request)
    {
        $user = $request->user();
        $companyId = session('currentCompany'); // puede ser null si aún no hay empresa activa

        // Si estás detrás de proxies o tienes líos de sesión, stateless() evita fallos de "Invalid state".
        // Úsalo solo si lo necesitas. Por defecto, mejor con state.
        $googleUser = Socialite::driver('google')->user();

        $expiresIn = (int) ($googleUser->expiresIn ?? 0);
        $tokenExpiresAt = $expiresIn > 0 ? now()->addSeconds($expiresIn) : null;

        // OJO: Google NO siempre devuelve refresh_token (solo la primera vez o si fuerzas prompt=consent).
        $refreshToken = $googleUser->refreshToken ?? null;

        DB::transaction(function () use ($user, $companyId, $googleUser, $tokenExpiresAt, $refreshToken) {
            $integration = GoogleCalendarIntegration::query()
                ->where('user_id', $user->id)
                ->where('company_id', $companyId)
                ->first();

            // Si ya existía y Google no manda refresh_token, conservamos el anterior.
            $finalRefreshToken = $refreshToken ?: ($integration?->refresh_token);

            GoogleCalendarIntegration::updateOrCreate(
                [
                    'user_id' => $user->id,
                    'company_id' => $companyId,
                ],
                [
                    'google_sub' => $googleUser->getId(),
                    'google_email' => $googleUser->getEmail(),
                    'calendar_id' => $integration?->calendar_id ?? 'primary',

                    'access_token' => $googleUser->token,
                    'refresh_token' => $finalRefreshToken,
                    'token_expires_at' => $tokenExpiresAt,

                    // Socialite no siempre expone scopes fácilmente: guardamos null de momento.
                    // Si luego quieres guardarlos, se pueden recuperar del flow OAuth.
                    'scopes' => null,

                    'is_enabled' => true,
                    'last_synced_at' => null,
                ]
            );
        });

        // Redirige a donde tengas la UI de integraciones; si no existe, vuelve atrás.
        return redirect()
            ->back()
            ->with('success', __('Integración con Google Calendar guardada.'));
    }
}
