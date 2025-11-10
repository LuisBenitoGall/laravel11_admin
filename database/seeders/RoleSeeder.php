<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

//Models:
use App\Models\Functionality;
use App\Models\Module;
//use App\Models\WorkUserCalendar;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleSeeder extends Seeder{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run(){
        //Creación role Super Admin y manager:
        Role::create(['name' => 'Super Admin']);
        Role::create(['name' => 'Invitado']);

        //10/09/22: estos roles se crearán a partir de ahora automáticamente al crearse cada empresa e irán vinculados a ésta. El rol de manager dispondrá ya de permisos prácticamente plenos a excepción de los de configuración de la aplicación.
        //Role::create(['name' => 'manager']);
        //Role::create(['name' => 'basico']);

        //Módulos:
        $modules = Module::all();

        foreach($modules as $module){
            Permission::create(['name' => 'module_'.$module->slug]);
        }

        //Funcionalidades:
        $functionalities = Functionality::all();

        //Métodos para los permisos:
        $methods = config('constants.METHODS_');

        //Excepciones (no se generan permisos)

        //Creamos los permisos de cada funcionalidad:
        foreach($functionalities as $func){
            foreach($methods as $method){
                Permission::create(['name' => strtolower($func->slug).'.'.$method[0]]);
            }
        }

        //Otros permisos sin funcionalidad:
        //WorkUserCalendar::setOtherPermissions();
    }
}
