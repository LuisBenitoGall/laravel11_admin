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

export default function Index({ auth, session, title, subtitle, towns, province, country, queryParams: rawQueryParams = {}, availableLocales }) {
    const queryParams = typeof rawQueryParams === 'object' && rawQueryParams !== null ? rawQueryParams : {};
    const __ = useTranslation();

    //Columnas:
    const columns = [
        { key: 'name', label: __('poblacion'), sort: true, filter: 'text', class_th: '', class_td: '', placeholder: __('poblacion_filtrar') }
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
        table: 'tblTowns',
        allColumnKeys: columns.map(col => col.key),
        entityName: 'towns',
        indexRoute: 'towns.index',
        destroyRoute: 'towns.destroy',
        filteredDataRoute: 'towns.filtered-data',
        labelName: 'poblacion',
        queryParams,
        routeParams: [province.id]
    });

    //Acciones:
    const actions = [];
    if (permissions?.['provinces.index']) {
        actions.push({
            text: __('provincias_volver'),
            icon: 'la-angle-left',
            url: 'provinces.index',
            params: [country.id],
            modal: false
        });
    }

    if (permissions?.['provinces.edit']) {
        actions.push({
            text: __('volver_a')+` ${province.name}`,
            icon: 'la-angle-left',
            url: 'provinces.edit',
            params: [province.id],
            modal: false
        });
    }

    if (permissions?.['towns.create']) {
        actions.push({
            text: __('poblacion_nueva'),
            icon: 'la-plus',
            url: 'towns.create',
            params: [province.id],
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
                    <div className="controls d-flex align-items-center ms-auto">
                        <ColumnFilter columns={columns} visibleColumns={visibleColumns} toggleColumn={toggleColumnVisibility} />
                        <RecordsPerPage perPage={perPage} setPerPage={setPerPage} />
                        <TableExporter filename={ __('poblaciones') } columns={columns} fetchData={filteredData}/>
                    </div>
                </div>

                {/* Tabla */}
                <div className="table-responsive">
                    <Table className="table table-nowrap table-striped align-middle mb-0" id="tblTowns">
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
                            {towns.data.map((town) => (
                                <tr key={"town-"+town.id}>
                                    {columns.map(col => (
                                        <td key={col.key} className={`${col.class_td ?? ''} ${visibleColumns.includes(col.key) ? '' : 'd-none'}`.trim()}>
                                            {renderCellContent(town[col.key], col, town)}
                                        </td>
                                    ))}

                                    {/* Acciones */}
                                    <td className="text-end">
                                        {/* Estado */}
                                        {permissions?.['towns.edit'] && (
                                            <OverlayTrigger
                                                key={"status-"+town.id}
                                                placement="top"
                                                overlay={<Tooltip className="ttp-top">{ town.status == 1 ? __('provincia_activa') : __('provincia_inactiva') }</Tooltip>}
                                            >
                                                <StatusButton 
                                                    status={town.status} 
                                                    id={town.id} 
                                                    updateRoute='towns.status'
                                                    reloadUrl={route('towns.index', province.id)}
  													reloadResource="towns"
                                                />
                                            </OverlayTrigger>
                                        )}

                                        {/* Editar */}
                                        {permissions?.['towns.edit'] && (
                                            <OverlayTrigger
                                                key={"edit-"+town.id}
                                                placement="top"
                                                overlay={<Tooltip className="ttp-top">{ __('editar') }</Tooltip>}
                                            >
                                                <Link href={route('towns.edit', town.id)} className="btn btn-sm btn-info ms-1">
                                                    <i className="la la-edit"></i>
                                                </Link>
                                            </OverlayTrigger>
                                        )}

                                        {/* Eliminar */}
                                        {permissions?.['towns.destroy'] && (
                                            <OverlayTrigger
                                                key={"delete-"+town.id}
                                                placement="top"
                                                overlay={<Tooltip className="ttp-top">{ __('eliminar') }</Tooltip>}
                                            >
                                                <span>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-danger ms-1"
                                                        onClick={() => handleDelete(town.id)}
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
                    links={towns.meta.links} 
                    totalRecords={towns.meta.total} 
                    currentPage={towns.meta.current_page} 
                    perPage={towns.meta.per_page}
                    onPageChange={(page) => {
                        router.get(route("towns.index", [province.id]), {
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