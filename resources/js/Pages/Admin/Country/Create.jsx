import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Tooltip } from 'react-tooltip';
import { useState } from 'react';

//Components:
import Checkbox from '@/Components/Checkbox';
import FileInput from '@/Components/FileInput';
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
        code: '',
        alfa2: '',
        alfa3: '',
        flag: '',
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
        post(route('countries.store'), {
            onSuccess: () => reset()
        })
    }

    //Acciones:
    const actions = [];
    if (permissions?.['countries.index']) {
        actions.push({
            text: __('paises_volver'),
            icon: 'la-angle-left',
            url: 'countries.index',
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
                        {/* País */}
                        <div className="col-lg-6">
                            <div>
                                <label htmlFor="name" className="form-label">{ __('pais') }*</label>
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
                    </div>

                    <div className="row gy-3">
                        {/* Código */}
                        <div className="col-lg-2">
                            <div>
                                <label htmlFor="code" className="form-label">{ __('codigo') }</label>
                                <TextInput 
                                    className="" 
                                    type="text"
                                    placeholder={__('codigo')} 
                                    value={data.code} 
                                    onChange={(e) => setData('code', e.target.value)}
                                    maxLength={6}
                                />

                                <InputError message={errors.code} />
                            </div>
                        </div>

                        {/* Alfa 2 */}
                        <div className="col-lg-2">
                            <div>
                                <label htmlFor="alfa2" className="form-label">{ __('Alfa 2') }</label>
                                <TextInput 
                                    className="" 
                                    type="text"
                                    placeholder={__('Alfa 2')} 
                                    value={data.alfa2} 
                                    onChange={(e) => setData('alfa2', e.target.value)}
                                    maxLength={2}
                                />

                                <InputError message={errors.alfa2} />
                            </div>
                        </div>

                        {/* Alfa 3 */}
                        <div className="col-lg-2">
                            <div>
                                <label htmlFor="alfa3" className="form-label">{ __('Alfa 3') }</label>
                                <TextInput 
                                    className="" 
                                    type="text"
                                    placeholder={__('Alfa 3')} 
                                    value={data.alfa3} 
                                    onChange={(e) => setData('alfa3', e.target.value)}
                                    maxLength={3}
                                />

                                <InputError message={errors.alfa3} />
                            </div>
                        </div>

                        {/* Bandera */}
                        <div className="col-lg-2">
                            <div>
                                <label htmlFor="flag" className="form-label">{ __('bandera') }</label>
                                <TextInput 
                                    className="" 
                                    type="text"
                                    placeholder={__('bandera')} 
                                    value={data.flag} 
                                    onChange={(e) => setData('flag', e.target.value)}
                                    maxLength={6}
                                />

                                <InputError message={errors.flag} />
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