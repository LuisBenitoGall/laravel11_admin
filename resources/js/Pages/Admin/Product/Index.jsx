import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { OverlayTrigger, Table, Tooltip } from 'react-bootstrap';
import axios from 'axios';

//Components:
import ColumnFilter from '@/Components/ColumnFilter';
import FilterRow from '@/Components/FilterRow';
import { Pagination } from '@/Components/Pagination';
import RecordsPerPage from '@/Components/RecordsPerPage';
import { SortControl } from '@/Components/SortControl';
import StatusButton from '@/Components/StatusButton';
import TableExporter from '@/Components/TableExporter';

//Hooks:
import { useSweetAlert } from '@/Hooks/useSweetAlert';
import { useTableManagement } from '@/Hooks/useTableManagement';
import { useTranslation } from '@/Hooks/useTranslation';

//Utils:
import renderCellContent from '@/Utils/renderCellContent.jsx';

export default function Index({ auth, session, title, subtitle, products, queryParams: rawQueryParams = {}, availableLocales }) {
    const queryParams = typeof rawQueryParams === 'object' && rawQueryParams !== null ? rawQueryParams : {};
    const __ = useTranslation();

    //Columnas:
    const columns = [
        { key: 'name', label: __('producto'), sort: true, filter: 'text', type: 'link', link: 'products.edit', class_th: '', class_td: '', placeholder: __('producto_filtrar') },
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
        handleDelete
    } = useTableManagement({
        table: 'tblProducts',
        allColumnKeys: columns.map(col => col.key),
        entityName: 'products',
        indexRoute: 'products.index',
        destroyRoute: 'products.destroy',
        filteredDataRoute: 'products.filtered-data',
        labelName: 'producto',
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
                        <RecordsPerPage perPage={perPage} setPerPage={setPerPage} />
                        <TableExporter filename={ __('productos') } columns={columns} fetchData={filteredData}/>
                    </div>
                </div>

                {/* Tabla */}
                <div className="table-responsive">
                    <Table className="table table-nowrap table-striped align-middle mb-0" id="tblProducts">
                        <thead>
                            <tr>
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
                        />

                        <tbody>
                            {products.data.map((product) => (
                                <tr key={"product-"+product.id}>
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

                <Pagination 
                    links={products.meta.links} 
                    totalRecords={products.meta.total} 
                    currentPage={products.meta.current_page} 
                    perPage={products.meta.per_page}
                    onPageChange={(page) => {
                        router.get(route("products.index"), {
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
