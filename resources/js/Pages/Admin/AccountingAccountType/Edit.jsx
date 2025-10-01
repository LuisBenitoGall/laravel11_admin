import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Tooltip } from 'react-tooltip';
import { useState } from 'react';

//Components:
import InfoPopover from '@/Components/InfoPopover';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

//Hooks:
import { useTranslation } from '@/Hooks/useTranslation';

export default function Index({ auth, session, title, subtitle, type, mode_name, availableLocales }){
    const __ = useTranslation();
    const props = usePage()?.props || {};
    const locale = props.locale || false;
    const languages = props.languages || [];
    const permissions = props.permissions || {};

    //Set formulario:
	const {data, setData, put, reset, errors, processing} = useForm({
		name: type.name || ''
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

	//Envío formulario:
	function handleSubmit(e){
		e.preventDefault();
		put(route('accounting-account-types.update', type.id),
		{
			preserveScroll: true,
			onSuccess: () => console.log('Movimiento actualizado'),
		});
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

    if (permissions?.['accounting-account-types.create']) {
        actions.push({
            text: __('grupo_nuevo'),
            icon: 'la-plus',
            url: 'accounting-account-types.create',
            modal: false
        });
    }

    if (permissions?.['accounting-account-types.destroy']) {
        actions.push({
            text: __('eliminar'),
            icon: 'la-trash',
            method: 'delete',
            url: 'accounting-account-types.destroy',
            params: [type.id],
            title: __('grupo_contable_eliminar'),
            message: __('grupo_contable_eliminar_confirm'),
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
                            {__('grupo_contable')} <u>{ type.name }</u>
                        </h2>
                    </div>

                    {/* Info */}
                    <div className="col-12 mt-2 mb-4">
                        <span className="text-muted me-5">
                            {__('creado')}: <strong>{type.formatted_created_at}</strong> 
                        </span>

                        <span className="text-muted me-5">
                            {__('actualizado')}: <strong>{type.formatted_updated_at}</strong>
                        </span>

                        <span className="text-muted me-5">
                            {__('codigo')}: <strong>{type.code}</strong> 
                        </span>

                        {mode_name !== false && (
                            <span className="text-muted me-5">
                                {__('modo')}: <strong>{mode_name}</strong> 
                            </span>
                        )}
                    </div>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit}>
                    <div className="row gy-3 mb-3">
                        {/* Nombre */}
                        <div className="col-lg-6">
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