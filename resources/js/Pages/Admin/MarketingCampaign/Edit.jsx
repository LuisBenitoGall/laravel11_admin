import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';

//Components:
import ModalCampaignAttachList from '@/Components/modals/ModalCampaignAttachList';
import Tabs from '@/Components/Tabs';

//Hooks:
import { useTranslation } from '@/Hooks/useTranslation';

//Tabs:
import MarketingCampaignInfoTab from './Partials/MarketingCampaignInfoTab';
import MarketingCampaignListsTab from './Partials/MarketingCampaignListsTab';

export default function Index({
    auth,
    session,
    title,
    subtitle,
    campaign,
    tab,
    costCenters = [],
    owners = [],
    currencies = [],
    campaignStatus = {},
    priorities = {},
    availableLocales,
}) {
    const __ = useTranslation();
    const props = usePage()?.props || {};
    const locale = props.locale || false;
    const languages = props.languages || [];
    const permissions = props.permissions || {};

    const [showAttachModal, setShowAttachModal] = useState(false);
    const [listRefreshKey, setListRefreshKey] = useState(0);

    //Acciones:
    const actions = [];
    if (permissions?.['marketing-campaigns.index']) {
        actions.push({
            text: __('campanyas_volver'),
            icon: 'la-angle-left',
            url: 'marketing-campaigns.index',
            modal: false
        });
    }

    if (permissions?.['marketing-campaigns.create']) {
        actions.push({
            text: __('campanya_nueva'),
            icon: 'la-plus',
            url: 'marketing-campaigns.create',
            modal: false
        });
    }

    if (permissions?.['marketing-campaigns.edit']) {
        actions.push({
            text: __('lista_agregar'),
            icon: 'la-plus',
            modal: true,
            onClick: () => setShowAttachModal(true)
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
    
            <ModalCampaignAttachList
                show={showAttachModal}
                onClose={() => setShowAttachModal(false)}
                onAdded={() => { setShowAttachModal(false); setListRefreshKey((k) => k + 1); }}
                campaign={campaign}
            />

            {/* Contenido */}
            <div className="contents pb-4">
                <div className="row">
                    <div className="col-12">
                        <h2>
                            {__('campanya')} <u>{ campaign.name }</u>
                        </h2>
                    </div>

                    {/* Info */}
                    <div className="col-12 mt-2 mb-4">
                        <span className="text-muted me-5">
                            {__('creado')}: <strong>{campaign.formatted_created_at}</strong> 
                        </span>

                        {campaign.created_by_name && (
                            <span className="text-muted me-5">
                                {__('creado_por')}: <strong>{campaign.created_by_name}</strong>
                            </span>
                        )}

                        <span className="text-muted">
                            {__('actualizado')}: <strong>{campaign.formatted_updated_at}</strong>
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
                                <MarketingCampaignInfoTab
                                    campaign={campaign}
                                    costCenters={costCenters}
                                    owners={owners}
                                    currencies={currencies}
                                    campaignStatus={campaignStatus}
                                    priorities={priorities}
                                    updateRoute={'marketing-campaigns.update'}
                                    updateParams={[campaign.id]}
                                />
                            )
                        },
                        {
                            key: 'lists',
                            label: __('listas'),
                            content: (
                                <MarketingCampaignListsTab
                                    campaign={campaign}
                                    queryParams={props.queryParams ?? {}}
                                    refreshKey={listRefreshKey}
                                />
                            )
                        }
                    ]}
                    defaultActive={tab}
                />
            </div>
        </AdminAuthenticatedLayout>
    );
}
