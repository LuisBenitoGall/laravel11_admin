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
     */
    

    use HasUserPermissionsTrait;
    use LocaleTrait;

    private $module = 'marketing';
    private $option = 'campanyas';
    protected array $permissions = [];

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
            abort(422, __('no_hay_empresa_activa'));
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
        return Inertia::render('Admin/MarketingCampaign/Create', [
            "title" => __($this->option),
            "subtitle" => __('campanya_nueva'),
            'module' => $this->module,
            "slug" => 'marketing-campaigns',
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions
        ]);    
    }

    /**
     * 3. Guarda nueva campaña.
     */
    public function store(MarketingCampaignStoreRequest $request){
        
    }
}
