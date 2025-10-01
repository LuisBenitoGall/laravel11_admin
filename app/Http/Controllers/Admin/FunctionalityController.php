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
use App\Http\Requests\FunctionalityFilterRequest;
use App\Http\Requests\FunctionalityStoreRequest;
use App\Http\Requests\FunctionalityUpdateRequest;

//Resources:
use App\Http\Resources\FunctionalityResource;

//Traits:
use App\Traits\HasUserPermissionsTrait;
use App\Traits\LocaleTrait;

class FunctionalityController extends Controller{
    /**
     * 1. Listado de funcionalidades.
     * 1.1. Data para exportación.
     * 1.2. Data Query.
     * 2. Guardar nueva funcionalidad.
     * 3. Editar funcionalidad.
     * 4. Actualizar funcionalidad.
     * 5. Eliminar funcionalidad.
     * 6. Generar permisos de la funcionalidad.
     */
    
    use HasUserPermissionsTrait;
    use LocaleTrait;

    private $module = 'settings';
    private $option = 'configuracion';
    protected array $permissions = [];

    public function __construct(){
        if(session('currentCompany')){
            $this->permissions = $this->resolvePermissions([
                'modules.edit'
            ]);
        }
    }

    /**
     * 1. Listado de funcionalidades.
     */
    public function index(FunctionalityFilterRequest $request){
        $perPage = $request->input('per_page', config('constants.RECORDS_PER_PAGE_DEFAULT_'));
        
        $functionalities = $this->dataQuery($request)->paginate($perPage)->onEachSide(1);

        //La tabla de funcionalidades no devuelve una vista, sino que se renderiza en un tab de la edición de módulo.
        return response()->json([
            'functionalities' => FunctionalityResource::collection($functionalities),
            'pagination' => [
                'total' => $functionalities->total(),
                'per_page' => $functionalities->perPage(),
                'current_page' => $functionalities->currentPage(),
                'last_page' => $functionalities->lastPage(),
                'from' => $functionalities->firstItem(),
                'to' => $functionalities->lastItem(),
            ]
        ]);
    }

    /**
     * 1.1. Data para exportación.
     */
    public function filteredData(FunctionalityFilterRequest $request){
        //24/06/2025: en este caso omitimos la caché.
        //$cacheKey = 'filtered_functionalities_' . md5(json_encode($request->all()));

        // $functionalities = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($request) {
        //     return $this->dataQuery($request)->get();
        // });

        // $functionalities = $this->dataQuery($request)->get();

        // return response()->json([
        //     'functionalities' => FunctionalityResource::collection($functionalities)
        // ]);
        
        $perPage = $request->input('per_page', config('constants.RECORDS_PER_PAGE_DEFAULT_'));
        $functionalities = $this->dataQuery($request)->paginate($perPage)->onEachSide(1);

        return response()->json([
            'functionalities' => FunctionalityResource::collection($functionalities),
            'meta' => [
                'total' => $functionalities->total(),
                'per_page' => $functionalities->perPage(),
                'current_page' => $functionalities->currentPage(),
                'last_page' => $functionalities->lastPage(),
                'from' => $functionalities->firstItem(),
                'to' => $functionalities->lastItem(),
            ],
            'links' => $functionalities->linkCollection(),
        ]);
    }

    /**
     * 1.2. Data Query.
     */
    private function dataQuery(FunctionalityFilterRequest $request){
        $query = Functionality::query();

        // En caso de que quieras filtrar por módulo
        if ($request->filled('module_id')) {
            $query->where('module_id', $request->input('module_id'));
        }

        // Filtros dinámicos
        $filters = [
            'label' => fn($q, $v) => $q->whereRaw('LOWER(label) LIKE ?', ['%' . strtolower($v) . '%']),
            'name' => fn($q, $v) => $q->whereRaw('LOWER(name) LIKE ?', ['%' . strtolower($v) . '%'])
        ];

        foreach ($filters as $key => $callback) {
            if ($request->filled($key)) {
                $callback($query, $request->input($key));
            }
        }

        // Ordenación
        $sortField = $request->input('sort_field', 'name');
        $sortDirection = $request->input('sort_direction', 'ASC');
        $allowedSortFields = ['label', 'name'];

        if (!in_array($sortField, $allowedSortFields)) {
            $sortField = 'label';
        }

        return $query->orderBy($sortField, $sortDirection); 
    }

    /**
     * 2. Guardar nueva funcionalidad.
     */
    public function store(FunctionalityStoreRequest $request){
        $validated = $request->validated();

        $slug = Str::slug($request->name);

        //El valor debe ser único:
        if(Functionality::where('slug', $slug)->exists()){
            return redirect()->route('modules.edit', $request->module_id)
            ->with('alert', __('funcionalidad_repetida'));
            exit;
        }

        $label = Str::slug($request->label);
        //Label se genera con _ como separador, por lo que lo sustituimos:
        $label = str_replace('-', '_', $label);

        $f = new Functionality;
        $f->name = strtolower($request->name);
        $f->slug = $slug;
        $f->label = $label;
        $f->module_id = $request->module_id;
        $f->save();

        //Creando permisos de la funcionalidad:
        $this->setPermissions($f);

        //Guardar .json de módulos opcionales:
        $this->jsonOptionalModules();

        //Generar .json de funcionalidades:
        $this->jsonFunctionalities();

        return redirect()->route('modules.edit', [$request->module_id, 'functionalities'])
            ->with('msg', __('funcionalidad_creada_msg'))
            ->with('new_functionality', new FunctionalityResource($f));
    }

    
    /**
     * 3. Editar funcionalidad.
     */
    public function edit(Functionality $functionality){
        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));

        //Formateo de datos:
        $functionality->formatted_created_at = Carbon::parse($functionality->created_at)->format($locale[4].' H:i:s');
        $functionality->formatted_updated_at = Carbon::parse($functionality->updated_at)->format($locale[4].' H:i:s');

        $module = Module::select('id', 'label')->find($functionality->module_id);
        $module_name = __($module->label);

        return Inertia::render('Admin/Functionality/Edit', [
            "title" => __($this->option),
            "subtitle" => __('funcionalidad_editar'),
            "module" => $this->module,
            "slug" => 'modules',
            "functionality" => $functionality,
            "module_name" => $module_name,
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions
        ]);       
    }

    /**
     * 4. Actualizar funcionalidad.
     */
    public function update(FunctionalityUpdateRequest $request, Functionality $functionality){
        $functionality->label = strtolower($request->label);
        $functionality->save();

        //Guardar .json de módulos opcionales:
        $this->jsonOptionalModules(); 

        //Generar .json de funcionalidades:
        $this->jsonFunctionalities();

        return redirect()->route('modules.edit', [$functionality->module_id, 'functionalities'])
            ->with('msg', __('funcionalidad_actualizada_msg'));
    }

    /**
     * 5. Eliminar funcionalidad.
     */
    public function destroy(Functionality $functionality){
        $functionality->delete();

        //Guardar .json de módulos opcionales:
        $this->jsonOptionalModules(); 

        //Generar .json de funcionalidades:
        $this->jsonFunctionalities();

        return redirect()->route('modules.edit', [$functionality->module_id, 'functionalities'])
            ->with('msg', __('funcionalidad_eliminada'));
    }

    /**
     * 6. Generar permisos de la funcionalidad.
     */
    public function setPermissions($functionality){
        $methods = config('constants.METHODS_');

        foreach($methods as $method){
            //Comprobamos que no exista previamente:
            Permission::firstOrCreate([
                'name' => strtolower($functionality->slug).'.'.$method[0]
            ]);
        }
    }

}
