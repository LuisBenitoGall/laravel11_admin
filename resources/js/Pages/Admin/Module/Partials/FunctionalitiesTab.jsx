import React, { useState, useEffect } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { OverlayTrigger, Table, Tooltip } from 'react-bootstrap';

//Components:
import ColumnFilter from '@/Components/ColumnFilter';
import FilterRow from '@/Components/FilterRow';
import { Pagination } from '@/Components/Pagination';
import RecordsPerPage from '@/Components/RecordsPerPage';
import { SortControl } from '@/Components/SortControl';
import TableExporter from '@/Components/TableExporter';

//Hooks:
import { useSweetAlert } from '@/Hooks/useSweetAlert';
import { useTableManagement } from '@/Hooks/useTableManagement';
import { useTranslation } from '@/Hooks/useTranslation';

export default function FunctionalitiesTab({ 
    module_data, 
    functionalities, 
    refreshKey, 
    queryParams: rawQueryParams = {}, 
    availableLocales, 
    onDeleted 
}) {
    const queryParams = typeof rawQueryParams === 'object' && rawQueryParams !== null ? rawQueryParams : {};
    const __ = useTranslation();

    //Columnas:
    const columns = [
        { key: 'label', label: __('etiqueta'), sort: true, filter: 'text', class_th: '', class_td: '', placeholder: __('etiqueta_filtrar') },
        { key: 'name', label: __('funcionalidad'), sort: true, filter: 'text', class_th: '', class_td: '', placeholder: __('funcionalidad_filtrar') }
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
        table: 'tblFunctionalities',
        allColumnKeys: columns.map(col => col.key),
        entityName: 'functionalities',
        indexRoute: null,
        destroyRoute: 'functionalities.destroy',
        filteredDataRoute: 'functionalities.filtered-data',
        routeParams: { module_id: module_data.id },
        labelName: 'funcionalidad',
        queryParams: { ...queryParams, module_id: module_data.id }
    });

    const [tableData, setTableData] = useState(() => {
        return {
            data: Array.isArray(functionalities?.data) ? functionalities.data : (Array.isArray(functionalities) ? functionalities : []),
            meta: functionalities?.meta ?? {},
            links: functionalities?.links ?? []
        };
    });

    const refreshData = async () => {
        try {
            const response = await filteredData({ module_id: module_data.id });
            const newData = response?.functionalities ?? response?.data ?? response ?? [];
            setTableData({
                data: Array.isArray(newData) ? newData : [],
                meta: response?.meta ?? {},
                links: response?.links ?? []
            });

            if (typeof onDeleted === 'function') {
                onDeleted();
            }
        } catch (error) {
            console.error('Error fetching functionalities:', error);
            setTableData({
                data: [],
                meta: {},
                links: []
            });
        }
    };

    useEffect(() => {
        refreshData();
    }, [refreshKey]);

    return (
        <div>
            <div className="row">
                <div className="controls d-flex align-items-center">
                    <ColumnFilter columns={columns} visibleColumns={visibleColumns} toggleColumn={toggleColumnVisibility} />
                    <RecordsPerPage perPage={perPage} setPerPage={setPerPage} />
                    <TableExporter filename={ __('funcionalidades') } columns={columns} fetchData={filteredData}/>
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
                        {tableData.data.map((func) => (
                            <tr key={`func-${func.id}`}>
                                {columns.map(col => (
                                    <td key={col.key} className={`${col.class_td ?? ''} ${visibleColumns.includes(col.key) ? '' : 'd-none'}`.trim()}>
                                        {func[col.key]}
                                    </td>
                                ))}

                                {/* Acciones */}
                                <td className="text-end">
                                    {/* Editar */}
                                    {permissions?.['modules.edit'] && (
                                        <OverlayTrigger
                                            key={"edit-"+func.id}
                                            placement="top"
                                            overlay={<Tooltip className="ttp-top">{ __('editar') }</Tooltip>}
                                        >
                                            <Link href={route('functionalities.edit', func.id)} className="btn btn-sm btn-info ms-1">
                                                <i className="la la-edit"></i>
                                            </Link>
                                        </OverlayTrigger>
                                    )}

                                    {/* Eliminar */}
                                    {permissions?.['modules.edit'] && (
                                        <OverlayTrigger
                                            key={"delete-"+func.id}
                                            placement="top"
                                            overlay={<Tooltip className="ttp-top">{ __('eliminar') }</Tooltip>}
                                        >
                                            <Link
                                                href={route('functionalities.destroy', func.id)}
                                                className="btn btn-sm btn-danger ms-1"
                                                title={ __('eliminar') }
                                            >
                                                <i className="la la-trash"></i>
                                            </Link>
                                                
                                                
                                                
                                                {/* <button
                                                    type="button"
                                                    className="btn btn-sm btn-danger ms-1"
                                                    onClick={() => handleDelete(func.id, refreshData)}
                                                >
                                                    <i className="la la-trash"></i>
                                                </button> */}
                                        </OverlayTrigger>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>

            {/* Paginación */}
            {tableData.meta?.total > 0 && (
                <Pagination 
                    links={tableData.links || []} 
                    totalRecords={tableData.meta?.total || 0} 
                    currentPage={tableData.meta?.current_page || 1} 
                    perPage={tableData.meta?.per_page || perPage}
                    onPageChange={(page) => {
                        const newParams = {
                            ...queryParams,
                            module_id: module_data.id,
                            page,
                            per_page: perPage,
                            sort_field: sortParams.sort_field,
                            sort_direction: sortParams.sort_direction,
                        };
                        refreshData();
                    }}
                />
            )}
        </div>
    );
}