<?php  

//Detección empresa en session + error 422:
$ctx = app(CompanyContext::class);
$currentCompanyId = (int) $ctx->id();
if($currentCompanyId <= 0){
    $url = route('companies.refresh-session');

    // si quieres ser fino, guarda a dónde quería ir originalmente
    session(['intended_after_company' => request()->fullUrl()]);
    session()->flash('alert', __('empresa_no_activa'));

    if (request()->header('X-Inertia')) {
        return \Inertia\Inertia::location($url);
    }

    return redirect($url);
}