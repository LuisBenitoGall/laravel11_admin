<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

//Models:
use App\Models\Budget;
use App\Models\Order;
use App\Models\UserColumnPreference;

//Requests:
use App\Http\Requests\BudgetFilterRequest;
use App\Http\Requests\BudgetStoreRequest;
use App\Http\Requests\BudgetUpdateRequest;

//Resources:
use App\Http\Resources\BudgetResource;

//Traits
use App\Traits\HasUserPermissionsTrait;
use App\Traits\LocaleTrait;

class BudgetController extends Controller{
    /**
     * 1. Listado de presupuestos por empresa.
     * 1.1. Data para exportación.
     * 1.2. Data Query.
     */
    
    use HasUserPermissionsTrait;
    use LocaleTrait;
    
    private $module = 'budgets';
    private $option = 'presupuestos';
    protected array $permissions = [];

    public function __construct(){
        if(session('currentCompany')){
            $this->permissions = $this->resolvePermissions([
                'budgets.create',
                'budgets.destroy',
                'budgets.edit',
                'budgets.index',
                'budgets.search',
                'budgets.show',
                'budgets.update'
            ]);   
        } 
    }   

    /**
     * 1. Listado de presupuestos por empresa.
     */
    public function index(BudgetFilterRequest $request){
        $perPage = $request->input('per_page', config('constants.RECORDS_PER_PAGE_DEFAULT_'));

        $budgets = $this->dataQuery($request)->paginate($perPage)->onEachSide(1);

        return Inertia::render('Admin/Budget/Index', [
            "title" => __($this->option),
            "subtitle" => __('presupuestos'),
            "module" => $this->module,
            "slug" => 'budgets',
            "budgets" => BudgetResource::collection($budgets),
            "queryParams" => request()->query() ?: null,
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions,
            "columnPreferences" => UserColumnPreference::forUserAndTables(
                auth()->user()->id,
                ['tblBudgets'] 
            )
        ]);     
    }

    /**
     * 1.1. Data para exportación.
     */
    public function filteredData(BudgetFilterRequest $request){
        $cacheKey = 'filtered_budgets_' . md5(json_encode($request->all()));

        $budgets = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($request) {
            return $this->dataQuery($request)->get();
        });

        return response()->json([
            'budgets' => BudgetResource::collection($budgets)
        ]);    
    }

    /**
     * 1.2. Data Query.
     */
    private function dataQuery(BudgetFilterRequest $request){
        $query = Order::query();


    }

}
