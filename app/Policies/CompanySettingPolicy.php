<?php

namespace App\Policies;

use App\Models\CompanySetting;
use App\Models\User;
use App\Services\CompanyContext;

class CompanySettingPolicy
{
    protected function currentCompanyId(): int
    {
        return (int) app(CompanyContext::class)->id();
    }

    protected function sameCompany(CompanySetting $setting): bool
    {
        return (int) $setting->company_id === $this->currentCompanyId();
    }

    public function index(User $user): bool
    {
        // Si tienes pantalla tipo index (aunque sea 1 row), respeta el permiso
        return $user->can('company-settings.index');
    }

    public function search(User $user): bool
    {
        return $user->can('company-settings.search');
    }

    public function show(User $user, CompanySetting $setting): bool
    {
        return $this->sameCompany($setting)
            && $user->can('company-settings.show');
    }

    public function create(User $user): bool
    {
        return $user->can('company-settings.create');
    }

    public function edit(User $user, CompanySetting $setting): bool
    {
        return $this->sameCompany($setting)
            && $user->can('company-settings.edit');
    }

    public function update(User $user, CompanySetting $setting): bool
    {
        return $this->sameCompany($setting)
            && $user->can('company-settings.update');
    }

    public function destroy(User $user, CompanySetting $setting): bool
    {
        return $this->sameCompany($setting)
            && $user->can('company-settings.destroy');
    }
}
