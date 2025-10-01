import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';
import { useEffect, useState } from 'react';
import axios from 'axios';

//Components:
import Checkbox from '@/Components/Checkbox';
import FileInput from '@/Components/FileInput';
import InfoPopover from '@/Components/InfoPopover';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import LocationSelects from '@/Components/LocationSelects';

//Hooks:
import { useSweetAlert } from '@/Hooks/useSweetAlert';
import { useTranslation } from '@/Hooks/useTranslation';

export default function Edit({ auth, session, title, subtitle, workplace, countries }){
    const __ = useTranslation();
    const props = usePage()?.props || {};
    const { showConfirm } = useSweetAlert();
    const locale = props.locale || false;
    const languages = props.languages || [];
    const permissions = props.permissions || {};

    // Set formulario:
    const { data, setData, errors, processing } = useForm({
        name: workplace.name || '',
        description: workplace.description || '',
        country_id: workplace.country_id || '',
        province_id: workplace.province_id || '',
        town_id: workplace.town_id || '',
        cp: workplace.cp || '',
        address: workplace.address || '',
        website: workplace.website || '',
        logo: null
    });

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
    // const { handleDelete } = useHandleDelete('centro_trabajo', 'workplaces.destroy', [workplace.id]);

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

        router.post(route('workplaces.update', workplace.id), formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => console.log('Centro actualizado'),
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
                router.delete(route('workplaces.logo.delete', workplace.id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        location.reload();
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
        if (r.includes('workplaces/') || r.includes('companies/')) return '/storage/' + r.replace(/^\/+/, '');
        return `/storage/workplaces/${r.replace(/^\/+/, '')}`;
    };

    // Acciones
    const actions = [];
    if (permissions?.['workplaces.index']) {
        actions.push({
            text: __('centros_volver'),
            icon: 'la-angle-left',
            url: 'workplaces.index',
            modal: false
        });
    }

    if (permissions?.['workplaces.create']) {
        actions.push({
            text: __('centro_nuevo'),
            icon: 'la-plus',
            url: 'workplaces.create',
            modal: false
        });
    }

    if (permissions?.['workplaces.destroy']) {
        actions.push({
            text: __('eliminar'),
            icon: 'la-trash',
             method: 'delete',
            url: 'workplaces.destroy',
            params: [workplace.id],
            title: __('centro_trabajo_eliminar'),
            message: __('centro_trabajo_eliminar_confirm'),
            modal: false
        });
    }

    return (
        <AdminAuthenticatedLayout user={auth.user} title={title} subtitle={subtitle} actions={actions}>
            <Head title={title} />

            <div className="contents pb-4">
                <div className="row">
                    <div className="col-12">
                        <h2>{__('centro_trabajo')} <u>{workplace.name}</u></h2>
                    </div>

                    {/* Info */}
                    <div className="col-12 mt-2 mb-4">
                        <span className="text-muted me-5">
                            {__('creado')}: <strong>{workplace.formatted_created_at}</strong> 
                        </span>

                        <span className="text-muted me-5">
                            {__('actualizado')}: <strong>{workplace.formatted_updated_at}</strong>
                        </span>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="row gy-3">
                        <div className="col-lg-6">
                            <label className="form-label">{__('centro_trabajo')}*</label>
                            <TextInput value={data.name} onChange={(e) => setData('name', e.target.value)} maxLength={150} required />
                            <InputError message={errors.name} />
                        </div>

                        <div className="col-12">
                            <label className="form-label">{__('descripcion')}</label>
                            <textarea className="form-control" rows="3" value={data.description} onChange={(e) => setData('description', e.target.value)}></textarea>
                            <InputError message={errors.description} />
                        </div>

                        <div className="col-12">
                            <LocationSelects countries={countries} formData={data} setData={setData} provincesUrl={'/api/provinces'} townsUrl={'/api/towns'} labels={{ country: __('pais'), province: __('provincia'), town: __('poblacion') }} />
                        </div>

                        <div className="col-md-4">
                            <label className="form-label">{__('cp')}</label>
                            <TextInput value={data.cp} onChange={(e) => setData('cp', e.target.value)} maxLength={6} />
                            <InputError message={errors.cp} />
                        </div>

                        <div className="col-md-8">
                            <label className="form-label">{__('direccion')}</label>
                            <TextInput value={data.address} onChange={(e) => setData('address', e.target.value)} maxLength={150} />
                            <InputError message={errors.address} />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">{__('website')}</label>
                            <TextInput value={data.website} onChange={(e) => setData('website', e.target.value)} maxLength={150} />
                            <InputError message={errors.website} />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">{__('logo')}</label>

                            {workplace.logo ? (
                                <div className="d-flex align-items-start">
                                    <img src={computeLogoSrc(workplace.logo)} alt={workplace.name} className="img-thumbnail me-3" style={{ maxWidth: '300px', objectFit: 'contain' }} />
                                    <button type="button" className="ms-2 btn btn-sm btn-danger" onClick={handleDeleteLogo}><i className="la la-trash"></i></button>
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
                            <PrimaryButton disabled={processing} className='btn btn-rdn'>{processing ? __('procesando')+'...':__('guardar')}</PrimaryButton>
                        </div>
                    </div>
                </form>
            </div>
        </AdminAuthenticatedLayout>
    );
}
