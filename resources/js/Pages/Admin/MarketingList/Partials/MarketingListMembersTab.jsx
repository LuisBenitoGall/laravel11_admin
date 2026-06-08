import React, { useMemo } from 'react';
import { Link, usePage } from '@inertiajs/react';

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

    const columns = useMemo(() => [
        { key: 'name',        label: __('nombre'),         sort: true,  filter: 'text', class_th: '', class_td: '', placeholder: __('nombre_filtrar') },
        { key: 'email',       label: __('email'),           sort: true,  filter: 'text', class_th: '', class_td: '', placeholder: __('email_filtrar') },
        { key: 'other_emails',label: __('otros_emails'),    sort: false, filter: 'text', class_th: '', class_td: '', placeholder: __('otros_emails_filtrar'), exportValue: (v) => Array.isArray(v) ? v.filter(Boolean).join('; ') : (v ?? '') },
        { key: 'phones',      label: __('telefonos'),       sort: true,  filter: 'text', class_th: '', class_td: '', placeholder: __('telefonos_filtrar'),    exportValue: (v) => Array.isArray(v) ? v.map(p => p.e164).filter(Boolean).join('; ') : (v ?? '') },
        { key: 'position',    label: __('cargo'),           sort: false, filter: 'text', class_th: '', class_td: '' },
        {
            key: 'accounts',
            label: __('cuentas'),
            sort: false,
            filter: 'text',
            class_th: '', class_td: '',
            placeholder: __('cuentas_filtrar'),
            exportValue: (v) => Array.isArray(v) ? v.map(a => a.name).join(', ') : (v ?? ''),
            render: ({ value }) => {
                if (!Array.isArray(value) || !value.length) return '—';
                return value.map((a, i) => (
                    <React.Fragment key={a.id}>
                        {i > 0 && ', '}
                        <Link href={route('crm-accounts.edit', a.id)} className="link-text">
                            {a.name}
                        </Link>
                    </React.Fragment>
                ));
            },
        },
        { key: 'avatar',     label: __('imagen'),    sort: false, filter: '', type: 'image', icon: 'user-tie', class_th: 'text-center', class_td: 'text-center', placeholder: '', defaultHidden: true, noExport: true },
        { key: 'created_at', label: __('fecha_alta'), sort: true,  filter: 'date', dateKeys: ['date_from', 'date_to'], filterOnly: true, noExport: true },
    ], [__]);

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
                columns={columns}
                deleteUserRoute="marketing-list-users.destroy"
                rowDeleteKey="mlu_id"
                disablePagination={false}
                userEditCompanyId={editCtxId}
                labelName={'miembros'}
            />
        </div>
    );
}