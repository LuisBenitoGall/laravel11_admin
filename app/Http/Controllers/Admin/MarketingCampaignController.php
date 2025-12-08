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
use App\Models\Company;
use App\Models\Country;
use App\Models\CostCenter;
use App\Models\CrmAccount;
use App\Models\Currency;
use App\Models\MarketingCampaign;
use App\Models\User;
use App\Models\UserColumnPreference;

//Requests:
use App\Http\Requests\MarketingCampaignFilterRequest;
use App\Http\Requests\MarketingCampaignStoreRequest;
use App\Http\Requests\MarketingCampaignUpdateRequest;

//Resources:
use App\Http\Resources\MarketingCampaignResource;

//Traits:
use App\Traits\ConvertDateTrait;
use App\Traits\HasUserPermissionsTrait;
use App\Traits\LocaleTrait;
use App\Traits\ModulesTrait;

class MarketingCampaignController extends Controller
{
    /**
     * 1. Listado de campañas de marketing por empresa.
     * 1.1. Data para exportación.
     * 1.2. Data Query.
     * 2. Formulario nueva campaña.
     * 3. Guarda nueva campaña.
     * 4. Editar campaña.
     * 5. Actualizar campaña.
     * 6. Actualizar estado.
     * 7. Eliminar campaña.
     */
    
    use ConvertDateTrait;
    use HasUserPermissionsTrait;
    use LocaleTrait;

    private $module = 'marketing';
    private $option = 'campanyas';
    protected array $permissions = [];
    protected array $campaign_status = [];
    protected array $priorities = [];

    public function __construct(){
        if(session('currentCompany')){
            $this->permissions = $this->resolvePermissions([
                'marketing-campaigns.create',
                'marketing-campaigns.destroy',
                'marketing-campaigns.edit',
                'marketing-campaigns.index',
                'marketing-campaigns.search',
                'marketing-campaigns.show',
                'marketing-campaigns.update'
            ]);   
        } 

        $this->campaign_status = [
            1 => __('borrador'),
            2 => __('activa'),
            3 => __('finalizada'),
            4 => __('cancelada')
        ];

        $this->priorities = [
            1 => __('alta'),
            2 => __('media'),
            3 => __('baja')
        ];
    }   

    /**
     * 1. Listado de campañas de marketing por empresa.
     */
    public function index(MarketingCampaignFilterRequest $request){
        $perPage = $request->input('per_page', config('constants.RECORDS_PER_PAGE_DEFAULT_'));

        $campaigns = $this->dataQuery($request)->paginate($perPage)->onEachSide(1);

        return Inertia::render('Admin/MarketingCampaign/Index', [
            "title" => __($this->option),
            "subtitle" => __('listado'),
            "module" => $this->module,
            "slug" => 'marketing-campaigns',
            "campaigns" => MarketingCampaignResource::collection($campaigns),
            "queryParams" => request()->query() ?: null,
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions,
            "columnPreferences" => UserColumnPreference::forUserAndTables(
                Auth::id(),
                ['tblMarketingCampaigns'] 
            )
        ]);
    }

    /**
     * 1.1. Data para exportación.
     */
    public function filteredData(MarketingCampaignFilterRequest $request){
        $cacheKey = 'filtered_campaigns_' . md5(json_encode($request->all()));

        $campaigns = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($request) {
            return $this->dataQuery($request)->get();
        });

