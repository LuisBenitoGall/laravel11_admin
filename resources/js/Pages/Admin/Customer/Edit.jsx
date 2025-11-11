import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, Link, router, useForm, usePage, useRemember } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';
import { Tooltip } from 'react-tooltip';
import { useEffect, useState } from 'react';

//Components:
import Checkbox from '@/Components/Checkbox';
import InfoPopover from '@/Components/InfoPopover';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Tabs from '@/Components/Tabs';
import TextInput from '@/Components/TextInput';

//Hooks:
import { useSweetAlert } from '@/Hooks/useSweetAlert';
import { useTranslation } from '@/Hooks/useTranslation';

//Modals:
import ModalUserCreate from '@/Components/modals/ModalUserCreate';

//Partials:
import CompanyInfoTab from '@/Pages/Admin/Company/Partials/CompanyInfoTab';
import CompanyUsersTab from '@/Pages/Admin/Company/Partials/CompanyUsersTab';

//Utils:
import { useHandleDelete } from '@/Utils/useHandleDelete.jsx';

export default function Index({ auth, session, title, subtitle, customer, relation, users, rows, salutations, tab, availableLocales }){
    const __ = useTranslation();
    const props = usePage()?.props || {};
    const locale = props.locale || false;
    const languages = props.languages || [];
    const { showConfirm } = useSweetAlert();
    const permissions = props.permissions || {};
    const [activeTab, setActiveTab] = useState(tab || 'info');

    // Set formulario:
    const {data, setData, errors, processing} = useForm({
        name: customer.name || '',
        status: relation.status
    })

    //Envío formulario:
    function handleSubmit(e) {
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

        router.post(route('customers.update', relation.id), formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => console.log('cliente actualizado'),
            onError: (errors) => console.error('Errores:', errors),
            onFinish: () => console.log('Petición finalizada'),
        });
    }

    //Modals:
    const [showModalUserCreate, setShowModalUserCreate] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleOpenModalUserCreate = () => setShowModalUserCreate(true);
    const handleCloseModalUserCreate = () => setShowModalUserCreate(false);
    const refreshUsersTable = () => setRefreshKey(prev => prev + 1);

    //Acciones:
    const actions = [];
    if (permissions?.['customers.index']) {
        actions.push({
            text: __('clientes_volver'),
            icon: 'la-angle-left',
            url: 'customers.index',
            modal: false
        });
    }

    if (permissions?.['customers.create']) {
        actions.push({
            text: __('cliente_nuevo'),
            icon: 'la-plus',
            url: 'customers.create',
            modal: false
        });
    }

    if (permissions?.['users.create']) {
        actions.push({
            text: __('usuario_nuevo'),
            icon: 'la-plus',
            url: '',
            modal: true,
            onClick: handleOpenModalUserCreate
        });
    }

    if (permissions?.['workplaces.index']) {
        actions.push({
            text: __('centros_trabajo'),
            icon: 'la-map-marker-alt',
            url: 'workplaces.index',
            params: [customer.id],
            modal: false,
        });
    }

    if (permissions?.['cost-centers.index']) {
        actions.push({
            text: __('centros_coste'),
            icon: 'la-comment-dollar',
            url: 'cost-centers.index',
            params: [customer.id],
            modal: false,
        });
    }

    if (permissions?.['customers.destroy']) {
        actions.push({
            text: __('eliminar'),
            icon: 'la-trash',
            method: 'delete',
            url: 'customers.destroy',
            params: [relation.id],
            title: __('cliente_eliminar'),
            message: __('cliente_eliminar_confirm'),
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

            {/* Contenido */}
            <div className="contents pb-4">
                <div className="row">
                    <div className="col-12">
                        <h2>
                            {__('cliente')} <u>{ customer.name }</u>
                        </h2>
                    </div>

                    {/* Info */}
                    <div className="col-12 mt-2 mb-4">
                        <span className="text-muted me-5">
                            {__('creado')}: <strong>{relation.formatted_created_at}</strong> 
                        </span>

                        <span className="text-muted">
                            {__('actualizado')}: <strong>{relation.formatted_updated_at}</strong>
                        </span>
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
                                    company={customer}
                                    side={'customers'}
                                    updateRoute={'companies.update'}
                                    updateParams={[customer.id]}
                                />
                            )
                        },
                        {
                            key: 'users',
                            label: __('usuarios'),
                            content: (
                                <CompanyUsersTab 
                                    users={users ?? null}
                                    rows={rows ?? []}
                                    indexRoute={'customers.edit'}
                                    indexParams={customer.id}
                                    tableId={'tblCompanyUsers'}
                                />
                            )
                        }
                    ]}
                    defaultActive={tab}
                />

                {/* Modals */}
                <ModalUserCreate
                    show={showModalUserCreate}
                    onClose={handleCloseModalUserCreate}
                    onCreate={refreshUsersTable}
                    companyId={customer.id}
                    side={'customers'}
                    salutations={salutations}
                />
            </div>
        </AdminAuthenticatedLayout>
    );
}