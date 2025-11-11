<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use App\Support\CompanyContext;
use Inertia\Inertia;

//Models:
use App\Models\Category;

//Requests:
use App\Http\Requests\CategoryStoreRequest;
use App\Http\Requests\CategoryUpdateRequest;

//Traits:
use App\Traits\HasUserPermissionsTrait;
use App\Traits\LocaleTrait;

class CategoryController extends Controller{
    /**
     * 1. Listado de categorías por módulo.
     * 2. Formulario nueva categoría.
     * 3. Guardar categoría.
     * 4. Editar categoría.
     * 5. Actualizar categoría.
     */
    
    use HasUserPermissionsTrait;
    use LocaleTrait;

    private $module = 'companies';
    private $option = 'categorias';
    
    /**
     * 1. Listado de categorías por módulo.
     */
    public function index(Request $request, CompanyContext $ctx, string $environment = 'sectors'){
        // 1) Normaliza environment permitido
        $allowed = ['sectors', 'customers', 'providers', 'crm'];
        if (!in_array($environment, $allowed, true)) {
            $environment = 'sectors';
        }

        // 2) Parámetros de listado
        $search         = trim((string) $request->get('q', ''));
        $perPage        = (int) $request->integer('per_page', 25);
        $sortField      = (string) $request->get('sort_field', 'depth');     // por defecto, jerarquía
        $sortDirection  = strtolower((string) $request->get('sort_direction', 'asc')) === 'desc' ? 'desc' : 'asc';

        // Whitelist de campos ordenables
        $sortable = ['name', 'slug', 'depth', 'position', 'created_at'];
        if (!in_array($sortField, $sortable, true)) {
            $sortField = 'depth';
            $sortDirection = 'asc';
        }

        // 3) Query base
        $query = Category::query()
            ->where('company_id', $ctx->id())
            ->where('module', $environment);

        // 4) Filtros
        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%")
                  ->orWhere('path', 'like', "%{$search}%");
            });
        }

        // 5) Orden y paginación
        // Si ordenas por 'depth', agrega 'position' para estabilidad visual
        if ($sortField === 'depth') {
            $query->orderBy('depth', $sortDirection)->orderBy('position', 'asc');
        } else {
            $query->orderBy($sortField, $sortDirection);
        }

        $categories = $query->paginate($perPage)->withQueryString();

        // 6) Rotulación por environment
        $labels = [
            'sectors'   => ['module' => 'companies', 'slug' => 'company-sectors', 'title' => __('sectores'), 'subtitle' => __('sectores_empresariales')],
            'customers' => ['module' => 'companies',  'slug' => 'categories',      'title' => __($this->option), 'subtitle' => __('listado')],
            'providers' => ['module' => 'companies',  'slug' => 'categories',      'title' => __($this->option), 'subtitle' => __('listado')],
            'crm'       => ['module' => 'crm',  'slug' => 'categories',      'title' => __($this->option), 'subtitle' => __('listado')],
        ];
        $meta = $labels[$environment];

        $permissions = [];
        if($environment == 'sectors'){
            $permissions = $this->resolvePermissions([
                'companies.edit'
            ]);    
        }

        // 7) Props para Inertia
        return Inertia::render('Admin/Category/Index', [
            'title'       => $meta['title'],
            'subtitle'    => $meta['subtitle'],
            'module'      => $meta['module'],
            'slug'        => $meta['slug'],
            'environment' => $environment,
            'categories'  => $categories,
            'queryParams' => [
                'q'              => $search,
                'per_page'       => $perPage,
                'sort_field'     => $sortField,
                'sort_direction' => $sortDirection,
            ],
            'permissions' => $permissions
        ]);
    }

    // Árbol para UI (picker/gestor). Idealmente cacheado.
    public function tree(CompanyContext $ctx, string $environment = 'sectors'){
        $this->authorize('viewAny', [Category::class, $ctx->id(), $environment]);

        $nodes = Category::select('id','parent_id','name','slug','path','depth','position','status')
            ->where('company_id', $ctx->id())
            ->where('module', $environment)
            ->orderBy('depth')->orderBy('position')->get();

        return response()->json([
            'company_id' => (int) $ctx->id(),
            'environment'=> $environment,
            'nodes'      => $nodes
        ]);
    }







    /**
     * 2. Formulario nueva categoría.
     */
    public function create(Request $request, CompanyContext $ctx, string $environment = 'sectors'){
        return Inertia::render('Admin/Category/Upsert', [
            'mode'        => 'create',
            'environment' => $environment,
            'defaults'    => [
                'name'      => '',
                'slug'      => '',
                'parent_id' => $request->integer('parent_id') ?: null, // opcional, para crear subcategoría
                'status'    => 1,
            ],
        ]);
    }

    /**
     * 3. Guardar categoría.
     */
    public function store(CategoryStoreRequest $request, CompanyContext $ctx, string $environment = 'sectors'){
        $this->authorize('create', [Category::class, $ctx->id(), $environment]);

        $data = $request->validated(); // name, parent_id?, slug?, status?, translations?
        $slug = $data['slug'] ?? Str::slug($data['name']);

        // posición al final entre hermanos
        $position = Category::where([
            'company_id' => $ctx->id(),
            'module'     => $environment,
            'parent_id'  => $data['parent_id'] ?? null,
        ])->max('position') + 1;

        $parent = null;
        if (!empty($data['parent_id'])) {
            $parent = Category::where('company_id', $ctx->id())
                ->where('module', $environment)
                ->findOrFail($data['parent_id']);
        }

        $category = Category::create([
            'company_id'   => $ctx->id(),
            'module'       => $environment,
            'parent_id'    => $parent->id ?? null,
            'name'         => $data['name'],
            'slug'         => $slug,
            'translations' => $data['translations'] ?? null,
            'path'         => $parent ? $parent->path.'/'.$slug : $slug,
            'depth'        => $parent ? $parent->depth + 1 : 0,
            'position'     => $position,
            'status'       => (int) ($data['status'] ?? 1),
        ]);

        return back()->with('msg', __('categoria_creada'));
    }

    /**
     * 4. Editar categoría.
     */
    public function edit(CompanyContext $ctx, string $environment, Category $category){
        // Si quieres, valida que category->module == $environment
        return Inertia::render('Admin/Category/Upsert', [
            'mode'        => 'edit',
            'environment' => $environment,
            'category'    => $category,
        ]);
    }

    /**
     * 5. Actualizar categoría.
     */
    public function update(CategoryUpdateRequest $request, CompanyContext $ctx, string $environment, Category $category){
        $this->authorize('update', [$category, $ctx->id(), $environment]);

        $data = $request->validated(); // name, slug?, parent_id?, status, translations
        $oldSlug = $category->slug;
        $newSlug = $data['slug'] ?? Str::slug($data['name']);

        DB::transaction(function () use ($category, $ctx, $environment, $data, $oldSlug, $newSlug) {
            $category->fill([
                'name'         => $data['name'],
                'slug'         => $newSlug,
                'translations' => $data['translations'] ?? $category->translations,
                'status'       => (int) ($data['status'] ?? $category->status),
            ])->save();

            // si cambia el slug o el padre, recalcular path/depth en toda la rama
            if (array_key_exists('parent_id', $data) || $newSlug !== $oldSlug) {
                // mover nodo
                $this->recalculateBranch($category, $ctx->id(), $environment, $data['parent_id'] ?? $category->parent_id);
            }
        });

        return back()->with('msg', __('categoria_actualizada'));
    }

    /**
     * 6.
     */
    public function toggle(CompanyContext $ctx, string $environment, Category $category){
        $this->authorize('update', [$category, $ctx->id(), $environment]);

        $category->update(['status' => $category->status ? 0 : 1]);
        return back()->with('msg', __('estado_actualizado'));
    }

    public function move(Request $request, CompanyContext $ctx, string $environment, Category $category){
        $this->authorize('update', [$category, $ctx->id(), $environment]);

        $request->validate([
            'parent_id' => ['nullable','integer'],
            'position'  => ['nullable','integer','min:0'],
        ]);

        $this->recalculateBranch($category, $ctx->id(), $environment, $request->integer('parent_id') ?: null, $request->integer('position'));
        return response()->noContent();
    }

    public function destroy(CompanyContext $ctx, string $environment, Category $category){
        $this->authorize('delete', [$category, $ctx->id(), $environment]);

        // si tiene hijos o asignaciones, aquí decidir: archivar o impedir
        $category->delete(); // soft delete
        return back()->with('msg', __('categoria_eliminada'));
    }

    public function bulk(Request $request, CompanyContext $ctx, string $environment){
        $this->authorize('manageBulk', [Category::class, $ctx->id(), $environment]);

        // ids[], action: activate|deactivate|delete|move, parent_id?, position?
        // implementar con transacción y returns 204
        return response()->noContent();
    }

    public function updateTranslations(Request $request, CompanyContext $ctx, string $environment, Category $category){
        $this->authorize('update', [$category, $ctx->id(), $environment]);
        $request->validate(['translations' => 'array']);
        $category->update(['translations' => $request->input('translations')]);
        return back()->with('msg', __('traducciones_actualizadas'));
    }

    /** Recalcula path/depth/position de un nodo y su rama completa */
    protected function recalculateBranch(Category $node, int $companyId, string $environment, ?int $newParentId, ?int $newPosition = null): void{
        DB::transaction(function () use ($node, $companyId, $environment, $newParentId, $newPosition) {
            $parent = $newParentId
                ? Category::where('company_id', $companyId)->where('module', $environment)->findOrFail($newParentId)
                : null;

            // actualizar el propio nodo
            $oldPath = $node->path;
            $node->parent_id = $parent->id ?? null;
            $node->depth     = $parent ? $parent->depth + 1 : 0;
            $node->position  = $newPosition ?? $node->position;
            $node->path      = ($parent ? $parent->path.'/' : '').$node->slug;
            $node->save();

            // actualizar descendencia: reemplazar prefijo del path
            if ($oldPath !== $node->path) {
                Category::where('company_id', $companyId)
                    ->where('module', $environment)
                    ->where('path', 'like', $oldPath.'/%')
                    ->get()
                    ->each(function ($child) use ($oldPath, $node) {
                        $child->path  = preg_replace('#^'.preg_quote($oldPath,'#').'#', $node->path, $child->path);
                        // depth se puede recalcular por conteo de '/' en path
                        $child->depth = substr_count($child->path, '/');
                        $child->save();
                    });
            }
        });
    }
}
