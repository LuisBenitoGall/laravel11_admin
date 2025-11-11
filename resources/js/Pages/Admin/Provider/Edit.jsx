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

export default function Index({ auth, session, title, subtitle, provider, relation, users, rows, salutations, tab, availableLocales }){
    const __ = useTranslation();
    const props = usePage()?.props || {};
    const locale = props.locale || false;
    const languages = props.languages || [];
    const { showConfirm } = useSweetAlert();
    const permissions = props.permissions || {};
    const [activeTab, setActiveTab] = useState(tab || 'info');

    // Set formulario:
    const {data, setData, errors, processing} = useForm({
        name: provider.name || '',
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

        router.post(route('providers.update', relation.id), formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => console.log('proveedor actualizado'),
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
    if (permissions?.['providers.index']) {
        actions.push({
            text: __('proveedores_volver'),
            icon: 'la-angle-left',
            url: 'providers.index',
            modal: false
        });
    }

    if (permissions?.['providers.create']) {
        actions.push({
            text: __('proveedor_nuevo'),
            icon: 'la-plus',
            url: 'providers.create',
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
            params: [provider.id],
            modal: false,
        });
    }

    if (permissions?.['cost-centers.index']) {
        actions.push({
            text: __('centros_coste'),
            icon: 'la-comment-dollar',
            url: 'cost-centers.index',
            params: [provider.id],
            modal: false,
        });
    }

    if (permissions?.['providers.destroy']) {
        actions.push({
            text: __('eliminar'),
            icon: 'la-trash',
            method: 'delete',
            url: 'providers.destroy',
            params: [relation.id],
            title: __('proveedor_eliminar'),
            message: __('proveedor_eliminar_confirm'),
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
                            {__('proveedor')} <u>{ provider.name }</u>
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
                                    company={provider}
                                    side={'providers'}
                                    updateRoute={'companies.update'}
                                    updateParams={[provider.id]}
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
                                    indexRoute={'providers.edit'}
                                    indexParams={provider.id}
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
                    companyId={provider.id}
                    side={'providers'}
                    salutations={salutations}
                />
            </div>
        </AdminAuthenticatedLayout>
    );
}