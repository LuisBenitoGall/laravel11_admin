// resources/js/Components/modals/ModalMarketingListAddUser.jsx

import React, { useState, useEffect } from 'react';
import { router } from '@inertiajs/react';

// Components
import ReusableModal from '@/Components/modals/ModalTemplate';
import InfoPopover from '@/Components/InfoPopover';
import InputError from '@/Components/InputError';
import UserSearch from '@/Components/UserSearch';

// Hooks
import { useTranslation } from '@/Hooks/useTranslation';

export default function ModalMarketingListAddUser({
    show,
    onClose,
    onAdded,          // callback opcional para que el padre recargue (router.reload, etc.)
    marketingListId,  // id de la lista de marketing
}) {
    const __ = useTranslation();

    const [form, setForm] = useState({
        user_id: null,
        observations: '',
    });

    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    // Reset cada vez que se abre/cierra
    useEffect(() => {
        if (!show) {
            setForm({
                user_id: null,
                observations: '',
            });
            setErrors({});
            setProcessing(false);
        }
    }, [show]);

    const handleSelectUser = (user) => {
        // Ajusta según la firma real de tu UserSearch
        // Si te devuelve solo id, cambia esto en consecuencia
        setForm((prev) => ({
            ...prev,
            user_id: user ? user.id : null,
        }));
        setErrors((prev) => ({ ...prev, user_id: null }));
    };

    const handleChangeObservations = (e) => {
        const { value } = e.target;
        setForm((prev) => ({
            ...prev,
            observations: value,
        }));
    };

    const handleConfirm = () => {
        const newErrors = {};

        if (!form.user_id) {
            newErrors.user_id = __('campo_obligatorio');
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setProcessing(true);

        router.post(
            route('marketing-list-users.store'), 
            {
                marketing_list_id: marketingListId,
                user_id: form.user_id,
                observations: form.observations || null,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setForm({
                        user_id: null,
                        observations: '',
                    });
                    setErrors({});
                    onClose();

                    if (typeof onAdded === 'function') {
                        onAdded();
                    }
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
            title={__('usuario_agregar')}
            confirmText={processing ? __('guardando') : __('guardar')}
            cancelText={__('cancelar')}
            confirmDisabled={processing}
        >
            {/* Selector de usuario */}
            <div className="mb-3">
                <div className="position-relative">
                    <label className="form-label">
                        {__('usuario')}*
                    </label>

                    {/* 
                        UserSearch:
                        Ajusta las props según la implementación real.
                        Ejemplo típico:
                        - onSelect(user)
                        - searchUrl / route
                        - placeholder
                    */}
                    <UserSearch
                        id="ml-user-search"
                        name="user_id"
                        placeholder={__('usuario_buscar')}
                        searchUrl={route('marketing-list-users.search', marketingListId)}
                        onChange={handleSelectUser}
                    />

                    <InfoPopover code="marketing-list-user" />
                    <InputError message={errors.user_id} />
                </div>
            </div>

            {/* Observaciones opcionales */}
            <div className="mb-3">
                <div className="position-relative">
                    <label className="form-label">
                        {__('observaciones')}
                    </label>
                    <textarea
                        name="observations"
                        className="form-control"
                        rows={3}
                        value={form.observations}
                        onChange={handleChangeObservations}
                        maxLength={500}
                    />
                    <InfoPopover code="marketing-list-user-observations" />
                    <InputError message={errors.observations} />
                </div>
            </div>
        </ReusableModal>
    );
}
