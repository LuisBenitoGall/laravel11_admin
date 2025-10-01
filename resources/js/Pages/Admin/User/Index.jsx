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
import TextInput from '@/Components/TextInput'; 

//Hooks:
import { useSweetAlert } from '@/Hooks/useSweetAlert';
import { useTableManagement } from '@/Hooks/useTableManagement';
import { useTranslation } from '@/Hooks/useTranslation';

//Utils:
import renderCellContent from '@/Utils/renderCellContent.jsx';

export default function Index({ auth, session, title, subtitle, users, queryParams: rawQueryParams = {}, availableLocales }){
	const queryParams = typeof rawQueryParams === 'object' && rawQueryParams !== null ? rawQueryParams : {};
    const __ = useTranslation();

	//Columnas:
	const columns = [
		{ key: 'name', label: __('nombre'), sort: true, filter: 'text', class_th: '', class_td: '', placeholder: __('nombre_filtrar') },
		{ key: 'created_at', label: __('fecha_alta'), sort: true, filter: 'date', class_th: 'text-center', class_td: 'text-end', placeholder: __('fecha_alta'), dateKeys: ['date_from', 'date_to'] },
		{ key: 'email', label: __('email'), sort: true, filter: 'text', class_th: '', class_td: '', placeholder: __('email_filtrar') },
		{ key: 'phones', label: __('telefonos'), sort: true, filter: 'text', class_th: '', class_td: '', placeholder: __('telefonos_filtrar') },
		{ key: 'categories', label: __('categoria'), sort: true, filter: 'text', class_th: '', class_td: '', placeholder: __('categorias_filtrar') },
		{ key: 'avatar', label: __('imagen'), sort: false, filter: '', type: 'image', icon: 'user-tie', class_th: 'text-center', class_td: 'text-center', placeholder: '' }
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
		table: 'tblUsers',
		allColumnKeys: columns.map(col => col.key),
		entityName: 'users',
		indexRoute: 'users.index',
		destroyRoute: 'users.destroy',
		filteredDataRoute: 'users.filtered-data',
		labelName: 'usuarios',
		queryParams
	});

	//Acciones:
	const actions = [];
    if (permissions?.['users.create']) {
        actions.push({
            text: __('usuario_nuevo'),
            icon: 'la-plus',
            url: 'users.create',
            modal: false
        });
    }

	// Formatea el texto del input con el rango de fechas seleccionado
	// const formattedDateRange = startDate && endDate? `${format(startDate, 'dd/MM/yyyy')} - ${format(endDate, 'dd/MM/yyyy')}`: '';

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
						<TableExporter filename={ __('usuarios') } columns={columns} fetchData={filteredData}/>
					</div>
				</div>

				{/* Tabla */}
				<div className="table-responsive">
					<Table className="table table-nowrap table-striped align-middle mb-0" id="tblUsers">
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
							{users.data.map((user) => (
								<tr key={user.id}>
									{columns.map(col => (
										<td key={col.key} className={`${col.class_td ?? ''} ${visibleColumns.includes(col.key) ? '' : 'd-none'}`.trim()}>
											{renderCellContent(user[col.key], col, user)}
										</td>
                                        ))
                                    }

									{/* Acciones */}
									<td className="text-end">
										{/* Activo - inactivo */}
										<OverlayTrigger
          									key={"status-"+user.id}
          									placement="top"
          									overlay={
												<Tooltip className="ttp-top">
													{ user.status == 1 ? __('usuario_activo') : __('usuario_inactivo') }
												</Tooltip>
          									}
        								>
											<StatusButton 
												status={user.status} 
												id={user.id} 
												updateRoute='users.status'
												reloadUrl={route('users.index')}
  												reloadResource="users"
											/>
										</OverlayTrigger>

										{/* Editar */}
										<OverlayTrigger
											key={"edit-"+user.id}
											placement="top"
											overlay={
												<Tooltip className="ttp-top">
													{ __('editar') }
												</Tooltip>
											}
										>
											<Link href={route('users.edit', user.id)} className="btn btn-sm btn-info ms-1" >
												<i className="la la-edit"></i>
											</Link>
										</OverlayTrigger>

										{/* Eliminar */}
										<OverlayTrigger
											key={"delete-"+user.id}
											placement="top"
											overlay={
												<Tooltip className="ttp-top">
													{ __('eliminar') }
												</Tooltip>
											}
										>
											<Link href={route('users.destroy', user.id)} className="btn btn-sm btn-danger ms-1" title={ __('eliminar') }>
												<i className="la la-trash"></i>
											</Link>
										</OverlayTrigger>
									</td>
								</tr>
							))}
						</tbody>
					</Table>
				</div>

				<Pagination 
					links={users.meta.links} 
					totalRecords={users.meta.total} 
					currentPage={users.meta.current_page} 
					perPage={users.meta.per_page}
					onPageChange={(page) => {
						router.get(route("users.index"), {
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