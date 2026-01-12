<?php

namespace App\Policies;

use App\Models\Schedule;
use App\Models\ScheduleEvent;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class ScheduleEventPolicy
{
    use HandlesAuthorization;

    public function before(User $user, string $ability): ?bool
    {
        if (method_exists($user, 'hasRole') && $user->hasRole('super-admin')) {
            return true;
        }

        return null;
    }

    public function viewAny(User $user): bool
    {
        if (!$this->baseGuards($user)) {
            return false;
        }

        return $user->can('schedule_events.index');
    }

    public function view(User $user, ScheduleEvent $event): bool
    {
        if (!$this->baseGuards($user, (int)$event->company_id)) {
            return false;
        }

        if (!$user->can('schedule_events.show')) {
            return false;
        }

        return $this->canAccessEventViaSchedule($user, $event);
    }

    /**
     * Recomendación: autorizar creación en contexto de una agenda concreta.
     * En el controller: $this->authorize('create', [ScheduleEvent::class, $schedule]);
     */
    public function create(User $user, Schedule $schedule): bool
    {
        if (!$this->baseGuards($user, (int)$schedule->company_id)) {
            return false;
        }

        if (!$user->can('schedule_events.create')) {
            return false;
        }

        return $this->scheduleRoleAtLeast($user, $schedule, ['owner', 'editor']);
    }

    public function update(User $user, ScheduleEvent $event): bool
    {
        if (!$this->baseGuards($user, (int)$event->company_id)) {
            return false;
        }

        if (!$user->can('schedule_events.update')) {
            return false;
        }

        // Regla: NO editar eventos pasados (ends_at < now()).
        if ($event->ends_at && $event->ends_at->lt(now())) {
            return false;
        }

        return $this->canAccessEventViaSchedule($user, $event, ['owner', 'editor']);
    }

    public function delete(User $user, ScheduleEvent $event): bool
    {
        if (!$this->baseGuards($user, (int)$event->company_id)) {
            return false;
        }

        if (!$user->can('schedule_events.destroy')) {
            return false;
        }

        // Directriz de empresa (CompanySetting): permitir/bloquear borrado.
        if (!$this->companyAllowsEventDeletion((int)$event->company_id)) {
            return false;
        }

        return $this->canAccessEventViaSchedule($user, $event, ['owner', 'editor']);
    }

    /* -----------------------------------------------------------------
     | Helpers
     |-----------------------------------------------------------------*/

    private function baseGuards(User $user, ?int $resourceCompanyId = null): bool
    {
        $companyId = $this->currentCompanyId();
        if ($companyId <= 0) {
            return false;
        }

        if ($resourceCompanyId !== null && (int)$resourceCompanyId !== $companyId) {
            return false;
        }

        if (!$user->can('module_schedule')) {
            return false;
        }

        if (!$this->isScheduleModuleEnabledForCompany($companyId)) {
            return false;
        }

        if (!$this->userBelongsToCompany($user, $companyId)) {
            return false;
        }

        return true;
    }

    private function currentCompanyId(): int
    {
        foreach ([
            \App\Support\CompanyContext::class,
            \App\Services\CompanyContext::class,
            \App\Contexts\CompanyContext::class,
        ] as $cls) {
            if (class_exists($cls) && app()->bound($cls)) {
                $ctx = app($cls);
                if (method_exists($ctx, 'id')) {
                    return (int) $ctx->id();
                }
            }
        }

        return (int) session('currentCompany', 0);
    }

    private function userBelongsToCompany(User $user, int $companyId): bool
    {
        if (method_exists($user, 'companies')) {
            return $user->companies()->whereKey($companyId)->exists();
        }

        return true;
    }

    private function isScheduleModuleEnabledForCompany(int $companyId): bool
    {
        $svc = \App\Services\CompanyModuleService::class;
        if (class_exists($svc) && app()->bound($svc)) {
            $service = app($svc);
            foreach (['isEnabled', 'enabled', 'hasModule'] as $method) {
                if (method_exists($service, $method)) {
                    try {
                        return (bool) $service->{$method}($companyId, 'schedule');
                    } catch (\Throwable $e) {
                        return true;
                    }
                }
            }
        }

        return true;
    }

    private function canAccessEventViaSchedule(User $user, ScheduleEvent $event, array $minRoles = ['owner', 'editor', 'viewer']): bool
    {
        // Preferimos usar relación schedule si existe.
        if (method_exists($event, 'schedule')) {
            $schedule = $event->schedule;
            if (!$schedule) {
                return false;
            }

            // Seguridad extra: el schedule debe ser de la misma empresa.
            if ((int)$schedule->company_id !== (int)$event->company_id) {
                return false;
            }

            return $this->scheduleRoleAtLeast($user, $schedule, $minRoles);
        }

        // Sin relación, no podemos demostrar acceso: denegar por seguridad.
        return false;
    }

    private function scheduleRoleAtLeast(User $user, Schedule $schedule, array $allowedRoles): bool
    {
        $role = $this->scheduleRole($user, $schedule);

        if ($role === null) {
            return false;
        }

        return in_array($role, $allowedRoles, true);
    }

    /**
     * owner|editor|viewer|null
     */
    private function scheduleRole(User $user, Schedule $schedule): ?string
    {
        if ((int) $schedule->owner_id === (int) $user->id) {
            return 'owner';
        }

        foreach (['authorizedUsers', 'users'] as $rel) {
            if (method_exists($schedule, $rel)) {
                $row = $schedule->{$rel}()->whereKey($user->id)->first();
                if ($row) {
                    $role = $row->pivot->role ?? null;
                    return $role ? (string) $role : 'viewer';
                }
            }
        }

        return null;
    }

    /**
     * Directriz de empresa: schedule_events_allow_delete.
     * - Si no existe CompanySetting o aún no está implementado, por defecto permitimos (true).
     * - Si existe y está a false, bloqueamos.
     */
    private function companyAllowsEventDeletion(int $companyId): bool
    {
        $key = 'schedule_events_allow_delete';

        $cls = \App\Models\CompanySetting::class;
        if (!class_exists($cls)) {
            return true;
        }

        try {
            // Caso A: API tipo CompanySetting::valueFor($companyId, $key, $default)
            if (method_exists($cls, 'valueFor')) {
                return (bool) $cls::valueFor($companyId, $key, true);
            }

            // Caso B: tabla key/value clásica: company_id, key, value
            $val = $cls::query()
                ->where('company_id', $companyId)
                ->where('key', $key)
                ->value('value');

            if ($val === null) {
                return true;
            }

            // Acepta "0/1", "true/false", etc.
            return filter_var($val, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE) ?? true;
        } catch (\Throwable $e) {
            // Si algo falla (schema distinta, etc.), no rompemos el sistema.
            return true;
        }
    }
}
