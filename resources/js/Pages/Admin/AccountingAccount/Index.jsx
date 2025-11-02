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

export default function Index({ auth, session, title, subtitle, accounts, queryParams: rawQueryParams = null, availableLocales }) {
	const queryParams = typeof rawQueryParams === 'object' && rawQueryParams !== null ? rawQueryParams : {};
	const __ = useTranslation();

    //Columnas:
    const columns = [
        { key: 'code', label: __('cuenta'), sort: true, filter: 'text', class_th: '', class_td: '', placeholder: __('codigo_filtrar') },
		{ key: 'name', label: __('nombre'), sort: true, filter: 'text', class_th: '', class_td: '', placeholder: __('nombre_filtrar') },
        { key: 'company', label: __('empresa'), sort: true, filter: 'text', class_th: '', class_td: '', placeholder: __('empresa_filtrar') },
        { key: 'nature', label: __('tipo_contable'), sort: true, filter: 'text', class_th: '', class_td: '', placeholder: __('tipo_filtrar') },
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
        table: 'tblAccountingAccounts',
        allColumnKeys: columns.map(col => col.key),
        entityName: 'accounting_accounts',
        indexRoute: 'accounting-accounts.index',
        destroyRoute: 'accounting-accounts.destroy',
        filteredDataRoute: 'accounting-accounts.filtered-data',
        labelName: 'cuenta_contable',
        queryParams
    });	

    //Acciones:
	const actions = [];
    if (permissions?.['accounting-accounts.create']) {
        actions.push({
            text: __('cuenta_nueva'),
            icon: 'la-plus',
            url: 'accounting-accounts.create',
            modal: false
        });
    }

    if (permissions?.['accounting-accounts.index']) {
        actions.push({
            text: __('cuentas_iva'),
            icon: 'la-file-invoice-dollar',
            url: 'accounting-accounts.iva-accounts',
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
                        <TableExporter filename={ __('unidades') } columns={columns} fetchData={filteredData}/>
                    </div>
                </div>

                {/* Tabla */}
                <div className="table-responsive">
                    <Table className="table table-nowrap table-striped align-middle mb-0" id="tblAccountingAccounts">
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
                                        {/* Activa - inactiva */}
                                        {permissions?.['accounting-accounts.edit'] && (
                                            <OverlayTrigger
                                                key={"status-"+account.id}
                                                placement="top"
                                                overlay={
                                                    <Tooltip className="ttp-top">
                                                        { account.status == 1 ? __('cuenta_activa') : __('cuenta_inactiva') }
                                                    </Tooltip>
                                                }
                                            >
                                                <StatusButton 
                                                    status={account.status} 
                                                    id={account.id} 
                                                    updateRoute='accounting-accounts.status'
                                                    reloadUrl={route('accounting-accounts.index')}
                                                    reloadResource="accounting-accounts"
                                                />
                                            </OverlayTrigger>
                                        )}

                                        {/* Editar */}
                                        {permissions?.['accounting-accounts.edit'] && (
                                            <OverlayTrigger
                                                key={"edit-"+account.id}
                                                placement="top"
                                                overlay={
                                                    <Tooltip className="ttp-top">
                                                        { __('editar') }
                                                    </Tooltip>
                                                }
                                            >
                                                <Link href={route('accounting-accounts.edit', account.id)} className="btn btn-sm btn-info ms-1" >
                                                    <i className="la la-edit"></i>
                                                </Link>
                                            </OverlayTrigger>
                                        )}

                                        {/* Eliminar */}
                                        {permissions?.['accounting-accounts.destroy'] && (
                                            <OverlayTrigger
                                                key={"delete-"+account.id}
                                                placement="top"
                                                overlay={
                                                    <Tooltip className="ttp-top">
                                                        { __('eliminar') }
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
                        router.get(route("accounting-accounts.index"), {
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
