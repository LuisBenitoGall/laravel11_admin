<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Helpers\helpers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use App\Support\CompanyContext;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

//Models:
use App\Models\Company;
use App\Models\Currency;
use App\Models\AccountingAccount;
use App\Models\AccountingAccountType;
use App\Models\CompanySetting;
use App\Models\UserColumnPreference;
use App\Models\CustomerProvider;
use App\Models\IvaType;
//use App\Models\SeatLines;

//Requests:
use App\Http\Requests\AccountingAccountFilterRequest;
use App\Http\Requests\AccountingAccountStoreRequest;
use App\Http\Requests\AccountingAccountUpdateRequest;

//Resources:
use App\Http\Resources\AccountingAccountResource;

//Traits
use App\Traits\HasUserPermissionsTrait;
use App\Traits\LocaleTrait;

class AccountingAccountController extends Controller{
	/**
	 * 1. Listado de cuentas contables.
	 * 1.1. Data para exportación.
     * 1.2. Data Query.
     * 2. Formulario nueva cuenta.
     * 3. Guardar nueva cuenta.
     * 4. Editar cuenta.
     * 5. Actualizar cuenta.
     * 6. Actualizar estado.
     * 7. Eliminar cuenta.
	 */

	use HasUserPermissionsTrait;
    use LocaleTrait;

    private $module = 'accounting';
    private $option = 'cuentas_contables';
    protected array $permissions = [];

    public function __construct(){
        if(session('currentCompany')){
            $this->permissions = $this->resolvePermissions([
                'accounting-accounts.create',
                'accounting-accounts.destroy',
                'accounting-accounts.edit',
                'accounting-accounts.index',
                'accounting-accounts.search',
                'accounting-accounts.show',
                'accounting-accounts.update'
            ]);   
        } 
    }  

    /**
     * 1. Listado de cuentas contables.
     */
    public function index(AccountingAccountFilterRequest $request){
        $perPage = $request->input('per_page', config('constants.RECORDS_PER_PAGE_DEFAULT_'));

        $accounts = $this->dataQuery($request)->paginate($perPage)->onEachSide(1);

        return Inertia::render('Admin/AccountingAccount/Index', [
            "title" => __($this->option),
            "subtitle" => __('listado'),
            "module" => $this->module,
            "slug" => 'accounting-accounts',
            "accounts" => AccountingAccountResource::collection($accounts),
            "queryParams" => request()->query() ?: null,
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions,
            "columnPreferences" => UserColumnPreference::forUserAndTables(
                auth()->user()->id,
                ['tblAccountingAccounts'] 
            )
        ]);
    } 

    /**
     * 1.1. Data para exportación.
     */
    public function filteredData(AccountingAccountFilterRequest $request){
        $cacheKey = 'filtered_accounting_accounts_' . md5(json_encode($request->all()));

        $accounts = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($request) {
            return $this->dataQuery($request)->get();
        });

        return response()->json([
            'accounts' => AccountingAccountResource::collection($accounts)
        ]);
    }

    /**
     * 1.2. Data Query.
     */
    private function dataQuery(AccountingAccountFilterRequest $request){
        $query = AccountingAccount::select('accounting_accounts.*')
        // ->join('user_accounting_accounts', 'accounting_accounts.id', '=', 'user_accounting_accounts.company_id')
        ->where('accounting_accounts.company_id', session('currentCompany'));

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
     * 2. Formulario nueva cuenta.
     */
    public function create(){
    	$types = AccountingAccountType::select(DB::raw("CONCAT(code, ' - ', name) as type"), 'id')
        ->where('autoreference', '0')
        ->orderBy('code', 'ASC')
        ->get();

        $natureOptions = collect(AccountingAccount::natureLabels(fn($k) => __($k)))
        ->map(fn($label, $value) => ['value' => $value, 'label' => $label])
        ->values()
        ->all();

        $currencies = Currency::select('id', 'name')
        ->where('status', 1)
        ->orderBy('name', 'ASC')
        ->get();

        return Inertia::render('Admin/AccountingAccount/Create', [
            "title" => __($this->option),
            "subtitle" => __('cuenta_nueva'),
            "module" => $this->module,
            "slug" => 'accounting-accounts',
            "types" => $types,
            'natureOptions' => $natureOptions,
            'currencies' => $currencies,
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions
        ]);    
    }

    /**
     * 3. Guardar nueva cuenta.
     */
    public function store(AccountingAccountStoreRequest $request, CompanyContext $ctx){
        $companyId = (int) $ctx->id();
        if ($companyId <= 0) {
            abort(422, __('no_hay_empresa_activa'));
        }

        //Guardando cuenta:
        $account = AccountingAccount::saveAccount($request->validated(), $companyId);        

        return redirect()->route('accounting-accounts.edit', $account->id)->with('msg', __('cuenta_creada_msg'));
    }

    /**
     * 4. Editar cuenta.
     */
    public function edit(AccountingAccount $account){
        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));

        $account->load(['createdBy', 'updatedBy']);  

        //Formateo de datos:
        $account->formatted_created_at = Carbon::parse($account->created_at)->format($locale[4].' H:i:s');
        $account->formatted_updated_at = Carbon::parse($account->updated_at)->format($locale[4].' H:i:s');

        $account->created_by_name = optional($account->createdBy)->full_name ?? false;
        $account->updated_by_name = optional($account->updatedBy)->full_name ?? false;  

        return Inertia::render('Admin/AccountingAccount/Edit', [
            "title" => __($this->option),
            "subtitle" => __('cuenta_editar'),
            "module" => $this->module,
            "slug" => 'accounting-accounts',
            "availableLocales" => LocaleTrait::availableLocales(),
            "account" => $account,
            'msg' => session('msg'),
            'alert' => session('alert'),
            "permissions" => $this->permissions
        ]);
    }

    /**
     * 5. Actualizar cuenta.
     */
    public function update(AccountingAccountUpdateRequest $request, AccountingAccount $account){
        try {
            $validated = $request->validated();

            DB::transaction(function () use ($account, $validated){
                $account->name               = $validated['name'];



                $account->status                = ToBool::cast($validated['status'] ?? null, false);
                $account->updated_by            = Auth::id();
                $account->save();
            });

            return redirect()->route('accounting-accounts.edit', $account->id)
            ->with('msg', __('cuenta_actualizada_msg'));

        } catch (\Throwable $e) {
            Log::error('Error en update(): ' . $e->getMessage());
            abort(500, 'Error interno del servidor');
        }
    }

    /**
     * 6. Actualizar estado.
     */
    public function status(Request $request){
        $account = AccountingAccount::find($request->id);

        if(!$account){
            return response()->json(['error' => __('cuenta_no_encontrada')], 404);
        }

        $account->status = !$account->status;
        $account->save();

        return response()->json([
            'success' => true,
            'message' => __('estado_actualizado_ok'),
            'new_status' => $account->status
        ]);
    }
    
    /**
     * 7. Eliminar cuenta.
     */
    public function destroy(AccountingAccount $account){
        $account_id = $account->id;

        $account->delete();

        return redirect()->route('accounting-accounts.index')->with('msg', __('cuenta_eliminada'));
    }
}