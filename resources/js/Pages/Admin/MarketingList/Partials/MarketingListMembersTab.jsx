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

    const users = usersProp ?? pageProps.users ?? null;

    const rows = useMemo(() => {
        // 1) si nos pasan rows ya formateadas, usamos eso
        if (Array.isArray(rowsProp)) return rowsProp;

        // 2) si vienen desde el backend como "rows" en la página
        if (Array.isArray(pageProps.rows)) return pageProps.rows;

        // 3) si no, intentamos derivarlas del paginator "users"
        const source =
            Array.isArray(users?.data)
                ? users.data
                : Array.isArray(users)
                    ? users
                    : [];

        return source.map(u => {
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
    }, [rowsProp, pageProps.rows, users]);

    const editCtxId = userEditCompanyId;

    return (
        <div>
            <TableUsers
                rows={rows}
                users={users}
                tableId={tableId}
                queryParams={pageProps.queryParams ?? {}}
                indexRoute={indexRoute}
                indexParams={indexParams}
                filteredDataRoute={filteredDataRoute}
                entityName={entityName}
                destroyRoute="marketing-list-users.destroy"   
                rowDeleteKey="mlu_id"    
                disablePagination={false}
                userEditCompanyId={editCtxId}
                labelName={'miembros'}
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