import React, { useMemo } from 'react';
import { usePage } from '@inertiajs/react';
import TableUsers from '@/Components/TableUsers';
import { useTranslation } from '@/Hooks/useTranslation';

export default function CompanyUsersTab({ 
    users: usersProp = null, 
    rows: rowsProp = null,
    tableId = 'tblCompanyUsers', 
    indexRoute = '', 
    indexParams = undefined, 
    filteredDataRoute = '', 
    entityName = 'users',
    userEditCompanyId = null           
}){
    const __ = useTranslation();
    const pageProps = usePage()?.props || {};

    // fallback por si alguien se olvida de pasarlo
    const editCtxId = userEditCompanyId
        ?? pageProps?.crm_account?.linked_company_id
        ?? pageProps?.company?.id
        ?? null;

    const users = usersProp ?? pageProps.users ?? pageProps.company?.users ?? { data: [], meta: { links: [], total: 0, current_page: 1, per_page: 10 } };

    const rows = useMemo(() => {
        if (Array.isArray(rowsProp)) return rowsProp;
        if (Array.isArray(pageProps.rows)) return pageProps.rows;

        const list = Array.isArray(users?.data) ? users.data : Array.isArray(users) ? users : [];
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
    }, [rowsProp, pageProps.rows, users]);

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
                disablePagination={true}
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
