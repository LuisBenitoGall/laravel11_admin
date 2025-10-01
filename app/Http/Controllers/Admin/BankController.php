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
use App\Models\Bank;
use App\Models\UserColumnPreference;

//Requests:
use App\Http\Requests\BankFilterRequest;
use App\Http\Requests\BankStoreRequest;
use App\Http\Requests\BankUpdateRequest;

//Resources:
use App\Http\Resources\BankResource;

//Traits
use App\Traits\HasUserPermissionsTrait;
use App\Traits\LocaleTrait;

class BankController extends Controller{
    /**
     * 1. Listado de bancos.
     * 1.1. Data para exportación.
     * 1.2. Data Query.
     * 2. Formulario nuevo banco.
     * 3. Guardar nuevo banco.
     * 4. Editar banco.
     * 5. Actualizar banco.
     * 6. Eliminar banco.
     * 7. Actualizar estado.
     */

    use HasUserPermissionsTrait;
    use LocaleTrait;
    
    private $module = 'settings';
    private $option = 'configuracion';
    protected array $permissions = [];

    public function __construct(){
        if(session('currentCompany')){
            $this->permissions = $this->resolvePermissions([
                'banks.create',
                'banks.destroy',
                'banks.edit',
                'banks.index',
                'banks.search',
                'banks.show',
                'banks.update'
            ]);   
        } 
    }   

    /**
     * 1. Listado de bancos.
     */
    public function index(BankFilterRequest $request){
        //Importación de bancos desde .json. Se ejecuta 1 vez.
        if (Bank::count() === 0) {
            Bank::import();
        }

        $perPage = $request->input('per_page', config('constants.RECORDS_PER_PAGE_DEFAULT_'));

        $banks = $this->dataQuery($request)->paginate($perPage)->onEachSide(1);

        return Inertia::render('Admin/Bank/Index', [
            "title" => __($this->option),
            "subtitle" => __('bancos'),
            'module' => $this->module,
            'slug' => 'banks',
            "banks" => BankResource::collection($banks),
            "queryParams" => request()->query() ?: null,
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions,
            "columnPreferences" => UserColumnPreference::forUserAndTables(
                auth()->user()->id,
                ['tblBanks'] 
            )
        ]);        
    }

    /**
     * 1.1. Data para exportación.
     */
    public function filteredData(BankFilterRequest $request){
        $cacheKey = 'filtered_banks_' . md5(json_encode($request->all()));

        $banks = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($request) {
            return $this->dataQuery($request)->get();
        });

        return response()->json([
            'banks' => BankResource::collection($banks)
        ]);
    }

    /**
     * 1.2. Data Query.
     */
    private function dataQuery(BankFilterRequest $request){
        $query = Bank::query();

        // Filtros dinámicos
        $filters = [
            'name' => fn($q, $v) => $q->where('name', 'like', "%$v%"),
            'tradename' => fn($q, $v) => $q->where('tradename', 'like', "%$v%"),
            'swift' => fn($q, $v) => $q->where('swift', 'like', "%$v%"),
            'lei' => fn($q, $v) => $q->where('lei', 'like', "%$v%"),
            'eu_code' => fn($q, $v) => $q->where('eu_code', 'like', "%$v%"),
            'supervisor_code' => fn($q, $v) => $q->where('supervisor_code', 'like', "%$v%")
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
        $sortField = $request->input('sort_field', 'status');
        $sortDirection = $request->input('sort_direction', 'DESC');
        $allowedSortFields = ['name', 'tradename', 'swift', 'lei', 'eu_code', 'supervisor_code', 'status'];

        if (!in_array($sortField, $allowedSortFields)) {
            $sortField = 'status';
        }        

        return $query->orderBy($sortField, $sortDirection);
    }

    /**
     * 2. Formulario nuevo banco.
     */
    public function create(){
        return Inertia::render('Admin/Bank/Create', [
            "title" => __($this->option),
            "subtitle" => __('banco_nuevo'),
            "module" => $this->module,
            "slug" => 'banks',
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions
        ]);           
    }

    /**
     * 3. Guardar nuevo banco.
     */
    public function store(BankStoreRequest $request){
        $slug = Str::slug($request->input('name'));
        $status = $request->input('status')? 1:0;

        $bank = Bank::create([
            'name' => $request->input('name'),
            'slug' => $slug,
            'tradename' => $request->input('tradename'),
            'swift' => $request->input('swift'), 
            'lei' => $request->input('lei'),
            'eu_code' => $request->input('eu_code'),
            'supervisor_code' => $request->input('supervisor_code'),
            'status' => $status 
        ]); 

        return redirect()->route('banks.edit', $bank->id)
            ->with('msg', __('banco_creado_msg'));   
    }

    /**
     * 4. Editar banco.
     */
    public function edit(Bank $bank){
        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));

        //Formateo de datos:
        $bank->formatted_created_at = Carbon::parse($bank->created_at)->format($locale[4].' H:i:s');
        $bank->formatted_updated_at = Carbon::parse($bank->updated_at)->format($locale[4].' H:i:s');

        return Inertia::render('Admin/Bank/Edit', [
            "title" => __($this->option),
            "subtitle" => __('banco_editar'),
            "module" => $this->module,
            "slug" => 'banks',
            "bank" => $bank,
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions
        ]);     
    }

    /**
     * 5. Actualizar banco.
     */
    public function update(BankUpdateRequest $request, Bank $bank){
        try{
            $validated = $request->validated();
        
            $slug = Str::slug($request->input('name'));

            $bank->name = $request->name;
            $bank->slug = $slug;
            $bank->tradename = $request->tradename;
            $bank->swift = $request->swift;
            $bank->lei = $request->lei;
            $bank->eu_code = $request->eu_code;
            $bank->supervisor_code = $request->supervisor_code;
            $bank->status = filter_var($request->status, FILTER_VALIDATE_BOOLEAN)? 1:0;
            $bank->save();

            return redirect()->route('banks.edit', $bank->id)
            ->with('msg', __('banco_actualizado_msg')); 
            
        }catch(\Throwable $e){
            Log::error('Error en update(): ' . $e->getMessage());
            abort(500, 'Error interno del servidor');
        }
    }

    /**
     * 6. Eliminar banco.
     */
    public function destroy(Request $request, Bank $bank){
        $bank->delete();

        //Mantenimiento de filtros:
        $queryParams = $request->only([
            'name', 'tradename', 'swift', 'lei', 'eu_code', 'supervisor_code', 'date_from', 'date_to', 'sort_field', 'sort_direction', 'per_page', 'page'
        ]);

        return redirect()->route('banks.index', $queryParams)->with('msg', __('banco_eliminado'));
    }

    /**
     * 7. Actualizar estado.
     */
    public function status(Request $request){
        $bank = Bank::find($request->id);

        if (!$bank) {
            return response()->json(['error' => __('banco_no_encontrado')], 404);
        }

        $bank->status = !$bank->status;
        $bank->save();

        return response()->json([
            'success' => true,
            'message' => __('estado_actualizado_ok'),
            'new_status' => $bank->status
        ]);
    }
}
