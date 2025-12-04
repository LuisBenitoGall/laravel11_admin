import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, Link, router, useForm, usePage, useRemember } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';
import { Tooltip } from 'react-tooltip';
import { useEffect, useState } from 'react';

//Components:
import CategoryAssigner from '@/Components/CategoryAssigner';
import Checkbox from '@/Components/Checkbox';
import InfoPopover from '@/Components/InfoPopover';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Tabs from '@/Components/Tabs';
import TextInput from '@/Components/TextInput';

//Hooks:
import { useTranslation } from '@/Hooks/useTranslation';

//Modals:
import ModalMarketingListAddUser from '@/Components/modals/ModalMarketingListAddUser';

//Tabs:
import MarketingListInfoTab from './Partials/MarketingListInfoTab';
import MarketingListMembersTab from './Partials/MarketingListMembersTab';

export default function Index({ auth, session, title, subtitle, list, tab, members, rows, availableLocales }){
    const __ = useTranslation();
    const props = usePage()?.props || {};
    const locale = props.locale || false;
    const languages = props.languages || [];
    const permissions = props.permissions || {};

    const rawQueryParams = props.queryParams || {};
    const queryParams = typeof rawQueryParams === 'object' && rawQueryParams !== null ? rawQueryParams : {};

    const [showAddUserModal, setShowAddUserModal] = useState(false);
    const handleOpenAddUserModal = () => setShowAddUserModal(true);
    const handleCloseAddUserModal = () => setShowAddUserModal(false);
    const handleUserAdded = () => {
        // Igual que en la paginación: refrescamos users + rows
        router.reload({
            data: {
                ...(queryParams || {}),
                page: 1,
            },
            only: ['users', 'rows'],
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Set formulario:
    const {data, setData, errors, processing} = useForm({
        name: list.name || '',
        status: list.status
    });

    //Acciones:
    const actions = [];
    if (permissions?.['marketing-lists.index']) {
        actions.push({
            text: __('listas_volver'),
            icon: 'la-angle-left',
            url: 'marketing-lists.index',
            modal: false
        });
    }

    if (permissions?.['marketing-lists.create']) {
        actions.push({
            text: __('lista_nueva'),
            icon: 'la-plus',
            url: 'marketing-lists.create',
            modal: false
        });
    }

    if (permissions?.['marketing-lists.edit']) {
        actions.push({
            text: __('usuario_agregar'),
            icon: 'la-plus',
            url: '',
            modal: true,
            onClick: handleOpenAddUserModal
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
                            {__('lista')} <u>{ list.name }</u>
                        </h2>
                    </div>

                    {/* Info */}
                    <div className="col-12 mt-2 mb-4">
                        <span className="text-muted me-5">
                            {__('creado')}: <strong>{list.formatted_created_at}</strong> 
                        </span>

                        {list.created_by_name && (
                            <span className="text-muted me-5">
                                {__('creado_por')}: <strong>{list.created_by_name}</strong>
                            </span>
                        )}

                        <span className="text-muted">
                            {__('actualizado')}: <strong>{list.formatted_updated_at}</strong>
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
                                <MarketingListInfoTab
                                    list={list}
                                    side={'marketing-lists'}
                                    updateRoute={'marketing-lists.update'}
                                    updateParams={[list.id]}
                                />
                            )
                        },
                        {
                            key: 'members',
                            label: __('miembros'),
                            content: (
                                <MarketingListMembersTab
                                    users={members ?? null}
                                    rows={rows ?? []}
                                    indexRoute={'marketing-lists.edit'}
                                    indexParams={[list.id, 'members']}
                                    tableId={'tblMarketingListMembers'}
                                    filteredDataRoute={'marketing-lists.members.filtered-data'}
                                    queryParams={queryParams}
                                />
                            )
                        },
                    ]}
                    defaultActive={tab}
                />

                {/* Modals */}
                <ModalMarketingListAddUser
                    show={showAddUserModal}
                    onClose={handleCloseAddUserModal}
                    onAdded={handleUserAdded}
                    marketingListId={list.id}
                />
            </div>
        </AdminAuthenticatedLayout>
    );
}
