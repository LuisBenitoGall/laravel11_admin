import React, { useState } from 'react';
import { router, useForm, usePage } from '@inertiajs/react';

//Components:
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

//Hooks:
import { useTranslation } from '@/Hooks/useTranslation';

export default function UserPassword({ user }) {
    const __ = useTranslation();
    const { data, setData, put, processing, errors } = useForm({
        password: '',
        password_confirmation: ''
    });

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

        router.post(route('users.pwd.update', user.id), formData, {
            forceFormData: true,
            preserveScroll: true,
            //onSuccess: () => console.log('Usuario actualizado'),
            onError: (errors) => console.error('Errores:', errors),
            //onFinish: () => console.log('Petición finalizada'),
        });
    };

    return (
        <div className="col-12 gy-2">
            {/* Formulario */}
            <form onSubmit={handleSubmit}>
                <div className="row gy-3 mb-3">
                    {/* Password */}
                    <div className="col-md-6">
                        <div>
                            <label htmlFor="password" className="form-label">{ __('password') }*</label>
                            <TextInput 
                                className="" 
                                name="password"
                                type="password"
                                placeholder={__('password')} 
                                value={data.password} 
                                onChange={(e) => setData('password', e.target.value)}
                                maxLength={14}
                                required
                            />

                            <InputError message={errors.password} />
                        </div>
                    </div>

                    {/* Confirmar password */}
                    <div className="col-md-6">
                        <div>
                            <label htmlFor="password_confirmation" className="form-label">{ __('password_confirm') }*</label>
                            <TextInput 
                                className="" 
                                name="password_confirmation"
                                type="password"
                                placeholder={__('password_repite')} 
                                value={data.password_confirmation} 
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                maxLength={14}
                                required
                            />

                            <InputError message={errors.password_confirmation} />
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
    );
}