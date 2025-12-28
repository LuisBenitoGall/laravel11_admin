<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EnsureCurrentCompany
{
    public function handle(Request $request, Closure $next)
    {
        // Ajusta esto si tu fuente “real” es CompanyContext
        $currentCompanyId = (int) session('currentCompany', 0);

        if ($currentCompanyId > 0) {
            return $next($request);
        }

        // Guardamos dónde iba el usuario (para volver luego)
        session(['intended_after_company' => $request->fullUrl()]);

        // Mensaje amable (usa tu i18n)
        session()->flash('alert', __('empresa_no_activa'));

        // “Zona de confort”: una pantalla propia y amigable
        $url = route('companies.refresh-session');

        // Inertia necesita location, si no se queda en limbo
        if ($request->header('X-Inertia')) {
            return Inertia::location($url);
        }

        return redirect($url);
    }
}
