// resources/js/Components/modals/ModalUserCreateNote.jsx
import { useRef, useState } from 'react';

import ReusableModal from '@/Components/modals/ModalTemplate';
import UserNoteForm from '@/Components/UserNoteForm';
import { useTranslation } from '@/Hooks/useTranslation';

export default function ModalUserNoteCreate({
    show,
    onClose,
    contact,
    user_company,
    onSaved,   // callback para refrescar listado de notas, etc.
    onCreated,
}) {
    const __ = useTranslation();
    const formRef = useRef(null);
    const [saving, setSaving] = useState(false);

    if (!contact) {
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

    const contactLabel =
        contact.full_name ??
        `${contact.name ?? ''} ${contact.surname ?? ''}`.trim();

    return (
        <ReusableModal
            show={show}
            onClose={onClose}
            onConfirm={handleConfirm}
            title={`${__('nota_nueva')}${contactLabel ? ` · ${contactLabel}` : ''}`}
            confirmText={saving ? __('procesando') + '…' : __('guardar')}
            cancelText={__('cancelar')}
            dialogClassName="modal-dialog-centered modal-xl"
            confirmDisabled={saving}
            confirmLoading={saving}
        >
            <UserNoteForm
                contact={contact}
                user_company={user_company}
                onSuccess={handleSuccess}
                formRef={formRef}
                showSubmitButton={false}
                submitLabel={__('guardar')}
                onProcessingChange={setSaving}  // ⬅ aquí se conecta el estado de "guardando"
            />
        </ReusableModal>
    );
}
