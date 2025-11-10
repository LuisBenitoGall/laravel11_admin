import React, { useState } from 'react';
import { router, useForm, usePage } from '@inertiajs/react';
import DatePicker from 'react-datepicker';

//Components:
import DatePickerToForm from '@/Components/DatePickerToForm';
import FileInput from '@/Components/FileInput';
import InputError from '@/Components/InputError';
import ManagePhones from '@/Components/ManagePhones';
import PrimaryButton from '@/Components/PrimaryButton';
import RadioButton from '@/Components/RadioButton';
import SelectInput from '@/Components/SelectInput';
import TextInput from '@/Components/TextInput';

//Hooks:
import { useSweetAlert } from '@/Hooks/useSweetAlert';
import { useTranslation } from '@/Hooks/useTranslation';

export default function UserPersonalData({ user, roles = {}, user_roles = {}, salutations = [] }) {
    const __ = useTranslation();
    const props = usePage()?.props || {};
    const locale = props.locale || false;
    const languages = props.languages || [];
    const { showConfirm } = useSweetAlert();
    const permissions = props.permissions || {};
    const datepickerFormat = props.languages?.[locale]?.[6] || 'dd/MM/yyyy';

    //Roles:
    const arrRoles = Object.entries(roles).map(([key, label]) => ({
        value: key,
        label: label,
    }));

    //Roles del usuario:
    const currentRole = user_roles?.[0]?.id?.toString() || '';

    // Set formulario:
    const { data, setData, put, processing, errors } = useForm({
        // si no tiene role y no es admin, asignamos por defecto 'Invitados'
        role:      currentRole || (user?.isAdmin == 1 ? '' : 'Invitados'),
        name:      user.name || '',
        surname:   user.surname || '',
        salutation: user.salutation || '',
        email:     user.email || '',
        nif:       user.nif || '',
        birthday:  user.birthday ? new Date(user.birthday) : null,
        signature: null
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

    // Envío formulario:
    function handleSubmit(e){
        e.preventDefault();

        const formData = new FormData();
        formData.append('_method', 'PUT');

        Object.entries(data).forEach(([key, value]) => {
            if (key === 'signature' && value instanceof File) {
                formData.append(key, value);
            } else if (typeof value === 'object' && value !== null) {
                formData.append(key, JSON.stringify(value));
            } else if (value !== null && value !== undefined) {
                formData.append(key, value);
            }
        });

        router.post(route('users.update', user.id), formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => console.log('Usuario actualizado'),
            onError: (errors) => console.error('Errores:', errors),
            onFinish: () => console.log('Petición finalizada'),
        });
    }

    // Eliminar firma:
    const handleDeleteSignature = () => {
        showConfirm({
            title: __('firma_eliminar'),
            text: __('firma_eliminar_confirm'),
            icon: 'warning',
            onConfirm: () => {
                router.delete(route('users.signature.delete', user.id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        location.reload(); // o router.reload() si prefieres
                    },
                });
            },
        });
    };

    return (
        <div className="col-12 gy-2">
            {/* Formulario */}
            <form onSubmit={handleSubmit}>
                <div className="row gy-3 mb-3">
                    {/* Rol: sólo para usuarios con acceso */}
                    {user?.isAdmin == 1 ? (
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
                    ) : (
                        // Si no es admin, incluimos el role como campo oculto (por defecto 'Invitados')
                        <input type="hidden" name="role" value={data.role} />
                    )}

                    {/* Tratamiento */}
                    <div className="col-md-2">
                        <div>
                            <label htmlFor="salutation" className="form-label">{ __('tratamiento') }</label>
                            <SelectInput
                                className="form-select"
                                name="salutation"
                                value={data.salutation}
                                onChange={(e) => setData('salutation', e.target.value)}
                            >
                                <option value="">{ __('opcion_selec') }</option>
                                {salutations.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </SelectInput>
                            <InputError message={errors.salutation} />
                        </div>
                    </div>

                    {/* Nombre */}
                    <div className="col-md-5">
                        <div>
                            <label htmlFor="name" className="form-label">{ __('nombre') }*</label>
                            <TextInput 
                                className="" 
                                name="name"
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

                    {/* Apellidos */}
                    <div className="col-md-5">
                        <div>
                            <label htmlFor="surname" className="form-label">{ __('apellidos') }*</label>
                            <TextInput 
                                className="" 
                                name="surname"
                                type="text"
                                placeholder={__('apellidos')} 
                                value={data.surname} 
                                onChange={(e) => setData('surname', e.target.value)}
                                maxLength={100}
                                required
                            />

                            <InputError message={errors.surname} />
                        </div>
                    </div>

                    {/* Email */}   
                    <div className="col-md-6">
                        <div>
                            <label htmlFor="email" className="form-label">{ __('email') }*</label>
                            <TextInput 
                                className="" 
                                name="email"
                                type="email"
                                placeholder={__('email')} 
                                value={data.email} 
                                onChange={(e) => setData('email', e.target.value)}
                                maxLength={100}
                                required
                            />

                            <InputError message={errors.email} />
                        </div>
                    </div>

                    {/* NIF */}
                    <div className="col-md-3">
                        <div>
                            <label htmlFor="nif" className="form-label">{ __('nif') }</label>
                            <TextInput 
                                className="" 
                                name="nif"
                                type="text"
                                placeholder={__('nif')} 
                                value={data.nif} 
                                onChange={(e) => setData('nif', e.target.value)}
                                maxLength={15}
                            />

                            <InputError message={errors.nif} />
                        </div>
                    </div>

                    {/* Fecha nacimiento */}
                    <div className="col-md-3">
                        <div className="position-relative">
                            <label htmlFor="birthday" className="form-label">{ __('fecha_nacimiento') }</label>
                            <DatePickerToForm
                                id="birthday"
                                name="birthday"
                                selected={data.birthday ? new Date(data.birthday) : null}
                                onChange={(name, date) => {
                                    setData(name, date);
                                    if (!date) {
                                        setData('published_end', null);
                                    }
                                }}
                                dateFormat={datepickerFormat}
                            />   

                            <InputError message={errors.birthday} />             
                        </div>
                    </div>
                    <div className="w-100 m-0"></div>

                    {/* Firma: sólo para usuarios con acceso */}
                    {user?.isAdmin == 1 && (
                        <div className="col-md-6">
                            <div>
                                <label htmlFor="signature" className="form-label">{ __('firma') }</label>
                                {user.signature ? (
                                    <div className="d-flex align-items-start">
                                        <img
                                            src={`/storage/signatures/${user.signature}`}
                                            alt={user.name}
                                            className="img-thumbnail me-3"
                                            style={{ maxWidth: '300px', objectFit: 'contain' }}
                                        />

                                        <button 
                                            type="button" 
                                            className="ms-2 btn btn-sm btn-danger" 
                                            onClick={handleDeleteSignature}
                                        >
                                            <i className="la la-trash"></i>
                                        </button>
                                    </div>
                                ) : (
                                    <FileInput 
                                        name="signature"
                                        accept="image/*"
                                        onChange={handleChange}
                                        error={errors.signature} 
                                    />
                                )}

                                <p className='pt-1 text-warning small'>
                                    <span className='me-5'>{ __('imagen_formato') }</span>
                                    <span className='me-5'>{ __('imagen_peso_max') }: 1MB</span>
                                    { __('imagen_medidas_recomendadas') }: 400x400px
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className='mt-4 text-end'>
                    <PrimaryButton disabled={processing} className='btn btn-rdn'>
                        {processing ? __('procesando')+'...':__('guardar')}
                    </PrimaryButton>	
                </div>
            </form>

            {/* Teléfonos */}
            <ManagePhones 
                phoneableType="User"
                phoneableId={user.id}
                defaultWaMessage={__('whatsapp_mensaje')}
            />
        </div>
    );
}