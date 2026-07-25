<?php

namespace App\Services;

use App\Models\CrmContact;
use App\Models\UserCompany;

class PositionSyncService
{
    /**
     * Refleja el cargo/departamento de un contacto CRM en el vínculo user_companies
     * de la empresa a la que está enlazada su cuenta CRM (crm_accounts.linked_company_id).
     */
    public function syncFromCrmContact(CrmContact $contact): void
    {
        $linkedCompanyId = $contact->account?->linked_company_id;

        if (! $linkedCompanyId) {
            return;
        }

        $userCompany = UserCompany::firstOrNew([
            'user_id'    => $contact->user_id,
            'company_id' => $linkedCompanyId,
        ]);

        if ($userCompany->exists
            && $userCompany->position === $contact->position
            && $userCompany->department === $contact->department) {
            return;
        }

        $userCompany->position   = $contact->position;
        $userCompany->department = $contact->department;
        $userCompany->save();
    }

    /**
     * Refleja el cargo/departamento de un vínculo user_companies en los contactos CRM
     * del mismo usuario cuya cuenta CRM esté enlazada a esa misma empresa.
     */
    public function syncFromUserCompany(UserCompany $userCompany): void
    {
        CrmContact::query()
            ->where('user_id', $userCompany->user_id)
            ->whereHas('account', fn ($q) => $q->where('linked_company_id', $userCompany->company_id))
            ->get()
            ->each(function (CrmContact $contact) use ($userCompany) {
                if ($contact->position === $userCompany->position
                    && $contact->department === $userCompany->department) {
                    return;
                }

                $contact->position   = $userCompany->position;
                $contact->department = $userCompany->department;
                $contact->save();
            });
    }
}
