import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Tooltip } from 'react-tooltip';
import { useState } from 'react';

//Components:
import InfoPopover from '@/Components/InfoPopover';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SelectInput from '@/Components/SelectInput';
import TextInput from '@/Components/TextInput';

//Hooks:
import { useTranslation } from '@/Hooks/useTranslation';

export default function Index({ auth, session, title, subtitle, modes, availableLocales }){
    const __ = useTranslation();
    const props = usePage()?.props || {};
    const locale = props.locale || false;
    const languages = props.languages || [];
    const permissions = props.permissions || {};

    const modesArray = Object.entries(modes || {}).map(([key, value]) => ({
		value: key,
		label: value
	}));

    // Set formulario:
	const {data, setData, post, reset, errors, processing} = useForm({
        code: '',
		name: '',
        mode: ''
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
		post(route('accounting-account-types.store'), {
			onSuccess: () => reset()
		})
	}

    //Acciones:
    const actions = [];
    if (permissions?.['accounting-account-types.index']) {
        actions.push({
            text: __('grupos_contables_volver'),
            icon: 'la-angle-left',
            url: 'accounting-account-types.index',
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
                        {/* Código */}
                        <div className="col-lg-2">
                            <div>
                                <label htmlFor="code" className="form-label">{ __('codigo') }*</label>
                                <TextInput 
                                    className="" 
                                    type="text"
                                    placeholder={__('codigo')} 
                                    value={data.code} 
                                    onChange={(e) => setData('code', e.target.value)}
                                    maxLength={3}
                                    required
                                />

                                <InputError message={errors.code} />
                            </div>
                        </div>

                        {/* Nombre */}
                        <div className="col-lg-5">
                            <div>
                                <label htmlFor="name" className="form-label">{ __('nombre') }*</label>
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

                        {/* Modo */}
                        <div className="col-lg-3">
                            <div className="position-relative">
                                <label htmlFor="mode" className="form-label">{ __('modo') }</label>
                                <SelectInput
                                    className="form-select"
                                    name="mode"
                                    value={data.mode}
                                    onChange={(e) => setData('mode', e.target.value)}
                                    required
                                >
                                    <option value="">{ __('opcion_selec') }</option>
                                    {modesArray.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </SelectInput>
                                <InfoPopover code="accounting-account-type-modes" />
                            
                                <InputError message={errors.mode} />
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