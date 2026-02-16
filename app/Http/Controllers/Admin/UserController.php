<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
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

//Concerns:
use App\Concerns\HasBusinessTypes;
use App\Concerns\HasContactTypes;
use App\Concerns\HasSalutation;

//Models:
use App\Models\Categorizable;
use App\Models\Category;
use App\Models\Company;
use App\Models\CostCenter;
use App\Models\Country;
use App\Models\CrmAccount;
use App\Models\CrmContact;
use App\Models\CustomerProvider;
use App\Models\MarketingListUser;
use App\Models\Phone;
use App\Models\Province;
use App\Models\Town;
use App\Models\User;
use App\Models\UserAddress;
use App\Models\UserColumnPreference;
use App\Models\UserCompany;
use App\Models\UserCostCenter;
use App\Models\UserImage;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Traits\HasRoles;

//Requests:
use App\Http\Requests\UserFilterRequest;
use App\Http\Requests\UserStoreRequest;
use App\Http\Requests\UserUpdatePwdRequest;
use App\Http\Requests\UserUpdateRequest;

//Resources:
use App\Http\Resources\UserResource;

//Traits:
use App\Traits\ConvertDateTrait;
use App\Traits\HasUserPermissionsTrait;
use App\Traits\LocaleTrait;

class UserController extends Controller{
    /**
     * 1. Listado de usuarios.
     * 1.1. Data para exportación.
     * 1.2. Data Query.
     * 1.3. Definición de filtros avanzados.
     * 1.4. Configuración de filtros avanzados.
     * 1.5. Leyenda de filtros aplicados.
     * 2. Formulario nuevo usuario.
     * 3. Guardar nuevo usuario.
     * 4. Mostrar usuario.
     * 5. Editar usuario. 
     * 5.1. Editar usuario en session.
     * 6. Actualizar usuario.
     * 7. Eliminar usuario.
     * 8. Actualizar estado.
     * 9. Opciones de roles para nuevo usuario.
     * 10. Eliminar firma.
     * 11. Actualizar password.
     * 12. Listado de contactos.
     * 12.1. Contactos para exportación.
     * 12.2. Data Query contactos.
     * 13. Usuarios por categorías.
     * 13.1. Búsqueda de usuarios por categorías.
     * 14. Buscador de usuarios.
     */
    
    use ConvertDateTrait;
    use HasUserPermissionsTrait;
    use LocaleTrait;

    private $module = 'users';
    private $option = 'usuarios';
    protected array $permissions = [];

    public function __construct(){
        if(session('currentCompany')){
            $this->permissions = $this->resolvePermissions([
                'users.create',
                'users.destroy',
                'users.edit',
                'users.index',
                'users.search',
                'users.show',
                'users.update',
                'customers.create',
                'customers.edit',
                'providers.create',
                'providers.edit',
                'crm-accounts.edit'
            ]);   
        } 
    }  
    
