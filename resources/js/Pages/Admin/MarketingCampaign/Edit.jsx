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
    costCenters, 
    owners, 
    currencies,
    campaignStatus, 
    priorities,
    availableLocales 
}){
    const __ = useTranslation();
    const props = usePage()?.props || {};
    const locale = props.locale || false;
    const languages = props.languages || [];
    const permissions = props.permissions || {};




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
                                    side={'marketing-campaigns'}
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
                                    users={members ?? null}
                                    rows={rows ?? []}
                                    indexRoute={'marketing-campaigns.edit'}
                                    indexParams={[list.id, 'members']}
                                    tableId={'tblMarketingListMembers'}
                                    filteredDataRoute={'marketing-campaigns.members.filtered-data'}
                                    queryParams={queryParams}
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
