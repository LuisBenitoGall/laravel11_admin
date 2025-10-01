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
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

//Models:
use App\Models\Account;
use App\Models\UserColumnPreference;

//Requests:
use App\Http\Requests\AccountFilterRequest;
use App\Http\Requests\AccountStoreRequest;
use App\Http\Requests\AccountUpdateRequest;

//Resources:
use App\Http\Resources\AccountResource;

//Traits
use App\Traits\HasUserPermissionsTrait;
use App\Traits\LocaleTrait;

class AccountController extends Controller{
    /**
     * 1. Listado de cuentas.
     * 1.1. Data para exportación.
     * 1.2. Data Query.
     * 2. Formulario nueva cuenta.
     * 3. Guardar nueva cuenta.
     * 4. Mostrar cuenta.
     * 5. Editar cuenta.
     * 6. Actualizar cuenta.
     * 7. Eliminar cuenta.
     * 8. Actualizar estado.
     */
    
    use HasUserPermissionsTrait;
    use LocaleTrait;

    private $module = 'settings';
    private $option = 'configuracion';
    protected array $permissions = [];

    public function __construct(){
        if(session('currentCompany')){
            $this->permissions = $this->resolvePermissions([
                'accounts.create',
                'accounts.destroy',
                'accounts.edit',
                'accounts.index',
                'accounts.search',
                'accounts.show',
                'accounts.update'
            ]);
        }
    }
    
    /**
     * 1. Listado de cuentas.
     */
    public function index(AccountFilterRequest $request){
        $perPage = $request->input('per_page', config('constants.RECORDS_PER_PAGE_DEFAULT_'));
        
        $accounts = $this->dataQuery($request)->paginate($perPage)->onEachSide(1);

        return Inertia::render('Admin/Account/Index', [
            "title" => __($this->option),
            "subtitle" => __('cuentas'),
            "module" => $this->module,
            "slug" => 'accounts',
            "accounts" => AccountResource::collection($accounts),
            "queryParams" => request()->query() ?: null,
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions,
            "columnPreferences" => UserColumnPreference::forUserAndTables(
                auth()->user()->id,
                ['tblAccounts'] 
            )
        ]);
    }

    /**
     * 1.1. Data para exportación.
     */
    public function filteredData(AccountFilterRequest $request){
        $cacheKey = 'filtered_accounts_' . md5(json_encode($request->all()));

        $accounts = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($request) {
            return $this->dataQuery($request)->get();
        });

        return response()->json([
            'accounts' => AccountResource::collection($accounts)
        ]);
    }

    /**
     * 1.2. Data Query.
     */
    private function dataQuery(AccountFilterRequest $request){
        $user = auth()->user();

        $query = Account::select('*');

        // Filtros dinámicos
        $filters = [
            'name' => fn($q, $v) => $q->whereRaw('LOWER(name) LIKE ?', ['%' . strtolower($v) . '%']),
            'description' => fn($q, $v) => $q->whereRaw('LOWER(description) LIKE ?', ['%' . strtolower($v) . '%']),
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
        $allowedSortFields = ['name', 'description'];

        if (!in_array($sortField, $allowedSortFields)) {
            $sortField = 'name';
        }

        return $query->orderBy($sortField, $sortDirection);    
    }

    /**
     * 2. Formulario nueva cuenta.
     */
    public function create(){
        $currency = config('constants.CURRENCY_');

        return Inertia::render('Admin/Account/Create', [
            "title" => __($this->option),
            "subtitle" => __('cuenta_nueva'),
            "module" => $this->module,
            "slug" => 'accounts',
            "currency" => $currency,
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions
        ]);  
    }

    /**
     * 3. Guardar nueva cuenta.
     */
    public function store(AccountStoreRequest $request){
        //Guardando cuenta:
        $account = Account::saveAccount($request);        

        return redirect()->route('accounts.edit', $account->id)
            ->with('msg', __('cuenta_creada_msg'));
    }

    /**
     * 4. Mostrar cuenta.
     */
    public function show(Account $account){
        //En construcción.
    }

    /**
     * 5. Editar cuenta.
     */
    public function edit(Account $account){
        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));

        //Formateo de datos:
        $account->formatted_created_at = Carbon::parse($account->created_at)->format($locale[4].' H:i:s');
        $account->formatted_updated_at = Carbon::parse($account->updated_at)->format($locale[4].' H:i:s');

        $currency = config('constants.CURRENCY_');

        return Inertia::render('Admin/Account/Edit', [
            "title" => __($this->option),
            "subtitle" => __('cuenta_editar').' '.ucwords($account->name),
            "module" => $this->module,
            "slug" => 'accounts',
            "availableLocales" => LocaleTrait::availableLocales(),
            "account" => $account,
            "currency" => $currency,
            "msg" => session('msg'),
            "alert" => session('alert'),
            "permissions" => $this->permissions
        ]);
    }

    /**
     * 6. Actualizar cuenta.
     */
    public function update(AccountUpdateRequest $request, Account $account){
        try{
            $validated = $request->validated();

            $slug = Str::slug($validated['name']);

            $account->name = $validated['name'];
            $account->slug = $slug;
            $account->description = $request->description;
            $account->rate = $request->rate;
            $account->duration = $request->duration;
            $account->status = filter_var($request->status, FILTER_VALIDATE_BOOLEAN) ? 1 : 0;
            $account->save();

            return redirect()->route('accounts.edit', $account->id)
            ->with('msg', __('cuenta_actualizada_msg'));

        }catch (\Throwable $e){
            Log::error('Error en update(): ' . $e->getMessage());
            abort(500, 'Error interno del servidor');
        }
    }
    
    /**
     * 7. Eliminar cuenta.
     */
    public function destroy(Account $account){
        $account->delete();

        return redirect()->route('accounts.index')->with('msg', __('cuenta_eliminada'));
    }
    
    /**
     * 8. Actualizar estado.
     */
    public function status(Request $request){
        $account = Account::find($request->id);

        if (!$account) {
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
}
