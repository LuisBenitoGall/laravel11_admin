<?php

namespace App\Http\Controllers;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;
//use Jenssegers\Agent\Agent;
//use App\Helpers\Helpers;

//Models:
use App\Models\CompanyModule;
use App\Models\Functionality;
use App\Models\Module;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

abstract class Controller{
    /**
     * 1. Session módulos por empresa.
     * 2. Generar .json de módulos opcionales.
     * 3. Generar .json de funcionalidades.
     * 4. Comprobar si empresa tiene módulo activo.
     */

    /**
     * 1. Session módulos por empresa.
     */
    public function setCompanyModules($id){
        //Borramos módulos de la empresa anterior y obtenemos módulos de la empresa seleccionada.
        \Session::forget('companyModules');

        $modules = CompanyModule::getCompanyModules($id);
        session(['companyModules' => $modules]);
    }

    /**
     * 2. Generar .json de módulos opcionales.
     */
    public function jsonOptionalModules(){
        $modules = Module::where('level', 3)->get();

        //Agregamos funcionalidades de cada módulo:
        foreach($modules as $row){
            $functionalities = $row->functionalities;

            $row->setAttribute('functionalities', $functionalities);
        }

        $jsondata = json_encode($modules);

        file_put_contents(storage_path()."/json/secondary-menu.json", $jsondata);
    }

    /**
     * 3. Generar .json de funcionalidades.
     *
     * @return .json
     */
    public function jsonFunctionalities(){
        $functionalities = Functionality::all();
        $jsondata = json_encode($functionalities);

        file_put_contents(storage_path()."/json/functionalities.json", $jsondata);
    }

    /**
     * 4. Comprobar si empresa tiene módulo activo.
     */
    public function settedModule($module){
        $exist = false;

        if(session('modules')){
            $data = Module::where('slug', $module)->first();
            $exist = $data && in_array($data->id, session('modules'))? true:false;
        }
        return $exist;
    }
}
