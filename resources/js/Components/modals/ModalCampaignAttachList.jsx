import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Components:
import ReusableModal from '@/Components/modals/ModalTemplate';
import InputError from '@/Components/InputError';
import UserSearch from '@/Components/UserSearch';
import FlashMessage from '@/Components/FlashMessage';

// Hooks:
import { useTranslation } from '@/Hooks/useTranslation';

export default function ModalCampaignAttachList({
    show,
    onClose,
    onAdded,
    campaign,
}) {
    const __ = useTranslation();

    const [selectedList, setSelectedList] = useState(null);
    const [errors, setErrors]             = useState({});
    const [processing, setProcessing]     = useState(false);
    const [flash, setFlash]               = useState({ type: null, message: '' });

    useEffect(() => {
        if (!show) {
            setSelectedList(null);
            setErrors({});
            setProcessing(false);
            setFlash({ type: null, message: '' });
        }
    }, [show]);

    const handleConfirm = async () => {
        if (!selectedList) {
            setErrors({ list_id: __('campo_obligatorio') });
            return;
        }

        setProcessing(true);
        setErrors({});
        setFlash({ type: null, message: '' });

        try {
            const response = await axios.post(
                route('marketing-campaigns.lists.attach', {
                    campaign: campaign.id,
                    list:     selectedList.id,
                }),
                {},
                { headers: { Accept: 'application/json' } }
            );

            onClose?.();
            onAdded?.(response.data);
        } catch (error) {
            const status = error.response?.status;
            const data   = error.response?.data ?? {};

            if (status === 422) {
                setFlash({ type: 'danger', message: data.message ?? __('error_validacion') });
            } else if (status === 403) {
                setFlash({ type: 'danger', message: data.message ?? __('acceso_denegado') });
            } else {
                setFlash({ type: 'danger', message: __('error_interno_intentelo_mas_tarde') });
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
            title={__('lista_agregar')}
            confirmText={processing ? `${__('guardando')}...` : __('vincular')}
            cancelText={__('cancelar')}
            confirmDisabled={processing}
            confirmLoading={processing}
            confirmClassName="btn-primary"
        >
            <FlashMessage type={flash.type || 'danger'} message={flash.message} />

            <div className="mb-3">
                <label className="form-label">{__('lista_marketing')}*</label>
                <UserSearch
                    id="campaign-list-search"
                    name="list_id"
                    placeholder={__('lista_buscar')}
                    searchUrl={route('marketing-campaigns.lists.search', { campaign: campaign?.id })}
                    onChange={(item) => {
                        setSelectedList(item);
                        setErrors((prev) => ({ ...prev, list_id: null }));
                    }}
                    minLength={1}
                />
                <InputError message={errors.list_id} />
            </div>
        </ReusableModal>
    );
}
