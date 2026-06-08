import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { OverlayTrigger, Table, Tooltip } from 'react-bootstrap';

// Components
import ColumnFilter from '@/Components/ColumnFilter';
import FilterRow from '@/Components/FilterRow';
import RecordsPerPage from '@/Components/RecordsPerPage';
import ShowRegister from '@/Components/ShowRegister/ShowRegister';
import ShowRegisterButton from '@/Components/ShowRegister/ShowRegisterButton';
import TableExporter from '@/Components/TableExporter';
import StatusButton from '@/Components/StatusButton';
import { Pagination } from '@/Components/Pagination';
import { SortControl } from '@/Components/SortControl';

// Hooks & Utils
import { useTableManagement } from '@/Hooks/useTableManagement';
import { useTranslation } from '@/Hooks/useTranslation';

//Partials:
import UserShowView from '@/Pages/Admin/User/Partials/UserShowView';

//Utils:
import renderCellContent from '@/Utils/renderCellContent.jsx';

export default function TableUsers({
    users,                              // puede ser array [] o paginator { data, meta }
    rows: rowsProp = null,              // NUEVO: dataset ya formateado desde backend
    tableId = 'tblUsers',
    queryParams: rawQueryParams = {},
    columns: columnsProp = null,
    entityName = 'users',
    indexRoute = 'customers.edit',      // ruta para recargar listado (Inertia)
    indexParams = null,                 // id u objeto de params para route()
    destroyRoute = 'user-companies.destroy',
    filteredDataRoute = false,
    labelName = 'usuarios',
    availableLocales = [],
	disablePagination = false,          // NUEVO: desactiva paginación para uso en tabs
    userEditCompanyId = null,
    /**
     * Ruta DELETE para desvincular la fila (pivot/lista/contacto). Si no se pasa, se usa `destroyRoute`.
     * Debe ser `undefined` por defecto: si tuviera el mismo valor por defecto que `destroyRoute`,
     * `deleteUserRoute ?? destroyRoute` ignoraría siempre `destroyRoute` (p. ej. marketing-list-users).
     */
    deleteUserRoute = undefined,
    rowDeleteKey = 'id',
    /** Id de la cuenta CRM desde la que se editó (para "Volver a la cuenta X"); se añade como ?from_account= */
    editFromAccountId = null,
}) {
    const __ = useTranslation();
    const queryParams = (typeof rawQueryParams === 'object' && rawQueryParams !== null) ? rawQueryParams : {};

    //Columna Show Register
    const [showId, setShowId] = useState(null);
    const [showPanelOpen, setShowPanelOpen] = useState(false);

    const handleShowRegister = (user) => {
        // Mismo criterio que el enlace "editar": user_id es el id del User cuando
        // id es el pivot/relation (p. ej. user_companies en CompanyUsersTab / crm-accounts).
        const showUserId = user.user_id ?? user.id;
        setShowId(showUserId);
        setShowPanelOpen(true);
    };

    const handleCloseShowPanel = () => {
        setShowPanelOpen(false);
        setShowId(null);
    };

    // Helper: formatea tooltip de teléfonos
    const phonesTooltip = (phones = []) => {
        if (!Array.isArray(phones) || phones.length === 0) return '';
        return phones.map(p => {
        const tag = p.is_primary ? '[P] ' : '';
        const wa  = p.is_whatsapp ? ' (WA)' : '';
        const lab = p.label ? ` • ${p.label}` : '';
        return `${tag}${p.e164}${wa}${lab}`;
        }).join('\n');
    };

    // Normaliza filas base desde props (sin hook todavía)
    const baseRows = Array.isArray(rowsProp)
    ? rowsProp
    : (Array.isArray(users?.data)
        ? users.data
        : (Array.isArray(users) ? users : [])
    );

    const hasServerRows = Array.isArray(rowsProp);
    const onlyProps = hasServerRows ? ['users', 'rows'] : ['users'];

    // Meta de paginación:
    // 1) Si viene en formato { data, meta } (Inertia transform por defecto)
    // 2) O en formato paginator clásico (total, per_page, current_page, links...)
    let meta = null;

    if (users && typeof users === 'object' && !Array.isArray(users)) {
        if ('meta' in users && users.meta) {
            // Formato { data, meta: {...}, links: [...] }
            meta = users.meta;

            // Por si los links vienen fuera
            if (!meta.links && Array.isArray(users.links)) {
                meta.links = users.links;
            }
        } else if ('total' in users && 'per_page' in users && 'current_page' in users) {
            // Formato paginator clásico de Laravel
            meta = {
                total: users.total,
                per_page: users.per_page,
                current_page: users.current_page,
                links: Array.isArray(users.links) ? users.links : [],
            };
        }
    }

    // Columnas por defecto. Añadimos render específico para "phones"
    const defaultColumns = [
    {
        key: 'name',
        label: __('nombre'),
        sort: true,
        filter: 'text',
        class_th: '',
        class_td: '',
        placeholder: __('nombre_filtrar'),
        // Si el backend ya nos pasó "name" unido, esto solo lo devuelve.
        // Si llega separado, renderCellContent recibirá rowData igualmente.
        render: ({ rowData, value }) => {
            if (value) return value;
            const parts = [rowData?.name ?? '', rowData?.surname ?? ''].filter(Boolean);
            return parts.join(' ').trim();
        }
    },
    {
        key: 'created_at',
        label: __('fecha_alta'),
        sort: true,
        filter: 'date',
        class_th: 'text-center',
        class_td: 'text-end',
        placeholder: __('fecha_alta'),
        dateKeys: ['date_from', 'date_to']
    },
    { key: 'email', label: __('email'), sort: true, filter: 'text', class_th: '', class_td: '', placeholder: __('email_filtrar') },
    { key: 'other_emails', label: __('otros_emails'), sort: false, filter: 'text', class_th: '', class_td: '', placeholder: __('otros_emails_filtrar'), exportValue: (v) => Array.isArray(v) ? v.filter(Boolean).join('; ') : (v ?? '') },
    {
      key: 'phones',
      label: __('telefonos'),
      sort: true,
      filter: 'text',
      class_th: '',
      class_td: '',
      placeholder: __('telefonos_filtrar'),
      exportValue: (v) => Array.isArray(v) ? v.map(p => p.e164).filter(Boolean).join('; ') : (v ?? ''),
      // Render muestra principal + badge con tooltip del resto
      render: ({ rowData, value }) => {
        const list = Array.isArray(value) ? value : [];
        const primary = list.find(p => p.is_primary) ?? list[0] ?? null;

        if (!primary) return '—';

        const othersCount = Math.max(list.length - 1, 0);
        const othersBadge = othersCount > 0 ? (
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip className="ttp-top" style={{ whiteSpace: 'pre-line' }}>{phonesTooltip(list)}</Tooltip>}
          >
            <span className="badge bg-secondary ms-2" style={{ cursor: 'help' }}>
              {othersCount} {__('mas')}
            </span>
          </OverlayTrigger>
        ) : null;

        return (
          <span>
            {primary.e164}
            {primary.is_whatsapp ? <i className="la la-whatsapp ms-2" aria-label="WhatsApp" /> : null}
            {othersBadge}
          </span>
        );
      }
    },
    { key: 'position', label: __('cargo'), sort: false, filter: 'text', class_th: '', class_td: '' },
    { key: 'avatar', label: __('imagen'), sort: false, filter: '', type: 'image', icon: 'user-tie', class_th: 'text-center', class_td: 'text-center', placeholder: '' }
    ];

    const columns = Array.isArray(columnsProp) && columnsProp.length ? columnsProp : defaultColumns;

    // Desvincular fila: override explícito (CRM, empresa, etc.) o `destroyRoute` (p. ej. listas marketing)
    const effectiveDestroyRoute = deleteUserRoute ?? destroyRoute;

    const defaultHiddenKeys = columns.filter(c => c.defaultHidden).map(c => c.key);

    const {
        permissions,
        sortParams,
        perPage,
        setPerPage,
        visibleColumns,
        setVisibleColumns,
        toggleColumnVisibility,
        SearchFieldChanged,
        sortChanged,
        filteredData,
        handleDelete,
        managedRows
    } = useTableManagement({
        table: tableId,
        allColumnKeys: columns.map(col => col.key),
        defaultHiddenKeys,
        entityName,
        indexRoute: disablePagination ? null : indexRoute,
        routeParams: indexParams,
        destroyRoute: effectiveDestroyRoute,
        filteredDataRoute,
        labelName,
        queryParams
    });

    // managedRows: filas actualizadas localmente tras filtrado/sort en tabs (sin navegación Inertia)
    const rows = managedRows !== null ? managedRows : baseRows;

    return (
        <div>
            <Head title={__('usuarios')} />

            {/* Controles */}
            <div className="row">
                <div className="controls d-flex align-items-center">
                    <ColumnFilter
                        columns={columns}
                        visibleColumns={visibleColumns}
                        toggleColumn={toggleColumnVisibility}
                    />
                    <RecordsPerPage perPage={perPage} setPerPage={setPerPage} />
                    <TableExporter filename={__(labelName)} columns={columns} fetchData={filteredData} />
                </div>
            </div>

            {/* Tabla */}
            <div className="table-responsive">
                <Table className="table table-nowrap table-striped align-middle mb-0" id={tableId}>
                    <thead>
                        <tr>
                            <th className="text-center first-column">
                                &nbsp;
                            </th>

                            {columns.map(col => (
                                <th
                                key={col.key}
                                className={`${col.class_th ?? ''} ${col.filterOnly || !visibleColumns.includes(col.key) ? 'd-none' : ''}`.trim()}
                                >
                                {__(col.label)}

                                {col.sort && (
                                    <SortControl
                                    name={col.key}
                                    sortable={true}
                                    sort_field={queryParams.sort_field}
                                    sort_direction={queryParams.sort_direction}
                                    sortChanged={sortChanged}
                                    />
                                )}
                                </th>
                            ))}

                        <th className="text-center">{__('acciones')}</th>
                        </tr>
                    </thead>

                    <FilterRow
                        columns={columns}
                        queryParams={queryParams}
                        visibleColumns={visibleColumns}
                        SearchFieldChanged={SearchFieldChanged}
                        indexRoute={disablePagination ? null : indexRoute}
                        indexParams={indexParams}
                        PrependColumns={1}
                    />

                    <tbody>
                        {rows.map(user => (
                        <tr key={user.id}>
                            {/* Columna "show" fija */}
                            <td className="text-center">
                                <ShowRegisterButton onClick={() => handleShowRegister(user)} />
                            </td>

                            {columns.map(col => (
                            <td
                                key={col.key}
                                className={`${col.class_td ?? ''} ${col.filterOnly || !visibleColumns.includes(col.key) ? 'd-none' : ''}`.trim()}
                            >
                                {/* renderCellContent maneja type, render y value */}
                                {renderCellContent(user[col.key], col, user)}
                            </td>
                            ))}

                            <td className="text-end">
                                {/* <OverlayTrigger
                                    key={'status-' + user.id}
                                    placement="top"
                                    overlay={<Tooltip className="ttp-top">{user.status == 1 ? __('usuario_activo') : __('usuario_inactivo')}</Tooltip>}
                                >
                                    <StatusButton
                                    status={user.status}
                                    id={user.id}
                                    updateRoute={`${entityName}.status`}
                                    reloadUrl={route(indexRoute, indexParams)}
                                    reloadResource={entityName}
                                    />
                                </OverlayTrigger> */}

                                <OverlayTrigger
                                    key={'edit-' + user.id}
                                    placement="top"
                                    overlay={<Tooltip className="ttp-top">{__('editar')}</Tooltip>}
                                >
                                    <Link
                                        href={(() => {
                                            const userId = user.user_id ?? user.id;
                                            const baseUrl = route(`${entityName}.edit`, userEditCompanyId != null ? [userId, userEditCompanyId] : [userId]);
                                            if (editFromAccountId != null && editFromAccountId !== '') {
                                                const sep = baseUrl.includes('?') ? '&' : '?';
                                                return `${baseUrl}${sep}from_account=${encodeURIComponent(editFromAccountId)}`;
                                            }
                                            return baseUrl;
                                        })()}
                                        className="btn btn-sm btn-info ms-1"
                                    >
                                        <i className="la la-edit" />
                                    </Link>
                                </OverlayTrigger>

                                <OverlayTrigger
                                    key={'delete-' + user.id}
                                    placement="top"
                                    overlay={<Tooltip className="ttp-top">{__('desvincular')}</Tooltip>}
                                >
                                    {/* <a
                                    href={route(`${entityName}.destroy`, user.id)}
                                    className="btn btn-sm btn-danger ms-1"
                                    title={__('eliminar')}
                                    >
                                        <i className="la la-trash" />
                                    </a> */}
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-danger ms-1"
                                        title={__('desvincular')}
                                        onClick={() => handleDelete(user[rowDeleteKey])}
                                    >
                                        <i className="la la-trash" />
                                    </button>
                                </OverlayTrigger>
                            </td>
                        </tr>
                        ))}

                        {rows.length === 0 && (
                        <tr>
                            <td colSpan={columns.length + 1} className="text-center py-4">
                            {__('sin_resultados')}
                            </td>
                        </tr>
                        )}
                    </tbody>
                </Table>
            </div>

            <ShowRegister
                id={showId}
                open={showPanelOpen}
                onClose={handleCloseShowPanel}
                routeName="users.show"        // tu ruta JSON
                title={__('usuario')}         // o lo que quieras
                ViewComponent={UserShowView}
            />

            {!disablePagination && meta && (
                <Pagination
                    links={meta.links}
                    totalRecords={meta.total}
                    currentPage={meta.current_page}
                    perPage={meta.per_page}
                    onPageChange={page => {
                        router.reload({
                            data: {
                                ...queryParams,
                                page,
                                per_page: perPage,
                                sort_field: sortParams.sort_field,
                                sort_direction: sortParams.sort_direction
                            },
                            only: onlyProps,          // 👈 ahora pide users (+ rows si existen)
                            preserveState: true,
                            preserveScroll: true
                        });
                    }}
                />
            )}
        </div>
    );
}