    /**
     * 1. Listado de usuarios.
     */
    public function index(UserFilterRequest $request, $company_id = false){
        $perPage = $request->input('per_page', config('constants.RECORDS_PER_PAGE_DEFAULT_'));

        if(!$company_id){
            $company_id = session('currentCompany');
        }

        $request->merge(['company_id' => $company_id]);

        $users = $this->dataQuery($request)
        ->paginate($perPage)
        ->onEachSide(1);

        return Inertia::render('Admin/User/Index', [
            "title" => __($this->option),
            "subtitle" => __('listado'),
            "module" => $this->module,
            "slug" => 'users',
            "users" => UserResource::collection($users),
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
                ['tblUsers'] 
            )
        ]);
    }

    /**
     * 1.1. Data para exportación.
     */
    public function filteredData(UserFilterRequest $request){
        $company_id = $request->input('company_id', session('currentCompany'));

        $cacheKey = 'filtered_users_' . md5(json_encode($request->all()));

        $request->merge(['company_id' => $company_id]);

        $users = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($request, $company_id) {
            return $this->dataQuery($request->merge(['company_id' => $company_id]))->get();
        });

        return response()->json([
            'users' => UserResource::collection($users)
        ]);
    }

    /**
     * 1.2. Data Query.
     */
    private function dataQuery(UserFilterRequest $request): Builder{
        $company_id = $request->input('company_id', session('currentCompany'));

        $query = User::query()
        ->with(['avatar', 'phones',
            'categories' => function ($q) use ($company_id) {
                if ($company_id !== 'all') {
                    $q->where('categories.company_id', $company_id);
                }
                $q->where('categories.module', 'users'); // 👈 ahora es el slug (string)
            }
        ]);

        // Filtrar por empresa si es necesario
        if ($company_id !== 'all') {
            $query->whereHas('companies', function ($q) use ($company_id) {
                $q->where('companies.id', $company_id);
            });
        }

        // Filtros dinámicos
        $filters = [
            'name' => fn($q, $v) => $q->where(function ($sub) use ($v) {
                $sub->where('name', 'like', "%$v%")
                    ->orWhere('surname', 'like', "%$v%");
            }),
            'email' => fn($q, $v) => $q->where('email', 'like', "%$v%"),
            'phones' => function ($q, $v) {
                $v = trim((string) $v);
                if ($v === '') {
                    return;
                }
                $like = '%' . str_replace(['%', '_', '\\'], ['\\%', '\\_', '\\\\'], $v) . '%';
                $q->whereHas('phones', fn ($sub) => $sub->where('e164', 'like', $like));
            },
            'categories' => fn($q, $v) => $q->whereHas('categories', function ($sub) use ($company_id, $v) {
                if ($company_id !== 'all') {
                    $sub->where('categories.company_id', $company_id);
                }
                $sub->where('categories.module', 'users')
                    ->where('categories.name', 'like', "%$v%");
            })
        ];

        foreach ($filters as $key => $callback) {
            if ($request->filled($key)) {
                $callback($query, $request->input($key));
            }
        }

        // Filtros por rangos de fechas dinámicos
        $dateFilters = [
            'created_at' => ['date_from', 'date_to'],
            // Si tienes más columnas con rango de fechas:
            // 'last_login_at' => ['login_from', 'login_to'],
            // 'updated_at' => ['updated_from', 'updated_to'],
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

        //Filtros avanzados:
        $query->applyAdhocFilters($request, $this->adHocFilterDefinitions($company_id));

        // Ordenación
        $sortField = $request->input('sort_field', 'name');
        $sortDirection = $request->input('sort_direction', 'ASC');
        $allowedSortFields = ['name', 'surname', 'email'];

        if (!in_array($sortField, $allowedSortFields)) {
            $sortField = 'name';
        }

        $sortDirection = strtoupper($sortDirection) === 'DESC' ? 'DESC' : 'ASC';

        return $query->orderBy($sortField, $sortDirection);
    }

    /**
     * 1.3. Definición de filtros avanzados.
     */
    private function adHocFilterDefinitions(string|int $company_id): array
    {
        // ⚠️ Ajusta esto según tu relación real:
        // Si es hasOne: $addressRel = 'address'
        // Si es hasMany: $addressRel = 'addresses'
        $addressRel = 'addresses';

        return [
            'sex' => [
                'rules' => ['nullable'],
                'apply' => function (Builder $q, $v) {
                    // soporte legacy: adhoc[sex][value]
                    if (is_array($v)) {
                        $v = $v['value'] ?? null;
                    }
                    if (!$v) return;

                    $q->where('sex', $v);
                },
            ],

            'nif' => [
                'rules' => ['nullable', 'string', 'max:50'],
                'apply' => fn(Builder $q, $v) => $q->where('nif', 'like', "%$v%"),
            ],

            'created_between' => [
                'rules' => ['nullable', 'array'],
                'apply' => function (Builder $q, $v) {
                    $from = $v['from'] ?? null;
                    $to   = $v['to']   ?? null;

                    if ($from && $to) {
                        $q->whereBetween('created_at', ["$from 00:00:00", "$to 23:59:59"]);
                    } elseif ($from) {
                        $q->where('created_at', '>=', "$from 00:00:00");
                    } elseif ($to) {
                        $q->where('created_at', '<=', "$to 23:59:59");
                    }
                },
            ],

            'birthday_between' => [
                'rules' => ['nullable', 'array'],
                'apply' => function (Builder $q, $v) {
                    $from = $v['from'] ?? null;
                    $to   = $v['to']   ?? null;

                    // Si birthday es DATE (sin hora), esto es suficiente
                    if ($from && $to) {
                        $q->whereBetween('birthday', [$from, $to]);
                    } elseif ($from) {
                        $q->where('birthday', '>=', $from);
                    } elseif ($to) {
                        $q->where('birthday', '<=', $to);
                    }
                },
            ],

            'address' => [
                'rules' => ['nullable', 'string', 'max:255'],
                'apply' => function (Builder $q, $v) use ($addressRel) {
                    $q->whereHas($addressRel, function ($sub) use ($v) {
                        $sub->where(function ($w) use ($v) {
                            $w->where('address', 'like', "%$v%")
                              ->orWhere('address_extra', 'like', "%$v%");
                        });
                    });
                },
            ],

            'town_id' => [
                'rules' => ['nullable', 'integer'],
                'apply' => fn(Builder $q, $v) =>
                    $q->whereHas('addresses', fn($sub) => $sub->where('town_id', $v)),
            ],

            'province_id' => [
                'rules' => ['nullable', 'integer'],
                'apply' => fn(Builder $q, $v) =>
                    $q->whereHas('addresses.town', fn($sub) => $sub->where('province_id', $v)),
            ],

            'country_id' => [
                'rules' => ['nullable', 'integer'],
                'apply' => fn(Builder $q, $v) =>
                    $q->whereHas('addresses.town.province', fn($sub) => $sub->where('country_id', $v)),
            ],

            'cp' => [
                'rules' => ['nullable', 'string', 'max:10'],
                'apply' => fn($q, $v) => $q->whereHas('addresses', function ($sub) use ($v) {
                    $v = trim($v);
                    if ($v === '') return;

                    // Si parece CP completo, exact match; si no, prefijo
                    if (strlen($v) >= 5) {
                        $sub->where('cp', $v);
                    } else {
                        $sub->where('cp', 'like', $v.'%');
                    }
                }),
            ],

        ];
    }

    /**
     * 1.4. Configuración de filtros avanzados.
     */
    private function adHocFilterUiConfig(): array
    {
        return [
            [
                'key' => 'sex',
                'label' => __('sexo'),
                'type' => 'select',
                'multiple' => false,
                // Ajusta values a lo que uses en DB (M/F, 1/2, etc.)
                'options' => [
                    ['value' => 'h', 'label' => __('hombre')],
                    ['value' => 'm', 'label' => __('mujer')],
                    ['value' => 'o', 'label' => __('otro')],
                ],
            ],
            [
                'key' => 'nif',
                'label' => __('nif'),
                'type' => 'text',
            ],
            [
                'key' => 'created_between',
                'label' => __('alta'),
                'type' => 'daterange',
            ],
            [
                'key' => 'birthday_between',
                'label' => __('aniversario'),
                'type' => 'daterange',
            ],
            [
                'key' => 'address',
                'label' => __('direccion'),
                'type' => 'text',
            ],
            [
                'key' => 'location', // solo identificador del bloque UI
                'label' => __('ubicacion'),
                'type' => 'location_selects',
                'colClass' => 'col-12',

                // keys reales que irán en query params: adhoc[country_id], adhoc[province_id], adhoc[town_id], adhoc[cp]
                'countryKey' => 'country_id',
                'provinceKey' => 'province_id',
                'townKey' => 'town_id',
                'cpKey' => 'cp',
            ],
        ];
    }

    /**
     * 1.5. Leyenda de filtros aplicados.
     */
    private function activeFiltersLegend(UserFilterRequest $request): array
    {
        $legend = [];

        // Cabecera
        foreach ([
            'name' => __('nombre'),
            'email' => __('email'),
            'phones' => __('telefonos'),
            'categories' => __('categoria'),
            'position' => __('cargo'),
            'companies' => __('empresa'),
            'contact_type' => __('contacto_tipo')
        ] as $key => $label) {
            if ($request->filled($key)) {
                $legend[] = [
                    'key'   => "header.$key",
                    'scope' => 'header',
                    'path'  => $key,
                    'label' => $label,
                    'value' => $request->input($key),
                ];
            }
        }

        // Adhoc
        $adhoc = $request->input('adhoc', []);
        $adhoc = is_array($adhoc) ? $adhoc : [];

        $hasText = static fn(string $k) => isset($adhoc[$k]) && trim((string) $adhoc[$k]) !== '';

        // sex (soporta legacy adhoc[sex][value])
        $sex = $adhoc['sex'] ?? null;
        if (is_array($sex)) $sex = $sex['value'] ?? null;
        $sex = is_string($sex) ? trim($sex) : $sex;

        if ($sex) {
            $sexMap = ['m' => __('mujer'), 'h' => __('hombre'), 'o' => __('otro')];
            $legend[] = [
                'key'   => 'adhoc.sex',
                'scope' => 'adhoc',
                'path'  => 'sex',
                'label' => __('sexo'),
                'value' => $sexMap[$sex] ?? $sex,
            ];
        }

        if ($hasText('nif')) {
            $legend[] = [
                'key'   => 'adhoc.nif',
                'scope' => 'adhoc',
                'path'  => 'nif',
                'label' => __('nif'),
                'value' => trim((string)$adhoc['nif']),
            ];
        }

        if ($hasText('address')) {
            $legend[] = [
                'key'   => 'adhoc.address',
                'scope' => 'adhoc',
                'path'  => 'address',
                'label' => __('direccion'),
                'value' => trim((string)$adhoc['address']),
            ];
        }

        if ($hasText('cp')) {
            $legend[] = [
                'key'   => 'adhoc.cp',
                'scope' => 'adhoc',
                'path'  => 'cp',
                'label' => __('cp'),
                'value' => trim((string)$adhoc['cp']),
            ];
        }

        // Rangos
        $addRange = function (string $key, string $label) use (&$legend, $adhoc) {
            if (!isset($adhoc[$key]) || !is_array($adhoc[$key])) return;

            $from = isset($adhoc[$key]['from']) ? trim((string)$adhoc[$key]['from']) : null;
            $to   = isset($adhoc[$key]['to'])   ? trim((string)$adhoc[$key]['to'])   : null;

            if ($from !== '' || $to !== '') {
                $value = trim(($from ?: '') . ' — ' . ($to ?: ''));
                $legend[] = [
                    'key'   => "adhoc.$key",
                    'scope' => 'adhoc',
                    'path'  => $key,
                    'label' => $label,
                    'value' => $value,
                ];
            }
        };

        $addRange('created_between', __('alta'));
        $addRange('birthday_between', __('aniversario'));

        // Ubicación (cache por ID)
        $countryId  = $adhoc['country_id']  ?? null;
        $provinceId = $adhoc['province_id'] ?? null;
        $townId     = $adhoc['town_id']     ?? null;

        $countryId  = is_numeric($countryId)  ? (int)$countryId  : null;
        $provinceId = is_numeric($provinceId) ? (int)$provinceId : null;
        $townId     = is_numeric($townId)     ? (int)$townId     : null;

        if ($countryId) {
            $name = Cache::remember("country_name_$countryId", now()->addDays(7), fn() =>
                Country::whereKey($countryId)->value('name')
            ) ?? (string)$countryId;

            $legend[] = [
                'key'   => 'adhoc.country_id',
                'scope' => 'adhoc',
                'path'  => 'country_id',
                'label' => __('pais'),
                'value' => $name,
            ];
        }

        if ($provinceId) {
            $name = Cache::remember("province_name_$provinceId", now()->addDays(7), fn() =>
                Province::whereKey($provinceId)->value('name')
            ) ?? (string)$provinceId;

            $legend[] = [
                'key'   => 'adhoc.province_id',
                'scope' => 'adhoc',
                'path'  => 'province_id',
                'label' => __('provincia'),
                'value' => $name,
            ];
        }

        if ($townId) {
            $name = Cache::remember("town_name_$townId", now()->addDays(7), fn() =>
                Town::whereKey($townId)->value('name')
            ) ?? (string)$townId;

            $legend[] = [
                'key'   => 'adhoc.town_id',
                'scope' => 'adhoc',
                'path'  => 'town_id',
                'label' => __('poblacion'),
                'value' => $name,
            ];
        }

        return $legend;
    }

    /**
     * 2. Formulario nuevo usuario.
     */
    public function create(){
        $roles = $this->roleOptions(true);

        return Inertia::render('Admin/User/Create', [
            "title" => __($this->option),
            "subtitle" => __('usuario_nuevo'),
            "module" => $this->module,
            "slug" => 'users',
            "roles" => $roles,
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions
        ]);
    }

    /**
     * 3. Guardar nuevo usuario.
     * Si llega user_id (autocomplete): vincula usuario existente a la cuenta CRM (user_companies + crm_contacts).
     */
    public function store(UserStoreRequest $request){
        if ($request->filled('user_id')) {
            return $this->storeLinkExistingUser($request);
        }

        //Comprobamos si el rol dispone de permisos para declarar $isAdmin:
        $role = Role::find($request->input('role'));
        $permissions = false;

        if(!$role && !$request->side){
            $alert = __('role_no_existe');
            return redirect()->route('users.create')->with(compact('alert'));
            exit;
        }

        if($role){
            $permissions = $role->permissions;
        }

        $companyId = $request->company_id? $request->company_id:session('currentCompany');

        $isAdmin = false;
        if($role && $role->name == config('constants.SUPER_ADMIN_') || ($permissions && $permissions->count())){
            $isAdmin = true;
        }

        $status = $request->input('status')? 1:0;
        $random_password = Str::random(8);

        $user = new User();
        $user->name = $request->name;
        $user->surname = $request->surname;
        $user->salutation = $request->salutation;
        $user->email = $request->email;
        $user->email_verified_at = Carbon::now();
        $user->sex = $request->sex;
        $user->password = bcrypt($random_password);
        $user->birthday = $request->birthday;
        $user->isAdmin = $isAdmin;
        $user->status = $status;
        $user->remember_token = $request->input('_token');
        $user->save();

        //Guardamos rol:
        if($request->input('role')){
            $user->assignRole($role->name);
        }

        //Role para invitados:
        if(!$isAdmin){
            $user->assignRole(config('constants.ROLE_INVITADO_NAME_'));
        }

        //Vinculamos usuario a empresa:
        if($request->link_company){
            $uc = new UserCompany();
            $uc->user_id = $user->id;
            $uc->company_id = $companyId;
            $uc->position = $request->position;
            $uc->department = $request->department;
            $uc->save();
        }

        //Teléfonos:
        if($request->phones){
            $phones = request('phones', []); // puede ser ["600...", {"number":"+34 6...", "is_primary":true}, ...]
            Phone::addOrUpdateFor($user, $phones, ['default_region' => 'ES']);
        }

        //Envío de password:
        if($request->input('send_pwd') && $request->side != 'crm-accounts'){
            $emailFrom = config('constants.EMAIL_');
            $emailTo = $user->email;
            $data['usuario'] = $user->name.' '.$user->surname;
            $data['password'] = $random_password;
            $company = Company::find(session('currentCompany'));
            $data['company'] = $company;

            Mail::send('emails.send-user-password', $data, function($message) use($emailFrom, $company, $emailTo){
                $message->from($emailFrom, $company->name);
                $message->to($emailTo);
                $message->subject(__('contrasena_envio'));
            });
        }

        //Registro de CRM Contact:
        if($request->side == 'crm-accounts'){
            $cc = new CrmContact();
            $cc->company_id = session('currentCompany');
            $cc->user_id = $user->id;
            $cc->crm_account_id = $request->crm_account_id;
            $cc->contact_type = $request->contact_type;
            $cc->position = $request->position;
            $cc->department = $request->department;
            $cc->owner_id = Auth::id();
            $cc->validated = Carbon::now();
            $cc->save();

            //Guardamos categoría (subtipo de contacto)
            if($request->contact_subtype){
                $ctz = new Categorizable();
                $ctz->company_id = session('currentCompany');
                $ctz->category_id = $request->contact_subtype;
                $ctz->categorizable_type = 'App\Models\User';
                $ctz->categorizable_id = $user->id;
                $ctz->save();
            }
        }

        // Redirección explícita indicada por el cliente (p. ej. desde ModalUserCreate en Company/Edit → CrmAccount)
        if ($request->filled('redirect_to')) {
            $params = $request->input('redirect_params');
            if (is_string($params)) {
                $params = json_decode($params, true) ?: [];
            }
            return redirect()->route($request->redirect_to, $params ?? [])->with('msg', __('usuario_creado_msg'));
        }

        if ($request->side == 'customers') {
            return redirect()->route('customers.edit', [$companyId, 'users'])->with('msg', __('usuario_creado_msg'));
        }
        if ($request->side == 'providers') {
            return redirect()->route('providers.edit', [$companyId, 'users'])->with('msg', __('usuario_creado_msg'));
        }
        if ($request->side == 'crm-accounts') {
            return redirect()->route(['users.contacts', 'users'])->with('msg', __('usuario_creado_msg'));
        }

        return redirect()->route('users.edit', $user)->with('msg', __('usuario_creado_msg'));
    }

    /**
     * Vincular usuario existente a la cuenta CRM (UserSearch): user_companies + crm_contacts.
     * Comprueba que el usuario existe, que la cuenta existe y que el contacto no esté ya vinculado.
     */
    private function storeLinkExistingUser(Request $request)
    {
        $userId = (int) $request->input('user_id');
        $crmAccountId = (int) $request->input('crm_account_id');

        $user = User::find($userId);
        if (!$user) {
            return redirect()->back()->with('alert', __('usuario_no_encontrado'));
        }

        $crmAccount = CrmAccount::find($crmAccountId);
        if (!$crmAccount || !$crmAccount->linked_company_id) {
            return redirect()->back()->with('alert', __('cuenta_no_valida'));
        }

        $linkedCompanyId = (int) $crmAccount->linked_company_id;

        if (CrmContact::where('crm_account_id', $crmAccountId)->where('user_id', $userId)->exists()) {
            return redirect()->back()->with('alert', __('contacto_ya_vinculado_cuenta'));
        }

        UserCompany::firstOrCreate(
            ['user_id' => $userId, 'company_id' => $linkedCompanyId],
            ['position' => null, 'department' => null]
        );

        $cc = new CrmContact();
        $cc->company_id = session('currentCompany');
        $cc->user_id = $userId;
        $cc->crm_account_id = $crmAccountId;
        $cc->owner_id = Auth::id();
        $cc->validated = Carbon::now();
        $cc->save();

        if ($request->filled('redirect_to')) {
            $params = $request->input('redirect_params');
            if (is_string($params)) {
                $params = json_decode($params, true) ?: [];
            }
            return redirect()->route($request->redirect_to, $params ?? [])->with('msg', __('contacto_vinculado_msg'));
        }

        return redirect()
            ->route('crm-accounts.edit', [$crmAccountId, 'users'])
            ->with('msg', __('contacto_vinculado_msg'));
    }

    /**
     * 4. Mostrar usuario.
     */
    // public function show(Request $request, User $user){
    //     $user->load(['companies', 'phones', 'avatar']);
    //     $user->setRelation('companies', $user->companies);
    //     $user->unsetRelation('companies');

    //     $locale = LocaleTrait::languages(session('locale', app()->getLocale()));
    //     //Formato de fecha:
    //     $dateFormat = $locale[4] ?? 'd/m/Y';

    //     $user->birthday_formatted = $user->birthday
    //     ? $user->birthday->format($dateFormat)
    //     : null;

    //     if ($request->expectsJson()) {
    //         return response()->json([
    //             'data' => $user,
    //         ]);
    //     }

    //     // Si algún día quieres una vista "show" completa de página
    //     return Inertia::render('Admin/User/Show', [
    //         'user' => $user,
    //     ]);
    // }
    

    public function show(Request $request, User $user)
    {
        $companyId = (int) $request->input('company_id', session('currentCompany'));

        // Cargamos relaciones reales: companies (belongsToMany), phones, avatar, categories
        $user->load(['companies', 'phones', 'avatar', 'categories']);

        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));
        $dateFormat = $locale[4] ?? 'd/m/Y';

        $user->birthday_formatted = $user->birthday
            ? $user->birthday->format($dateFormat)
            : null;

        /*
         * 1) Tipo de contacto (crm_contacts.contact_type)
         *    Usamos la fila "principal" si existe (is_main = 1), y si no, la más reciente.
         */
        $crmContact = CrmContact::query()
            ->where('company_id', $companyId)
            ->where('user_id', $user->id)
            ->orderByDesc('is_main')
            ->orderByDesc('id')
            ->first();

        $contactTypeCode  = $crmContact?->contact_type;
        $contactTypeLabel = $contactTypeCode
            ? HasContactTypes::typesOf($contactTypeCode)
            : null;

        // Atributos virtuales para la vista
        $user->contact_type_code  = $contactTypeCode;
        $user->contact_type_label = $contactTypeLabel;

        /*
         * 2) Subtipo de contacto (categoría del usuario)
         *    Usamos la primera categoría que aplique en esta empresa y módulo 'users'.
         */
        $contactSubtypeCategory = $user->categories()
            ->when($companyId > 0, function ($q) use ($companyId) {
                $q->where('categories.company_id', $companyId);
            })
            ->where('categories.module', 'users')
            ->orderBy('categories.name')
            ->first();

        $user->contact_subtype_id   = $contactSubtypeCategory?->id;
        $user->contact_subtype_name = $contactSubtypeCategory?->name;

        if ($request->expectsJson()) {
            return response()->json([
                'data' => $user,
            ]);
        }

        return Inertia::render('Admin/User/Show', [
            'user' => $user,
        ]);
    }

    /**
     * 5. Editar usuario. 
     */
    public function edit_DEPRECATED(User $user, $company_id = false, $profile = false){
        $ctx = app(CompanyContext::class);
        $currentCompanyId = (int) $ctx->id();

        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));

        $slug = 'users';

        //Perfil propio:
        $profile = $user->id == Auth::id()? true:false;

        //Formateo de datos:
        $user->formatted_created_at = Carbon::parse($user->created_at)->format($locale[4].' H:i:s');
        $user->formatted_updated_at = Carbon::parse($user->updated_at)->format($locale[4].' H:i:s');

        $roles = $this->roleOptions(true);

        //User roles:
        $user_roles = $user->roles;

        //Imágenes:
        $images = UserImage::select('id', 'image', 'featured', 'public')
        ->where('user_id', $user->id)
        ->get();

        //Comprobamos vínculo del usuario, si pertenece a la empresa o a cliente o proveedor:
        // Obtener company_ids distintos de la compañía en session + datos de empresa y pivot.id
        $relations = UserCompany::query()
        ->where('user_id', $user->id)
        ->where('company_id', '!=', $currentCompanyId)
        ->with('company') // asume relación userCompany->company
        ->get(['id', 'company_id', 'position', 'department']); // id = pivot id user_companies

        $otherCompanyIds = $relations->pluck('company_id')->unique()->values()->all();

        // Mapa company_id => tipo relación
        $relationMap = [];
        // Mapa company_id => id de la relación (customer_providers.id o crm_accounts.id)
        $relationIdMap = [];

        // 1) Cliente / proveedor
        if (!empty($otherCompanyIds)) {
            $cpRecords = CustomerProvider::where(function($q) use ($companyId, $otherCompanyIds) {
                    $q->where('provider_id', $companyId)
                      ->whereIn('customer_id', $otherCompanyIds);
                })
                ->orWhere(function($q) use ($companyId, $otherCompanyIds) {
                    $q->where('customer_id', $companyId)
                      ->whereIn('provider_id', $otherCompanyIds);
                })
                ->get();

            foreach ($cpRecords as $cp) {
                if ($cp->provider_id == $companyId) {
                    // la otra empresa es cliente
                    $relationMap[$cp->customer_id]   = 'customer';
                    $relationIdMap[$cp->customer_id] = $cp->id;
                } elseif ($cp->customer_id == $companyId) {
                    // la otra empresa es proveedor
                    $relationMap[$cp->provider_id]   = 'provider';
                    $relationIdMap[$cp->provider_id] = $cp->id;
                }
            }

            // 2) CRM (solo si no hay ya relación cliente/proveedor)
            $crmRecords = CrmAccount::query()
                ->where('company_id', $companyId)      // empresa en sesión
                ->whereIn('linked_company_id', $otherCompanyIds)     // empresas del usuario
                ->get();

            foreach ($crmRecords as $crm) {
                if (!isset($relationMap[$crm->linked_company_id])) {
                    $relationMap[$crm->linked_company_id]   = 'crm_account';
                    $relationIdMap[$crm->linked_company_id] = $crm->id;   // 👈 aquí está la clave
                }
            }
        }

        // 3) Montamos lo que mandas a la vista
        $relatedCompanies = $relations->map(function($uc) use ($relationMap, $relationIdMap) {
            $company = $uc->company; // eager loaded
            if (!$company) return null;

            return [
                'id'           => $company->id,              // company_id
                'name'         => $company->name,
                'pivot_id'     => $uc->id,                  // id de user_companies
                'relation'     => $relationMap[$company->id]    ?? null, // 'customer' | 'provider' | 'crm_account'
                'relation_id'  => $relationIdMap[$company->id]  ?? null, // id de customer_providers o crm_accounts
                'position'     => $uc->position,
                'department'   => $uc->department
            ];
        })->filter()->values()->all();

        if(!empty($relationIdMap)){
            $slug = 'contacts';
        }

        //Tratamientos:
        $salutations = HasSalutation::comboOptions();

        //Tipos de contacto:
        $contact_types = $slug == 'contacts'? HasContactTypes::comboOptions():false;

        //Contacto CRM:
        $crm_contact = $slug == 'contacts'? CrmContact::where('company_id', $companyId)->where('user_id', $user->id)->first():false;

        return Inertia::render('Admin/User/Edit', [
            "title" => __($this->option),
            "subtitle" => __('usuario_editar'),
            "module" => $this->module,
            "slug" => $slug,
            "user" => $user,
            "roles" => $roles,
            "user_roles" => $user->roles,
            "images" => $images,
            "relatedCompanies" => $relatedCompanies,
            "salutations" => $salutations,
            "contact_types" => $contact_types,
            "crm_contact" => $crm_contact,
            "profile" => $profile,      //Edición usuario en session.
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions
        ]);    
    }

    public function edit(User $user, $profile = false)
    {
        $ctx = app(CompanyContext::class);
        $currentCompanyId = (int) $ctx->id();

        // Locale / formatos de fecha
        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));

        // Perfil propio:
        $profile = $user->id == Auth::id();

        // Empresa en sesión como contexto base
        $company = Company::select('id', 'name')->findOrFail($currentCompanyId);

        // 1) Timestamps bonitos
        $user->formatted_created_at = Carbon::parse($user->created_at)
            ->format($locale[4] . ' H:i:s');
        $user->formatted_updated_at = Carbon::parse($user->updated_at)
            ->format($locale[4] . ' H:i:s');

        /**
         * 2) Resolver relaciones con la empresa en sesión
         */

        // Pivot del usuario con la empresa en sesión (compañero de empresa)
        $pivot = UserCompany::query()
            ->where('user_id', $user->id)
            ->where('company_id', $currentCompanyId)
            ->first(['id', 'company_id', 'position', 'department']);

        // Contacto CRM del usuario respecto a la empresa en sesión
        $crm_contact = CrmContact::where('company_id', $currentCompanyId)
            ->where('user_id', $user->id)
            ->first();

        // Cuenta CRM a la que pertenece el contacto (solo si tiene crm_account_id)
        $crm_account = null;
        if ($crm_contact?->crm_account_id) {
            $crm_account = CrmAccount::select('id', 'name')
                ->find($crm_contact->crm_account_id);
        }

        // slug: si existe contacto CRM, estamos en contexto "contacts"
        $slug = $crm_contact ? 'contacts' : 'users';

        // Contexto ligero para el front
        $companyContext = (object) [
            'type'            => $crm_contact ? 'contact' : 'company',
            'crm_id'          => null,
            'ref_id'          => (int) $company->id,
            'name'            => $company->name,
            'company_id_real' => (int) $company->id,
        ];

        /**
         * 3) Todas las relaciones del usuario con empresas
         *    (para poder mostrar, si quieres, todas las empresas vinculadas a esta persona)
         */
        $user_companies = UserCompany::query()
            ->with(['company:id,name,tradename'])
            ->where('user_id', $user->id)
            ->orderBy('company_id')
            ->get();

        /**
         * 4) Datos auxiliares
         */

        // Roles
        $roles = $this->roleOptions(true);

        // Imágenes
        $images = UserImage::select('id', 'image', 'featured', 'public')
            ->where('user_id', $user->id)
            ->get();

        // Tratamientos y tipos de contacto
        $salutations   = HasSalutation::comboOptions();
        $contact_types = $slug === 'contacts' ? HasContactTypes::comboOptions() : [];

        // Subtipos de contacto (categorías de módulo users para la empresa en sesión)
        $contact_subtypes = Category::where('company_id', $currentCompanyId)
            ->where('module', 'users')
            ->where('status', 1)
            ->where('depth', '0')
            ->orderBy('name', 'ASC')
            ->get();

        // Subtipo al que pertenece el usuario
        $contact_subtype_id = Categorizable::select('category_id')
            ->where('company_id', $currentCompanyId)
            ->where('categorizable_type', User::class)
            ->where('categorizable_id', $user->id)
            ->first();

        // Países
        $countries = Country::where('status', 1)
            ->orderBy('name', 'ASC')
            ->get();

        // Direcciones del usuario (con relaciones)
        $user->load([
            'addresses.town.province.country',
        ]);

        // Centros de coste:
        $cost_centers = CostCenter::select('id', 'name', 'code')
        ->where('company_id', $currentCompanyId)
        ->where('status', 1)
        ->orderBy('name', 'ASC')
        ->get();

        // Centros de coste del usuario vinculados con la empresa actual:
        $user_cost_centers = UserCostCenter::select('cost_center_id')
        ->where('user_id', $user->id)
        ->where('company_id', $currentCompanyId)
        ->pluck('cost_center_id')
        ->toArray();

        //Tipos de negocio:
        $business_types = HasBusinessTypes::comboOptions();

        return \Inertia\Inertia::render('Admin/User/Edit', [
            'title'                 => __($this->option),
            'subtitle'              => $crm_contact? __('contacto_editar'):__('usuario_editar'),
            'module'                => $this->module,
            'slug'                  => $slug,

            'user'                  => $user,
            'roles'                 => $roles,
            'user_roles'            => $user->roles,
            'images'                => $images,
            'salutations'           => $salutations,
            'contact_types'         => $contact_types,
            'contact_subtypes'      => $contact_subtypes,
            'contact_subtype_id'    => $contact_subtype_id,
            'cost_centers'          => $cost_centers,
            'user_cost_centers'     => $user_cost_centers,
            'business_types'        => $business_types,
            'crm_contact'           => $crm_contact,
            'crm_account'           => $crm_account,
            'addresses'             => $user->addresses,
            'countries'             => $countries,
            'profile'               => $profile,
            'availableLocales'      => LocaleTrait::availableLocales(),
            'permissions'           => $this->permissions,

            // Contexto respecto a la empresa en sesión
            'company'          => $company,
            'company_context'  => $companyContext,

            // Vínculo con la empresa en sesión (puede ser null)
            'pivot'            => $pivot,

            // Todas las relaciones user ↔ companies
            'user_companies'   => $user_companies,
        ]);
    }

    /**
     * 5.1. Editar usuario en session.
     */
    public function editProfile(){
        return redirect()->route('users.edit', [auth()->user()->id, true]);
    }

    /**
     * 6. Actualizar usuario.
     */
    public function update(UserUpdateRequest $request, User $user)
    {
        // $validated por si en algún momento quieres usarlo
        $validated = $request->validated();

        $ctx = app(CompanyContext::class);
        $currentCompanyId = (int) $ctx->id();

        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));

        // 1) Fechas
        $rawBirthday = Str::of((string) $request->birthday)->trim('"');

        $birthday = $rawBirthday->isNotEmpty()
            ? ($locale[0] !== 'en'
                ? $this->convertDate($rawBirthday, false)
                : $rawBirthday)
            : null;

        // 2) Datos básicos de usuario
        $user->name          = $request->name;
        $user->surname       = $request->surname;
        $user->salutation    = $request->salutation;
        $user->email         = $request->email;
        $user->sex           = $request->sex;
        $user->birthday      = $birthday;
        $user->nif           = $request->nif;
        $user->accept_emails = $request->boolean('accept_emails'); 

        // Firma
        $filename = User::saveUserSignature($request);
        if ($filename) {
            $user->signature = $filename;
        }

        $user->save();

        //Desvinculación de listas de marketing:
        if(!$user->accept_emails){
            MarketingListUser::where('user_id', $user->id)
            ->delete();
        }

        // 3) Relación CRM con la empresa en sesión (crm_contacts)
        //    contact_type es propiedad de (empresa_en_sesión, user)
        if ($request->filled('contact_type') || $request->input('business_type')) {
            $crmContact = CrmContact::firstOrNew([
                'company_id' => $currentCompanyId,
                'user_id'    => $user->id,
            ]);

            $crmContact->contact_type = $request->input('contact_type');
            $crmContact->business_type = $request->input('business_type');

            // si quieres guardar observaciones más adelante, aquí
            // $crmContact->observations = $request->input('observations', $crmContact->observations);

            $crmContact->save();
        }

        // 4) Subtipo de contacto (categories via Categorizable)
        if ($request->filled('contact_subtype')) {
            DB::transaction(function () use ($currentCompanyId, $user, $request) {
                Categorizable::where('company_id', $currentCompanyId)
                    ->where('categorizable_type', 'App\\Models\\User')
                    ->where('categorizable_id', $user->id)
                    ->delete();

                Categorizable::create([
                    'company_id'        => $currentCompanyId,
                    'category_id'       => $request->contact_subtype,
                    'categorizable_type'=> 'App\\Models\\User',
                    'categorizable_id'  => $user->id,
                ]);
            });
        } else {
            // si no se manda subtipo, limpiamos cualquiera previo
            Categorizable::where('company_id', $currentCompanyId)
                ->where('categorizable_type', 'App\\Models\\User')
                ->where('categorizable_id', $user->id)
                ->delete();
        }

        // 5) Posición / Departamento por empresa (user_companies)
        //    Campos esperados: position_company_{company_id}, department_company_{company_id}
        foreach ($request->all() as $key => $value) {
            if (!Str::startsWith($key, 'position_company_')) {
                continue;
            }

            $companyId = (int) Str::after($key, 'position_company_');
            if ($companyId <= 0) {
                continue;
            }

            $position        = $value;
            $departmentKey   = 'department_company_' . $companyId;
            $departmentValue = $request->input($departmentKey);

            // Si no hay ni cargo ni departamento, puedes decidir si borrar el vínculo o sólo limpiar campos.
            // De momento, actualizamos/creamos el pivot con esos datos (pueden ir vacíos).
            $relation = UserCompany::firstOrNew([
                'user_id'    => $user->id,
                'company_id' => $companyId,
            ]);

            $relation->position   = $position ?: null;
            $relation->department = $departmentValue ?: null;
            $relation->save();
        }

        // 6) Centros de coste vinculados al usuario (user_cost_centers)
        // Esperamos recibir `cost_centers` como array (incluso vacío) desde el frontend.
        if ($request->has('cost_centers')) {
            $selected = (array) $request->input('cost_centers', []);
            $ids = array_filter(array_map('intval', $selected));

            DB::transaction(function () use ($user, $currentCompanyId, $ids) {
                // Eliminamos vinculaciones previas para esta empresa
                UserCostCenter::where('user_id', $user->id)
                    ->where('company_id', $currentCompanyId)
                    ->delete();

                // Creamos las nuevas vinculaciones
                foreach ($ids as $ccId) {
                    if ($ccId <= 0) continue;
                    UserCostCenter::create([
                        'user_id' => $user->id,
                        'cost_center_id' => $ccId,
                        'company_id' => $currentCompanyId,
                    ]);
                }
            });
        }
        // 6) Redirección: siempre al edit del usuario, el contexto ya lo pone CompanyContext
        return redirect()
            ->route('users.edit', $user)
            ->with('msg', __('usuario_actualizado_msg'));
    }

    /**
     * 7. Eliminar usuario.
     * Si el usuario es contacto CRM, se eliminan también sus registros en crm_contacts (users y crm_contacts).
     */
    public function destroy(User $user)
    {
        // Eliminar contactos CRM asociados a este usuario (tabla crm_contacts)
        CrmContact::where('user_id', $user->id)->delete();

        $user->delete();

        // Redirigir a la vista anterior (p. ej. índice de contactos CRM o de usuarios)
        return redirect()->back()->with('msg', __('usuario_eliminado'));
    }

    /**
     * 8. Actualizar estado.
     */
    public function status(Request $request){
        $user = User::find($request->id);

        if (!$user) {
            return response()->json(['error' => __('usuario_no_encontrado')], 404);
        }

        $user->status = !$user->status;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => __('estado_actualizado_ok'),
            'new_status' => $user->status
        ]);
    }

    /**
     * 9. Opciones de roles para nuevo usuario.
     */
    public function roleOptions($is_array = false){
        if(auth()->user()->hasRole(config('constants.SUPER_ADMIN_'))){
            $roles = Role::whereNull('company_id')
            ->orWhere('company_id', session('currentCompany'))
            ->orderBy('id', 'ASC')
            ->get();

        //Revisar los casos para obtener sólo los roles pertinentes para cada usuario.
        }else{
            $roles = Role::where('company_id', session('currentCompany'))
            ->orderBy('id', 'ASC')
            ->get();
        }

        //Conversión a array:
        if($is_array){
            //Mapeamos para obtener sólo el string, sin el company_id que lo precede
            $roles = $roles->mapWithKeys(function ($role) {
                $nameParts = explode('/', $role->name);
                return [$role->id => $nameParts[1] ?? $role->name];
            })->toArray();
        }

        return $roles;
    }

    /**
     * 10. Eliminar firma.
     */
    public function deleteSignature(User $user){
        //Sólo el propio usuario puede eliminar su firma:
        if($user->id != auth()->user()->id){
            return redirect()->back()->with('alert', __('permiso_carente_aviso'));
            exit;
        }

        if ($user->signature && Storage::disk('public')->exists('signatures/' . $user->signature)){
            Storage::disk('public')->delete('signatures/' . $user->signature);
        }

        $user->signature = null;
        $user->save();

        return redirect()->back()->with('msg', __('firma_eliminada'));
    }

    /**
     * 11. Actualizar password.
     */
    public function updatePwd(UserUpdatePwdRequest $request, User $user){
        try{
            $validated = $request->validated();

            $user->password = bcrypt($request->input('password'));
            $user->save();

            return redirect()->route('users.edit', $user)
            ->with('msg', __('usuario_pwd_actualizado_msg'));

        }catch(\Throwable $e){
            Log::error('Error en update(): ' . $e->getMessage());
            abort(500, 'Error interno del servidor');
        }     
    }

    /**
     * 12. Listado de contactos.
     */
    public function contacts(UserFilterRequest $request){
        $perPage = $request->input('per_page', config('constants.RECORDS_PER_PAGE_DEFAULT_'));

        $company_id = session('currentCompany');
        $request->merge(['company_id' => $company_id]);

        $contacts = $this->contactsDataQuery($request)
            ->paginate($perPage)
            ->onEachSide(1);

        $contact_types = HasContactTypes::typesMap();

        return Inertia::render('Admin/User/Contacts', [
            "title" => __($this->option),
            "subtitle" => __('contactos_cli_pro'),
            "module" => $this->module,
            "slug" => 'contacts',
            "contacts" => UserResource::collection($contacts),
            "contact_types" => $contact_types,

            // 👇 lo mismo que en index:
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
                ['tblContacts']
            )
        ]);
    }

    /**
     * 12.1. Contactos para exportación.
     */
    public function contactsFilteredData(UserFilterRequest $request)
    {
        $company_id = $request->input('company_id', session('currentCompany'));

        $cacheKey = 'filtered_contacts_' . $company_id . '_' . md5(json_encode($request->all()));

        // Aseguramos que company_id esté en el request
        $request->merge(['company_id' => $company_id]);

        $users = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($request) {
            return $this->contactsDataQuery($request)->get();
        });

        return response()->json([
            'users' => UserResource::collection($users),
        ]);
    }

    /**
     * 12.2. Data Query contactos.
     */
    private function contactsDataQuery_DEPRECATED(UserFilterRequest $request): Builder
    {
        $company_id = (int) $request->input('company_id', session('currentCompany'));

        // 1) Empresas relacionadas vía customer_providers (clientes/proveedores)
        $relatedCompanyIds = CustomerProvider::query()
            ->where(function ($q) use ($company_id) {
                $q->where('customer_id', $company_id)
                  ->orWhere('provider_id', $company_id);
            })
            ->get()
            ->flatMap(fn ($cp) => [$cp->customer_id, $cp->provider_id])
            ->filter(fn ($id) => !is_null($id) && $id != $company_id)
            ->unique()
            ->values()
            ->all();

        // 2) Users vinculados a empresas distintas de la de sesión (clientes/proveedores)
        $userIdsFromCompanies = DB::table('user_companies')
            ->where('company_id', '!=', $company_id)
            ->when(!empty($relatedCompanyIds), function ($q) use ($relatedCompanyIds) {
                $q->orWhereIn('company_id', $relatedCompanyIds);
            })
            ->pluck('user_id');

        // 3) Users vinculados por crm_contacts a la empresa en sesión
        // 20/11/2025: Omitimos los contactos CRM y dejamos sólo de empresa, clientes y proveedores:
        $userIdsFromCrm = collect(); // mejor colección vacía que array

        // 4) Unión
        $userIds = $userIdsFromCompanies
            ->merge($userIdsFromCrm)
            ->unique()
            ->filter()
            ->values();

        if ($userIds->isEmpty()) {
            return User::query()->whereRaw('1 = 0');
        }

        // 5) Query base con joins y campos extra
        $query = User::query()
        ->from('users')
        // empresa distinta de la de sesión (para position)
        ->leftJoin('user_companies as uc', function ($j) use ($company_id) {
            $j->on('uc.user_id', '=', 'users.id')
              ->where('uc.company_id', '!=', $company_id);
        })
        // JOIN A COMPANIES PARA NOMBRE
        ->leftJoin('companies as c', 'c.id', '=', 'uc.company_id')
        // cuenta CRM vinculada (para edit_crm_account_id)
        ->leftJoin('crm_accounts as ca', function ($j) use ($company_id) {
            $j->on('ca.linked_company_id', '=', 'uc.company_id')
              ->where('ca.company_id', '=', $company_id);
        })
        // contactos CRM para la empresa en sesión (para contact_type)
        ->leftJoin('crm_contacts as cc', function ($j) use ($company_id) {
            $j->on('cc.user_id', '=', 'users.id')
              ->where('cc.company_id', '=', $company_id);
        })
        ->with(['avatar', 'phones'])
        ->whereIn('users.id', $userIds)
        ->select([
            'users.id',
            'users.name',
            'users.surname',
            'users.email',
            'users.status',

            DB::raw('MIN(uc.company_id)   as edit_company_id'),
            DB::raw('MIN(ca.id)           as edit_crm_account_id'),
            DB::raw('MIN(uc.position)     as position'),
            DB::raw('MAX(cc.contact_type) as contact_type'),
            DB::raw('MIN(c.name)          as company_name'),   
        ])
        ->groupBy(
            'users.id',
            'users.name',
            'users.surname',
            'users.email',
            'users.status',
        );

        // 6) Filtros
        $filters = [
            'name' => function ($q, $v) {
                $q->where(function ($sub) use ($v) {
                    $sub->where('users.name', 'like', "%$v%")
                        ->orWhere('users.surname', 'like', "%$v%");
                });
            },
            'email' => fn ($q, $v) => $q->where('users.email', 'like', "%$v%"),
            'phones' => function ($q, $v) {
                $v = trim((string) $v);
                if ($v === '') {
                    return;
                }
                $like = '%' . str_replace(['%', '_', '\\'], ['\\%', '\\_', '\\\\'], $v) . '%';
                $q->whereHas('phones', fn ($sub) => $sub->where('e164', 'like', $like));
            },
            'categories' => function ($q, $v) use ($company_id) {
                $q->whereHas('categories', function ($sub) use ($company_id, $v) {
                    if ($company_id !== 'all') {
                        $sub->where('categories.company_id', $company_id);
                    }
                    $sub->where('categories.module', 'users')
                        ->where('categories.name', 'like', "%$v%");
                });
            },
            'position' => fn ($q, $v) => $q->where('uc.position', 'like', "%{$v}%"),
            'contact_type' => fn ($q, $v) => $q->where('cc.contact_type', $v),
            'companies' => fn ($q, $v) => $q->where('c.name', 'like', "%{$v}%")
        ];

        foreach ($filters as $key => $callback) {
            if ($request->filled($key)) {
                $callback($query, $request->input($key));
            }
        }

        // 7) Rango de fechas
        $from = $request->input('date_from');
        $to   = $request->input('date_to');

        if ($from && $to) {
            $query->whereBetween('users.created_at', ["$from 00:00:00", "$to 23:59:59"]);
        } elseif ($from) {
            $query->where('users.created_at', '>=', "$from 00:00:00");
        } elseif ($to) {
            $query->where('users.created_at', '<=', "$to 23:59:59");
        }

        //Filtros avanzados:
        $query->applyAdhocFilters($request, $this->adHocFilterDefinitions($company_id));

        // 8) Orden
        $sortField     = $request->input('sort_field', 'name');
        $sortDirection = $request->input('sort_direction', 'ASC');
        $allowedSortFields = ['name', 'surname', 'email'];

        if (!in_array($sortField, $allowedSortFields, true)) {
            $sortField = 'name';
        }

        return $query->orderBy("users.$sortField", $sortDirection);
    }

    private function contactsDataQuery(UserFilterRequest $request): Builder
    {
        $company_id = (int) $request->input('company_id', session('currentCompany'));

        // 1) Empresas relacionadas (clientes/proveedores), solo el "otro lado"
        $relatedCompanyIds = CustomerProvider::query()
            ->where('customer_id', $company_id)
            ->pluck('provider_id')
            ->merge(
                CustomerProvider::query()
                    ->where('provider_id', $company_id)
                    ->pluck('customer_id')
            )
            ->filter(fn ($id) => !is_null($id) && (int)$id !== $company_id)
            ->unique()
            ->values()
            ->all();

        if (empty($relatedCompanyIds)) {
            return User::query()->whereRaw('1 = 0');
        }

        // 2) Query base: SOLO users vinculados a esas empresas
        $query = User::query()
            ->from('users')
            ->join('user_companies as uc', function ($j) use ($relatedCompanyIds) {
                $j->on('uc.user_id', '=', 'users.id')
                  ->whereIn('uc.company_id', $relatedCompanyIds);
            })
            ->join('companies as c', 'c.id', '=', 'uc.company_id')
            ->leftJoin('crm_accounts as ca', function ($j) use ($company_id) {
                $j->on('ca.linked_company_id', '=', 'uc.company_id')
                  ->where('ca.company_id', '=', $company_id);
            })
            ->leftJoin('crm_contacts as cc', function ($j) use ($company_id) {
                $j->on('cc.user_id', '=', 'users.id')
                  ->where('cc.company_id', '=', $company_id);
            })
            ->with(['avatar', 'phones'])
            ->select([
                'users.id',
                'users.name',
                'users.surname',
                'users.email',
                'users.status',
                'users.created_at', // para que la columna created_at tenga sentido

                DB::raw('MIN(uc.company_id)   as edit_company_id'),
                DB::raw('MIN(ca.id)           as edit_crm_account_id'),
                DB::raw('MIN(uc.position)     as position'),
                DB::raw('MAX(cc.contact_type) as contact_type'),
                DB::raw('MIN(c.name)          as company_name'),
            ])
            ->groupBy('users.id', 'users.name', 'users.surname', 'users.email', 'users.status', 'users.created_at');

        // 3) Filtros “cabecera” (los de tu FilterRow)
        $filters = [
            'name' => function ($q, $v) {
                $q->where(function ($sub) use ($v) {
                    $sub->where('users.name', 'like', "%$v%")
                        ->orWhere('users.surname', 'like', "%$v%");
                });
            },
            'email' => fn ($q, $v) => $q->where('users.email', 'like', "%$v%"),
            'phones' => function ($q, $v) {
                $v = trim((string) $v);
                if ($v === '') {
                    return;
                }
                $like = '%' . str_replace(['%', '_', '\\'], ['\\%', '\\_', '\\\\'], $v) . '%';
                $q->whereHas('phones', fn ($sub) => $sub->where('e164', 'like', $like));
            },
            'categories' => function ($q, $v) use ($company_id) {
                $q->whereHas('categories', function ($sub) use ($company_id, $v) {
                    $sub->where('categories.company_id', $company_id)
                        ->where('categories.module', 'users')
                        ->where('categories.name', 'like', "%$v%");
                });
            },
            'position' => fn ($q, $v) => $q->where('uc.position', 'like', "%{$v}%"),
            'contact_type' => fn ($q, $v) => $q->where('cc.contact_type', $v),
            'companies' => fn ($q, $v) => $q->where('c.name', 'like', "%{$v}%"),
        ];

        foreach ($filters as $key => $callback) {
            if ($request->filled($key)) {
                $callback($query, $request->input($key));
            }
        }

        // 4) Rango fechas (created_at)
        $from = $request->input('date_from');
        $to   = $request->input('date_to');

        if ($from && $to) {
            $query->whereBetween('users.created_at', ["$from 00:00:00", "$to 23:59:59"]);
        } elseif ($from) {
            $query->where('users.created_at', '>=', "$from 00:00:00");
        } elseif ($to) {
            $query->where('users.created_at', '<=', "$to 23:59:59");
        }

        // 5) Filtros avanzados
        $query->applyAdhocFilters($request, $this->adHocFilterDefinitions($company_id));

        // 6) Orden (y añade created_at si tu UI lo permite)
        $sortField     = $request->input('sort_field', 'name');
        $sortDirection = strtoupper($request->input('sort_direction', 'ASC')) === 'DESC' ? 'DESC' : 'ASC';
        $allowedSortFields = ['name', 'surname', 'email', 'created_at'];

        if (!in_array($sortField, $allowedSortFields, true)) {
            $sortField = 'name';
        }

        return $query->orderBy("users.$sortField", $sortDirection);
    }

    /**
     * 13. Usuarios por categorías.
     */
    public function categories(){
        return Inertia::render('Admin/User/Categories', [
            "title" => __($this->option),
            "subtitle" => __('usuarios_x_categoria'),
            "module" => $this->module,
            "slug" => 'categories',
            "queryParams" => request()->query() ?: null,
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions
        ]);        
    }

    /**
     * 13.1. Búsqueda de usuarios por categorías.
     */
    public function usersByCategorySearch(Request $request)
    {
        $ctx = app(CompanyContext::class);
        $currentCompanyId = (int) $ctx->id();

        $request->validate([
            'category_id' => ['required','integer','min:1'],
            'q'           => ['nullable','string','max:150'],
            // por si más tarde quieres cambiar el scope
            'environment' => ['nullable','in:users'],
        ]);

        $companyId = $currentCompanyId;

        // Categoría (módulo 'users')
        $category = Category::where('company_id', $companyId)
            ->where('module', 'users')
            ->orderBy('name', 'ASC')
            ->findOrFail($request->integer('category_id'));

        // IDs de la categoría seleccionada + descendientes
        $prefix = $category->path;
        $descendantIds = Category::where('company_id', $companyId)
            ->where('module', 'users')
            ->where(function ($q) use ($prefix) {
                $q->where('path', $prefix)->orWhere('path', 'like', $prefix.'/%');
            })
            ->orderBy('name', 'ASC')
            ->pluck('id')
            ->all();

        $q = trim((string) $request->get('q', ''));

        // 1) USUARIOS (categorizados como 'users')
        $userRows = User::query()
            ->from('users')
            ->select([
                'users.id',
                'users.name',
                'users.surname',
                'users.email',
                DB::raw('MIN(uc.company_id) as any_company_id') // por si quieres mostrar algo
            ])
            ->join('categorizables as cz', function ($j) {
                $j->on('cz.categorizable_id', '=', 'users.id')
                  ->where('cz.categorizable_type', User::class);
            })
            // vinculaciones posibles del usuario (puede tener varias)
            ->leftJoin('user_companies as uc', 'uc.user_id', '=', 'users.id')
            ->where('cz.company_id', $companyId)
            ->whereIn('cz.category_id', $descendantIds)
            ->when($q !== '', function ($qq) use ($q) {
                $qq->where(function ($w) use ($q) {
                    $w->where('users.name', 'like', "%{$q}%")
                      ->orWhere('users.surname', 'like', "%{$q}%")
                      ->orWhere('users.email', 'like', "%{$q}%");
                });
            })
            ->groupBy('users.id','users.name','users.surname','users.email')
            ->orderBy('users.name')
            ->get()
            ->map(function ($u) {
                return [
                    'id'    => (int) $u->id,
                    'type'  => 'user',
                    'name'  => trim(($u->name ?? '').' '.($u->surname ?? '')),
                    'email' => (string) ($u->email ?? ''),
                    // edición genérica de usuario (sin contexto CRM)
                    'url'   => route('users.edit', [$u->id]),
                ];
            })
            ->all();

        // 2) CONTACTOS CRM de la empresa en sesión, pero categorizados como 'users'
        //    Calculamos linked_company_id con user_companies + crm_accounts
        $crmContactRows = User::query()
            ->from('users')
            ->select([
                'users.id',
                'users.name',
                'users.surname',
                'users.email',
                DB::raw('MIN(uc.company_id) as linked_company_id'),
                DB::raw('MIN(ca.id) as crm_account_id')
            ])
            // categorías del usuario (module=users)
            ->join('categorizables as cz', function ($j) {
                $j->on('cz.categorizable_id', '=', 'users.id')
                  ->where('cz.categorizable_type', User::class);
            })
            // contactos CRM de la empresa en sesión
            ->join('crm_contacts as cc', function ($j) use ($companyId) {
                $j->on('cc.user_id', '=', 'users.id')
                  ->where('cc.company_id', '=', $companyId);
            })
            // empresa vinculada del usuario (distinta de la empresa en sesión)
            ->leftJoin('user_companies as uc', function ($j) use ($companyId) {
                $j->on('uc.user_id', '=', 'users.id')
                  ->where('uc.company_id', '!=', $companyId);
            })
            // mapeo a crm_accounts: session company + linked_company_id
            ->leftJoin('crm_accounts as ca', function ($j) use ($companyId) {
                $j->on('ca.linked_company_id', '=', 'uc.company_id')
                  ->where('ca.company_id', '=', $companyId);
            })
            ->where('cz.company_id', $companyId)
            ->whereIn('cz.category_id', $descendantIds)
            ->when($q !== '', function ($qq) use ($q) {
                $qq->where(function ($w) use ($q) {
                    $w->where('users.name', 'like', "%{$q}%")
                      ->orWhere('users.surname', 'like', "%{$q}%")
                      ->orWhere('users.email', 'like', "%{$q}%");
                });
            })
            ->groupBy('users.id','users.name','users.surname','users.email')
            ->orderBy('users.name')
            ->get()
            ->map(function ($u) {
                $linked = $u->linked_company_id ? (int) $u->linked_company_id : null;
                return [
                    'id'    => (int) $u->id,
                    'type'  => 'crm_contact',
                    'name'  => trim(($u->name ?? '').' '.($u->surname ?? '')),
                    'email' => (string) ($u->email ?? ''),
                    'linked_company_id' => $linked,
                    'crm_account_id'    => $u->crm_account_id ? (int) $u->crm_account_id : null,
                    // edición de usuario en contexto CRM:
                    // pasamos linked_company_id como 2º parámetro tal y como has estandarizado
                    'url'   => $linked ? route('users.edit', [$u->id, $linked]) : route('users.edit', [$u->id]),
                ];
            })
            ->all();

        return response()->json([
            'category' => [
                'id'   => (int) $category->id,
                'name' => (string) $category->name,
                'path' => (string) $category->path,
            ],
            'users'         => $userRows,
            'crm_contacts'  => $crmContactRows,
            'total'         => count($userRows) + count($crmContactRows),
        ]);
    }

    /**
     * 14. Buscador de usuarios.
     */
    public function search(Request $request)
    {
        $ctx = app(CompanyContext::class);
        $currentCompanyId = (int) $ctx->id();

        $request->validate([
            'q'            => ['nullable', 'string', 'max:150'],
            'limit'        => ['nullable', 'integer', 'min:1', 'max:50'],
            'for_crm_link' => ['nullable', 'boolean'],
        ]);

        $q           = trim((string) $request->input('q', ''));
        $limit      = (int) $request->input('limit', 10);
        $forCrmLink = $request->boolean('for_crm_link');

        $words = $q === '' ? [] : array_filter(preg_split('/\s+/u', $q, -1, PREG_SPLIT_NO_EMPTY));

        $users = User::query()
            ->select('users.id', 'users.name', 'users.surname', 'users.email')
            ->orderBy('users.name')
            ->when(!empty($words), function ($query) use ($words) {
                foreach ($words as $word) {
                    $pattern = '%' . str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $word) . '%';
                    $query->where(function ($sub) use ($pattern) {
                        $sub->where('name', 'like', $pattern)
                            ->orWhere('users.surname', 'like', $pattern)
                            ->orWhere('email', 'like', $pattern);
                    });
                }
            })
            ->when($currentCompanyId > 0 && !$forCrmLink, function ($query) use ($currentCompanyId) {
                $query->whereHas('companies', function ($c) use ($currentCompanyId) {
                    $c->where('companies.id', $currentCompanyId);
                });
            })
            ->limit($limit)
            ->get()
            ->map(function ($u) {
                return [
                    'id' => $u->id,
                    'name' => trim(($u->name ?? '').' '.($u->surname ?? '')),
                    'email' => $u->email,
                ];
            });

        return response()->json([
            'data' => $users,
        ]);
    }

}
