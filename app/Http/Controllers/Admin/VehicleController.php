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
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

//Models:
use App\Models\Vehicle;
use App\Models\UserColumnPreference;

//Requests:
use App\Http\Requests\VehicleFilterRequest;
use App\Http\Requests\VehicleStoreRequest;
use App\Http\Requests\VehicleUpdateRequest;

//Resources:
use App\Http\Resources\VehicleResource;

//Traits
use App\Traits\HasUserPermissionsTrait;
use App\Traits\LocaleTrait;

class VehicleController extends Controller{
    /**
     * 1. Listado de vehículos por empresa.
     * 1.1. Data para exportación.
     * 1.2. Data Query.
     * 2. Formulario nuevo vehículo.
     * 3. Guardar nuevo vehículo.
     * 4. Mostrar vehículo.
     * 5. Editar vehículo.
     * 6. Actualizar vehículo.
     * 7. Eliminar vehículo.
     * 8. Actualizar estado.
     */
    
    use HasUserPermissionsTrait;
    use LocaleTrait;
    
    private $module = 'logistics';
    private $option = 'vehiculos';
    protected array $permissions = [];

    public function __construct(){
        if(session('currentCompany')){
            $this->permissions = $this->resolvePermissions([
                'vehicles.create',
                'vehicles.destroy',
                'vehicles.edit',
                'vehicles.index',
                'vehicles.search',
                'vehicles.show',
                'vehicles.update'
            ]);   
        } 
    }   

    /**
     * 1. Listado de vehículos por empresa.
     */
    public function index(VehicleFilterRequest $request){
        $perPage = $request->input('per_page', config('constants.RECORDS_PER_PAGE_DEFAULT_'));

        $vehicles = $this->dataQuery($request)->paginate($perPage)->onEachSide(1);

        return Inertia::render('Admin/Vehicle/Index', [
            "title" => __($this->option),
            "subtitle" => __('vehiculos'),
            "module" => $this->module,
            "slug" => 'vehicles',
            "vehicles" => VehicleResource::collection($vehicles),
            "queryParams" => request()->query() ?: null,
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions,
            "columnPreferences" => UserColumnPreference::forUserAndTables(
                auth()->user()->id,
                ['tblVehicles'] 
            )
        ]);     
    }

    /**
     * 1.1. Data para exportación.
     */
    public function filteredData(ContentFilterRequest $request){
        $cacheKey = 'filtered_vehicles_' . md5(json_encode($request->all()));

        $vehicles = Cache::remember($cacheKey, now()->addMinutes(5), function () use ($request){
            return $this->dataQuery($request)->get();
        });

        return response()->json([
            'vehicles' => VehicleResource::collection($vehicles)
        ]);    
    }

    /**
     * 1.2. Data Query.
     */
    private function dataQuery(ContentFilterRequest $request){
        $query = Vehicle::query();



    }

    /**
     * 2. Formulario nuevo vehículo.
     */
    public function create(){
        return Inertia::render('Admin/Vehicle/Create', [
            "title" => __($this->option),
            "subtitle" => __('vehiculo_nuevo'),
            "module" => $this->module,
            "slug" => 'vehicles',
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions
        ]);     
    }

    /**
     * 3. Guardar nuevo vehículo.
     */
    public function store(VehicleStoreRequest $request){

    }

    /**
     * 4. Mostrar vehículo.
     */
    public function show(Vehicle $vehicle){
        return Inertia::render('Admin/Vehicle/Show', [
            "title" => __($this->option),
            "subtitle" => __('vehiculo_ver'),
            "module" => $this->module,
            "slug" => "vehicles",
            "vehicle" => $vehicle,
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions
        ]);    
    }

    /**
     * 5. Editar vehículo.
     */
    public function edit(Vehicle $vehicle){
        return Inertia::render('Admin/Vehicle/Edit', [
            "title" => __($this->option),
            "subtitle" => __('vehiculo_editar'),
            "module" => $this->module,
            "slug" => "vehicles",
            "vehicle" => $vehicle,
            "availableLocales" => LocaleTrait::availableLocales(),
            "permissions" => $this->permissions
        ]);        
    }

    /**
     * 6. Actualizar vehículo.
     */
    public function update(VehicleUpdateRequest $request){

    }

    /**
     * 7. Eliminar vehículo.
     */
    public function destroy(Vehicle $vehicle){
        $vehicle->delete();

        return redirect()->route('vehicles.index')->with('msg', __('vehiculo_eliminado'));
    }

    /**
     * 8. Actualizar estado.
     */
    public function status(Request $request, $id, $status){
        $vehicle = Vehicle::find($id);
        
        if($vehicle){
            $vehicle->status = $status;
            $vehicle->save(); 

            return response()->json([
                'success' => true,
                'message' => __('estado_actualizado_ok'),
                'new_status' => $status
            ]);

        // Responder con error si la empresa no se encuentra
        }else{
            return response()->json(['error' => __('modulo_no_encontrado')], 404);
        }
    }
}
