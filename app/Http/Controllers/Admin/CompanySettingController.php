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
    private $option = 'configuracion';
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
        return Inertia::render('Admin/CompanySetting/Index', [
            "title" => __($this->option),
            "subtitle" => __('configuracion'),
            "module" => $this->module,
            "slug" => 'companies',
            "queryParams" => request()->query() ?: null,
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions,
        ]);

    }
}
