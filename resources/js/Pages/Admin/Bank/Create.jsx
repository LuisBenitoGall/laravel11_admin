import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Tooltip } from 'react-tooltip';
import { useState } from 'react';

//Components:
import Checkbox from '@/Components/Checkbox';
import InfoPopover from '@/Components/InfoPopover';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';

//Hooks:
import { useTranslation } from '@/Hooks/useTranslation';

export default function Index({ auth, session, title, subtitle, availableLocales }){
    const __ = useTranslation();
    const props = usePage()?.props || {};
    const locale = props.locale || false;
    const languages = props.languages || [];
    const permissions = props.permissions || {};

    // Set formulario:
    const {data, setData, post, reset, errors, processing} = useForm({
        name: '',
        tradename: '',
        lei: '',
        swift: '',
        eu_code: '',
        supervisor_code: '',
        status: true
    })

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
        e.preventDefault()
        post(route('banks.store'), {
            onSuccess: () => reset()
        })
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