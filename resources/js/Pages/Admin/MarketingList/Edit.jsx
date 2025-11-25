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
import { useSweetAlert } from '@/Hooks/useSweetAlert';
import { useTranslation } from '@/Hooks/useTranslation';

export default function Index({ auth, session, title, subtitle, list, availableLocales }){
    const __ = useTranslation();
    const props = usePage()?.props || {};
    const locale = props.locale || false;
    const languages = props.languages || [];
    const { showConfirm } = useSweetAlert();
    const permissions = props.permissions || {};

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

                        <span className="text-muted">
                            {__('actualizado')}: <strong>{list.formatted_updated_at}</strong>
                        </span>
                    </div>
                </div>



            </div>
        </AdminAuthenticatedLayout>
    );
}