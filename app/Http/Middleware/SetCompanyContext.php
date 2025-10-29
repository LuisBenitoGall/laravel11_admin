<?php

namespace App\Http\Middleware;

use App\Support\CompanyContext;
use Closure;
use Illuminate\Http\Request;

class SetCompanyContext{
    public function __construct(private CompanyContext $ctx){
    }

    public function handle(Request $request, Closure $next){
        // Lee la empresa activa desde la sesión web.
        // Si no existe, lo deja a null sin hacer drama.
        $companyId = (int) $request->session()->get('currentCompany', 0) ?: null;
        $this->ctx->set($companyId);

        return $next($request);
    }
}
