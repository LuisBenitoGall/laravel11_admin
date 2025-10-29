<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Helpers\helpers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

//Models:
use App\Models\BudgetPattern;
use App\Models\CompanySetting;
use App\Models\UserColumnPreference;

//Requests:
use App\Http\Requests\BudgetPatternFilterRequest;
use App\Http\Requests\BudgetPatternStoreRequest;
use App\Http\Requests\BudgetPatternUpdateRequest;

//Resources:
use App\Http\Resources\BudgetPatternResource;

//Traits
use App\Traits\HasUserPermissionsTrait;
use App\Traits\LocaleTrait;

class BudgetPatternController extends Controller{
    /**
     * 1. Listado de patrones.
     * 1.1. Data para exportación.
     * 1.2. Data Query.
     * 2. Formulario nuevo patrón.
     * 3. Guardar nuevo patrón.
     * 4. Editar patrón.
     * 5. Actualizar patrón.
     * 6. Actualizar estado.
     * 7. Eliminar patrón.
     */
    
    use HasUserPermissionsTrait;
    use LocaleTrait;

    private $module = 'budgets';
    private $option = 'patrones_presupuestos';
    protected array $permissions = [];

    public function __construct(){
        if(session('currentCompany')){
            $this->permissions = $this->resolvePermissions([
                'budget-patterns.create',
                'budget-patterns.destroy',
                'budget-patterns.edit',
                'budget-patterns.index',
                'budget-patterns.search',
                'budget-patterns.show',
                'budget-patterns.update'
            ]);   
        } 
    }  

    /**
     * 1. Listado de patrones.
     */
    public function index(BudgetPatternFilterRequest $request){
        $perPage = $request->input('per_page', config('constants.RECORDS_PER_PAGE_DEFAULT_'));

        $patterns = $this->dataQuery($request)->paginate($perPage)->onEachSide(1);

        return Inertia::render('Admin/BudgetPattern/Index', [
            "title" => __($this->option),
            "subtitle" => __('listado'),
            "module" => $this->module,
            "slug" => 'budget-patterns',
            "patterns" => BudgetPatternResource::collection($patterns),
            "queryParams" => request()->query() ?: null,
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions,
            "columnPreferences" => UserColumnPreference::forUserAndTables(
                auth()->user()->id,
                ['tblBudgetPatterns'] 
            )
        ]);
    } 

    /**
     * 1.1. Data para exportación.
     */
    public function filteredData(BudgetPatternFilterRequest $request){
        $cacheKey = 'filtered_budget_patterns_' . md5(json_encode($request->all()));

        $patterns = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($request) {
            return $this->dataQuery($request)->get();
        });

        return response()->json([
            'patterns' => BudgetPatternResource::collection($patterns)
        ]);
    }

    /**
     * 1.2. Data Query.
     */
    private function dataQuery(BudgetPatternFilterRequest $request){
        $query = BudgetPattern::where('company_id', session('currentCompany'));

        // Filtros dinámicos
        $filters = [
            'name' => fn($q, $v) => $q->where('name', 'like', "%$v%"),
            'nif' => fn($q, $v) => $q->where('nif', 'like', "%$v%"),
            'is_ute' => fn($q, $v) => $q->where('is_ute', $v)
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
        $sortField = $request->input('sort_field', 'name');
        $sortDirection = $request->input('sort_direction', 'ASC');
        $allowedSortFields = ['name', 'nif'];

        if (!in_array($sortField, $allowedSortFields)) {
            $sortField = 'name';
        }

        return $query->orderBy($sortField, $sortDirection);        
    }

    /**
     * 2. Formulario nuevo patrón.
     */
    public function create(){
        return Inertia::render('Admin/BudgetPattern/Create', [
            "title" => __($this->option),
            "subtitle" => __('patron_nuevo'),
            "module" => $this->module,
            "slug" => 'budget-patterns',
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions
        ]);    
    }

    /**
     * 3. Guardar nuevo patrón.
     */
    public function store(BudgetPatternStoreRequest $request){
        //Guardando patrón:
        $pattern = BudgetPattern::savePattern($request);        

        return redirect()->route('budget-patterns.edit', $pattern->id)->with('msg', __('patron_creado_msg'));
    }

    /**
     * 4. Editar patrón.
     */
    public function edit(BudgetPattern $pattern){
        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));

        $pattern->load(['createdBy', 'updatedBy']);  

        //Formateo de datos:
        $pattern->formatted_created_at = Carbon::parse($pattern->created_at)->format($locale[4].' H:i:s');
        $pattern->formatted_updated_at = Carbon::parse($pattern->updated_at)->format($locale[4].' H:i:s');

        $pattern->created_by_name = optional($pattern->createdBy)->full_name ?? false;
        $pattern->updated_by_name = optional($pattern->updatedBy)->full_name ?? false;  

        return Inertia::render('Admin/BudgetPattern/Edit', [
            "title" => __($this->option),
            "subtitle" => __('cuenta_editar'),
            "module" => $this->module,
            "slug" => 'budget-patterns',
            "availableLocales" => LocaleTrait::availableLocales(),
            "pattern" => $pattern,
            'msg' => session('msg'),
            'alert' => session('alert'),
            "permissions" => $this->permissions
        ]);
    }

    /**
     * 5. Actualizar patrón.
     */
    public function update(BudgetPatternUpdateRequest $request, BudgetPattern $pattern){
        try {
            $validated = $request->validated();



        } catch (\Throwable $e) {
            Log::error('Error en update(): ' . $e->getMessage());
            abort(500, 'Error interno del servidor');
        }
    }

    /**
     * 6. Actualizar estado.
     */
    public function status(Request $request){
        $pattern = BudgetPattern::find($request->id);

        if(!$pattern){
            return response()->json(['error' => __('patron_no_encontrado')], 404);
        }

        $pattern->status = !$pattern->status;
        $pattern->save();

        return response()->json([
            'success' => true,
            'message' => __('estado_actualizado_ok'),
            'new_status' => $pattern->status
        ]);
    }
    
    /**
     * 7. Eliminar patrón.
     */
    public function destroy(BudgetPattern $pattern){
        $pattern_id = $pattern->id;

        $pattern->delete();

        return redirect()->route('budget-patterns.index')->with('msg', __('patron_eliminado'));
    }
}
