import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';
import { Tooltip } from 'react-tooltip';
import { useState, useEffect } from 'react';

//Components:
import InfoPopover from '@/Components/InfoPopover';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

//Hooks:
import { useTranslation } from '@/Hooks/useTranslation';

export default function Index({ auth, session, title, subtitle, availableLocales, functionality, module_name }) {
    const __ = useTranslation();
    const props = usePage()?.props || {};
    const locale = props.locale || false;
    const languages = props.languages || [];
    const permissions = props.permissions || {};

    // Set formulario:
	const {data, setData, errors, processing} = useForm({
        label: functionality.label || ''
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

    // Envío formulario:
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

        router.post(route('functionalities.update', functionality.id), formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => console.log('Funcionalidad actualizada'),
            onError: (errors) => console.error('Errores:', errors),
            onFinish: () => console.log('Petición finalizada'),
        });
    }

    //Acciones:
    const actions = [];
    if (permissions?.['modules.edit']) {
        actions.push({
            text: `${__('modulo_volver')} ${module_name}`,
            icon: 'la-angle-left',
            url: 'modules.edit',
            params: [functionality.module_id, 'functionalities'],
            modal: false
        }); 
    }

    if (permissions?.['modules.edit']) {
        actions.push({
            text: __('eliminar'),
            icon: 'la-trash',
            method: 'delete',
            url: 'functionalities.destroy',
            params: [functionality.id],
            title: __('funcionalidad_eliminar'),
            message: __('funcionalidad_eliminar_confirm'),
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
                            {__('funcionalidad')} <u>{ functionality.name }</u>
                        </h2>
                    </div>

                    {/* Info */}
                    <div className="col-12 mt-2 mb-4">
                        <span className="text-muted me-5">
                            {__('creado')}: <strong>{functionality.formatted_created_at}</strong> 
                        </span>

                        {functionality.created_by_name && (
                            <span className="text-muted me-5">
                                {__('creado_por')}: <strong>{functionality.created_by_name}</strong>
                            </span>
                        )}

                        <span className="text-muted me-5">
                            {__('actualizado')}: <strong>{functionality.formatted_updated_at}</strong>
                        </span>

                        {functionality.updated_by_name && (
                            <span className="text-muted me-5">
                                {__('actualizado_por')}: <strong>{functionality.updated_by_name}</strong>
                            </span>
                        )}
                    </div>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit}>
                    <div className="row gy-3">
                        {/* Etiqueta */}
                        <div className="col-lg-6">
                            <div>
                                <label htmlFor="label" className="form-label">{ __('etiqueta') }*</label>
                                <TextInput 
                                    className="" 
                                    type="text"
                                    placeholder={__('etiqueta')} 
                                    value={data.label} 
                                    onChange={(e) => setData('label', e.target.value)}
                                    maxLength={100}
                                    required
                                />

                                <InputError message={errors.label} />
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