import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, Link, router, useForm, usePage, useRemember } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';
import { Tooltip } from 'react-tooltip';
import { useEffect, useState } from 'react';

//Components:
import CategoryAssigner from '@/Components/CategoryAssigner';
import Checkbox from '@/Components/Checkbox';
import FileInput from '@/Components/FileInput';
import InfoPopover from '@/Components/InfoPopover';
import InputError from '@/Components/InputError';
import ManagePhones from '@/Components/ManagePhones';
import PrimaryButton from '@/Components/PrimaryButton';
import Tabs from '@/Components/Tabs';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';

//Hooks:
import { useSweetAlert } from '@/Hooks/useSweetAlert';
import { useTranslation } from '@/Hooks/useTranslation';

//Modals:
import ModalUserCreate from '@/Components/modals/ModalUserCreate';
import ModalConvertCrmAccount from '@/Components/modals/ModalConvertCrmAccount';

//Tabs:
import CompanyInfoTab from './Partials/CompanyInfoTab';
import CompanyUsersTab from './Partials/CompanyUsersTab.jsx';
import CrmAccountAddressTab from '../CrmAccount/Partials/CrmAccountAddressTab.jsx';

export default function Index({ 
    auth, 
    session, 
    title, 
    subtitle, 
    availableLocales, 
    company, 
    crm_account, 
    users, 
    rows, 
    salutations, 
    contact_types, 
    countries, 
    currencies, tab 
}){
    const __ = useTranslation();
    const props = usePage()?.props || {};
    const locale = props.locale || false;
    const languages = props.languages || [];
    const { showConfirm } = useSweetAlert();
    const permissions = props.permissions || {};

    // Normalizamos queryParams por si vienen de CrmAccountController (para filtros/orden/export)
    const rawQueryParams = props.queryParams || {};
    const queryParams = typeof rawQueryParams === 'object' && rawQueryParams !== null ? rawQueryParams : {};

    const isCrmAccount = crm_account && typeof crm_account === 'object';

    // Si el tab solicitado no está disponible (crm_account === false y tab es 'users' o 'categories'), usar 'info'
    const validTab = (!isCrmAccount && (tab === 'users' || tab === 'categories')) ? 'info' : (tab || 'info');
    const [activeTab, setActiveTab] = useState(validTab);
    
    // Set formulario:
    const {data, setData, errors, processing} = useForm({
        name: company.name || '',
        tradename: company.tradename || '',
        nif: company.nif || '',
        logo: null
    })

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

    // Envío formulario:
    function handleSubmit(e){
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
            onSuccess: () => console.log('Empresa actualizada'),
            onError: (errors) => console.error('Errores:', errors),
            onFinish: () => console.log('Petición finalizada'),
        });
    }

    // Eliminar logo:
    const handleDeleteLogo = () => {
        showConfirm({
            title: __('logo_eliminar'),
            text: __('logo_eliminar_confirm'),
            icon: 'warning',
            onConfirm: () => {
                router.delete(route('companies.logo.delete', company.id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        location.reload(); // o router.reload() si prefieres
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

    //Modals:
    const [showModalUserCreate, setShowModalUserCreate] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);
    const handleOpenModalUserCreate = () => setShowModalUserCreate(true);
    const handleCloseModalUserCreate = () => setShowModalUserCreate(false);
    const refreshUsersTable = () => setRefreshKey(prev => prev + 1);
    const [showConvertModal, setShowConvertModal] = useState(false);
    const handleOpenConvertModal = () => {
        console.log('Abriendo modal de conversión');
        setShowConvertModal(true);
    };
    const handleCloseConvertModal = () => setShowConvertModal(false);

    //Acciones:
    const actions = [];
    if (permissions?.['companies.index']) {
        actions.push({
            text: __('empresas_volver'),
            icon: 'la-angle-left',
            url: 'companies.index',
            modal: false
        });
    }

    if (permissions?.['crm-accounts.index']) {
        actions.push({
            text: __('cuentas_volver'),
            icon: 'la-angle-left',
            url: 'crm-accounts.index',
            modal: false
        });
    }

    if (permissions?.['companies.create']) {
        actions.push({
            text: __('empresa_nueva'),
            icon: 'la-plus',
            url: 'companies.create',
            modal: false
        });
    }

    //Convertir a Cliente o Proveedor - condiciones:
    if( isCrmAccount &&
        (permissions?.['customers.create'] || permissions?.['providers.create'])
    ){
        actions.push({ 
            text: __('convertir_cliente_proveedor'), 
            icon: 'la-plus', 
            url: '', 
            modal: true,
            onClick: handleOpenConvertModal
        });   
    }
       
    if (permissions?.['workplaces.index']) {
        actions.push({
            text: __('centros_trabajo'),
            icon: 'la-map-marker-alt',
            url: 'workplaces.index',
            params: [company.id],
            modal: false
        });
    }   

    if (permissions?.['crm-accounts.edit'] && isCrmAccount) {
        actions.push({
            text: __('contacto_nuevo'),
            icon: 'la-plus',
            url: '',
            modal: true,
            onClick: handleOpenModalUserCreate
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
            modal: false
        });
    }

    // Environment para categorías de clientes: usamos 'sectors' para mapear a module 'companies'
    const envForCategories = 'sectors';

    // Endpoints que consume CategoryAssigner
    const categoryEndpoints = {
        list: route('categorizables.list'),                               // GET  ?environment=&type=&id=
        assign: route('categorizables.assign'),                           // POST body {environment,type,id,category_ids}
        unassign: route('categorizables.unassign'),                       // POST body {environment,type,id,category_ids}
        tree: route('categories.tree', { environment: envForCategories }),// GET  ?environment=
        create: route('categories.store', { environment: envForCategories }) // POST body {environment,name,parent_id?}
    };

    return (
        <AdminAuthenticatedLayout
            user={auth.user}
            title={title}
            subtitle={subtitle}
            actions={actions}
        >
            <Head title={title} />

            {/* Contenido */}
            <div className="contents pb-4">
                <div className="row">
                    <div className="col-12">
                        <h2>
                            {__('empresa')} <u>{ company.name }</u>
                            { company.is_ute ? (
                                <span className='ms-2'>(UTE)</span>
                            ): (
                                ''
                            )}     
                        </h2>
                    </div>

                    {/* Info */}
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

                {/* Tabs */}
                <Tabs 
                    tabs={[
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
                                />
                            )
                        },
                        ...(isCrmAccount ? [{
                            key: 'address',
                            label: __('informacion_fiscal'),
                            content: (
                                <CrmAccountAddressTab 
                                    account={crm_account}   
                                    countries={countries ?? []}
                                    currencies={currencies ?? []}
                                />
                            )
                        }] : []),
                        ...(isCrmAccount ? [{
                            key: 'users',
                            label: __('usuarios'),
                            content: (
                                <CompanyUsersTab 
                                    users={users ?? null}
                                    rows={rows ?? []}
                                    // Para recargar el tab con filtros/orden en contexto CRM:
                                    indexRoute={'crm-accounts.edit'}
                                    indexParams={[crm_account.id, 'users']}
                                    tableId={'tblCompanyUsers'}
                                    // Para exportar / filteredData como un Index:
                                    filteredDataRoute={'crm-accounts.users.filtered-data'}
                                    queryParams={queryParams}
                                    userEditCompanyId={crm_account?.linked_company_id ?? company.id}
                                />
                            )
                        }] : []),
                        ...(isCrmAccount ? [{
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
                            )
                        }] : [])
                    ]}
                    defaultActive={validTab}
                />

                {/* Modals */}
                {isCrmAccount && (
                    <ModalUserCreate
                        show={showModalUserCreate}
                        onClose={handleCloseModalUserCreate}
                        onCreate={refreshUsersTable}
                        companyId={company.id}
                        side={'crm-accounts'}
                        salutations={salutations}
                        contact_types={contact_types}
                        crm_account={crm_account}
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
            </div>
        </AdminAuthenticatedLayout>
    );
}
