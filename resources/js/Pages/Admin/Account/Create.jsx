import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Tooltip } from 'react-tooltip';
import { useState } from 'react';

//Components:
import Checkbox from '@/Components/Checkbox';
import InfoPopover from '@/Components/InfoPopover';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import Textarea from '@/Components/Textarea';
import TextInput from '@/Components/TextInput';

//Hooks:
import { useTranslation } from '@/Hooks/useTranslation';

export default function Index({ auth, session, title, subtitle, currency, availableLocales }){
    const __ = useTranslation();
    const props = usePage()?.props || {};
    const locale = props.locale || false;
    const languages = props.languages || [];
    const permissions = props.permissions || {};

    // Set formulario:
    const {data, setData, post, reset, errors, processing} = useForm({
        name: '',
        rate: '',
        duration: '',
        description: '',
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
        post(route('accounts.store'), {
            onSuccess: () => reset()
        })
    }

    //Acciones:
    const actions = [];
    if (permissions?.['accounts.index']) {
        actions.push({
            text: __('cuentas_volver'),
            icon: 'la-angle-left',
            url: 'accounts.index',
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
                    <div className="row gy-3">
                        {/* Cuenta */}
                        <div className="col-lg-6">
                            <div>
                                <label htmlFor="name" className="form-label">{ __('cuenta') }*</label>
                                <TextInput 
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

                        {/* Precio */}
                        <div className="col-lg-3">
                            <div>
                                <label htmlFor="rate" className="form-label">{ __('precio') }</label>
                                <TextInput 
                                    className="text-end setDecimal" 
                                    type="text"
                                    placeholder="" 
                                    value={data.rate} 
                                    onChange={(e) => setData('rate', e.target.value)}
                                    maxLength={7}
                                    addon={currency}
                                />

                                <InputError message={errors.rate} />
                            </div>
                        </div>

                        {/* Duración */}
                        <div className="col-lg-3">
                            <div>
                                <label htmlFor="duration" className="form-label">{ __('duracion') } <small className="text-warning">({ __('dias') })</small></label>
                                <TextInput 
                                    className="text-end setDecimal" 
                                    type="text"
                                    placeholder="" 
                                    value={data.duration} 
                                    onChange={(e) => setData('duration', e.target.value)}
                                    maxLength={5}
                                />

                                <InputError message={errors.duration} />
                            </div>
                        </div>

                        {/* Descripción */}
                        <div className="col-12">
                            <div>
                                <label htmlFor="description" className="form-label">{ __('descripcion') }</label>
                                <Textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={4}
                                />
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