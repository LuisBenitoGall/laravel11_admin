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

        if (!$companyId) {
            return response()->json([]);
        }

        $activeModuleIds = session('companyModules') ?? [];
        $cacheKey = "secondary_menu_user_{$user->id}_company_{$companyId}";

        $menu = Cache::remember($cacheKey, now()->addMinutes(30), function () use ($activeModuleIds, $user) {
            $path = storage_path("json/secondary-menu.json");
            if (!File::exists($path)) {
                return [];
            }

            $rawModules = json_decode(File::get($path), true);

            return collect($rawModules)->map(function ($module) use ($activeModuleIds, $user) {
                if (!in_array($module['id'], $activeModuleIds)) {
                    return null;
                }

                // Traducir módulo
                $module['label'] = __($module['label']);

                // Traducir funcionalidades
                $module['functionalities'] = collect($module['functionalities'] ?? [])
                    ->map(function ($func) {
                        $func['label'] = __($func['label']);
                        return $func;
                    })
                    ->values()
                    ->all();

                if ($user->isSuperAdmin()) {
                    return $module;
                }

                $modulePermission = 'module_' . $module['slug'];
                if (!$user->can($modulePermission)) {
                    return null;
                }

                $visibleFunctionalities = collect($module['functionalities'])
                    ->filter(fn ($func) => isset($func['slug']) && $user->can($func['slug'] . '.index'))
                    ->values()
                    ->all();

                if (!empty($visibleFunctionalities)) {
                    $module['functionalities'] = $visibleFunctionalities;
                    return $module;
                }

                return null;
            })
            ->filter()
            ->values()
            ->all();
        });

        return response()->json($menu);
    }
}
