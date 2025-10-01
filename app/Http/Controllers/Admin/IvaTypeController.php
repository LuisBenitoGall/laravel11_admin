<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

//Models:
use App\Models\IvaType;
use App\Models\UserColumnPreference;

//Requests:
use App\Http\Requests\IvaTypeFilterRequest;
use App\Http\Requests\IvaTypeStoreRequest;
use App\Http\Requests\IvaTypeUpdateRequest;

//Resources:
use App\Http\Resources\IvaTypeResource;

//Traits
use App\Traits\HasUserPermissionsTrait;
use App\Traits\LocaleTrait;

class IvaTypeController extends Controller{
    /**
     * 1. Listado de tipos de IVA.
     * 1.1. Data para exportación.
     * 1.2. Data Query.
     * 2. Formulario nuevo tipo de IVA.
     * 3. Guardar nuevo tipo de IVA.
     * 4. Editar tipo de IVA.
     * 5. Actualizar tipo de IVA.
     * 6. Eliminar tipo de IVA.
     * 7. Actualizar estado.
     */
    
    use HasUserPermissionsTrait;
    use LocaleTrait;

    private $module = 'settings';
    private $option = 'configuracion';
    protected array $permissions = [];

    public function __construct(){
        if(session('currentCompany')){
            $this->permissions = $this->resolvePermissions([
                'iva-types.create',
                'iva-types.destroy',
                'iva-types.edit',
                'iva-types.index',
                'iva-types.search',
                'iva-types.show',
                'iva-types.update'
            ]);   
        } 
    }   

    /**
     * 1. Listado de tipos de IVA.
     */
    public function index(IvaTypeFilterRequest $request){
        $perPage = $request->input('per_page', config('constants.RECORDS_PER_PAGE_DEFAULT_'));

        $iva_types = $this->dataQuery($request)->paginate($perPage)->onEachSide(1);

        return Inertia::render('Admin/IvaType/Index', [
            "title" => __($this->option),
            "subtitle" => __('iva_tipos'),
            "module" => $this->module,
            "slug" => 'iva-types',
            "iva_types" => IvaTypeResource::collection($iva_types),
            "queryParams" => request()->query() ?: null,
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions,
            "columnPreferences" => UserColumnPreference::forUserAndTables(
                auth()->user()->id,
                ['tblIvaTypes'] 
            )
        ]); 
    }  

    /**
     * 1.1. Data para exportación.
     */
    public function filteredData(IvaTypeFilterRequest $request){
        $cacheKey = 'filtered_iva_types_' . md5(json_encode($request->all()));

        $iva_types = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($request) {
            return $this->dataQuery($request)->get();
        });

        return response()->json([
            'iva_types' => IvaTypeResource::collection($iva_types)
        ]);    
    }

    /**
     * 1.2. Data Query.
     */
    private function dataQuery(IvaTypeFilterRequest $request){
        $query = IvaType::query();

        // Filtros dinámicos
        $filters = [
            'name' => fn($q, $v) => $q->where('name', 'like', "%$v%"),
            'iva' => fn($q, $v) => $q->where('iva', 'like', "%$v%")
        ];

        foreach($filters as $key => $callback){
            if($request->filled($key)){
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
        $sortField = $request->input('sort_field', 'status');
        $sortDirection = $request->input('sort_direction', 'DESC');
        $allowedSortFields = ['name', 'iva', 'status'];

        if (!in_array($sortField, $allowedSortFields)) {
            $sortField = 'status';
        }        

        return $query->orderBy($sortField, $sortDirection);
    }

    /**
     * 2. Formulario nuevo tipo de IVA.
     */
    public function create(){
        return Inertia::render('Admin/IvaType/Create', [
            "title" => __($this->option),
            "subtitle" => __('tipo_nuevo'),
            'module' => $this->module,
            "slug" => 'iva-types',
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions
        ]);    
    }

    /**
     * 3. Guardar nuevo tipo de IVA.
     */
    public function store(IvaTypeStoreRequest $request){
        $type = new IvaType();
        $type->name = $request->name;
        $type->iva = $request->iva;
        $type->equivalence_surcharge = $request->equivalence_surcharge;
        $type->status = filter_var($request->status, FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
        $type->save(); 

        return redirect()->route('iva-types.index')
            ->with('msg', __('tipo_creado_msg'));
    }

    /**
     * 4. Editar tipo de IVA.
     */
    public function edit(IvaType $type){
        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));

        //Formateo de datos:
        $type->formatted_created_at = Carbon::parse($type->created_at)->format($locale[4].' H:i:s');
        $type->formatted_updated_at = Carbon::parse($type->updated_at)->format($locale[4].' H:i:s');

        return Inertia::render('Admin/IvaType/Edit', [
            "title" => __($this->option),
            "subtitle" => __('iva_tipo_editar').' '.ucwords($type->name),
            "module" => $this->module,
            "slug" => 'iva-types',
            "availableLocales" => LocaleTrait::availableLocales(),
            "type" => $type,
            "msg" => session('msg'),
            "alert" => session('alert'),
            "permissions" => $this->permissions
        ]);
    }

    /**
     * 5. Actualizar tipo de IVA.
     */
    public function update(IvaTypeUpdateRequest $request, IvaType $type){
        try{
            $validated = $request->validated();

            $type->name = $request->name;
            $type->iva = $request->iva;
            $type->equivalence_surcharge = $request->equivalence_surcharge;
            $type->status = filter_var($request->status, FILTER_VALIDATE_BOOLEAN) ? 1 : 0;

            $type->save();

            return redirect()->route('iva-types.edit', $type->id)
            ->with('msg', __('tipo_actualizado_msg'));

        }catch(\Throwable $e){
            Log::error('Error en update(): ' . $e->getMessage());
            abort(500, 'Error interno del servidor');
        }
    }

    /**
     * 6. Eliminar tipo de IVA.
     */
    public function destroy(IvaType $type){
        $type->delete();

        return redirect()->route('iva-types.index')->with('msg', __('iva_tipo_eliminado'));
    }

    /**
     * 7. Actualizar estado.
     */
    public function status(Request $request){
        $type = IvaType::find($request->id);

        if (!$type) {
            return response()->json(['error' => __('tipo_no_encontrado')], 404);
        }

        $type->status = !$type->status;
        $type->save();

        return response()->json([
            'success' => true,
            'message' => __('estado_actualizado_ok'),
            'new_status' => $type->status
        ]);
    }
}
