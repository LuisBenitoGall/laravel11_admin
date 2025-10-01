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

export default function Index({ auth, session, title, subtitle, availableLocales }){
    const __ = useTranslation();
    const props = usePage()?.props || {};
    const locale = props.locale || false;
    const languages = props.languages || [];
    const permissions = props.permissions || {};

    // Set formulario:
    const {data, setData, post, reset, errors, processing} = useForm({
        name: '',
        iva: '',
        equivalence_surcharge: '',
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
        post(route('iva-types.store'), {
            onSuccess: () => reset()
        })
    }

    //Acciones:
    const actions = [];
    if (permissions?.['iva-types.index']) {
        actions.push({
            text: __('iva_tipos_volver'),
            icon: 'la-angle-left',
            url: 'iva-types.index',
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
                        {/* Tipo */}
                        <div className="col-lg-6">
                            <div>
                                <label htmlFor="name" className="form-label">{ __('tipo') }*</label>
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

                        {/* IVA */}
                        <div className="col-lg-3">
                            <div>
                                <label htmlFor="iva" className="form-label">{ __('iva') }*</label>
                                <TextInput 
                                    className="text-end setDecimal" 
                                    type="text"
                                    placeholder="" 
                                    value={data.iva} 
                                    onChange={(e) => setData('iva', e.target.value)}
                                    maxLength={7}
                                    addon='%'
                                    required
                                />

                                <InputError message={errors.iva} />
                            </div>
                        </div>

                        {/* Recargo de equivalencia */}
                        <div className="col-lg-3">
                            <div>
                                <label htmlFor="equivalence_surcharge" className="form-label">{ __('recargo_equivalencia') }</label>
                                <TextInput 
                                    className="text-end setDecimal" 
                                    type="text"
                                    placeholder="" 
                                    value={data.equivalence_surcharge} 
                                    onChange={(e) => setData('equivalence_surcharge', e.target.value)}
                                    maxLength={7}
                                    addon='%'
                                />

                                <InputError message={errors.equivalence_surcharge} />
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