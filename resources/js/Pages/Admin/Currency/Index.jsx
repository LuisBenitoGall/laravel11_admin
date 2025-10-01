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

export default function Index({ auth, session, title, subtitle, currencies, queryParams: rawQueryParams = {}, availableLocales }) {
    const queryParams = typeof rawQueryParams === 'object' && rawQueryParams !== null ? rawQueryParams : {};
    const __ = useTranslation();

    //Columnas:
    const columns = [
        { key: 'name', label: __('moneda'), sort: true, filter: 'text', class_th: '', class_td: '', placeholder: __('moneda_filtrar') },
        { key: 'code', label: __('codigo'), sort: true, filter: 'text', class_th: '', class_td: '', placeholder: __('codigo_filtrar') },
        { key: 'number', label: __('numero'), sort: true, filter: 'text', class_th: 'text-center', class_td: 'text-end', placeholder: __('numero_filtrar') },
        { key: 'symbol', label: __('simbolo'), sort: true, filter: 'text', class_th: 'text-center', class_td: 'text-center', placeholder: __('simbolo_filtrar') }
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
        table: 'tblCurrencies',
        allColumnKeys: columns.map(col => col.key),
        entityName: 'currencies',
        indexRoute: 'currencies.index',
        destroyRoute: 'currencies.destroy',
        filteredDataRoute: 'currencies.filtered-data',
        labelName: 'moneda',
        queryParams
    });

    //Acciones:
    const actions = [];
    if (permissions?.['currencies.create']) {
        actions.push({
            text: __('moneda_nueva'),
            icon: 'la-plus',
            url: 'currencies.create',
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
                        <TableExporter filename={ __('monedas') } columns={columns} fetchData={filteredData}/>
                    </div>
                </div>

                {/* Tabla */}
                <div className="table-responsive">
                    <Table className="table table-nowrap table-striped align-middle mb-0" id="tblCurrencies">
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
                            {currencies.data.map((currency) => (
                                <tr key={"currency-"+currency.id}>
                                    {columns.map(col => (
                                        <td key={col.key} className={`${col.class_td ?? ''} ${visibleColumns.includes(col.key) ? '' : 'd-none'}`.trim()}>
                                            {renderCellContent(currency[col.key], col, currency)}
                                        </td>
                                    ))}

                                    {/* Acciones */}
                                    <td className="text-end">
                                        {/* Estado */}
                                        {permissions?.['currencies.edit'] && (
                                            <OverlayTrigger
                                                key={"status-"+currency.id}
                                                placement="top"
                                                overlay={<Tooltip className="ttp-top">{ currency.status == 1 ? __('moneda_activa') : __('moneda_inactiva') }</Tooltip>}
                                            >
                                                <StatusButton 
                                                    status={currency.status} 
                                                    id={currency.id} 
                                                    updateRoute='currencies.status'
                                                    reloadUrl={route('currencies.index')}
  													reloadResource="currencies"
                                                />
                                            </OverlayTrigger>
                                        )}

                                        {/* Editar */}
                                        {permissions?.['currencies.edit'] && (
                                            <OverlayTrigger
                                                key={"edit-"+currency.id}
                                                placement="top"
                                                overlay={<Tooltip className="ttp-top">{ __('editar') }</Tooltip>}
                                            >
                                                <Link href={route('currencies.edit', currency.id)} className="btn btn-sm btn-info ms-1">
                                                    <i className="la la-edit"></i>
                                                </Link>
                                            </OverlayTrigger>
                                        )}

                                        {/* Eliminar */}
                                        {permissions?.['currencies.destroy'] && (
                                            <OverlayTrigger
                                                key={"delete-"+currency.id}
                                                placement="top"
                                                overlay={<Tooltip className="ttp-top">{ __('eliminar') }</Tooltip>}
                                            >
                                                <span>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-danger ms-1"
                                                        onClick={() => handleDelete(currency.id)}
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
                    links={currencies.meta.links} 
                    totalRecords={currencies.meta.total} 
                    currentPage={currencies.meta.current_page} 
                    perPage={currencies.meta.per_page}
                    onPageChange={(page) => {
                        router.get(route("currencies.index"), {
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