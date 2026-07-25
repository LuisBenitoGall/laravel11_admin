<?php

namespace App\Observers;

use App\Models\CrmContact;
use App\Services\PositionSyncService;

class CrmContactObserver
{
    public function __construct(private PositionSyncService $positionSync)
    {
    }

    public function saved(CrmContact $contact): void
    {
        if ($contact->wasChanged(['position', 'department', 'crm_account_id'])) {
            $this->positionSync->syncFromCrmContact($contact);
        }
    }
}
