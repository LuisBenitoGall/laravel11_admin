<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

//Models:
use App\Models\AccountingAccountType;
use App\Models\UserColumnPreference;

//Requests:
use App\Http\Requests\AccountingAccountTypeFilterRequest;
use App\Http\Requests\AccountingAccountTypeStoreRequest;
use App\Http\Requests\AccountingAccountTypeUpdateRequest;

//Resources:
use App\Http\Resources\AccountingAccountTypeResource;

//Traits:
use App\Traits\AccountingAccountTypeTrait;
use App\Traits\HasUserPermissionsTrait;
use App\Traits\LocaleTrait;

class AccountingAccountTypeController extends Controller{
    /**
     * 1. Relación de grupos contables.
     * 1.1. Data para exportación.
     * 1.2. Data Query.
     * 2. Formulario nuevo tipo grupo contable.
     * 3. Guardar grupo.
     * 4. Editar grupo contable.
     */
    
    use HasUserPermissionsTrait;
    use LocaleTrait;
    
    private $module = 'settings';
    private $option = 'configuracion';
    protected array $permissions = [];

    public function __construct(){
        if(session('currentCompany')){
            $this->permissions = $this->resolvePermissions([
                'accounting-account-types.create',
                'accounting-account-types.destroy',
                'accounting-account-types.edit',
                'accounting-account-types.index',
                'accounting-account-types.search',
                'accounting-account-types.show',
                'accounting-account-types.update'
            ]);   
        } 
    }   

    /**
     * 1. Relación de grupos contables.
     */
    public function index(AccountingAccountTypeFilterRequest $request){
        $perPage = $request->input('per_page', config('constants.RECORDS_PER_PAGE_DEFAULT_'));

        $types = $this->dataQuery($request)->paginate($perPage)->onEachSide(1);

        return Inertia::render('Admin/AccountingAccountType/Index', [
            "title" => __($this->option),
            "subtitle" => __('grupos_contables'),
            "module" => $this->module,
            "slug" => 'accounting-account-types',
            "types" => AccountingAccountTypeResource::collection($types),
            "queryParams" => request()->query() ?: null,
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions,
            "columnPreferences" => UserColumnPreference::forUserAndTables(
                auth()->user()->id,
                ['tblAccountingAccountTypes'] 
            )
        ]);     
    }

    /**
     * 1.1. Data para exportación.
     */
    public function filteredData(AccountingAccountTypeFilterRequest $request){
        $cacheKey = 'filtered_types_' . md5(json_encode($request->all()));

        $types = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($request) {
            return $this->dataQuery($request)->get();
        });

        return response()->json([
            'types' => AccountingAccountTypeResource::collection($types)
        ]);    
    }

    /**
     * 1.2. Data Query.
     */
    private function dataQuery(AccountingAccountTypeFilterRequest $request){
        $query = AccountingAccountType::query();

        // Filtros dinámicos
        $filters = [
            'code' => fn($q, $v) => $q->where('code', 'like', "%$v%"),
            'name' => fn($q, $v) => $q->where('name', 'like', "%$v%"),
            'mode' => fn($q, $v) => $q->where('mode', 'like', "%$v%")
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
        $sortDirection = $request->input('sort_direction', 'DESC');
        $allowedSortFields = ['name', 'code', 'mode'];

        if(!in_array($sortField, $allowedSortFields)){
            $sortField = 'name';
        }        

        return $query->orderBy($sortField, $sortDirection);
    }

    /**
     * 2. Formulario nuevo tipo grupo contable.
     */
    public function create(){
        return Inertia::render('Admin/AccountingAccountType/Create', [
            "title" => __($this->option),
            "subtitle" => __('grupo_contable_nuevo'),
            "module" => $this->module,
            "slug" => 'accounting-account-types',
            "modes" => AccountingAccountTypeTrait::modes(),
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions
        ]);     
    }

    /**
     * 3. Guardar grupo.
     */
    public function store(AccountingAccountTypeStoreRequest $request){
        $type = new AccountingAccountType();
        $type->autoreference = '0';
        $type->code = $request->code;
        $type->name = $request->name;
        $type->mode = $request->mode;
        $type->save();

        return redirect()->route('accounting-account-types.index')
            ->with('msg', __('grupo_contable_creado_msg'));
    }

    /**
     * 4. Editar grupo contable.
     */
    public function edit(AccountingAccountType $type){
        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));

        //Formateo de datos:
        $type->formatted_created_at = Carbon::parse($type->created_at)->format($locale[4].' H:i:s');
        $type->formatted_updated_at = Carbon::parse($type->updated_at)->format($locale[4].' H:i:s');

        $modos = AccountingAccountTypeTrait::modes();
        $mode_name = $type->mode? $modos[$type->mode]:false;

        return Inertia::render('Admin/AccountingAccountType/Edit', [
            "title" => __($this->option),
            "subtitle" => __('grupo_contable_editar'),
            "module" => $this->module,
            "slug" => 'accounting-account-types',
            "type" => $type,
            "mode_name" => $mode_name,
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions
        ]);     
    }

    /**
     * 5. Actualizar grupo contable.
     */
    public function update(AccountingAccountTypeUpdateRequest $request, AccountingAccountType $type){
        try{
            $validated = $request->validated();

            $type->name = $request->name;
            $type->save();

            return redirect()->route('accounting-account-types.edit', $type)
            ->with('msg', __('grupo_contable_actualizado_msg'));

        }catch(\Throwable $e){
            Log::error('Error en update(): ' . $e->getMessage());
            abort(500, 'Error interno del servidor');
        }
    }            
}
