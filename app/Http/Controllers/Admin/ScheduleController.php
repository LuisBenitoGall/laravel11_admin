<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Support\CompanyContext;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Carbon\Carbon;

//Models:
use App\Models\Schedule;

//Requests:
use App\Http\Requests\ScheduleStoreRequest;
use App\Http\Requests\ScheduleUpdateRequest;
use App\Http\Requests\ScheduleAuthorizedUsersSyncRequest;

//Traits:
use App\Traits\HasScheduleRoles;
use App\Traits\HasUserPermissionsTrait;
use App\Traits\LocaleTrait;

class ScheduleController extends Controller
{
    /**
     * 1. Vista de agendas accesibles.
     */

    use HasScheduleRoles;
    use HasUserPermissionsTrait;
    use LocaleTrait;

    private $module = 'schedule';
    private $option = 'agenda';
    protected array $permissions = [];

    public function __construct(){
        if(session('currentCompany')){
            $this->permissions = $this->resolvePermissions([
                'schedules.create',
                'schedules.destroy',
                'schedules.edit',
                'schedules.index',
                'schedules.search',
                'schedules.show',
                'schedules.update'
            ]);   
        } 
    }   

    /**
     * 1. Vista de agendas accesibles.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Schedule::class);

        $ctx = app(CompanyContext::class);
        $currentCompanyId = (int) $ctx->id();
        $user = $request->user();

        // Cargar agendas visibles (owner o compartidas)
        $schedules = Schedule::query()
            ->forCompany($currentCompanyId)
            ->visibleTo($user)
            ->with(['owner:id,name,surname', 'authorizedUsers:id,name,surname,email'])
            ->orderBy('name')
            ->get()
            ->map(function ($schedule) use ($user) {
                // Determinar rol del usuario en esta agenda
                $role = $this->getScheduleRole($user, $schedule);
                
                return [
                    'id' => $schedule->id,
                    'name' => $schedule->name,
                    'description' => $schedule->description,
                    'color' => $schedule->color,
                    'status' => $schedule->status,
                    'google_calendar_id' => $schedule->google_calendar_id,
                    'owner_id' => $schedule->owner_id,
                    'owner_name' => $schedule->owner->name . ' ' . $schedule->owner->surname,
                    'authorizedUsers' => $schedule->authorizedUsers->map(function ($user) {
                        return [
                            'id' => $user->id,
                            'name' => $user->name,
                            'surname' => $user->surname,
                            'email' => $user->email,
                            'pivot' => [
                                'role' => $user->pivot->role ?? 'viewer',
                            ],
                        ];
                    }),
                    'role' => $role,
                    'can' => [
                        'update' => $user->can('update', $schedule),
                        'delete' => $user->can('delete', $schedule),
                        'manageAuthorizedUsers' => $user->can('manageAuthorizedUsers', $schedule),
                    ],
                ];
            });

        return Inertia::render('Admin/Schedule/Index', [
            "title" => __($this->option),
            "subtitle" => __('agendas_mis'),
            "module" => $this->module,
            "slug" => "schedules",
            "schedules" => $schedules,
            "permissions" => $this->permissions,
        ]);
    }

    /**
     * Crear nueva agenda
     */
    public function store(ScheduleStoreRequest $request)
    {
        $this->authorize('create', Schedule::class);

        $ctx = app(CompanyContext::class);
        $currentCompanyId = (int) $ctx->id();
        $user = $request->user();

        $schedule = Schedule::create([
            'company_id' => $currentCompanyId,
            'owner_id' => $user->id,
            'name' => $request->name,
            'description' => $request->description,
            'color' => $request->color,
            'status' => $request->boolean('status', true),
            'google_calendar_id' => $request->filled('google_calendar_id') ? $request->google_calendar_id : null,
        ]);

        // Nota: el owner NO se añade al pivot, solo los usuarios compartidos

        return redirect()->route('schedules.index')
            ->with('msg', __('agenda_creada'));
    }

    /**
     * Actualizar agenda
     */
    public function update(ScheduleUpdateRequest $request, Schedule $schedule)
    {
        $this->authorize('update', $schedule);

        $schedule->fill($request->only(['name', 'description', 'color', 'status', 'google_calendar_id']));
        $schedule->save();

        return redirect()->route('schedules.index')
            ->with('msg', __('agenda_actualizada'));
    }

    /**
     * Eliminar agenda (soft delete)
     */
    public function destroy(Request $request, Schedule $schedule)
    {
        $this->authorize('delete', $schedule);

        $schedule->delete();

        return redirect()->route('schedules.index')
            ->with('msg', __('agenda_eliminada'));
    }

    /**
     * Gestionar usuarios autorizados (sincronizar pivot)
     */
    public function updateAuthorizedUsers(ScheduleAuthorizedUsersSyncRequest $request, Schedule $schedule)
    {
        $this->authorize('manageAuthorizedUsers', $schedule);

        $authorizedUsers = collect($request->authorized_users);
        
        // Preparar datos para sync: [user_id => ['role' => role]]
        $syncData = $authorizedUsers->mapWithKeys(function ($item) {
            return [$item['user_id'] => ['role' => $item['role']]];
        })->toArray();

        // Sync pivot (elimina los que no están, añade/actualiza los que están)
        $schedule->authorizedUsers()->sync($syncData);

        return redirect()->route('schedules.index')
            ->with('msg', __('usuarios_autorizados_actualizados'));
    }

    /**
     * Helper: obtener rol del usuario en una agenda
     */
    private function getScheduleRole($user, Schedule $schedule): ?string
    {
        if ((int) $schedule->owner_id === (int) $user->id) {
            return self::ROLE_OWNER;
        }

        // Buscar en la relación ya cargada
        $authorizedUser = $schedule->authorizedUsers->firstWhere('id', $user->id);
        if ($authorizedUser && $authorizedUser->pivot) {
            return $authorizedUser->pivot->role ?? self::ROLE_VIEWER;
        }

        return null;
    }
}
