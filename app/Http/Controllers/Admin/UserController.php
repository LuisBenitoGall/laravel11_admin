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
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

//Concerns:
use App\Concerns\HasContactTypes;
use App\Concerns\HasSalutation;

//Models:
use App\Models\Categorizable;
use App\Models\Category;
use App\Models\Company;
use App\Models\Country;
use App\Models\CrmAccount;
use App\Models\CrmContact;
use App\Models\CustomerProvider;
use App\Models\Phone;
use App\Models\User;
use App\Models\UserAddress;
use App\Models\UserColumnPreference;
use App\Models\UserCompany;
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
            "queryParams" => request()->query() ?: null,
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
            $query->whereHas('companiesRelation', function ($q) use ($company_id) {
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
            'phones' => fn($q, $v) => $q->whereHas('phones', fn($sub) =>
                $sub->where('phone_number', 'like', "%$v%")
            ),
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

        // Ordenación
        $sortField = $request->input('sort_field', 'name');
        $sortDirection = $request->input('sort_direction', 'ASC');
        $allowedSortFields = ['name', 'surname', 'email'];

        if (!in_array($sortField, $allowedSortFields)) {
            $sortField = 'name';
        }

        return $query->orderBy($sortField, $sortDirection);
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
     */
    public function store(UserStoreRequest $request){
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

        if($request->side == 'customers'){
            return redirect()->route('customers.edit', [$companyId, 'users'])->with('msg', __('usuario_creado_msg'));    
        }elseif($request->side == 'providers'){
            return redirect()->route('providers.edit', [$companyId, 'users'])->with('msg', __('usuario_creado_msg'));
        }elseif($request->side == 'crm-accounts'){
            $account = CrmAccount::select('id')
            ->where('company_id', $companyId)
            ->where('linked_company_id', session('currentCompany'))
            ->first();

            if($account){
                return redirect()->route('crm-accounts.edit', [$account->id, 'users'])->with('msg', __('usuario_creado_msg'));     
            }else{
                return redirect()->route('users.contacts')->with('msg', __('usuario_creado_msg')); 
            }

        }else{
            return redirect()->route('users.edit', $user)->with('msg', __('usuario_creado_msg'));
        }
    }

    /**
     * 4. Mostrar usuario.
     */
    // public function show(Request $request, User $user){
    //     $user->load(['companiesRelation', 'phones', 'avatar']);
    //     $user->setRelation('companies', $user->companiesRelation);
    //     $user->unsetRelation('companiesRelation');

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

        // Cargamos relaciones básicas + categorías para el subtipo
        $user->load(['companiesRelation', 'phones', 'avatar', 'categories']);
        $user->setRelation('companies', $user->companiesRelation);
        $user->unsetRelation('companiesRelation');

        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));
        $dateFormat = $locale[4] ?? 'd/m/Y';

        $user->birthday_formatted = $user->birthday
            ? $user->birthday->format($dateFormat)
            : null;

        /*
         * 1) Tipo de contacto (crm_contacts.contact_type)
         *    Usamos la fila "principal" si existe (is_main = 1), y si no, la primera.
         */
        $crmContact = CrmContact::query()
            ->where('company_id', $companyId)
            ->where('user_id', $user->id)
            ->orderByDesc('is_main')   // primero el principal
            ->orderByDesc('id')        // fallback: el más reciente
            ->first();

        $contactTypeCode  = $crmContact?->contact_type;
        $contactTypeLabel = $contactTypeCode
            ? HasContactTypes::typesOf($contactTypeCode)
            : null;

        // Lo añadimos como atributos "virtuales"
        $user->contact_type_code  = $contactTypeCode;
        $user->contact_type_label = $contactTypeLabel;

        /*
         * 2) Subtipo de contacto (categoría del usuario)
         *    Usamos la primera categoría que aplique en esta empresa.
         *    Ajusta el where('categories.module', 'users') si tus subtipos viven en otro módulo.
         */
        $contactSubtypeCategory = $user->categories()
            ->when($companyId > 0, function ($q) use ($companyId) {
                $q->where('categories.company_id', $companyId);
            })
            ->where('categories.module', 'users')
            ->orderBy('categories.name')
            ->first();

        $user->contact_subtype_id    = $contactSubtypeCategory?->id;
        $user->contact_subtype_name  = $contactSubtypeCategory?->name;

        if ($request->expectsJson()) {
            return response()->json([
                'data' => $user,
            ]);
        }

        // Si algún día quieres una vista "show" completa de página
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

    public function edit(User $user, $company_id = null, $profile = false)
    {
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

        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));

        $company = false;
        //Perfil propio:
        $profile = $user->id == Auth::id()? true:false;

        // 1) Timestamps bonitos
        $user->formatted_created_at = Carbon::parse($user->created_at)->format($locale[4].' H:i:s');
        $user->formatted_updated_at = Carbon::parse($user->updated_at)->format($locale[4].' H:i:s');

        // 2) Resolver contexto de edición
        $companyContext = null;
        $slug = 'users';

        if ($company_id) {
            // Primero intentamos CRM
            $crm = CrmAccount::select('id','name','company_id','linked_company_id')
                ->where('linked_company_id', $company_id)
                ->where('company_id', $currentCompanyId)
                ->first();

            if ($crm) {
                // Contexto: CRM
                $companyContext = (object)[
                    'type'            => 'crm_account',
                    'crm_id'          => $crm->id,
                    'ref_id'          => (int) $crm->linked_company_id,               // <- lo que viaja en la URL y que devolverás como user_company_id
                    'name'            => $crm->name,
                    'company_id_real' => (int) $crm->linked_company_id, // <- pivot user_companies del usuario
                ];
                $slug = 'contacts';
            } else {
                // Si no es CRM, debe ser una company normal
                $company = Company::select('id','name')->findOrFail((int)$company_id);
                $companyContext = (object)[
                    'type'            => 'company',
                    'crm_id'          => false,
                    'ref_id'          => (int) $company->id,
                    'name'            => $company->name,
                    'company_id_real' => (int) $company->id,
                ];
                $slug = 'users';
            }
        } else {
            // Sin parámetro: usar empresa en sesión como contexto company
            $company = Company::select('id','name')->findOrFail($currentCompanyId);
            $companyContext = (object)[
                'type'            => 'company',
                'crm_id'          => false,
                'ref_id'          => (int) $company->id,
                'name'            => $company->name,
                'company_id_real' => (int) $company->id,
            ];
            $slug = 'users';
        }

        // 3) Validación mínima: el usuario debe tener vínculo con company_id_real
        $pivot = UserCompany::query()
            ->where('user_id', $user->id)
            ->where('company_id', $companyContext->company_id_real)
            ->first(['id','company_id','position','department']);

        // Si quieres bloquear cuando no hay vínculo:
        // if (!$pivot) { abort(403, __('usuario_no_vinculado_a_empresa')); }

        // 4) Datos auxiliares que ya tenías
        $roles = $this->roleOptions(true);
        $images = UserImage::select('id','image','featured','public')
            ->where('user_id', $user->id)->get();

        // Tratamientos y tipos
        $salutations = HasSalutation::comboOptions();
        $contact_types = $slug === 'contacts' ? HasContactTypes::comboOptions() : [];

        // CrmContact solo si el contexto es CRM y la cuenta pertenece a la empresa en sesión
        $crm_contact = false;
        if ($companyContext->type === 'crm_account') {
            $crm_contact = CrmContact::where('company_id', $currentCompanyId)
                ->where('user_id', $user->id)
                ->first();
        }

        // 5) Opcional: relatedCompanies para UI secundaria (no depende ya de la lógica principal)
        $relatedCompanies = []; // si aún lo necesitas, rellénalo aquí o elimina su uso en front

        //Direcciones del usuario:
        //$addresses = UserAddress::where('user_id', $user->id)->get();

        $countries = Country::where('status', 1)->orderBy('name', 'ASC')->get();

        $user->load([
            'addresses.town.province.country',
        ]);

        return \Inertia\Inertia::render('Admin/User/Edit', [
            'title'            => __($this->option),
            'subtitle'         => __('usuario_editar'),
            'module'           => $this->module,
            'slug'             => $slug,
            'user'             => $user,
            'roles'            => $roles,
            'user_roles'       => $user->roles,
            'images'           => $images,
            'salutations'      => $salutations,
            'contact_types'    => $contact_types,
            'crm_contact'      => $crm_contact,
            'addresses'        => $user->addresses,
            'countries'        => $countries,
            'profile'          => $profile,
            'availableLocales' => LocaleTrait::availableLocales(),
            'permissions'      => $this->permissions,

            // Contexto nuevo y limpio:
            'company'          => $company,
            'company_context'  => $companyContext,     // { type, ref_id, name, company_id_real }
            'pivot'            => $pivot,              // campos dependientes de empresa
            'user_company_id'  => $companyContext->ref_id, // <- ESTO es lo que el front debe devolver
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
    public function update(UserUpdateRequest $request, User $user){
        //dd($request->all());
        try{
            $validated = $request->validated();

            $locale = LocaleTrait::languages(session('locale', app()->getLocale()));

            //Tratamiento de fechas:
            //$rawStart = $request->birthday;
            $rawBirthday = Str::of($request->birthday)->trim('"');

            $birthday = $rawBirthday->isNotEmpty()
            ? ($locale[0] !== 'en'
            ? $this->convertDate($rawBirthday, false)
            : $rawBirthday): null;
        
            $user->name = $request->name;
            $user->surname = $request->surname;
            $user->salutation = $request->salutation;
            $user->email = $request->email;
            $user->sex = $request->sex;
            $user->birthday = $birthday;
            $user->nif = $request->nif;

            //Guardando firma:
            $filename = User::saveUserSignature($request);

            if($filename){
                $user->signature = $filename; 
            }

            $user->save();

            //Relación con empresa:
            if($request->user_company_id && ($request->position || $request->department)){
                $relation = UserCompany::where('user_id', $user->id)
                ->where('company_id', $request->user_company_id)
                ->first();

                if($relation){
                    $relation->position = $request->position;
                    $relation->department = $request->department;
                    $relation->save();
                }
                //dd($relation, $request->user_company_id, 'x');
            }

            //Tipo de contacto:
            if($request->user_company_id && $request->contact_type){
                $contact_type = CrmContact::select('crm_contacts.*')
                ->join('crm_accounts', 'crm_contacts.crm_account_id', '=', 'crm_accounts.id')
                ->where('crm_contacts.company_id', session('currentCompany'))
                ->where('crm_contacts.user_id', $user->id)
                ->where('crm_accounts.company_id', session('currentCompany'))
                ->where('crm_accounts.linked_company_id', $request->user_company_id)
                ->first();

                if($contact_type){
                    $contact_type->contact_type = $request->contact_type;
                    $contact_type->observations = $request->observations;
                    $contact_type->save();
                }
            }

            $return_company_id = $request->user_company_id? $request->user_company_id:session('currentCompany');

            if($request->user_company_id){
                return redirect()->route('users.edit', [$user, $request->user_company_id])
                ->with('msg', __('usuario_actualizado_msg'));
            }else{
                return redirect()->route('users.edit', $user)
                ->with('msg', __('usuario_actualizado_msg'));    
            }

        }catch(\Throwable $e){
            Log::error('Error en update(): ' . $e->getMessage());
            abort(500, 'Error interno del servidor');
        }       
    }

    /**
     * 7. Eliminar usuario.
     */
    public function destroy(User $user){
        $user->delete();

        //REVISAR TODAS LAS VINCULACIONES DEL USUARIO QUE DEBAN ELIMINARSE. POR EJEMPLO: FOTOS DEL USUARIO.

        return redirect()->route('users.index')->with('msg', __('usuario_eliminado'));
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
    public function contacts(Request $request){
        $perPage = $request->input('per_page', config('constants.RECORDS_PER_PAGE_DEFAULT_'));

        $company_id = session('currentCompany');

        $request->merge(['company_id' => $company_id]);

        $contacts = $this->contactsDataQuery($request)
        ->paginate($perPage)
        ->appends($request->all());

        $contact_types = HasContactTypes::typesMap();

        return Inertia::render('Admin/User/Contacts', [
            "title" => __($this->option),
            "subtitle" => __('contactos_cli_pro'),
            "module" => $this->module,
            "slug" => 'contacts',
            "contacts" => UserResource::collection($contacts),
            "contact_types" => $contact_types,
            "queryParams" => request()->query() ?: null,
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
    private function contactsDataQuery(Request $request): Builder
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
            DB::raw('MIN(c.name)          as company_name'),   // 👈 nombre de empresa
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
                $q->whereHas('phones', fn ($sub) => $sub->where('phone_number', 'like', "%$v%"));
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

        // 8) Orden
        $sortField     = $request->input('sort_field', 'name');
        $sortDirection = $request->input('sort_direction', 'ASC');
        $allowedSortFields = ['name', 'surname', 'email'];

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
        if ($currentCompanyId <= 0) {
            $url = route('companies.refresh-session');
            session(['intended_after_company' => request()->fullUrl()]);
            session()->flash('alert', __('empresa_no_activa'));
            if (request()->header('X-Inertia')) {
                return \Inertia\Inertia::location($url);
            }
            return redirect($url);
        }

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

        $request->validate([
            'q'     => ['nullable', 'string', 'max:150'],
            'limit' => ['nullable', 'integer', 'min:1', 'max:50'],
        ]);

        $q     = trim((string) $request->input('q', ''));
        $limit = (int) $request->input('limit', 10);

        $users = User::query()
            ->select('id', 'name', 'email')
            ->orderBy('name')
            ->when($q !== '', function ($query) use ($q) {
                $query->where(function ($sub) use ($q) {
                    $sub->where('name', 'like', "%{$q}%")
                        ->orWhere('email', 'like', "%{$q}%");
                });
            })
            // TODO: si tienes relación user<->company, filtra aquí:
            // ->whereHas('companies', fn ($c) => $c->where('companies.id', $companyId))
            ->limit($limit)
            ->get();

        return response()->json([
            'data' => $users,
        ]);
    }

}
