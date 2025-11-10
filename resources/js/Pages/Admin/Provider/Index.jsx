import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { OverlayTrigger, Table, Tooltip } from 'react-bootstrap';
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
import { useSweetAlert } from '@/Hooks/useSweetAlert';
import { useTableManagement } from '@/Hooks/useTableManagement';
import { useTranslation } from '@/Hooks/useTranslation';

//Utils:
import renderCellContent from '@/Utils/renderCellContent.jsx';

export default function Index({ auth, session, title, subtitle, companies, queryParams: rawQueryParams = {}, availableLocales }) {
    const queryParams = typeof rawQueryParams === 'object' && rawQueryParams !== null ? rawQueryParams : {};
    const __ = useTranslation();

    //Columnas:
    const columns = [
        { key: 'name', label: __('razon_social'), sort: true, filter: 'text', type: 'link', link: 'companies.edit', class_th: '', class_td: '', placeholder: __('razon_social_filtrar') },
        { key: 'tradename', label: __('nombre_comercial'), sort: true, filter: 'text', class_th: '', class_td: '', placeholder: __('nombre_comercial_filtrar') },
        { key: 'created_at', label: __('fecha_alta'), sort: true, filter: 'date', class_th: 'text-center', class_td: 'text-end', placeholder: __('fecha_alta'), dateKeys: ['date_from', 'date_to'] },
        { key: 'nif', label: __('nif'), sort: true, filter: 'text', class_th: '', class_td: '', placeholder: __('nif_filtrar') },
        // { key: 'is_ute', label: __('ute'), sort: true, filter: 'select', options: [
        //     { value: '1', label: __('si') },
        //     { value: '0', label: __('no') }
        // ], class_th: 'text-center', class_td: 'text-center', placeholder: __('ute_filtrar') },
        { key: 'logo', label: __('logo'), sort: false, filter: '', type: 'image', icon: 'building', class_th: 'text-center', class_td: 'text-center', placeholder: '' }
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
        table: 'tblProviders',
        allColumnKeys: columns.map(col => col.key),
        entityName: 'providers',
        indexRoute: 'providers.index',
        destroyRoute: 'providers.destroy',
        filteredDataRoute: 'providers.filtered-data',
        labelName: 'proveedor',
        queryParams
    });

    //Acciones:
    const actions = [];
    if (permissions?.['providers.create']) {
        actions.push({
            text: __('proveedor_nuevo'),
            icon: 'la-plus',
            url: 'providers.create',
            modal: false
        });
    }

    if (permissions?.['providers.create']) {
        actions.push({
            text: __('proveedores_importar'),
            icon: 'la-file-import',
            url: 'providers.import',
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
                        <TableExporter filename={ __('proveedores') } columns={columns} fetchData={filteredData}/>
                    </div>
                </div>

                {/* Tabla */}
                <div className="table-responsive">
                    <Table className="table table-nowrap table-striped align-middle mb-0" id="tblProviders">
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
                            {companies.data.map((company) => (
                                <tr key={"company-"+company.id}>
                                    {columns.map(col => (
                                        <td key={col.key} className={`${col.class_td ?? ''} ${visibleColumns.includes(col.key) ? '' : 'd-none'}`.trim()}>
                                            {renderCellContent(company[col.key], col, company)}
                                        </td>
                                    ))}

                                    {/* Acciones */}
                                    <td className="text-end">
                                        {/* Estado */}
                                        {permissions?.['providers.edit'] && (
                                            <OverlayTrigger
                                                key={"status-"+company.id}
                                                placement="top"
                                                overlay={<Tooltip className="ttp-top">{ company.status == 1 ? __('proveedor_activo') : __('proveedor_inactivo') }</Tooltip>}
                                            >
                                                <StatusButton 
                                                    status={company.status} 
                                                    id={company.id} 
                                                    updateRoute='providers.status'
                                                    reloadUrl={route('providers.index')}
                                                    reloadResource="providers"
                                                />
                                            </OverlayTrigger>
                                        )}

                                        {/* Editar */}
                                        {permissions?.['providers.edit'] && (
                                            <OverlayTrigger
                                                key={"edit-"+company.id}
                                                placement="top"
                                                overlay={<Tooltip className="ttp-top">{ __('editar') }</Tooltip>}
                                            >
                                                <Link href={route('providers.edit', company.id)} className="btn btn-sm btn-info ms-1">
                                                    <i className="la la-edit"></i>
                                                </Link>
                                            </OverlayTrigger>
                                        )}

                                        {/* Eliminar */}
                                        {permissions?.['providers.destroy'] && (
                                            <OverlayTrigger
                                                key={"delete-"+company.id}
                                                placement="top"
                                                overlay={<Tooltip className="ttp-top">{ __('eliminar') }</Tooltip>}
                                            >
                                                <span>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-danger ms-1"
                                                        onClick={() => handleDelete(company.id)}
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
                        router.get(route("providers.index"), {
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
