<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\ScheduleEventStoreRequest;
use App\Http\Requests\ScheduleEventUpdateRequest;
use App\Models\GoogleCalendarIntegration;
use App\Models\Schedule;
use App\Models\ScheduleEvent;
use App\Services\GoogleCalendarService;
use App\Support\CompanyContext;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class ScheduleEventController extends Controller
{
    private $module = 'schedule';
    private $option = 'agendas';
    protected array $permissions = [];
    /**
     * Obtener eventos por rango (JSON para FullCalendar)
     * 
     * Query params:
     * - start: fecha inicio (ISO 8601)
     * - end: fecha fin (ISO 8601)
     * - schedule_ids[]: array de IDs de agendas seleccionadas
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', ScheduleEvent::class);

        $ctx = app(CompanyContext::class);
        $currentCompanyId = (int) $ctx->id();
        $user = $request->user();

        // Validar parámetros
        $validated = $request->validate([
            'start' => ['required', 'date'],
            'end' => ['required', 'date', 'after:start'],
            'schedule_ids' => ['nullable', 'array'],
            'schedule_ids.*' => ['integer', 'exists:schedules,id'],
        ]);

        $start = Carbon::parse($validated['start']);
        $end = Carbon::parse($validated['end']);
        $scheduleIds = $validated['schedule_ids'] ?? [];

        // Regla: si schedule_ids vacío → devolver []
        if (empty($scheduleIds)) {
            return response()->json([]);
        }

        // Filtrar agendas accesibles al usuario
        $accessibleSchedules = Schedule::query()
            ->forCompany($currentCompanyId)
            ->visibleTo($user)
            ->whereIn('id', $scheduleIds)
            ->pluck('id')
            ->toArray();

        if (empty($accessibleSchedules)) {
            return response()->json([]);
        }

        // Obtener eventos en rango
        $events = ScheduleEvent::query()
            ->forCompany($currentCompanyId)
            ->forSchedules($accessibleSchedules)
            ->inRange($start, $end)
            ->with(['schedule:id,name,color'])
            ->get()
            ->map(function ($event) {
                return [
                    'id' => $event->id,
                    'title' => $event->title,
                    'start' => $event->starts_at->toIso8601String(),
                    'end' => $event->ends_at->toIso8601String(),
                    'allDay' => $event->all_day,
                    'extendedProps' => [
                        'schedule_id' => $event->schedule_id,
                        'schedule_name' => $event->schedule->name ?? '',
                        'schedule_color' => $event->schedule->color ?? null,
                        'location' => $event->location,
                        'description' => $event->description,
                        'status' => $event->status,
                    ],
                ];
            });

        return response()->json($events);
    }

    /**
     * Crear evento (nested bajo schedule)
     */
    public function store(ScheduleEventStoreRequest $request, Schedule $schedule)
    {
        $this->authorize('create', [ScheduleEvent::class, $schedule]);

        $ctx = app(CompanyContext::class);
        $currentCompanyId = (int) $ctx->id();
        $user = $request->user();

        $event = ScheduleEvent::create([
            'company_id' => $currentCompanyId,
            'schedule_id' => $schedule->id,
            'created_by' => $user->id,
            'title' => $request->title,
            'description' => $request->description,
            'location' => $request->location,
            'starts_at' => $request->starts_at,
            'ends_at' => $request->ends_at,
            'all_day' => $request->boolean('all_day', false),
            'status' => $request->status,
        ]);

        return response()->json([
            'success' => true,
            'message' => __('evento_creado'),
            'event' => [
                'id' => $event->id,
                'title' => $event->title,
                'start' => $event->starts_at->toIso8601String(),
                'end' => $event->ends_at->toIso8601String(),
                'allDay' => $event->all_day,
            ],
        ]);
    }

    /**
     * Actualizar evento
     */
    public function update(ScheduleEventUpdateRequest $request, ScheduleEvent $event)
    {
        $this->authorize('update', $event);

        $event->fill($request->only([
            'title',
            'description',
            'location',
            'starts_at',
            'ends_at',
            'all_day',
            'status',
        ]));
        $event->save();

        return response()->json([
            'success' => true,
            'message' => __('evento_actualizado'),
            'event' => $event,
        ]);
    }

    /**
     * Eliminar evento (soft delete).
     * Si el evento tiene google_event_id, se elimina también en Google Calendar.
     */
    public function destroy(Request $request, ScheduleEvent $event)
    {
        $this->authorize('delete', $event);

        $companyId = $event->company_id;
        $googleCalendarId = $event->google_calendar_id;
        $googleEventId = $event->google_event_id;

        $event->delete();

        if ($googleEventId && $googleCalendarId) {
            $integration = GoogleCalendarIntegration::query()
                ->where('user_id', $request->user()->id)
                ->where('company_id', $companyId)
                ->where('is_enabled', true)
                ->first();
            if ($integration) {
                try {
                    $calendarService = new GoogleCalendarService($integration);
                    $calendarService->deleteEvent($googleCalendarId, $googleEventId);
                } catch (\Throwable $e) {
                    report($e);
                    // El evento ya está borrado localmente; el fallo en Google se registra pero no se propaga
                }
            }
        }

        return response()->json([
            'success' => true,
            'message' => __('evento_eliminado'),
        ]);
    }
}
