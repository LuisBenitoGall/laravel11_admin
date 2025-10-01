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

export default function Index({ auth, session, title, subtitle, stock_movements, queryParams: rawQueryParams = null, availableLocales }) {
	const queryParams = typeof rawQueryParams === 'object' && rawQueryParams !== null ? rawQueryParams : {};
	const __ = useTranslation();

	//Columnas:
    const columns = [
        { key: 'name', label: __('movimiento'), sort: true, filter: 'text', type: 'link', link: 'stock-movements.edit', class_th: '', class_td: '', placeholder: __('movimiento_filtrar') },
		{ key: 'acronym', label: __('siglas'), sort: true, filter: 'text', class_th: 'text-center', class_td: 'text-center', placeholder: __('siglas_filtrar') },
        { key: 'sign', label: __('signo'), sort: true, filter: 'text', class_th: '', class_td: '', placeholder: __('signo_filtrar') },
        { key: 'explanation', label: __('observaciones'), sort: true, filter: 'text', class_th: '', class_td: '', placeholder: __('observaciones_filtrar') }
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
        table: 'tblStockMovements',
        allColumnKeys: columns.map(col => col.key),
        entityName: 'stock_movements',
        indexRoute: 'stock-movements.index',
        destroyRoute: 'stock-movements.destroy',
        filteredDataRoute: 'stock-movements.filtered-data',
        labelName: 'stock_movimiento',
        queryParams
    });	

	//Acciones:
	const actions = [];
    if (permissions?.['stock-movements.create']) {
        actions.push({
            text: __('movimiento_nuevo'),
            icon: 'la-plus',
            url: 'stock-movements.create',
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
					<Table className="table table-nowrap table-striped align-middle mb-0" id="tblstock_movements">
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
							{stock_movements.data.map((movement) => (
								<tr key={"movement-"+movement.id}>	
									{columns.map(col => (
										<td key={col.key} className={`${col.class_td ?? ''} ${visibleColumns.includes(col.key) ? '' : 'd-none'}`.trim()}>
											{renderCellContent(movement[col.key], col, movement)}
										</td>
									))}

									{/* Acciones */}
									<td className="text-end">
										{/* Activa - inactiva */}
										{permissions?.['stock-movements.edit'] && (
											<OverlayTrigger
												key={"status-"+movement.id}
												placement="top"
												overlay={
													<Tooltip className="ttp-top">
														{ movement.status == 1 ? __('unidad_activa') : __('unidad_inactiva') }
													</Tooltip>
												}
											>
												<StatusButton 
													status={movement.status} 
													id={movement.id} 
													updateRoute='stock-movements.status'
													reloadUrl={route('stock-movements.index')}
  													reloadResource="stock-movements"
												/>
											</OverlayTrigger>
										)}

										{/* Editar */}
										{permissions?.['stock-movements.edit'] && (
											<OverlayTrigger
												key={"edit-"+movement.id}
												placement="top"
												overlay={
													<Tooltip className="ttp-top">
														{ __('editar') }
													</Tooltip>
												}
											>
												<Link href={route('stock-movements.edit', movement.id)} className="btn btn-sm btn-info ms-1" >
													<i className="la la-edit"></i>
												</Link>
											</OverlayTrigger>
										)}

										{/* Eliminar */}
										{permissions?.['stock-movements.destroy'] && (
											<OverlayTrigger
												key={"delete-"+movement.id}
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
                                                        onClick={() => handleDelete(movement.id)}
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
                    links={stock_movements.meta.links} 
                    totalRecords={stock_movements.meta.total} 
                    currentPage={stock_movements.meta.current_page} 
                    perPage={stock_movements.meta.per_page}
                    onPageChange={(page) => {
                        router.get(route("stock_movements.index"), {
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