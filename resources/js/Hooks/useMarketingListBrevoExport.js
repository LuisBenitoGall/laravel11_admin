import { useCallback, useEffect, useRef, useState } from 'react';
import { router } from '@inertiajs/react';

export function getBrevoStatusConfig(list, __, { isSubmitting = false } = {}) {
    if (isSubmitting || list?.brevo_sync_status === 'pending') {
        return {
            type: 'spinner',
            color: 'text-info',
            tooltip: __('lista_export_brevo_en_proceso'),
        };
    }

    if (!list?.brevo_synced_at && !list?.brevo_sync_status) {
        return { type: 'icon', icon: 'la-cloud', color: 'text-muted', tooltip: __('brevo_nunca_sincronizado') };
    }

    if (list.brevo_sync_status === 'ok') {
        return {
            type: 'icon',
            icon: 'la-cloud-upload-alt',
            color: 'text-success',
            tooltip: `${__('brevo_sincronizado_el')} ${list.brevo_synced_at}`,
        };
    }

    if (list.brevo_sync_status === 'error') {
        return { type: 'icon', icon: 'la-cloud', color: 'text-danger', tooltip: __('brevo_sync_error') };
    }

    if (list.brevo_sync_status === 'partial') {
        return { type: 'icon', icon: 'la-cloud-upload-alt', color: 'text-warning', tooltip: __('brevo_sync_partial') };
    }

    return { type: 'icon', icon: 'la-cloud', color: 'text-muted', tooltip: __('brevo_nunca_sincronizado') };
}

/**
 * Exportación a Brevo: confirmación, estado de envío y refresco mientras el job está pending.
 */
export function useMarketingListBrevoExport({
    showConfirm,
    __,
    onExportSuccess,
    reloadWhilePending,
    isPending = false,
}) {
    const [exportingListId, setExportingListId] = useState(null);
    const pollRef = useRef(null);

    const stopPolling = useCallback(() => {
        if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
        }
    }, []);

    const startPolling = useCallback(() => {
        if (!reloadWhilePending || pollRef.current) {
            return;
        }

        pollRef.current = setInterval(() => {
            reloadWhilePending();
        }, 10000);
    }, [reloadWhilePending]);

    useEffect(() => () => stopPolling(), [stopPolling]);

    useEffect(() => {
        if (isPending) {
            startPolling();
            return;
        }

        stopPolling();
    }, [isPending, startPolling, stopPolling]);

    const handleExportToBrevo = useCallback((list) => {
        if (!list?.id || list.brevo_sync_status === 'pending' || exportingListId === list.id) {
            return;
        }

        showConfirm({
            title: __('exportacion_listado'),
            text: __('exportacion_listado_confirm'),
            icon: 'warning',
            onConfirm: () => {
                setExportingListId(list.id);

                router.post(
                    route('marketing-lists.export-brevo', [list.id]),
                    {},
                    {
                        preserveScroll: true,
                        onSuccess: () => {
                            if (typeof onExportSuccess === 'function') {
                                onExportSuccess(list);
                            }
                        },
                        onFinish: () => {
                            setExportingListId((current) => (current === list.id ? null : current));
                        },
                    }
                );
            },
        });
    }, [__, exportingListId, onExportSuccess, showConfirm]);

    const isExporting = useCallback(
        (list) => exportingListId === list?.id || list?.brevo_sync_status === 'pending',
        [exportingListId]
    );

    return {
        exportingListId,
        handleExportToBrevo,
        isExporting,
        stopPolling,
    };
}
