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
    crmAccounts = []
}){
    const __ = useTranslation();
    const props = usePage()?.props || {};
    const locale = props.locale || false;
    const languages = props.languages || [];
    const permissions = props.permissions || {};

    // Set formulario:
    const { data, setData, post, reset, errors, processing } = useForm({
        name: '',
        user_id: null,
        observations: '',
        crm_account_id: null,
        status: 1,     // 1 = "oportunidad_nueva" (fallback)
    });

    const handleChange = (e) => {
        const { name, type, checked, value, files } = e.target;
        if (type === 'checkbox') {
            setData(name, checked);
        } else if (type === 'file') {
            setData(name, files[0]);
        } else {
            setData(name, value);
        }
    };

    // Envío formulario:
    function handleSubmit(e){
        e.preventDefault();
        post(route('crm-opportunities.store'), {
            onSuccess: () => reset()
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

    const crmAccountOptions = (crmAccounts || []).map(acc => ({
        value: acc.id,
        label: acc.name,
        meta: acc,
    }));

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
                {/* Formulario */}
                <form onSubmit={handleSubmit}>
                    <div className="row gy-3">
                        {/* Nombre de la oportunidad */}
                        <div className="col-md-6">
                            <label className="form-label">
                                {__('titulo')}*
                            </label>
                            <TextInput
                                type="text"
                                name="name"
                                value={data.name ?? ''}
                                onChange={handleChange}
                                maxLength={255}
                                required
                            />
                            <InputError message={errors.name} />
                        </div>

                        {/* Estado (select con colores) */}
                        <div className="col-md-4">
                            <div className="mb-3">
                                <OpportunityStatusSelect
                                    id="status"
                                    name="status"
                                    value={data.status}
                                    onChange={(e) => setData('status', e.target.value)}
                                    error={errors.status}
                                    label={__('estado')}
                                />
                            </div>
                        </div>
                        <div className="w-100 m-0"></div>

                        {/* Usuario responsable (user_id) con autocomplete */}
                        <div className="col-lg-6">
                            <UserSearch
                                label={__('contacto')}
                                name="user_id"
                                searchUrl={route('users.search')}
                                value={null} // en edición ya pasarás el usuario
                                onChange={(user) => setData('user_id', user ? user.id : null)}
                                placeholder={__('usuario_buscar')}
                                error={errors.user_id}
                            />
                            <InputError message={errors.user_id} />
                        </div>

                        {/* Cuenta / CRM Account */}
                        <div className="col-lg-6">
                            <label className="form-label">
                                {__('cuenta_crm')}
                            </label>
                            <SelectSearch
                                name="crm_account_id"
                                value={data.crm_account_id}
                                options={crmAccountOptions}
                                onChange={(opt) => setData('crm_account_id', opt ? opt.value : null)}
                                placeholder={__('oportunidad_cuenta_selec')}
                            />
                            <InputError message={errors.crm_account_id} />
                        </div>

                        {/* Observaciones */}
                        <div className="col-12">
                            <label className="form-label">
                                {__('observaciones')}
                            </label>
                            <Textarea
                                name="observations"
                                value={data.observations || ''}
                                onChange={(e) => setData('observations', e.target.value)}
                                className="form-control"
                                rows={4}
                            />
                            <InputError message={errors.observations} />
                        </div>

                        {/* Botones */}
                        <div className="mt-4 text-end">
                            <PrimaryButton disabled={processing} className="btn btn-rdn">
                                {processing ? `${__('procesando')}...` : __('guardar')}
                            </PrimaryButton>
                        </div>
                    </div>
                </form>
            </div>
        </AdminAuthenticatedLayout>
    );
}
