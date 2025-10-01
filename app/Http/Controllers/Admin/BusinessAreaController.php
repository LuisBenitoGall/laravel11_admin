<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Carbon\Carbon;

//Models
use App\Models\Company;
use App\Models\BusinessArea;
use App\Models\UserColumnPreference;

//Requests
use App\Http\Requests\BusinessAreaFilterRequest;
use App\Http\Requests\BusinessAreaStoreRequest;
use App\Http\Requests\BusinessAreaUpdateRequest;

//Resources
use App\Http\Resources\BusinessAreaResource;

// Traits
use App\Traits\HasUserPermissionsTrait;
use App\Traits\LocaleTrait;

class BusinessAreaController extends Controller{
    /**
     * 1. Listado de áreas de negocio.
     * 1.1. Data para exportación.
     * 1.2. Data Query.
     * 2. Formulario nuevo área de negocio.
     * 3. Guardar nuevo área de negocio.
     * 4. Editar área de negocio.
     * 5. Actualizar área de negocio.
     * 6. Eliminar área de negocio.
     * 7. Actualizar estado.
     */

    use HasUserPermissionsTrait;
    use LocaleTrait;

    private $module = 'companies';
    private $option = 'areas_negocio';
    protected array $permissions = [];

    public function __construct(){
        if (session('currentCompany')) {
            $this->permissions = $this->resolvePermissions([
                'business-areas.create',
                'business-areas.destroy',
                'business-areas.edit',
                'business-areas.index',
                'business-areas.search',
                'business-areas.show',
                'business-areas.update'
            ]);
        }
    }

    /**
     * 1. Listado de áreas de negocio.
     */
    public function index(BusinessAreaFilterRequest $request){
        $perPage = $request->input('per_page', config('constants.RECORDS_PER_PAGE_DEFAULT_'));

        $areas = $this->dataQuery($request)->paginate($perPage)->onEachSide(1);

        return Inertia::render('Admin/BusinessArea/Index', [
            'title' => __($this->option),
            'subtitle' => __('listado'),
            'module' => $this->module,
            'slug' => 'business-areas',
            'businessAreas' => BusinessAreaResource::collection($areas),
            'queryParams' => request()->query() ?: null,
            'availableLocales' => LocaleTrait::availableLocales(),
            'permissions' => $this->permissions,
            'columnPreferences' => UserColumnPreference::forUserAndTables(
                auth()->user()->id,
                ['tblBusinessAreas']
            )
        ]);
    }

    /**
     * 1.1. Data para exportación.
     */
    public function filteredData(BusinessAreaFilterRequest $request){
        $cacheKey = 'filtered_business_areas_' . md5(json_encode($request->all()));

        $areas = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($request) {
            return $this->dataQuery($request)->get();
        });

        return response()->json([
            'businessAreas' => BusinessAreaResource::collection($areas)
        ]);
    }

    /**
     * 1.2. Data Query.
     */
    private function dataQuery(BusinessAreaFilterRequest $request, $company_id = false){
        $companyId = $company_id ? $company_id : session('currentCompany');

        $query = BusinessArea::where('company_id', $companyId);

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
     * 2. Formulario nuevo área de negocio.
     */
    public function create($company_id = false){
        $companyId = $company_id ? $company_id : session('currentCompany');

        $company = Company::select('id', 'name')->find($companyId);

        return Inertia::render('Admin/BusinessArea/Create', [
            'title' => __($this->option),
            'subtitle' => __('area_negocio_nueva'),
            'module' => $this->module,
            'slug' => 'business-areas',
            'company' => $company,
            'availableLocales' => LocaleTrait::availableLocales(),
            'permissions' => $this->permissions
        ]);
    }

    /**
     * 3. Guardar nuevo área de negocio.
     */
    public function store(BusinessAreaStoreRequest $request){
        $validated = $request->validated();

        $name = $validated['name'] ?? $request->input('name');
        $slug = Str::slug($name ?? '');

        $area = BusinessArea::create([
            'company_id' => session('currentCompany'),
            'name' => $name,
            'slug' => $slug,
            'status' => $validated['status'] ?? 1,
        ]);

        return redirect()->route('business-areas.edit', $area->id)->with('msg', __('area_negocio_creadaº'));
    }

    /**
     * 4. Editar área de negocio.
     */
    public function edit(BusinessArea $business_area){
        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));

        $business_area->formatted_created_at = Carbon::parse($business_area->created_at)->format($locale[4] . ' H:i:s');
        $business_area->formatted_updated_at = Carbon::parse($business_area->updated_at)->format($locale[4] . ' H:i:s');

        return Inertia::render('Admin/BusinessArea/Edit', [
            'title' => __($this->option),
            'subtitle' => __('editar'),
            'module' => $this->module,
            'slug' => 'business-areas',
            'availableLocales' => LocaleTrait::availableLocales(),
            'businessArea' => $business_area,
            'msg' => session('msg'),
            'alert' => session('alert'),
            'permissions' => $this->permissions
        ]);
    }

    /**
     * 5. Actualizar área de negocio.
     */
    public function update(BusinessAreaUpdateRequest $request, BusinessArea $business_area){
        try {
            $validated = $request->validated();

            $name = $validated['name'] ?? $request->input('name');
            $slug = Str::slug($name ?? '');

            $business_area->name = $name;
            $business_area->slug = $slug;
            $business_area->status = $request->input('status', $business_area->status);

            $business_area->save();

            return redirect()->route('business-areas.edit', $business_area->id)->with('msg', __('area_negocio_updated'));
        } catch (\Throwable $e) {
            Log::error('Error BusinessArea update(): ' . $e->getMessage(), ['exception' => $e]);
            abort(500, 'Error interno del servidor');
        }
    }

    /**
     * 6. Eliminar área de negocio.
     */
    public function destroy(BusinessArea $business_area){
        $business_area->delete();
        return redirect()->route('business-areas.index')->with('msg', __('area_negocio_deleted'));
    }

    /**
     * 7. Actualizar estado.
     */
    public function status(Request $request){
        $area = BusinessArea::find($request->id);

        if (!$area) {
            return response()->json(['error' => __('registro_no_encontrado')], 404);
        }

        $area->status = !$area->status;
        $area->save();

        return response()->json([
            'success' => true,
            'message' => __('estado_actualizado_ok'),
            'new_status' => $area->status
        ]);
    }
}
