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

export default function Index({ auth, session, title, subtitle, accounts, currency, queryParams: rawQueryParams = {}, availableLocales }) {
    const queryParams = typeof rawQueryParams === 'object' && rawQueryParams !== null ? rawQueryParams : {};
    const __ = useTranslation();

    //Columnas:
    const columns = [
        { key: 'name', label: __('cuenta'), sort: true, filter: 'text', class_th: '', class_td: '', placeholder: __('cuenta_filtrar') },
        { key: 'start_date', label: __('inicio'), sort: true, filter: 'date', class_th: 'text-center', class_td: 'text-end', placeholder: __('inicio'), dateKeys: ['start_date'] },
        { key: 'end_date', label: __('fin'), sort: true, filter: 'date', class_th: 'text-center', class_td: 'text-end', placeholder: __('fin'), dateKeys: ['end_date'] },
        { key: 'price', label: __('precio'), sort: false, filter: '', class_th: 'text-center', class_td: 'text-end', currency: currency, placeholder: __('precio') },
    ]

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
        table: 'tblCompanyAccounts',
        allColumnKeys: columns.map(col => col.key),
        entityName: 'company-accounts',
        indexRoute: 'company-accounts.index',
        destroyRoute: 'company-accounts.destroy',
        filteredDataRoute: 'company-accounts.filtered-data',
        labelName: 'cuenta',
        queryParams
    });    
    
    //Acciones:
    const actions = [];
    if (permissions?.['my-account.edit']) {
        actions.push({
            text: __('cuenta_renovar'),
            icon: 'la-shopping-cart',
            url: 'company-accounts.create',
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
                        <TableExporter filename={ __('empresa_cuentas') } columns={columns} fetchData={filteredData}/>
                    </div>
                </div>

                {/* Tabla */}
                <div className="table-responsive">
                    <Table className="table table-nowrap table-striped align-middle mb-0" id="tblCompanyAccounts">
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
                            {accounts.data.map((account) => (
                                <tr key={"account-"+account.id}>
                                    {columns.map(col => (
                                        <td key={col.key} className={`${col.class_td ?? ''} ${visibleColumns.includes(col.key) ? '' : 'd-none'}`.trim()}>
                                            {renderCellContent(account[col.key], col, account)}
                                        </td>
                                    ))}

                                    {/* Acciones */}
                                    <td className="text-end">
                                        {/* Eliminar */}
                                        {permissions?.['my-account.destroy'] && (
                                            <OverlayTrigger
                                                key={"delete-"+account.id}
                                                placement="top"
                                                overlay={
                                                    <Tooltip className="ttp-top">
                                                        { __('cancelar') }
                                                    </Tooltip>
                                                }
                                            >
                                                <span>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-danger ms-1"
                                                        onClick={() => handleDelete(account.id)}
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
                    links={accounts.meta.links} 
                    totalRecords={accounts.meta.total} 
                    currentPage={accounts.meta.current_page} 
                    perPage={accounts.meta.per_page}
                    onPageChange={(page) => {
                        router.get(route("company-accounts.index"), {
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