import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

//Components:
import Checkbox from '@/Components/Checkbox';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

//Hooks:
import { useTranslation } from '@/Hooks/useTranslation';

export default function Create({ auth, session, title, subtitle, company }){
    const __ = useTranslation();
    const props = usePage()?.props || {};
    const permissions = props.permissions || {};

    // Set formulario:
    const { data, setData, post, errors, processing } = useForm({ 
        name: '', 
        company_id: company.id,
        code: '',
        status: 1 
    });

    const handleChange = (e) => {
        const { name, type, checked, value } = e.target;
        if (type === 'checkbox') {
            setData(name, checked ? 1 : 0);
        } else {
            setData(name, value);
        }
    };

    //Envío formulario:
    function handleSubmit(e){
        e.preventDefault();
        post(route('cost-centers.store'));
    }

    //Acciones:
    const actions = [];
    if (permissions?.['cost-centers.index']) {
        actions.push({ 
            text: __('centros_volver'), 
            icon: 'la-angle-left', 
            url: 'cost-centers.index', 
            params: company?.id ?? null,
            modal: false 
        }); 
    }

    return (
        <AdminAuthenticatedLayout user={auth.user} title={title} subtitle={subtitle} actions={actions}>
            <Head title={title} />

            <div className="contents pb-4">
                <div className="row">
                    <div className="col-12">
                        <h2>{__('centro_coste_nuevo')} <u>{company.name}</u></h2>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="row gy-3">
                        <div className="col-lg-6">
                            <label className="form-label">{__('centro_coste')}*</label>
                            <TextInput value={data.name} onChange={(e) => setData('name', e.target.value)} maxLength={150} required />
                            <InputError message={errors.name} />
                        </div>

                        <div className="col-lg-4">
                            <label className="form-label">{__('codigo')}</label>
                            <TextInput value={data.code} onChange={(e) => setData('code', e.target.value)} maxLength={50} />
                            <InputError message={errors.code} />
                        </div>

                        <div className="col-lg-2 text-center">
                            <label htmlFor="status" className="form-label">{ __('estado') }</label>
                            <div className='pt-1 position-relative'>
                                <Checkbox
                                    className="xl"
                                    name="status"
                                    checked={!!data.status}
                                    onChange={handleChange}
                                />
                            </div>
                            <InputError message={errors.status} />
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
