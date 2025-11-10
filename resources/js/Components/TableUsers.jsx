import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { OverlayTrigger, Table, Tooltip } from 'react-bootstrap';

// Components
import ColumnFilter from '@/Components/ColumnFilter';
import FilterRow from '@/Components/FilterRow';
import RecordsPerPage from '@/Components/RecordsPerPage';
import TableExporter from '@/Components/TableExporter';
import StatusButton from '@/Components/StatusButton';
import { Pagination } from '@/Components/Pagination';
import { SortControl } from '@/Components/SortControl';

// Hooks & Utils
import { useTableManagement } from '@/Hooks/useTableManagement';
import { useTranslation } from '@/Hooks/useTranslation';
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
    availableLocales = []
}) {
    const __ = useTranslation();
    const queryParams = (typeof rawQueryParams === 'object' && rawQueryParams !== null) ? rawQueryParams : {};

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

    // Normaliza filas y meta:
    // 1) si llega rowsProp desde backend, lo usamos
    // 2) si no, caemos al users paginator/array
    const rows = Array.isArray(rowsProp)
    ? rowsProp
    : (Array.isArray(users?.data)
        ? users.data
        : (Array.isArray(users) ? users : [])
      );

    const meta = users && typeof users === 'object' && 'meta' in users ? users.meta : null;

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
    {
      key: 'phones',
      label: __('telefonos'),
      sort: true,
      filter: 'text',
      class_th: '',
      class_td: '',
      placeholder: __('telefonos_filtrar'),
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
        handleDelete
    } = useTableManagement({
        table: tableId,
        allColumnKeys: columns.map(col => col.key),
        entityName,
        indexRoute,
        routeParams: indexParams,
        destroyRoute,
        filteredDataRoute,
        labelName,
        queryParams
    });

    return (
        <div>
            <Head title={__('usuarios')} />

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

            <div className="table-responsive">
                <Table className="table table-nowrap table-striped align-middle mb-0" id={tableId}>
                    <thead>
                        <tr>
                        {columns.map(col => (
                            <th
                            key={col.key}
                            className={`${col.class_th ?? ''} ${visibleColumns.includes(col.key) ? '' : 'd-none'}`.trim()}
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
                        indexRoute={indexRoute}
                        indexParams={indexParams}
                    />

                    <tbody>
                        {rows.map(user => (
                        <tr key={user.id}>
                            {columns.map(col => (
                            <td
                                key={col.key}
                                className={`${col.class_td ?? ''} ${visibleColumns.includes(col.key) ? '' : 'd-none'}`.trim()}
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
                                    <Link href={route(`${entityName}.edit`, user.id)} className="btn btn-sm btn-info ms-1">
                                        <i className="la la-edit" />
                                    </Link>
                                </OverlayTrigger>

                                <OverlayTrigger
                                    key={'delete-' + user.id}
                                    placement="top"
                                    overlay={<Tooltip className="ttp-top">{__('eliminar')}</Tooltip>}
                                >
                                    <a
                                    href={route(`${entityName}.destroy`, user.id)}
                                    className="btn btn-sm btn-danger ms-1"
                                    title={__('eliminar')}
                                    >
                                        <i className="la la-trash" />
                                    </a>
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

            {meta && (
                <Pagination
                links={meta.links}
                totalRecords={meta.total}
                currentPage={meta.current_page}
                perPage={meta.per_page}
                onPageChange={page => {
                    router.get(
                    route(indexRoute, indexParams),
                    {
                        ...queryParams,
                        page,
                        per_page: perPage,
                        sort_field: sortParams.sort_field,
                        sort_direction: sortParams.sort_direction
                    },
                    { preserveState: true }
                    );
                }}
                />
            )}
        </div>
    );
}
