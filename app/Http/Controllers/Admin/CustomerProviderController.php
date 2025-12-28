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
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use App\Support\CompanyContext;
use App\Support\Filters\AdHocFilterApplier;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;
use File;

//Concerns:
use App\Concerns\HasSalutation;

//Models:
use App\Models\AccountingAccount;
use App\Models\Category;
use App\Models\Company;
use App\Models\CompanyAccount;
use App\Models\Country;
use App\Models\Currency;
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
     * 1.2. Data Query genérica clientes y proveedores.
     * 1.2.1. Side clientes.
     * 1.2.2. Side proveedores.     * 
     * 1.3. Definición de filtros avanzados.
     * 1.4. Configuración de filtros avanzados.
     * 1.5. Leyenda de filtros aplicados.
     * 2. Listado de proveedores.
     * 2.1. Data para exportación proveedores.
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
            "countries" => Cache::remember('countries_select', now()->addDay(), function () {
                return Country::query()->orderBy('name')->get(['id','name']);
            }),
            "queryParams" => request()->query() ?: null,
            "adhocFilters" => $this->adHocFilterUiConfig(),
            "activeFiltersLegend" => $this->activeFiltersLegend($request),
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
     * 1.2. Data Query genérica clientes y proveedores.
     */
    private function dataQuerySide(Request $request, string $side): Builder
    {
        $ctx = app(CompanyContext::class);
        $currentCompanyId = (int) $ctx->id();

        $query = Company::query()
            ->from('companies')
            ->select([
                'companies.*',
                'cp.id AS relation_id',
                'cp.status AS relation_status',
                'cp.default_currency_id',
                'cur.name AS currency_name',
            ])
            ->join('customer_providers as cp', function ($j) use ($side, $currentCompanyId) {
                if ($side === 'customers') {
                    $j->on('companies.id', '=', 'cp.customer_id')
                      ->where('cp.provider_id', '=', $currentCompanyId);
                } else {
                    $j->on('companies.id', '=', 'cp.provider_id')
                      ->where('cp.customer_id', '=', $currentCompanyId);
                }
            })
            ->leftJoin('currencies as cur', 'cur.id', '=', 'cp.default_currency_id')
            ->whereNull('cp.deleted_at')
            ->whereNull('companies.deleted_at');

        // Header filters (los que ya tenías)
        $filters = [
            'name' => function (Builder $q, $v) {
                $v = trim((string)$v);
                if ($v !== '') $q->where('companies.name', 'like', "%{$v}%");
            },
            'tradename' => function (Builder $q, $v) {
                $v = trim((string)$v);
                if ($v !== '') $q->where('companies.tradename', 'like', "%{$v}%");
            },
        ];

        foreach ($filters as $key => $cb) {
            if ($request->filled($key)) $cb($query, $request->input($key));
        }

        // Date range (companies.created_at)
        $from = $request->input('date_from');
        $to   = $request->input('date_to');

        if ($from && $to) {
            $query->whereBetween('companies.created_at', ["{$from} 00:00:00", "{$to} 23:59:59"]);
        } elseif ($from) {
            $query->where('companies.created_at', '>=', "{$from} 00:00:00");
        } elseif ($to) {
            $query->where('companies.created_at', '<=', "{$to} 23:59:59");
        }

        // ✅ Adhoc filters (usa tu macro applyAdhocFilters ya existente)
        $query->applyAdhocFilters($request, $this->adHocFilterDefinitions());

        // Sort
        $sortField = $request->input('sort_field', 'name');
        $sortDir   = strtoupper((string)$request->input('sort_direction', 'ASC')) === 'DESC' ? 'DESC' : 'ASC';

        $map = [
            'name' => 'companies.name',
            'tradename' => 'companies.tradename',
            'created_at' => 'companies.created_at',
            'nif' => 'companies.nif'
        ];

        if (!isset($map[$sortField])) $sortField = 'name';

        return $query->orderBy($map[$sortField], $sortDir);
    }

    /**
     * 1.2.1. Side clientes.
     */
    private function dataQueryCustomers(CustomerFilterRequest $request): Builder
    {
        return $this->dataQuerySide($request, 'customers');
    }

    /**
     * 1.2.2. Side proveedores.
     */
    private function dataQueryProviders(ProviderFilterRequest $request): Builder
    {
        return $this->dataQuerySide($request, 'providers');
    }

    /**
     * 1.3. Definición de filtros avanzados.
     */
    private function adHocFilterDefinitions(): array
    {
        return [
            // companies.is_ute
            'ute' => [
                'rules' => ['nullable', 'integer', 'in:0,1'],
                'apply' => fn (Builder $q, $v) => $q->where('companies.is_ute', (int)$v),
            ],

            // companies.status
            'status' => [
                'rules' => ['nullable', 'integer', 'in:0,1'],
                'apply' => fn (Builder $q, $v) => $q->where('companies.status', (int)$v),
            ],

            // cp.default_currency_id
            'currency_id' => [
                'rules' => ['nullable', 'integer', 'min:1'],
                'apply' => fn (Builder $q, $v) => $q->where('cp.default_currency_id', (int)$v),
            ],

            /**
             * Workplaces filters (sin duplicar filas)
             * companies.id = workplaces.company_id
             */

            // workplaces.cp (prefijo)
            // 'workplace_cp' => [
            //     'rules' => ['nullable', 'string', 'max:12'],
            //     'apply' => function (Builder $q, $v) {
            //         $v = trim((string)$v);
            //         if ($v === '') return;

            //         $q->whereExists(function ($sub) use ($v) {
            //             $sub->selectRaw('1')
            //                 ->from('workplaces as w')
            //                 ->whereColumn('w.company_id', 'companies.id')
            //                 ->whereNull('w.deleted_at')
            //                 ->where('w.cp', 'like', $v.'%');
            //         });
            //     },
            // ],

            // towns.id (población)
            'town_id' => [
                'rules' => ['nullable', 'integer', 'min:1'],
                'apply' => function (Builder $q, $v) {
                    $q->whereExists(function ($sub) use ($v) {
                        $sub->selectRaw('1')
                            ->from('workplaces as w')
                            ->whereColumn('w.company_id', 'companies.id')
                            ->whereNull('w.deleted_at')
                            ->where('w.town_id', '=', (int)$v);
                    });
                },
            ],

            // provinces.id (provincia, vía towns.province_id)
            'province_id' => [
                'rules' => ['nullable', 'integer', 'min:1'],
                'apply' => function (Builder $q, $v) {
                    $pid = (int)$v;

                    $q->whereExists(function ($sub) use ($pid) {
                        $sub->selectRaw('1')
                            ->from('workplaces as w')
                            ->join('towns as t', 't.id', '=', 'w.town_id')
                            ->whereColumn('w.company_id', 'companies.id')
                            ->whereNull('w.deleted_at')
                            ->where('t.province_id', '=', $pid);
                    });
                },
            ],

            // countries.id (país, vía provinces.country_id)
            'country_id' => [
                'rules' => ['nullable', 'integer', 'min:1'],
                'apply' => function (Builder $q, $v) {
                    $cid = (int)$v;

                    $q->whereExists(function ($sub) use ($cid) {
                        $sub->selectRaw('1')
                            ->from('workplaces as w')
                            ->join('towns as t', 't.id', '=', 'w.town_id')
                            ->join('provinces as p', 'p.id', '=', 't.province_id')
                            ->whereColumn('w.company_id', 'companies.id')
                            ->whereNull('w.deleted_at')
                            ->where('p.country_id', '=', $cid);
                    });
                },
            ],
        ];
    }

    /**
     * 1.4. Configuración de filtros avanzados.
     */
    private function adHocFilterUiConfig(): array
    {
        $currencies = Cache::remember('adhoc_currencies_active', now()->addDays(1), function () {
            return Currency::query()
                ->select('id', 'name')
                ->where('status', 1)
                ->orderBy('name', 'ASC')
                ->get()
                ->map(fn ($c) => ['value' => $c->id, 'label' => $c->name])
                ->values()
                ->all();
        });

        return [
            //28/12/2025: no aplica a RFT:
            // [
            //     'key' => 'ute',
            //     'label' => __('ute'),
            //     'type' => 'select',
            //     'multiple' => false,
            //     'options' => [
            //         ['value' => 1, 'label' => __('si')],
            //         ['value' => 0, 'label' => __('no')],
            //     ],
            // ],
            [
                'key' => 'status',
                'label' => __('estado'),
                'type' => 'select',
                'multiple' => false,
                'options' => [
                    ['value' => 1, 'label' => __('activo')],
                    ['value' => 0, 'label' => __('inactivo')],
                ],
            ],
            [
                'key' => 'currency_id',
                'label' => __('moneda'),
                'type' => 'select',
                'multiple' => false,
                'options' => $currencies,
            ],

            [
                'key' => 'location',
                'label' => __('ubicacion'),
                'type' => 'location_selects',
                'colClass' => 'col-12',
                // keys reales que vas a guardar en adhoc (y que luego aplicarás en query):
                'countryKey'  => 'country_id',
                'provinceKey' => 'province_id',
                'townKey'     => 'town_id',
                'cpKey'       => 'cp'
            ]
        ];
    }

    /**
     * 1.5. Leyenda de filtros aplicados.
     */
    private function activeFiltersLegend(Request $request): array
    {
        $legend = [];

        foreach ([
            'name'      => __('empresa'),
            'tradename' => __('nombre_comercial'),
            'date_from' => __('desde'),
            'date_to'   => __('hasta'),
        ] as $key => $label) {
            if ($request->filled($key)) {
                $legend[] = [
                    'key' => "header.$key",
                    'scope' => 'header',
                    'path' => $key,
                    'label' => $label,
                    'value' => $request->input($key),
                ];
            }
        }

        $adhoc = $request->input('adhoc', []);
        $adhoc = is_array($adhoc) ? $adhoc : [];

        if (($adhoc['ute'] ?? '') !== '') {
            $legend[] = [
                'key' => 'adhoc.ute',
                'scope' => 'adhoc',
                'path' => 'ute',
                'label' => __('ute'),
                'value' => ((string)$adhoc['ute'] === '1') ? __('si') : __('no'),
            ];
        }

        if (($adhoc['status'] ?? '') !== '') {
            $legend[] = [
                'key' => 'adhoc.status',
                'scope' => 'adhoc',
                'path' => 'status',
                'label' => __('estado'),
                'value' => ((string)$adhoc['status'] === '1') ? __('activo') : __('inactivo'),
            ];
        }

        if (!empty($adhoc['currency_id'])) {
            $cid = (int)$adhoc['currency_id'];
            $cname = Cache::remember("currency_name_$cid", now()->addDays(30), function () use ($cid) {
                return Currency::query()->whereKey($cid)->value('name') ?: (string)$cid;
            });

            $legend[] = [
                'key' => 'adhoc.currency_id',
                'scope' => 'adhoc',
                'path' => 'currency_id',
                'label' => __('moneda'),
                'value' => $cname,
            ];
        }

        if (!empty($adhoc['workplace_cp'])) {
            $legend[] = [
                'key' => 'adhoc.workplace_cp',
                'scope' => 'adhoc',
                'path' => 'workplace_cp',
                'label' => __('cp'),
                'value' => trim((string)$adhoc['workplace_cp']),
            ];
        }

        if (!empty($adhoc['country_id'])) {
            $id = (int)$adhoc['country_id'];
            $name = Cache::remember("country_name_$id", now()->addDays(30), function () use ($id) {
                return Country::query()->whereKey($id)->value('name') ?: (string)$id;
            });

            $legend[] = [
                'key' => 'adhoc.country_id',
                'scope' => 'adhoc',
                'path' => 'country_id',
                'label' => __('pais'),
                'value' => $name,
            ];
        }

        if (!empty($adhoc['province_id'])) {
            $id = (int)$adhoc['province_id'];
            $name = Cache::remember("province_name_$id", now()->addDays(30), function () use ($id) {
                return DB::table('provinces')->where('id', $id)->value('name') ?: (string)$id;
            });

            $legend[] = [
                'key' => 'adhoc.province_id',
                'scope' => 'adhoc',
                'path' => 'province_id',
                'label' => __('provincia'),
                'value' => $name,
            ];
        }

        if (!empty($adhoc['town_id'])) {
            $id = (int)$adhoc['town_id'];
            $name = Cache::remember("town_name_$id", now()->addDays(30), function () use ($id) {
                return DB::table('towns')->where('id', $id)->value('name') ?: (string)$id;
            });

            $legend[] = [
                'key' => 'adhoc.town_id',
                'scope' => 'adhoc',
                'path' => 'town_id',
                'label' => __('poblacion'),
                'value' => $name,
            ];
        }

        return $legend;
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
            "countries" => Cache::remember('countries_select', now()->addDay(), function () {
                return Country::query()->orderBy('name')->get(['id','name']);
            }),
            "queryParams" => request()->query() ?: null,
            "adhocFilters" => $this->adHocFilterUiConfig(),
            "activeFiltersLegend" => $this->activeFiltersLegend($request),
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
    public function storeCustomer(CustomerStoreRequest $request){
        $ctx = app(CompanyContext::class);
        $currentCompanyId = (int) $ctx->id();

        //Guardando empresa. El método del Model guarda también company_account, roles, workplace y user_company.
        $customer = Company::saveCompany($request);

        //Guardar relación:
        $relation = CustomerProvider::firstOrCreate(
            [
                'customer_id' => $customer->id,
                'provider_id' => $currentCompanyId
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
    public function storeProvider(CustomerStoreRequest $request){
        $ctx = app(CompanyContext::class);
        $currentCompanyId = (int) $ctx->id();

        //Guardando empresa. El método del Model guarda también company_account, roles, workplace y user_company.
        $provider = Company::saveCompany($request);

        //Guardar relación:
        $relation = CustomerProvider::firstOrCreate(
            [
                'customer_id' => $currentCompanyId,
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
        $ctx = app(CompanyContext::class);
        $providerId = (int) $ctx->id();

        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));

        //Relación cliente:
        $relation = CustomerProvider::where('customer_id', $customer->id)
        ->where('provider_id', $providerId)
        ->first();

        //Usuarios:
        $users = UserCompany::usersByCompany($customer->id);

        //Subtipos de contacto:
        $contact_subtypes = Category::where('company_id', $providerId)
        ->where('module', 'users')
        ->where('status', 1)
        ->where('depth', '0')
        ->orderBy('name', 'ASC')
        ->get();

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
            "contact_subtypes" => $contact_subtypes,
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

        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));

        //Relación proveedor:
        $relation = CustomerProvider::where('customer_id', $customerId)
        ->where('provider_id', $provider->id)
        ->first();

        //Usuarios:
        $users = UserCompany::usersByCompany($provider->id);

        //Subtipos de contacto:
        $contact_subtypes = Category::where('company_id', $customerId)
        ->where('module', 'users')
        ->where('status', 1)
        ->where('depth', '0')
        ->orderBy('name', 'ASC')
        ->get();

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
            "contact_subtypes" => $contact_subtypes,
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
