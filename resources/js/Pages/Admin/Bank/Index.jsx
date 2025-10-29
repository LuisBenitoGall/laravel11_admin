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
//import { useSweetAlert } from '@/Hooks/useSweetAlert';
import { useTableManagement } from '@/Hooks/useTableManagement';
import { useTranslation } from '@/Hooks/useTranslation';

//Utils:
import renderCellContent from '@/Utils/renderCellContent.jsx';

export default function Index({ auth, session, title, subtitle, banks, queryParams: rawQueryParams = {}, availableLocales }) {
    const queryParams = typeof rawQueryParams === 'object' && rawQueryParams !== null ? rawQueryParams : {};
    const __ = useTranslation();

    //Columnas:
    const columns = [
        { key: 'name', label: __('banco'), sort: true, filter: 'text', class_th: '', class_td: '', placeholder: __('banco_filtrar') },
        { key: 'tradename', label: __('nombre_comercial'), sort: true, filter: 'text', class_th: '', class_td: '', placeholder: __('nombre_comercial_filtrar') },
        { key: 'swift', label: __('Swift'), sort: true, filter: 'text', class_th: 'text-center', class_td: 'text-end', placeholder: __('filtrar_por')+' Swift' },
        { key: 'lei', label: __('LEI'), sort: true, filter: 'text', class_th: '', class_td: '', placeholder: __('filtrar_por')+' LEI' },
        { key: 'eu_code', label: __('EU Code'), sort: true, filter: 'text', class_th: '', class_td: '', placeholder: __('filtrar_por')+' EU Code' },
        { key: 'supervisor_code', label: __('Supervisor Code'), sort: true, filter: 'text', class_th: '', class_td: '', placeholder: __('filtrar_por')+' Supervisor Code' }
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
        table: 'tblBanks',
        allColumnKeys: columns.map(col => col.key),
        entityName: 'banks',
        indexRoute: 'banks.index',
        destroyRoute: 'banks.destroy',
        filteredDataRoute: 'banks.filtered-data',
        labelName: 'banco',
        queryParams
    });

    //Acciones:
    const actions = [];
    if (permissions?.['banks.create']) {
        actions.push({
            text: __('banco_nuevo'),
            icon: 'la-plus',
            url: 'banks.create',
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
                        <TableExporter filename={ __('bancos') } columns={columns} fetchData={filteredData}/>
                    </div>
                </div>

                {/* Tabla */}
                <div className="table-responsive">
                    <Table className="table table-nowrap table-striped align-middle mb-0" id="tblBanks">
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
                            {banks.data.map((bank) => (
                                <tr key={"bank-"+bank.id}>
                                    {columns.map(col => (
                                        <td key={col.key} className={`${col.class_td ?? ''} ${visibleColumns.includes(col.key) ? '' : 'd-none'}`.trim()}>
                                            {renderCellContent(bank[col.key], col, bank)}
                                        </td>
                                    ))}

                                    {/* Acciones */}
                                    <td className="text-end">
                                        {/* Estado */}
                                        {permissions?.['banks.edit'] && (
                                            <OverlayTrigger
                                                key={"status-"+bank.id}
                                                placement="top"
                                                overlay={<Tooltip className="ttp-top">{ bank.status == 1 ? __('banco_activo') : __('banco_inactiva') }</Tooltip>}
                                            >
                                                <StatusButton 
                                                    status={bank.status} 
                                                    id={bank.id} 
                                                    updateRoute='banks.status'
                                                    reloadUrl={route('banks.index')}
  													reloadResource="banks"
                                                />
                                            </OverlayTrigger>
                                        )}

                                        {/* Editar */}
                                        {permissions?.['banks.edit'] && (
                                            <OverlayTrigger
                                                key={"edit-"+bank.id}
                                                placement="top"
                                                overlay={<Tooltip className="ttp-top">{ __('editar') }</Tooltip>}
                                            >
                                                <Link href={route('banks.edit', bank.id)} className="btn btn-sm btn-info ms-1">
                                                    <i className="la la-edit"></i>
                                                </Link>
                                            </OverlayTrigger>
                                        )}

                                        {/* Eliminar */}
                                        {permissions?.['banks.destroy'] && (
                                            <OverlayTrigger
                                                key={"delete-"+bank.id}
                                                placement="top"
                                                overlay={<Tooltip className="ttp-top">{ __('eliminar') }</Tooltip>}
                                            >
                                                <span>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-danger ms-1"
                                                        onClick={() => handleDelete(bank.id)}
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
                    links={banks.meta.links} 
                    totalRecords={banks.meta.total} 
                    currentPage={banks.meta.current_page} 
                    perPage={banks.meta.per_page}
                    onPageChange={(page) => {
                        router.get(route("banks.index"), {
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