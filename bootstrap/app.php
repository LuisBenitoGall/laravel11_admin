<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpException;
use App\Http\Middleware\ModuleSetted;
use App\Http\Middleware\SetCompanyContext;
use Inertia\Inertia;

// Models:
use App\Models\User;
use App\Models\UserError;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \App\Http\Middleware\SetLanguage::class,
            \App\Http\Middleware\ShareSessionData::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'company'            => SetCompanyContext::class,
            'module_setted'      => ModuleSetted::class,
            'role'               => \Spatie\Permission\Middleware\RoleMiddleware::class,
            'permission'         => \Spatie\Permission\Middleware\PermissionMiddleware::class,
            'role_or_permission' => \Spatie\Permission\Middleware\RoleOrPermissionMiddleware::class,
        ]);

        // Validación CSRF y rutas exceptuadas:
        $middleware->validateCsrfTokens(
            except: [
                'admin/companies/select',
            ]
        );
    })
    ->withExceptions(function (Exceptions $exceptions) {

        /**
         * Manejador custom de tu CustomAuthorizationException (403).
         * Lo dejo tal cual lo tenías.
         */
        $exceptions->render(function (\App\Exceptions\CustomAuthorizationException $e, Request $request) {
            $user = auth()->user();

            if ($user) {
                UserError::create([
                    'user_id' => $user->id,
                    'error'   => 403,
                ]);

                $max = config('constants.ERROR_MAX_403_');
                $count = UserError::where('user_id', $user->id)
                    ->where('error', 403)
                    ->whereNull('deleted_at')
                    ->count();

                if ($count >= $max) {
                    $user->update(['status' => 0]);
                    auth()->logout();
                    return redirect()
                        ->route('login')
                        ->with('alert', __('usuario_desactivado_aviso'));
                }
            }

            if ($request->header('X-Inertia')) {
                session()->flash('alert', $e->getMessage());
                return Inertia::location(route('error.403'));
            }

            return redirect()
                ->route('error.403')
                ->with('alert', $e->getMessage());
        });

        /**
         * 1) Deja de ignorar HttpException en los logs (422 incluidos).
         *    Por defecto Laravel se los traga y tú te quedas a oscuras.
         */
        $exceptions->stopIgnoring(HttpException::class);

        /**
         * 2) Log detallado para 422 de VALIDACIÓN (ValidationException).
         *    Aquí caerán los forms que no pasan reglas.
         */
        $exceptions->report(function (ValidationException $e, Request $request) {
            Log::warning('Validation 422', [
                'url'     => $request->fullUrl(),
                'method'  => $request->method(),
                'user_id' => optional($request->user())->id,
                'ip'      => $request->ip(),
                // Evitamos loguear passwords por si acaso.
                'input'   => $request->except(['password', 'password_confirmation']),
                'errors'  => $e->errors(),
            ]);
        });

        /**
         * 3) Log para HttpException 422 “a pelo” (abort(422), paquetes, etc.).
         *    Esto es el caso típico de la pantalla “Oops! 422 Unprocessable Content”.
         */
        $exceptions->report(function (HttpException $e, Request $request) {
            if ($e->getStatusCode() !== 422) {
                return;
            }

            Log::warning('HttpException 422', [
                'url'     => $request->fullUrl(),
                'method'  => $request->method(),
                'user_id' => optional($request->user())->id,
                'ip'      => $request->ip(),
                'message' => $e->getMessage(),
            ]);
        });
    })
    ->withProviders([
        // Tus providers de la app:
        App\Providers\AppServiceProvider::class,
        App\Providers\AuthServiceProvider::class,
        App\Providers\EventServiceProvider::class,

        // Core que te faltaba antes (para el binding 'files'):
        Illuminate\Filesystem\FilesystemServiceProvider::class,

        // Otros que uses explícitamente si no se auto-descubren:
        // Laravel\Sanctum\SanctumServiceProvider::class,
        // Spatie\Permission\PermissionServiceProvider::class,
    ])
    ->create();
