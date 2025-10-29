<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use App\Support\CompanyContext;
use App\Support\Iban;
use App\Support\ToBool;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

//Models:
use App\Models\AccountingAccount;
use App\Models\Bank;
use App\Models\BankAccount;
use App\Models\UserColumnPreference;

//Requests:
use App\Http\Requests\BankAccountFilterRequest;
use App\Http\Requests\BankAccountStoreRequest;
use App\Http\Requests\BankAccountUpdateRequest;

//Resources:
use App\Http\Resources\BankAccountResource;

//Traits
use App\Traits\HasUserPermissionsTrait;
use App\Traits\LocaleTrait;

class BankAccountController extends Controller{
    /**
     * 1. Listado de cuentas bancarias.
     * 1.1. Data para exportación.
     * 1.2. Data Query.
     * 2. Formulario nueva cuenta.
     * 3. Guardar nueva cuenta.
     * 4. Editar cuenta.
     * 5. Actualizar cuenta.
     * 6. Actualizar estado.
     * 7. Eliminar cuenta. 
     */
    
    use HasUserPermissionsTrait;
    use LocaleTrait;

    private $module = 'accounting';
    private $option = 'bancos_cuentas';
    private $accounting_account_mode = 3;   //Mode: 3 (bancos)
    protected array $permissions = [];

    public function __construct(){
        if(session('currentCompany')){
            $this->permissions = $this->resolvePermissions([
                'bank-accounts.create',
                'bank-accounts.destroy',
                'bank-accounts.edit',
                'bank-accounts.index',
                'bank-accounts.search',
                'bank-accounts.show',
                'bank-accounts.update'
            ]);   
        } 
    }  

    /**
     * 1. Listado de cuentas bancarias.
     */
    public function index(BankAccountFilterRequest $request){
        $perPage = $request->input('per_page', config('constants.RECORDS_PER_PAGE_DEFAULT_'));

        $accounts = $this->dataQuery($request)->paginate($perPage)->onEachSide(1);

        return Inertia::render('Admin/BankAccount/Index', [
            "title" => __($this->option),
            "subtitle" => __('listado'),
            "module" => $this->module,
            "slug" => 'bank-accounts',
            "accounts" => BankAccountResource::collection($accounts),
            "queryParams" => request()->query() ?: null,
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions,
            "columnPreferences" => UserColumnPreference::forUserAndTables(
                auth()->user()->id,
                ['tblBankAccounts'] 
            )
        ]);
    } 

    /**
     * 1.1. Data para exportación.
     */
    public function filteredData(BankAccountFilterRequest $request){
        $cacheKey = 'filtered_bank_accounts_' . md5(json_encode($request->all()));

        $accounts = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($request) {
            return $this->dataQuery($request)->get();
        });

