import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

//Components:
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

//Hooks:
import { useTranslation } from '@/Hooks/useTranslation';

export default function Create({ auth, session, title, subtitle, company, availableLocales }){
    const __ = useTranslation();
    const props = usePage()?.props || {};
    const permissions = props.permissions || {};

    // Set formulario:
    const { data, setData, post, reset, errors, processing } = useForm({
        name: '',
        company_id: company.id,
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

    // Envío formulario:
    function handleSubmit(e){
        e.preventDefault();
        post(route('workplaces.store'), {
            onSuccess: () => reset()
        })
    }

    //Acciones:
    const actions = [];
    if (permissions?.['workplaces.index']) {
        actions.push({
            text: __('centros_volver'),
            icon: 'la-angle-left',
            url: 'workplaces.index',
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
                        <h2>{__('centro_trabajo_nuevo')} <u>{company.name}</u></h2>
                    </div>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit}>
                    <div className="row gy-3">
                        <div className="col-lg-6">
                            <label htmlFor="name" className="form-label">{ __('centro_trabajo') }*</label>
                            <TextInput
                                className=""
                                type="text"
                                placeholder={__('centro_trabajo')}
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                maxLength={150}
                                required
                            />
                            <InputError message={errors.name} />
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