        return response()->json([
            'campaigns' => MarketingCampaignResource::collection($campaigns)
        ]);
    }

    /**
     * 1.2. Data Query.
     */
    private function dataQuery(MarketingCampaignFilterRequest $request){
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

        $query = MarketingCampaign::where('company_id', $currentCompanyId);

        // Filtros dinámicos
        $filters = [
            'name' => fn($q, $v) => $q->where('name', 'like', "%$v%"),
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
     * 2. Formulario nueva campaña.
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

        $cost_centers = CostCenter::select('id', 'name')
        ->where('company_id', $currentCompanyId)
        ->where('status', 1)
        ->orderBy('name', 'ASC')
        ->get();

        $owners = User::select('users.id', 'users.name', 'users.surname')
        ->join('user_companies', 'users.id', '=', 'user_companies.user_id')
        ->where('user_companies.company_id', $currentCompanyId)
        ->where('users.status', 1)
        ->orderBy('users.name', 'ASC')
        ->get();

        $currencies = Currency::select('id', 'name', 'symbol')
        ->where('status', 1)
        ->orderBy('name', 'ASC')
        ->get();

        return Inertia::render('Admin/MarketingCampaign/Create', [
            "title" => __($this->option),
            "subtitle" => __('campanya_nueva'),
            "module" => $this->module,
            "slug" => 'marketing-campaigns',
            "costCenters" => $cost_centers,
            "owners" => $owners,
            "currencies" => $currencies,
            "campaignStatus" => $this->campaign_status,
            "priorities" => $this->priorities,
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions
        ]);    
    }

    /**
     * 3. Guarda nueva campaña.
     */
    public function store(MarketingCampaignStoreRequest $request){
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

        //Tratamiento de fechas:
        $rawStart = $request->input('start_at');
        $startAt = $rawStart !== ''
            ? ($locale[0] !== 'en'
                ? $this->convertDate($rawStart, false)
                : $rawStart
            )
            : null;

        $rawFinish = $request->input('finish_at');
        $finishAt = $rawFinish !== ''
            ? ($locale[0] !== 'en'
                ? $this->convertDate($rawFinish, false)
                : $rawFinish
            )
            : null;

        $mc = new MarketingCampaign();
        $mc->owner_id = $request->owner_id;
        $mc->company_id = $currentCompanyId;
        $mc->name = $request->name;
        $mc->campaign_code = $request->campaign_code;
        $mc->campaign_type = '';
        $mc->description = $request->description;
        $mc->total_cost = $request->total_cost > 0? $request->total_cost:'0';
        $mc->expected_cost = $request->expected_cost > 0? $request->expected_cost:'0';
        $mc->currency_id = $request->currency_id;
        $mc->promote_code = $request->promote_code;
        $mc->start_at = $startAt;
        $mc->finish_at = $finishAt;
        $mc->cost_center_id = $request->cost_center_id;
        $mc->created_by = Auth::id();
        $mc->updated_by = Auth::id();
        $mc->status = $request->status;
        $mc->priority = $request->priority;
        $mc->members_type = $request->members_type;
        $mc->save();

        return redirect()->route('marketing-campaigns.edit', $mc->id)
            ->with('msg', __('campanya_creada_msg'));
    }

    /**
     * 4. Editar campaña.
     */
    public function edit(MarketingCampaign $campaign, $tab = false){
        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));

        // Formateo de datos:
        $campaign->formatted_created_at = Carbon::parse($campaign->created_at)->format($locale[4] . ' H:i:s');
        $campaign->formatted_updated_at = Carbon::parse($campaign->updated_at)->format($locale[4] . ' H:i:s');

        $campaign->created_by_name = optional($campaign->createdBy)->full_name ?? false;
        $campaign->updated_by_name = optional($campaign->updatedBy)->full_name ?? false;

        $cost_centers = CostCenter::select('id', 'name')
        ->where('company_id', $campaign->company_id)
        ->where('status', 1)
        ->orderBy('name', 'ASC')
        ->get();

        $owners = User::select('users.id', 'users.name', 'users.surname')
        ->join('user_companies', 'users.id', '=', 'user_companies.user_id')
        ->where('user_companies.company_id', $campaign->company_id)
        ->where('users.status', 1)
        ->orderBy('users.name', 'ASC')
        ->get();

        $currencies = Currency::select('id', 'name', 'symbol')
        ->where('status', 1)
        ->orderBy('name', 'ASC')
        ->get();

        return Inertia::render('Admin/MarketingCampaign/Edit', [
            'title'            => __($this->option),
            'subtitle'         => __('campanya_editar'),
            'module'           => $this->module,
            'slug'             => 'marketing-campaigns',
            'availableLocales' => LocaleTrait::availableLocales(),
            'campaign'         => $campaign,

            // Para mensajes, permisos y compañía
            'msg'              => session('msg'),
            'alert'            => session('alert'),
            'permissions'      => $this->permissions,
            "tab"              => $tab,

            // Para que el frontend tenga el contexto de filtros / paginación
            //'queryParams'      => $request->all(),
            "costCenters"      => $cost_centers,
            "owners"           => $owners,
            "currencies"       => $currencies,
            "campaignStatus"   => $this->campaign_status,
            "priorities"       => $this->priorities,
        ]);
    }

    /**
     * 5. Actualizar campaña.
     */
    public function update(MarketingCampaignUpdateRequest $request, MarketingCampaign $campaign){
        try {
            $validated = $request->validated();

            $campaign->owner_id = $request->owner_id;
            $campaign->company_id = $currentCompanyId;
            $campaign->name = $request->name;
            $campaign->campaign_code = $request->campaign_code;

            $campaign->description = $request->description;
            $campaign->total_cost = $request->total_cost;
            $campaign->expected_cost = $request->expected_cost;
            $campaign->currency_id = $request->currency_id;
            $campaign->promote_code = $request->promote_code;
            $campaign->start_at = $starAt;
            $campaign->finish_at = $finishAt;
            $campaign->cost_center_id = $request->cost_center_id;

            $campaign->created_by = Auth::id();
            $campaign->updated_by = Auth::id();
            $campaign->status = $request->status;
            $campaign->priority = $request->priority;
            $campaign->members_type = $request->members_type;
            $campaign->save();

            return redirect()->route('marketing-campaigns.edit', $campaign->id)
            ->with('msg', __('campanya_actualizada_msg'));

        } catch (\Throwable $e) {
            Log::error('Error en update(): ' . $e->getMessage());
            abort(500, 'Error interno del servidor');
        }
    }

    /**
     * 6. Actualizar estado.
     */
    public function status(Request $request){
        $campaign = MarketingCampaign::find($request->id);

        if(!$campaign){
            return response()->json(['error' => __('campanya_no_encontrada')], 404);
        }

        $campaign->status = !$campaign->status;
        $campaign->save();

        return response()->json([
            'success' => true,
            'message' => __('estado_actualizado_ok'),
            'new_status' => $campaign->status
        ]);
    }

    /**
     * 7. Eliminar campaña.
     */
    public function destroy(MarketingCampaign $campaign){
        $campaign_id = $campaign->id;
    
        $campaign->delete();

        return redirect()->route('marketing-campaigns.index')->with('msg', __('campanya_eliminada'));
    }
}
