import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
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
import { useTableManagement } from '@/Hooks/useTableManagement';
import { useTranslation } from '@/Hooks/useTranslation';

//Utils:
import renderCellContent from '@/Utils/renderCellContent.jsx';

export default function Index({ auth, session, title, subtitle, company, side, returnRoutes, costCenters, queryParams: rawQueryParams = {}, availableLocales }) {
    const queryParams = typeof rawQueryParams === 'object' && rawQueryParams !== null ? rawQueryParams : {};
    const __ = useTranslation();

    const labelFromRoute = (rr, __) => {
        if (rr?.label) return rr.label;
        if (String(rr?.name).includes('customers.edit')) return __('cliente_volver');
        if (String(rr?.name).includes('providers.edit')) return __('proveedor_volver');
        return __('volver');
    };

    //Columnas:
    const columns = [
        { key: 'name', label: __('nombre'), sort: true, filter: 'text', type: 'text', placeholder: __('nombre_filtrar') },
        { key: 'code', label: __('codigo'), sort: true, filter: 'text', type: 'text', placeholder: __('codigo_filtrar') },
        { key: 'created_at', label: __('fecha_alta'), sort: true, filter: 'date', class_th: 'text-center', class_td: 'text-end', placeholder: __('fecha_alta'), dateKeys: ['date_from', 'date_to'] }
    ];

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
        table: 'tblCostCenters',
        allColumnKeys: columns.map(col => col.key),
        entityName: 'costCenters',
        indexRoute: 'cost-centers.index',
        destroyRoute: 'cost-centers.destroy',
        filteredDataRoute: 'cost-centers.filtered-data',
        routeParams: [company?.id],
        labelName: 'centro_coste',
        queryParams
    });

    const actions = [];

    returnRoutes.forEach(rr => {
        actions.push({
            text: labelFromRoute(rr, __),
            icon: 'la-angle-left',
            url: rr.name,               // p.ej. 'customers.edit' | 'providers.edit'
            params: rr.params ?? company?.id ?? null,
            modal: false
        });
    });

    if (permissions?.['cost-centers.create']) {
        actions.push({ 
            text: __('centro_coste_nuevo'), 
            icon: 'la-plus', 
            url: 'cost-centers.create', 
            params: company?.id ?? null,       
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
                <div className="row">
                    <div className="col-12">
                        <h2>
                            {__('centros_coste')} <u>{ company.name }</u>
                        </h2>
                    </div>

                    {/* Controles */}
                    <div className="controls d-flex align-items-center">
                        <ColumnFilter columns={columns} visibleColumns={visibleColumns} toggleColumn={toggleColumnVisibility} />
                        <RecordsPerPage perPage={perPage} setPerPage={setPerPage} />
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-nowrap table-striped align-middle mb-0" id="tblCostCenters">
                        <thead>
                            <tr>
                                {columns.map(col => (
                                    <th key={col.key} className={`${col.class_th ?? ''} ${visibleColumns.includes(col.key) ? '' : 'd-none'}`.trim()}>
                                        {__(col.label)}
                                        {col.sort && (
                                            <SortControl name={col.key} sortable={true} sort_field={queryParams.sort_field} sort_direction={queryParams.sort_direction} sortChanged={sortChanged} />
                                        )}
                                    </th>
                                ))}
                                <th className="text-center">{ __('acciones') }</th>
                            </tr>
                        </thead>

                        <FilterRow columns={columns} queryParams={queryParams} visibleColumns={visibleColumns} SearchFieldChanged={SearchFieldChanged} />

                        <tbody>
                            {costCenters.data.map((center) => (
                                // <tr key={"center-"+center.id}>
                                //     {columns.map(col => (
                                //         <td key={col.key} className={`${col.class_td ?? ''} ${visibleColumns.includes(col.key) ? '' : 'd-none'}`.trim()}>
                                //             {center[col.key]}
                                //         </td>
                                //     ))}

                                <tr key={"center-"+center.id}>
                                    {columns.map(col => (
                                        <td key={col.key} className={`${col.class_td ?? ''} ${visibleColumns.includes(col.key) ? '' : 'd-none'}`.trim()}>
                                            {renderCellContent(center[col.key], col, center)}
                                        </td>
                                    ))}

                                    {/* Acciones */}
                                    <td className="text-end">
                                        {/* Estado */}
                                        {permissions?.['cost-centers.edit'] && (
                                            <OverlayTrigger
                                                key={"status-"+center.id}
                                                placement="top"
                                                overlay={<Tooltip className="ttp-top">{ center.status == 1 ? __('centro_activo') : __('centro_inactivo') }</Tooltip>}>
                                                <StatusButton 
                                                    status={center.status}
                                                    id={center.id}
                                                    updateRoute='cost-centers.status'
                                                    reloadUrl={route('cost-centers.index')}
                                                    reloadResource="cost-centers"
                                                />
                                            </OverlayTrigger>
                                        )}

                                        {/* Editar */}
                                        {permissions?.['cost-centers.edit'] && (
                                            <OverlayTrigger
                                                key={"edit-"+center.id}
                                                placement="top"
                                                overlay={<Tooltip className="ttp-top">{ __('editar') }</Tooltip>}
                                            >
                                                <Link href={route('cost-centers.edit', center.id)} className="btn btn-sm btn-info ms-1">
                                                    <i className="la la-edit"></i>
                                                </Link>
                                            </OverlayTrigger>
                                        )}

                                        {/* Eliminar */}
                                        {permissions?.['cost-centers.destroy'] && (
                                            <button type="button" className="btn btn-sm btn-danger ms-1" onClick={() => handleDelete(center.id)}><i className="la la-trash"></i></button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <Pagination links={costCenters.meta.links} totalRecords={costCenters.meta.total} currentPage={costCenters.meta.current_page} perPage={costCenters.meta.per_page} onPageChange={(page) => {
                    router.get(route('cost-centers.index'), { ...queryParams, page, per_page: perPage, sort_field: sortParams.sort_field, sort_direction: sortParams.sort_direction }, { preserveState: true });
                }} />
            </div>
        </AdminAuthenticatedLayout>
    );
}
