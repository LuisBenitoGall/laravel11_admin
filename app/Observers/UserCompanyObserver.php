<?php

namespace App\Observers;

use App\Models\UserCompany;
use App\Services\PositionSyncService;

class UserCompanyObserver
{
    public function __construct(private PositionSyncService $positionSync)
    {
    }

    public function saved(UserCompany $userCompany): void
    {
        if ($userCompany->wasChanged(['position', 'department'])) {
            $this->positionSync->syncFromUserCompany($userCompany);
        }
    }
}
