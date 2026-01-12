<?php

namespace App\Policies;

use App\Models\GoogleCalendarIntegration;
use App\Models\User;

class GoogleCalendarIntegrationPolicy
{
    protected function userCanAccessCompany(User $user, ?int $companyId): bool
    {
        // Si es null, la integración es "global" del usuario.
        if ($companyId === null) {
            return true;
        }

        // Asumimos relación companies() (multiempresa). Ajusta si tu relación se llama distinto.
        return $user->companies()
            ->whereKey($companyId)
            ->exists();
    }

    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, GoogleCalendarIntegration $integration): bool
    {
        return $integration->user_id === $user->id
            && $this->userCanAccessCompany($user, $integration->company_id);
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, GoogleCalendarIntegration $integration): bool
    {
        return $integration->user_id === $user->id
            && $this->userCanAccessCompany($user, $integration->company_id);
    }

    public function delete(User $user, GoogleCalendarIntegration $integration): bool
    {
        return $this->update($user, $integration);
    }

    /**
     * Custom abilities (útiles para botones "Conectar" / "Desconectar").
     */
    public function connect(User $user, ?int $companyId = null): bool
    {
        return $this->userCanAccessCompany($user, $companyId);
    }

    public function disconnect(User $user, GoogleCalendarIntegration $integration): bool
    {
        return $this->delete($user, $integration);
    }
}
