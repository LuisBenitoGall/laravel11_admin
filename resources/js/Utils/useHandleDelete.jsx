import { router } from '@inertiajs/react';
import { useSweetAlert } from '@/Hooks/useSweetAlert';
import { useTranslation } from '@/Hooks/useTranslation';

export function useHandleDelete(labelName = '', destroyRoute = '', routeParams = []) {
    const { showConfirm } = useSweetAlert();
    const __ = useTranslation();

    /**
     * Lanza un SweetAlert de confirmación y realiza un router.delete.
     * @param {string} routeName - Nombre de la ruta (ej: 'towns.destroy')
     * @param {Array} routeParams - Array de parámetros de la ruta
     * @param {string} labelName - Prefijo del texto traducido (ej: 'poblacion')
     */
    const handleDelete = (id) => {
        showConfirm({
            title: __(`${labelName}_eliminar`),
            text: __(`${labelName}_eliminar_confirm`),
            icon: 'warning',
            onConfirm: () => {
                router.delete(route(destroyRoute, [...routeParams, id]));
            }
        });
    };

    return { handleDelete };
}
