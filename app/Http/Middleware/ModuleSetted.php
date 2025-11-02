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
        $associatedModule = Module::select('id', 'name')
            ->where('slug', $module)
            ->first();

        if (!$associatedModule) {
            abort(404, "Módulo '{$module}' no encontrado.");
        }

        // Valida que la sesión tenga la lista de módulos de la empresa actual
        $activeModules = session('modules', []); // array de IDs

        if (!in_array($associatedModule->id, $activeModules, true)) {
            $alert = trans('textos.modulo_no_activo', ['module' => $associatedModule->name]);
            return redirect()->route('dashboard')->with(compact('alert'));
        }

        return $next($request);
    }
}
