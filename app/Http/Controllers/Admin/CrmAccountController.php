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
use App\Models\CrmAccount;
use App\Models\UserColumnPreference;

//Requests:
use App\Http\Requests\CrmAccountFilterRequest;
use App\Http\Requests\CrmAccountStoreRequest;
use App\Http\Requests\CrmAccountUpdateRequest;

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
     * 6. Actualizar cuenta.
     * 7. Eliminar cuenta.
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
                'crm-accounts.update'
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

        $query = CrmAccount::select('crm_accounts.*')
        ->where('crm_accounts.company_id', session('currentCompany'));

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
        //Guardando cuenta:
        $account = CrmAccount::saveAccount($request);        

        return redirect()->route('crm-accounts.edit', $account->id)
            ->with('msg', __('cuenta_creada_msg'));
    }

    /**
     * 4. Mostrar cuenta.
     */
    public function show(CrmAccount $account){
        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));



        return Inertia::render('Admin/CrmAccount/Show', [
            "title" => __($this->option),
            "subtitle" => __('cuenta_ver'),
            "module" => $this->module,
            "slug" => 'crm-accounts',
            "availableLocales" => LocaleTrait::availableLocales(),
            "account" => $account,
            'msg' => session('msg'),
            'alert' => session('alert'),
            "permissions" => $this->permissions
        ]);
    }

    /**
     * 5. Editar cuenta.
     */
    public function edit(CrmAccount $account){
        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));


        return Inertia::render('Admin/CrmAccount/Edit', [
            "title" => __($this->option),
            "subtitle" => __('cuenta_editar'),
            "module" => $this->module,
            "slug" => 'crm-accounts',
            "availableLocales" => LocaleTrait::availableLocales(),
            "account" => $account,
            'msg' => session('msg'),
            'alert' => session('alert'),
            "permissions" => $this->permissions
        ]);
    }

    /**
     * 6. Actualizar cuenta.
     */
    public function update(CrmAccountUpdateRequest $request, CrmAccount $account){
        try {
            $validated = $request->validated();




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
}
