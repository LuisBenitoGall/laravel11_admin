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
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';

//Hooks:
import { useSweetAlert } from '@/Hooks/useSweetAlert';
import { useTranslation } from '@/Hooks/useTranslation';

//Utils:
import { useHandleDelete } from '@/Utils/useHandleDelete.jsx';

export default function Index({ auth, session, title, subtitle, country, availableLocales }){
    const __ = useTranslation();
    const props = usePage()?.props || {};
    const locale = props.locale || false;
    const languages = props.languages || [];
    const { showConfirm } = useSweetAlert();
    const permissions = props.permissions || {};

    // Set formulario:
    const {data, setData, errors, processing} = useForm({
        name: country.name || '',
        code: country.code || '',
        alfa2: country.alfa2 || '',
        alfa3: country.alfa3 || '',
        flag: country.flag || '',
        status: country.status
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
    const { handleDelete } = useHandleDelete('pais', 'countries.delete', [country.id]);

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

        router.post(route('countries.update', country.id), formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => console.log('pais actualizada'),
            onError: (errors) => console.error('Errores:', errors),
            onFinish: () => console.log('Petición finalizada'),
        });
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

    if (permissions?.['countries.create']) {
        actions.push({
            text: __('pais_nuevo'),
            icon: 'la-plus',
            url: 'countries.create',
            modal: false
        });
    }

    if (permissions?.['countries.edit']) {
        actions.push({
            text: __('provincias'),
            icon: 'la-flag',
            url: 'provinces.index',
            params: [country.id],
            modal: false
        });
    }

    if (permissions?.['countries.destroy']) {
        actions.push({
            text: __('eliminar'),
            icon: 'la-trash',
            method: 'delete',
            url: 'countries.destroy',
            params: [country.id],
            title: __('pais_eliminar'),
            message: __('pais_eliminar_confirm'),
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
                            {__('pais')} <u>{ country.name }</u>
                        </h2>
                    </div>

                    {/* Info */}
                    <div className="col-12 mt-2 mb-4">
                        <span className="text-muted me-5">
                            {__('creado')}: <strong>{country.formatted_created_at}</strong> 
                        </span>

                        <span className="text-muted">
                            {__('actualizado')}: <strong>{country.formatted_updated_at}</strong>
                        </span>
                    </div>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit}>
                    <div className="row gy-3 mb-3">
                        {/* Pais */}
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