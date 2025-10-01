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
use App\Models\Country;
use App\Models\Province;
use App\Models\UserColumnPreference;
use App\Models\Town;

//Requests:
use App\Http\Requests\TownFilterRequest;
use App\Http\Requests\TownStoreRequest;
use App\Http\Requests\TownUpdateRequest;

//Resources:
use App\Http\Resources\TownResource;

//Traits
use App\Traits\HasUserPermissionsTrait;
use App\Traits\LocaleTrait;

class TownController extends Controller{
    /**
     * 1. Listado de poblaciones por provincia.
     * 1.1. Data para exportación.
     * 1.2. Data Query.
     * 2. Formulario nueva población.
     * 3. Guardar nueva población.
     * 4. Editar población.
     * 5. Actualizar población.
     * 6. Eliminar población.
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
                'provinces.index',
                'provinces.edit',
                'towns.create',
                'towns.destroy',
                'towns.edit',
                'towns.index',
                'towns.search',
                'towns.show',
                'towns.update'
            ]);   
        } 
    }   

    /**
     * 1. Listado de poblaciones por provincia.
     */
    public function index(TownFilterRequest $request, Province $province){
        $perPage = $request->input('per_page', config('constants.RECORDS_PER_PAGE_DEFAULT_'));

        $towns = $this->dataQuery($request, $province->id)->paginate($perPage)->onEachSide(1);

        $country = $province && $province->country_id? Country::select('id', 'name', 'slug')->find($province->country_id):false;

        return Inertia::render('Admin/Town/Index', [
            "title" => __($this->option),
            "subtitle" => __('poblaciones').' - '.$province->name.' ('.$country->name.')',
            "module" => $this->module,
            "slug" => 'countries',
            "towns" => TownResource::collection($towns),
            "province" => $province,
            "country" => $country,
            "queryParams" => request()->query() ?: null,
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions,
            "columnPreferences" => UserColumnPreference::forUserAndTables(
                auth()->user()->id,
                ['tblTowns'] 
            )
        ]); 
    } 

    /**
     * 1.1. Data para exportación.
     */
    public function filteredData(TownFilterRequest $request, Province $province){
        $cacheKey = 'filtered_towns_' . md5(json_encode($request->all()));

        $towns = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($request, $province) {
            return $this->dataQuery($request, $province->id)->get();
        });

        return response()->json([
            'towns' => TownResource::collection($towns)
        ]);
    }

    /**
     * 1.2. Data Query.
     */
    private function dataQuery(TownFilterRequest $request, $province_id){
        $query = Town::select('towns.*', 'provinces.name AS province')
        ->join('provinces', 'towns.province_id', '=', 'provinces.id')
        ->where('towns.province_id', $province_id);    

        // Filtros dinámicos
        $filters = [
            'name' => fn($q, $v) => $q->where('towns.name', 'like', "%$v%")
        ];

        foreach($filters as $key => $callback){
            if ($request->filled($key)) {
                $callback($query, $request->input($key));
            }
        }

        // Ordenación
        $sortField = $request->input('sort_field', 'name');
        $sortDirection = $request->input('sort_direction', 'ASC');
        $allowedSortFields = ['name'];

        if(!in_array($sortField, $allowedSortFields)){
            $sortField = 'name';
        }

        return $query->orderBy($sortField, $sortDirection);
    }

    /**
     * 2. Formulario nueva población.
     */
    public function create(Province $province){
        $country = $province && $province->country_id? Country::select('id', 'name', 'slug')->find($province->country_id):false;

        return Inertia::render('Admin/Town/Create', [
            "title" => __($this->option),
            "subtitle" => __('poblacion_nueva').' - '.$province->name.' ('.$country->name.')',
            'module' => $this->module,
            "slug" => 'countries',
            "province" => $province,
            "country" => $country,
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions
        ]);    
    }

    /**
     * 3. Guardar nueva población.
     */
    public function store(TownStoreRequest $request){
        //Guardando población:
        $town = Town::saveTown($request);        

        return redirect()->route('towns.edit', $town->id)
            ->with('msg', __('poblacion_creada_msg'));
    }

    /**
     * 4. Editar población.
     */
    public function edit(Town $town){
        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));

        $province = Province::find($town->province_id);

        //Formateo de datos:
        $town->formatted_created_at = Carbon::parse($town->created_at)->format($locale[4].' H:i:s');
        $town->formatted_updated_at = Carbon::parse($town->updated_at)->format($locale[4].' H:i:s');

        return Inertia::render('Admin/Town/Edit', [
            "title" => __($this->option),
            "subtitle" => __('poblacion_editar').' '.ucwords($town->name),
            "module" => $this->module,
            "slug" => 'countries',
            "availableLocales" => LocaleTrait::availableLocales(),
            "town" => $town,
            "province" => $province,
            "msg" => session('msg'),
            "alert" => session('alert'),
            "permissions" => $this->permissions
        ]);
    }

    /**
     * 5. Actualizar población.
     */
    public function update(TownUpdateRequest $request, Town $town){
        try {
            $validated = $request->validated();

            $slug = Str::slug($validated['name']);

            $town->name = $validated['name'];
            $town->slug = $slug;
            $town->status = filter_var($request->status, FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
            $town->save();

            return redirect()->route('towns.edit', $town->id)
            ->with('msg', __('poblacion_actualizada_msg'));

        } catch (\Throwable $e) {
            Log::error('Error en update(): ' . $e->getMessage());
            abort(500, 'Error interno del servidor');
        }
    }

    /**
     * 6. Eliminar población.
     */
    public function destroy(Town $town){
        $town->delete();

        return redirect()->route('towns.index', $town->province_id)->with('msg', __('poblacion_eliminada'));
    }

    /**
     * 7. Actualizar estado.
     */
    public function status(Request $request){
        $town = Town::find($request->id);

        if(!$town){
            return response()->json(['error' => __('poblacion_no_encontrada')], 404);
        }

        $town->status = !$town->status;
        $town->save();

        return response()->json([
            'success' => true,
            'message' => __('estado_actualizado_ok'),
            'new_status' => $town->status
        ]);
    }
}
