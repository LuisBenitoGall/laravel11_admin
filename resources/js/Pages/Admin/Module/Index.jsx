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

export default function Index({ auth, session, title, subtitle, modules, levels, queryParams: rawQueryParams = null, availableLocales }) {
	const queryParams = typeof rawQueryParams === 'object' && rawQueryParams !== null ? rawQueryParams : {};
	const __ = useTranslation();
	
	const levelsArray = Object.entries(levels || {}).map(([key, value]) => ({
		value: key,
		label: value
	}));

	//Columnas:
    const columns = [
        { key: 'label', label: __('modulo'), sort: true, filter: 'text', type: 'link', link: 'modules.edit', class_th: '', class_td: '', placeholder: __('modulo_filtrar') },
		{ key: 'level', label: __('nivel'), sort: true, filter: 'select', options: levelsArray, class_th: '', class_td: '', placeholder: __('nivel_filtrar') },
        { key: 'icon', label: __('icono'), sort: false, filter: '', type: 'html', class_th: 'text-center', class_td: 'text-center', dateKeys: ['date_from', 'date_to'], export: 'html' },
        { key: 'color', label: __('color'), sort: false, filter: '', type: 'html', class_th: 'text-center', class_td: 'text-center', export: 'html' }
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
        table: 'tblModules',
        allColumnKeys: columns.map(col => col.key),
        entityName: 'modules',
        indexRoute: 'modules.index',
        destroyRoute: 'modules.destroy',
        filteredDataRoute: 'modules.filtered-data',
        labelName: 'modulo',
        queryParams
    });	

	//Acciones:
	const actions = [];
    if (permissions?.['modules.create']) {
        actions.push({
            text: __('modulo_nuevo'),
            icon: 'la-plus',
            url: 'modules.create',
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
						<TableExporter filename={ __('modulos') } columns={columns} fetchData={filteredData}/>
            		</div>
				</div>

				{/* Tabla */}
				<div className="table-responsive">
					<Table className="table table-nowrap table-striped align-middle mb-0" id="tblModules">
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
							{modules.data.map((module) => (
								<tr key={"module-"+module.id}>	
									{columns.map(col => (
										<td key={col.key} className={`${col.class_td ?? ''} ${visibleColumns.includes(col.key) ? '' : 'd-none'}`.trim()}>
											{renderCellContent(module[col.key], col, module)}
										</td>
									))}

									{/* Acciones */}
									<td className="text-end">
										{/* Activa - inactiva */}
										{permissions?.['modules.edit'] && (
											<OverlayTrigger
												key={"status-"+module.id}
												placement="top"
												overlay={
													<Tooltip className="ttp-top">
														{ module.status == 1 ? __('modulo_activo') : __('modulo_inactivo') }
													</Tooltip>
												}
											>
												<StatusButton 
													status={module.status} 
													id={module.id} 
													updateRoute='modules.status'
													reloadUrl={route('modules.index')}
  													reloadResource="modules"
												/>
											</OverlayTrigger>
										)}

										{/* Editar */}
										{permissions?.['modules.edit'] && (
											<OverlayTrigger
												key={"edit-"+module.id}
												placement="top"
												overlay={
													<Tooltip className="ttp-top">
														{ __('editar') }
													</Tooltip>
												}
											>
												<Link href={route('modules.edit', module.id)} className="btn btn-sm btn-info ms-1" >
													<i className="la la-edit"></i>
												</Link>
											</OverlayTrigger>
										)}

										{/* Eliminar */}
										{permissions?.['modules.destroy'] && (
											<OverlayTrigger
												key={"delete-"+module.id}
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
                                                        onClick={() => handleDelete(module.id)}
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
                    links={modules.meta.links} 
                    totalRecords={modules.meta.total} 
                    currentPage={modules.meta.current_page} 
                    perPage={modules.meta.per_page}
                    onPageChange={(page) => {
                        router.get(route("modules.index"), {
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