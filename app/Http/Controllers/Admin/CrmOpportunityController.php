<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Str;
use App\Support\CompanyContext;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;
use File;

//Models:
use App\Models\CrmAccount;
use App\Models\Company;
use App\Models\CrmContact;
use App\Models\CrmOpportunity;
use App\Models\User;
use App\Models\UserColumnPreference;
//Requests:
use App\Http\Requests\CrmOpportunityFilterRequest;
use App\Http\Requests\CrmOpportunityStoreRequest;
use App\Http\Requests\CrmOpportunityUpdateRequest;

//Resources:
use App\Http\Resources\CrmOpportunityResource;

//Traits:
use App\Traits\HasUserPermissionsTrait;
use App\Traits\LocaleTrait;
use App\Traits\ModulesTrait;

class CrmOpportunityController extends Controller
{
    /**
     * 1. Listado de oportunidades.
     * 1.1. Contactos para exportación.
     * 1.2. Data Query contactos.
     * 2. Formulario nueva oportunidad.
     * 3. Guardar nueva oportunidad.
     * 4. Editar oportunidad.
     * 5. Actualizar oportunidad.
     */
    
    use HasUserPermissionsTrait;
    use LocaleTrait;

    private $module = 'crm';
    private $option = 'oportunidades_crm';
    protected array $permissions = [];

    public function __construct(){
        if(session('currentCompany')){
            $this->permissions = $this->resolvePermissions([
                'crm-opportunities.create',
                'crm-opportunities.destroy',
                'crm-opportunities.edit',
                'crm-opportunities.index',
                'crm-opportunities.search',
                'crm-opportunities.show',
                'crm-opportunities.update'
            ]);   
        } 
    }   

    /**
     * 1. Listado de oportunidades.
     */
    public function index(CrmOpportunityFilterRequest $request){
        $perPage = $request->input('per_page', config('constants.RECORDS_PER_PAGE_DEFAULT_'));

        $opportunities = $this->dataQuery($request)->paginate($perPage)->onEachSide(1);

        return Inertia::render('Admin/CrmOpportunity/Index', [
            "title" => __($this->option),
            "subtitle" => __('listado'),
            "module" => $this->module,
            "slug" => 'crm-opportunities',
            "opportunities" => CrmOpportunityResource::collection($opportunities),
            "queryParams" => request()->query() ?: null,
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions,
            "columnPreferences" => UserColumnPreference::forUserAndTables(
                Auth::id(),
                ['tblCrmOpportunities'] 
            )
        ]);
    }

    /**
     * 1.1. Contactos para exportación.
     */
    public function filteredData(CrmOpportunityFilterRequest $request)
    {
        $ctx = app(CompanyContext::class);
        $currentCompanyId = (int) $ctx->id();
        if($currentCompanyId <= 0){
            $url = route('companies.refresh-session');

            // si quieres ser fino, guarda a dónde quería ir originalmente
            session(['intended_after_company' => request()->fullUrl()]);
            session()->flash('alert', __('empresa_no_activa'));

            if (request()->header('X-Inertia')) {
                return \Inertia\Inertia::location($url);
            }

            return redirect($url);
        }

        $company_id = $request->input('company_id', $currentCompanyId);

        $cacheKey = 'filtered_crm_opportunities_' . $company_id . '_' . md5(json_encode($request->all()));

        // Aseguramos que company_id esté en el request
        $request->merge(['company_id' => $company_id]);

        $opportunities = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($request) {
            return $this->dataQuery($request)->get();
        });

