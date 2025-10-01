import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, Link, router, useForm, usePage, useRemember } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';
import { Tooltip } from 'react-tooltip';
import { useEffect, useState } from 'react';

//Components:
import Checkbox from '@/Components/Checkbox';
import FileInput from '@/Components/FileInput';
import InfoPopover from '@/Components/InfoPopover';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';

//Hooks:
import { useSweetAlert } from '@/Hooks/useSweetAlert';
import { useTranslation } from '@/Hooks/useTranslation';

export default function Index({ auth, session, title, subtitle, availableLocales, company }){
    const __ = useTranslation();
    const props = usePage()?.props || {};
    const locale = props.locale || false;
    const languages = props.languages || [];
    const { showConfirm } = useSweetAlert();
    const permissions = props.permissions || {};
    
    // Set formulario:
    const {data, setData, errors, processing} = useForm({
        name: company.name || '',
        tradename: company.tradename || '',
        nif: company.nif || '',
        logo: null
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
	function handleSubmit(e){
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

        router.post(route('companies.update', company.id), formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => console.log('Empresa actualizada'),
            onError: (errors) => console.error('Errores:', errors),
            onFinish: () => console.log('Petición finalizada'),
        });
    }

    // Eliminar logo:
    const handleDeleteLogo = () => {
        showConfirm({
            title: __('logo_eliminar'),
            text: __('logo_eliminar_confirm'),
            icon: 'warning',
            onConfirm: () => {
                router.delete(route('companies.logo.delete', company.id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        location.reload(); // o router.reload() si prefieres
                    },
                });
            },
        });
    };

    const computeLogoSrc = (raw) => {
        if (typeof raw !== 'string') return '';
        const r = raw.trim();
        if (!r) return '';
        if (r.startsWith('http') || r.startsWith('//')) return r;
        if (r.startsWith('/')) return r;
        if (r.includes('storage/')) return '/' + r.replace(/^\/+/, '');
        if (r.includes('companies/')) return '/storage/' + r.replace(/^\/+/, '');
        return `/storage/companies/${r.replace(/^\/+/, '')}`;
    };

    //Acciones:
    const actions = [
        {text: __('empresas_volver'), icon: 'la-angle-left', url: 'companies.index', modal: false},
        {text: __('empresa_nueva'), icon: 'la-plus', url: 'companies.create', modal: false}
    ];

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
                            {__('empresa')} <u>{ company.name }</u>
                            { company.is_ute ? (
                                <span className='ms-2'>(UTE)</span>
                            ): (
                                ''
                            )}     
                        </h2>
                    </div>

                    {/* Info */}
                    <div className="col-12 mt-2 mb-4">
                        <span className="text-muted me-5">
                            {__('creado')}: <strong>{company.formatted_created_at}</strong> 
                        </span>

                        {company.created_by_name && (
                            <span className="text-muted me-5">
                                {__('creado_por')}: <strong>{company.created_by_name}</strong>
                            </span>
                        )}

                        <span className="text-muted me-5">
                            {__('actualizado')}: <strong>{company.formatted_updated_at}</strong>
                        </span>

                        {company.updated_by_name && (
                            <span className="text-muted me-5">
                                {__('actualizado_por')}: <strong>{company.updated_by_name}</strong>
                            </span>
                        )}
                    </div>
                </div>

				{/* Formulario */}
                <form onSubmit={handleSubmit}>
                    <div className="row gy-3">
                        {/* Razón social */}
                        <div className="col-lg-6">
                            <div>
                                <label htmlFor="name" className="form-label">{ __('razon_social') }*</label>
                                <TextInput 
                                    className="" 
                                    type="text"
                                    placeholder={__('empresa_nombre')} 
                                    value={data.name} 
                                    onChange={(e) => setData('name', e.target.value)}
                                    maxLength={100}
                                />

                                <InputError message={errors.name} />
                            </div>
                        </div>

                        {/* Nombre comercial */}
                        <div className="col-lg-6">
                            <div>
                                <label htmlFor="tradename" className="form-label">{ __('nombre_comercial') }*</label>
                                <TextInput 
                                    className="" 
                                    type="text"
                                    placeholder={__('nombre_comercial')} 
                                    value={data.tradename} 
                                    onChange={(e) => setData('tradename', e.target.value)}
                                    maxLength={100}
                                />
                                
                                <InputError message={errors.tradename} />
                            </div>
                        </div>

                        {/* NIF */}
                        <div className="col-lg-3">
                            <div className="position-relative">
                                <label htmlFor="nif" className="form-label">{ __('nif') }*</label>
                                <TextInput 
                                    className="" 
                                    type="text"
                                    placeholder={__('nif')} 
                                    value={data.nif} 
                                    onChange={(e) => setData('nif', e.target.value)}
                                    maxLength={15}
                                />
                                <InfoPopover code="company-nif" />

                                <InputError message={errors.nif} />
                            </div>
                        </div>

                        {/* Logo */}
                        <div className="offset-lg-1 col-lg-8">
							<div>
    							<label htmlFor="logo" className="form-label">{ __('logo') }</label>

                                {company.logo ? (
                                    <div className="d-flex align-items-start">
                                        <img
                                            src={computeLogoSrc(company.logo)}
                                            alt={company.name}
                                            className="img-thumbnail me-3"
                                            style={{ maxWidth: '300px', objectFit: 'contain' }}
                                        />

                                        <button 
                                            type="button" 
                                            className="ms-2 btn btn-sm btn-danger" 
                                            onClick={handleDeleteLogo}
                                        >
                                            <i className="la la-trash"></i>
                                        </button>
                                    </div>
                                ) : (
                                    <FileInput 
                                        name="logo"
                                        accept="image/*"
                                        onChange={handleChange}
                                        error={errors.logo} 
                                    />
                                )}

                                <p className='pt-1 text-warning small'>
                                    <span className='me-5'>{ __('imagen_formato') }</span>
                                    <span className='me-5'>{ __('imagen_peso_max') }: 1MB</span>
                                    { __('imagen_medidas_recomendadas') }: 400x400px
                                </p>
                            </div>
                        </div>

                        <div className='mt-4 text-end'>
                            <PrimaryButton disabled={processing} className='btn btn-rdn'>
                                {processing ? __('procesando')+'...':__('guardar')}
                            </PrimaryButton>	
                        </div>
                    </div>
                </form>
            </div>
        </AdminAuthenticatedLayout>
    );
}