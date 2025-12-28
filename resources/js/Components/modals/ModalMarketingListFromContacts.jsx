import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

// Components
import ReusableModal from '@/Components/modals/ModalTemplate';
import InputError from '@/Components/InputError';

// Hooks
import { useTranslation } from '@/Hooks/useTranslation';

export default function ModalMarketingListFromContacts({ show, onClose, filters = {} }) {
    const __ = useTranslation();

    const [form, setForm] = useState({
        name: '',
        observations: '',
    });

    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (!show) {
            setForm({
                name: '',
                observations: '',
            });
            setErrors({});
            setProcessing(false);
        }
    }, [show]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleConfirm = () => {
        const newErrors = {};
        if (!form.name.trim()) {
            newErrors.name = __('campo_obligatorio');
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setProcessing(true);

        router.post(
            route('marketing-lists.store-from-contacts'),
            {
                name: form.name,
                observations: form.observations || null,
                redirect_filters: filters || {},   // 👈 aquí viajan los filtros
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    // El redirect lo gestiona el backend (a crm-contacts.index en modo builder)
                    setForm({ name: '', observations: '' });
                    setErrors({});
                    onClose && onClose();
                },
                onError: (err) => {
                    setErrors(err || {});
                },
                onFinish: () => setProcessing(false),
            }
        );
    };

    return (
        <ReusableModal
            show={show}
            onClose={onClose}
            onConfirm={handleConfirm}
            title={__('marketing_lista_crear')}
            confirmText={processing ? __('guardando') : __('guardar')}
            cancelText={__('cancelar')}
            confirmDisabled={processing}
        >
            <div className="mb-3">
                <label className="form-label">{__('nombre')}*</label>
                <input
                    type="text"
                    name="name"
                    className="form-control"
                    value={form.name}
                    onChange={handleChange}
                    maxLength={255}
                    autoComplete="off"
                />
                <InputError message={errors.name} />
            </div>

            <div className="mb-3">
                <label className="form-label">{__('observaciones')}</label>
                <textarea
                    name="observations"
                    className="form-control"
                    rows={3}
                    value={form.observations}
                    onChange={handleChange}
                    maxLength={500}
                />
                <InputError message={errors.observations} />
            </div>
        </ReusableModal>
    );
}
