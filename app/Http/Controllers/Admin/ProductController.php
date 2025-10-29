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
use App\Http\Requests\ProductFilterRequest;
use App\Http\Requests\ProductStoreRequest;
use App\Http\Requests\ProductUpdateRequest;

//Resources:
use App\Http\Resources\ProductResource;

//Traits
use App\Traits\HasUserPermissionsTrait;
use App\Traits\LocaleTrait;

class ProductController extends Controller{
    /**
     * 1. Listado de productos.
     * 1.1. Data para exportación.
     * 1.2. Data Query.
     * 2. Formulario nuevo producto.
     * 3. Guardar nuevo producto.
     * 4. Ver producto.
     * 5. Editar producto.
     * 6. Actualizar producto.
     * 7. Eliminar producto.
     * 8. Actualizar estado.
     */
    
    use HasUserPermissionsTrait;
    use LocaleTrait;

    private $module = 'products';
    private $option = 'catalogo';
    protected array $permissions = [];

    public function __construct(){
        if(session('currentCompany')){
            $this->permissions = $this->resolvePermissions([
                'products.create',
                'products.destroy',
                'products.edit',
                'products.index',
                'products.search',
                'products.show',
                'products.update'
            ]);   
        } 
    }   

    /**
     * 1. Listado de productos.
     */
    public function index(ProductFilterRequest $request){
        $perPage = $request->input('per_page', config('constants.RECORDS_PER_PAGE_DEFAULT_'));

        $products = $this->dataQuery($request)->paginate($perPage)->onEachSide(1);

        return Inertia::render('Admin/Product/Index', [
            "title" => __($this->option),
            "subtitle" => __('listado'),
            "module" => $this->module,
            "slug" => 'products',
            "products" => ProductResource::collection($products),
            "queryParams" => request()->query() ?: null,
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions,
            "columnPreferences" => UserColumnPreference::forUserAndTables(
                auth()->user()->id,
                ['tblProducts'] 
            )
        ]);
    }

    /**
     * 1.1. Data para exportación.
     */
    public function filteredData(ProductFilterRequest $request){
        $cacheKey = 'filtered_products_' . md5(json_encode($request->all()));

        $products = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($request) {
            return $this->dataQuery($request)->get();
        });

        return response()->json([
            'products' => ProductResource::collection($products)
        ]);
    }

    /**
     * 1.2. Data Query.
     */
    private function dataQuery(ProductFilterRequest $request){
        $query = Product::where('company_id', session('currentCompany'));

        // Filtros dinámicos
        $filters = [
            'name' => fn($q, $v) => $q->where('name', 'like', "%$v%"),
            'description' => fn($q, $v) => $q->where('description', 'like', "%$v%"),
            'long_description' => fn($q, $v) => $q->where('long_description', 'like', "%$v%"),
            'ref' => fn($q, $v) => $q->where('ref', 'like', "%$v%"),
            'manual_ref' => fn($q, $v) => $q->where('manual_ref', 'like', "%$v%"),
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
        $allowedSortFields = ['name', 'description', 'long_description', 'ref', 'manual_ref'];

        if (!in_array($sortField, $allowedSortFields)) {
            $sortField = 'name';
        }

        return $query->orderBy($sortField, $sortDirection);        
    }

    /**
     * 2. Formulario nuevo producto.
     */
    public function create(){
        return Inertia::render('Admin/Product/Create', [
            "title" => __($this->option),
            "subtitle" => __('producto_nuevo'),
            'module' => $this->module,
            "slug" => 'products',
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions
        ]);    
    }

    /**
     * 3. Guardar nuevo producto.
     */
    public function store(ProductStoreRequest $request){
        //Guardando producto:
        $product = Product::saveProduct($request, session('currentCompany'));        

        return redirect()->route('products.edit', $product->id)
            ->with('msg', __('producto_creado_msg'));
    }

    /**
     * 4. Ver producto.
     */
    public function show(Product $product){
        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));

        $product->load(['createdBy', 'updatedBy']);

        //Formateo de datos:
        $product->formatted_created_at = Carbon::parse($product->created_at)->format($locale[4].' H:i:s');
        $product->formatted_updated_at = Carbon::parse($product->updated_at)->format($locale[4].' H:i:s');

        $product->created_by_name = optional($product->createdBy)->full_name ?? false;
        $product->updated_by_name = optional($product->updatedBy)->full_name ?? false;

        return Inertia::render('Admin/Product/Show', [
            "title" => __($this->option),
            "subtitle" => __('producto_ver'),
            "module" => $this->module,
            "slug" => 'products',
            "availableLocales" => LocaleTrait::availableLocales(),
            "product" => $product
        ]);
    }

    /**
     * 5. Editar producto.
     */
    public function edit(Product $product){
        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));

        $product->load(['createdBy', 'updatedBy']);

        //Formateo de datos:
        $product->formatted_created_at = Carbon::parse($product->created_at)->format($locale[4].' H:i:s');
        $product->formatted_updated_at = Carbon::parse($product->updated_at)->format($locale[4].' H:i:s');

        $product->created_by_name = optional($product->createdBy)->full_name ?? false;
        $product->updated_by_name = optional($product->updatedBy)->full_name ?? false;

        $production_status = Product::productionProductStatus();

        //Patrones:
        $patterns = ProductPattern::select('id', 'name')
        ->where('company_id', $product->company_id)
        ->where('status', 1)
        ->orderBy('name', 'ASC')
        ->pluck('name', 'id')
        ->toArray();

        return Inertia::render('Admin/Product/Edit', [
            "title" => __($this->option),
            "subtitle" => __('producto_editar'),
            "module" => $this->module,
            "slug" => 'products',
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions,
            "product" => $product,
            "production_status" => $production_status,
            "patterns" => $patterns
        ]);
    }

    /**
     * 6. Actualizar producto.
     */
    public function update(ProductUpdateRequest $request, Product $product){
        try {
            $validated = $request->validated();

            $slug = Str::slug($validated['name']);

            $product->name = $validated['name'];
            $product->slug = $slug;
            $product->description = $validated['description'];
            $product->long_description = $validated['long_description'];
            $product->production_status = $request->production_status;
            
            
            $product->iva = $request->iva;
            $product->batch = $request->batch? true:false;
            $product->stock_management = $request->stock_management? true:false;
            $product->on_sale = $request->on_sale? true:false;
            $product->status = $request->status? true:false;
            $product->updated_by = Auth::user()->id; 
            $product->save();

            return redirect()->route('products.edit', $product->id)
            ->with('msg', __('producto_actualizado_msg'));
            
        } catch (\Throwable $e) {
            Log::error('Error en update(): ' . $e->getMessage());
            abort(500, 'Error interno del servidor');
        }
    }

    /**
     * 7. Eliminar producto.
     */
    public function destroy(Product $product){
        $product_id = $product->id;
        
        //Eliminar imágenes de producto:
        // if ($product->logo && Storage::disk('public')->exists('companies/' . $product->logo)) {
        //     Storage::disk('public')->delete('companies/' . $product->logo);
        // }     PENDIENTE

        $product->delete();

        return redirect()->route('products.index')->with('msg', __('producto_eliminado'));
    }

    /**
     * 8. Actualizar estado.
     */
    public function status(Request $request){
        $product = Product::find($request->id);

        if (!$product) {
            return response()->json(['error' => __('producto_no_encontrado')], 404);
        }

        $product->status = !$product->status;
        $product->save();

        return response()->json([
            'success' => true,
            'message' => __('estado_actualizado_ok'),
            'new_status' => $product->status
        ]);
    }
}
