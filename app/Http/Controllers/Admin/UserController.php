<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

//Models:
use App\Models\Company;
use App\Models\User;
use App\Models\UserColumnPreference;
use App\Models\UserCompany;
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
                'users.update'
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
                auth()->user()->id,
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

        if(!$role){
            $alert = __('role_no_existe');
            return redirect()->route('users.create')->with(compact('alert'));
            exit;
        }

        $permissions = $role->permissions;

        $isAdmin = false;
        if($role->name == config('constants.SUPER_ADMIN_') || $permissions->count()){
            $isAdmin = true;
        }

        $status = $request->input('status')? 1:0;
        $random_password = Str::random(8);

        $user = new User();
        $user->name = $request->name;
        $user->surname = $request->surname;
        $user->email = $request->email;
        $user->password = bcrypt($random_password);
        $user->isAdmin = $isAdmin;
        $user->status = $status;
        $user->remember_token = $request->input('_token');
        $user->save();

        //Guardamos rol:
        $user->assignRole($role->name);

        //Vinculamos usuario a empresa:
        if($request->link_company){
            $uc = new UserCompany();
            $uc->user_id = $user->id;
            $uc->company_id = session('currentCompany');
            $uc->save();
        }

        //Envío de password:
        if($request->input('send_pwd')){
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

        return redirect()->route('users.edit', $user)->with('msg', __('usuario_creado_msg'));
    }

    /**
     * 4. Mostrar usuario.
     */
    public function show(User $user){

    }

    /**
     * 5. Editar usuario. 
     */
    public function edit(User $user, $profile = false){
        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));

        //Formateo de datos:
        $user->formatted_created_at = Carbon::parse($user->created_at)->format($locale[4].' H:i:s');
        $user->formatted_updated_at = Carbon::parse($user->updated_at)->format($locale[4].' H:i:s');

        $roles = $this->roleOptions(true);

        //User roles:
        $user_roles = $user->roles;

        return Inertia::render('Admin/User/Edit', [
            "title" => __($this->option),
            "subtitle" => __('usuario_editar'),
            "module" => $this->module,
            "slug" => 'users',
            "availableLocales" => LocaleTrait::availableLocales(),
            "user" => $user,
            "roles" => $roles,
            "user_roles" => $user->roles,
            "profile" => $profile,      //Edición usuario en session.
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions
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
        try{
            $validated = $request->validated();

            $locale = LocaleTrait::languages(session('locale', app()->getLocale()));

            //dd($request->all());

            //Tratamiento de fechas:
            //$rawStart = $request->birthday;
            $birthday = $request->birthday !== ''
            ? ($locale[0] !== 'en'
                ? $this->convertDate($request->birthday, false)
                : $request->birthday
            )
            : null;

            $user->name = $request->name;
            $user->surname = $request->surname;
            $user->email = $request->email;
            $user->birthday = $birthday;
            $user->nif = $request->nif;

            //Guardando firma:
            $filename = User::saveUserSignature($request);

            if($filename){
                $user->signature = $filename; 
            }

            $user->save();

            return redirect()->route('users.edit', $user)
            ->with('msg', __('usuario_actualizado_msg'));

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
}
