<?php

namespace App\Policies;

use App\Models\Document;
use App\Models\User;
use App\Support\CompanyContext;
use Illuminate\Auth\Access\HandlesAuthorization;

class DocumentPolicy
{
    use HandlesAuthorization;

    public function before(User $user, string $ability): ?bool
    {
        if (method_exists($user, 'hasRole') && $user->hasRole('Super Admin')) {
            return true;
        }

        return null;
    }

    public function viewAny(User $user): bool
    {
        if (! $this->hasCompanyContext()) {
            return false;
        }

        return $user->can('documents.viewAny');
    }

    public function view(User $user, Document $document): bool
    {
        if (! $this->sameCompany($document)) {
            return false;
        }

        return $user->can('documents.view');
    }

    public function create(User $user): bool
    {
        if (! $this->hasCompanyContext()) {
            return false;
        }

        return $user->can('documents.create');
    }

    public function update(User $user, Document $document): bool
    {
        if (! $this->sameCompany($document)) {
            return false;
        }

        return $user->can('documents.update');
    }

    public function delete(User $user, Document $document): bool
    {
        if (! $this->sameCompany($document)) {
            return false;
        }

        return $user->can('documents.destroy');
    }

    protected function hasCompanyContext(): bool
    {
        $ctx = app(CompanyContext::class);

        return (int) $ctx->id() > 0;
    }

    protected function sameCompany(Document $document): bool
    {
        $ctx = app(CompanyContext::class);
        $currentCompanyId = (int) $ctx->id();

        if ($currentCompanyId <= 0) {
            return false;
        }

        return (int) $document->company_id === (int) $currentCompanyId;
    }
}
