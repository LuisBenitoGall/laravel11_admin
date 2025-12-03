import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Tooltip } from 'react-tooltip';
import { useState } from 'react';
import axios from 'axios';

// Components:
import Checkbox from '@/Components/Checkbox';
import FileInput from '@/Components/FileInput';
import InfoPopover from '@/Components/InfoPopover';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import SelectSearch from '@/Components/SelectSearch';
import Textarea from '@/Components/Textarea';
import TextInput from '@/Components/TextInput';
import UserSearch from '@/Components/UserSearch';
import OpportunityStatusSelect from '@/Components/OpportunityStatusSelect';

// Hooks:
import { useTranslation } from '@/Hooks/useTranslation';

export default function Index({ 
    auth, 
    session, 
    title, 
    subtitle, 
    availableLocales,
    opportunity,
    crmAccounts = []
}){
    const __ = useTranslation();
    const props = usePage()?.props || {};
    const locale = props.locale || false;
    const languages = props.languages || [];
    const permissions = props.permissions || {};

    // Set formulario:
    const {data, setData, errors, processing} = useForm({
        name: opportunity.name || '',
        status: opportunity.status
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

    //Confirmación de eliminación:
    const { handleDelete } = useHandleDelete('iva_tipo', 'iva-types.destroy', [opportunity.id]);

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

        router.post(route('crm-opportunities.update', opportunity.id), formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => console.log('Tipo IVA actualizado'),
            onError: (errors) => console.error('Errores:', errors),
            onFinish: () => console.log('Petición finalizada'),
        });
    }

    //Acciones:
    const actions = [];
    if (permissions?.['crm-opportunities.index']) {
        actions.push({
            text: __('oportunidades_volver'),
            icon: 'la-angle-left',
            url: 'crm-opportunities.index',
            modal: false
        });
    }

    if (permissions?.['crm-opportunities.create']) {
        actions.push({
            text: __('oportunidad_nueva'),
            icon: 'la-plus',
            url: 'crm-opportunities.create',
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
                            {__('oportunidad')} <u>{ opportunity.name }</u>
                        </h2>
                    </div>

                    {/* Info */}
                    <div className="col-12 mt-2 mb-4">
                        <span className="text-muted me-5">
                            {__('creado')}: <strong>{opportunity.formatted_created_at}</strong> 
                        </span>

                        <span className="text-muted">
                            {__('actualizado')}: <strong>{opportunity.formatted_updated_at}</strong>
                        </span>
                    </div>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit}>
                    <div className="row gy-3">






                    </div>

                    <div className='mt-4 text-end'>
                        <PrimaryButton disabled={processing} className='btn btn-rdn'>
                            {processing ? __('procesando')+'...':__('guardar')}
                        </PrimaryButton>    
                    </div>
                </form>
            </div>
        </AdminAuthenticatedLayout>
    );
}