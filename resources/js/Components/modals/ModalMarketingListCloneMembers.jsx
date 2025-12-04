// resources/js/Components/modals/ModalMarketingListCloneMembers.jsx

import React, { useEffect, useState } from 'react';
import { router } from '@inertiajs/react';

// Components
import ReusableModal from '@/Components/modals/ModalTemplate';
import InputError from '@/Components/InputError';
import SelectSearch from '@/Components/SelectSearch';

// Hooks
import { useTranslation } from '@/Hooks/useTranslation';

export default function ModalMarketingListCloneMembers({
    show,
    onClose,
    onCloned,          // callback para recargar miembros
    marketingListId,
    sourceLists = [],  // [{ id, name }]
}) {
    const __ = useTranslation();

    const [selectedIds, setSelectedIds] = useState([]);
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (!show) {
            setSelectedIds([]);
            setErrors({});
            setProcessing(false);
        }
    }, [show]);

    // Opciones para SelectSearch: asumo API típica { value, label }
    const options = sourceLists.map(list => ({
        value: list.id,
        label: list.name,
    }));

    // Normalizamos lo que devuelva SelectSearch a array de ids numéricos
    const handleListsChange = (value) => {
        let ids = [];

        if (Array.isArray(value)) {
            // puede ser array de valores simples o de objetos { value, ... }
            if (value.length && typeof value[0] === 'object') {
                ids = value
                    .map(v => Number(v.value ?? v.id))
                    .filter(v => !Number.isNaN(v));
            } else {
                ids = value
                    .map(v => Number(v))
                    .filter(v => !Number.isNaN(v));
            }
        } else if (value !== null && value !== undefined) {
            if (typeof value === 'object') {
                const v = Number(value.value ?? value.id);
                if (!Number.isNaN(v)) ids = [v];
            } else {
                const v = Number(value);
                if (!Number.isNaN(v)) ids = [v];
            }
        }

        setSelectedIds(ids);
        if (ids.length > 0) {
            setErrors(prev => ({ ...prev, source_list_ids: null }));
        }
    };

    const handleConfirm = () => {
        const newErrors = {};

        if (!selectedIds.length) {
            newErrors.source_list_ids = __('campo_obligatorio');
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setProcessing(true);

        router.post(
            route('marketing-list-users.clone', marketingListId),
            {
                source_list_ids: selectedIds,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedIds([]);
                    setErrors({});
                    onClose && onClose();
                    if (typeof onCloned === 'function') {
                        onCloned();
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
            title={__('listas_copiar')}
            confirmText={processing ? __('copiando') : __('copiar')}
            cancelText={__('cancelar')}
            confirmDisabled={processing}
        >
            <div className="mb-3">
                <p className="mb-3">{__('listas_copiar_texto')}</p>

                <label className="form-label">
                    {__('listas')}*
                </label>

                <SelectSearch
                    name="source_list_ids"
                    isMulti={true}
                    options={options}
                    // value: reconstruimos en el formato que SelectSearch entienda
                    value={options.filter(opt => selectedIds.includes(opt.value))}
                    onChange={handleListsChange}
                    placeholder={__('listas_selec')}
                />

                {/* <small className="text-muted d-block mt-1">
                    {__('mantener_ctrl_para_seleccion_multiple')}
                </small> */}

                <InputError message={errors.source_list_ids} />
            </div>
        </ReusableModal>
    );
}
