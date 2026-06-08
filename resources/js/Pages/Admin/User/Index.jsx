import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { OverlayTrigger, Table, Tooltip } from 'react-bootstrap';
import 'react-datepicker/dist/react-datepicker.css';

//Components:
import ActiveFiltersLegend from '@/Components/ActiveFiltersLegend';
import AdHocFiltersDropdown from '@/Components/AdHocFiltersDropdown';
import ColumnFilter from '@/Components/ColumnFilter';
import FilterRow from '@/Components/FilterRow';
import { Pagination } from '@/Components/Pagination';
import RecordsPerPage from '@/Components/RecordsPerPage';
import ShowRegister from '@/Components/ShowRegister/ShowRegister';
import ShowRegisterButton from '@/Components/ShowRegister/ShowRegisterButton';
import { SortControl } from '@/Components/SortControl';
import SpinnerInline from '@/Components/SpinnerInline';
import StatusButton from '@/Components/StatusButton';
import TableExporter from '@/Components/TableExporter';

//Hooks:
import { useInertiaLoading } from '@/Hooks/useInertiaLoading';
import { useTableManagement } from '@/Hooks/useTableManagement';
import { useTranslation } from '@/Hooks/useTranslation';

//Partials:
import UserShowView from '@/Pages/Admin/User/Partials/UserShowView';

//Utils:
import renderCellContent from '@/Utils/renderCellContent.jsx';

const EMPTY = Object.freeze([]);
const EMPTY_OBJ = Object.freeze({});

export default function Index({ 
    auth, 
    session, 
    title, 
    subtitle, 
    users, 
    countries,
    queryParams: rawQueryParams = {}, 
    availableLocales 
}){
    const __ = useTranslation();
    const { props } = usePage();
	const queryParams = (rawQueryParams && typeof rawQueryParams === 'object') ? rawQueryParams : EMPTY_OBJ;
    const adhocFilters = props.adhocFilters ?? EMPTY;
    const indexRouteName = 'users.index';
    const indexRouteParams = {};
    const { loading } = useInertiaLoading();
    const legendItems = props.activeFiltersLegend || [];
    const hasActiveFilters = legendItems.length > 0;
    
    //Columna Show Register
    const [showId, setShowId] = useState(null);
    const [showPanelOpen, setShowPanelOpen] = useState(false);
    const [showLoading, setShowLoading] = useState(false);

    useEffect(() => {
        const removeStart = router.on('start', () => setShowLoading(true));
        const removeFinish = router.on('finish', () => setShowLoading(false));

        return () => {
            removeStart();
            removeFinish();
        };
    }, []);

    const handleShowRegister = (user) => {
        setShowId(user.id);
        setShowPanelOpen(true);
    };

    const handleCloseShowPanel = () => {
        setShowPanelOpen(false);
        setShowId(null);
    };

	//Columnas:
	const columns = [
		{ key: 'name', label: __('nombre'), sort: true, filter: 'text', class_th: '', class_td: '', placeholder: __('nombre_filtrar') },
		{ key: 'created_at', label: __('fecha_alta'), sort: true, filter: 'date', class_th: 'text-center', class_td: 'text-end', placeholder: __('fecha_alta'), dateKeys: ['date_from', 'date_to'] },
		{ key: 'email', label: __('email'), sort: true, filter: 'text', class_th: '', class_td: '', placeholder: __('email_filtrar') },
		{ key: 'phones', label: __('telefonos'), sort: true, filter: 'text', class_th: '', class_td: '', placeholder: __('telefonos_filtrar'), exportValue: (v) => Array.isArray(v) ? v.map(p => p.e164).filter(Boolean).join('; ') : (v ?? '') },
		{ key: 'categories', label: __('categoria'), sort: true, filter: 'text', class_th: '', class_td: '', placeholder: __('categorias_filtrar'), exportValue: (v) => Array.isArray(v) ? v.filter(Boolean).join('; ') : (v ?? '') },
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
                        <AdHocFiltersDropdown
                            filters={adhocFilters}
                            routeName={indexRouteName}
                            routeParams={indexRouteParams}
                            queryParams={queryParams}
                        />

						{/* A DERECHA */}
						{/* Registros por página */}
						<RecordsPerPage perPage={perPage} setPerPage={setPerPage} />

						{/* Exportar */}
						<TableExporter filename={ __('usuarios') } columns={columns} fetchData={filteredData}/>
					</div>
				</div>

                <div className="d-flex justify-content-between align-items-center my-2">
                    <ActiveFiltersLegend 
                        items={legendItems} 
                        routeName={indexRouteName}
                        routeParams={indexRouteParams}
                    />
                    {hasActiveFilters && loading ? (
                        <SpinnerInline text={__('cargando') ?? 'Cargando…'} />
                    ) : null}
                </div>

				{/* Tabla */}
				<div className="table-responsive">
					<Table className="table table-nowrap table-striped align-middle mb-0" id="tblUsers">
						{/* Cabecera */}
						<thead>
							<tr>
                                <th className="text-center first-column">
                                    &nbsp;
                                </th>

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
                            indexRoute={indexRouteName}
                            indexParams={undefined}
                            PrependColumns={1}
						/>

						<tbody>
							{users.data.map((user) => (
								<tr key={user.id}>
                                    {/* Columna "show" fija */}
                                    <td className="text-center">
                                        <ShowRegisterButton onClick={() => handleShowRegister(user)} />
                                    </td>

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
										{permissions?.['users.destroy'] && (
											<OverlayTrigger
												key={"delete-"+user.id}
												placement="top"
												overlay={
													<Tooltip className="ttp-top">
														{ __('eliminar') }
													</Tooltip>
												}
											>
												<button
													type="button"
													className="btn btn-sm btn-danger ms-1"
													title={ __('eliminar') }
													onClick={() => handleDelete(user.id)}
												>
													<i className="la la-trash"></i>
												</button>
											</OverlayTrigger>
										)}
									</td>
								</tr>
							))}
						</tbody>
					</Table>
				</div>

                <ShowRegister
                    id={showId}
                    open={showPanelOpen}
                    onClose={handleCloseShowPanel}
                    routeName="users.show"        // tu ruta JSON
                    title={__('usuario')}         // o lo que quieras
                    ViewComponent={UserShowView}
                />

				<Pagination 
					links={users.meta.links} 
					totalRecords={users.meta.total} 
					currentPage={users.meta.current_page} 
					perPage={users.meta.per_page}
					onPageChange={(page) => {
						router.get(route(indexRouteName, indexRouteParams), {
							...queryParams,
							page,
							per_page: perPage,
							// sort_field: sortParams.sort_field,
							// sort_direction: sortParams.sort_direction,
						}, { preserveState: true, replace: true });
					}}
				/>
			</div>
		</AdminAuthenticatedLayout>
	);
}