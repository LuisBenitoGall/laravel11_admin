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
use App\Support\CompanyContext;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

//Models
use App\Models\Company;
use App\Models\Country;
use App\Models\CustomerProvider;
use App\Models\UserColumnPreference;
use App\Models\Workplace;

//Requests
use App\Http\Requests\WorkplaceFilterRequest;
use App\Http\Requests\WorkplaceStoreRequest;
use App\Http\Requests\WorkplaceUpdateRequest;

//Resources
use App\Http\Resources\WorkplaceResource;

//Traits
use App\Traits\HasUserPermissionsTrait;
use App\Traits\LocaleTrait;

class WorkplaceController extends Controller{
    /**
     * 1. Listado de centros de trabajo.
     * 1.1. Data para exportación.
     * 1.2. Data Query.
     * 2. Formulario nuevo centro de trabajo.
     * 3. Guardar nuevo centro de trabajo.
     * 4. Editar centro de trabajo.
     * 5. Actualizar centro de trabajo.
     * 6. Eliminar centro de trabajo.
     * 6.1. Eliminar logo del centro.
     * 7. Actualizar estado.
     */
    
    use HasUserPermissionsTrait;
    use LocaleTrait;

    private $module = 'companies';
    private $option = 'centros_trabajo';
    protected array $permissions = [];

    public function __construct(){
        if(session('currentCompany')){
            $this->permissions = $this->resolvePermissions([
                'workplaces.create',
                'workplaces.destroy',
                'workplaces.edit',
                'workplaces.index',
                'workplaces.search',
                'workplaces.show',
                'workplaces.update'
            ]);   
        } 
    }   

    /**
     * 1. Listado de centros de trabajo.
     */
    public function index(WorkplaceFilterRequest $request, ?int $company_id = null){
        $ctx = app(CompanyContext::class);
        $currentId = (int) $ctx->id();
        if($currentId <= 0){
            abort(422, __('no_hay_empresa_activa'));
        }

        $company = Company::find($company_id ?: $currentId);
        if (!$company) {
            abort(404, __('empresa_no_encontrada'));
        }

        $side = null;            // 'customers' | 'providers' | 'both' | null
        $returnRoutes = [];

        if ($company->id !== $currentId) {
            $side = CustomerProvider::sideForCompanyPair($currentId, $company->id);

            // Prepara rutas de retorno según el lado detectado
            // Usa tus names reales: 'customers.edit' y 'providers.edit'
            if ($side === 'customers' || $side === 'both') {
                $returnRoutes[] = [
                    'name' => 'customers.edit',
                    'params' => $company->id,
                    'label' => __('volver_a').' '.$company->name,
                ];
            }
            if ($side === 'providers' || $side === 'both') {
                $returnRoutes[] = [
                    'name' => 'providers.edit',
                    'params' => $company->id,
                    'label' => __('volver_a').' '.$company->name,
                ];
            }
        }

        $perPage = $request->input('per_page', config('constants.RECORDS_PER_PAGE_DEFAULT_'));
        $workplaces = $this->dataQuery($request, $company->id)->paginate($perPage)->onEachSide(1);

        return Inertia::render('Admin/Workplace/Index', [
            "title" => __($this->option),
            "subtitle" => __('listado'),
            "module" => $this->module,
            "slug" => 'workplaces',
            "company" => $company,
            "side" => $side,
            "returnRoutes" => $returnRoutes,
            "workplaces" => WorkplaceResource::collection($workplaces),
            "queryParams" => request()->query() ?: null,
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions,
            "columnPreferences" => UserColumnPreference::forUserAndTables(
                auth()->id(),
                ['tblWorkplaces']
            ),
        ]);
    }

    /**
     * 1.1. Data para exportación.
     */
    public function filteredData(WorkplaceFilterRequest $request, ?int $company = null){
        $cacheKey = 'filtered_workplaces_' . ($company ?: 'session') . '_' . md5(json_encode($request->all()));

        $workplaces = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($request, $company) {
            return $this->dataQuery($request, $company)->get();
        });

