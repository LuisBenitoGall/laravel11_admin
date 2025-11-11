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

//Concerns:
use App\Concerns\HasSalutation;

//Models:
use App\Models\AccountingAccount;
use App\Models\Company;
use App\Models\CompanyAccount;
use App\Models\CustomerProvider;
use App\Models\UserColumnPreference;
use App\Models\UserCompany;

//Requests:
use App\Http\Requests\CustomerFilterRequest;
use App\Http\Requests\CustomerStoreRequest;
use App\Http\Requests\CustomerUpdateRequest;
use App\Http\Requests\ProviderFilterRequest;
use App\Http\Requests\ProviderStoreRequest;
use App\Http\Requests\ProviderUpdateRequest;

//Resources:
use App\Http\Resources\CustomerProviderResource;

//Traits:
use App\Traits\HasUserPermissionsTrait;
use App\Traits\LocaleTrait;

class CustomerProviderController extends Controller{
    /**
     * 1. Listado de clientes.
     * 1.1. Data para exportación clientes.
     * 1.2. Data Query clientes.
     * 2. Listado de proveedores.
     * 2.1. Data para exportación proveedores.
     * 2.2. Data Query proveedores.
     * 3. Formulario nuevo cliente o proveedor.
     * 3.1. Helper normalización cliente o proveedor.
     * 3.2. Helper empresas no vinculadas.
     * 4. Editar.
     * 5. Actualizar.
     * 6. Guardar nuevo cliente o proveedor por listado.
     * 7. Editar cliente.
     * 8. Editar proveedor.
     * 9. Estado de cliente o proveedor.
     * 10. Eliminar relación cliente-proveedor.
     */
    
    use HasUserPermissionsTrait;
    use LocaleTrait;

    private $module = 'companies';
    private $option = 'empresas';
    protected array $permissions = [];

    public function __construct(){
        if(session('currentCompany')){
            $this->permissions = $this->resolvePermissions([
                'customers.create',
                'customers.destroy',
                'customers.edit',
                'customers.index',
                'customers.search',
                'customers.show',
                'customers.update',

                'providers.create',
                'providers.destroy',
                'providers.edit',
                'providers.index',
                'providers.search',
                'providers.show',
                'providers.update',

                'cost-centers.index',
                'workplaces.index'
            ]);   
        } 
    }  

    /**
     * 1. Listado de clientes.
     */
    public function customers(CustomerFilterRequest $request){
        $perPage = $request->input('per_page', config('constants.RECORDS_PER_PAGE_DEFAULT_'));

        $companies = $this->dataQueryCustomers($request)->paginate($perPage)->onEachSide(1);

        return Inertia::render('Admin/Customer/Index', [
            "title" => __('clientes'),
            "subtitle" => __('listado'),
            "module" => $this->module,
            "slug" => 'customers',
            "companies" => CustomerProviderResource::collection($companies),
            "queryParams" => request()->query() ?: null,
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions,
            "columnPreferences" => UserColumnPreference::forUserAndTables(
                auth()->user()->id,
                ['tblCustomers'] 
            )
        ]);
    } 

    /**
     * 1.1. Data para exportación clientes.
     */
    public function filteredDataCustomers(CustomerFilterRequest $request){
        $cacheKey = 'filtered_customers_' . md5(json_encode($request->all()));

        $companies = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($request) {
            return $this->dataQueryCustomers($request)->get();
        });

