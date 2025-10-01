<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

//Models:
use App\Models\Currency;
use App\Models\UserColumnPreference;

//Requests:
use App\Http\Requests\CurrencyFilterRequest;
use App\Http\Requests\CurrencyStoreRequest;
use App\Http\Requests\CurrencyUpdateRequest;

//Resources:
use App\Http\Resources\CurrencyResource;

//Traits
use App\Traits\HasUserPermissionsTrait;
use App\Traits\LocaleTrait;

class CurrencyController extends Controller{
    /**
     * 1. Listado de monedas.
     * 1.1. Data para exportación.
     * 1.2. Data Query.
     * 2. Formulario nueva moneda.
     * 3. Guardar nueva moneda.
     * 4. Editar moneda.
     * 5. Actualizar moneda.
     * 6. Eliminar moneda. 
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
                'currencies.create',
                'currencies.destroy',
                'currencies.edit',
                'currencies.index',
                'currencies.search',
                'currencies.show',
                'currencies.update'
            ]);   
        } 
    }   
    
    /**
     * 1. Listado de monedas.
     */
    public function index(Request $request){
        // Importación de monedas desde .json solo si la tabla está vacía
        if (Currency::count() === 0) {
            Currency::import();
        }

        $perPage = $request->input('per_page', config('constants.RECORDS_PER_PAGE_DEFAULT_'));

        $currencies = $this->dataQuery($request)->paginate($perPage)->onEachSide(1);

        return Inertia::render('Admin/Currency/Index', [
            "title" => __($this->option),
            "subtitle" => __('monedas'),
            "module" => $this->module,
            "slug" => 'currencies',
            "currencies" => CurrencyResource::collection($currencies),
            "queryParams" => request()->query() ?: null,
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions,
            "columnPreferences" => UserColumnPreference::forUserAndTables(
                auth()->user()->id,
                ['tblCurrencies'] 
            )
        ]); 
    }  

    /**
     * 1.1. Data para exportación.
     */
    public function filteredData(Request $request){
        $cacheKey = 'filtered_currencies_' . md5(json_encode($request->all()));

        $currencies = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($request) {
            return $this->dataQuery($request)->get();
        });

        return response()->json([
            'currencies' => CurrencyResource::collection($currencies)
        ]);    
    }

    /**
     * 1.2. Data Query.
     */
    private function dataQuery(Request $request){
        $query = Currency::query();

        // Filtros dinámicos
        $filters = [
            'name' => fn($q, $v) => $q->where('name', 'like', "%$v%"),
            'code' => fn($q, $v) => $q->where('code', 'like', "%$v%"),
            'number' => fn($q, $v) => $q->where('number', 'like', "%$v%"),
            'symbol' => fn($q, $v) => $q->where('symbol', 'like', "%$v%")
        ];

        foreach($filters as $key => $callback){
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
        $sortField = $request->input('sort_field', 'status');
        $sortDirection = $request->input('sort_direction', 'DESC');
        $allowedSortFields = ['name', 'code', 'number', 'symbol', 'status'];

        if (!in_array($sortField, $allowedSortFields)) {
            $sortField = 'name';
        }        

        return $query->orderBy($sortField, $sortDirection);
    }

    /**
     * 2. Formulario nueva moneda.
     */
    public function create(){
        return Inertia::render('Admin/Currency/Create', [
            "title" => __($this->option),
            "subtitle" => __('moneda_nueva'),
            "module" => $this->module,
            "slug" => 'currencies',
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions
        ]);       
    }

    /**
     * 3. Guardar nueva moneda.
     */
    public function store(CurrencyStoreRequest $request){
        $slug = Str::slug($request->input('name'));
        $status = $request->input('status')? 1:0;

        Currency::create([
            'name' => $request->input('name'),
            'slug' => $slug,
            'code' => $request->input('code'),
            'number' => $request->input('number'), 
            'symbol' => $request->input('symbol'),
            'status' => $status 
        ]); 

        return redirect()->route('currencies.index')
            ->with('msg', __('moneda_creada_msg'));
    }

    /**
     * 4. Editar moneda.
     */
    public function edit(Currency $currency){
        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));

        //Formateo de datos:
        $currency->formatted_created_at = Carbon::parse($currency->created_at)->format($locale[4].' H:i:s');
        $currency->formatted_updated_at = Carbon::parse($currency->updated_at)->format($locale[4].' H:i:s');

        return Inertia::render('Admin/Currency/Edit', [
            "title" => __($this->option),
            "subtitle" => __('moneda_editar'),
            "module" => $this->module,
            "slug" => 'currencies',
            "currency" => $currency,
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions
        ]);     
    }

    /**
     * 5. Actualizar moneda.
     */
    public function update(CurrencyUpdateRequest $request, Currency $currency){
        try{
            $validated = $request->validated();

            $slug = Str::slug($request->name);

            $currency->name = $request->name;
            $currency->slug = $slug;
            $currency->code = $request->code;
            $currency->number = $request->number;
            $currency->symbol = $request->symbol;
            $currency->status = filter_var($request->status, FILTER_VALIDATE_BOOLEAN)? 1:0;
            $currency->save();

            return redirect()->route('currencies.edit', $currency)
            ->with('msg', __('moneda_actualizada_msg'));

        }catch(\Throwable $e){
            Log::error('Error en update(): ' . $e->getMessage());
            abort(500, 'Error interno del servidor');
        }
    }

    /**
     * 6. Eliminar moneda.
     */
    public function destroy(Request $request, Currency $currency){
        $currency->delete();

        //Mantenimiento de filtros:
        $queryParams = $request->only([
            'name', 'code', 'number', 'symbol', 'date_from', 'date_to', 'sort_field', 'sort_direction', 'per_page', 'page'
        ]);

        return redirect()->route('currencies.index', $queryParams)->with('msg', __('moneda_eliminada'));
    }

    /**
     * 7. Actualizar estado.
     */
    public function status(Request $request){
        $currency = Currency::find($request->id);
$antes = clone $currency;
        if (!$currency) {
            return response()->json(['error' => __('moneda_no_encontrada')], 404);
        }

        $currency->status = !$currency->status;
        $currency->save();
//dd($currency, $antes);
        return response()->json([
            'success' => true,
            'message' => __('estado_actualizado_ok'),
            'new_status' => $currency->status
        ]);
    }
}
