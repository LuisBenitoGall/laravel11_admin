<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Helpers\helpers;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Arr;
use Illuminate\Support\Collection;
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
use App\Models\AccountingAccountUsage;
use App\Models\CompanySetting;
use App\Models\UserColumnPreference;
use App\Models\CustomerProvider;
use App\Models\IvaType;
//use App\Models\SeatLines;

//Requests:
use App\Http\Requests\AccountingAccountFilterRequest;
use App\Http\Requests\AccountingAccountStoreAutoRequest;
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
     * 2.1. Obtener cuentas padre.
     * 3. Guardar nueva cuenta.
     * 4. Editar cuenta.
     * 5. Actualizar cuenta.
     * 6. Actualizar estado.
     * 7. Eliminar cuenta.
     * 8. Cuentas IVA.
     * 8.1. Generación másiva cuentas de IVA.
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
        ->where('accounting_accounts.company_id', session('currentCompany'))
        ->whereDoesntHave('usages', fn($q)=>$q->where('usage_code','iva'));

        // Filtros dinámicos
        $filters = [
            'code' => fn($q, $v) => $q->where('code', 'like', "%$v%"),
            'name' => fn($q, $v) => $q->where('name', 'like', "%$v%"),
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
        $allowedSortFields = ['code', 'name'];

        if (!in_array($sortField, $allowedSortFields)) {
            $sortField = 'code';
        }

        return $query->orderBy($sortField, $sortDirection);        
    }

    /**
     * 2. Formulario nueva cuenta.
     */
    public function create(CompanyContext $ctx){
    	$types = AccountingAccountType::select(DB::raw("CONCAT(code, ' - ', name) as type"), 'id')
        ->where('autoreference', '0')
        ->orderBy('code', 'ASC')
        ->get();

        $natureOptions = collect(AccountingAccount::natureLabels(fn($k) => __($k)))
        ->map(fn($label, $value) => ['value' => $value, 'label' => $label])
        ->values()
        ->all();

        //Agrupadoras de empresa:
        $companyId = (int) $ctx->id();
        if($companyId <= 0){
            abort(422, __('no_hay_empresa_activa'));
        }

        $parents = AccountingAccount::query()
        ->where('company_id', $companyId)
        ->where('is_group', 1)
        ->where('status', 1)             // si quieres permitir inactivas, quita esta línea
        ->select('id','code','name','level','is_group')
        ->orderBy('code')
        ->get();

        $parentOptions = $parents->map(function ($p) {
            return [
                'value' => $p->id,
                'label' => trim(($p->code ? $p->code.' — ' : '').$p->name),
                'meta'  => [
                    'level'    => is_null($p->level) ? 0 : (int)$p->level,
                    'is_group' => (bool) $p->is_group,
                    'code'     => $p->code,
                    'name'     => $p->name,
                ],
            ];
        })->values();

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
            'parentOptions' => $parentOptions,
            'currencies' => $currencies,
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions
        ]);    
    }

    /**
     * 2.1. Obtener cuentas padre.
     */
    public function parentOptions(Request $request, CompanyContext $ctx){
        $companyId = (int) $ctx->id();
        $q = trim((string) $request->get('q', ''));
        $limit = (int) min(max((int) $request->get('limit', 20), 1), 50);

        $query = AccountingAccount::query()
            ->where('company_id', $companyId)
            ->where('is_group', 1)
            ->where('status', 1);

        if($q !== ''){
            $query->where(function($w) use ($q) {
                $w->where('code', 'like', $q.'%')
                  ->orWhere('name', 'like', '%'.$q.'%');
            });
        }

        $parents = $query
            ->select('id','code','name','level','is_group')
            ->orderBy('code')
            ->limit($limit)
            ->get();

        $options = $parents->map(function ($p){
            return [
                'value' => $p->id,
                'label' => trim(($p->code ? $p->code.' — ' : '').$p->name),
                'meta'  => [
                    'level'    => is_null($p->level) ? 0 : (int)$p->level,
                    'is_group' => (bool) $p->is_group,
                    'code'     => $p->code,
                    'name'     => $p->name,
                ],
            ];
        })->values();

        return response()->json($options);
    }

    /**
     * 3. Guardar nueva cuenta.
     */
    public function store(AccountingAccountStoreRequest $request, CompanyContext $ctx): RedirectResponse{
        $companyId = (int) $ctx->id();
        if($companyId <= 0){
            abort(422, __('no_hay_empresa_activa'));
        }

        $data = $request->validated();

        // 1) Si viene parent_id, verificar que pertenece a la empresa y es agrupadora
        if (!empty($data['parent_id'])) {
            $parent = AccountingAccount::query()
                ->where('company_id', $companyId)
                ->whereKey($data['parent_id'])
                ->first();

            if (!$parent) {
                return back()->withErrors(['parent_id' => __('cuenta_padre_no_pertenece_empresa')])->withInput();
            }
            if (!$parent->is_group) {
                return back()->withErrors(['parent_id' => __('cuenta_padre_debe_ser_agrupadora')])->withInput();
            }
        }

        // 2) Si hay código manual, exigir unicidad por empresa
        if(!empty($data['manual_code'])){
            $exists = AccountingAccount::query()
                ->where('company_id', $companyId)
                ->where('code', $data['manual_code'])
                ->exists();

            if ($exists) {
                return back()->withErrors(['manual_code' => __('codigo_ya_existe_en_empresa')])->withInput();
            }
        }

        // 3) No aceptamos “contabilidad creativa” del front para normal_side:
        //    lo derivaremos en el Modelo a partir de nature sí o sí.
        unset($data['normal_side']);

        //Guardando cuenta:
        $account = AccountingAccount::saveAccount($request->validated(), $companyId);        

        return redirect()->route('accounting-accounts.edit', $account->id)->with('msg', __('cuenta_creada_msg'));
    }

    /**
     * 3.1. Guardar cuentas automáticamente.
     */
    public function storeAutoAccount(AccountingAccountStoreAutoRequest $request, CompanyContext $ctx){
        $companyId = (int) $ctx->id();
        $payload   = $request->validated();

        $account = AccountingAccount::createForProfile($companyId, $payload);

        return redirect()->back()->with('msg', __('cuenta_creada_msg', ['num' => $account->code]));
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

    /**
     * 8. Cuentas IVA.
     */
    public function ivaAccounts(CompanyContext $ctx){
        $companyId = (int) $ctx->id();
        if ($companyId <= 0) {
            abort(422, __('no_hay_empresa_activa'));
        }

        // 1) Tipos de IVA completos para la vista
        $ivaTypes = IvaType::query()
            ->where('status', 1)
            ->orderBy('iva', 'ASC')
            ->get(['id', 'name', 'iva']);

        // 2) Solo los IDs para el whereIn
        $ivaTypeIds = $ivaTypes->pluck('id')->all();

        // 3) Cuentas de la empresa (para pintar nombres/números y selects)
        $ivaAccounts = AccountingAccount::query()
        ->where('company_id', $companyId)
        ->orderBy('code')
        ->get(['id', 'company_id', 'code', 'name', 'nature', 'normal_side', 'is_group']);

        // 4) Usos SIN groupBy (el front ya los mapea por iva_type_id/side)
        $usages = AccountingAccountUsage::query()
            ->with(['account:id,company_id,code,name,nature'])
            ->where('company_id', $companyId)
            ->whereIn('iva_type_id', $ivaTypeIds)   // o ->forIvaSet($ivaTypeIds)
            ->get(['id','company_id','account_id','iva_type_id','side','locked']);

        return Inertia::render('Admin/AccountingAccount/IvaAccounts', [
            'title'            => __($this->option),
            'subtitle'         => __('cuentas_iva'),
            'module'           => $this->module,
            'slug'             => 'accounting-accounts',
            'ivaTypes'         => $ivaTypes,     // ← objetos completos (id, name, iva)
            'ivaAccounts'      => $ivaAccounts,
            'usages'           => $usages,       // ← array plano
            'natureLabels'     => AccountingAccount::natureLabels(),
            'sideLabels'       => ['debit' => __('debe'), 'credit' => __('haber')],
            'availableLocales' => LocaleTrait::availableLocales(),
            'permissions'      => $this->permissions,
        ]);
    }

    /**
     * 8.1. Generación másiva cuentas de IVA.
     */
    public function bulkGenerateIva(CompanyContext $ctx){
        $companyId = (int) $ctx->id();
        if ($companyId <= 0) {
            abort(422, __('no_hay_empresa_activa'));
        }

        $types = \App\Models\IvaType::where('status', 1)->orderBy('iva')->get();
        $created = ['output' => 0, 'input' => 0];

        foreach ($types as $t) {
            foreach (['output','input'] as $side) {
                $exists = \App\Models\AccountingAccountUsage::query()
                    ->where('company_id', $companyId)
                    ->where('usage_code', 'iva')
                    ->where('context_type', \App\Models\IvaType::class)
                    ->where('context_id', $t->id)
                    ->where('side', $side)
                    ->exists();

                if ($exists) {
                    continue;
                }

                $name = sprintf(
                    'IVA %s%% %s',
                    number_format((float)$t->iva, 2, '.', '') + 0, // evita “21.00”
                    $side === 'output' ? __('repercutido') : __('soportado')
                );

                \App\Models\AccountingAccount::createForProfile($companyId, [
                    'profile'      => 'iva',
                    'iva_type_id'  => $t->id,
                    'side'         => $side,
                    'name'         => $name,
                    // 'code' opcional; si no viene, autoCodeForProfile se encarga
                ]);

                $created[$side]++;
            }
        }

        return back()->with('msg', __(
            'iva_generacion_masiva_ok',
            ['out' => $created['output'], 'in' => $created['input']]
        ));
    }


}