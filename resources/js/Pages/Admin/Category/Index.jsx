import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

import ColumnFilter from '@/Components/ColumnFilter';
import FilterRow from '@/Components/FilterRow';
import { Pagination } from '@/Components/Pagination';
import RecordsPerPage from '@/Components/RecordsPerPage';
import { SortControl } from '@/Components/SortControl';
import StatusButton from '@/Components/StatusButton';
import TableExporter from '@/Components/TableExporter';

import { useTableManagement } from '@/Hooks/useTableManagement';
import { useTranslation } from '@/Hooks/useTranslation';

import renderCellContent from '@/Utils/renderCellContent.jsx';

export default function Index({
    auth,
    session,
    title,
    subtitle,
    environment,                 // sectors | customers | providers | crm
    filters = {},
    categories,
    queryParams: rawQueryParams = {},
    availableLocales
}) {
    const queryParams = typeof rawQueryParams === 'object' && rawQueryParams !== null ? rawQueryParams : {};
    const __ = useTranslation();

    // Columnas
    const columns = [
        {
            key: 'name',
            label: __('categoria'),
            sort: true,
            filter: 'text',
            type: 'link',
            link: 'categories.edit',
            routeParams: [environment],                 // <- usar environment
            placeholder: __('categorias_filtrar')
        },
        {
            key: 'depth',
            label: __('nivel'),
            sort: true,
            filter: 'number',
            class_th: 'text-center',
            class_td: 'text-center',
            placeholder: __('nivel_filtrar')
        },
        {
            key: 'position',
            label: __('posicion'),
            sort: true,
            filter: 'number',
            class_th: 'text-center',
            class_td: 'text-center',
            placeholder: __('posicion_filtrar')
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
    ];

    // Soporta paginado o array plano
    const rows = Array.isArray(categories?.data)
        ? categories.data
        : (Array.isArray(categories) ? categories : []);

    const meta = categories?.meta ?? null;
    const safeTotal = meta?.total ?? rows.length;
    const safeCurrentPage = meta?.current_page ?? 1;
    const safePerPage = meta?.per_page ?? rows.length;
    const safeLinks = meta?.links ?? [];

    // Gestión tabla
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
        table: 'tblCategories',
        allColumnKeys: columns.map(col => col.key),
        entityName: 'categories',
        indexRoute: 'categories.index',
        destroyRoute: 'categories.destroy',
        filteredDataRoute: 'categories.filtered-data',
        routeParams: [environment],                    // <- clave para Ziggy
        labelName: 'categoria',
        queryParams
    });

    // Acciones
    const actions = [];
    if (permissions?.['companies.edit']) {
        actions.push({
            text: __('categoria_nueva'),
            icon: 'la-plus',
            url: 'categories.create',
            modal: false,
            params: [environment]
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
                        <RecordsPerPage perPage={perPage} setPerPage={setPerPage} />
                        <TableExporter
                            filename={__('categorias')}
                            columns={columns}
                            fetchData={filteredData}
                        />
                    </div>
                </div>

                {/* Tabla */}
                <div className="table-responsive">
                    <table className="table table-nowrap table-striped align-middle mb-0" id="tblCategories">
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
                        />

                        <tbody>
                            {rows.map(category => (
                                <tr key={`category-${category.id}`}>
                                    {columns.map(col => (
                                        <td
                                            key={col.key}
                                            className={`${col.class_td ?? ''} ${visibleColumns.includes(col.key) ? '' : 'd-none'}`.trim()}
                                        >
                                            {renderCellContent(
                                                category[col.key],
                                                col,
                                                { ...category, __routeParams: [environment] } // <- env
                                            )}
                                        </td>
                                    ))}

                                    {/* Acciones */}
                                    <td className="text-end">
                                        {/* Estado */}
                                        {permissions?.['categories.edit'] && (
                                            <OverlayTrigger
                                                key={`status-${category.id}`}
                                                placement="top"
                                                overlay={
                                                    <Tooltip className="ttp-top">
                                                        {category.status == 1 ? __('categoria_activa') : __('categoria_inactiva')}
                                                    </Tooltip>
                                                }
                                            >
                                                <span>
                                                    <StatusButton
                                                        status={category.status}
                                                        id={category.id}
                                                        updateRoute="categories.toggle"
                                                        updateRouteParams={[environment, category.id]} // <- env
                                                        reloadUrl={route('categories.index', environment)} // <- env
                                                        reloadResource="categories"
                                                    />
                                                </span>
                                            </OverlayTrigger>
                                        )}

                                        {/* Editar */}
                                        {permissions?.['categories.edit'] && (
                                            <OverlayTrigger
                                                key={`edit-${category.id}`}
                                                placement="top"
                                                overlay={<Tooltip className="ttp-top">{__('editar')}</Tooltip>}
                                            >
                                                <Link
                                                    href={route('categories.edit', [environment, category.id])} // <- env
                                                    className="btn btn-sm btn-info ms-1"
                                                >
                                                    <i className="la la-edit" />
                                                </Link>
                                            </OverlayTrigger>
                                        )}

                                        {/* Eliminar */}
                                        {permissions?.['categories.destroy'] && (
                                            <OverlayTrigger
                                                key={`delete-${category.id}`}
                                                placement="top"
                                                overlay={<Tooltip className="ttp-top">{__('eliminar')}</Tooltip>}
                                            >
                                                <span>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-danger ms-1"
                                                        onClick={() => handleDelete(category.id, [environment])} // <- env
                                                    >
                                                        <i className="la la-trash" />
                                                    </button>
                                                </span>
                                            </OverlayTrigger>
                                        )}
                                    </td>
                                </tr>
                            ))}

                            {rows.length === 0 && (
                                <tr>
                                    <td colSpan={columns.length + 1} className="text-center py-5">
                                        {__('sin_resultados')}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Paginación: solo si viene meta */}
                {meta && (
                    <Pagination
                        links={safeLinks}
                        totalRecords={safeTotal}
                        currentPage={safeCurrentPage}
                        perPage={safePerPage}
                        onPageChange={(page) => {
                            router.get(
                                route('categories.index', environment), // <- env
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
        </AdminAuthenticatedLayout>
    );
}
