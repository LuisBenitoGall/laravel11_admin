import React, { useMemo } from 'react';
import { usePage } from '@inertiajs/react';

//Components:
import TableUsers from '@/Components/TableUsers';

//Hooks:
import { useTranslation } from '@/Hooks/useTranslation';

export default function CompanyUsersTab({ 
    users: usersProp = null, 
    rows: rowsProp = null,
    tableId = 'tblCompanyUsers', 
    indexRoute = '', 
    indexParams = undefined, 
    filteredDataRoute = '', 
    entityName = 'users' 
}){
	const __ = useTranslation();
	const pageProps = usePage()?.props || {};

	// Prefer explicit prop, then page props, then company.users
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
				users={users}                    // opcional: por si TableUsers necesita paginación/metadatos
                tableId={tableId}
                queryParams={pageProps.queryParams ?? {}}
                indexRoute={indexRoute}
                indexParams={indexParams}
                filteredDataRoute={filteredDataRoute}
                entityName={entityName}
                i18n={{                         // evita acoplar TableUsers a hooks/globales
                    name: __('nombre'),
                    position: __('puesto'),
                    phone: __('telefono'),
                    whatsapp: 'WhatsApp',
                    others: __('otros'),
                    email: 'Email',
                    none: '—',
                    moreSuffix: __('mas'),        // se usará como “X más”
                }}
			/>
		</div>
	);
}

