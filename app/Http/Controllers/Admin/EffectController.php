<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Helpers\helpers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

//Models:
use App\Models\Company;
use App\Models\AccountingAccount;
use App\Models\AccountingAccountType;
use App\Models\CompanySetting;
use App\Models\Effect;
use App\Models\UserColumnPreference;
use App\Models\CustomerProvider;
use App\Models\IvaType;

//Requests:
use App\Http\Requests\EffectFilterRequest;
use App\Http\Requests\EffectStoreRequest;
use App\Http\Requests\EffectUpdateRequest;

//Resources:
use App\Http\Resources\EffectResource;

//Traits
use App\Traits\HasUserPermissionsTrait;
use App\Traits\LocaleTrait;

class EffectController extends Controller{
    /**
     * 1. Listado de efectos.
     * 1.1. Data para exportación.
     * 1.2. Data Query.
     */
    
    use HasUserPermissionsTrait;
    use LocaleTrait;

    private $module = 'accounting';
    private $option = 'efectos';
    protected array $permissions = [];

    public function __construct(){
        if(session('currentCompany')){
            $this->permissions = $this->resolvePermissions([
                'effects.create',
                'effects.destroy',
                'effects.edit',
                'effects.index',
                'effects.search',
                'effects.show',
                'effects.update'
            ]);   
        } 
    }  

    /**
     * 1. Listado de efectos.
     */
    public function index(EffectFilterRequest $request){
        $perPage = $request->input('per_page', config('constants.RECORDS_PER_PAGE_DEFAULT_'));

        $effects = $this->dataQuery($request)->paginate($perPage)->onEachSide(1);

        return Inertia::render('Admin/Effect/Index', [
            "title" => __($this->option),
            "subtitle" => __('listado'),
            "module" => $this->module,
            "slug" => 'effects',
            "effects" => EffectResource::collection($effects),
            "queryParams" => request()->query() ?: null,
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions,
            "columnPreferences" => UserColumnPreference::forUserAndTables(
                auth()->user()->id,
                ['tblEffects'] 
            )
        ]);
    } 

    /**
     * 1.1. Data para exportación.
     */
    public function filteredData(EffectFilterRequest $request){
        $cacheKey = 'filtered_accounting_accounts_' . md5(json_encode($request->all()));

        $effects = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($request) {
            return $this->dataQuery($request)->get();
        });

        return response()->json([
            'effects' => EffectResource::collection($effects)
        ]);
    }

    /**
     * /**
     * 1.2. Data Query.
     */
    private function dataQuery(EffectFilterRequest $request){
        $query = Effect::select('effects.*')
        // ->join('user_accounting_accounts', 'accounting_accounts.id', '=', 'user_accounting_accounts.company_id')
        ->where('effects.company_id', session('currentCompany'));

        // Filtros dinámicos
        $filters = [
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
        $allowedSortFields = ['name', 'tradename', 'nif'];

        if (!in_array($sortField, $allowedSortFields)) {
            $sortField = 'name';
        }

        return $query->orderBy($sortField, $sortDirection);        
    }






    /**
     * 4. Editar efecto.
     */
    public function edit(Effect $effect){
        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));

        $effect->load(['createdBy', 'updatedBy']);  

        //Formateo de datos:
        $effect->formatted_created_at = Carbon::parse($effect->created_at)->format($locale[4].' H:i:s');
        $effect->formatted_updated_at = Carbon::parse($effect->updated_at)->format($locale[4].' H:i:s');

        $effect->created_by_name = optional($effect->createdBy)->full_name ?? false;
        $effect->updated_by_name = optional($effect->updatedBy)->full_name ?? false;  

        return Inertia::render('Admin/Effect/Edit', [
            "title" => __($this->option),
            "subtitle" => __('efecto_editar'),
            "module" => $this->module,
            "slug" => 'effects',
            "availableLocales" => LocaleTrait::availableLocales(),
            "effect" => $effect,
            'msg' => session('msg'),
            'alert' => session('alert'),
            "permissions" => $this->permissions
        ]);
    }

    /**
     * 5. Actualizar efecto.
     */
    public function update(EffectUpdateRequest $request, Effect $effect){
        try {
            $validated = $request->validated();



        } catch (\Throwable $e) {
            Log::error('Error en update(): ' . $e->getMessage());
            abort(500, 'Error interno del servidor');
        }
    }







    /**
     * 7. Eliminar efecto.
     */
    public function destroy(Effect $effect){
        $effect_id = $effect->id;

        $effect->delete();

        return redirect()->route('effects.index')->with('msg', __('efecto_eliminado'));
    }
}
