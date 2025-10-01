import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, Link, router, useForm, usePage, useRemember } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';
import { Tooltip } from 'react-tooltip';
import { useEffect, useState } from 'react';

//Components:
import Checkbox from '@/Components/Checkbox';
import InfoPopover from '@/Components/InfoPopover';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import Textarea from '@/Components/Textarea';
import TextInput from '@/Components/TextInput';

//Hooks:
import { useSweetAlert } from '@/Hooks/useSweetAlert';
import { useTranslation } from '@/Hooks/useTranslation';

//Utils:
import { useHandleDelete } from '@/Utils/useHandleDelete.jsx';

export default function Index({ auth, session, title, subtitle, type, availableLocales }){
    const __ = useTranslation();
    const props = usePage()?.props || {};
    const locale = props.locale || false;
    const languages = props.languages || [];
    const { showConfirm } = useSweetAlert();
    const permissions = props.permissions || {};

    // Set formulario:
	const {data, setData, errors, processing} = useForm({
        name: type.name || '',
        iva: type.iva || '',
        equivalence_surcharge: type.equivalence_surcharge || '',
        status: type.status
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
    const { handleDelete } = useHandleDelete('iva_tipo', 'iva-types.destroy', [type.id]);

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

        router.post(route('iva-types.update', type.id), formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => console.log('Tipo IVA actualizado'),
            onError: (errors) => console.error('Errores:', errors),
            onFinish: () => console.log('Petición finalizada'),
        });
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

    if (permissions?.['iva-types.create']) {
        actions.push({
            text: __('tipo_nuevo'),
            icon: 'la-plus',
            url: 'iva-types.create',
            modal: false
        });
    }

    if (permissions?.['iva-types.destroy']) {
        actions.push({
            text: __('eliminar'),
            icon: 'la-trash',
            method: 'delete',
            url: 'iva-types.destroy',
            params: [type.id],
            title: __('iva_tipo_eliminar'),
            message: __('iva_tipo_eliminar_confirm'),
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
                            {__('iva_tipo')} <u>{ type.name }</u>
                        </h2>
                    </div>

                    {/* Info */}
                    <div className="col-12 mt-2 mb-4">
                        <span className="text-muted me-5">
                            {__('creado')}: <strong>{type.formatted_created_at}</strong> 
                        </span>

                        <span className="text-muted">
                            {__('actualizado')}: <strong>{type.formatted_updated_at}</strong>
                        </span>
                    </div>
                </div>

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