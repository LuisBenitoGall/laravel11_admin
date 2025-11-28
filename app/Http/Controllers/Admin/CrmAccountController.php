<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
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

//Concerns:
use App\Concerns\HasContactTypes;
use App\Concerns\HasSalutation;

//Models:
use App\Models\Company;
use App\Models\Country;
use App\Models\CrmAccount;
use App\Models\Currency;
use App\Models\CustomerProvider;
use App\Models\User;
use App\Models\UserColumnPreference;
use App\Models\UserCompany;

//Requests:
use App\Http\Requests\CrmAccountFilterRequest;
use App\Http\Requests\CrmAccountStoreRequest;
use App\Http\Requests\CrmAccountUpdateRequest;
use App\Http\Requests\UserFilterRequest;

//Resources:
use App\Http\Resources\CrmAccountResource;

//Traits:
use App\Traits\HasUserPermissionsTrait;
use App\Traits\LocaleTrait;
use App\Traits\ModulesTrait;

class CrmAccountController extends Controller{
    /**
     * 1. Listado de cuentas.
     * 1.1. Data para exportación.
     * 1.2. Data Query.
     * 2. Formulario nueva cuenta.
     * 3. Guardar nueva cuenta.
     * 4. Mostrar cuenta.
     * 5. Editar cuenta.
     * 5.1. Query usuarios de la cuenta CRM.
     * 5.2. Filtrado de usuarios para la cuenta CRM.
     * 6. Actualizar cuenta.
     * 7. Eliminar cuenta.
     * 8. Actualizar estado.
     * 9. Mapeo de usuarios.
     * 10. Convertir cuenta a cliente o proveedor.
     */
    
    use HasUserPermissionsTrait;
    use LocaleTrait;

    private $module = 'crm';
    private $option = 'cuentas_crm';
    protected array $permissions = [];

    public function __construct(){
        if(session('currentCompany')){
            $this->permissions = $this->resolvePermissions([
                'crm-accounts.create',
                'crm-accounts.destroy',
                'crm-accounts.edit',
                'crm-accounts.index',
                'crm-accounts.search',
                'crm-accounts.show',
                'crm-accounts.update',
                'customers.create',
                'providers.create'
            ]);   
        } 
    }   

    /**
     * 1. Listado de cuentas.
     */
    public function index(CrmAccountFilterRequest $request){
        $perPage = $request->input('per_page', config('constants.RECORDS_PER_PAGE_DEFAULT_'));

        $accounts = $this->dataQuery($request)->paginate($perPage)->onEachSide(1);

        return Inertia::render('Admin/CrmAccount/Index', [
            "title" => __($this->option),
            "subtitle" => __('listado'),
            "module" => $this->module,
            "slug" => 'crm-accounts',
            "accounts" => CrmAccountResource::collection($accounts),
            "queryParams" => request()->query() ?: null,
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions,
            "columnPreferences" => UserColumnPreference::forUserAndTables(
                auth()->user()->id,
                ['tblCrmAccounts'] 
            )
        ]);
    }

    /**
     * 1.1. Data para exportación.
     */
    public function filteredData(CrmAccountFilterRequest $request){
        $cacheKey = 'filtered_crm_accounts_' . md5(json_encode($request->all()));

        $accounts = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($request) {
            return $this->dataQuery($request)->get();
        });