        return response()->json([
            'users' => CrmOpportunityResource::collection($opportunities),
        ]);
    }

    /**
     * 1.2. Data Query.
     */
    private function dataQuery(CrmOpportunityFilterRequest $request){
        $ctx = app(CompanyContext::class);
        $currentCompanyId = (int) $ctx->id();
        if($currentCompanyId <= 0){
            $url = route('companies.refresh-session');

            // si quieres ser fino, guarda a dónde quería ir originalmente
            session(['intended_after_company' => request()->fullUrl()]);
            session()->flash('alert', __('empresa_no_activa'));

            if (request()->header('X-Inertia')) {
                return \Inertia\Inertia::location($url);
            }

            return redirect($url);
        }

        $query = CrmOpportunity::select('crm_opportunities.*')
        ->join('users', 'crm_opportunities.user_id', '=', 'users.id')
        ->leftJoin('crm_accounts', 'crm_opportunities.crm_account_id', '=', 'crm_accounts.id')
        ->where('crm_opportunities.company_id', $currentCompanyId);

        // Filtros dinámicos
        $filters = [
            'name' => fn($q, $v) => $q->where('name', 'like', "%$v%"),
            'observations' => fn($q, $v) => $q->where('observations', 'like', "%$v%")
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
        $allowedSortFields = ['name'];

        if (!in_array($sortField, $allowedSortFields)) {
            $sortField = 'name';
        }

        return $query->orderBy($sortField, $sortDirection);
    }

    /**
     * 2. Formulario nueva oportunidad.
     */
    public function create(){
        $ctx = app(CompanyContext::class);
        $currentCompanyId = (int) $ctx->id();
        if($currentCompanyId <= 0){
            $url = route('companies.refresh-session');

            // si quieres ser fino, guarda a dónde quería ir originalmente
            session(['intended_after_company' => request()->fullUrl()]);
            session()->flash('alert', __('empresa_no_activa'));

            if (request()->header('X-Inertia')) {
                return \Inertia\Inertia::location($url);
            }

            return redirect($url);
        }    

        $crmAccounts = CrmAccount::select('id', 'name')
        ->where('company_id', $currentCompanyId)
        ->where('status', 1)
        ->orderBy('name', 'ASC')
        ->get();

        return Inertia::render('Admin/CrmOpportunity/Create', [
            "title" => __($this->option),
            "subtitle" => __('oportunidad_nueva'),
            "module" => $this->module,
            "slug" => 'crm-opportunities',
            "crmAccounts" => $crmAccounts,
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions
        ]);    
    }

    /**
     * 3. Guardar nueva oportunidad.
     */
    public function store(CrmOpportunityStoreRequest $request){
        $ctx = app(CompanyContext::class);
        $currentCompanyId = (int) $ctx->id();
        if($currentCompanyId <= 0){
            $url = route('companies.refresh-session');

            // si quieres ser fino, guarda a dónde quería ir originalmente
            session(['intended_after_company' => request()->fullUrl()]);
            session()->flash('alert', __('empresa_no_activa'));

            if (request()->header('X-Inertia')) {
                return \Inertia\Inertia::location($url);
            }

            return redirect($url);
        }    

        $op = new CrmOpportunity();
        $op->name = $request->name;
        $op->company_id = $currentCompanyId;
        $op->user_id = $request->user_id;
        $op->crm_account_id = $request->crm_account_id;
        $op->owner_id = Auth::id();
        $op->observations = $request->observations;
        $op->status = $request->status;
        $op->save();

        return redirect()->route('crm-opportunities.edit', $op->id)
            ->with('msg', __('oportunidad_creada_msg'));
    }

    /**
     * 4. Editar oportunidad.
     */
    public function edit(CrmOpportunity $opportunity){
        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));
        
        $ctx = app(CompanyContext::class);
        $currentCompanyId = (int) $ctx->id();
        if($currentCompanyId <= 0){
            $url = route('companies.refresh-session');

            // si quieres ser fino, guarda a dónde quería ir originalmente
            session(['intended_after_company' => request()->fullUrl()]);
            session()->flash('alert', __('empresa_no_activa'));

            if (request()->header('X-Inertia')) {
                return \Inertia\Inertia::location($url);
            }

            return redirect($url);
        }    

        //Formateo de datos:
        $opportunity->formatted_created_at = Carbon::parse($opportunity->created_at)->format($locale[4].' H:i:s');
        $opportunity->formatted_updated_at = Carbon::parse($opportunity->updated_at)->format($locale[4].' H:i:s');

        // Nombre completo del contacto (usuario vinculado a la oportunidad)
        $contactName = null;
        if ($opportunity->user_id) {
            $contactUser = User::select('name', 'surname')->find($opportunity->user_id);
            if ($contactUser) {
                $contactName = trim(($contactUser->name ?? '') . ' ' . ($contactUser->surname ?? ''));
            }
        }

        $crmAccounts = CrmAccount::select('id', 'name')
        ->where('company_id', $currentCompanyId)
        ->where('status', 1)
        ->orderBy('name', 'ASC')
        ->get();

        return Inertia::render('Admin/CrmOpportunity/Edit', [
            "title" => __($this->option),
            "subtitle" => __('oportunidad_editar'),
            "module" => $this->module,
            "slug" => 'crm-opportunities',
            "opportunity" => $opportunity,
            "contactName" => $contactName,
            "crmAccounts" => $crmAccounts,
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions
        ]);    
    }

    /**
     * 5. Actualizar oportunidad.
     */
    public function update(CrmOpportunityUpdateRequest $request, CrmOpportunity $opportunity)
    {
        $ctx = app(CompanyContext::class);
        $currentCompanyId = (int) $ctx->id();
        if ($currentCompanyId <= 0) {
            $url = route('companies.refresh-session');

            session(['intended_after_company' => request()->fullUrl()]);
            session()->flash('alert', __('empresa_no_activa'));

            if (request()->header('X-Inertia')) {
                return \Inertia\Inertia::location($url);
            }

            return redirect($url);
        }

        if ($opportunity->company_id !== $currentCompanyId) {
            abort(403);
        }

        $opportunity->name = $request->name;
        // El contacto (user_id) no se modifica en edición
        $opportunity->crm_account_id = $request->crm_account_id;
        $opportunity->observations = $request->observations;
        $opportunity->status = $request->status;
        $opportunity->save();

        return redirect()
            ->route('crm-opportunities.edit', $opportunity->id)
            ->with('msg', __('oportunidad_actualizada_msg'));
    }

    /**
     * 6. Eliminar oportunidad.
     */
    public function destroy(CrmOpportunity $opportunity)
    {
        $ctx = app(CompanyContext::class);
        $currentCompanyId = (int) $ctx->id();
        if ($currentCompanyId <= 0) {
            $url = route('companies.refresh-session');

            session(['intended_after_company' => request()->fullUrl()]);
            session()->flash('alert', __('empresa_no_activa'));

            if (request()->header('X-Inertia')) {
                return \Inertia\Inertia::location($url);
            }

            return redirect($url);
        }

        if ($opportunity->company_id !== $currentCompanyId) {
            abort(403);
        }

        $opportunity->delete();

        return redirect()
            ->route('crm-opportunities.index')
            ->with('msg', __('oportunidad_eliminada_msg'));
    }
}
