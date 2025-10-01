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

export default function Index({ auth, session, title, subtitle, provinces, country, queryParams: rawQueryParams = {}, availableLocales }) {
    const queryParams = typeof rawQueryParams === 'object' && rawQueryParams !== null ? rawQueryParams : {};
    const __ = useTranslation();

    //Columnas:
    const columns = [
        { key: 'name', label: __('provincia'), sort: true, filter: 'text', class_th: '', class_td: '', placeholder: __('provincia_filtrar') }
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
        table: 'tblProvinces',
        allColumnKeys: columns.map(col => col.key),
        entityName: 'provinces',
        indexRoute: 'provinces.index',
        destroyRoute: 'provinces.destroy',
        filteredDataRoute: 'provinces.filtered-data',
        labelName: 'provincia',
        queryParams,
        routeParams: [country.id]
    });

    //Acciones:
    const actions = [];
    if (permissions?.['countries.index']) {
        actions.push({
            text: __('paises_volver'),
            icon: 'la-angle-left',
            url: 'countries.index',
            modal: false
        });
    }

    if (permissions?.['countries.edit']) {
        actions.push({
            text: __('volver_a')+` ${country.name}`,
            icon: 'la-angle-left',
            url: 'countries.edit',
            params: [country.id],
            modal: false
        });
    }

    if (permissions?.['provinces.create']) {
        actions.push({
            text: __('provincia_nueva'),
            icon: 'la-plus',
            url: 'provinces.create',
            params: [country.id],
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
                    <div className="controls d-flex align-items-center">
                        <ColumnFilter columns={columns} visibleColumns={visibleColumns} toggleColumn={toggleColumnVisibility} />
                        <RecordsPerPage perPage={perPage} setPerPage={setPerPage} />
                        <TableExporter filename={ __('provincia') } columns={columns} fetchData={filteredData}/>
                    </div>
                </div>

                {/* Tabla */}
                <div className="table-responsive">
                    <Table className="table table-nowrap table-striped align-middle mb-0" id="tblProvinces">
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
                            {provinces.data.map((province) => (
                                <tr key={"province-"+province.id}>
                                    {columns.map(col => (
                                        <td key={col.key} className={`${col.class_td ?? ''} ${visibleColumns.includes(col.key) ? '' : 'd-none'}`.trim()}>
                                            {renderCellContent(province[col.key], col, province)}
                                        </td>
                                    ))}

                                    {/* Acciones */}
                                    <td className="text-end">
                                        {/* Estado */}
                                        {permissions?.['provinces.edit'] && (
                                            <OverlayTrigger
                                                key={"status-"+province.id}
                                                placement="top"
                                                overlay={<Tooltip className="ttp-top">{ province.status == 1 ? __('provincia_activa') : __('provincia_inactiva') }</Tooltip>}
                                            >
                                                <StatusButton 
                                                    status={province.status} 
                                                    id={province.id} 
                                                    updateRoute='provinces.status'
                                                    reloadUrl={route('provinces.index', country.id)}
  													reloadResource="provinces"
                                                />
                                            </OverlayTrigger>
                                        )}

                                        {/* Poblaciones */}
                                        {permissions?.['provinces.edit'] && (
                                            <OverlayTrigger
                                                key={"provinces-"+province.id}
                                                placement="top"
                                                overlay={<Tooltip className="ttp-top">{ __('poblaciones') }</Tooltip>}
                                            >
                                                <Link href={route('towns.index', province.id)} className="btn btn-sm btn-info ms-1">
                                                    <i className="la la-city"></i>
                                                </Link>
                                            </OverlayTrigger>
                                        )}

                                        {/* Editar */}
                                        {permissions?.['provinces.edit'] && (
                                            <OverlayTrigger
                                                key={"edit-"+province.id}
                                                placement="top"
                                                overlay={<Tooltip className="ttp-top">{ __('editar') }</Tooltip>}
                                            >
                                                <Link href={route('provinces.edit', province.id)} className="btn btn-sm btn-info ms-1">
                                                    <i className="la la-edit"></i>
                                                </Link>
                                            </OverlayTrigger>
                                        )}

                                        {/* Eliminar */}
                                        {permissions?.['provinces.destroy'] && (
                                            <OverlayTrigger
                                                key={"delete-"+province.id}
                                                placement="top"
                                                overlay={<Tooltip className="ttp-top">{ __('eliminar') }</Tooltip>}
                                            >
                                                <span>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-danger ms-1"
                                                        onClick={() => handleDelete(province.id)}
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
                    links={provinces.meta.links} 
                    totalRecords={provinces.meta.total} 
                    currentPage={provinces.meta.current_page} 
                    perPage={provinces.meta.per_page}
                    onPageChange={(page) => {
                        router.get(route("provinces.index", [country.id]), {
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