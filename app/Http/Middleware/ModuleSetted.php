<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Module;

class ModuleSetted{
    /**
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $module): Response{
        // Pase VIP: Super Admin entra a todos los módulos (pero no a slugs fantasma)
        if ($request->user()?->hasRole('Super Admin')) {
            // Aun así, si el slug no existe, que sea 404 como para el resto.
            $exists = Module::where('slug', $module)->exists();
            if (!$exists) {
                abort(404, "Módulo '{$module}' no encontrado.");
            }
            return $next($request);
        }

        // Busca el módulo por slug
        $associatedModule = Module::select('id', 'name', 'slug')
            ->where('slug', $module)
            ->first();

        if (!$associatedModule) {
            abort(404, "Módulo '{$module}' no encontrado.");
        }

        // Valida que la sesión tenga la lista de módulos de la empresa actual
        // companyModules contiene un array de slugs (no IDs)
        $activeModules = session('companyModules', []); // array de slugs

        if (!in_array($module, $activeModules, true)) {
            $alert = __('modulo_no_activo', ['module' => $associatedModule->name]);
            return redirect()->route('dashboard.index')->with(compact('alert'));
        }

        return $next($request);
    }
}
