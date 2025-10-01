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
use App\Models\StockMovement;
use App\Models\UserColumnPreference;

//Requests:
use App\Http\Requests\StockMovementFilterRequest;
use App\Http\Requests\StockMovementStoreRequest;
use App\Http\Requests\StockMovementUpdateRequest;

//Resources:
use App\Http\Resources\StockMovementResource;

//Traits
use App\Traits\HasSignStockMovementsTrait;
use App\Traits\HasUserPermissionsTrait;
use App\Traits\LocaleTrait;

class StockMovementController extends Controller{
    /**
     * 1. Listado de movimientos.
     * 1.1. Data para exportación.
     * 1.2. Data Query.
     * 2. Formulario nuevo movimiento.
     * 3. Guardar nuevo movimiento.
     * 4. Editar movimiento.
     * 5. Actualizar movimiento.
     * 6. Eliminar movimiento.
     * 7. Actualizar estado.
     * 8. Serializar campo explanation.
     */
    
    use HasSignStockMovementsTrait;
    use HasUserPermissionsTrait;
    use LocaleTrait;
    
    private $module = 'settings';
    private $option = 'configuracion';
    protected array $permissions = [];

    public function __construct(){
        if(session('currentCompany')){
            $this->permissions = $this->resolvePermissions([
                'stock-movements.create',
                'stock-movements.destroy',
                'stock-movements.edit',
                'stock-movements.index',
                'stock-movements.search',
                'stock-movements.show',
                'stock-movements.update'
            ]);   
        } 
    }  

    /**
     * 1. Listado de movimientos.
     */
    public function index(StockMovementFilterRequest $request){
        $perPage = $request->input('per_page', config('constants.RECORDS_PER_PAGE_DEFAULT_'));

        $stock_movements = $this->dataQuery($request)->paginate($perPage)->onEachSide(1);

        return Inertia::render('Admin/StockMovement/Index', [
            "title" => __($this->option),
            "subtitle" => __('stock_movimientos'),
            "module" => $this->module,
            "slug" => 'stock-movements',
            "stock_movements" => StockMovementResource::collection($stock_movements),
            "queryParams" => request()->query() ?: null,
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions,
            "columnPreferences" => UserColumnPreference::forUserAndTables(
                auth()->user()->id,
                ['tblStockMovements'] 
            )
        ]); 
    }  

    /**
     * 1.1. Data para exportación.
     */
    public function filteredData(StockMovementFilterRequest $request){
        $cacheKey = 'filtered_stock_movements_' . md5(json_encode($request->all()));

        $stock_movements = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($request) {
            return $this->dataQuery($request)->get();
        });

