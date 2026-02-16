import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect, useRef } from 'react';
import { OverlayTrigger, Table, Tooltip } from 'react-bootstrap';
import 'react-datepicker/dist/react-datepicker.css';

//Components:
import ActiveFiltersLegend from '@/Components/ActiveFiltersLegend';
import AdHocFiltersDropdown from '@/Components/AdHocFiltersDropdown';
import Checkbox from '@/Components/Checkbox';
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
import { useSweetAlert } from '@/Hooks/useSweetAlert';
import { useTableManagement } from '@/Hooks/useTableManagement';
import { useTranslation } from '@/Hooks/useTranslation';

//Modals:
import ModalMarketingListFromContacts from '@/Components/modals/ModalMarketingListFromContacts';
import ModalUserCreate from '@/Components/modals/ModalUserCreate';

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
    table = EMPTY_OBJ,
    contact_types,
    contact_types_combo,
    contact_subtypes,
    salutations,
    leads,
    slug,
    availableLocales,
    builderMode = false,
    builderList = null
}) {
    const __ = useTranslation();
    const t = (table && typeof table === 'object') ? table : EMPTY_OBJ;
    const { props } = usePage();
    const tableId     = t.id ?? 'tblContacts';
    const rows        = t.rows ?? EMPTY_OBJ;          // Resource collection (data/meta/links)
    const queryParams = t.queryParams ?? EMPTY_OBJ;   // query state
    const adhocFilters = t.adhocFilters ?? EMPTY;
    const legendItems  = t.activeFiltersLegend ?? EMPTY;

    const { loading } = useInertiaLoading();
    const hasActiveFilters = legendItems.length > 0;
    const { showConfirm } = useSweetAlert();

    const indexRouteName = `${slug}.index`;
    const indexRouteParams = {};

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

    const contactTypesArray = Array.isArray(contact_types)
            ? contact_types.map((opt) => ({ value: opt?.value ?? opt?.id ?? opt?.slug ?? opt, label: opt?.label ?? opt?.name ?? opt?.title ?? String(opt) }))
            : Object.entries(contact_types || {}).map(([key, value]) => ({ value: key, label: value }));

    const contactSubtypesArray = Array.isArray(contact_subtypes)
            ? contact_subtypes.map((opt) => ({ value: opt?.value ?? opt?.id ?? opt?.slug ?? opt, label: opt?.label ?? opt?.name ?? opt?.title ?? String(opt) }))
            : Object.entries(contact_subtypes || {}).map(([key, value]) => ({ value: key, label: value }));

    // Column config for contact_type: if we're in 'leads' context, remove filter and options
    const contactTypeColumn = {
        key: 'contact_type',
        label: __('contacto_tipo'),
        sort: false,
        filter: leads === true ? '' : 'select',
        class_th: '',
        class_td: '',
        placeholder: leads === true ? '' : __('contacto_tipo_filtrar'),
        ...(leads === true ? {} : { options: contactTypesArray })
    };

    const contactSubTypeColumn = {
        key: 'contact_subtype',
        label: __('contacto_subtipo'),
        sort: false,
        filter: leads === true ? '' : 'select',
        class_th: '',
        class_td: '',
        placeholder: leads === true ? '' : __('contacto_subtipo_filtrar'),
        ...(leads === true ? {} : { options: contactSubtypesArray })
    };

    //Modals:
    const [showModalUserCreate, setShowModalUserCreate] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const handleOpenModalUserCreate = () => setShowModalUserCreate(true);
    const handleCloseModalUserCreate = () => setShowModalUserCreate(false);
    const refreshUsersTable = () => setRefreshKey(prev => prev + 1);

    const isBuildingList = !!builderMode && !!builderList;
    const marketingListId = isBuildingList ? builderList.id : null;

    const [selectedContactIds, setSelectedContactIds] = useState([]);
    const totalContacts = rows?.meta?.total ?? 0;
    const [showModalListFromContacts, setShowModalListFromContacts] = useState(false);
    const [selectingAll, setSelectingAll] = useState(false);
    const [savingMembers, setSavingMembers] = useState(false);

    const handleOpenModalListFromContacts = () => setShowModalListFromContacts(true);
    const handleCloseModalListFromContacts = () => setShowModalListFromContacts(false);

    const handleToggleContactInList = (contactId) => {
        setSelectedContactIds(prev => {
            if (prev.includes(contactId)) {
                return prev.filter(id => id !== contactId);
            }
            return [...prev, contactId];
        });
    };

    const handleToggleSelectAll = async () => {
        if (!isBuildingList || selectingAll) return;

        if (totalContacts > 0 && selectedContactIds.length >= totalContacts) {
            setSelectedContactIds([]);
            return;
        }

        const currentPageIds = (rows?.data || []).map(c => c.id);

        setSelectedContactIds(prev => {
            const set = new Set(prev);
            currentPageIds.forEach(id => set.add(id));
            return Array.from(set);
        });

        try {
            setSelectingAll(true);

            const allRows = await filteredData(tableQueryParams); // <- no pises "rows"
            const allIds = allRows
              .map(r => r.id)
              .filter(id => id !== null && id !== undefined);

            setSelectedContactIds(prev => {
                if (prev.length === 0) return prev;
                const set = new Set(prev);
                allIds.forEach(id => set.add(id));
                return Array.from(set);
            });
        } finally {
            setSelectingAll(false);
        }
    };

    useEffect(() => {
        // si salimos del modo builder, limpiamos la selección
        if (!isBuildingList && selectedContactIds.length) {
            setSelectedContactIds([]);
        }
    }, [isBuildingList]);

    const handleSubmitSelectedToList = () => {
        if (!marketingListId || selectedContactIds.length === 0) return;

        showConfirm({
            title: __('miembros_guardar'),
            text: __('miembros_guardar_lista'),
            icon: 'question',
            onConfirm: () => {
                setSavingMembers(true);

                router.post(
                    route('marketing-list-users.store-from-contacts', marketingListId),
                    { user_ids: selectedContactIds },
                    {
                        preserveScroll: true,
                        onFinish: () => {
                            setSavingMembers(false);
                        }
                    }
                );
            },
        });
    };

    //Columnas:
    const columns = [
        { key: 'full_name',       label: __('nombre'),      sort: true,  filter: 'text', class_th: '', class_td: '', placeholder: __('nombre_filtrar') },
        // { key: 'created_at', label: __('fecha_alta'),  sort: true,  filter: 'date', class_th: 'text-center', class_td: 'text-end', placeholder: __('fecha_alta'), dateKeys: ['date_from', 'date_to'] },
        { key: 'email',      label: __('email'),       sort: true,  filter: 'text', class_th: '', class_td: '', placeholder: __('email_filtrar') },
        { key: 'phones',     label: __('telefonos'),   sort: false, filter: 'text', class_th: '', class_td: '', placeholder: __('telefonos_filtrar') },
        { key: 'position',   label: __('cargo'),       sort: false, filter: 'text', class_th: '', class_td: '', placeholder: __('cargo_filtrar') },
        contactTypeColumn,
        contactSubTypeColumn,
        { key: 'companies',  label: __('empresa'),     sort: false, filter: 'text', class_th: '', class_td: '', placeholder: __('empresa_filtrar') },
        { key: 'avatar',     label: __('imagen'),      sort: false, filter: '',     type: 'image', icon: 'user-tie', class_th: 'text-center', class_td: 'text-center', placeholder: '' }
    ];

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
        handleDelete,
        queryParams: tableQueryParams
    } = useTableManagement({
        table: tableId,
        allColumnKeys: columns.map(col => col.key),
        entityName: 'contacts',
        indexRoute: slug + '.index',
        destroyRoute: 'users.destroy',
        filteredDataRoute: slug + '.filtered-data',
        labelName: 'contactos',
        queryParams,
        preserveParams: isBuildingList && builderList
            ? { marketing_list_id: builderList.id, build_marketing_list: 1 }
            : {},
    });

    // Params para navegación: en modo builder incluir siempre marketing_list_id y build_marketing_list
    const queryParamsForNav = isBuildingList && builderList
        ? { ...tableQueryParams, marketing_list_id: builderList.id, build_marketing_list: 1 }
        : tableQueryParams;

    // Ref para que el modal de "Nueva Lista" envíe siempre los filtros actuales en el submit (flujo filtros → lista)
    const tableQueryParamsRef = useRef(tableQueryParams);
    tableQueryParamsRef.current = tableQueryParams;

    const actions = [];
    if (permissions?.['crm-contacts.create']) {
        actions.push({
            text: __('contacto_nuevo'),
            icon: 'la-plus',
            url: '',
            modal: true,
            onClick: handleOpenModalUserCreate
        });
        actions.push({
            text: __('contactos_importar'),
            icon: 'la-file-import',
            url: 'crm-contacts.import',
            modal: false,
        });
    }

    if (permissions?.['marketing-lists.create'] && !isBuildingList) {
        actions.push({
            text: __('marketing_lista_nueva'),
            icon: 'la-newspaper',
            url: '',
            modal: true,
            onClick: handleOpenModalListFromContacts,
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

            {/* Contenido */}
            <div className="contents">
                {isBuildingList && (
                    <div className="alert alert-info d-flex justify-content-between align-items-center mb-3 mx-0">
                        <div>
                            {__('marketing_lista_construyendo')}: <strong>{builderList.name}</strong>
                            {' · '}
                            {__('contactos_seleccionados')}: <strong>{selectedContactIds.length}</strong>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary me-2"
                                disabled={totalContacts === 0 || selectingAll}
                                onClick={handleToggleSelectAll}
                            >
                                {selectingAll ? (
                                    <>
                                        <span
                                            className="spinner-border spinner-border-sm me-2"
                                            role="status"
                                            aria-hidden="true"
                                        />
                                        {__('seleccionando_todos')} {/* 'Seleccionando todos' */}
                                    </>
                                ) : (
                                    selectedContactIds.length >= totalContacts && totalContacts > 0
                                        ? __('deseleccionar_todos')
                                        : __('seleccionar_todos')
                                )}
                            </button>

                            <button
                                type="button"
                                className="btn btn-sm btn-primary"
                                disabled={selectedContactIds.length === 0 || savingMembers}
                                onClick={handleSubmitSelectedToList}
                            >
                                {savingMembers ? (
                                    <>
                                        <span
                                            className="spinner-border spinner-border-sm me-2"
                                            role="status"
                                            aria-hidden="true"
                                        />
                                        {__('miembros_guardando')}
                                    </>
                                ) : (
                                    __('miembros_guardar')
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Controles */}
                <div className="row">
                    <div className="controls d-flex align-items-center">
                        <ColumnFilter columns={columns} visibleColumns={visibleColumns} toggleColumn={toggleColumnVisibility} />

                        {/* Filtros avanzados */}
                        <AdHocFiltersDropdown
                            filters={adhocFilters}
                            routeName={indexRouteName}
                            routeParams={indexRouteParams}
                            queryParams={queryParamsForNav}
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
                        queryParams={queryParamsForNav}
                    />

                    {hasActiveFilters && loading ? (
                        <SpinnerInline text={__('cargando') ?? 'Cargando…'} />
                    ) : null}
                </div>

                {/* Tabla */}
                <div className="table-responsive">
                    <Table className="table table-nowrap table-striped align-middle mb-0" id={tableId}>
                        <thead>
                            <tr>
                                <th className="text-center first-column">
                                    &nbsp;
                                </th>

                                {columns.map(col => (
                                    <th key={col.key} className={`${col.class_th ?? ''} ${visibleColumns.includes(col.key) ? '' : 'd-none'}`.trim()}>
                                        { col.label }

                                        {col.sort && (
                                            <SortControl
                                                name={col.key}
                                                sortable={true}
                                                sort_field={tableQueryParams.sort_field}
                                                sort_direction={tableQueryParams.sort_direction}
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
                            queryParams={queryParamsForNav}
                            visibleColumns={visibleColumns}
                            SearchFieldChanged={SearchFieldChanged}
                            PrependColumns={1}
                        />

                        <tbody>
                            {(rows?.data || []).map((contact) => (
                                <tr key={"contact-"+contact.id}>
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
                                        {isBuildingList && (
                                            <Checkbox
                                                id={`mlist-${marketingListId}-user-${contact.id}`}
                                                className="me-2"
                                                checked={selectedContactIds.includes(contact.id)}
                                                onChange={() => handleToggleContactInList(contact.id)}
                                                value={contact.id}
                                                size="lg"
                                            />
                                        )}

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
                                                    reloadUrl={route('users.contacts')}
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

                                        {permissions?.['crm-contacts.destroy'] && (
                                            <OverlayTrigger
                                                key={"delete-"+contact.id}
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
                                                    onClick={() => handleDelete(contact.id)}
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
                    links={rows?.meta?.links}
                    totalRecords={rows?.meta?.total}
                    currentPage={rows?.meta?.current_page}
                    perPage={rows?.meta?.per_page}
                    onPageChange={(page) => {
                        const baseParams = {
                            ...queryParams,
                            page,
                            per_page: perPage,
                            sort_field: sortParams.sort_field,
                            sort_direction: sortParams.sort_direction,
                        };
                        const params = isBuildingList && builderList
                            ? { ...baseParams, marketing_list_id: builderList.id, build_marketing_list: 1 }
                            : baseParams;
                        router.get(route(indexRouteName, indexRouteParams), params, { preserveState: true });
                    }}
                />

                {/* Modals */}
                <ModalUserCreate
                    show={showModalUserCreate}
                    onClose={handleCloseModalUserCreate}
                    onCreate={refreshUsersTable}
                    side={'crm-accounts'}
                    salutations={salutations}
                    contact_types={contact_types_combo}
                    contact_subtypes={contact_subtypes}
                    linkCompany={false}
                />

                <ModalMarketingListFromContacts
                    show={showModalListFromContacts}
                    onClose={handleCloseModalListFromContacts}
                    filters={tableQueryParams}
                    getFiltersForRedirect={() => ({ ...tableQueryParamsRef.current })}
                />
            </div>
        </AdminAuthenticatedLayout>
    );
}
