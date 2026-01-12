import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { OverlayTrigger, Table, Tooltip } from 'react-bootstrap';
import axios from 'axios';

//Components:
import ActiveFiltersLegend from '@/Components/ActiveFiltersLegend';
import AdHocFiltersDropdown from '@/Components/AdHocFiltersDropdown';
import ColumnFilter from '@/Components/ColumnFilter';
import FilterRow from '@/Components/FilterRow';
import { Pagination } from '@/Components/Pagination';
import RecordsPerPage from '@/Components/RecordsPerPage';
import ShowRegister from '@/Components/ShowRegister/ShowRegister';
import ShowRegisterButton from '@/Components/ShowRegister/ShowRegisterButton';
import { SortControl } from '@/Components/SortControl';
import SpinnerInline from '@/Components/SpinnerInline';
import StatusButton from '@/Components/StatusButton';
import TableExporter from '@/Components/TableExporter';

//Hooks:
import { useInertiaLoading } from '@/Hooks/useInertiaLoading';
import { useSweetAlert } from '@/Hooks/useSweetAlert';
import { useTableManagement } from '@/Hooks/useTableManagement';
import { useTranslation } from '@/Hooks/useTranslation';

//Partials:
import ProductShowView from '@/Pages/Admin/Product/Partials/ProductShowView';

//Utils:
import renderCellContent from '@/Utils/renderCellContent.jsx';

const EMPTY = Object.freeze([]);
const EMPTY_OBJ = Object.freeze({});

