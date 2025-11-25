<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Str;
use App\Support\CompanyContext;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;
use File;

//Models:
use App\Models\Company;
use App\Models\Country;
use App\Models\CrmAccount;
use App\Models\Currency;
use App\Models\MarketingList;
use App\Models\User;
use App\Models\UserColumnPreference;

//Requests:
use App\Http\Requests\MarketingListFilterRequest;
use App\Http\Requests\MarketingListStoreRequest;
use App\Http\Requests\MarketingListUpdateRequest;

//Resources:
use App\Http\Resources\MarketingListResource;

//Traits:
use App\Traits\HasUserPermissionsTrait;
use App\Traits\LocaleTrait;
use App\Traits\ModulesTrait;

class MarketingListController extends Controller
{
    /**
     * 1. Listado de listas de marketing por empresa.
     * 1.1. Data para exportación.
     * 1.2. Data Query.
     * 2. Formulario nueva lista.
     * 3. Guardar nueva lista.
     * 4. Mostrar lista.
     * 5. Editar lista.
     * 6. Actualizar lista.
     * 7. Eliminar lista.
     * 8. Actualizar estado.
     */

    use HasUserPermissionsTrait;
    use LocaleTrait;

    private $module = 'marketing';
    private $option = 'marketing_listas';
    protected array $permissions = [];

    public function __construct(){
        if(session('currentCompany')){
            $this->permissions = $this->resolvePermissions([
                'marketing-lists.create',
                'marketing-lists.destroy',
                'marketing-lists.edit',
                'marketing-lists.index',
                'marketing-lists.search',
                'marketing-lists.show',
                'marketing-lists.update'
            ]);   
        } 
    }   

    public function index(MarketingListFilterRequest $request){
        $perPage = $request->input('per_page', config('constants.RECORDS_PER_PAGE_DEFAULT_'));

        $lists = $this->dataQuery($request)->paginate($perPage)->onEachSide(1);

        return Inertia::render('Admin/MarketingList/Index', [
            "title" => __($this->option),
            "subtitle" => __('listado'),
            "module" => $this->module,
            "slug" => 'marketing-lists',
            "lists" => MarketingListResource::collection($lists),
            "queryParams" => request()->query() ?: null,
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions,
            "columnPreferences" => UserColumnPreference::forUserAndTables(
                Auth::id(),
                ['tblMarketingLists'] 
            )
        ]);
    }

    /**
     * 1.1. Data para exportación.
     */
    public function filteredData(MarketingListFilterRequest $request){
        $cacheKey = 'filtered_lists_' . md5(json_encode($request->all()));

        $lists = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($request) {
            return $this->dataQuery($request)->get();
        });

        return response()->json([
            'lists' => MarketingListResource::collection($lists)
        ]);
    }

    /**
     * 1.2. Data Query.
     */
    private function dataQuery(MarketingListFilterRequest $request){
        $ctx = app(CompanyContext::class);
        $currentCompanyId = (int) $ctx->id();
        if($currentCompanyId <= 0){
            abort(422, __('no_hay_empresa_activa'));
        }

        $query = MarketingList::where('company_id', $currentCompanyId);

        // Filtros dinámicos
        $filters = [
            'name' => fn($q, $v) => $q->where('name', 'like', "%$v%"),
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
     * 2. Formulario nueva campaña.
     */
    public function create(){
        return Inertia::render('Admin/MarketingList/Create', [
            "title" => __($this->option),
            "subtitle" => __('lista_nueva'),
            'module' => $this->module,
            "slug" => 'marketing-lists',
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions
        ]);    
    }

    /**
     * 3. Guardar nueva lista.
     */
    public function store(MarketingListStoreRequest $request){



    }

    /**
     * 4. Mostrar lista.
     */
    public function show(Request $request, MarketingList $list){

    }

    /**
     * 5. Editar lista.
     */
    public function edit(MarketingList $list, $tab = false){
        $locale = LocaleTrait::languages(session('locale', app()->getLocale()));


        //Formateo de datos:
        $list->formatted_created_at = Carbon::parse($list->created_at)->format($locale[4].' H:i:s');
        $list->formatted_updated_at = Carbon::parse($list->updated_at)->format($locale[4].' H:i:s');

        return Inertia::render('Admin/MarketingList/Edit', [
            "title" => __($this->option),
            "subtitle" => __('lista_editar'),
            "module" => $this->module,
            "slug" => 'marketing-lists',
            "availableLocales" => LocaleTrait::availableLocales(),
            "list" => $list,
            "tab" => $tab,
            "msg" => session('msg'),
            "alert" => session('alert'),
            "permissions" => $this->permissions
        ]);
    }

    /**
     * 6. Actualizar lista.
     */
    public function update(MarketingListUpdateRequest $request, MarketingList $list){

    }

    /**
     * 7. Eliminar lista.
     */
    public function destroy(MarketingList $list){
        $list_id = $list->id;
    
        $list->delete();

        return redirect()->route('marketing-lists.index')->with('msg', __('lista_eliminada'));
    }

    /**
     * 8. Actualizar estado.
     */
    public function status(Request $request){
        $list = MarketingList::find($request->id);

        if(!$list){
            return response()->json(['error' => __('lista_no_encontrada')], 404);
        }

        $list->status = !$list->status;
        $list->save();

        return response()->json([
            'success' => true,
            'message' => __('estado_actualizado_ok'),
            'new_status' => $list->status
        ]);
    }
}
