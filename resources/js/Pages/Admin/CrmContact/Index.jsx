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
import ShowRegister from '@/Components/ShowRegister/ShowRegister';
import ShowRegisterButton from '@/Components/ShowRegister/ShowRegisterButton';
import StatusButton from '@/Components/StatusButton';
import TableExporter from '@/Components/TableExporter';
import TextInput from '@/Components/TextInput'; 

//Hooks:
import { useSweetAlert } from '@/Hooks/useSweetAlert';
import { useTableManagement } from '@/Hooks/useTableManagement';
import { useTranslation } from '@/Hooks/useTranslation';

//Partials:
import UserShowView from '@/Pages/Admin/User/Partials/UserShowView';

//Utils:
import renderCellContent from '@/Utils/renderCellContent.jsx';

export default function Index({ auth, session, title, subtitle, contacts, queryParams: rawQueryParams = {}, availableLocales }) {
    const queryParams = typeof rawQueryParams === 'object' && rawQueryParams !== null ? rawQueryParams : {};
    const __ = useTranslation();

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

    const columns = [
        { key: 'name',       label: __('nombre'),      sort: true,  filter: 'text', class_th: '', class_td: '', placeholder: __('nombre_filtrar') },
        { key: 'created_at', label: __('fecha_alta'),  sort: true,  filter: 'date', class_th: 'text-center', class_td: 'text-end', placeholder: __('fecha_alta'), dateKeys: ['date_from', 'date_to'] },
        { key: 'email',      label: __('email'),       sort: true,  filter: 'text', class_th: '', class_td: '', placeholder: __('email_filtrar') },
        { key: 'phones',     label: __('telefonos'),   sort: false, filter: '', class_th: '', class_td: '', placeholder: __('telefonos_filtrar') },
        { key: 'position',   label: __('cargo'),       sort: false, filter: 'text', class_th: '', class_td: '', placeholder: __('cargo_filtrar') },
        { key: 'contact_type', label: __('contacto_tipo'), sort: false, filter: 'text', class_th: '', class_td: '', placeholder: __('contacto_tipo_filtrar') },
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
        handleDelete
    } = useTableManagement({
        table: 'tblContacts',
        allColumnKeys: columns.map(col => col.key),
        entityName: 'contacts',
        indexRoute: 'crm-contacts.index',
        destroyRoute: 'users.destroy',
        filteredDataRoute: 'crm-contacts.filtered-data',
        labelName: 'contactos',
        queryParams
    });

    const actions = [];
    if (permissions?.['contacts.create']) {
        actions.push({
            text: __('contacto_nuevo'),
            icon: 'la-plus',
            url: 'contacts.create',
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
                        router.get(route("crm-contacts.index"), {
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
