import React, { useState, useEffect } from 'react';
import { useForm, router } from '@inertiajs/react';

//Components:
import Checkbox from '@/Components/Checkbox';
import FileInput from '@/Components/FileInput';
import InfoPopover from '@/Components/InfoPopover';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

//Hooks:
import { useTranslation } from '@/Hooks/useTranslation';
import { useSweetAlert } from '@/Hooks/useSweetAlert';

export default function CompanyFormEdit({ company = {}, side = false, updateRoute = 'companies.update', updateParams = null }){
    const __ = useTranslation();
    const { showConfirm } = useSweetAlert();

    const params = updateParams ?? [company?.id];

    const { data, setData, post, reset, errors, processing } = useForm({
        name: company.name ?? '',
        tradename: company.tradename ?? '',
        nif: company.nif ?? '',
        side: side || '',
        logo: null
    });

    // Ensure form is populated if company prop changes
    useEffect(() => {
        setData('name', company.name ?? '');
        setData('tradename', company.tradename ?? '');
        setData('nif', company.nif ?? '');
    }, [company]);

    const [showFileInput, setShowFileInput] = useState(!company.logo && !company.logo_url);

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

    async function handleSubmit(e){
        e.preventDefault();

        const formData = new FormData();
        formData.append('_method', 'PUT');

        Object.entries(data).forEach(([key, value]) => {
            if (key === 'logo' && value instanceof File) {
                formData.append(key, value);
            } else if (typeof value === 'object' && value !== null) {
                formData.append(key, JSON.stringify(value));
            } else if (value !== null && typeof value !== 'undefined') {
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

    const handleDeleteLogo = () => {
        showConfirm({
            title: __('logo_eliminar'),
            text: __('logo_eliminar_confirm'),
            icon: 'warning',
            onConfirm: () => {
                router.delete(route('companies.logo.delete', company.id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        // Let Inertia update the page; ensure file input is visible
                        setShowFileInput(true);
                    }
                });
            }
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

    return (
        <form onSubmit={handleSubmit}>
            <div className="row gy-3">
                <div className="col-lg-6">
                    <label className="form-label">{ __('razon_social') }*</label>
                    <TextInput
                        type="text"
                        placeholder={__('empresa_nombre')}
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        maxLength={100}
                        required
                    />
                    <InputError message={errors.name} />
                </div>

                <div className="col-lg-6">
                    <label className="form-label">{ __('nombre_comercial') }*</label>
                    <TextInput
                        type="text"
                        placeholder={__('nombre_comercial')}
                        value={data.tradename}
                        onChange={(e) => setData('tradename', e.target.value)}
                        maxLength={100}
                        required
                    />
                    <InputError message={errors.tradename} />
                </div>

                <div className="col-lg-3">
                    <label className="form-label">{ __('nif') }*</label>
                    <TextInput
                        type="text"
                        placeholder={__('nif')}
                        value={data.nif}
                        onChange={(e) => setData('nif', e.target.value)}
                        maxLength={15}
                        required
                    />
                    <InfoPopover code="company-nif" />
                    <InputError message={errors.nif} />
                </div>

                <div className="offset-lg-1 col-lg-8">
                    <label className="form-label">{ __('logo') }</label>

                    {company.logo ? (
                        <div className="d-flex align-items-start">
                            <img
                                src={company.logo_url ?? computeLogoSrc(company.logo)}
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
                        <FileInput name="logo" accept="image/*" onChange={handleChange} error={errors.logo} />
                    )}

                    <p className='pt-1 text-warning small'>
                        <span className='me-5'>{ __('imagen_formato') }</span>
                        <span className='me-5'>{ __('imagen_peso_max') }: 1MB</span>
                        { __('imagen_medidas_recomendadas') }: 400x400px
                    </p>
                </div>

                <div className='mt-4 text-end'>
                    <PrimaryButton disabled={processing} className='btn btn-rdn'>
                        {processing ? __('procesando')+'...':__('guardar')}
                    </PrimaryButton>
                </div>
            </div>
        </form>
    );
}
