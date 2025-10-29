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
use File;

//Events:
use App\Events\CompanyChanged;

//Models:
use App\Models\Company;
use App\Models\CompanyModule;
use App\Models\CompanySetting;
use App\Models\UserColumnPreference;
use App\Models\UserCompany;
use App\Models\Workplace;

//Requests:
use App\Http\Requests\CompanyFilterRequest;
use App\Http\Requests\CompanyStoreRequest;
use App\Http\Requests\CompanyUpdateRequest;

//Resources:
use App\Http\Resources\CompanyResource;

//Traits
use App\Traits\HasUserPermissionsTrait;
use App\Traits\LocaleTrait;

class CompanyController extends Controller{
    /**
     * 1. Listado de empresas.
     * 1.1. Data para exportación.
     * 1.2. Data Query.
     * 2. Formulario nueva empresa.
     * 3. Guardar nueva empresa.
     * 4. Mostrar empresa.
     * 5. Editar empresa.
     * 6. Actualizar empresa.
     * 7. Eliminar empresa.
     * 7.1. Eliminar logo de empresa.
     * 8. Actualizar estado.
     * 9. Seleccionar empresa para la sesión.
     * 10. Seleccionar empresa para la sesión por Post.
     * 11. Refrescar session.
     */
    
    use HasUserPermissionsTrait;
    use LocaleTrait;

    private $module = 'companies';
    private $option = 'empresas';
    protected array $permissions = [];

    public function __construct(){
        if(session('currentCompany')){
            $this->permissions = $this->resolvePermissions([
                'companies.create',
                'companies.destroy',
                'companies.edit',
                'companies.index',
                'companies.search',
                'companies.show',
                'companies.update'
            ]);   
        } 
    }   

    /**
     * 1. Listado de empresas.
     */
    public function index(CompanyFilterRequest $request){
        $perPage = $request->input('per_page', config('constants.RECORDS_PER_PAGE_DEFAULT_'));

        $companies = $this->dataQuery($request)->paginate($perPage)->onEachSide(1);

        return Inertia::render('Admin/Company/Index', [
            "title" => __($this->option),
            "subtitle" => __('listado'),
            "module" => $this->module,
            "slug" => 'companies',
            "companies" => CompanyResource::collection($companies),
            "queryParams" => request()->query() ?: null,
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions,
            "columnPreferences" => UserColumnPreference::forUserAndTables(
                auth()->user()->id,
                ['tblCompanies'] 
            )
        ]);
    }

    /**
     * 1.1. Data para exportación.
     */
    public function filteredData(CompanyFilterRequest $request){
        $cacheKey = 'filtered_companies_' . md5(json_encode($request->all()));

        $companies = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($request) {
            return $this->dataQuery($request)->get();
        });

