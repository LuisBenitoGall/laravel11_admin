<?php

namespace App\Policies;

use App\Models\Schedule;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class SchedulePolicy
{
    use HandlesAuthorization;

    /**
     * Si tienes un rol tipo super-admin, aquí puedes habilitar bypass global.
     * Si no lo tienes, no pasa nada: simplemente no se aplica.
     */
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

        return $user->can('schedules.index');
    }

    public function view(User $user, Schedule $schedule): bool
    {
        if (!$this->baseGuards($user, $schedule->company_id)) {
            return false;
        }

        if (!$user->can('schedules.show')) {
            return false;
        }

        return $this->hasAnyScheduleAccess($user, $schedule);
    }

    public function create(User $user): bool
    {
        if (!$this->baseGuards($user)) {
            return false;
        }

        return $user->can('schedules.create');
    }

    public function update(User $user, Schedule $schedule): bool
    {
        if (!$this->baseGuards($user, $schedule->company_id)) {
            return false;
        }

        if (!$user->can('schedules.update')) {
            return false;
        }

        // Decisión: editar agenda requiere ser owner (puedes flexibilizarlo si quieres).
        return $this->scheduleRole($user, $schedule) === 'owner';
    }

    /**
     * Gestionar usuarios autorizados (shares).
     * Separamos esto para que el controller/UI puedan autorizarlo explícitamente.
     */
    public function manageAuthorizedUsers(User $user, Schedule $schedule): bool
    {
        if (!$this->baseGuards($user, $schedule->company_id)) {
            return false;
        }

        // Decisión: compartir requiere update + owner.
        if (!$user->can('schedules.update')) {
            return false;
        }

        return $this->scheduleRole($user, $schedule) === 'owner';
    }

    public function delete(User $user, Schedule $schedule): bool
    {
        if (!$this->baseGuards($user, $schedule->company_id)) {
            return false;
        }

        if (!$user->can('schedules.destroy')) {
            return false;
        }

        // Decisión: borrar agenda requiere owner (más permiso).
        if ($this->scheduleRole($user, $schedule) !== 'owner') {
            return false;
        }

        // Regla: impedir borrar si hay eventos futuros (ends_at > now()).
        if (method_exists($schedule, 'events')) {
            return !$schedule->events()
                ->where('ends_at', '>', now())
                ->exists();
        }

        // Si no hay relación definida, no podemos comprobar: más seguro denegar.
        return false;
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

        // Si estamos autorizando sobre un recurso concreto, obliga a coincidir con la empresa en sesión.
        if ($resourceCompanyId !== null && (int)$resourceCompanyId !== $companyId) {
            return false;
        }

        // Permiso de módulo (usuario).
        if (!$user->can('module_schedule')) {
            return false;
        }

        // Módulo habilitado por empresa (best-effort; si no hay infraestructura, no bloquea).
        if (!$this->isScheduleModuleEnabledForCompany($companyId)) {
            return false;
        }

        // Membresía del usuario en la empresa (si existe relación).
        if (!$this->userBelongsToCompany($user, $companyId)) {
            return false;
        }

        return true;
    }

    private function currentCompanyId(): int
    {
        // Intenta CompanyContext si existe; si no, session('currentCompany').
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
        // Ajusta esto a tu implementación real. Si existe user->companies() (BelongsToMany), lo usamos.
        if (method_exists($user, 'companies')) {
            return $user->companies()->whereKey($companyId)->exists();
        }

        // Si no hay relación definida (o aún no), no bloqueamos aquí para no romper.
        return true;
    }

    private function isScheduleModuleEnabledForCompany(int $companyId): bool
    {
        // Si no tienes el sistema de módulos todavía accesible aquí, no bloqueamos.
        // Si lo tienes, puedes afinar.

        // 1) CompanyModuleService (si existe)
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

        // 2) Fallback: no bloquea.
        return true;
    }

    private function hasAnyScheduleAccess(User $user, Schedule $schedule): bool
    {
        return $this->scheduleRole($user, $schedule) !== null;
    }

    /**
     * owner|editor|viewer|null
     */
    private function scheduleRole(User $user, Schedule $schedule): ?string
    {
        if ((int) $schedule->owner_id === (int) $user->id) {
            return 'owner';
        }

        // Intenta encontrar el role en el pivot.
        foreach (['authorizedUsers', 'users'] as $rel) {
            if (method_exists($schedule, $rel)) {
                $q = $schedule->{$rel}()->whereKey($user->id);
                $row = $q->first();
                if ($row) {
                    // Pivot estándar de Laravel.
                    $role = $row->pivot->role ?? null;
                    return $role ? (string) $role : 'viewer';
                }
            }
        }

        return null;
    }
}
