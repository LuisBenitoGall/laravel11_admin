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

export default function Index({ auth, session, title, subtitle, units, levels, queryParams: rawQueryParams = null, availableLocales }) {
	const queryParams = typeof rawQueryParams === 'object' && rawQueryParams !== null ? rawQueryParams : {};
	const __ = useTranslation();
	
	const levelsArray = Object.entries(levels || {}).map(([key, value]) => ({
		value: key,
		label: value
	}));

	//Columnas:
    const columns = [
        { key: 'name', label: __('unidad'), sort: true, filter: 'text', type: 'link', link: 'units.edit', class_th: '', class_td: '', placeholder: __('unidad_filtrar') },
		{ key: 'symbol', label: __('simbolo'), sort: true, filter: 'text', class_th: '', class_td: '', placeholder: __('simbolo_filtrar') }
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
        table: 'tblUnits',
        allColumnKeys: columns.map(col => col.key),
        entityName: 'units',
        indexRoute: 'units.index',
        destroyRoute: 'units.destroy',
        filteredDataRoute: 'units.filtered-data',
        labelName: 'unidad',
        queryParams
    });	

	//Acciones:
	const actions = [];
    if (permissions?.['units.create']) {
        actions.push({
            text: __('unidad_nueva'),
            icon: 'la-plus',
            url: 'units.create',
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
						<TableExporter filename={ __('unidades') } columns={columns} fetchData={filteredData}/>
					</div>
				</div>
				
				{/* Tabla */}
				<div className="table-responsive">
					<Table className="table table-nowrap table-striped align-middle mb-0" id="tblUnits">
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
							{units.data.map((unit) => (
								<tr key={"unit-"+unit.id}>	
									{columns.map(col => (
										<td key={col.key} className={`${col.class_td ?? ''} ${visibleColumns.includes(col.key) ? '' : 'd-none'}`.trim()}>
											{renderCellContent(unit[col.key], col, unit)}
										</td>
									))}

									{/* Acciones */}
									<td className="text-end">
										{/* Activa - inactiva */}
										{permissions?.['units.edit'] && (
											<OverlayTrigger
												key={"status-"+unit.id}
												placement="top"
												overlay={
													<Tooltip className="ttp-top">
														{ unit.status == 1 ? __('unidad_activa') : __('unidad_inactiva') }
													</Tooltip>
												}
											>
												<StatusButton 
													status={unit.status} 
													id={unit.id} 
													updateRoute='units.status'
													reloadUrl={route('units.index')}
  													reloadResource="units"
												/>
											</OverlayTrigger>
										)}

										{/* Editar */}
										{permissions?.['units.edit'] && (
											<OverlayTrigger
												key={"edit-"+unit.id}
												placement="top"
												overlay={
													<Tooltip className="ttp-top">
														{ __('editar') }
													</Tooltip>
												}
											>
												<Link href={route('units.edit', unit.id)} className="btn btn-sm btn-info ms-1" >
													<i className="la la-edit"></i>
												</Link>
											</OverlayTrigger>
										)}

										{/* Eliminar */}
										{permissions?.['units.destroy'] && (
											<OverlayTrigger
												key={"delete-"+unit.id}
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
                                                        onClick={() => handleDelete(unit.id)}
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
                    links={units.meta.links} 
                    totalRecords={units.meta.total} 
                    currentPage={units.meta.current_page} 
                    perPage={units.meta.per_page}
                    onPageChange={(page) => {
                        router.get(route("units.index"), {
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