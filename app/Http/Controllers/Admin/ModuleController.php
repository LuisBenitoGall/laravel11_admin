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

//Models:
use App\Models\Functionality;
use App\Models\Module;
use App\Models\UserColumnPreference;
use Spatie\Permission\Models\Permission;

//Requests:
use App\Http\Requests\ModuleFilterRequest;
use App\Http\Requests\ModuleStoreRequest;
use App\Http\Requests\ModuleUpdateRequest;

//Resources:
use App\Http\Resources\FunctionalityResource;
use App\Http\Resources\ModuleResource;

//Traits:
use App\Traits\HasUserPermissionsTrait;
use App\Traits\LocaleTrait;
use App\Traits\ModulesTrait;

class ModuleController extends Controller{
    /**
     * 1. Listado de módulos.
     * 1.1. Data para exportación.
     * 1.2. Data Query.
     * 2. Formulario nuevo módulo.
     * 3. Guardar nuevo módulo.
     * 4. Editar módulo.
     * 5. Actualizar módulo.
     * 6. Eliminar módulo.
     * 7. Actualizar estado.
     */
    
    use HasUserPermissionsTrait;
    use LocaleTrait;
    use ModulesTrait;

    private $module = 'settings';
    private $option = 'configuracion';
    protected array $permissions = [];

    public function __construct(){
        if(session('currentCompany')){
            $this->permissions = $this->resolvePermissions([
                'modules.create',
                'modules.destroy',
                'modules.edit',
                'modules.index',
                'modules.search',
                'modules.show',
                'modules.update'
            ]);
        }
    }

    /**
     * 1. Listado de módulos.
     */
    public function index(ModuleFilterRequest $request){
        $perPage = $request->input('per_page', config('constants.RECORDS_PER_PAGE_DEFAULT_'));
        
        $modules = $this->dataQuery($request)->paginate($perPage)->onEachSide(1);

        //Niveles:
        $levels = $this->levels();

        return Inertia::render('Admin/Module/Index', [
            "title" => __($this->option),
            "subtitle" => __('modulos'),
            "module" => $this->module,
            "slug" => 'modules',
            "modules" => ModuleResource::collection($modules),
            "levels" => $levels,
            "queryParams" => request()->query() ?: null,
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions,
            "columnPreferences" => UserColumnPreference::forUserAndTables(
                auth()->user()->id,
                ['tblModules'] 
            )
        ]);
    }

    /**
     * 1.1. Data para exportación.
     */
    public function filteredData(ModuleFilterRequest $request){
        $cacheKey = 'filtered_modules_' . md5(json_encode($request->all()));

        $modules = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($request) {
            return $this->dataQuery($request)->get();
        });

