<?php

namespace App\Policies\Crm;

use App\Models\User;
use App\Models\Crm\CrmAccount;

class CrmAccountPolicy{
    protected function sameCompany(User $user, CrmAccount $account): bool
    {
        if (method_exists($user, 'companies')) {
            return $user->companies()->whereKey($account->company_id)->exists();
        }
        if (isset($user->current_company_id)) {
            return (int) $user->current_company_id === (int) $account->company_id;
        }
        return (int) session('company_id') === (int) $account->company_id;
    }

    protected function owns(User $user, CrmAccount $account): bool
    {
        return (int) $account->owner_id === (int) $user->id;
    }

    public function viewAny(User $user): bool
    {
        return $user->can('crm-accounts.index') || $user->can('crm-accounts.search');
    }

    public function view(User $user, CrmAccount $account): bool
    {
        if (!$this->sameCompany($user, $account)) return false;

        return $user->can('crm-accounts.show')
            || $user->can('crm-accounts.index')
            || $this->owns($user, $account);
    }

    public function create(User $user): bool
    {
        return $user->can('crm-accounts.create');
    }

    public function update(User $user, CrmAccount $account): bool
    {
        if (!$this->sameCompany($user, $account)) return false;

        if ($user->can('crm-accounts.update') || $user->can('crm-accounts.edit')) {
            return true;
        }

        if ($this->owns($user, $account)
            && ($user->can('crm-accounts.update.own') || $user->can('crm-accounts.edit.own'))) {
            return true;
        }

        return false;
    }

    public function delete(User $user, CrmAccount $account): bool
    {
        if (!$this->sameCompany($user, $account)) return false;

        if ($user->can('crm-accounts.destroy')) return true;

        if ($this->owns($user, $account) && $user->can('crm-accounts.destroy.own')) return true;

        return false;
    }

    public function restore(User $user, CrmAccount $account): bool
    {
        // Reutilizamos la misma lógica que delete por simplicidad
        return $this->delete($user, $account);
    }

    public function forceDelete(User $user, CrmAccount $account): bool
    {
        // Si algún día necesitas hard delete, crea 'crm-accounts.force-destroy' y úsalo aquí.
        return false;
    }
}