export default function Index({ 
    auth, 
    session, 
    title, 
    subtitle, 
    table = EMPTY_OBJ,
    slug, 
    queryParams: rawQueryParams = {}, 
    availableLocales 
}) {
    const __ = useTranslation();
    const t = (table && typeof table === 'object') ? table : EMPTY_OBJ;
    const { props } = usePage();
    const tableId     = t.id ?? 'tblProducts';
    const rows        = t.rows ?? EMPTY_OBJ;          // Resource collection (data/meta/links)
    const queryParams = t.queryParams ?? EMPTY_OBJ;   // query state
    const adhocFilters = t.adhocFilters ?? EMPTY;
    const legendItems  = t.activeFiltersLegend ?? EMPTY;

    const { loading } = useInertiaLoading();
    const hasActiveFilters = legendItems.length > 0;
    const { showConfirm } = useSweetAlert();

    const indexRouteName = `${slug}.index`;
    const indexRouteParams = {};

    const [showId, setShowId] = useState(null);
    const [showPanelOpen, setShowPanelOpen] = useState(false);

    const handleShowRegister = (product) => {
        setShowId(product.id);
        setShowPanelOpen(true);
    };

    const handleCloseShowPanel = () => {
        setShowPanelOpen(false);
        setShowId(null);
    };

    //Columnas:
    const columns = [
        { key: 'name', label: __('articulo'), sort: true, filter: 'text', type: 'link', link: 'products.edit', class_th: '', class_td: '', placeholder: __('articulo_filtrar') },
        { key: 'reference', label: __('referencia'), sort: true, filter: 'text', class_th: '', class_td: '', placeholder: __('referencia_filtrar') },
        { key: 'description', label: __('descripcion'), sort: true, filter: 'text', class_th: '', class_td: '', placeholder: __('descripcion_filtrar') },
        { key: 'price', label: __('precio'), sort: true, filter: 'text', class_th: 'text-center', class_td: 'text-end', placeholder: __('precio_filtrar') },
        { key: 'created_at', label: __('fecha_alta'), sort: true, filter: 'date', class_th: 'text-center', class_td: 'text-end', placeholder: __('fecha_alta'), dateKeys: ['date_from', 'date_to'] },
        { key: 'status', label: __('estado'), sort: true, filter: 'select', options: [
            { value: '1', label: __('activo') },
            { value: '0', label: __('inactivo') }
        ], class_th: 'text-center', class_td: 'text-center', placeholder: __('estado_filtrar'), booleanLike: true },
        { key: 'image', label: __('imagen'), sort: false, filter: '', type: 'image', icon: 'box', class_th: 'text-center', class_td: 'text-center', placeholder: '' }
    ];    

    //Métodos de la tabla:
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
        queryParams: tableQueryParams
    } = useTableManagement({
        table: tableId,
        allColumnKeys: columns.map(col => col.key),
        entityName: 'products',
        indexRoute: slug + '.index',
        destroyRoute: 'products.destroy',
        filteredDataRoute: slug + '.filtered-data',
        labelName: 'productos',
        queryParams
    });

    //Acciones:
    const actions = [];
    if (permissions?.['products.create']) {
        actions.push({
            text: __('producto_nuevo'),
            icon: 'la-plus',
            url: 'products.create',
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
                        <ColumnFilter columns={columns} visibleColumns={visibleColumns} toggleColumn={toggleColumnVisibility} />

                        {/* Filtros de datos */}
                        <AdHocFiltersDropdown
                            filters={adhocFilters}
                            routeName={indexRouteName}
                            routeParams={indexRouteParams}
                            queryParams={tableQueryParams} 
                        />

                        <RecordsPerPage perPage={perPage} setPerPage={setPerPage} />
                        
                        <TableExporter filename={ __('productos') } columns={columns} fetchData={filteredData}/>
                    </div>
                </div>

                <div className="d-flex justify-content-between align-items-center my-2">
                    <ActiveFiltersLegend
                        items={legendItems}
                        routeName={indexRouteName}
                        routeParams={indexRouteParams}
                        queryParams={tableQueryParams}
                    />

                    {hasActiveFilters && loading ? (
                        <SpinnerInline text={__('cargando') ?? 'Cargando…'} />
                    ) : null}
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
                                    <th key={col.key} className={`${col.class_th ?? ''} ${visibleColumns.includes(col.key) ? '' : 'd-none'}`.trim()}>
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
                                <th className="text-center">{ __('acciones') }</th> 
                            </tr>
                        </thead>

                        <FilterRow
                            columns={columns}
                            queryParams={queryParams}
                            visibleColumns={visibleColumns}
                            SearchFieldChanged={SearchFieldChanged}
                            PrependColumns={1}
                        />

                        <tbody>
                            {rows.data.map((product) => (
                                <tr key={"product-"+product.id}>
                                    {/* Columna "show" fija */}
                                    <td className="text-center">
                                        <ShowRegisterButton onClick={() => handleShowRegister(product)} />
                                    </td>

                                    {columns.map(col => (
                                        <td key={col.key} className={`${col.class_td ?? ''} ${visibleColumns.includes(col.key) ? '' : 'd-none'}`.trim()}>
                                            {renderCellContent(product[col.key], col, product)}
                                        </td>
                                    ))}

                                    {/* Acciones */}
                                    <td className="text-end">
                                        {/* Estado */}
                                        {permissions?.['products.edit'] && (
                                            <OverlayTrigger
                                                key={"status-"+product.id}
                                                placement="top"
                                                overlay={<Tooltip className="ttp-top">{ product.status == 1 ? __('producto_activo') : __('producto_inactivo') }</Tooltip>}
                                            >
                                                <StatusButton 
                                                    status={product.status} 
                                                    id={product.id} 
                                                    updateRoute='products.status'
                                                    reloadUrl={route('products.index')}
  													reloadResource="products"
                                                />
                                            </OverlayTrigger>
                                        )}

                                        {/* Editar */}
                                        {permissions?.['products.edit'] && (
                                            <OverlayTrigger
                                                key={"edit-"+product.id}
                                                placement="top"
                                                overlay={<Tooltip className="ttp-top">{ __('editar') }</Tooltip>}
                                            >
                                                <Link href={route('products.edit', product.id)} className="btn btn-sm btn-info ms-1">
                                                    <i className="la la-edit"></i>
                                                </Link>
                                            </OverlayTrigger>
                                        )}

                                        {/* Eliminar */}
                                        {permissions?.['products.destroy'] && (
                                            <OverlayTrigger
                                                key={"delete-"+product.id}
                                                placement="top"
                                                overlay={<Tooltip className="ttp-top">{ __('eliminar') }</Tooltip>}
                                            >
                                                <span>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-danger ms-1"
                                                        onClick={() => handleDelete(product.id)}
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

                <ShowRegister
                    id={showId}
                    open={showPanelOpen}
                    onClose={handleCloseShowPanel}
                    routeName="products.show"        // tu ruta JSON
                    title={__('articulo')}         
                    ViewComponent={ProductShowView}
                />

                <Pagination 
                    links={rows.meta.links} 
                    totalRecords={rows.meta.total} 
                    currentPage={rows.meta.current_page} 
                    perPage={rows.meta.per_page}
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
