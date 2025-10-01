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

export default function Index({ auth, session, title, subtitle, countries, queryParams: rawQueryParams = {}, availableLocales }) {
    const queryParams = typeof rawQueryParams === 'object' && rawQueryParams !== null ? rawQueryParams : {};
    const __ = useTranslation();

    //Columnas:
    const columns = [
        { key: 'name', label: __('pais'), sort: true, filter: 'text', class_th: '', class_td: '', placeholder: __('pais_filtrar') },
        { key: 'code', label: __('codigo'), sort: true, filter: 'text', class_th: '', class_td: '', placeholder: __('codigo_filtrar') },
        { key: 'alfa2', label: __('Alfa 2'), sort: true, filter: 'text', class_th: 'text-center', class_td: 'text-end', placeholder: __('filtrar_por')+' Alfa 2' },
        { key: 'alfa3', label: __('Alfa 3'), sort: true, filter: 'text', class_th: 'text-center', class_td: 'text-end', placeholder: __('filtrar_por')+' Alfa 3' },
        { key: 'flag', label: __('bandera'), sort: false, filter: '', class_th: 'text-center', class_td: 'text-center' }
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
        table: 'tblCountries',
        allColumnKeys: columns.map(col => col.key),
        entityName: 'countries',
        indexRoute: 'countries.index',
        destroyRoute: 'countries.delete',
        filteredDataRoute: 'countries.filtered-data',
        labelName: 'pais',
        queryParams
    });

    //Acciones:
    const actions = [];
    if (permissions?.['countries.create']) {
        actions.push({
            text: __('pais_nuevo'),
            icon: 'la-plus',
            url: 'countries.create',
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
                        <TableExporter filename={ __('pais') } columns={columns} fetchData={filteredData}/>
                    </div>
                </div>

                {/* Tabla */}
                <div className="table-responsive">
                    <Table className="table table-nowrap table-striped align-middle mb-0" id="tblCountries">
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
                            {countries.data.map((country) => (
                                <tr key={"country-"+country.id}>
                                    {columns.map(col => (
                                        <td key={col.key} className={`${col.class_td ?? ''} ${visibleColumns.includes(col.key) ? '' : 'd-none'}`.trim()}>
                                            {renderCellContent(country[col.key], col, country)}
                                        </td>
                                    ))}

                                    {/* Acciones */}
                                    <td className="text-end">
                                        {/* Estado */}
                                        {permissions?.['countries.edit'] && (
                                            <OverlayTrigger
                                                key={"status-"+country.id}
                                                placement="top"
                                                overlay={<Tooltip className="ttp-top">{ country.status == 1 ? __('pais_activo') : __('pais_inactivo') }</Tooltip>}
                                            >
                                                <StatusButton 
                                                    status={country.status} 
                                                    id={country.id} 
                                                    updateRoute='countries.status'
                                                    reloadUrl={route('countries.index')}
  													reloadResource="countries"
                                                />
                                            </OverlayTrigger>
                                        )}

                                        {/* Provincias */}
                                        {permissions?.['countries.edit'] && (
                                            <OverlayTrigger
                                                key={"provinces-"+country.id}
                                                placement="top"
                                                overlay={<Tooltip className="ttp-top">{ __('provincias') }</Tooltip>}
                                            >
                                                <Link href={route('provinces.index', country.id)} className="btn btn-sm btn-info ms-1">
                                                    <i className="la la-flag"></i>
                                                </Link>
                                            </OverlayTrigger>
                                        )}

                                        {/* Editar */}
                                        {permissions?.['countries.edit'] && (
                                            <OverlayTrigger
                                                key={"edit-"+country.id}
                                                placement="top"
                                                overlay={<Tooltip className="ttp-top">{ __('editar') }</Tooltip>}
                                            >
                                                <Link href={route('countries.edit', country.id)} className="btn btn-sm btn-info ms-1">
                                                    <i className="la la-edit"></i>
                                                </Link>
                                            </OverlayTrigger>
                                        )}

                                        {/* Eliminar */}
                                        {permissions?.['countries.destroy'] && (
                                            <OverlayTrigger
                                                key={"delete-"+country.id}
                                                placement="top"
                                                overlay={<Tooltip className="ttp-top">{ __('eliminar') }</Tooltip>}
                                            >
                                                <span>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-danger ms-1"
                                                        onClick={() => handleDelete(country.id)}
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
                    links={countries.meta.links} 
                    totalRecords={countries.meta.total} 
                    currentPage={countries.meta.current_page} 
                    perPage={countries.meta.per_page}
                    onPageChange={(page) => {
                        router.get(route("countries.index"), {
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