import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { router } from '@inertiajs/react';

// Components
import ReusableModal from '@/Components/modals/ModalTemplate';
import InfoPopover from '@/Components/InfoPopover';
import InputError from '@/Components/InputError';
import UserSearch from '@/Components/UserSearch';
import FlashMessage from '@/Components/FlashMessage';

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

    // flash local (mismo estilo que el layout)
    const [flash, setFlash] = useState({
        type: null,
        message: '',
    });

    // Reset cada vez que se abre/cierra
    useEffect(() => {
        if (!show) {
            setForm({
                user_id: null,
                observations: '',
            });
            setErrors({});
            setProcessing(false);
            setFlash({
                type: null,
                message: '',
            });
        }
    }, [show]);

    const handleSelectUser = (user) => {
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

    const handleConfirm = async () => {
        const newErrors = {};

        if (!form.user_id) {
            newErrors.user_id = __('campo_obligatorio');
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setProcessing(true);
        setErrors({});
        setFlash({ type: null, message: '' });

        try {
            const response = await axios.post(
                route('marketing-list-users.store'),
                {
                    marketing_list_id: marketingListId,
                    user_id: form.user_id,
                    observations: form.observations || null,
                },
                {
                    headers: {
                        Accept: 'application/json',
                    },
                }
            );

            // Éxito
            const msg = response.data?.message ?? __('usuario_anadido_ok');

            // Si quieres ver mensaje de éxito dentro del modal antes de cerrar, descomenta:
            // setFlash({ type: 'success', message: msg });

            // Cerramos modal directamente (ya que la operación fue correcta)
            onClose?.();

            if (typeof onAdded === 'function') {
                onAdded(response.data?.data);
            }
        } catch (error) {
            const status = error.response?.status;
            const data   = error.response?.data ?? {};

            if (status === 422) {
                // Puede venir como { message: '...' } o como { errors: { campo: [msg] } }
                const backendErrors = data.errors || {};
                if (Object.keys(backendErrors).length > 0) {
                    const flatErrors = {};
                    Object.entries(backendErrors).forEach(([field, msgs]) => {
                        if (Array.isArray(msgs) && msgs.length) {
                            flatErrors[field] = msgs[0];
                        }
                    });
                    setErrors(flatErrors);
                }

                const firstError =
                    data.message ||
                    Object.values(data.errors ?? {})?.[0]?.[0] ||
                    __('error_validacion');

                setFlash({
                    type: 'danger',
                    message: firstError,
                });
            } else if (status === 403) {
                setFlash({
                    type: 'danger',
                    message: data.message ?? __('empresa_no_activa'),
                });
            } else {
                setFlash({
                    type: 'danger',
                    message: __('error_interno_intentelo_mas_tarde'),
                });
            }
        } finally {
            setProcessing(false);
        }
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
            {/* Flash local dentro del modal, mismo estilo que el layout */}
            <FlashMessage
                type={flash.type || 'danger'}
                message={flash.message}
            />

            {/* Selector de usuario */}
            <div className="mb-3">
                <div className="position-relative">
                    <label className="form-label">
                        {__('usuario')}*
                    </label>

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
