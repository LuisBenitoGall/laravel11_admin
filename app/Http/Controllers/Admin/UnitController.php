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
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

//Models:
use App\Models\Unit;
use App\Models\UserColumnPreference;

//Requests:
use App\Http\Requests\UnitFilterRequest;
use App\Http\Requests\UnitStoreRequest;
use App\Http\Requests\UnitUpdateRequest;

//Resources:
use App\Http\Resources\UnitResource;

//Traits
use App\Traits\HasUserPermissionsTrait;
use App\Traits\LocaleTrait;

class UnitController extends Controller{
    /**
     * 1. Listado de unidades.
     * 1.1. Data para exportación.
     * 1.2. Data Query.
     * 2. Formulario nueva unidad.
     * 3. Guardar nueva unidad.
     * 4. Editar unidad.
     * 5. Actualizar unidad.
     * 6. Eliminar unidad.
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
                'units.create',
                'units.destroy',
                'units.edit',
                'units.index',
                'units.search',
                'units.show',
                'units.update'
            ]);   
        } 
    }   

    /**
     * 1. Listado de unidades.
     */
    public function index(UnitFilterRequest $request){
        $perPage = $request->input('per_page', config('constants.RECORDS_PER_PAGE_DEFAULT_'));

        $units = $this->dataQuery($request)->paginate($perPage)->onEachSide(1);

        return Inertia::render('Admin/Unit/Index', [
            "title" => __($this->option),
            "subtitle" => __('unidades'),
            "module" => $this->module,
            "slug" => 'units',
            "units" => UnitResource::collection($units),
            "queryParams" => request()->query() ?: null,
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions,
            "columnPreferences" => UserColumnPreference::forUserAndTables(
                auth()->user()->id,
                ['tblUnits'] 
            )
        ]); 
    }  

    /**
     * 1.1. Data para exportación.
     */
    public function filteredData(UnitFilterRequest $request){
        $cacheKey = 'filtered_units_' . md5(json_encode($request->all()));

        $units = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($request) {
            return $this->dataQuery($request)->get();
        });

        return response()->json([
            'units' => UnitResource::collection($units)
        ]);    
    }

    /**
     * 1.2. Data Query.
     */
    private function dataQuery(UnitFilterRequest $request){
        $query = Unit::query();

        // Filtros dinámicos
        $filters = [
            'name' => fn($q, $v) => $q->where('name', 'like', "%$v%"),
            'slug' => fn($q, $v) => $q->where('slug', 'like', "%$v%"),
            'symbol' => fn($q, $v) => $q->where('symbol', 'like', "%$v%")
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
        $allowedSortFields = ['name', 'slug', 'symbol', 'status'];

        if (!in_array($sortField, $allowedSortFields)) {
            $sortField = 'status';
        }        

        return $query->orderBy($sortField, $sortDirection);
    }

    /**
     * 2. Formulario nueva unidad.
     */
    public function create(){
        return Inertia::render('Admin/Unit/Create', [
            "title" => __($this->option),
            "subtitle" => __('unidad_nueva'),
            'module' => $this->module,
            "slug" => 'units',
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions
        ]);    
    }

    /**
     * 3. Guardar nueva unidad.
     */
    public function store(UnitStoreRequest $request){
        $slug = Str::slug($request->name);

        $u = new Unit();
        $u->name = $request->name;
        $u->slug = $slug;
        $u->symbol = $request->symbol;
        $u->status = filter_var($request->status, FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
        $u->save();

        return redirect()->route('units.index')
            ->with('msg', __('unidad_creada_msg'));
    }

    /**
     * 4. Editar unidad.
     */
    public function edit(Unit $unit){
        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));

        //Formateo de datos:
        $unit->formatted_created_at = Carbon::parse($unit->created_at)->format($locale[4].' H:i:s');
        $unit->formatted_updated_at = Carbon::parse($unit->updated_at)->format($locale[4].' H:i:s');

        return Inertia::render('Admin/Unit/Edit', [
            "title" => __($this->option),
            "subtitle" => __('unidad_editar').' '.ucwords($unit->name),
            "module" => $this->module,
            "slug" => 'units',
            "availableLocales" => LocaleTrait::availableLocales(),
            "unit" => $unit,
            "msg" => session('msg'),
            "alert" => session('alert'),
            "permissions" => $this->permissions
        ]);
    }

    /**
     * 5. Actualizar unidad.
     */
    public function update(UnitUpdateRequest $request, Unit $unit){
        try{
            $validated = $request->validated();

            $slug = Str::slug($validated['name']);

            $unit->name = $validated['name'];
            $unit->slug = $slug;
            $unit->symbol = $request->symbol;
            $unit->status = filter_var($request->status, FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
            $unit->save();

            return redirect()->route('units.edit', $unit->id)
            ->with('msg', __('unidad_actualizada_msg'));

        }catch(\Throwable $e){
            Log::error('Error en update(): ' . $e->getMessage());
            abort(500, 'Error interno del servidor');
        }
    }

    /**
     * 6. Eliminar unidad.
     */
    public function destroy(Unit $unit){
        $unit->delete();

        return redirect()->route('units.index')->with('msg', __('unidad_eliminada'));
    }

    /**
     * 7. Actualizar estado.
     */
    public function status(Request $request){
        $unit = Unit::find($request->id);

        if (!$unit) {
            return response()->json(['error' => __('unidad_no_encontrada')], 404);
        }

        $unit->status = !$unit->status;
        $unit->save();

        return response()->json([
            'success' => true,
            'message' => __('estado_actualizado_ok'),
            'new_status' => $unit->status
        ]);
    }
}