        return response()->json([
            'stock_movements' => StockMovementResource::collection($stock_movements)
        ]);    
    }

    /**
     * 1.2. Data Query.
     */
    private function dataQuery(StockMovementFilterRequest $request){
        $query = StockMovement::query();

        // Filtros dinámicos
        $filters = [
            'name' => fn($q, $v) => $q->where('name', 'like', "%$v%"),
            'acronym' => fn($q, $v) => $q->where('acronym', 'like', "%$v%"),
            'sign' => fn($q, $v) => $q->where('sign', 'like', "%$v%"),
            'explanation' => fn($q, $v) => $q->where('explanation', 'like', "%$v%")
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
        $sortField = $request->input('sort_field', 'name');
        $sortDirection = $request->input('sort_direction', 'DESC');
        $allowedSortFields = ['name', 'acronym', 'sign', 'explanation'];

        if (!in_array($sortField, $allowedSortFields)) {
            $sortField = 'name';
        }        

        return $query->orderBy($sortField, $sortDirection);
    }

    /**
     * 2. Formulario nuevo movimiento.
     */
    public function create(){
        return Inertia::render('Admin/StockMovement/Create', [
            "title" => __($this->option),
            "subtitle" => __('movimiento_nuevo'),
            'module' => $this->module,
            "slug" => 'stock-movements',
            "availableLocales" => LocaleTrait::availableLocales(),
            "signs" => HasSignStockMovementsTrait::signStockMovements(),
            "permissions" => $this->permissions
        ]);    
    }

    /**
     * 3. Guardar nuevo movimiento.
     */
    public function store(StockMovementStoreRequest $request){
        $basic = $request->basic? true:false;

        $strExplanation = $this->serializeExplanation($request);


        // $arrExplanation = [];
        // foreach(LocaleTrait::availableLocales() as $lang){
        //     $explanation = 'explanation_'.$lang;
        //     $arrExplanation[$lang] = $request->input($explanation);
        // }
        // $strExplanation = serialize($arrExplanation);

        $mov = new StockMovement();
        $mov->name = $request->name;
        $mov->acronym = strtolower($request->acronym);
        $mov->sign = $request->sign;
        $mov->basic = $basic;
        $mov->explanation = $strExplanation;
        $mov->save();

        return redirect()->route('stock-movements.index')
            ->with('msg', __('unidad_creada_msg'));
    }

    /**
     * 4. Editar movimiento.
     */
    public function edit(StockMovement $movement){
        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));

        //Deserializamos las columnas serializadas:
        $explanations = $movement->explanation? unserialize($movement->explanation):[];
        //Aseguramos que haya una entrada para cada locale (vacía si no existe)
        $locales = LocaleTrait::availableLocales();
        $explanations = array_merge(
            array_fill_keys($locales, ''), 
            $explanations
        );

        //Formateo de datos:
        $movement->formatted_created_at = Carbon::parse($movement->created_at)->format($locale[4].' H:i:s');
        $movement->formatted_updated_at = Carbon::parse($movement->updated_at)->format($locale[4].' H:i:s');

        return Inertia::render('Admin/StockMovement/Edit', [
            "title" => __($this->option),
            "subtitle" => __('movimiento_editar'),
            'module' => $this->module,
            "slug" => 'stock-movements',
            "availableLocales" => LocaleTrait::availableLocales(),
            "movement" => $movement,
            "explanations" => $explanations,
            "sign" => $movement->sign? HasSignStockMovementsTrait::signStockMovements()[$movement->sign]:'',
            "permissions" => $this->permissions
        ]);    
    }

    /**
     * 5. Actualizar movimiento.
     */
    public function update(StockMovementUpdateRequest $request, StockMovement $movement){
        try{
            $validated = $request->validated();

            $strExplanation = $this->serializeExplanation($request);

            $movement->name = $request->name;
            $movement->acronym = strtolower($request->acronym);
            $movement->explanation = $strExplanation;
            $movement->status = filter_var($request->status, FILTER_VALIDATE_BOOLEAN)? 1:0;
            $movement->save();

            return redirect()->route('stock-movements.edit', $movement)
            ->with('msg', __('movimiento_actualizado_msg'));

        }catch(\Throwable $e){
            Log::error('Error en update(): ' . $e->getMessage());
            abort(500, 'Error interno del servidor');
        }
    }

    /**
     * 6. Eliminar movimiento.
     */
    public function destroy(StockMovement $movement){
        $movement->delete();

        return redirect()->route('stock-movements.index')->with('msg', __('movimiento_eliminado'));
    }

    /**
     * 7. Actualizar estado.
     */
    public function status(Request $request){
        $movement = StockMovement::find($request->id);

        if (!$movement) {
            return response()->json(['error' => __('movimiento_no_encontrado')], 404);
        }

        $movement->status = !$movement->status;
        $movement->save();

        return response()->json([
            'success' => true,
            'message' => __('estado_actualizado_ok'),
            'new_status' => $movement->status
        ]);
    }

    /**
     * 8. Serializar campo explanation.
     */
    private static function serializeExplanation($request){
        $arrExplanation = [];
        foreach(LocaleTrait::availableLocales() as $lang){
            $explanation = 'explanation_'.$lang;
            $arrExplanation[$lang] = $request->input($explanation);
        }
        $strExplanation = serialize($arrExplanation);

        return $strExplanation;
    }
}
