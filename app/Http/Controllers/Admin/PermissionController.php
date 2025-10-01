<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
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

//Models:
use App\Models\Functionality;
use App\Models\UserColumnPreference;
use Spatie\Permission\Models\Permission;

//Requests:
use App\Http\Requests\PermissionStoreRequest;

//Resources:
use App\Http\Resources\PermissionResource;

//Traits:
use App\Traits\HasUserPermissionsTrait;
use App\Traits\LocaleTrait;

class PermissionController extends Controller{
    /**
     * 1. Listado de permisos.
     * 1.1. Data para exportación.
     * 1.2. Data Query.
     * 2. Formulario crear permiso.
     * 3. Guardar nuevo permiso.
     * 4. Eliminar permiso.
     */
    
    use HasUserPermissionsTrait;
    use LocaleTrait;

    private $module = 'settings';
    private $option = 'configuracion';
    protected array $permissions = [];

    public function __construct(){
        if(session('currentCompany')){
            $this->permissions = $this->resolvePermissions([
                'permissions.create',
                'permissions.destroy',
                'permissions.edit',
                'permissions.index',
                'permissions.search',
                'permissions.show',
                'permissions.update'
            ]);   
        } 
    }   

    /**
     * 1. Listado de permisos.
     */
    public function index(Request $request){
        $perPage = $request->input('per_page', config('constants.RECORDS_PER_PAGE_DEFAULT_'));

        $permissions = $this->dataQuery($request)->paginate($perPage)->onEachSide(1);

        return Inertia::render('Admin/Permission/Index', [
            "title" => __($this->option),
            "subtitle" => __('permisos'),
            'module' => $this->module,
            'slug' => 'permissions',
            "permisos" => PermissionResource::collection($permissions),     //Utilizo nombre en castellano para evitar confusión con los permissions del usuario.
            "queryParams" => request()->query() ?: null,
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions,
            "columnPreferences" => UserColumnPreference::forUserAndTables(
                auth()->user()->id,
                ['tblPermissions'] 
            )
        ]);    
    }

    /**
     * 1.1. Data para exportación.
     */
    public function filteredData(Request $request){
        $cacheKey = 'filtered_roles_' . md5(json_encode($request->all()));

        $permissions = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($request) {
            return $this->dataQuery($request)->get();
        });

        return response()->json([
            'permissions' => PermissionResource::collection($permissions)
        ]);    
    }

    /**
     * 1.2. Data Query.
     */
    private function dataQuery(Request $request){
        $query = Permission::query();

        // Ordenación por defecto:
        $sortField = $request->input('sort_field', 'name');
        $sortDirection = $request->input('sort_direction', 'ASC');
        $allowedSortFields = ['name'];

        if(!in_array($sortField, $allowedSortFields)){
            $sortField = 'name';
        }

        // Aplicar filtros
        if($request->filled('name')){
            $query->where('name', 'like', '%' . $request->input('name') . '%');
        }

        return $query->orderBy($sortField, $sortDirection);
    }

    /**
     * 2. Formulario crear permiso.
     */
    public function create(){
        //Funcionalidades:
        $functionalities = Functionality::orderBy('label', 'ASC')
        ->get()
        ->mapWithKeys(function ($item) {
            return [$item->id => __('' . strtolower($item->label))];
        })
        ->toArray();

        return Inertia::render('Admin/Permission/Create', [
            "title" => __($this->option),
            "subtitle" => __('permiso_nuevo'),
            "module" => $this->module,
            "slug" => 'permissions',
            "functionalities" => $functionalities,
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions
        ]);         
    }

    /**
     * 3. Guardar nuevo permiso.
     */
    public function store(PermissionStoreRequest $request){
        $functionality = Functionality::select('slug')->find($request->functionality);

        if($functionality){
            $slug = Str::slug($request->name);

            $permission_ = $functionality->slug.'.'.$slug;

            //Guardamos permiso si no existe:
            $permission = Permission::firstOrCreate([
                'name' => strtolower($permission_)
            ]);

            return redirect()->route('permissions.index')
            ->with('msg', __('permiso_creado_msg'));

        }else{

        }
    }

    /**
     * 4. Eliminar permiso.
     */
    public function destroy(Request $request, Permission $permission){
        // Eliminar relaciones con usuarios (model_has_permissions)
        DB::table('model_has_permissions')->where('permission_id', $permission->id)->delete();

        // Eliminar relaciones con roles (role_has_permissions)
        DB::table('role_has_permissions')->where('permission_id', $permission->id)->delete();
        
        $permission->delete();

        //Mantenimiento de filtros:
        $queryParams = $request->only([
            'name', 'sort_field', 'sort_direction', 'per_page', 'page'
        ]);

        return redirect()->route('permissions.index', $queryParams)
        ->with('msg', __('permiso_eliminado'));
    }
}
