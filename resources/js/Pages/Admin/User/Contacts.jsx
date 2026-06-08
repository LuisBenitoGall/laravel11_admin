import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect, useMemo } from 'react';
import { OverlayTrigger, Table, Tooltip } from 'react-bootstrap';
import 'react-datepicker/dist/react-datepicker.css';

//Components:
import ActiveFiltersLegend from '@/Components/ActiveFiltersLegend';
import AdHocFiltersDropdown from '@/Components/AdHocFiltersDropdown';
import ColumnFilter from '@/Components/ColumnFilter';
import FilterRow from '@/Components/FilterRow';
import { Pagination } from '@/Components/Pagination';
import RecordsPerPage from '@/Components/RecordsPerPage';
import { SortControl } from '@/Components/SortControl';
import ShowRegister from '@/Components/ShowRegister/ShowRegister';
import ShowRegisterButton from '@/Components/ShowRegister/ShowRegisterButton';
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
    contacts, 
    contact_types, 
    queryParams: rawQueryParams = {}, 
    availableLocales 
}) {
    const __ = useTranslation();
    const { props } = usePage();
    const queryParams = (rawQueryParams && typeof rawQueryParams === 'object') ? rawQueryParams : EMPTY_OBJ;
    const adhocFilters = props.adhocFilters ?? EMPTY;
    const indexRouteName = 'users.contacts';
    const indexRouteParams = {};
    const { loading } = useInertiaLoading();
    const legendItems = props.activeFiltersLegend || [];
    const hasActiveFilters = legendItems.length > 0;

    //Columna Show Register
    const [showId, setShowId] = useState(null);
    const [showPanelOpen, setShowPanelOpen] = useState(false);

    const handleShowRegister = (user) => {
        setShowId(user.id);
        setShowPanelOpen(true);
    };

    const handleCloseShowPanel = () => {
        setShowPanelOpen(false);
        setShowId(null);
    };

    const contactTypesArray = useMemo(() => {
        return Object.entries(contact_types || {}).map(([key, value]) => ({
            value: key,
            label: value,
        }));
    }, [contact_types]);

    //Columnas:
    const columns = useMemo(() => ([
        { key: 'name', label: __('nombre'), sort: true, filter: 'text', class_th: '', class_td: '', placeholder: __('nombre_filtrar') },
        { key: 'created_at', label: __('fecha_alta'), sort: true, filter: 'date', class_th: 'text-center', class_td: 'text-end', placeholder: __('fecha_alta'), dateKeys: ['date_from', 'date_to'] },
        { key: 'email', label: __('email'), sort: true, filter: 'text', class_th: '', class_td: '', placeholder: __('email_filtrar') },
        { key: 'phones', label: __('telefonos'), sort: false, filter: 'text', class_th: '', class_td: '', placeholder: __('telefonos_filtrar'), exportValue: (v) => Array.isArray(v) ? v.map(p => p.e164).filter(Boolean).join('; ') : (v ?? '') },
        { key: 'position', label: __('cargo'), sort: false, filter: 'text', class_th: '', class_td: '', placeholder: __('cargo_filtrar') },
        { key: 'contact_type', label: __('contacto_tipo'), sort: false, filter: 'select', options: contactTypesArray, class_th: '', class_td: '', placeholder: __('contacto_tipo_filtrar') },
        { key: 'companies', label: __('empresa'), sort: false, filter: 'text', class_th: '', class_td: '', placeholder: __('empresa_filtrar'), exportValue: (v) => Array.isArray(v) ? v.map(c => c.name).filter(Boolean).join('; ') : (v ?? '') },
        { key: 'avatar', label: __('imagen'), sort: false, filter: '', type: 'image', icon: 'user-tie', class_th: 'text-center', class_td: 'text-center', placeholder: '' },
    ]), [__, contactTypesArray]);

    const allColumnKeys = useMemo(() => columns.map(c => c.key), [columns]);

    const tableConfig = useMemo(() => ({
        table: 'tblContacts',
        allColumnKeys,
        entityName: 'contacts',
        indexRoute: 'users.contacts',
        destroyRoute: 'users.destroy',
        filteredDataRoute: 'users.contacts-filtered-data',
        labelName: 'contactos',
        queryParams
    }), [allColumnKeys, queryParams]);

    const {
        permissions,
        sortParams,
        perPage,
        setPerPage,
        visibleColumns,
        toggleColumnVisibility,
        SearchFieldChanged,
        sortChanged,
        filteredData,
    } = useTableManagement(tableConfig);

    const actions = [];
    if (permissions?.['users.create']) {
        actions.push({
            text: __('contacto_nuevo'),
            icon: 'la-plus',
            url: 'users.create',
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

                        <RecordsPerPage perPage={perPage} setPerPage={setPerPage} />

                        <TableExporter filename={ __('contactos') } columns={columns} fetchData={filteredData}/>
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
                    <Table className="table table-nowrap table-striped align-middle mb-0" id="tblContacts">
                        <thead>
                            <tr>
                                <th className="text-center first-column">
                                    &nbsp;
                                </th>

                                {columns.map(col => (
                                    <th key={col.key} className={`${col.class_th ?? ''} ${visibleColumns.includes(col.key) ? '' : 'd-none'}`.trim()}>
                                        { __(col.label) }

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
                            PrependColumns={1}
                        />

                        <tbody>
                            {contacts.data.map((contact) => (
                                <tr key={contact.id}>
                                    {/* Columna "show" fija */}
                                    <td className="text-center">
                                        <ShowRegisterButton onClick={() => handleShowRegister(contact)} />
                                    </td>

                                    {columns.map(col => (
                                        <td key={col.key} className={`${col.class_td ?? ''} ${visibleColumns.includes(col.key) ? '' : 'd-none'}`.trim()}>
                                            {renderCellContent(contact[col.key], col, contact)}
                                        </td>
                                    ))}

                                    <td className="text-end">
                                        {/* estado opcional, si quieres usarlo igual que en users */}
                                        {typeof contact.status !== 'undefined' && (
                                            <OverlayTrigger
                                                key={"status-"+contact.id}
                                                placement="top"
                                                overlay={
                                                    <Tooltip className="ttp-top">
                                                        { contact.status == 1 ? __('contacto_activo') : __('contacto_inactivo') }
                                                    </Tooltip>
                                                }
                                            >
                                                <StatusButton
                                                    status={contact.status}
                                                    id={contact.id}
                                                    updateRoute='users.status'
                                                    reloadUrl={route(indexRouteName, indexRouteParams)}
                                                    reloadResource="contacts"
                                                />
                                            </OverlayTrigger>
                                        )}

                                        <OverlayTrigger
                                            key={"edit-"+contact.id}
                                            placement="top"
                                            overlay={
                                                <Tooltip className="ttp-top">
                                                    { __('editar') }
                                                </Tooltip>
                                            }
                                        >
                                            <Link
                                                href={route('users.edit',
                                                    contact.edit_company_id ? [contact.id, contact.edit_company_id] : [contact.id]
                                                )}
                                                className="btn btn-sm btn-info ms-1"
                                            >
                                                <i className="la la-edit"></i>
                                            </Link>
                                        </OverlayTrigger>

                                        <OverlayTrigger
                                            key={"delete-"+contact.id}
                                            placement="top"
                                            overlay={
                                                <Tooltip className="ttp-top">
                                                    { __('eliminar') }
                                                </Tooltip>
                                            }
                                        >
                                            <Link
                                                href={route('users.destroy', contact.id)}
                                                className="btn btn-sm btn-danger ms-1"
                                                title={ __('eliminar') }
                                            >
                                                <i className="la la-trash"></i>
                                            </Link>
                                        </OverlayTrigger>
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
                    links={contacts.meta.links}
                    totalRecords={contacts.meta.total}
                    currentPage={contacts.meta.current_page}
                    perPage={contacts.meta.per_page}
                    onPageChange={(page) => {
                        router.get(route(indexRouteName, indexRouteParams), {
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
