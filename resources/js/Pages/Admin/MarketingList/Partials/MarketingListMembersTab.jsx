import React, { useMemo } from 'react';
import { usePage } from '@inertiajs/react';

//Components:
import TableUsers from '@/Components/TableUsers';

//Hooks:
import { useTranslation } from '@/Hooks/useTranslation';

export default function MarketingListMembersTab({ 
    users: usersProp = null, 
    rows: rowsProp = null,
    tableId = 'tblMarketingListMembers', 
    indexRoute = '', 
    indexParams = undefined, 
    filteredDataRoute = '', 
    entityName = 'users',
    userEditCompanyId = null           
}){
    const __ = useTranslation();
    const pageProps = usePage()?.props || {};

    const rows = useMemo(() => {
        if (Array.isArray(rowsProp)) return rowsProp;
        if (Array.isArray(pageProps.rows)) return pageProps.rows;

        const list = Array.isArray(usersProp?.data) ? usersProp.data : Array.isArray(usersProp) ? usersProp : [];
        return list.map(u => {
        const phones = Array.isArray(u.phones) ? u.phones : [];
        const primary = phones.find(p => p.is_primary) ?? phones[0] ?? null;
        return {
            id: u.id,
            name: [u.name, u.surname].filter(Boolean).join(' '),
            position: u.position ?? null,
            email: u.email ?? null,
            phone_primary: primary?.e164 ?? null,
            whatsapp: Boolean(primary?.is_whatsapp),
            phones_count: phones.length,
            phones: phones.map(p => ({
            e164: p.e164,
            type: p.type,
            label: p.label,
            is_primary: !!p.is_primary,
            is_whatsapp: !!p.is_whatsapp,
            })),
        };
        });
    }, [rowsProp, pageProps.rows, usersProp]);

    const editCtxId = userEditCompanyId;

    return (
        <div>
            <TableUsers
                rows={rows}
                users={usersProp}
                tableId={tableId}
                queryParams={pageProps.queryParams ?? {}}
                indexRoute={indexRoute}
                indexParams={indexParams}
                filteredDataRoute={filteredDataRoute}
                entityName={entityName}
                disablePagination={false}
                userEditCompanyId={editCtxId}
                i18n={{
                    name: __('nombre'),
                    position: __('puesto'),
                    phone: __('telefono'),
                    whatsapp: 'WhatsApp',
                    others: __('otros'),
                    email: 'Email',
                    none: '—',
                    moreSuffix: __('mas')
                }}
            />
        </div>
    );
}