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
use App\Models\Company;
use App\Models\CostCenter;
use App\Models\UserColumnPreference;

//Requests:
use App\Http\Requests\CostCenterFilterRequest;
use App\Http\Requests\CostCenterStoreRequest;
use App\Http\Requests\CostCenterUpdateRequest;

//Resources:
use App\Http\Resources\CostCenterResource;

//Traits
use App\Traits\HasUserPermissionsTrait;
use App\Traits\LocaleTrait;

class CostCenterController extends Controller{
    /**
     * 1. Listado de centros de coste.
     * 1.1. Data para exportación.
     * 1.2. Data Query.
     * 2. Formulario nuevo centro de coste.
     * 3. Guardar nuevo centro de coste.
     * 4. Editar centro de coste.
     * 5. Actualizar centro de coste.
     * 6. Eliminar centro de coste.
     * 7. Actualizar estado.
     */
    
    use HasUserPermissionsTrait;
    use LocaleTrait;

    private $module = 'companies';
    private $option = 'centros_coste';
    protected array $permissions = [];

    public function __construct(){
        if(session('currentCompany')){
            $this->permissions = $this->resolvePermissions([
                'cost-centers.create',
                'cost-centers.destroy',
                'cost-centers.edit',
                'cost-centers.index',
                'cost-centers.search',
                'cost-centers.show',
                'cost-centers.update'
            ]);   
        } 
    }   

    /**
     * 1. Listado de centros de coste.
     */
    public function index(CostCenterFilterRequest $request){
        $perPage = $request->input('per_page', config('constants.RECORDS_PER_PAGE_DEFAULT_'));
        $costCenters = $this->dataQuery($request)->paginate($perPage)->onEachSide(1);

        return Inertia::render('Admin/CostCenter/Index', [
            'title' => __($this->option),
            'subtitle' => __('listado'),
            'module' => $this->module,
            'slug' => 'cost-centers',
            'costCenters' => CostCenterResource::collection($costCenters),
            'queryParams' => request()->query() ?: null,
            'availableLocales' => LocaleTrait::availableLocales(),
            'permissions' => $this->permissions,
            'columnPreferences' => UserColumnPreference::forUserAndTables(
                auth()->user()->id,
                ['tblCostCenters']
            )
        ]);
    }

    /**
     * 1.1. Data para exportación.
     */
    public function filteredData(CostCenterFilterRequest $request){
        $cacheKey = 'filtered_cost_centers_' . md5(json_encode($request->all()));

        $centers = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($request) {
            return $this->dataQuery($request)->get();
        });

        return response()->json([
            'costCenters' => CostCenterResource::collection($centers)
        ]);
    }

    /**
     * 1.2. Data Query.
     */
    private function dataQuery(CostCenterFilterRequest $request, $company_id = false){
        $companyId = $company_id ? $company_id : session('currentCompany');

        $query = CostCenter::where('company_id', $companyId);

        $filters = [
            'name' => fn ($q, $v) => $q->where('name', 'like', "%$v%"),
        ];

        foreach ($filters as $key => $callback) {
            if ($request->filled($key)) {
                $callback($query, $request->input($key));
            }
        }

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

        $sortField = $request->input('sort_field', 'name');
        $sortDirection = $request->input('sort_direction', 'ASC');
        $allowedSortFields = ['name', 'created_at'];

        if (!in_array($sortField, $allowedSortFields)) {
            $sortField = 'name';
        }

        return $query->orderBy($sortField, $sortDirection);
    }

    /**
     * 2. Formulario nuevo centro de coste.
     */
    public function create($company_id = false){
        $companyId = $company_id ? $company_id : session('currentCompany');

        $company = Company::select('id', 'name')->find($companyId);

        return Inertia::render('Admin/CostCenter/Create', [
            'title' => __($this->option),
            'subtitle' => __('centro_coste_nuevo'),
            'module' => $this->module,
            'slug' => 'cost-centers',
            'company' => $company,
            'availableLocales' => LocaleTrait::availableLocales(),
            'permissions' => $this->permissions
        ]);
    }

    /**
     * 3. Guardar nuevo centro de coste.
     */
    public function store(CostCenterStoreRequest $request){
        $validated = $request->validated();

        $name = $validated['name'] ?? $request->input('name');
        $slug = Str::slug($name ?? '');

        $center = CostCenter::create([
            'company_id' => session('currentCompany'),
            'name' => $name,
            'slug' => $slug,
            'status' => $validated['status'] ?? 1,
        ]);

        return redirect()->route('cost-centers.edit', $center->id)->with('msg', __('centro_creado'));
    }

    /**
     * 4. Editar centro de coste.
     */
    public function edit(CostCenter $cost_center){
        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));

        $cost_center->formatted_created_at = Carbon::parse($cost_center->created_at)->format($locale[4] . ' H:i:s');
        $cost_center->formatted_updated_at = Carbon::parse($cost_center->updated_at)->format($locale[4] . ' H:i:s');

        return Inertia::render('Admin/CostCenter/Edit', [
            'title' => __($this->option),
            'subtitle' => __('editar'),
            'module' => $this->module,
            'slug' => 'cost-centers',
            'availableLocales' => LocaleTrait::availableLocales(),
            'costCenter' => $cost_center,
            'msg' => session('msg'),
            'alert' => session('alert'),
            'permissions' => $this->permissions
        ]);
    }

    /**
     * 5. Actualizar centro de coste.
     */
    public function update(CostCenterUpdateRequest $request, CostCenter $cost_center){
        try {
            $validated = $request->validated();

            $name = $validated['name'] ?? $request->input('name');
            $slug = Str::slug($name ?? '');

            $cost_center->name = $name;
            $cost_center->slug = $slug;
            $cost_center->status = $request->input('status', $cost_center->status);

            $cost_center->save();

            return redirect()->route('cost-centers.edit', $cost_center->id)->with('msg', __('centro_coste_updated'));
        } catch (\Throwable $e) {
            Log::error('Error CostCenter update(): ' . $e->getMessage(), ['exception' => $e]);
            abort(500, 'Error interno del servidor');
        }
    }

    /**
     * 6. Eliminar centro de coste.
     */
    public function destroy(CostCenter $cost_center){
        $cost_center->delete();
        return redirect()->route('cost-centers.index')->with('msg', __('centro_deleted'));
    }

    /**
     * 7. Actualizar estado.
     */
    public function status(Request $request){
        $center = CostCenter::find($request->id);

        if (!$center) {
            return response()->json(['error' => __('registro_no_encontrado')], 404);
        }

        $center->status = !$center->status;
        $center->save();

        return response()->json([
            'success' => true,
            'message' => __('estado_actualizado_ok'),
            'new_status' => $center->status
        ]);
    }
}
