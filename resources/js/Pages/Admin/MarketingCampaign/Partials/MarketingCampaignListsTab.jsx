import React, { useMemo } from 'react';
import { usePage } from '@inertiajs/react';

//Components:
import TableUsers from '@/Components/TableUsers';

//Hooks:
import { useTranslation } from '@/Hooks/useTranslation';

export default function MarketingCampaignMembersTab({ 
    users: usersProp = null, 
    rows: rowsProp = null,
    tableId = 'tblMarketingCampaignMembers', 
    indexRoute = '', 
    indexParams = undefined, 
    filteredDataRoute = '', 
    entityName = 'users',
    userEditCompanyId = null           
}){
    const __ = useTranslation();
    const pageProps = usePage()?.props || {};

    const users = usersProp ?? pageProps.users ?? null;


    return (
        <div>

        </div>
    );
}