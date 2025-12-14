// resources/js/Components/modals/ModalUserCreateNote.jsx
import { useRef, useState } from 'react';

import ReusableModal from '@/Components/modals/ModalTemplate';
import CompanyNoteForm from '@/Components/CompanyNoteForm';
import { useTranslation } from '@/Hooks/useTranslation';

export default function ModalCompanyNoteCreate({
    show,
    onClose,
    company,
    crmAccount,
    onSaved,   // callback para refrescar listado de notas, etc.
    onCreated,
}) {
    const __ = useTranslation();
    const formRef = useRef(null);
    const [saving, setSaving] = useState(false);
    if (!company) {
        return null;
    }

    const handleConfirm = () => {
        // Validación HTML5 antes de mandar
        if (formRef.current && typeof formRef.current.reportValidity === 'function') {
            const valid = formRef.current.reportValidity();
            if (!valid) return;
        }

        // Disparar el submit del formulario interno
        if (formRef.current && typeof formRef.current.requestSubmit === 'function') {
            formRef.current.requestSubmit();
        } else if (formRef.current) {
            formRef.current.dispatchEvent(
                new Event('submit', { cancelable: true, bubbles: true })
            );
        }
    };

    const handleSuccess = () => {
        if (typeof onSaved === 'function') {
            onSaved();
        }
        if (typeof onClose === 'function') {
            onClose();
        }
    };

    const companyLabel =
        company.full_name ??
        `${company.name ?? ''} ${company.tradename ?? ''}`.trim();

    return (
        <ReusableModal
            show={show}
            onClose={onClose}
            onConfirm={handleConfirm}
            title={`${__('nota_nueva')}${companyLabel ? ` · ${companyLabel}` : ''}`}
            confirmText={saving ? __('procesando') + '…' : __('guardar')}
            cancelText={__('cancelar')}
            dialogClassName="modal-dialog-centered modal-xl"
            confirmDisabled={saving}
            confirmLoading={saving}
        >
            <CompanyNoteForm
                company={company}
                crmAccount={crmAccount}
                onSuccess={handleSuccess}
                formRef={formRef}
                showSubmitButton={false}
                submitLabel={__('guardar')}
                onProcessingChange={setSaving}  // ⬅ aquí se conecta el estado de "guardando"
            />
        </ReusableModal>
    );
}
