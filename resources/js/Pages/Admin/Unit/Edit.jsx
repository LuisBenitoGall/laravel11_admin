import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, Link, router, useForm, usePage, useRemember } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';
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

//Utils:
import { useHandleDelete } from '@/Utils/useHandleDelete.jsx';

export default function Index({ auth, session, title, subtitle, unit, availableLocales }){
    const __ = useTranslation();
    const props = usePage()?.props || {};
    const locale = props.locale || false;
    const languages = props.languages || [];
    const permissions = props.permissions || {};

    // Set formulario:
    const {data, setData, post, reset, errors, processing} = useForm({
        name: unit.name || '',
        symbol: unit.symbol || '',
        status: unit.status
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

    //Confirmación de eliminación:
    const { handleDelete } = useHandleDelete('unidad', 'units.destroy', [unit.id]);

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

        router.put(route('units.update', unit.id), formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => console.log('Unidad actualizada'),
            onError: (errors) => console.error('Errores:', errors),
            onFinish: () => console.log('Petición finalizada'),
        });
    }

    //Acciones:
    const actions = [];
    if (permissions?.['units.index']) {
        actions.push({
            text: __('unidades_volver'),
            icon: 'la-angle-left',
            url: 'units.index',
            modal: false
        });
    }

    if (permissions?.['units.create']) {
        actions.push({
            text: __('unidad_nueva'),
            icon: 'la-plus',
            url: 'units.create',
            modal: false
        });
    }

    if (permissions?.['units.destroy']) {
        actions.push({
            text: __('eliminar'),
            icon: 'la-trash',
            method: 'delete',
            url: 'units.destroy',
            params: [unit.id],
            title: __('unidad_eliminar'),
            message: __('unidad_eliminar_confirm'),
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
                            {__('unidad')} <u>{ unit.name }</u>
                        </h2>
                    </div>

                    {/* Info */}
                    <div className="col-12 mt-2 mb-4">
                        <span className="text-muted me-5">
                            {__('creado')}: <strong>{unit.formatted_created_at}</strong> 
                        </span>

                        <span className="text-muted">
                            {__('actualizado')}: <strong>{unit.formatted_updated_at}</strong>
                        </span>
                    </div>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit}>
                    <div className="row gy-3 mb-3">
                        {/* Unidad */}
                        <div className="col-lg-5">
                            <div>
                                <label htmlFor="name" className="form-label">{ __('unidad') }*</label>
                                <TextInput 
                                    className="" 
                                    type="text"
                                    placeholder={__('nombre')} 
                                    value={data.name} 
                                    onChange={(e) => setData('name', e.target.value)}
                                    maxLength={50}
                                    required
                                />

                                <InputError message={errors.name} />
                            </div>
                        </div>

                        {/* Símbolo */}
                        <div className="col-lg-2">
                            <div>
                                <label htmlFor="symbol" className="form-label">{ __('simbolo') }</label>
                                <TextInput 
                                    className="" 
                                    type="text"
                                    placeholder={__('simbolo')} 
                                    value={data.symbol} 
                                    onChange={(e) => setData('symbol', e.target.value)}
                                    maxLength={4}
                                />

                                <InputError message={errors.symbol} />
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