import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { OverlayTrigger, Table, Tooltip } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import * as locales from "date-fns/locale";
import { format, parseISO, subYears, addYears } from 'date-fns';
import axios from 'axios';

//Components:
import ColumnFilter from '@/Components/ColumnFilter';
import DataFilter from '@/Components/DataFilter';
import FilterRow from '@/Components/FilterRow';
import { Pagination } from '@/Components/Pagination';
import RecordsPerPage from '@/Components/RecordsPerPage';
import { SortControl } from '@/Components/SortControl';
import SelectInput from '@/Components/SelectInput';
import StatusButton from '@/Components/StatusButton';
import TableExporter from '@/Components/TableExporter';

//Hooks:
import { useSweetAlert } from '@/Hooks/useSweetAlert';
import { useTableManagement } from '@/Hooks/useTableManagement';
import { useTranslation } from '@/Hooks/useTranslation';

//Utils:
import renderCellContent from '@/Utils/renderCellContent.jsx';

export default function Index({ auth, session, title, subtitle, roles, is_superadmin, queryParams: rawQueryParams = {}, availableLocales }){
	const queryParams = typeof rawQueryParams === 'object' && rawQueryParams !== null ? rawQueryParams : {};
    const __ = useTranslation();

    //Columnas:
    const columns = [
        { key: 'name', label: __('role'), sort: true, filter: 'text', placeholder: __('role_filtrar') },
        { key: 'description', label: __('descripcion'), sort: true, filter: 'text', placeholder: __('descripcion_filtrar') },
        { key: 'universal', label: __('role_universal'), sort: false, class_th: 'text-center', class_td: 'text-center' }
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
        table: 'tblRoles',
        allColumnKeys: columns.map(col => col.key),
        entityName: 'roles',
        indexRoute: 'roles.index',
        destroyRoute: 'roles.destroy',
        filteredDataRoute: 'roles.filtered-data',
        labelName: 'role',
        queryParams
    });

    //Acciones:
    const actions = [];
    if (permissions?.['roles.create']) {
        actions.push({
            text: __('role_nuevo'), 
            icon: 'la-plus', 
            url: 'roles.create', 
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

            {/* Contenido */}
            <div className="contents">
                {/* Controles */}
                <div className="row">
                    <div className="controls d-flex align-items-center">
                        {/* A IZQUIERDA */}
                        {/* Filtro de columnas */}
                        <ColumnFilter columns={columns} visibleColumns={visibleColumns} toggleColumn={toggleColumnVisibility} />

                        {/* Filtros de datos */}
                        {/* <DataFilter /> */}


                        {/* A DERECHA */}
                        {/* Registros por página */}
                        <RecordsPerPage perPage={perPage} setPerPage={setPerPage} />

                        {/* Exportar */}
                        <TableExporter filename={ __('roles') } columns={columns} fetchData={filteredData}/>
                    </div>
                </div>

                {/* Tabla */}
                <div className="table-responsive">
                    <Table className="table table-nowrap table-striped align-middle mb-0" id="tblRoles">
                        {/* Cabecera */}
                        <thead>
                            <tr>
                                {columns.map(col => (
                                    <th key={col.key} className={`${col.class_th ?? ''} ${visibleColumns.includes(col.key) ? '' : 'd-none'}`.trim()}>
                                        {__(col.label)}

                                        {/* Solo mostrar SortControl si `sort` es true */}
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

                        {/* Search fields */}	
                        <FilterRow
                            columns={columns}
                            queryParams={queryParams}
                            visibleColumns={visibleColumns}
                            SearchFieldChanged={SearchFieldChanged}
                        />

                        <tbody>
                            {roles.data.map((role) => (
								<tr key={role.id}>
                                    {columns.map(col => (
                                        <td key={col.key} className={`${col.class_td ?? ''} ${visibleColumns.includes(col.key) ? '' : 'd-none'}`.trim()}>
                                            {renderCellContent(role[col.key], col, role)}
                                        </td>
                                        ))
                                    }

                                    {/* Acciones */}
                                    <td className="text-end">
                                        {/* Editar */}
                                        <OverlayTrigger
                                            key={"edit-"+role.id}
                                            placement="top"
                                            overlay={
                                                <Tooltip className="ttp-top">
                                                    { __('editar') }
                                                </Tooltip>
                                            }
                                        >
                                            <Link href={route('roles.edit', role.id)} className="btn btn-sm btn-info ms-1" >
                                                <i className="la la-edit"></i>
                                            </Link>
                                        </OverlayTrigger>

                                        {/* Eliminar. El rol de Super Admin no se puede eliminar. */}
                                        {permissions?.['roles.destroy']  && role.name !== 'Super Admin' && (
                                            <OverlayTrigger
                                                key={"delete-"+role.id}
                                                placement="top"
                                                overlay={<Tooltip className="ttp-top">{ __('eliminar') }</Tooltip>}
                                            >
                                                <span>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-danger ms-1"
                                                        onClick={() => handleDelete(role.id)}
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
                    links={roles.meta.links} 
                    totalRecords={roles.meta.total} 
                    currentPage={roles.meta.current_page} 
                    perPage={roles.meta.per_page} 
                    onPageChange={(page) => {
						router.get(route("roles.index"), {
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