        return response()->json([
            'accounts' => CrmAccountResource::collection($accounts)
        ]);
    }

    /**
     * 1.2. Data Query.
     */
    private function dataQuery(CrmAccountFilterRequest $request){
        $user = auth()->user();

        $query = CrmAccount::select('crm_accounts.*', 'companies.nif', 'companies.logo')
        ->leftJoin('companies', 'crm_accounts.linked_company_id', '=', 'companies.id')
        ->where('crm_accounts.company_id', session('currentCompany'));

        // Filtros dinámicos
        $filters = [
            'name' => fn($q, $v) => $q->where('companies.name', 'like', "%$v%"),
            'tradename' => fn($q, $v) => $q->where('companies.tradename', 'like', "%$v%"),
            'nif' => fn($q, $v) => $q->where('companies.nif', 'like', "%$v%"),
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
        $allowedSortFields = ['name', 'tradename'];

        if (!in_array($sortField, $allowedSortFields)) {
            $sortField = 'name';
        }

        return $query->orderBy($sortField, $sortDirection);        
    }

    /**
     * 2. Formulario nueva cuenta.
     */
    public function create(){
        return Inertia::render('Admin/CrmAccount/Create', [
            "title" => __($this->option),
            "subtitle" => __('cuenta_nueva'),
            'module' => $this->module,
            "slug" => 'crm-accounts',
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions
        ]);    
    }

    /**
     * 3. Guardar nueva cuenta.
     */
    public function store(CrmAccountStoreRequest $request){
        $linkedCompanyId = null;

        //if ($request->filled('nif')) {
            $company = Company::where('nif', $request->nif)
            ->where('nif', '!=', '')
            ->first();

            if (!$company) {
                $company = Company::saveCompany($request, false); // no crea cuenta de empresa
            }

            $linkedCompanyId = $company->id;
        //}

        $scopeCompanyId = session('currentCompany'); // la empresa activa que “posee” la cuenta CRM

        $account = CrmAccount::saveAccount($request, $scopeCompanyId, $linkedCompanyId);

        return redirect()->route('crm-accounts.edit', $account->id)
            ->with('msg', __('cuenta_creada_msg'));
    }

    /**
     * 4. Mostrar cuenta.
     */
    public function show(Request $request, CrmAccount $account){
        $account->load(['company']);

        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));
         //Formato de fecha:
        $dateFormat = $locale[4] ?? 'd/m/Y';

        if ($request->expectsJson()) {
            return response()->json([
                'data' => $account,
            ]);
        }

        return Inertia::render('Admin/CrmAccount/Show', [
            "title" => __($this->option),
            "subtitle" => __('cuenta_ver'),
            "module" => $this->module,
            "slug" => 'crm-accounts',
            "availableLocales" => LocaleTrait::availableLocales(),
            "account" => $account,
            "msg" => session('msg'),
            "alert" => session('alert'),
            "permissions" => $this->permissions
        ]);
    }

    /**
     * 5. Editar cuenta.
     */
    public function edit(CrmAccount $account, $tab = false){
        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));

        $company = $account->linked_company_id? Company::find($account->linked_company_id):false;

        if(!$company){
            return redirect()->route('crm-accounts.index')->with('alert', __('empresa_edicion_error'));
            exit;    
        }

        //Formateo de datos:
        $company->formatted_created_at = Carbon::parse($company->created_at)->format($locale[4].' H:i:s');
        $company->formatted_updated_at = Carbon::parse($company->updated_at)->format($locale[4].' H:i:s');

        //Usuarios de la empresa:
        $users = User::select('users.*')
        ->join('user_companies', 'users.id', '=', 'user_companies.user_id')
        ->where('user_companies.company_id', $company->id)
        ->orderBy('users.name', 'ASC')
        ->get();

        //Usuarios:
        $users = UserCompany::usersByCompany($company->id);

        //Mapeo de usuarios:
        $table = $this->mapUsersForTable($users, $locale);

        //Tratamientos:
        $salutations = HasSalutation::comboOptions();

        //Tipos de contacto:
        $contact_types = HasContactTypes::comboOptions();

        //Países:
        $countries = Country::where('status', 1)
        ->orderBy('name', 'ASC')
        ->get();

        //Moneda:
        $currencies = Currency::where('status', 1)
        ->orderBy('name', 'ASC')
        ->get();

        //Se utiliza Company/Edit.jsx para edición también de la cuenta:
        return Inertia::render('Admin/Company/Edit', [
            "title" => __($this->option),
            "subtitle" => __('cuenta_editar'),
            "module" => $this->module,
            "slug" => 'crm-accounts',
            "availableLocales" => LocaleTrait::availableLocales(),
            "company" => $company,
            "crm_account" => $account,
            "users" => $users,
            "rows" => $table,
            "salutations" => $salutations,
            "contact_types" => $contact_types,
            "countries" => $countries,
            "currencies" => $currencies,
            "tab" => $tab,
            "msg" => session('msg'),
            "alert" => session('alert'),
            "permissions" => $this->permissions
        ]);
    }

    /**
     * 5.1. Query usuarios de la cuenta CRM.
     */
    private function crmAccountUsersDataQuery(UserFilterRequest $request, CrmAccount $account): Builder
    {
        $companyId = $account->linked_company_id;

        $query = User::query()
            ->select('users.*')
            ->join('user_companies', 'users.id', '=', 'user_companies.user_id')
            ->where('user_companies.company_id', $companyId)
            ->with(['avatar', 'phones']);

        // Filtros dinámicos (mismo estilo que tu UserController::dataQuery)
        $filters = [
            'name' => function (Builder $q, $v) {
                $q->where(function ($sub) use ($v) {
                    $sub->where('name', 'like', "%{$v}%")
                        ->orWhere('surname', 'like', "%{$v}%");
                });
            },
            'email' => function (Builder $q, $v) {
                $q->where('email', 'like', "%{$v}%");
            },
            'phones' => function (Builder $q, $v) {
                $q->whereHas('phones', function ($sub) use ($v) {
                    $sub->where('phone_number', 'like', "%{$v}%");
                });
            },
        ];

        foreach ($filters as $key => $callback) {
            if ($request->filled($key)) {
                $callback($query, $request->input($key));
            }
        }

        // Filtros por rango de fechas (created_at)
        $dateFrom = $request->input('date_from');
        $dateTo   = $request->input('date_to');

        if ($dateFrom && $dateTo) {
            $query->whereBetween('users.created_at', [
                "{$dateFrom} 00:00:00",
                "{$dateTo} 23:59:59",
            ]);
        } elseif ($dateFrom) {
            $query->where('users.created_at', '>=', "{$dateFrom} 00:00:00");
        } elseif ($dateTo) {
            $query->where('users.created_at', '<=', "{$dateTo} 23:59:59");
        }

        // Ordenación
        $sortField     = $request->input('sort_field', 'name');
        $sortDirection = $request->input('sort_direction', 'ASC');
        $allowedSortFields = ['name', 'surname', 'email', 'created_at'];

        if (!in_array($sortField, $allowedSortFields, true)) {
            $sortField = 'name';
        }

        return $query->orderBy("users.{$sortField}", $sortDirection);
    }

    /**
     * 5.2. Filtrado de usuarios para la cuenta CRM.
     */
    public function crmAccountUsersFilteredData(UserFilterRequest $request, CrmAccount $account)
    {
        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));

        $cacheKey = 'crm_account_' . $account->id . '_users_' . md5(json_encode($request->all()));

        $users = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($request, $account) {
            return $this->crmAccountUsersDataQuery($request, $account)->get();
        });

        $rows = $this->mapUsersForTable($users, $locale);

        return response()->json([
            // clave 'rows' si en el front entityName = 'rows'
            'rows' => $rows,
        ]);
    }

    /**
     * 6. Actualizar cuenta.
     *
     * 17/11/2025: los datos de empresa se actualizan directamente desde CompanyController/update. Aquí se actualizan los datos que no se contemplan en companies.
     */
    public function update(CrmAccountUpdateRequest $request, CrmAccount $account){
        try {
            $validated = $request->validated();

            $account->website = $request->website;
            $account->currency_id = $request->currency_id;
            $account->billing_street = $request->billing_street;
            $account->billing_city = $request->billing_city;
            $account->billing_state = $request->billing_state;
            $account->billing_postal_code = $request->billing_postal_code;
            $account->billing_country_code = $request->billing_country_code;
            $account->shipping_street = $request->shipping_street;
            $account->shipping_city = $request->shipping_city;
            $account->shipping_state = $request->shipping_state;
            $account->shipping_postal_code = $request->shipping_postal_code;
            $account->shipping_country_code = $request->shipping_country_code;
            $account->updated_by = Auth::id();
            $account->save();

            return redirect()->route('crm-accounts.edit', $account->id)
            ->with('msg', __('cuenta_actualizada_msg'));

        } catch (\Throwable $e) {
            Log::error('Error en update(): ' . $e->getMessage());
            abort(500, 'Error interno del servidor');
        }
    }

    /**
     * 7. Eliminar cuenta.
     */
    public function destroy(CrmAccount $account){
        $account_id = $account->id;
    
        $account->delete();

        return redirect()->route('crm-accounts.index')->with('msg', __('cuenta_eliminada'));
    }

    /**
     * 8. Actualizar estado.
     */
    public function status(Request $request){
        $account = CrmAccount::find($request->id);

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
     * 9. Mapeo de usuarios.
     */
    private function mapUsersForTable(Collection $users, array $locale): Collection
    {
        return $users->map(function ($u) use ($locale) {
            $primary = $u->phones->firstWhere('is_primary', true) ?: $u->phones->first();
            $salutation = $u->salutation ? HasSalutation::salutationAbbrOf($u->salutation) : '';

            return [
                'id'            => $u->id,
                'name'          => trim($salutation . ' ' . ucwords($u->name) . ' ' . ucwords($u->surname)),
                'position'      => $u->position,
                'created_at'    => Carbon::parse($u->created_at)->format($locale[4]),
                'email'         => $u->email,
                'avatar'        => $u->avatar && $u->avatar->image
                                    ? \Storage::url('users/' . $u->avatar->image)
                                    : null,
                'phone_primary' => $primary?->e164,
                'whatsapp'      => (bool) optional($primary)->is_whatsapp,
                'phones_count'  => $u->phones->count(),
                'phones'        => $u->phones->map(fn($p) => [
                    'e164'        => $p->e164,
                    'type'        => $p->type,
                    'label'       => $p->label,
                    'is_primary'  => $p->is_primary,
                    'is_whatsapp' => $p->is_whatsapp,
                ])->values(),
            ];
        });
    }

    /**
     * 10. Convertir cuenta a cliente o proveedor.
     */
    public function convertToCustomerProvider(Request $request){
        $ctx = app(CompanyContext::class);
        $currentCompanyId = (int) $ctx->id();
        if($currentCompanyId <= 0){
            abort(422, __('no_hay_empresa_activa'));
        }  

        $data = $request->validate([
            'as_customer' => ['boolean'],
            'as_provider' => ['boolean'],
        ]);

        if (!($data['as_customer'] ?? false) && !($data['as_provider'] ?? false)) {
            return back()->withErrors([
            'as_customer' => __('debes_seleccionar_cliente_proveedor')
            ]);
        }

        $crm_account = CrmAccount::find($request->crm_account_id);

        //Como cliente:
        if($data['as_customer']){
            $cp = CustomerProvider::firstOrCreate([
                'provider_id' => $currentCompanyId,
                'customer_id' => $crm_account->linked_company_id
            ], [
                'created_by' => Auth::id(),
                'updated_by' => Auth::id(),
                'default_currency_id' => $crm_account->currency_id,
                'status' => 1,
            ]); 

            //TO-DO: generar cuenta contable.   
        }

        //Como proveedor:
        if($data['as_provider']){
            $cp = CustomerProvider::firstOrCreate([
                'provider_id' => $crm_account->linked_company_id,
                'customer_id' => $currentCompanyId
            ], [
                'created_by' => Auth::id(),
                'updated_by' => Auth::id(),
                'default_currency_id' => $crm_account->currency_id,
                'status' => 1,
            ]);  

            //TO-DO: generar cuenta contable.       
        }

        return redirect()->route('companies.edit', $crm_account->linked_company_id)->with('msg', __('conversion_completada'));  
    }

}
