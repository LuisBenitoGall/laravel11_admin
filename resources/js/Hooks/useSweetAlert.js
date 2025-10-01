import Swal from 'sweetalert2';

//Hooks:
import { useTranslation } from '@/Hooks/useTranslation';

export function useSweetAlert() {
    const __ = useTranslation();
    const txt_aceptar = __('aceptar');
    const txt_cancelar = __('cancelar');

    const showAlert = (title, text, icon = 'info', buttonColors = {}) => {
        Swal.fire({
            title: title,
            text: text,
            icon: icon,
            confirmButtonColor: buttonColors.confirm || '#56BCB6',
            cancelButtonColor: buttonColors.cancel || '#fa896b',
            confirmButtonText: txt_aceptar
        });
    };

    const showConfirm = ({title = '', text = '', icon = 'warning', buttonColors = {}, onConfirm = () => {}, callback}) => {
        Swal.fire({
            title,
            text,
            icon,
            showCancelButton: true,
            confirmButtonColor: buttonColors.confirm || '#56BCB6',
            cancelButtonColor: buttonColors.cancel || '#fa896b',
            confirmButtonText: txt_aceptar,
            cancelButtonText: txt_cancelar
        }).then((result) => {
            if (result.isConfirmed && typeof onConfirm === 'function') {
                onConfirm();
            }
        });
    };

    return { showAlert, showConfirm };
}
