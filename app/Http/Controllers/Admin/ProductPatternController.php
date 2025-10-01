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
use File;

//Models:
use App\Models\Product;
use App\Models\ProductPattern;
use App\Models\UserColumnPreference;

//Requests:
use App\Http\Requests\ProductPatternFilterRequest;
use App\Http\Requests\ProductPatternStoreRequest;
use App\Http\Requests\ProductPatternUpdateRequest;

//Resources:
use App\Http\Resources\ProductPatternResource;

//Traits
use App\Traits\HasUserPermissionsTrait;
use App\Traits\LocaleTrait;

class ProductPatternController extends Controller{
    /**
     * 1. Listado de patrones.
     * 1.1. Data para exportación.
     * 1.2. Data Query.
     * 2. Formulario nuevo patrón.
     * 3. Guardar nuevo patrón.
     * 4. Editar patrón.
     * 5. Actualizar patrón.
     * 6. Eliminar patrón.
     * 7. Actualizar estado.
     */
    
    use HasUserPermissionsTrait;
    use LocaleTrait;

    private $module = 'products';
    private $option = 'producto_patrones';
    protected array $permissions = [];

    public function __construct(){
        if(session('currentCompany')){
            $this->permissions = $this->resolvePermissions([
                'product-patterns.create',
                'product-patterns.destroy',
                'product-patterns.edit',
                'product-patterns.index',
                'product-patterns.search',
                'product-patterns.show',
                'product-patterns.update'
            ]);   
        } 
    }   

    /**
     * 1. Listado de patrones.
     */
    public function index(ProductPatternFilterRequest $request){
        $perPage = $request->input('per_page', config('constants.RECORDS_PER_PAGE_DEFAULT_'));

        $patterns = $this->dataQuery($request)->paginate($perPage)->onEachSide(1);

        return Inertia::render('Admin/ProductPattern/Index', [
            "title" => __($this->option),
            "subtitle" => __('listado'),
            "module" => $this->module,
            "slug" => 'product-patterns',
            "patterns" => ProductPatternResource::collection($patterns),
            "queryParams" => request()->query() ?: null,
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions,
            "columnPreferences" => UserColumnPreference::forUserAndTables(
                auth()->user()->id,
                ['tblProductPatterns'] 
            )
        ]);
    }

    /**
     * 1.1. Data para exportación.
     */
    public function filteredData(ProductPatternFilterRequest $request){
        $cacheKey = 'filtered_products_' . md5(json_encode($request->all()));

        $patterns = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($request) {
            return $this->dataQuery($request)->get();
        });

        return response()->json([
            'patterns' => ProductPatternResource::collection($patterns)
        ]);
    }

    /**
     * 1.2. Data Query.
     */
    private function dataQuery(ProductPatternFilterRequest $request){
        $query = ProductPattern::where('company_id', session('currentCompany'));

        // Filtros dinámicos
        $filters = [
            'name' => fn($q, $v) => $q->where('name', 'like', "%$v%"),
            'slug' => fn($q, $v) => $q->where('slug', 'like', "%$v%"),
            'pattern' => fn($q, $v) => $q->where('pattern', 'like', "%$v%"),
            // Adapt preview filter: if numeric, pad with zeros; if text, search as is
            'preview' => function($q, $v) {
                if (is_numeric($v)) {
                    // Try to match padded digits in JSON
                    $padded = str_pad($v, 3, '0', STR_PAD_LEFT); // 3 is a common ndigits, adjust if needed
                    $q->where('pattern', 'like', "%$padded%")
                      ->orWhere('pattern', 'like', "%$v%") ;
                } else {
                    // Try to match text or year in JSON
                    $q->where('pattern', 'like', "%$v%") ;
                }
            },
            'status' => fn($q, $v) => $q->where('status', $v)
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
        $allowedSortFields = ['name', 'slug', 'pattern'];

        if (!in_array($sortField, $allowedSortFields)) {
            $sortField = 'name';
        }

        return $query->orderBy($sortField, $sortDirection);        
    }

    /**
     * 2. Formulario nuevo patrón.
     */
    public function create(){
        return Inertia::render('Admin/ProductPattern/Create', [
            "title" => __($this->option),
            "subtitle" => __('patron_nuevo'),
            'module' => $this->module,
            "slug" => 'product-patterns',
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions
        ]);    
    }

    /**
     * 3. Guardar nuevo patrón.
     */
    public function store(ProductPatternStoreRequest $request){
        //Verificamos que al menos exista una segmento de dígitos:
        $digits = false;
        foreach($request->segments as $s){
            if($s['type'] == 'digits'){
                $digits = true;
                break;
            }
        }

        if(!$digits){
            $alert = __('patron_sin_digitos');
            return redirect()->route('product-patterns.create')->with(compact('alert'));
            exit;
        }

        //Guardando patrón:
        $pattern = ProductPattern::savePattern($request);        

        return redirect()->route('product-patterns.edit', $pattern->id)
            ->with('msg', __('patron_creado_msg'));
    }

    /**
     * 4. Editar patrón.
     */
    public function edit(ProductPattern $pattern){
        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));

        $pattern->load(['createdBy', 'updatedBy']);

        //Formateo de datos:
        $pattern->formatted_created_at = Carbon::parse($pattern->created_at)->format($locale[4].' H:i:s');
        $pattern->formatted_updated_at = Carbon::parse($pattern->updated_at)->format($locale[4].' H:i:s');

        $pattern->created_by_name = optional($pattern->createdBy)->full_name ?? false;
        $pattern->updated_by_name = optional($pattern->updatedBy)->full_name ?? false;

        return Inertia::render('Admin/ProductPattern/Edit', [
            "title" => __($this->option),
            "subtitle" => __('patron_editar'),
            "module" => $this->module,
            "slug" => 'product-patterns',
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions,
            "pattern" => $pattern,
        ]);
    }

    /**
     * 5. Actualizar patrón.
     *
     * El campo pattern no se actualiza.
     */
    public function update(ProductPatternUpdateRequest $request, ProductPattern $pattern){
        try {
            $validated = $request->validated();

            $slug = Str::slug($validated['name']);

            $pattern->name = $validated['name'];
            $pattern->slug = $slug;
            $pattern->status = $request->status? true:false;
            $pattern->updated_by = Auth::user()->id; 
            $pattern->save();

            return redirect()->route('product-patterns.edit', $pattern->id)
            ->with('msg', __('patron_actualizado_msg'));
            
        } catch (\Throwable $e) {
            Log::error('Error en update(): ' . $e->getMessage());
            abort(500, 'Error interno del servidor');
        }
    }

    /**
     * 6. Eliminar patrón.
     */
    public function destroy(ProductPattern $pattern){
        $pattern->delete();

        return redirect()->route('product-patterns.index')->with('msg', __('patron_eliminado'));
    }

    /**
     * 7. Actualizar estado.
     */
    public function status(Request $request){
        $pattern = ProductPattern::find($request->id);

        if (!$pattern) {
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
}
