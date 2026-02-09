<?php

namespace App\Services;

use App\Models\GoogleCalendarIntegration;
use App\Models\Schedule;
use App\Models\ScheduleEvent;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class GoogleCalendarSyncService
{
    public function __construct(
        private GoogleCalendarIntegration $integration
    ) {}

    /**
     * Sincronización bidireccional: (1) leer de Google y actualizar/crear schedule_events,
     * (2) enviar eventos locales sin google_event_id a Google y actualizar los que sean más recientes localmente.
     *
     * @param int $companyId
     * @param int $userId
     * @param Carbon $timeMin
     * @param Carbon $timeMax
     */
    public function sync(int $companyId, int $userId, Carbon $timeMin, Carbon $timeMax): void
    {
        $calendarService = new GoogleCalendarService($this->integration);
        $timeMinStr = $timeMin->toRfc3339String();
        $timeMaxStr = $timeMax->toRfc3339String();

        $schedules = Schedule::query()
            ->forCompany($companyId)
            ->visibleTo(\App\Models\User::find($userId))
            ->whereNotNull('google_calendar_id')
            ->where('google_calendar_id', '!=', '')
            ->get();

        foreach ($schedules as $schedule) {
            $calendarId = $schedule->google_calendar_id;
            try {
                $items = $calendarService->listEvents($calendarId, $timeMinStr, $timeMaxStr);
            } catch (\Throwable $e) {
                report($e);
                continue;
            }

            foreach ($items as $item) {
                $googleId = $item['id'] ?? null;
                if (! $googleId) {
                    continue;
                }
                $updatedGoogle = isset($item['updated']) ? Carbon::parse($item['updated']) : null;
                $local = ScheduleEvent::query()->where('google_event_id', $googleId)->first();
                if ($local) {
                    if ($updatedGoogle && $local->updated_at && $updatedGoogle->gt($local->updated_at)) {
                        $this->applyGoogleEventToScheduleEvent($local, $item);
                        $local->save();
                    }
                    continue;
                }
                $this->createScheduleEventFromGoogle($companyId, $schedule->id, $userId, $calendarId, $item);
            }
        }

        foreach ($schedules as $schedule) {
            $calendarId = $schedule->google_calendar_id;
            $localsWithoutGoogle = ScheduleEvent::query()
                ->where('schedule_id', $schedule->id)
                ->where(function ($q) {
                    $q->whereNull('google_event_id')->orWhere('google_event_id', '');
                })
                ->get();
            foreach ($localsWithoutGoogle as $ev) {
                try {
                    $payload = $this->scheduleEventToGooglePayload($ev);
                    $newId = $calendarService->createEvent($calendarId, $payload);
                    $ev->google_event_id = $newId;
                    $ev->google_calendar_id = $calendarId;
                    $ev->save();
                } catch (\Throwable $e) {
                    report($e);
                }
            }

            $localsWithGoogle = ScheduleEvent::query()
                ->where('schedule_id', $schedule->id)
                ->whereNotNull('google_event_id')
                ->where('google_event_id', '!=', '')
                ->get();
            foreach ($localsWithGoogle as $ev) {
                try {
                    $items = $calendarService->listEvents($calendarId, $ev->starts_at->copy()->subDay()->toRfc3339String(), $ev->ends_at->copy()->addDay()->toRfc3339String());
                    $googleEvent = null;
                    foreach ($items as $it) {
                        if (($it['id'] ?? '') === $ev->google_event_id) {
                            $googleEvent = $it;
                            break;
                        }
                    }
                    if (! $googleEvent) {
                        continue;
                    }
                    $updatedGoogle = isset($googleEvent['updated']) ? Carbon::parse($googleEvent['updated']) : null;
                    if ($updatedGoogle && $ev->updated_at && $ev->updated_at->gt($updatedGoogle)) {
                        $payload = $this->scheduleEventToGooglePayload($ev);
                        $calendarService->updateEvent($calendarId, $ev->google_event_id, $payload);
                    }
                } catch (\Throwable $e) {
                    report($e);
                }
            }
        }

        $this->integration->last_synced_at = now();
        $this->integration->save();
    }

    private function createScheduleEventFromGoogle(int $companyId, int $scheduleId, int $userId, string $calendarId, array $item): void
    {
        $ev = new ScheduleEvent();
        $ev->company_id = $companyId;
        $ev->schedule_id = $scheduleId;
        $ev->created_by = $userId;
        $ev->google_event_id = $item['id'] ?? null;
        $ev->google_calendar_id = $calendarId;
        $this->applyGoogleEventToScheduleEvent($ev, $item);
        $ev->save();
    }

    private function applyGoogleEventToScheduleEvent(ScheduleEvent $ev, array $item): void
    {
        $ev->title = $item['summary'] ?? '';
        $ev->description = $item['description'] ?? null;
        $ev->location = $item['location'] ?? null;
        $start = $item['start'] ?? [];
        $end = $item['end'] ?? [];
        if (isset($start['dateTime'])) {
            $ev->starts_at = Carbon::parse($start['dateTime']);
            $ev->ends_at = isset($end['dateTime']) ? Carbon::parse($end['dateTime']) : $ev->starts_at->copy()->addHour();
            $ev->all_day = false;
        } else {
            $ev->starts_at = Carbon::parse($start['date'] ?? 'now');
            $ev->ends_at = Carbon::parse($end['date'] ?? $start['date'] ?? 'now');
            $ev->all_day = true;
        }
    }

    private function scheduleEventToGooglePayload(ScheduleEvent $ev): array
    {
        $payload = [
            'summary'     => $ev->title,
            'description' => $ev->description,
            'location'    => $ev->location,
        ];
        if ($ev->all_day) {
            $payload['start'] = ['date' => $ev->starts_at->format('Y-m-d')];
            $payload['end'] = ['date' => $ev->ends_at->format('Y-m-d')];
        } else {
            $payload['start'] = ['dateTime' => $ev->starts_at->toRfc3339String(), 'timeZone' => config('app.timezone', 'Europe/Madrid')];
            $payload['end'] = ['dateTime' => $ev->ends_at->toRfc3339String(), 'timeZone' => config('app.timezone', 'Europe/Madrid')];
        }
        return $payload;
    }
}