        return response()->json([
            'modules' => ModuleResource::collection($modules)
        ]);
    }

    /**
     * 1.2. Data Query.
     */
    private function dataQuery(ModuleFilterRequest $request){
        $user = auth()->user();

        //Niveles:
        $levels = $this->levels();

        $query = Module::query();

        // Filtros dinámicos
        $filters = [
            'label' => fn($q, $v) => $q->whereRaw('LOWER(label) LIKE ?', ['%' . strtolower($v) . '%']),
            'level' => fn($q, $v) => $q->where('level', $v)
        ];

        foreach ($filters as $key => $callback) {
            if ($request->filled($key)) {
                $callback($query, $request->input($key));
            }
        }

        // Filtros por rangos de fechas dinámicos
        $dateFilters = [
            'created_at' => ['date_from', 'date_to']
        ];

        foreach ($dateFilters as $column => [$fromKey, $toKey]) {
            $from = $request->input($fromKey);
            $to = $request->input($toKey);

            if ($from && $to) {
                $query->whereBetween($column, ["$from 00:00:00", "$to 23:59:59"]);
            } elseif ($from) {
                $query->where($column, '>=', "$from 00:00:00");
            } elseif ($to) {
                $query->where($column, '<=', "$to 23:59:59");
            }
        }

        // Ordenación
        $sortField = $request->input('sort_field', 'name');
        $sortDirection = $request->input('sort_direction', 'ASC');
        $allowedSortFields = ['label', 'level'];

        if (!in_array($sortField, $allowedSortFields)) {
            $sortField = 'label';
        }

        return $query->orderBy($sortField, $sortDirection);        
    }

    /**
     * 2. Formulario nuevo módulo.
     */
    public function create(){
        //Niveles:
        $levels = $this->levels();

        return Inertia::render('Admin/Module/Create', [
            "title" => __($this->option),
            "subtitle" => __('modulo_nuevo'),
            "module" => $this->module,
            "slug" => 'modules',
            "levels" => $levels,
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions
        ]);        
    }

    /**
     * 3. Guardar nuevo módulo.
     */
    public function store(ModuleStoreRequest $request){
        //Guardando módulo:
        $module = Module::saveModule($request);      

        //Guardar .json de módulos opcionales:
        $this->jsonOptionalModules();  

        return redirect()->route('modules.edit', $module->id)
            ->with('msg', __('modulo_creado_msg'));
    }

    /**
     * 4. Editar módulo.
     */
    public function edit(Module $module, $tab = false){
        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));

        //Formateo de datos:
        $module->formatted_created_at = Carbon::parse($module->created_at)->format($locale[4].' H:i:s');
        $module->formatted_updated_at = Carbon::parse($module->updated_at)->format($locale[4].' H:i:s');

        $module->created_by_name = optional($module->createdBy)->full_name ?? false;
        $module->updated_by_name = optional($module->updatedBy)->full_name ?? false;

        //Niveles:
        $levels = $this->levels();

        //Funcionalidades:
        $functionalities = FunctionalityResource::collection(
            Functionality::getByModule($module->id)
        );

        return Inertia::render('Admin/Module/Edit', [
            "title" => __($this->option),
            "subtitle" => __('modulo_editar'),
            "module" => $this->module,
            "slug" => 'modules',
            "module_data" => $module,
            "tab" => $tab,
            "levels" => $levels,
            "functionalities" => $functionalities,
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions,
            "columnPreferences" => UserColumnPreference::forUserAndTables(
                auth()->user()->id,
                ['tblFunctionalities'] 
            )
        ]);       
    }

    /**
     * 5. Actualizar módulo.
     */
    public function update(ModuleUpdateRequest $request, Module $module){
        try{
            $validated = $request->validated();

            $slug = Str::slug($request->name);

            $module->name = strtolower($request->name);
            $module->slug = $slug;
            $module->label = strtolower($request->label);
            $module->color = $request->color;
            $module->icon = $request->icon;
            $module->explanation = $request->explanation;
            $module->status = filter_var($request->status, FILTER_VALIDATE_BOOLEAN)? 1:0;
            $module->save();

            //Guardar .json de módulos opcionales:
            $this->jsonOptionalModules();

            return redirect()->route('modules.edit', $module)
            ->with('msg', __('modulo_actualizado_msg'));

        }catch(\Throwable $e){
            Log::error('Error en update(): ' . $e->getMessage());
            abort(500, 'Error interno del servidor');
        }
    }

    /**
     * 6. Eliminar módulo.
     */
    public function destroy(Request $request, Module $module){
        $module->delete();

        //Guardar .json de módulos opcionales:
        $this->jsonOptionalModules();

        //Mantenimiento de filtros:
        $queryParams = $request->only([
            'label', 'level', 'date_from', 'date_to', 'sort_field', 'sort_direction', 'per_page', 'page'
        ]);

        return redirect()->route('modules.index', $queryParams)->with('msg', __('modulo_eliminado'));
    }

    /**
     * 7. Actualizar estado.
     */
    public function status(Request $request){
        $module = Module::find($request->id);

        if (!$module) {
            return response()->json(['error' => __('modulo_no_encontrado')], 404);
        }

        $module->status = !$module->status;
        $module->save();

        return response()->json([
            'success' => true,
            'message' => __('estado_actualizado_ok'),
            'new_status' => $module->status
        ]);
    }
}
