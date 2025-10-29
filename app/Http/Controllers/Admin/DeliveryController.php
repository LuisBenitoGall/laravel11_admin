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
use File;

//Models:
use App\Models\Company;
use App\Models\Delivery;
use App\Models\Order;
use App\Models\UserColumnPreference;

//Requests:
use App\Http\Requests\DeliveryFilterRequest;
use App\Http\Requests\DeliveryStoreRequest;
use App\Http\Requests\DeliveryUpdateRequest;

//Resources:
use App\Http\Resources\DeliveryResource;

//Traits
use App\Traits\HasUserPermissionsTrait;
use App\Traits\LocaleTrait;

class DeliveryController extends Controller{
    /**
     * 1. Listado de albaranes.
     * 1.1. Data para exportación.
     * 1.2. Data Query.
     */
    
    use HasUserPermissionsTrait;
    use LocaleTrait;

    private $module = 'deliveries';
    private $option = 'albaranes';
    protected array $permissions = [];

    public function __construct(){
        if(session('currentCompany')){
            $this->permissions = $this->resolvePermissions([
                'deliveries.create',
                'deliveries.destroy',
                'deliveries.edit',
                'deliveries.index',
                'deliveries.search',
                'deliveries.show',
                'deliveries.update'
            ]);   
        } 
    }   

    /**
     * 1. Listado de empresas.
     */
    public function index(DeliveryFilterRequest $request){
        $perPage = $request->input('per_page', config('constants.RECORDS_PER_PAGE_DEFAULT_'));

        $deliveries = $this->dataQuery($request)->paginate($perPage)->onEachSide(1);

        return Inertia::render('Admin/Delivery/Index', [
            "title" => __($this->option),
            "subtitle" => __('listado'),
            "module" => $this->module,
            "slug" => 'deliveries',
            "deliveries" => DeliveryResource::collection($deliveries),
            "queryParams" => request()->query() ?: null,
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions,
            "columnPreferences" => UserColumnPreference::forUserAndTables(
                auth()->user()->id,
                ['tblDeliveries'] 
            )
        ]);
    }

    /**
     * 1.1. Data para exportación.
     */
    public function filteredData(DeliveryFilterRequest $request){
        $cacheKey = 'filtered_deliveries_' . md5(json_encode($request->all()));

        $deliveries = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($request) {
            return $this->dataQuery($request)->get();
        });

        return response()->json([
            'deliveries' => DeliveryResource::collection($deliveries)
        ]);
    }

    /**
     * 1.2. Data Query.
     */
    private function dataQuery(DeliveryFilterRequest $request){

        $query = Delivery::select('deliveries.*')
        ->join('user_companies', 'companies.id', '=', 'user_companies.company_id')
        ->where('user_companies.user_id', session('currentCompany'));

        // Filtros dinámicos
        $filters = [
            'name' => fn($q, $v) => $q->where('name', 'like', "%$v%"),
            'tradename' => fn($q, $v) => $q->where('tradename', 'like', "%$v%"),
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
}
