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
use App\Models\UserColumnPreference;

//Requests:
use App\Http\Requests\CountryFilterRequest;
use App\Http\Requests\CountryStoreRequest;
use App\Http\Requests\CountryUpdateRequest;

//Resources:
use App\Http\Resources\CountryResource;

//Traits
use App\Traits\HasUserPermissionsTrait;
use App\Traits\LocaleTrait;

class CountryController extends Controller{
    /**
     * 1. Listado de países.
     * 1.1. Data para exportación.
     * 1.2. Data Query.
     * 2. Formulario nuevo país.
     * 3. Guardar nuevo país.
     * 4. Editar país.
     * 5. Actualizar país.
     * 6. Eliminar país.
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
                'countries.create',
                'countries.destroy',
                'countries.edit',
                'countries.index',
                'countries.search',
                'countries.show',
                'countries.update'
            ]);   
        } 
    }   

    /**
     * 1. Listado de países.
     */
    public function index(CountryFilterRequest $request){
        $perPage = $request->input('per_page', config('constants.RECORDS_PER_PAGE_DEFAULT_'));

        $countries = $this->dataQuery($request)->paginate($perPage)->onEachSide(1);

        return Inertia::render('Admin/Country/Index', [
            "title" => __($this->option),
            "subtitle" => __('paises'),
            "module" => $this->module,
            "slug" => 'countries',
            "countries" => CountryResource::collection($countries),
            "queryParams" => request()->query() ?: null,
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions,
            "columnPreferences" => UserColumnPreference::forUserAndTables(
                auth()->user()->id,
                ['tblCountries'] 
            )
        ]); 
    }  

    /**
     * 1.1. Data para exportación.
     */
    public function filteredData(CountryFilterRequest $request){
        $cacheKey = 'filtered_countries_' . md5(json_encode($request->all()));

        $countries = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($request) {
            return $this->dataQuery($request)->get();
        });

        return response()->json([
            'countries' => CountryResource::collection($countries)
        ]);    
    }

    /**
     * 1.2. Data Query.
     */
    private function dataQuery(CountryFilterRequest $request){
        $query = Country::query();

        // Filtros dinámicos
        $filters = [
            'name' => fn($q, $v) => $q->where('name', 'like', "%$v%"),
            'code' => fn($q, $v) => $q->where('code', 'like', "%$v%"),
            'alfa2' => fn($q, $v) => $q->where('alfa2', 'like', "%$v%"),
            'alfa3' => fn($q, $v) => $q->where('alfa3', 'like', "%$v%")
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
        $allowedSortFields = ['name', 'code', 'alfa2', 'alfa3', 'status'];

        if (!in_array($sortField, $allowedSortFields)) {
            $sortField = 'status';
        }        

        return $query->orderBy($sortField, $sortDirection);
    }

    /**
     * 2. Formulario nuevo país.
     */
    public function create(){
        return Inertia::render('Admin/Country/Create', [
            "title" => __($this->option),
            "subtitle" => __('pais_nuevo'),
            'module' => $this->module,
            "slug" => 'countries',
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions
        ]);    
    }

    /**
     * 3. Guardar nuevo país.
     */
    public function store(CountryStoreRequest $request){
        //Guardando país:
        $country = Country::saveCountry($request);        

        return redirect()->route('countries.edit', $country->id)
            ->with('msg', __('pais_creado_msg'));
    }

    /**
     * 4. Editar provincia.
     */
    public function edit(Country $country){
        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));

        //Formateo de datos:
        $country->formatted_created_at = Carbon::parse($country->created_at)->format($locale[4].' H:i:s');
        $country->formatted_updated_at = Carbon::parse($country->updated_at)->format($locale[4].' H:i:s');

        return Inertia::render('Admin/Country/Edit', [
            "title" => __($this->option),
            "subtitle" => __('pais_editar').' '.ucwords($country->name),
            "module" => $this->module,
            "slug" => 'countries',
            "availableLocales" => LocaleTrait::availableLocales(),
            "country" => $country,
            "msg" => session('msg'),
            "alert" => session('alert'),
            "permissions" => $this->permissions
        ]);
    }

    /**
     * 5. Actualizar país.
     */
    public function update(CountryUpdateRequest $request, Country $country){
        try{
            $validated = $request->validated();

            $slug = Str::slug($validated['name']);

            $country->name = $validated['name'];
            $country->slug = $slug;
            $country->code = $request->code;
            $country->alfa2 = $request->alfa2;
            $country->alfa3 = $request->alfa3;
            $country->flag = $request->flag;
            $country->status = filter_var($request->status, FILTER_VALIDATE_BOOLEAN) ? 1 : 0;

            $country->save();

            return redirect()->route('countries.edit', $country->id)
            ->with('msg', __('pais_actualizado_msg'));

        }catch(\Throwable $e){
            Log::error('Error en update(): ' . $e->getMessage());
            abort(500, 'Error interno del servidor');
        }
    }

    /**
     * 6. Eliminar país.
     */
    public function destroy(Country $country){
        $country->delete();

        return redirect()->route('countries.index')->with('msg', __('pais_eliminado'));
    }

    /**
     * 7. Actualizar estado.
     */
    public function status(Request $request){
        $country = Country::find($request->id);

        if (!$country) {
            return response()->json(['error' => __('pais_no_encontrado')], 404);
        }

        $country->status = !$country->status;
        $country->save();

        return response()->json([
            'success' => true,
            'message' => __('estado_actualizado_ok'),
            'new_status' => $country->status
        ]);
    }
}
