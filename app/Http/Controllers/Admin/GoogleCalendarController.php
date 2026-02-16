<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\GoogleCalendarIntegration;
use App\Services\GoogleCalendarSyncService;
use App\Support\CompanyContext;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Laravel\Socialite\Facades\Socialite;

class GoogleCalendarController extends Controller
{
    /**
     * GET status: devuelve connected, email, last_synced_at para la integración del usuario y empresa actual.
     */
    public function status(Request $request): JsonResponse
    {
        $user = $request->user();
        $companyId = session('currentCompany') ?? app(CompanyContext::class)->id();

        $integration = GoogleCalendarIntegration::query()
            ->where('user_id', $user->id)
            ->where('company_id', $companyId)
            ->where('is_enabled', true)
            ->first();

        if (! $integration) {
            return response()->json([
                'connected' => false,
                'email' => null,
                'last_synced_at' => null,
            ]);
        }

        return response()->json([
            'connected' => true,
            'email' => $integration->google_email,
            'last_synced_at' => $integration->last_synced_at?->toIso8601String(),
        ]);
    }

    /**
     * POST disconnect: desactiva la integración del usuario/empresa actual. Idempotente.
     */
    public function disconnect(Request $request): JsonResponse
    {
        $user = $request->user();
        $companyId = session('currentCompany') ?? app(CompanyContext::class)->id();

        GoogleCalendarIntegration::query()
            ->where('user_id', $user->id)
            ->where('company_id', $companyId)
            ->update(['is_enabled' => false]);

        return response()->json(['success' => true]);
    }

    /**
     * POST sync: sincronización bidireccional con Google Calendar.
     * Requiere integración activa. Rango por defecto: 1 mes atrás hasta 1 año adelante.
     */
    public function sync(Request $request): JsonResponse
    {
        $user = $request->user();
        $companyId = (int) (session('currentCompany') ?? app(CompanyContext::class)->id());
        if ($companyId <= 0) {
            return response()->json(['error' => __('company_required')], 422);
        }

        $integration = GoogleCalendarIntegration::query()
            ->where('user_id', $user->id)
            ->where('company_id', $companyId)
            ->where('is_enabled', true)
            ->first();

        if (! $integration) {
            return response()->json(['error' => 'No hay conexión activa con Google Calendar.'], 403);
        }

        $timeMin = Carbon::now()->subMonth();
        $timeMax = Carbon::now()->addYear();
        try {
            $syncService = new GoogleCalendarSyncService($integration);
            $syncService->sync($companyId, $user->id, $timeMin, $timeMax);
        } catch (\Throwable $e) {
            report($e);
            return response()->json(['error' => $e->getMessage()], 500);
        }

        return response()->json([
            'success' => true,
            'last_synced_at' => $integration->fresh()->last_synced_at?->toIso8601String(),
        ]);
    }

    /**
     * Redirige al flujo OAuth de Google. Comprueba que las credenciales estén configuradas.
     */
    public function redirect(Request $request)
    {
        $clientId = config('services.google.client_id');
        $clientSecret = config('services.google.client_secret');

        if (empty($clientId) || empty($clientSecret)) {
            return redirect()
                ->back()
                ->with('alert', __('google_credenciales_no_configuradas') ?: 'Google Calendar: faltan GOOGLE_CLIENT_ID o GOOGLE_CLIENT_SECRET en la configuración del servidor. Configúralos en el .env y, si usas caché, ejecuta php artisan config:clear.');
        }

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