        return response()->json([
            'companies' => CustomerProviderResource::collection($companies)
        ]);
    }

    /**
     * 1.2. Data Query clientes.
     */
    private function dataQueryCustomers(CustomerFilterRequest $request){
        $user = auth()->user();

        $query = Company::select('companies.*', 'customer_providers.id AS relation_id')
        ->join('customer_providers', 'companies.id', '=', 'customer_providers.customer_id')
        ->where('customer_providers.provider_id', session('currentCompany'))
        ->whereNull('customer_providers.deleted_at');

        // Filtros dinámicos
        $filters = [
            'name' => fn($q, $v) => $q->where('name', 'like', "%$v%"),
            'tradename' => fn($q, $v) => $q->where('tradename', 'like', "%$v%")
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
     * 2. Listado de proveedores.
     */
    public function providers(ProviderFilterRequest $request){
        $perPage = $request->input('per_page', config('constants.RECORDS_PER_PAGE_DEFAULT_'));

        $companies = $this->dataQueryProviders($request)->paginate($perPage)->onEachSide(1);

        return Inertia::render('Admin/Provider/Index', [
            "title" => __('proveedores'),
            "subtitle" => __('listado'),
            "module" => $this->module,
            "slug" => 'providers',
            "companies" => CustomerProviderResource::collection($companies),
            "queryParams" => request()->query() ?: null,
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions,
            "columnPreferences" => UserColumnPreference::forUserAndTables(
                auth()->user()->id,
                ['tblProviders'] 
            )
        ]);
    } 

    /**
     * 2.1. Data para exportación proveedores.
     */
    public function filteredDataProviders(ProviderFilterRequest $request){
        $cacheKey = 'filtered_providers_' . md5(json_encode($request->all()));

        $companies = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($request) {
            return $this->dataQueryProviders($request)->get();
        });

        return response()->json([
            'companies' => CustomerProviderResource::collection($companies)
        ]);
    }

    /**
     * 2.2. Data Query proveedores.
     */
    private function dataQueryProviders(ProviderFilterRequest $request){
        $user = auth()->user();

        $query = Company::select('companies.*', 'customer_providers.id AS relation_id')
        ->join('customer_providers', 'companies.id', '=', 'customer_providers.provider_id')
        ->where('customer_providers.customer_id', session('currentCompany'))
        ->whereNull('customer_providers.deleted_at');

        // Filtros dinámicos
        $filters = [
            'name' => fn($q, $v) => $q->where('name', 'like', "%$v%"),
            'tradename' => fn($q, $v) => $q->where('tradename', 'like', "%$v%")
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
     * 3. Formulario nuevo cliente o proveedor.
     */
    public function create($side = null){
        $side = $this->normalizeSide($side);

        switch($side){
            case 'customers':
                $directory_ = 'Customer';
                $title_ = 'clientes';
                $subtitle_ = 'cliente_nuevo';
                $slug_ = 'customers';
                break;
            case 'providers':
                $directory_ = 'Provider';
                $title_ = 'proveedores';
                $subtitle_ = 'proveedor_nuevo';
                $slug_ = 'providers';
                break;
            default:
                // code...
                break;
        }

        $other_companies = $this->getOtherCompanies(session('currentCompany'), $side);

        return Inertia::render('Admin/'.$directory_.'/Create', [
            "title" => __($title_),
            "subtitle" => __($subtitle_),
            'module' => $this->module,
            "slug" => $slug_,
            "side" => $side,
            "other_companies" => $other_companies,
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions
        ]);    
    }

    /**
     * 3.1. Helper normalización cliente o proveedor.
     */
    private function normalizeSide($side){
        $side = $side ?: 'customers';
        $side = in_array($side, array('customers','providers')) ? $side : 'customers';
        return $side;
    }

    /**
     * 3.2. Helper empresas no vinculadas.
     *
     * Obtenemos las empresas del sistema que no mantienen relación de cliente ni proveedor con la empresa en session.
     */
    private function getOtherCompanies($id, $side){
        $query = Company::select('id', 'name')
            ->where('id', '!=', $id)
            ->where('status', 1);

        if($side === 'customers'){
            $query->whereNotIn('id', function ($subquery) use ($id){
                $subquery->select('customer_id')
                    ->from('customer_providers')
                    ->where('provider_id', $id);
            });
        }elseif($side === 'providers'){
            $query->whereNotIn('id', function ($subquery) use ($id){
                $subquery->select('provider_id')
                    ->from('customer_providers')
                    ->where('customer_id', $id);
            });
        }

        return $query->orderBy('name', 'ASC')->get();
    }

    /**
     * 4. Guardar nuevo cliente.
     */
    public function storeCustomer(CustomerStoreRequest $request, CompanyContext $ctx){
        $companyId = (int) $ctx->id();
        if($companyId <= 0){
            abort(422, __('no_hay_empresa_activa'));
        }

        //Guardando empresa. El método del Model guarda también company_account, roles, workplace y user_company.
        $customer = Company::saveCompany($request);

        //Guardar relación:
        $relation = CustomerProvider::firstOrCreate(
            [
                'customer_id' => $customer->id,
                'provider_id' => $companyId
            ],
            [
                'created_by' => Auth::id(),
                'updated_by' => Auth::id()
            ]
        );

        //TODO: Cuenta contable:
        
        return redirect()->route('customers.edit', $customer->id)
            ->with('msg', __('cliente_creado_msg'));
    }
    
    /**
     * 5. Guardar nuevo proveedor.
     */
    public function storeProvider(CustomerStoreRequest $request, CompanyContext $ctx){
        $companyId = (int) $ctx->id();
        if($companyId <= 0){
            abort(422, __('no_hay_empresa_activa'));
        }

        //Guardando empresa. El método del Model guarda también company_account, roles, workplace y user_company.
        $provider = Company::saveCompany($request);

        //Guardar relación:
        $relation = CustomerProvider::firstOrCreate(
            [
                'customer_id' => $companyId,
                'provider_id' => $provider->id
            ],
            [
                'created_by' => Auth::id(),
                'updated_by' => Auth::id()
            ]
        );

        //TODO: Cuenta contable:
        
        return redirect()->route('providers.edit', $provider->id)
            ->with('msg', __('proveedor_creado_msg'));
    }
    
    /**
     * 6. Guardar nuevo cliente o proveedor por listado.
     */
    public function storeByList(Request $request){
        $side = $request->side;

        if($side == 'customers'){
            $customer_id = $request->company_id;
            $provider_id = session('currentCompany');
        }else{
            $customer_id = session('currentCompany');
            $provider_id = $request->company_id;
        }

        //Comprobamos que la relación no exista previamente:
        $relation = CustomerProvider::firstOrCreate(
            [
                'customer_id' => $customer_id,
                'provider_id' => $provider_id
            ],
            [
                'created_by' => Auth::id(),
                'updated_by' => Auth::id()
            ]
        );

        //TODO: generar cuenta contable según sea cliente o proveedor.

        $msg = $side == 'customers'? __('cliente_creado_msg'):__('proveedor_creado_msg');
        return redirect()->route($side.'.index')->with('msg', $msg);
    }

    /**
     * 7. Editar cliente.
     */
    public function editCustomer(Company $customer, $tab = false){
        // CompanyContext resolved manually to avoid controller injection issues when route provides optional params
        $ctx = app(CompanyContext::class);
        $providerId = (int) $ctx->id();
        if($providerId <= 0){
            abort(422, __('no_hay_empresa_activa'));
        }  

        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));

        //Relación cliente:
        $relation = CustomerProvider::where('customer_id', $customer->id)
        ->where('provider_id', $providerId)
        ->first();

        //Usuarios:
        $users = UserCompany::usersByCompany($customer->id);

        $table = $users->map(function ($u) use($locale){
            $primary = $u->phones->firstWhere('is_primary', true) ?: $u->phones->first();

            $salutation = $u->salutation? HasSalutation::salutationAbbrOf($u->salutation):'';

            return [
                'id'            => $u->id,
                'name'          => $salutation.' '.ucwords($u->name).' '.ucwords($u->surname),
                'position'      => $u->position,
                'created_at'    => Carbon::parse($u->created_at)->format($locale[4]),
                'email'         => $u->email,
                'avatar'        => $u->avatar && $u->avatar->image 
                                    ? \Storage::url('users/'.$u->avatar->image): null,
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

        //Tratamientos:
        $salutations = HasSalutation::comboOptions();

        //Formateo de datos:
        $relation->formatted_created_at = Carbon::parse($relation->created_at)->format($locale[4].' H:i:s');
        $relation->formatted_updated_at = Carbon::parse($relation->updated_at)->format($locale[4].' H:i:s');

        $permissions_ = $this->resolvePermissions([
            'customers.create',
            'customers.destroy',
            'customers.edit',
            'customers.index',
            'customers.search',
            'customers.show',
            'customers.update',
            'users.create',
            'cost-centers.index',
            'workplaces.index'
        ]);

        return Inertia::render('Admin/Customer/Edit', [
            "title" => __('clientes'),
            "subtitle" => __('cliente_editar'),
            "module" => $this->module,
            "slug" => 'customers',
            "availableLocales" => LocaleTrait::availableLocales(),
            "customer" => $customer,
            "relation" => $relation,
            "users" => $users,
            "rows" => $table,
            "salutations" => $salutations,
            "tab" => $tab,
            "msg" => session('msg'),
            "alert" => session('alert'),
            "permissions" => $permissions_
        ]);
    }

    /**
     * 8. Editar proveedor.
     */
    public function editProvider(Company $provider, $tab = false){
        // CompanyContext resolved manually to avoid controller injection issues when route provides optional params
        $ctx = app(CompanyContext::class);
        $customerId = (int) $ctx->id();
        if($customerId <= 0){
            abort(422, __('no_hay_empresa_activa'));
        }  

        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));

        //Relación proveedor:
        $relation = CustomerProvider::where('customer_id', $customerId)
        ->where('provider_id', $provider->id)
        ->first();

        //Usuarios:
        $users = UserCompany::usersByCompany($provider->id);

        $table = $users->map(function ($u) use($locale){
            $primary = $u->phones->firstWhere('is_primary', true) ?: $u->phones->first();

            $salutation = $u->salutation? HasSalutation::salutationAbbrOf($u->salutation):'';

            return [
                'id'            => $u->id,
                'name'          => $salutation.' '.ucwords($u->name).' '.ucwords($u->surname),
                'position'      => $u->position,
                'created_at'    => Carbon::parse($u->created_at)->format($locale[4]),
                'email'         => $u->email,
                'avatar'        => $u->avatar && $u->avatar->image 
                                    ? \Storage::url('users/'.$u->avatar->image): null,
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

        //Tratamientos:
        $salutations = HasSalutation::comboOptions();

        //Formateo de datos:
        $relation->formatted_created_at = Carbon::parse($relation->created_at)->format($locale[4].' H:i:s');
        $relation->formatted_updated_at = Carbon::parse($relation->updated_at)->format($locale[4].' H:i:s');

        $permissions_ = $this->resolvePermissions([
            'providers.create',
            'providers.destroy',
            'providers.edit',
            'providers.index',
            'providers.search',
            'providers.show',
            'providers.update',
            'users.create',
            'cost-centers.index',
            'workplaces.index'
        ]);

        return Inertia::render('Admin/Provider/Edit', [
            "title" => __('proveedores'),
            "subtitle" => __('proveedor_editar'),
            "module" => $this->module,
            "slug" => 'providers',
            "availableLocales" => LocaleTrait::availableLocales(),
            "provider" => $provider,
            "relation" => $relation,
            "users" => $users,
            "rows" => $table,
            "salutations" => $salutations,
            "tab" => $tab,
            "msg" => session('msg'),
            "alert" => session('alert'),
            "permissions" => $permissions_
        ]);
    }

    /**
     * 9. Estado de cliente o proveedor.
     */
    public function status(Request $request, $side = false, CompanyContext $ctx){
        if(!$side){
            return response()->json([
                'success' => false
            ]);    
        }

        if($side == 'customer'){
            $customer_id = $request->id;
            $provider_id = (int) $ctx->id();
        }elseif($side == 'provider'){
            $customer_id = (int) $ctx->id();
            $provider_id = $request->id;
        }

        $status = $request->status == 1? true:false;

        CustomerProvider::where('customer_id', $customer_id)
        ->where('provider_id', $provider_id)
        ->update(['status' => $status]);

        return response()->json([
            'success' => true,
            'message' => __('estado_actualizado_ok'),
            'new_status' => $status
        ]);
    }

    /**
     * 10. Eliminar relación cliente-proveedor.
     */
    public function destroy(CustomerProvider $relation, $side = false){
        $relation->delete();

        if($side == 'customer'){
            return redirect()->route('customers.index')->with('msg', __('cliente_eliminado'));
        }else{
            return redirect()->route('providers.index')->with('msg', __('proveedor_eliminado'));
        }
    }
}
