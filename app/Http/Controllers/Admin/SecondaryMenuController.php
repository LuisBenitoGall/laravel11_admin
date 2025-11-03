<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Session;

//Traits:
use App\Traits\InvalidatesSecondaryMenuCache;

class SecondaryMenuController extends Controller{
    /**
     * 1. Filtrado de menú secundario.
     */
    
    use InvalidatesSecondaryMenuCache;
    
    /**
     * 1. Filtrado de menú secundario.
     */
    public function __invoke(){
        $user = auth()->user();
        $companyId = session('currentCompany');
        if (!$companyId) return response()->json([]);

        $activeModuleIds = (array) session('companyModules', []);
        sort($activeModuleIds);
        $modsHash = md5(json_encode($activeModuleIds));
        $locale   = app()->getLocale();

        $cacheKey = "secondary_menu_user_{$user->id}_company_{$companyId}_mods_{$modsHash}_loc_{$locale}";

        $menu = Cache::remember($cacheKey, now()->addMinutes(30), function () use ($activeModuleIds, $user) {
            $path = storage_path("json/secondary-menu.json");
            if (!File::exists($path)) return [];

            $rawModules = json_decode(File::get($path), true) ?: [];

            return collect($rawModules)->map(function ($module) use ($activeModuleIds, $user) {
                    if (!in_array($module['id'], $activeModuleIds, true)) return null;

                    $module['label'] = __($module['label'] ?? $module['slug'] ?? '');
                    $module['functionalities'] = collect($module['functionalities'] ?? [])
                        ->map(function ($func) {
                            $func['label'] = __($func['label'] ?? $func['slug'] ?? '');
                            return $func;
                        })->values()->all();

                    if ($user->isSuperAdmin()) return $module;

                    $modulePermission = 'module_' . ($module['slug'] ?? '');
                    if (!$user->can($modulePermission)) return null;

                    $visible = collect($module['functionalities'])
                        ->filter(fn ($f) => isset($f['slug']) && $user->can($f['slug'] . '.index'))
                        ->values()->all();

                    return !empty($visible) ? array_merge($module, ['functionalities' => $visible]) : null;
                })
                ->filter()
                ->values()
                ->all();
        });

        return response()->json($menu);
    }

}
