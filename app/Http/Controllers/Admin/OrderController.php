<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use App\Support\CompanyContext;
use App\Support\Filters\AdHocFilterApplier;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

//Models:
use App\Models\Order;
use App\Models\UserColumnPreference;

//Requests:
use App\Http\Requests\OrderFilterRequest;
use App\Http\Requests\OrderStoreRequest;
use App\Http\Requests\OrderUpdateRequest;

//Resources:
use App\Http\Resources\OrderResource;

//Traits:
use App\Traits\ConvertDateTrait;
use App\Traits\HasUserPermissionsTrait;
use App\Traits\LocaleTrait;

class OrderController extends Controller
{
    /**
     * 1. Listado de pedidos.
     * 1.1. Data para exportación.
     * 1.2. Data Query.
     * 1.3. Definición de filtros avanzados.
     * 1.4. Configuración de filtros avanzados.
     * 1.5. Leyenda de filtros aplicados.
     */
    
    use ConvertDateTrait;
    use HasUserPermissionsTrait;
    use LocaleTrait;

    private $module = 'orders';
    private $option = 'pedidos';
    protected array $permissions = [];

    public function __construct(){
        if(session('currentCompany')){
            $this->permissions = $this->resolvePermissions([
                'orders.create',
                'orders.destroy',
                'orders.edit',
                'orders.index',
                'orders.search',
                'orders.show',
                'orders.update'
            ]);   
        } 
    }  

    /**
     * 1. Listado de pedidos.
     */
    public function index(OrderFilterRequest $request, $company_id = false){
        $ctx = app(CompanyContext::class);
        $currentCompanyId = (int) $ctx->id();

        $perPage = $request->input('per_page', config('constants.RECORDS_PER_PAGE_DEFAULT_'));

        $request->merge(['company_id' => $company_id]);

        $orders = $this->dataQuery($request)
        ->paginate($perPage)
        ->onEachSide(1);

        return Inertia::render('Admin/Order/Index', [
            "title" => __($this->option),
            "subtitle" => __('listado'),
            "module" => $this->module,
            "slug" => 'orders',
            "orders" => OrderResource::collection($orders),
            "countries" => Cache::remember('countries_select', now()->addDay(), function () {
                    return Country::query()->orderBy('name')->get(['id','name']);
            }),
            "queryParams" => request()->query() ?: null,
            "adhocFilters" => $this->adHocFilterUiConfig(),
            "activeFiltersLegend" => $this->activeFiltersLegend($request),
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions,
            "columnPreferences" => UserColumnPreference::forUserAndTables(
                Auth::id(),
                ['tblOrders'] 
            )
        ]);
    }

    /**
     * 1.1. Data para exportación.
     */
    public function filteredData(OrderFilterRequest $request){
        $cacheKey = 'filtered_orders_' . md5(json_encode($request->all()));

        $orders = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($request) {
            return $this->dataQuery($request)->get();
        });

        return response()->json([
            'orders' => OrderResource::collection($orders)
        ]);
    }

    /**
     * 1.2. Data Query.
     */
    private function dataQuery(OrderFilterRequest $request): Builder{
        $ctx = app(CompanyContext::class);
        $currentCompanyId = (int) $ctx->id();


    }

    
}