        return response()->json([
            'companies' => CompanyResource::collection($companies)
        ]);
    }

    /**
     * 1.2. Data Query.
     */
    private function dataQuery(CompanyFilterRequest $request){
        $user = auth()->user();

        $query = Company::select('companies.*')
        ->join('user_companies', 'companies.id', '=', 'user_companies.company_id')
        ->where('user_companies.user_id', $user->id);

        // Filtros dinámicos
        $filters = [
            'name' => fn($q, $v) => $q->where('name', 'like', "%$v%"),
            'tradename' => fn($q, $v) => $q->where('tradename', 'like', "%$v%"),
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
        $allowedSortFields = ['name', 'tradename', 'nif'];

        if (!in_array($sortField, $allowedSortFields)) {
            $sortField = 'name';
        }

        return $query->orderBy($sortField, $sortDirection);        
    }

    /**
     * 2. Formulario nueva empresa.
     */
    public function create(){
        return Inertia::render('Admin/Company/Create', [
            "title" => __($this->option),
            "subtitle" => __('empresa_nueva'),
            'module' => $this->module,
            "slug" => 'companies',
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions
        ]);    
    }

    /**
     * 3. Guardar nueva empresa.
     */
    public function store(CompanyStoreRequest $request){
        //Guardando empresa:
        $company = Company::saveCompany($request);        

        return redirect()->route('companies.edit', $company->id)
            ->with('msg', __('empresa_creada_msg'));
    }

    /**
     * 4. Mostrar empresa.
     */
    public function show(Company $company){
        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));

        $company->load(['createdBy', 'updatedBy']);

        //Formateo de datos:
        $company->formatted_created_at = Carbon::parse($company->created_at)->format($locale[4].' H:i:s');
        $company->formatted_updated_at = Carbon::parse($company->updated_at)->format($locale[4].' H:i:s');

        $company->created_by_name = optional($company->createdBy)->full_name ?? false;
        $company->updated_by_name = optional($company->updatedBy)->full_name ?? false;

        return Inertia::render('Admin/Company/Show', [
            "title" => __($this->option),
            "subtitle" => __('empresa_ver'),
            "module" => $this->module,
            "slug" => 'companies',
            "availableLocales" => LocaleTrait::availableLocales(),
            "company" => $company
        ]);
    }

    /**
     * 5. Editar empresa.
     */
    public function edit(Company $company){
        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));

        $company->load(['createdBy', 'updatedBy']);

        //Formateo de datos:
        $company->formatted_created_at = Carbon::parse($company->created_at)->format($locale[4].' H:i:s');
        $company->formatted_updated_at = Carbon::parse($company->updated_at)->format($locale[4].' H:i:s');

        $company->created_by_name = optional($company->createdBy)->full_name ?? false;
        $company->updated_by_name = optional($company->updatedBy)->full_name ?? false;

        $permissions = $this->resolvePermissions([
            'companies.create',
            'companies.destroy',
            'companies.edit',
            'companies.index',
            'companies.search',
            'companies.show',
            'companies.update'
        ]);

        return Inertia::render('Admin/Company/Edit', [
            "title" => __($this->option),
            "subtitle" => __('empresa_editar'),
            "module" => $this->module,
            "slug" => 'companies',
            "availableLocales" => LocaleTrait::availableLocales(),
            "company" => $company,
            'msg' => session('msg'),
            'alert' => session('alert'),
            "permissions" => $permissions
        ]);
    }

    /**
     * 6. Actualizar empresa.
     */
    public function update(CompanyUpdateRequest $request, Company $company){
        try {
            $validated = $request->validated();

            $slug = Str::slug($validated['name']);

            $company->name = $validated['name'];
            $company->slug = $slug;
            $company->tradename = $validated['tradename'];
            $company->nif = $validated['nif'];

            //Guardando logo:
            $filename = Company::saveCompanyLogo($request, $company->slug);

            if($filename){
                $company->logo = $filename; 
            }

            $company->save();

            return redirect()->route('companies.edit', $company->id)
            ->with('msg', __('empresa_actualizada_msg'));
            
        } catch (\Throwable $e) {
            Log::error('Error en update(): ' . $e->getMessage());
            abort(500, 'Error interno del servidor');
        }
    }

    /**
     * 7. Eliminar empresa.
     */
    public function destroy(Company $company){
        $company_id = $company->id;
        
        //Eliminar logo:
        if ($company->logo && Storage::disk('public')->exists('companies/' . $company->logo)) {
            Storage::disk('public')->delete('companies/' . $company->logo);
        }

        $company->delete();

        //Eliminamos empresa de la sesión:
        $companies = session('companies', []);
        Session::forget('companies');

        //Generamos nueva sesión de empresas:
        foreach($companies as $c){
            if($c->id != $company->id){
                \Session::push('companies', $c);
            }
        }

        return redirect()->route('companies.index')->with('msg', __('empresa_eliminada'));
    }

    /**
     * 7.1. Eliminar logo de empresa.
     */
    public function deleteLogo(Company $company){
        if ($company->logo && Storage::disk('public')->exists('companies/' . $company->logo)){
            Storage::disk('public')->delete('companies/' . $company->logo);
        }

        $company->logo = null;
        $company->save();

        return redirect()->back()->with('msg', __('logo_eliminado'));
    }

    /**
     * 8. Actualizar estado.
     */
    public function status(Request $request){
        $company = Company::find($request->id);

        if(!$company){
            return response()->json(['error' => __('empresa_no_encontrada')], 404);
        }

        $company->status = !$company->status;
        $company->save();

        return response()->json([
            'success' => true,
            'message' => __('estado_actualizado_ok'),
            'new_status' => $company->status
        ]);
    }

    /**
     * 9. Seleccionar empresa para la sesión.
     *
     * @param \App\Models\Company $company
     * @return \Illuminate\Contracts\Foundation\Application|\Illuminate\Http\RedirectResponse|\Illuminate\Routing\Redirector
     */
    public function selectCompany(Request $request, Company $company, CompanyContext $ctx){
        // 1) Seguridad: que el usuario pertenezca a la empresa
        $userId = $request->user()->id;
        $isLinked = UserCompany::where('user_id', $userId)
            ->where('company_id', $company->id)
            ->exists();

        if (! $isLinked) {
            abort(403, __('empresa_usuario_no_autorizado'));
        }

        // 2) Fija empresa en sesión (persistencia) y en contexto (memoria)
        $request->session()->put('currentCompany', $company->id);
        $ctx->set($company->id);

        // 3) Carga módulos y settings en sesión (si así lo usas)
        $modules = \App\Models\CompanyModule::getCompanyModules($company->id);
        $request->session()->put('companyModules', $modules);

        $settings = \App\Models\CompanySetting::companySettings($company->id);
        $request->session()->put('companySettings', $settings);

        // 4) Notifica cambio de empresa
        event(new CompanyChanged($request->user(), $company->id));

        // 5) Redirección segura al origen, con fallback
        return redirect()->back(fallback: route('dashboard'))
            ->with('msg', __('Empresa cambiada'));
    }

    /**
     * 10. Seleccionar empresa para la sesión por Post.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function selectCompanyPost(Request $request, CompanyContext $ctx){
        // 1) Validación sencilla (usa FormRequest si quieres más control)
        $validated = $request->validate([
            'selectedCompany' => ['required', 'integer', 'exists:companies,id'],
        ]);

        $companyId = (int) $validated['selectedCompany'];

        // 2) Autorización: que el usuario pertenezca a la empresa
        $userId = $request->user()->id;
        $linked = UserCompany::where('user_id', $userId)
            ->where('company_id', $companyId)
            ->exists();

        if (! $linked) {
            abort(403, __('empresa_usuario_no_autorizado'));
        }

        // 3) Refresca el ID de sesión para evitar fijación en cambios de contexto sensibles
        //    (opcional, pero recomendable si la visibilidad cambia mucho entre empresas)
        $request->session()->regenerate();

        // 4) Fija empresa en sesión (persistencia) y contexto (memoria del request)
        $request->session()->put('currentCompany', $companyId);
        $ctx->set($companyId);

        // 5) Carga módulos y settings específicos de la empresa
        $modules  = CompanyModule::getCompanyModules($companyId);
        $settings = CompanySetting::companySettings($companyId);

        $request->session()->put('companyModules', $modules);
        $request->session()->put('companySettings', $settings);

        // 6) Notifica cambio (listeners ya podrán leer CompanyContext)
        event(new CompanyChanged($request->user(), $companyId));

        // 7) Redirección segura al origen con fallback
        return redirect()->back(fallback: route('dashboard'))
            ->with('msg', __('Empresa cambiada'));
    }

    /**
     * 11. Refrescar session.
     */
    public function refreshSession(){
        $companyId = session('currentCompany');

        if (!$companyId) {
            return response()->json(['status' => 'error', 'message' => __('empresa_no_seleccionada')], 400);
        }

        $this->setCompanyModules($companyId);

        return response()->json(['status' => 'ok']);
    }



    // public function resolvePermissions(array $required): array {
    //     $permissions = [];
    //     foreach ($required as $perm) {
    //         $permissions[$perm] = auth()->user()->can($perm)? true:false;
    //     }

    //     dd($permissions);
    // }
}
