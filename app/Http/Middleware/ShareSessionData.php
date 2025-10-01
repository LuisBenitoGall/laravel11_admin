<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Session;

class ShareSessionData{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response{
        Inertia::share([
            'sessionData' => [
                'currentCompany' => $request->session()->get('currentCompany'),
                'companySettings' => $request->session()->get('companySettings'),
                'companies' => $request->session()->get('companies'),
                'companyModules' => $request->session()->get('companyModules'),
                'locale' => Session::get('locale', config('app.locale'))
            ],
        ]);

        return $next($request);
    }
}
