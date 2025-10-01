<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

//Models:
use App\Models\Company;
use App\Models\CompanyAccount;
use App\Models\CompanySetting;
use App\Models\UserColumnPreference;

//Requests:
use App\Http\Requests\CompanyAccountFilterRequest;

//Resources:
use App\Http\Resources\CompanyAccountResource;

// Traits
use App\Traits\HasUserPermissionsTrait;
use App\Traits\LocaleTrait;

class CompanyAccountController extends Controller{
    /**
     * 1. Cuentas por empresa.
     * 1.1. Data para exportación.
     * 1.2. Data Query.
     * 2. Formulario renovación cuenta.
     * 3. Cancelar cuenta.
     */
    
    use HasUserPermissionsTrait;
    use LocaleTrait;

    private $module = 'company-accounts';
    private $option = 'cuenta_empresa';
    protected array $permissions = [];
    private $co_currency;

    public function __construct(){
        if(session('currentCompany')){
            $this->permissions = $this->resolvePermissions([
                'my-account.create',
                'my-account.destroy',
                'my-account.edit',
                'my-account.index',
                'my-account.search',
                'my-account.show',
                'my-account.update'
            ]);
        }

        //Moneda:
        $this->co_currency = CompanySetting::co_currency(0);
    }

    /**
     * 1. Cuentas por empresa.
     */
    public function index(CompanyAccountFilterRequest $request){
        $perPage = $request->input('per_page', config('constants.RECORDS_PER_PAGE_DEFAULT_'));

        $accounts = $this->dataQuery($request)->paginate($perPage)->onEachSide(1);

        return Inertia::render('Admin/CompanyAccount/Index', [
            "title" => __($this->option),
            "subtitle" => __('listado'),
            "module" => $this->module,
            "slug" => 'company-accounts',
            "accounts" => CompanyAccountResource::collection($accounts),
            "currency" => $this->co_currency,
            "queryParams" => request()->query() ?: null,
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions,
            "columnPreferences" => UserColumnPreference::forUserAndTables(
                auth()->user()->id,
                ['tblCompanyAccounts'] 
            )
        ]);
    }

    /**
     * 1.1. Data para exportación.
     */
    public function filteredData(CompanyAccountFilterRequest $request){
        $cacheKey = 'filtered_company_accounts_' . md5(json_encode($request->all()));

        $accounts = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($request) {
            return $this->dataQuery($request)->get();
        });

        return response()->json([
            'companies' => CompanyAccountResource::collection($accounts)
        ]);
    }

    /**
     * 1.2. Data Query.
     */
    private function dataQuery(CompanyAccountFilterRequest $request){
        $query = CompanyAccount::select('company_accounts.*', 'accounts.name')
        ->join('accounts', 'company_accounts.account_id', '=', 'accounts.id')
        ->where('company_accounts.company_id', session('currentCompany'));

        // Filtros dinámicos
        $filters = [
            'name' => fn($q, $v) => $q->where('name', 'like', "%$v%"),
        ];

        foreach ($filters as $key => $callback) {
            if ($request->filled($key)) {
                $callback($query, $request->input($key));
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
     * 2. Formulario renovación cuenta.
     */
    public function create(){
        return Inertia::render('Admin/CompanyAccount/Create', [
            "title" => __($this->option),
            "subtitle" => __('cuenta_renovar'),
            'module' => $this->module,
            "slug" => 'company-accounts',
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions
        ]);        
    }

    /**
     * 3. Cancelar cuenta.
     */
    public function destroy(Request $request, CompanyAccount $account){
        dd($account);
        //La cuenta debe pertenecer a la empresa en sesión:
        if($account->company_id != session('currentCompany')){
            $alert = trans('textos.no_permisos_accion');
            return redirect()->route('company-accounts.index')->with(compact('alert'));  
            exit;      
        }

        $account->end_date = date('Y-m-d');
        $account->status = 2;
        $account->save();

        //Mantenimiento de filtros:
        $queryParams = $request->only([
            'price', 'sort_field', 'sort_direction', 'per_page', 'page'
        ]);

        return redirect()->route('company-accounts.index', $queryParams)->with(compact('msg', __('cuenta_cancelada_ok')));
    }
    
}
