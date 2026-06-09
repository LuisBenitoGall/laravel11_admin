<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Tighten\Ziggy\Ziggy;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Session;

//Traits:
use App\Traits\LocaleTrait;

class HandleInertiaRequests extends Middleware{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): string|null{
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array{
        return [
            ...parent::share($request),
            'auth' => function () use ($request) {
                $user = $request->user();
                
                // Si no hay usuario autenticado, devolver estructura mínima
                if (!$user) {
                    return [
                        'user' => null,
                        'permissions' => [],
                        'is_super_admin' => false
                    ];
                }

                // Cargar avatar del usuario (manejo seguro de errores)
                try {
                    $avatarModel = $user->avatar; // lazy-load
                    $avatarUrl = ($avatarModel && isset($avatarModel->image)) 
                        ? '/storage/users/' . ltrim($avatarModel->image, '/') 
                        : null;
                } catch (\Throwable $e) {
                    $avatarUrl = null;
                }

                // Obtener permisos efectivos del usuario (Spatie: roles + directos)
                // Manejo seguro: si falla el cálculo, devolver array vacío
                $permissions = [];
                try {
                    if (method_exists($user, 'getAllPermissions')) {
                        $permissions = $user->getAllPermissions()
                            ->pluck('name')
                            ->filter() // Eliminar valores null/empty
                            ->values()
                            ->all();
                    }
                } catch (\Throwable $e) {
                    // En caso de error, devolver array vacío (comportamiento seguro)
                    $permissions = [];
                }

                // Verificar si el usuario es Super Admin
                // Compatible PHP 7.4: verificar método antes de llamarlo
                $isSuperAdmin = false;
                try {
                    if (method_exists($user, 'isSuperAdmin')) {
                        $isSuperAdmin = (bool) $user->isSuperAdmin();
                    }
                } catch (\Throwable $e) {
                    // En caso de error, mantener false (comportamiento seguro)
                    $isSuperAdmin = false;
                }

                // Devolver estructura auth manteniendo compatibilidad con shape actual
                return [
                    'user' => array_merge($user->toArray(), ['avatar' => $avatarUrl]),
                    'permissions' => $permissions, // string[] - permisos efectivos del usuario
                    'is_super_admin' => $isSuperAdmin // boolean - usando $user->isSuperAdmin()
                ];
            },
            'ziggy' => fn () => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'status' => session('status'),
            'msg'    => fn () => session('msg'),
            'alert'  => fn () => session('alert'),
            //Idioma actual:
            'locale' => function (){
                return session('locale')? session('locale'):app()->getLocale();
            },
            //Idiomas disponibles:
            'languages' => fn () => LocaleTrait::languages(),
            //Traducciones:
            'translations' => function (){
                $locale = app()->getLocale();
                $path = base_path("/lang/{$locale}.json");
                return File::exists($path) ? json_decode(File::get($path)) : [];
            }
        ];
    }
}
