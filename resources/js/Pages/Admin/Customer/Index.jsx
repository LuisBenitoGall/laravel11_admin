import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { OverlayTrigger, Table, Tooltip } from 'react-bootstrap';
import 'react-datepicker/dist/react-datepicker.css';

//Components:
import ActiveFiltersLegend from '@/Components/ActiveFiltersLegend';
import AdHocFiltersDropdown from '@/Components/AdHocFiltersDropdown';
import ColumnFilter from '@/Components/ColumnFilter';
import FilterRow from '@/Components/FilterRow';
import { Pagination } from '@/Components/Pagination';
import RecordsPerPage from '@/Components/RecordsPerPage';
import { SortControl } from '@/Components/SortControl';
import SpinnerInline from '@/Components/SpinnerInline';
import StatusButton from '@/Components/StatusButton';
import TableExporter from '@/Components/TableExporter';

//Hooks:
import { useInertiaLoading } from '@/Hooks/useInertiaLoading';
import { useSweetAlert } from '@/Hooks/useSweetAlert';
import { useTableManagement } from '@/Hooks/useTableManagement';
import { useTranslation } from '@/Hooks/useTranslation';

//Utils:
import renderCellContent from '@/Utils/renderCellContent.jsx';

const EMPTY = Object.freeze([]);
const EMPTY_OBJ = Object.freeze({});

