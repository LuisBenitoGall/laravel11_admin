import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

//Components:
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import RadioButton from '@/Components/RadioButton';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';

//Hooks:
import { useTranslation } from '@/Hooks/useTranslation';

export default function Create({ auth, session, title, subtitle, roles = {}, availableLocales }){
    const __ = useTranslation();
    const props = usePage()?.props || {};
    const locale = props.locale || false;
    const languages = props.languages || [];
    const permissions = props.permissions || {};

    //Roles:
    const arrRoles = Object.entries(roles).map(([key, label]) => ({
        value: key,
        label: label,
    }));

     // Set formulario:
    const {data, setData, post, reset, errors, processing} = useForm({
        role: '',
        name: '',
        surname: '',
        email: '',
        status: true,
        link_company: true,
        send_password: false
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

    // Enviar formulario:
    function handleSubmit(e){
        e.preventDefault()
        post(route('users.store'), {
            onSuccess: () => reset()
        })
    }

    //Acciones:
    const actions = [];
    if (permissions?.['users.index']) {
        actions.push({
            text: __('usuarios_volver'),
            icon: 'la-angle-left',
            url: 'users.index',
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
                {/* Formulario */}
                <form onSubmit={handleSubmit}>
                    <div className="row gy-3 mb-3">
                        {/* Rol */}
                        <div className="col-12">
                            <div className="position-relative">
                                <label htmlFor="role" className="form-label">{ __('role') }*</label>    
                                <RadioButton
                                    name="role"
                                    value={data.role}
                                    onChange={(e) => setData('role', e.target.value)}
                                    options={arrRoles}
                                    required
                                />

                                <InputError message={errors.role} />
                            </div>
                        </div>

                        {/* Nombre */}
                        <div className="col-md-6">
                            <div>
                                <label htmlFor="name" className="form-label">{ __('nombre') }*</label>
                                <TextInput
                                    type="text"
                                    name="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    maxLength={150}
                                    required
                                />

                                <InputError message={errors.name} />
                            </div>
                        </div>   

                        {/* Apellidos */}
                        <div className="col-md-6">
                            <div>
                                <label htmlFor="surname" className="form-label">{ __('apellidos') }*</label>
                                <TextInput
                                    type="text"
                                    name="surname"
                                    value={data.surname}
                                    onChange={(e) => setData('surname', e.target.value)}
                                    maxLength={150}
                                    required
                                />

                                <InputError message={errors.surname} />
                            </div>
                        </div>   

                        {/* Email */}
                        <div className="col-md-6">
                            <div>
                                <label htmlFor="name" className="form-label">{ __('email') }*</label>
                                <TextInput
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    maxLength={100}
                                    required
                                />

                                <InputError message={errors.email} />
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

                        {/* Vincular a empresa */}
                        <div className="col-lg-2 text-center">
                            <div className="position-relative">
                                <label htmlFor="link_company" className="form-label">{ __('vincular_a_empresa') }</label>
                                <div className='pt-1 position-relative'>
                                    <Checkbox 
                                        className="xl"
                                        name="link_company"
                                        checked={data.link_company}
                                        onChange={(e) => setData('link_company', e.target.checked)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Envío password a usuario */}
                        <div className="col-md-3 text-center">
                            <div className="position-relative">
                                <label htmlFor="send_password" className="form-label">{ __('usuario_envio_password') }</label>
                                <div className='pt-1 position-relative'>
                                    <Checkbox 
                                        className="xl"
                                        name="send_password"
                                        checked={data.send_password}
                                        onChange={(e) => setData('send_password', e.target.checked)}
                                    />
                                </div>
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