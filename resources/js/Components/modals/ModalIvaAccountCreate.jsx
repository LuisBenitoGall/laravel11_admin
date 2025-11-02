import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';

// Components
import ReusableModal from '@/Components/modals/ModalTemplate';
import InputError from '@/Components/InputError';
import InfoPopover from '@/Components/InfoPopover';

// Hooks
import { useTranslation } from '@/Hooks/useTranslation';

export default function ModalIvaAccountCreate({ show, onClose, ivaType, side }) {
    const __ = useTranslation();

    // En tu esquema real: code + name
    const { data, setData, post, processing, reset, errors, clearErrors } = useForm({
        code: '',
        name: '',
        profile: 'iva',
        iva_type_id: null,
        side: null
    });

    // Prefill del nombre sugerido cuando se abre
    useEffect(() => {
        if (show && ivaType && side) {
            const rate = safeRate(ivaType);
            const sideLabel = side === 'output' ? __('repercutido') : __('soportado');
            setData(prev => ({
              ...prev,
              code: '',
              name: `IVA ${rate}% ${sideLabel}`,
              profile: 'iva',
              iva_type_id: Number(ivaType.id),   // cast a número
              side,
            }));
            clearErrors();
        }
    }, [show, ivaType, side]);

    // Confirmar = enviar formulario
    const handleConfirm = () => {
        post(`/admin/accounting-accounts/store-auto-account`, {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                onClose?.();
            }
        });
    };

    return (
        <ReusableModal
          show={show}
          onClose={onClose}
          onConfirm={handleConfirm}
          title={`${__('cuenta_nueva')} — ${ivaType?.name ?? ''} ${safeRate(ivaType)}% (${side === 'output' ? __('repercutido') : __('soportado')})`}
          confirmText={processing ? __('guardando') : __('guardar')}
          cancelText={__('cancelar')}
          confirmDisabled={processing}
        >
            <div className="row g-3">
                <p className="text-warning">{ __('cuenta_iva_nueva_texto') }</p>

                <div className="col-12">
                    <label className="form-label">{ __('codigo_manual') }</label>
                    <input 
                        type="text"
                        name="code"
                        className={`form-control ${errors.code ? 'is-invalid' : ''}`}
                        value={data.code}
                        onChange={(e) => setData('code', e.target.value)}
                        autoComplete="off"
                        maxLength={30}
                        autoFocus
                    />
                    {/* <InfoPopover code="account-code" /> */}
                    <InputError message={errors.code} />
                </div>

                <div className="col-12">
                    <label className="form-label">{__('nombre')}*</label>
                    <input
                        type="text"
                        name="name"
                        className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        autoComplete="off"
                        maxLength={191}
                        required={true}
                    />
                    {/* <InfoPopover code="account-name" /> */}
                    <InputError message={errors.name} />
                </div>
            </div>
        </ReusableModal>
    );
}

function safeRate(ivaType) {
    const raw = ivaType?.iva ?? ivaType?.rate ?? 0;
    const num = Number.parseFloat(String(raw).replace(',', '.'));
    return Number.isFinite(num) ? num.toLocaleString(undefined, { maximumFractionDigits: 2 }) : 0;
}
