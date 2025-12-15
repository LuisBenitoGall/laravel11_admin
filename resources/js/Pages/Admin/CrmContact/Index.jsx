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
import Checkbox from '@/Components/Checkbox';
import ColumnFilter from '@/Components/ColumnFilter';
import DataFilter from '@/Components/DataFilter';
import FilterRow from '@/Components/FilterRow';
import { Pagination } from '@/Components/Pagination';
import RecordsPerPage from '@/Components/RecordsPerPage';
import { SortControl } from '@/Components/SortControl';
import SelectInput from '@/Components/SelectInput';
import ShowRegister from '@/Components/ShowRegister/ShowRegister';
import ShowRegisterButton from '@/Components/ShowRegister/ShowRegisterButton';
import StatusButton from '@/Components/StatusButton';
import TableExporter from '@/Components/TableExporter';
import TextInput from '@/Components/TextInput'; 

//Hooks:
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

export default function Index({ 
    auth, 
    session, 
    title, 
    subtitle, 
    contacts, 
    contact_types, 
    contact_types_combo,
    contact_subtypes,
    salutations,
    leads,
    slug,
    queryParams: rawQueryParams = {}, 
    availableLocales,
    builderMode = false,
    builderList = null
}) {
    const queryParams = typeof rawQueryParams === 'object' && rawQueryParams !== null ? rawQueryParams : {};
    const __ = useTranslation();
    const { showConfirm } = useSweetAlert();

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
    const totalContacts = contacts?.meta?.total ?? 0;
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

        // Si ya están todos, deseleccionamos
        if (totalContacts > 0 && selectedContactIds.length >= totalContacts) {
            setSelectedContactIds([]);
            return;
        }

        // 1) Seleccionar inmediatamente los de la página actual (feedback instantáneo)
        const currentPageIds = (contacts?.data || []).map(c => c.id);

        setSelectedContactIds(prev => {
            const set = new Set(prev);
            currentPageIds.forEach(id => set.add(id));
            return Array.from(set);
        });

        // 2) En paralelo, pedir TODOS los contactos filtrados y completar selección
        try {
            setSelectingAll(true);

            const rows = await filteredData(tableQueryParams);   // devuelve todas las filas según filtros
            const allIds = rows
                .map(row => row.id)
                .filter(id => id !== null && id !== undefined);

            setSelectedContactIds(prev => {
                // Si mientras tanto el usuario vació la selección, no machacamos
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
        { key: 'phones',     label: __('telefonos'),   sort: false, filter: '', class_th: '', class_td: '', placeholder: __('telefonos_filtrar') },
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
        table: 'tblContacts',
        allColumnKeys: columns.map(col => col.key),
        entityName: 'contacts',
        indexRoute: slug + '.index',
        destroyRoute: 'users.destroy',
        filteredDataRoute: slug + '.filtered-data',
        labelName: 'contactos',
        queryParams
    });

    const actions = [];
    if (permissions?.['crm-contacts.create']) {
        actions.push({
            text: __('contacto_nuevo'),
            icon: 'la-plus',
            url: '',
            modal: true,
            onClick: handleOpenModalUserCreate
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

                        <RecordsPerPage perPage={perPage} setPerPage={setPerPage} />

                        <TableExporter filename={ __('contactos') } columns={columns} fetchData={filteredData}/>
                    </div>
                </div>

                <div className="table-responsive">
                    <Table className="table table-nowrap table-striped align-middle mb-0" id="tblContacts">
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
                        router.get(route(slug + ".index"), {
                            ...queryParams,
                            page,
                            per_page: perPage,
                            sort_field: sortParams.sort_field,
                            sort_direction: sortParams.sort_direction,
                        }, { preserveState: true });
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
                />
            </div>
        </AdminAuthenticatedLayout>
    );
}
