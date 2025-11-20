import React, { useState } from 'react';
import { router, useForm } from '@inertiajs/react';

// Components
import Modal from '@/Components/Modal';
import Checkbox from '@/Components/Checkbox';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InputError from '@/Components/InputError';

// Hooks
import { useTranslation } from '@/Hooks/useTranslation';

export default function ModalConvertCrmAccount({
    show,
    onClose,
    crmAccount,
    canCreateCustomer = false,
    canCreateProvider = false
}){
    const __ = useTranslation();

    const { data, setData, post, processing, errors, reset } = useForm({
        as_customer: false,
        as_provider: false,
    });

    const [localError, setLocalError] = useState('');

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setData(name, checked);
        if (localError) {
            setLocalError('');
        }
    };

    const handleClose = () => {
        reset();
        setLocalError('');
        onClose && onClose();
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!data.as_customer && !data.as_provider) {
            setLocalError(__('debes_seleccionar_cliente_proveedor'));
            return;
        }

        // Ruta para convertir la cuenta CRM en cliente/proveedor
        // Ajusta el nombre si defines otra en Laravel
        const url = route('crm-accounts.convert', crmAccount.id);

        post(url, {
            preserveScroll: true,
            onSuccess: () => {
                handleClose();
            },
        });
    };

    if (!show) {
        return null;
    }

    return (
        <Modal show={show} onClose={handleClose} maxWidth="md">
            <form onSubmit={handleSubmit}>
                <div className="modal-header">
                    <h5 className="modal-title">
                        {__('convertir_cliente_proveedor')}
                    </h5>
                    <button
                        type="button"
                        className="btn-close"
                        aria-label="Close"
                        onClick={handleClose}
                    ></button>
                </div>

                <div className="modal-body">
                    <p className="mb-3">
                        {__('convertir_cliente_proveedor_texto', {
                            name: crmAccount?.name || ''
                        })}
                    </p>

                    <div className="mb-2">
                        {canCreateCustomer && (
                            <label className="d-flex align-items-center mb-2">
                                <Checkbox
                                    name="as_customer"
                                    checked={data.as_customer}
                                    onChange={handleCheckboxChange}
                                />
                                <span className="ms-2">
                                    {__('crear_como_cliente')}
                                </span>
                            </label>
                        )}

                        {canCreateProvider && (
                            <label className="d-flex align-items-center mb-2">
                                <Checkbox
                                    name="as_provider"
                                    checked={data.as_provider}
                                    onChange={handleCheckboxChange}
                                />
                                <span className="ms-2">
                                    {__('crear_como_proveedor')}
                                </span>
                            </label>
                        )}
                    </div>

                    {(localError || errors.as_customer || errors.as_provider) && (
                        <InputError
                            message={
                                localError ||
                                errors.as_customer ||
                                errors.as_provider
                            }
                            className="mt-2"
                        />
                    )}
                </div>

                <div className="modal-footer">
                    <SecondaryButton type="button" onClick={handleClose}>
                        {__('cancelar')}
                    </SecondaryButton>

                    <PrimaryButton type="submit" disabled={processing}>
                        {__('aceptar')}
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
}
