import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { OverlayTrigger, Table, Tooltip } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import ColumnFilter from '@/Components/ColumnFilter';
import FilterRow from '@/Components/FilterRow';
import { Pagination } from '@/Components/Pagination';
import RecordsPerPage from '@/Components/RecordsPerPage';
import { SortControl } from '@/Components/SortControl';
import StatusButton from '@/Components/StatusButton';

import { useTableManagement } from '@/Hooks/useTableManagement';
import { useTranslation } from '@/Hooks/useTranslation';

export default function Index({ auth, session, title, subtitle, businessAreas, queryParams: rawQueryParams = {}, availableLocales }) {
    const queryParams = typeof rawQueryParams === 'object' && rawQueryParams !== null ? rawQueryParams : {};
    const __ = useTranslation();

    const columns = [
        { key: 'name', label: __('nombre'), sort: true, filter: 'text', type: 'link', link: 'business-areas.edit', placeholder: __('nombre_filtrar') },
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
        table: 'tblBusinessAreas',
        allColumnKeys: columns.map(col => col.key),
        entityName: 'businessAreas',
        indexRoute: 'business-areas.index',
        destroyRoute: 'business-areas.destroy',
        filteredDataRoute: 'business-areas.filtered-data',
        labelName: 'area_negocio',
        queryParams
    });

    const actions = [];
    if (permissions?.['business-areas.create']) {
        actions.push({ text: __('area_negocio_nueva'), icon: 'la-plus', url: 'business-areas.create', modal: false });
    }

    return (
        <AdminAuthenticatedLayout user={auth.user} title={title} subtitle={subtitle} actions={actions}>
            <Head title={title} />

            <div className="contents">
                <div className="row">
                    <div className="controls d-flex align-items-center">
                        <ColumnFilter columns={columns} visibleColumns={visibleColumns} toggleColumn={toggleColumnVisibility} />
                        <RecordsPerPage perPage={perPage} setPerPage={setPerPage} />
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-nowrap table-striped align-middle mb-0" id="tblBusinessAreas">
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
                            {businessAreas.data.map((area) => (
                                <tr key={"area-"+area.id}>
                                    {columns.map(col => (
                                        <td key={col.key} className={`${col.class_td ?? ''} ${visibleColumns.includes(col.key) ? '' : 'd-none'}`.trim()}>
                                            {col.type === 'link' && col.key !== 'name' ? <a href={route(col.link, area.id)}>{area[col.key]}</a> : area[col.key]}
                                        </td>
                                    ))}

                                    {/* Acciones */}
                                    <td className="text-end">
                                        {/* Estado */}
                                        {permissions?.['business-areas.edit'] && (
                                            <OverlayTrigger
                                                key={"status-"+area.id}
                                                placement="top"
                                                overlay={<Tooltip className="ttp-top">{ area.status == 1 ? __('centro_activo') : __('centro_inactivo') }</Tooltip>}
                                            >
                                                <StatusButton 
                                                    status={area.status} 
                                                    id={area.id} 
                                                    updateRoute='business-areas.status'
                                                    reloadUrl={route('business-areas.index')}
   									                reloadResource="business-areas"
                                                />
                                            </OverlayTrigger>
                                        )}

                                        {/* Editar */}
                                        {permissions?.['business-areas.edit'] && (
                                            <a href={route('business-areas.edit', area.id)} className="btn btn-sm btn-info ms-1"><i className="la la-edit"></i></a>
                                        )}

                                        {/* Eliminar */}
                                        {permissions?.['business-areas.destroy'] && (
                                            <button type="button" className="btn btn-sm btn-danger ms-1" onClick={() => handleDelete(area.id)}><i className="la la-trash"></i></button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <Pagination links={businessAreas.meta.links} totalRecords={businessAreas.meta.total} currentPage={businessAreas.meta.current_page} perPage={businessAreas.meta.per_page} onPageChange={(page) => {
                    router.get(route('business-areas.index'), { ...queryParams, page, per_page: perPage, sort_field: sortParams.sort_field, sort_direction: sortParams.sort_direction }, { preserveState: true });
                }} />
            </div>
        </AdminAuthenticatedLayout>
    );
}
