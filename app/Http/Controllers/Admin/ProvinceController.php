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
use App\Models\Country;
use App\Models\Province;
use App\Models\UserColumnPreference;

//Requests:
use App\Http\Requests\ProvinceFilterRequest;
use App\Http\Requests\ProvinceStoreRequest;
use App\Http\Requests\ProvinceUpdateRequest;

//Resources:
use App\Http\Resources\ProvinceResource;

//Traits
use App\Traits\HasUserPermissionsTrait;
use App\Traits\LocaleTrait;

class ProvinceController extends Controller{
    /**
     * 1. Listado de provincias por país.
     * 1.1. Data para exportación.
     * 1.2. Data Query.
     * 2. Formulario nueva provincia.
     * 3. Guardar nueva provincia.
     * 4. Editar provincia.
     * 5. Actualizar provincia.
     * 6. Eliminar provincia.
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
                'countries.index',
                'countries.edit',
                'provinces.create',
                'provinces.destroy',
                'provinces.edit',
                'provinces.index',
                'provinces.search',
                'provinces.show',
                'provinces.update'
            ]);   
        } 
    }   

    /**
     * 1. Listado de provincias por país.
     */
    public function index(ProvinceFilterRequest $request, Country $country){
        $perPage = $request->input('per_page', config('constants.RECORDS_PER_PAGE_DEFAULT_'));

        $provinces = $this->dataQuery($request, $country->id)->paginate($perPage)->onEachSide(1);

        return Inertia::render('Admin/Province/Index', [
            "title" => __($this->option),
            "subtitle" => __('provincias').' - '.$country->name,
            "module" => $this->module,
            "slug" => 'countries',
            "provinces" => ProvinceResource::collection($provinces),
            "country" => $country,
            "queryParams" => request()->query() ?: null,
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions,
            "columnPreferences" => UserColumnPreference::forUserAndTables(
                auth()->user()->id,
                ['tblProvinces'] 
            )
        ]); 
    } 

    /**
     * 1.1. Data para exportación.
     */
    public function filteredData(ProvinceFilterRequest $request, Country $country){
        $cacheKey = 'filtered_provinces_' . md5(json_encode($request->all()));

        $provinces = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($request, $country) {
            return $this->dataQuery($request, $country->id)->get();
        });

        return response()->json([
            'provinces' => ProvinceResource::collection($provinces)
        ]);
    }

    /**
     * 1.2. Data Query.
     */
    private function dataQuery(ProvinceFilterRequest $request, $country_id){
        $query = Province::select('provinces.*', 'countries.name AS country')
        ->join('countries', 'provinces.country_id', '=', 'countries.id')
        ->where('provinces.country_id', $country_id);    

        // Filtros dinámicos
        $filters = [
            'name' => fn($q, $v) => $q->where('provinces.name', 'like', "%$v%")
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
     * 2. Formulario nueva provincia.
     */
    public function create(Country $country){
        return Inertia::render('Admin/Province/Create', [
            "title" => __($this->option),
            "subtitle" => __('provincia_nueva').' - '.$country->name,
            "module" => $this->module,
            "slug" => 'countries',
            "country" => $country,
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions
        ]);    
    }

    /**
     * 3. Guardar nueva provincia.
     */
    public function store(ProvinceStoreRequest $request){
        //Guardando provincia:
        $province = Province::saveProvince($request);        

        return redirect()->route('provinces.edit', $province->id)
            ->with('msg', __('provincia_creada_msg'));
    }

    /**
     * 4. Editar provincia.
     */
    public function edit(Province $province){
        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));

        $country = Country::find($province->country_id);

        //Formateo de datos:
        $province->formatted_created_at = Carbon::parse($province->created_at)->format($locale[4].' H:i:s');
        $province->formatted_updated_at = Carbon::parse($province->updated_at)->format($locale[4].' H:i:s');

        return Inertia::render('Admin/Province/Edit', [
            "title" => __($this->option),
            "subtitle" => __('provincia_editar').' '.ucwords($province->name),
            "module" => $this->module,
            "slug" => 'countries',
            "availableLocales" => LocaleTrait::availableLocales(),
            "country" => $country,
            "province" => $province,
            "msg" => session('msg'),
            "alert" => session('alert'),
            "permissions" => $this->permissions
        ]);
    }

    /**
     * 5. Actualizar provincia.
     */
    public function update(ProvinceUpdateRequest $request, Province $province){
        try {
            $validated = $request->validated();

            $slug = Str::slug($validated['name']);

            $province->name = $validated['name'];
            $province->slug = $slug;
            $province->status = filter_var($request->status, FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
            $province->save();

            return redirect()->route('provinces.edit', $province->id)
            ->with('msg', __('provincia_actualizada_msg'));

        } catch (\Throwable $e) {
            Log::error('Error en update(): ' . $e->getMessage());
            abort(500, 'Error interno del servidor');
        }
    }

    /**
     * 6. Eliminar provincia.
     */
    public function destroy(Province $province){
        $province->delete();

        return redirect()->route('provinces.index', $province->country_id)->with('msg', __('provincia_eliminada'));
    }

    /**
     * 7. Actualizar estado.
     */
    public function status(Request $request){
        $province = Province::find($request->id);

        if (!$province) {
            return response()->json(['error' => __('provincia_no_encontrada')], 404);
        }

        $province->status = !$province->status;
        $province->save();

        return response()->json([
            'success' => true,
            'message' => __('estado_actualizado_ok'),
            'new_status' => $province->status
        ]);
    }
}
