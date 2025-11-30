<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use App\Support\CompanyContext;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;
use File;

//Models:
use App\Models\Company;
use App\Models\CompanySetting;

//Traits
use App\Traits\HasUserPermissionsTrait;
use App\Traits\LocaleTrait;

class CompanySettingController extends Controller{
    /**
     * 1. Página de configuración de empresa.
     * 2. Actualizar datos de configuración.
     */
    
    use HasUserPermissionsTrait;
    use LocaleTrait;

    private $module = 'companies';
    private $option = 'empresas';
    protected array $permissions = [];

    public function __construct(){
        if(session('currentCompany')){
            $this->permissions = $this->resolvePermissions([
                'company-settings.create',
                'company-settings.destroy',
                'company-settings.edit',
                'company-settings.index',
                'company-settings.search',
                'company-settings.show',
                'company-settings.update'
            ]);   
        } 
    }  

    /**
     * 1. Página de configuración de empresa.
     */
    public function index(Request $request){
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

        $company = Company::find($currentCompanyId);
        if (!$company) {
            abort(404, __('empresa_no_encontrada'));
        }

        return Inertia::render('Admin/CompanySetting/Index', [
            "title" => __($this->option),
            "subtitle" => __('configuracion'),
            "module" => $this->module,
            "slug" => 'company-settings',
            "company" => $company,
            "queryParams" => request()->query() ?: null,
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions,
        ]);

    }
}
