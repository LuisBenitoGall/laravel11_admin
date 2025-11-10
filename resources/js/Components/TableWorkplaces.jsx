// TableWorkplaces.jsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { OverlayTrigger, Table, Tooltip } from 'react-bootstrap';

import ColumnFilter from '@/Components/ColumnFilter';
import FilterRow from '@/Components/FilterRow';
import RecordsPerPage from '@/Components/RecordsPerPage';
import TableExporter from '@/Components/TableExporter';
import StatusButton from '@/Components/StatusButton';
import { Pagination } from '@/Components/Pagination';
import { SortControl } from '@/Components/SortControl';

import { useTableManagement } from '@/Hooks/useTableManagement';
import { useTranslation } from '@/Hooks/useTranslation';
import renderCellContent from '@/Utils/renderCellContent.jsx';

export default function TableWorkplaces({
    company,                          // objeto company
    side = 'customers',               // 'customers' | 'providers'
    tableId = 'tblWorkplaces',
    queryParams: rawQueryParams = {},
    columns: columnsProp = null,
    entityName = 'workplaces',
    indexRoute = null,                // 'customers.edit' | 'providers.edit' (solo para construir reloadUrl en acciones)
    indexParams = null,               // id de la company
    destroyRoute = 'workplaces.destroy',
    fetchRoute = 'customers.workplaces.index',      // endpoint que devuelve el listado paginado
    filteredDataRoute = 'customers.workplaces.data',// endpoint para export
    filteredDataKey = 'workplaces',
    labelName = 'centros_trabajo',
    availableLocales = []
}) {
    const __ = useTranslation();
    const baseQuery = typeof rawQueryParams === 'object' && rawQueryParams !== null ? rawQueryParams : {};

    // Estado local de datos
    const [rows, setRows] = useState([]);
    const [meta, setMeta] = useState(null);
    const [loading, setLoading] = useState(false);

    // Helper “Municipio (Provincia)”
    const formatTownProvince = useCallback((row) => {
        const townName =
        row?.town?.name ??
        row?.town_name ??
        row?.town ??
        '';
        const provinceName =
        row?.town?.province?.name ??
        row?.province?.name ??
        row?.province_name ??
        '';
        if (townName && provinceName) return `${townName} (${provinceName})`;
        return townName || provinceName || '';
    }, []);

    const defaultColumns = useMemo(() => ([
        {
        key: 'name',
        label: __('nombre'),
        sort: true,
        filter: 'text',
        class_th: '',
        class_td: '',
        placeholder: __('nombre_filtrar')
        },
        {
        key: 'address',
        label: __('direccion'),
        sort: true,
        filter: 'text',
        class_th: '',
        class_td: '',
        placeholder: __('direccion_filtrar')
        },
        {
        key: 'cp',
        label: __('cp'),
        sort: true,
        filter: 'text',
        class_th: 'text-center',
        class_td: 'text-center',
        placeholder: __('cp_filtrar')
        },
        {
        key: 'town_province',
        label: __('poblacion'),
        sort: true,         // si tu backend soporta ordenación por join/compute
        filter: 'text',
        class_th: '',
        class_td: '',
        placeholder: __('municipio_filtrar'),
        render: ({ rowData }) => formatTownProvince(rowData)
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
        }
    ]), [__, formatTownProvince]);

    const columns = Array.isArray(columnsProp) && columnsProp.length ? columnsProp : defaultColumns;

    // Hook de gestión de tabla en modo "manualFiltering"
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
        filteredData,     // se usará para Exporter
        handleDelete,
        queryParams       // params locales que va acumulando FilterRow
    } = useTableManagement({
        table: tableId,
        allColumnKeys: columns.map(col => col.key),
        entityName,
        indexRoute: null,                    // no queremos navegación, todo es AJAX
        destroyRoute,
        filteredDataRoute,
        filteredDataKey,
        labelName,
        queryParams: baseQuery,
        routeParams: indexParams,
        manualFiltering: true,               // << clave: evita router.get
        onManualFilter: (params) => {
            // cuando se cambian filtros, recarga con orden y paginación actuales
            fetchList({
                ...params,
                sort_field: sortParams.sort_field,
                sort_direction: sortParams.sort_direction,
                per_page: perPage,
                page: 1
            });
        }
    });

    // Carga remota
    const fetchList = useCallback(async (params = {}) => {
    if (!company?.id) return;
    setLoading(true);
    try {
        const { data } = await axios.get(
        route(fetchRoute, [company.id]),   // workplaces/{company}
        { params }
        );
        const payload = data?.[filteredDataKey] ?? data;

        if (Array.isArray(payload?.data)) {
        setRows(payload.data);
        setMeta(payload.meta ?? null);
        } else if (Array.isArray(payload)) {
        setRows(payload);
        setMeta(null);
        } else if (Array.isArray(data?.data)) {
        setRows(data.data);
        setMeta(data.meta ?? null);
        } else {
        setRows([]);
        setMeta(null);
        }
    } finally {
        setLoading(false);
    }
    }, [company?.id, fetchRoute, filteredDataKey]);

    // Primera carga
    useEffect(() => {
        fetchList({
        ...baseQuery,
        page: 1,
        per_page: baseQuery.per_page || 10
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [company?.id, side]);

    // Reaccionar a cambios de ordenación
    useEffect(() => {
        // cuando cambia el orden, recarga con filtros actuales
        fetchList({
        ...queryParams,
        sort_field: sortParams.sort_field,
        sort_direction: sortParams.sort_direction,
        per_page: perPage,
        page: 1
        });
    }, [sortParams.sort_field, sortParams.sort_direction]); // eslint-disable-line react-hooks/exhaustive-deps

    // Reaccionar a cambios de perPage
    useEffect(() => {
        fetchList({
        ...queryParams,
        sort_field: sortParams.sort_field,
        sort_direction: sortParams.sort_direction,
        per_page: perPage,
        page: 1
        });
    }, [perPage]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div>
            <Head title={__('centros_trabajo')} />

            <div className="row">
                <div className="controls d-flex align-items-center">
                    <ColumnFilter
                        columns={columns}
                        visibleColumns={visibleColumns}
                        toggleColumn={toggleColumnVisibility}
                    />
                    <RecordsPerPage perPage={perPage} setPerPage={setPerPage} />
                    <TableExporter
                        filename={__(labelName)}
                        columns={columns}
                        fetchData={(params) =>
                        // el exporter llama con params; pedimos al hook su util,
                        // que ya apunta a filteredDataRoute y devolverá [] con la clave correcta
                        filteredData(params)
                        }
                    />
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
                        indexRoute={null}
                        indexParams={null}
                    />

                    <tbody>
                        {rows.map(wp => (
                        <tr key={wp.id}>
                            {columns.map(col => (
                            <td
                                key={col.key}
                                className={`${col.class_td ?? ''} ${visibleColumns.includes(col.key) ? '' : 'd-none'}`.trim()}
                            >
                                {renderCellContent(wp[col.key], col, wp)}
                            </td>
                            ))}

                            <td className="text-end">
                                <OverlayTrigger
                                    key={'status-' + wp.id}
                                    placement="top"
                                    overlay={<Tooltip className="ttp-top">{wp.status == 1 ? __('activo') : __('inactivo')}</Tooltip>}
                                >
                                    <StatusButton
                                    status={wp.status}
                                    id={wp.id}
                                    updateRoute={`${entityName}.status`} // 'workplaces.status'
                                    // seguimos en la misma vista de edición; si tienes que recargar, llama fetchList después de actualizar
                                    reloadUrl={indexRoute && indexParams ? route(indexRoute, indexParams) : undefined}
                                    reloadResource={entityName}
                                    onUpdated={() => {
                                        // si tu StatusButton permite callback, refrescamos lista
                                        fetchList({
                                        ...queryParams,
                                        sort_field: sortParams.sort_field,
                                        sort_direction: sortParams.sort_direction,
                                        per_page: perPage,
                                        page: meta?.current_page || 1
                                        });
                                    }}
                                    />
                                </OverlayTrigger>

                            <OverlayTrigger
                                key={'edit-' + wp.id}
                                placement="top"
                                overlay={<Tooltip className="ttp-top">{__('editar')}</Tooltip>}
                            >
                                <a href={route(`${entityName}.edit`, wp.id)} className="btn btn-sm btn-info ms-1">
                                <i className="la la-edit" />
                                </a>
                            </OverlayTrigger>

                            <OverlayTrigger
                                key={'delete-' + wp.id}
                                placement="top"
                                overlay={<Tooltip className="ttp-top">{__('eliminar')}</Tooltip>}
                            >
                                <a
                                href={route(`${entityName}.destroy`, wp.id)}
                                className="btn btn-sm btn-danger ms-1"
                                title={__('eliminar')}
                                onClick={(e) => {
                                    e.preventDefault();
                                    // usa handleDelete del hook que ya lanza SweetAlert y luego refresca
                                    handleDelete(wp.id, () => {
                                    fetchList({
                                        ...queryParams,
                                        sort_field: sortParams.sort_field,
                                        sort_direction: sortParams.sort_direction,
                                        per_page: perPage,
                                        page: meta?.current_page || 1
                                    });
                                    });
                                }}
                                >
                                <i className="la la-trash" />
                                </a>
                            </OverlayTrigger>
                        </td>
                    </tr>
                ))}

                {!loading && rows.length === 0 && (
                <tr>
                    <td colSpan={columns.length + 1} className="text-center py-4">
                    {__('sin_resultados')}
                    </td>
                </tr>
                )}

                {loading && (
                <tr>
                    <td colSpan={columns.length + 1} className="text-center py-4">
                    {__('cargando')}…
                    </td>
                </tr>
                )}
                    </tbody>
                </Table>
            </div>

            { meta && (
                <Pagination
                    links={meta.links}
                    totalRecords={meta.total}
                    currentPage={meta.current_page}
                    perPage={meta.per_page}
                    onPageChange={(page) => {
                        fetchList({
                        ...queryParams,
                        sort_field: sortParams.sort_field,
                        sort_direction: sortParams.sort_direction,
                        per_page: perPage,
                        page
                        });
                    }}
                />
            )}
        </div>
    );
}
