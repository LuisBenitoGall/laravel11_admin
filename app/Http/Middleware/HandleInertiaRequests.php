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
                if (!$user) return ['user' => null];

                try {
                    // cargar relación avatar (featured + public) y construir URL pública
                    $avatarModel = $user->avatar; // lazy-load
                    $avatarUrl = ($avatarModel && isset($avatarModel->image)) ? '/storage/users/' . ltrim($avatarModel->image, '/') : null;
                } catch (\Throwable $e) {
                    $avatarUrl = null;
                }

                // Devolvemos el usuario como array y añadimos avatar como key simple
                return [
                    'user' => array_merge($user->toArray(), ['avatar' => $avatarUrl]),
                ];
            },
            'ziggy' => fn () => [
                ...(new Ziggy)->toArray(),
                'location' => $request->url(),
            ],
            'status' => session('status'),
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
