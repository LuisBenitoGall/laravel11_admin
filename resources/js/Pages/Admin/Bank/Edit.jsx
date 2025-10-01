import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

// Components
import Checkbox from '@/Components/Checkbox';
import InfoPopover from '@/Components/InfoPopover';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Textarea from '@/Components/Textarea';
import TextInput from '@/Components/TextInput';

// Hooks
import { useTranslation } from '@/Hooks/useTranslation';

export default function Index({ auth, session, title, subtitle, availableLocales, bank }) {
    const __ = useTranslation();
    const props = usePage()?.props || {};
    const locale = props.locale || false;
    const languages = props.languages || [];
    const permissions = props.permissions || {};

    // Set formulario:
    const {data, setData, post, reset, errors, processing} = useForm({
        name: bank.name || '',
        tradename: bank.tradename || '',
        lei: bank.lei || '',
        swift: bank.swift || '',
        eu_code: bank.eu_code || '',
        supervisor_code: bank.supervisor_code || '',
        status: bank.status
    });

    const [localErrors, setLocalErrors] = useState({});

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

        router.post(route('banks.update', bank.id), formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => console.log('Banco actualizado'),
            onError: (errors) => setLocalErrors(errors),
            onFinish: () => console.log('Petición finalizada'),
        });
    }

    //Acciones:
    const actions = [];
    if (permissions?.['banks.index']) {
        actions.push({
            text: __('bancos_volver'),
            icon: 'la-angle-left',
            url: 'banks.index',
            modal: false
        });
    }

    if (permissions?.['banks.create']) {
        actions.push({
            text: __('banco_nuevo'),
            icon: 'la-plus',
            url: 'banks.create',
            modal: false
        });
    }

    if (permissions?.['banks.destroy']) {
        actions.push({
            text: __('eliminar'),
            icon: 'la-trash',
            method: 'delete',
            url: 'banks.destroy',
            params: [bank.id],
            title: __('banco_eliminar'),
            message: __('banco_eliminar_confirm'),
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
                            {__('banco')} <u>{ bank.name }</u>
                        </h2>
                    </div>

                    {/* Info */}
                    <div className="col-12 mt-2 mb-4">
                        <span className="text-muted me-5">
                            {__('creado')}: <strong>{bank.formatted_created_at}</strong> 
                        </span>

                        <span className="text-muted me-5">
                            {__('actualizado')}: <strong>{bank.formatted_updated_at}</strong>
                        </span>
                    </div>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit}>
                    <div className="row gy-3 mb-3">
                        {/* Banco razón social */}
                        <div className="col-lg-6">
                            <div>
                                <label htmlFor="name" className="form-label">{ __('banco') }*</label>
                                <TextInput 
                                    name="name"
                                    className="" 
                                    type="text"
                                    placeholder={__('nombre')} 
                                    value={data.name} 
                                    onChange={(e) => setData('name', e.target.value)}
                                    maxLength={100}
                                    required
                                />

                                <InputError message={errors.name} />
                            </div>
                        </div>

                        {/* Nombre comercial */}
                        <div className="col-lg-6">
                            <div>
                                <label htmlFor="tradename" className="form-label">{ __('nombre_comercial') }*</label>
                                <TextInput 
                                    name="tradename"
                                    className="" 
                                    type="text"
                                    placeholder={__('nombre_comercial')} 
                                    value={data.tradename} 
                                    onChange={(e) => setData('tradename', e.target.value)}
                                    maxLength={100}
                                    required
                                />

                                <InputError message={errors.tradename} />
                            </div>
                        </div>

                        {/* LEI */}
                        <div className="col-lg-6">
                            <div className="position-relative">
                                <label htmlFor="lei" className="form-label">{ __('lei') }</label>
                                <TextInput 
                                    name="lei"
                                    className="" 
                                    type="text"
                                    placeholder={__('lei')} 
                                    value={data.lei} 
                                    onChange={(e) => setData('lei', e.target.value)}
                                    maxLength={25}
                                />

                                <InputError message={errors.lei} />
                            </div>
                        </div>

                        {/* Estado */}
                        <div className="col-lg-1 text-center">
                            <div className="position-relative">
                                <label htmlFor="status" className="form-label">{ __('estado') }</label>
                                <div className='pt-1 position-relative'>
                                    <Checkbox 
                                        className="xl"
                                        name="status"
                                        checked={data.status}
                                        onChange={(e) => setData('status', e.target.checked)}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="w-100 m-0"></div>

                        {/* SWIFT / BIC */}
                        <div className="col-lg-4">
                            <div className="position-relative">
                                <label htmlFor="swift" className="form-label">{ __('swift_bic') }</label>
                                <TextInput 
                                    name="swift"
                                    className="" 
                                    type="text"
                                    placeholder={__('swift_bic')} 
                                    value={data.swift} 
                                    onChange={(e) => setData('swift', e.target.value)}
                                    maxLength={11}
                                />

                                <InputError message={errors.swift} />
                            </div>
                        </div>

                        {/* Código europeo */}
                        <div className="col-lg-4">
                            <div className="position-relative">
                                <label htmlFor="eu_code" className="form-label">{ __('codigo_europeo') }</label>
                                <TextInput 
                                    name="eu_code"
                                    className="" 
                                    type="text"
                                    placeholder={__('codigo_europeo')} 
                                    value={data.eu_code} 
                                    onChange={(e) => setData('eu_code', e.target.value)}
                                    maxLength={10}
                                />

                                <InputError message={errors.eu_code} />
                            </div>
                        </div>

                        {/* Código supervisor */}
                        <div className="col-lg-4">
                            <div className="position-relative">
                                <label htmlFor="supervisor_code" className="form-label">{ __('codigo_supervisor') }</label>
                                <TextInput 
                                    name="supervisor_code"
                                    className="" 
                                    type="text"
                                    placeholder={__('codigo_supervisor')} 
                                    value={data.supervisor_code} 
                                    onChange={(e) => setData('supervisor_code', e.target.value)}
                                    maxLength={10}
                                />

                                <InputError message={errors.supervisor_code} />
                            </div>
                        </div>
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