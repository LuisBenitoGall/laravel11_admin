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

export default function Index({ auth, session, title, subtitle, types, queryParams: rawQueryParams = null, availableLocales }) {
	const queryParams = typeof rawQueryParams === 'object' && rawQueryParams !== null ? rawQueryParams : {};
	const __ = useTranslation();

    //Columnas:
    const columns = [
        { key: 'code', label: __('codigo'), sort: true, filter: 'text', class_th: '', class_td: '', placeholder: __('codigo_filtrar') },
		{ key: 'name', label: __('nombre'), sort: true, filter: 'text', class_th: '', class_td: '', placeholder: __('nombre_filtrar') },
        { key: 'level', label: __('nivel'), sort: true, filter: 'text', class_th: 'text-center', class_td: 'text-center', placeholder: __('nivel_filtrar') },
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
        table: 'tblAccountingAccountTypes',
        allColumnKeys: columns.map(col => col.key),
        entityName: 'accounting_account_types',
        indexRoute: 'accounting-account-types.index',
        destroyRoute: 'accounting-account-types.destroy',
        filteredDataRoute: 'accounting-account-types.filtered-data',
        labelName: 'grupo_contable',
        queryParams
    });	

    //Acciones:
	const actions = [];
    if (permissions?.['accounting-account-types.create']) {
        actions.push({
            text: __('grupo_nuevo'),
            icon: 'la-plus',
            url: 'accounting-account-types.create',
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
                        <Table className="table table-nowrap table-striped align-middle mb-0" id="tblAccountingAccountTypes">
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
                                {types.data.map((type) => (
                                    <tr key={"type-"+type.id}>	
                                        {columns.map(col => (
                                            <td key={col.key} className={`${col.class_td ?? ''} ${visibleColumns.includes(col.key) ? '' : 'd-none'}`.trim()}>
                                                {renderCellContent(type[col.key], col, type)}
                                            </td>
                                        ))}
    
                                        {/* Acciones */}
                                        <td className="text-end">
                                            {/* Activa - inactiva */}
                                            {/* {permissions?.['accounting-account-types.edit'] && (
                                                <OverlayTrigger
                                                    key={"status-"+type.id}
                                                    placement="top"
                                                    overlay={
                                                        <Tooltip className="ttp-top">
                                                            { type.status == 1 ? __('unidad_activa') : __('unidad_inactiva') }
                                                        </Tooltip>
                                                    }
                                                >
                                                    <StatusButton 
                                                        status={type.status} 
                                                        id={type.id} 
                                                        updateRoute='accounting-account-types.status'
                                                        reloadUrl={route('accounting-account-types.index')}
  													    reloadResource="accounting-account-types"
                                                    />
                                                </OverlayTrigger>
                                            )} */}
    
                                            {/* Editar */}
                                            {permissions?.['accounting-account-types.edit'] && (
                                                <OverlayTrigger
                                                    key={"edit-"+type.id}
                                                    placement="top"
                                                    overlay={
                                                        <Tooltip className="ttp-top">
                                                            { __('editar') }
                                                        </Tooltip>
                                                    }
                                                >
                                                    <Link href={route('accounting-account-types.edit', type.id)} className="btn btn-sm btn-info ms-1" >
                                                        <i className="la la-edit"></i>
                                                    </Link>
                                                </OverlayTrigger>
                                            )}
    
                                            {/* Eliminar */}
                                            {permissions?.['accounting-account-types.destroy'] && (
                                                <OverlayTrigger
                                                    key={"delete-"+type.id}
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
                                                            onClick={() => handleDelete(type.id)}
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
                        links={types.meta.links} 
                        totalRecords={types.meta.total} 
                        currentPage={types.meta.current_page} 
                        perPage={types.meta.per_page}
                        onPageChange={(page) => {
                            router.get(route("accounting-account-types.index"), {
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