        return response()->json([
            'accounts' => BankAccountResource::collection($accounts)
        ]);
    }

    /**
     * /**
     * 1.2. Data Query.
     */
    private function dataQuery(BankAccountFilterRequest $request){
        $query = BankAccount::query()
            ->select([
                'bank_accounts.*',
                'banks.name AS bank',
                'banks.tradename',
                'accounting_accounts.code',
                'accounting_accounts.name AS accounting_account',
            ])
            ->join('banks', 'bank_accounts.bank_id', '=', 'banks.id')
            ->leftJoin('accounting_accounts', 'bank_accounts.accounting_account_id', '=', 'accounting_accounts.id')
            ->where('bank_accounts.company_id', session('currentCompany')); // o CompanyContext si ya te dignaste

        // Filtros dinámicos (USAR columnas reales, no alias, en WHERE)
        $filters = [
            'bank' => function ($q, $v) {
                $q->where(function ($qq) use ($v) {
                    $qq->where('banks.name', 'like', "%{$v}%")
                       ->orWhere('banks.tradename', 'like', "%{$v}%");
                });
            },
            'iban'    => fn ($q, $v) => $q->where('bank_accounts.iban', 'like', "%{$v}%"),
            'entity'  => fn ($q, $v) => $q->where('bank_accounts.entity', 'like', "%{$v}%"),
            'office'  => fn ($q, $v) => $q->where('bank_accounts.office', 'like', "%{$v}%"),
            'digits'  => fn ($q, $v) => $q->where('bank_accounts.digits', 'like', "%{$v}%"),
            // aquí también, usa la real:
            'accounting_account' => fn ($q, $v) => $q->where('accounting_accounts.name', 'like', "%{$v}%"),
            // si quieres filtrar por code:
            'code'    => fn ($q, $v) => $q->where('accounting_accounts.code', 'like', "%{$v}%"),
        ];

        foreach ($filters as $key => $apply) {
            if ($request->filled($key)) {
                $apply($query, $request->input($key));
            }
        }

        // Filtros por rango de fechas (cualifica la columna)
        $from = $request->input('date_from');
        $to   = $request->input('date_to');

        if ($from && $to) {
            $query->whereBetween('bank_accounts.created_at', ["$from 00:00:00", "$to 23:59:59"]);
        } elseif ($from) {
            $query->where('bank_accounts.created_at', '>=', "$from 00:00:00");
        } elseif ($to) {
            $query->where('bank_accounts.created_at', '<=', "$to 23:59:59");
        }

        // Ordenación: mapea campos “de la vista” a columnas reales o alias válidos
        $sortField     = $request->input('sort_field', 'iban');
        $sortDirection = strtoupper($request->input('sort_direction', 'ASC')) === 'DESC' ? 'DESC' : 'ASC';

        $sortMap = [
            'bank'               => 'bank',                       // alias permitido en ORDER BY
            'iban'               => 'bank_accounts.iban',
            'entity'             => 'bank_accounts.entity',
            'office'             => 'bank_accounts.office',
            'digits'             => 'bank_accounts.digits',
            'code'               => 'accounting_accounts.code',
            'accounting_account' => 'accounting_account',         // alias permitido en ORDER BY
            'created_at'         => 'bank_accounts.created_at',
        ];

        $orderBy = $sortMap[$sortField] ?? 'bank_accounts.iban';

        return $query->orderBy($orderBy, $sortDirection);
    }

    /**
     * 2. Formulario nueva cuenta.
     */
    public function create(CompanyContext $ctx){
        //Bancos
        $banks = Bank::select('id', 'name', 'tradename')
        ->where('status', 1)
        ->get()
        ->mapWithKeys(function ($bank) {
            return [$bank->id => $bank->tradename ?: $bank->name];
        })
        ->sort(); // ordena por valor ascendente

        //Cuentas contables:
        $accounting_accounts = AccountingAccount::getAccountingAccountsByLevel(session('currentCompany'), $this->accounting_account_mode); 

        return Inertia::render('Admin/BankAccount/Create', [
            "title" => __($this->option),
            "subtitle" => __('cuenta_nueva'),
            "module" => $this->module,
            "slug" => 'bank-accounts',
            "banks" => $banks,
            "accounting_accounts" => $accounting_accounts,
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions
        ]);    
    }

    /**
     * 3. Guardar nueva cuenta.
     */
    public function store(BankAccountStoreRequest $request, CompanyContext $ctx){
        $companyId = (int) $ctx->id();
        if ($companyId <= 0) {
            abort(422, __('no_hay_empresa_activa'));
        }

        //Guardando cuenta:
        $account = BankAccount::saveAccount($request->validated(), $companyId);        

        return redirect()->route('bank-accounts.edit', $account->id)
            ->with('msg', __('cuenta_creada_msg'));
    }

    /**
     * 4. Editar cuenta.
     */
    public function edit(BankAccount $account){
        //Bancos
        $banks = Bank::select('id', 'name', 'tradename')
        ->where('status', 1)
        ->get()
        ->mapWithKeys(function ($bank) {
            return [$bank->id => $bank->tradename ?: $bank->name];
        })
        ->sort(); // ordena por valor ascendente

        //Cuentas contables:
        $accounting_accounts = AccountingAccount::getAccountingAccountsByLevel(session('currentCompany'), $this->accounting_account_mode); 

        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));

        $account->load(['createdBy', 'updatedBy']);  

        //Formateo de datos:
        $account->formatted_created_at = Carbon::parse($account->created_at)->format($locale[4].' H:i:s');
        $account->formatted_updated_at = Carbon::parse($account->updated_at)->format($locale[4].' H:i:s');

        $account->created_by_name = optional($account->createdBy)->full_name ?? false;
        $account->updated_by_name = optional($account->updatedBy)->full_name ?? false;  

        return Inertia::render('Admin/BankAccount/Edit', [
            "title" => __($this->option),
            "subtitle" => __('cuenta_editar'),
            "module" => $this->module,
            "slug" => 'bank-accounts',
            "account" => $account,
            "banks" => $banks,
            "accounting_accounts" => $accounting_accounts,
            "availableLocales" => LocaleTrait::availableLocales(),
            'msg' => session('msg'),
            'alert' => session('alert'),
            "permissions" => $this->permissions
        ]);
    }

    /**
     * 5. Actualizar cuenta.
     */
    public function update(BankAccountUpdateRequest $request, BankAccount $account){
        try {
            $validated = $request->validated();

            $iban = Iban::fromEsParts(
                $validated['entity'] ?? null,
                $validated['office'] ?? null,
                $validated['dc'] ?? null,
                $validated['digits'] ?? null
            );
            if (!$iban) {
                throw new \InvalidArgumentException('Faltan trozos de cuenta española');
            }

            $makeFeatured = ToBool::cast($validated['featured'] ?? null, false);

            DB::transaction(function () use ($account, $validated, $iban, $makeFeatured) {
                $account->bank_id               = $validated['bank_id'];
                $account->accounting_account_id = $validated['accounting_account_id'] ?? null;
                $account->iban                  = $iban;
                $account->country_code          = $validated['country_code'] ?? null;
                $account->entity                = $validated['entity'] ?? null;
                $account->office                = $validated['office'] ?? null;
                $account->dc                    = $validated['dc'] ?? null;
                $account->digits                = $validated['digits'] ?? null;
                $account->status                = ToBool::cast($validated['status'] ?? null, false);
                $account->updated_by            = Auth::id();
                $account->save();

                if ($makeFeatured) {
                    // Esto desmarca otras de la misma empresa y marca esta,
                    // evitando violar el índice único en medio.
                    $account->markAsFeatured();
                } else {
                    // Si explícitamente viene featured=false, desmarca esta
                    // (opcional: solo si vino la clave 'featured' en el request)
                    if ($request->has('featured') && $account->featured) {
                        $account->update(['featured' => false]);
                    }
                }
            });

            return redirect()->route('bank-accounts.edit', $account->id)
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
        $account = BankAccount::find($request->id);

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
    public function destroy(BankAccount $account){
        $account_id = $account->id;

        $account->delete();

        return redirect()->route('bank-accounts.index')->with('msg', __('cuenta_eliminada'));
    }
}
