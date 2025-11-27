import React, { useState, useEffect, useRef } from 'react';
import { useForm, usePage } from '@inertiajs/react';

// Components
import Checkbox from '@/Components/Checkbox';
import ReusableModal from '@/Components/modals/ModalTemplate';
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
    canCreateProvider = false,
}){
    const __ = useTranslation();

    const { data, setData, post, processing, errors, reset } = useForm({
        as_customer: false,
        as_provider: false,
        crm_account_id: crmAccount?.id || null
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

    const formRef = useRef(null);

    const handleConfirm = () => {
        // If form exists, use HTML5 validation before submitting
        if (formRef.current && typeof formRef.current.reportValidity === 'function') {
            const valid = formRef.current.reportValidity();
            if (!valid) return;
        }

        post(route('crm-accounts.convert', crmAccount.id), {
            preserveScroll: true,
            onSuccess: (resp) => {
                reset();
                onClose?.();
                if (typeof onCreate === 'function') onCreate(resp);
            }
        });
    };

    return (
        <ReusableModal
            show={show}
            onClose={onClose}
            onConfirm={handleConfirm}
            title={__('convertir_cliente_proveedor')}
            confirmText={processing ? __('guardando') : __('guardar')}
            cancelText={__('cancelar')}
            size="md"
        >
            <form ref={formRef} onSubmit={(e) => { e.preventDefault(); handleConfirm(); }}>
                <p className="mb-3">
                    {__('convertir_cliente_proveedor_texto', {
                        name: crmAccount?.name || ''
                    })}
                </p>

                <div className="mb-3">
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
            </form>
        </ReusableModal>
    );
}
