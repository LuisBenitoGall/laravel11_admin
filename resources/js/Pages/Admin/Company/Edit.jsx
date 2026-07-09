import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

// Components:
import CategoryAssigner from '@/Components/CategoryAssigner';
import Tabs from '@/Components/Tabs';

// Hooks:
import { useSweetAlert } from '@/Hooks/useSweetAlert';
import { useTranslation } from '@/Hooks/useTranslation';

// Modals:
import ModalCompanyNoteCreate from '@/Components/modals/ModalCompanyNoteCreate';
import ModalUserCreate from '@/Components/modals/ModalUserCreate';
import ModalConvertCrmAccount from '@/Components/modals/ModalConvertCrmAccount';

// Partials:
import CompanyNotes from './Partials/CompanyNotes.jsx';
import CompanyInfoTab from './Partials/CompanyInfoTab';
import CompanyUsersTab from './Partials/CompanyUsersTab.jsx';
import CrmAccountAddressTab from '../CrmAccount/Partials/CrmAccountAddressTab.jsx';

export default function Edit({
    auth,
    session,
    title,
    subtitle,
    module,
    availableLocales,
    company,
    crm_account,
    users,
    rows,
    salutations,
    contact_types,
    contact_subtypes,
    business_types = [],
    cost_centers = [],
    countries,
    currencies,
    tab,
}) {
    const __ = useTranslation();
    const props = usePage()?.props || {};
    const { showConfirm } = useSweetAlert();
    const permissions = props.permissions || {};

    const isCrmAccount = crm_account && typeof crm_account === 'object';

    // Si el tab solicitado no está disponible para un no-crm_account, forzamos 'info'
    const requestedTab = tab || 'info';
    const validTab =
        !isCrmAccount && (requestedTab === 'users' || requestedTab === 'categories' || requestedTab === 'notes')
            ? 'info'
            : requestedTab;

    // Formulario básico de empresa
    const { data, setData, errors, processing } = useForm({
        name: company.name || '',
        tradename: company.tradename || '',
        nif: company.nif || '',
        logo: null,
    });

    const handleChange = (e) => {
        const { name, type, checked, value, files } = e.target;
        if (type === 'checkbox') {
            setData(name, checked);
        } else if (type === 'file') {
            setData(name, files.length ? files[0] : null);
        } else {
            setData(name, value);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('_method', 'PUT');

        Object.entries(data).forEach(([key, value]) => {
            if (key === 'logo' && value instanceof File) {
                formData.append(key, value);
            } else if (typeof value === 'object' && value !== null) {
                formData.append(key, JSON.stringify(value));
            } else if (value !== null && value !== undefined) {
                formData.append(key, value);
            }
        });

        router.post(route('companies.update', company.id), formData, {
            forceFormData: true,
            preserveScroll: true,
        });
    };

    const handleDeleteLogo = () => {
        showConfirm({
            title: __('logo_eliminar'),
            text: __('logo_eliminar_confirm'),
            icon: 'warning',
            onConfirm: () => {
                router.delete(route('companies.logo.delete', company.id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        location.reload();
                    },
                });
            },
        });
    };

    const computeLogoSrc = (raw) => {
        if (typeof raw !== 'string') return '';
        const r = raw.trim();
        if (!r) return '';
        if (r.startsWith('http') || r.startsWith('//')) return r;
        if (r.startsWith('/')) return r;
        if (r.includes('storage/')) return '/' + r.replace(/^\/+/, '');
        if (r.includes('companies/')) return '/storage/' + r.replace(/^\/+/, '');
        return `/storage/companies/${r.replace(/^\/+/, '')}`;
    };

    // Modales:
    const [showModalUserCreate, setShowModalUserCreate] = useState(false);
    const [showModalCompanyNoteCreate, setShowModalCompanyNoteCreate] = useState(false);
    const [showConvertModal, setShowConvertModal] = useState(false);

    const handleOpenModalUserCreate = () => setShowModalUserCreate(true);
    const handleCloseModalUserCreate = () => setShowModalUserCreate(false);

    const handleOpenModalCompanyNoteCreate = () => setShowModalCompanyNoteCreate(true);
    const handleCloseModalCompanyNoteCreate = () => setShowModalCompanyNoteCreate(false);

    const handleOpenConvertModal = () => setShowConvertModal(true);
    const handleCloseConvertModal = () => setShowConvertModal(false);

    // Refresco de tablas / notas:
    const refreshUsersTable = () => {
        // si quieres ser fino aquí puedes hacer router.reload({ only: ['users','rows'] })
        router.reload({ only: ['users', 'rows'] });
    };

    const [notesRefreshKey, setNotesRefreshKey] = useState(0);
    const handleNoteCreated = () => {
        setNotesRefreshKey((prev) => prev + 1);
        setShowModalCompanyNoteCreate(false);
    };

    // Acciones del layout
    const actions = [];

    if (permissions?.['companies.index']) {
        actions.push({
            text: __('empresas_volver'),
            icon: 'la-angle-left',
            url: 'companies.index',
            modal: false,
        });
    }

    if (permissions?.['crm-accounts.index']) {
        actions.push({
            text: __('cuentas_volver'),
            icon: 'la-angle-left',
            url: 'crm-accounts.index',
            modal: false,
        });
    }

    if (permissions?.['companies.create']) {
        actions.push({
            text: __('empresa_nueva'),
            icon: 'la-plus',
            url: 'companies.create',
            modal: false,
        });
    }

    if (isCrmAccount && (permissions?.['customers.create'] || permissions?.['providers.create'])) {
        actions.push({
            text: __('convertir_cliente_proveedor'),
            icon: 'la-plus',
            url: '',
            modal: true,
            onClick: handleOpenConvertModal,
        });
    }

    if (permissions?.['workplaces.index']) {
        actions.push({
            text: __('centros_trabajo'),
            icon: 'la-map-marker-alt',
            url: 'workplaces.index',
            params: [company.id],
            modal: false,
        });
    }

    if (permissions?.['crm-accounts.edit'] && isCrmAccount) {
        actions.push({
            text: __('contacto_nuevo'),
            icon: 'la-plus',
            url: '',
            modal: true,
            onClick: handleOpenModalUserCreate,
        });
    }

    // Nueva nota (no perfil propio)
    if (permissions?.['crm-accounts.edit'] && isCrmAccount) {
        actions.push({ 
            text: __('nota_nueva'), 
            icon: 'la-plus', 
            url: '', 
            modal: true,
            onClick: handleOpenModalCompanyNoteCreate
        });
    }

    if (permissions?.['crm-accounts.destroy'] && isCrmAccount) {
        actions.push({
            text: __('eliminar'),
            icon: 'la-trash',
            method: 'delete',
            url: 'crm-accounts.destroy',
            params: [crm_account.id],
            title: __('cuenta_eliminar'),
            message: __('cuenta_eliminar_confirm'),
            modal: false,
        });
    }

    // Categorías: environment para companies
    const envForCategories = 'sectors';

    const categoryEndpoints = {
        list: route('categorizables.list'),
        assign: route('categorizables.assign'),
        unassign: route('categorizables.unassign'),
        tree: route('categories.tree', { environment: envForCategories }),
        create: route('categories.store', { environment: envForCategories }),
    };

    // Tabs:
    const tabs = [
        {
            key: 'info',
            label: __('informacion_general'),
            content: (
                <CompanyInfoTab
                    company={company}
                    side={'companies'}
                    updateRoute={'companies.update'}
                    updateParams={[company.id]}
                    crm_account={crm_account}
                    business_types={business_types ?? []}
                    cost_centers={cost_centers ?? []}
                    phonesRedirectTo={isCrmAccount ? { route: 'crm-accounts.edit', params: [crm_account.id] } : null}
                />
            ),
        },
    ];

    if (isCrmAccount) {
        tabs.push({
            key: 'address',
            label: __('informacion_fiscal'),
            content: (
                <CrmAccountAddressTab
                    account={crm_account}
                    countries={countries ?? []}
                    currencies={currencies ?? []}
                />
            ),
        });

        tabs.push({
            key: 'users',
            label: __('usuarios'),
            content: (
                <CompanyUsersTab
                    users={users ?? null}
                    rows={rows ?? []}
                    indexRoute={'crm-accounts.edit'}
                    indexParams={[crm_account.id, 'users']}
                    tableId={'tblCompanyUsers'}
                    filteredDataRoute={'crm-accounts.users.filtered-data'}
                    queryParams={props.queryParams || {}}
                    userEditCompanyId={crm_account?.linked_company_id ?? company.id}
                    deleteUserRoute={module === 'crm' ? 'crm-contacts.destroy' : 'user-companies.destroy'}
                    editFromAccountId={crm_account?.id ?? null}
                />
            ),
        });

        tabs.push({
            key: 'categories',
            label: __('categorias'),
            content: (
                <div className="mt-3">
                    <CategoryAssigner
                        environment={envForCategories}
                        categorizable={{ type: 'App\\Models\\Company', id: company.id }}
                        endpoints={categoryEndpoints}
                        title={__('sectores')}
                        allowCreate={true}
                        readOnly={false}
                    />
                </div>
            ),
        });

        tabs.push({
            key: 'notes',
            label: __('notas'),
            content: (
                <div className="mt-3">
                    {permissions?.['companies.edit'] && (
                        <div className="d-flex justify-content-end mb-3">
                            <button
                                type="button"
                                className="btn btn-sm btn-primary"
                                onClick={handleOpenModalCompanyNoteCreate}
                            >
                                <i className="la la-plus me-1" />
                                {__('nota_nueva') || 'Nueva nota'}
                            </button>
                        </div>
                    )}

                    <CompanyNotes
                        companyId={company.id}      // empresa objeto de la nota (subject_company_id)
                        refreshKey={notesRefreshKey}
                    />
                </div>
            ),
        });
    }

    return (
        <AdminAuthenticatedLayout user={auth.user} title={title} subtitle={subtitle} actions={actions}>
            <Head title={title} />

            <div className="contents pb-4">
                <div className="row">
                    <div className="col-12">
                        <h2>
                            {__('empresa')} <u>{company.name}</u>
                            {company.is_ute ? <span className="ms-2">(UTE)</span> : ''}
                        </h2>
                    </div>

                    <div className="col-12 mt-2 mb-4">
                        <span className="text-muted me-5">
                            {__('creado')}: <strong>{company.formatted_created_at}</strong>
                        </span>

                        {company.created_by_name && (
                            <span className="text-muted me-5">
                                {__('creado_por')}: <strong>{company.created_by_name}</strong>
                            </span>
                        )}

                        <span className="text-muted me-5">
                            {__('actualizado')}: <strong>{company.formatted_updated_at}</strong>
                        </span>

                        {company.updated_by_name && (
                            <span className="text-muted me-5">
                                {__('actualizado_por')}: <strong>{company.updated_by_name}</strong>
                            </span>
                        )}
                    </div>
                </div>

                <Tabs tabs={tabs} defaultActive={validTab} />

                {/* Modales */}
                {isCrmAccount && (
                    <ModalUserCreate
                        show={showModalUserCreate}
                        onClose={handleCloseModalUserCreate}
                        onCreate={refreshUsersTable}
                        companyId={company.id}
                        side={'crm-accounts'}
                        salutations={salutations}
                        contact_types={contact_types}
                        contact_subtypes={contact_subtypes}
                        crm_account={crm_account}
                        showUserSearch={true}
                        redirectTo={{ route: 'crm-accounts.edit', params: [crm_account.id, 'users'] }}
                    />
                )}

                {isCrmAccount && (
                    <ModalConvertCrmAccount
                        show={showConvertModal}
                        onClose={handleCloseConvertModal}
                        crmAccount={crm_account}
                        canCreateCustomer={!!permissions?.['customers.create']}
                        canCreateProvider={!!permissions?.['providers.create']}
                    />
                )}

                {isCrmAccount && (
                    <ModalCompanyNoteCreate
                        show={showModalCompanyNoteCreate}
                        onClose={handleCloseModalCompanyNoteCreate}
                        company={company}
                        crmAccount={crm_account}
                        onCreated={handleNoteCreated}
                    />
                )}
            </div>
        </AdminAuthenticatedLayout>
    );
}
