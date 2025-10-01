import React, { useState } from 'react';
import { router } from '@inertiajs/react';

//Components:
import InfoPopover from '@/Components/InfoPopover';
import ReusableModal from '@/Components/modals/ModalTemplate';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';

//Hooks:
import { useTranslation } from '@/Hooks/useTranslation';

export default function ModalFunctionalityCreate({ show, onClose, onCreate, moduleId }) {
    const __ = useTranslation();
    const [form, setForm] = useState({
        name: '',
        label: ''
    });

    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    // const handleChange = (e) => {
    //     const { name, value } = e.target;
    //     setForm((prev) => ({ ...prev, [name]: value }));
    // };

    const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
        const updated = { ...prev, [name]: value };
        console.log('form state:', updated);
        return updated;
    });
};

    const handleConfirm = () => {
        const newErrors = {};
        if (!form.name) newErrors.name = __('campo_obligatorio');
        if (!form.label) newErrors.label = __('campo_obligatorio');

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setProcessing(true);

        router.post(route('functionalities.store'), {
            ...form,
            module_id: moduleId
        }, {
            preserveScroll: true,
            onSuccess: (page) => {
                setForm({ name: '', label: '' });
                setErrors({});
                onClose();
                if (typeof onCreate === 'function') {
                    onCreate(); // No le pases argumentos si no los necesitas
                }
            },
            onError: (err) => {
                setErrors(err);
            },
            onFinish: () => setProcessing(false)
        });
    };

    return (
        <ReusableModal
            show={show}
            onClose={onClose}
            onConfirm={handleConfirm}
            title={__('funcionalidad_nueva')}
            confirmText={__('guardar')}
            cancelText={__('cancelar')}
        >
            <div className="mb-3">
                <div className="position-relative">
                    <label className="form-label">{__('funcionalidad')}*</label>
                    {/* <TextInput name="name" value={form.name} onChange={handleChange} /> */}
                    <input
                        type="text"
                        name="name"
                        className="form-control"
                        value={form.name}
                        onChange={handleChange}
                        autoComplete="off"
                        maxLength={100}
                    />
                    <InfoPopover code="functionality-name" />

                    <InputError message={errors.name} />
                </div>
            </div>

            <div className="mb-3">
                <div className="position-relative">
                    <label className="form-label">{__('etiqueta')}*</label>
                    {/* <TextInput name="label" value={form.label} onChange={handleChange} /> */}
                    <input
                        type="text"
                        name="label"
                        className="form-control"
                        value={form.label}
                        onChange={handleChange}
                        autoComplete="off"
                        maxLength={100}
                    />
                    <InfoPopover code="functionality-label" />

                    <InputError message={errors.label} />
                </div>
            </div>
        </ReusableModal>
    );
}