export default function Index({
    auth,
    session,
    title,
    subtitle,
    companies,
    queryParams: rawQueryParams = {},
    availableLocales
}) {
    const __ = useTranslation();
    const { props } = usePage();
    const queryParams = (rawQueryParams && typeof rawQueryParams === 'object') ? rawQueryParams : EMPTY_OBJ;
    const adhocFilters = props.adhocFilters ?? EMPTY;
    const indexRouteName = 'customers.index';
    const indexRouteParams = {};
    const { loading } = useInertiaLoading();
    const legendItems = props.activeFiltersLegend || [];
    const hasActiveFilters = legendItems.length > 0;
    const { showConfirm } = useSweetAlert();

    // Columnas:
    const columns = [
        // 👇 OJO: esto debe ir a customers.edit, no companies.edit
        { key: 'name', label: __('razon_social'), sort: true, filter: 'text', type: 'link', link: 'customers.edit', class_th: '', class_td: '', placeholder: __('razon_social_filtrar') },
        { key: 'tradename', label: __('nombre_comercial'), sort: true, filter: 'text', class_th: '', class_td: '', placeholder: __('nombre_comercial_filtrar') },
        { key: 'created_at', label: __('fecha_alta'), sort: true, filter: 'date', class_th: 'text-center', class_td: 'text-end', placeholder: __('fecha_alta'), dateKeys: ['date_from', 'date_to'] },
        { key: 'nif', label: __('nif'), sort: true, filter: 'text', class_th: '', class_td: '', placeholder: __('nif_filtrar') },
        { key: 'logo', label: __('logo'), sort: false, filter: '', type: 'image', icon: 'building', class_th: 'text-center', class_td: 'text-center', placeholder: '' }
    ];

    const {
        permissions,
        sortParams,
        perPage,
        setPerPage,
        visibleColumns,
        toggleColumnVisibility,
        SearchFieldChanged,
        sortChanged,
        filteredData,
        handleDelete
    } = useTableManagement({
        table: 'tblCustomers',
        allColumnKeys: columns.map(col => col.key),
        entityName: 'customers',
        indexRoute: 'customers.index',
        destroyRoute: 'customers.destroy',
        filteredDataRoute: 'customers.filtered-data',
        labelName: 'cliente',
        queryParams
    });

    // Acciones:
    const actions = [];
    if (permissions?.['customers.create']) {
        actions.push({
            text: __('cliente_nuevo'),
            icon: 'la-plus',
            url: 'customers.create',
            modal: false
        });

        actions.push({
            text: __('clientes_importar'),
            icon: 'la-file-import',
            url: 'customers.import',
            modal: false
        });
    }

    return (
        <AdminAuthenticatedLayout
            user={auth.user}
            title={title}
            subtitle={subtitle}
            actions={actions}
        >
            <Head title={title} />

            <div className="contents">
                {/* Controles */}
                <div className="row">
                    <div className="controls d-flex align-items-center">
                        <ColumnFilter
                            columns={columns}
                            visibleColumns={visibleColumns}
                            toggleColumn={toggleColumnVisibility}
                        />

                        {/* Filtros avanzados (Adhoc) */}
                        <AdHocFiltersDropdown
                            filters={adhocFilters}
                            routeName={indexRouteName}
                            routeParams={indexRouteParams}
                            queryParams={queryParams}
                        />

                        <RecordsPerPage perPage={perPage} setPerPage={setPerPage} />

                        <TableExporter
                            filename={__('clientes')}
                            columns={columns}
                            fetchData={filteredData}
                        />
                    </div>
                </div>

                <div className="d-flex justify-content-between align-items-center my-2">
                    <ActiveFiltersLegend
                        items={legendItems}
                        routeName={indexRouteName}
                        routeParams={indexRouteParams}
                    />
                    {hasActiveFilters && loading ? (
                        <SpinnerInline text={__('cargando') ?? 'Cargando…'} />
                    ) : null}
                </div>

                {/* Tabla */}
                <div className="table-responsive">
                    <Table className="table table-nowrap table-striped align-middle mb-0" id="tblCustomers">
                        <thead>
                            <tr>
                                {columns.map(col => (
                                    <th
                                        key={col.key}
                                        className={`${col.class_th ?? ''} ${visibleColumns.includes(col.key) ? '' : 'd-none'}`.trim()}
                                    >
                                        {/* 👇 NO vuelvas a traducir lo ya traducido */}
                                        {col.label}

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
                        />

                        <tbody>
                            {(companies?.data || []).map((company) => (
                                <tr key={`company-${company.id}`}>
                                    {columns.map(col => (
                                        <td
                                            key={col.key}
                                            className={`${col.class_td ?? ''} ${visibleColumns.includes(col.key) ? '' : 'd-none'}`.trim()}
                                        >
                                            {renderCellContent(company[col.key], col, company)}
                                        </td>
                                    ))}

                                    {/* Acciones */}
                                    <td className="text-end">
                                        {/* Estado */}
                                        {permissions?.['customers.edit'] && (
                                            <OverlayTrigger
                                                key={`status-${company.id}`}
                                                placement="top"
                                                overlay={
                                                    <Tooltip className="ttp-top">
                                                        {company.status == 1 ? __('cliente_activo') : __('cliente_inactivo')}
                                                    </Tooltip>
                                                }
                                            >
                                                <StatusButton
                                                    status={company.status}
                                                    id={company.id}
                                                    updateRoute='customers.status'
                                                    reloadUrl={route('customers.index')}
                                                    reloadResource="customers"
                                                />
                                            </OverlayTrigger>
                                        )}

                                        {/* Editar */}
                                        {permissions?.['customers.edit'] && (
                                            <OverlayTrigger
                                                key={`edit-${company.id}`}
                                                placement="top"
                                                overlay={<Tooltip className="ttp-top">{__('editar')}</Tooltip>}
                                            >
                                                <Link
                                                    href={route('customers.edit', company.id)}
                                                    className="btn btn-sm btn-info ms-1"
                                                >
                                                    <i className="la la-edit"></i>
                                                </Link>
                                            </OverlayTrigger>
                                        )}

                                        {/* Eliminar relación */}
                                        {permissions?.['customers.destroy'] && (
                                            <OverlayTrigger
                                                key={`delete-${company.id}`}
                                                placement="top"
                                                overlay={<Tooltip className="ttp-top">{__('eliminar')}</Tooltip>}
                                            >
                                                <span>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-danger ms-1"
                                                        onClick={() => handleDelete(company.relation_id)}
                                                    >
                                                        <i className="la la-trash"></i>
                                                    </button>
                                                </span>
                                            </OverlayTrigger>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>

                <Pagination
                    links={companies.meta.links}
                    totalRecords={companies.meta.total}
                    currentPage={companies.meta.current_page}
                    perPage={companies.meta.per_page}
                    onPageChange={(page) => {
                        router.get(route(indexRouteName, indexRouteParams), {
                            ...queryParams,
                            page,
                            per_page: perPage,
                            sort_field: sortParams.sort_field,
                            sort_direction: sortParams.sort_direction,
                        }, { preserveState: true });
                    }}
                />
            </div>
        </AdminAuthenticatedLayout>
    );
}
