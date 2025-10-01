<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

//Models:
use App\Models\Company;
use App\Models\CompanyModule;
use App\Models\Module;
use App\Models\UserColumnPreference;

//Resources:
use App\Http\Resources\CompanyModuleResource;

// Traits
use App\Traits\HasUserPermissionsTrait;
use App\Traits\LocaleTrait;

class CompanyModuleController extends Controller{
    /**
     * 1. Módulos por empresa.
     * 2. Activar - desactivar módulo.
     */
    
    use HasUserPermissionsTrait;
    use LocaleTrait;

    private $module = 'company-accounts';
    private $option = 'modulos';
    protected array $permissions = [];

    public function __construct(){
        if(session('currentCompany')){
            $this->permissions = $this->resolvePermissions([
                'my-modules.create',
                'my-modules.destroy',
                'my-modules.edit',
                'my-modules.index',
                'my-modules.search',
                'my-modules.show',
                'my-modules.update'
            ]);
        }
    }

    /**
     * 1. Módulos por empresa.
     */
    public function index(){
        //Obtenemos los módulos opcionales.
        $modules = Module::where('status', 1)
        ->where('level', 3)
        ->orderBy('label', 'ASC')
        ->get();

        //Módulos de la empresa:
        $company_modules = CompanyModule::select('module_id')
        ->where('company_id', session('currentCompany'))
        ->pluck('module_id')
        ->toArray();

        return Inertia::render('Admin/CompanyModule/Index', [
            "title" => __($this->option),
            "subtitle" => '',
            "module" => $this->module,
            "slug" => 'company-modules',
            "modules" => CompanyModuleResource::collection($modules)->resolve(),
            "company_modules" => $company_modules,
            "queryParams" => request()->query() ?: null,
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions
        ]);
    }

    /**
     * 2. Activar - desactivar módulo.
     */
    public function toggle($module_id){
        $companyId = session('currentCompany');

        if(!$companyId){
            return redirect()->back()->with('error', __('empresa_no_seleccionada'));
        }

        $exists = CompanyModule::where('company_id', $companyId)
            ->where('module_id', $module_id)
            ->first();

        if($exists){
            $exists->delete();

            //Módulos de la empresa para session:
            $this->setCompanyModules(session('currentCompany'));

            return redirect()->route('company-modules.index')
                ->with('msg', __('modulo_desactivado_correctamente'));
        }else{
            $module = CompanyModule::create([
                'company_id' => $companyId,
                'module_id' => $module_id,
            ]);

            //Recuperamos de nuevo los módulos de la empresa:
            $this->setCompanyModules(session('currentCompany'));

            return redirect()->route('company-modules.index')
                ->with('msg', __('modulo_activado_correctamente'));
        }
    }
}