        return response()->json([
            'workplaces' => WorkplaceResource::collection($workplaces),
        ]);
    }   

    /**
     * 1.2. Data Query.
     */
    private function dataQuery(WorkplaceFilterRequest $request, ?int $company_id = null){
        $companyId = $company_id ?: session('currentCompany');

        $query = Workplace::where('company_id', $companyId);

        $filters = [
            'name' => fn($q, $v) => $q->where('name', 'like', "%$v%"),
            'nif'  => fn($q, $v) => $q->where('nif', 'like', "%$v%"),
        ];
        foreach ($filters as $key => $cb) {
            if ($request->filled($key)) $cb($query, $request->input($key));
        }

        $from = $request->input('date_from');
        $to   = $request->input('date_to');
        if ($from && $to)      $query->whereBetween('created_at', ["$from 00:00:00", "$to 23:59:59"]);
        elseif ($from)         $query->where('created_at', '>=', "$from 00:00:00");
        elseif ($to)           $query->where('created_at', '<=', "$to 23:59:59");

        $sortField = $request->input('sort_field', 'name');
        $sortDirection = $request->input('sort_direction', 'ASC');
        $allowed = ['name','nif','created_at'];
        if (!in_array($sortField, $allowed, true)) $sortField = 'name';

        return $query->orderBy($sortField, $sortDirection);
    }

    /**
     * 2. Formulario nuevo centro de trabajo.
     */
    public function create($company_id = false){
        $companyId = $company_id? $company_id:session('currentCompany');

        $company = Company::select('id', 'name')->find($companyId);

        return Inertia::render('Admin/Workplace/Create', [
            "title" => __($this->option),
            "subtitle" => __('centro_trabajo_nuevo'),
            "module" => $this->module,
            "slug" => 'workplaces',
            "company" => $company,
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions
        ]);    
    }

    /**
     * 3. Guardar nuevo centro de trabajo.
     */
    public function store(WorkplaceStoreRequest $request){
        $workplace = Workplace::saveWorkplace($request);        

        return redirect()->route('workplaces.edit', $workplace->id)
            ->with('msg', __('centro_trabajo_creado_msg'));
    }

    /**
     * 4. Editar centro de trabajo.
     */
    public function edit(Workplace $workplace){
        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));

        //Formateo de datos:
        $workplace->formatted_created_at = Carbon::parse($workplace->created_at)->format($locale[4].' H:i:s');
        $workplace->formatted_updated_at = Carbon::parse($workplace->updated_at)->format($locale[4].' H:i:s');

        $company = Company::select('id', 'name', 'tradename')->find($workplace->company_id);

        $countries = Country::where('status', 1)->orderBy('name', 'ASC')->get();

        return Inertia::render('Admin/Workplace/Edit', [
            "title" => __($this->option),
            "subtitle" => __('centro_trabajo_editar'),
            "module" => $this->module,
            "slug" => 'workplaces',
            "availableLocales" => LocaleTrait::availableLocales(),
            "workplace" => $workplace,
            "company" => $company,
            "countries" => $countries,
            "msg" => session('msg'),
            "alert" => session('alert'),
            "permissions" => $this->permissions
        ]);
    }

    /**
     * 5. Actualizar centro de trabajo.
     */
    public function update(WorkplaceUpdateRequest $request, Workplace $workplace){
        try {
            $validated = $request->validated();

            // Name is required by the request — use it or fallback to input
            $name = $validated['name'] ?? $request->input('name');
            $slug = Str::slug($name ?? '');

            $workplace->name = $name;
            $workplace->slug = $slug;

            // Use input() with sensible fallbacks to avoid undefined index notices
            $workplace->address = $request->input('address', $workplace->address);
            $workplace->cp = $request->input('cp', $workplace->cp);
            $workplace->town_id = $request->input('town_id', $workplace->town_id);
            $workplace->nif = $request->input('nif', $workplace->nif);
            $workplace->website = $request->input('website', $workplace->website);
            $workplace->description = $request->input('description', $workplace->description);

            //Guardando logo:
            $filename = Workplace::saveWorkplaceLogo($request, $slug);

            if($filename){
                $workplace->logo = $filename; 
            }

            $workplace->save();

            return redirect()->route('workplaces.edit', $workplace->id)
            ->with('msg', __('centro_trabajo_actualizado_msg'));
            
        } catch (\Throwable $e) {
            // Log full exception for easier debugging (message + stack)
            Log::error('Error en update(): ' . $e->getMessage(), ['exception' => $e]);
            abort(500, 'Error interno del servidor');
        }
    }

    /**
     * 6. Eliminar centro de trabajo.
     */
    public function destroy(Workplace $workplace){
        $workplace_id = $workplace->id;
        
        //Eliminar logo:
        if ($workplace->logo && Storage::disk('public')->exists('workplaces/' . $workplace->logo)) {
            Storage::disk('public')->delete('workplaces/' . $workplace->logo);
        }

        $workplace->delete();

        return redirect()->route('workplaces.index')->with('msg', __('centro_eliminado'));
    }

    /**
     * 6.1. Eliminar logo del centro.
     */
    public function deleteLogo(Workplace $workplace){
        if ($workplace->logo && Storage::disk('public')->exists('workplaces/' . $workplace->logo)){
            Storage::disk('public')->delete('workplaces/' . $workplace->logo);
        }

        $workplace->logo = null;
        $workplace->save();

        return redirect()->route('workplaces.edit', $workplace->id)
            ->with('msg', __('logo_eliminado'));
    }

    /**
     * 7. Actualizar estado.
     */
    public function status(Request $request){
        $workplace = Workplace::find($request->id);

        if(!$workplace){
            return response()->json(['error' => __('centro_no_encontrado')], 404);
        }

        $workplace->status = !$workplace->status;
        $workplace->save();

        return response()->json([
            'success' => true,
            'message' => __('estado_actualizado_ok'),
            'new_status' => $workplace->status
        ]);
    }
}
