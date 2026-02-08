import React from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { useTranslation } from '@/Hooks/useTranslation';

/**
 * Celda reutilizable para la columna "Teléfonos" en tablas (CRM contactos, usuarios, contactos).
 * Muestra el primer/principal teléfono y, si hay más, un badge con el número de extras;
 * al hacer hover sobre el badge se muestra un popover con el resto de teléfonos en columna.
 *
 * @param {Array} phones - Array de { e164, type, label, is_primary, is_whatsapp }
 */
export default function PhonesCell({ phones = [] }) {
    const __ = useTranslation();
    const list = Array.isArray(phones) ? phones : [];

    if (!list.length) {
        return '—';
    }

    const primary = list.find(p => p && p.is_primary) || list[0];
    const others = list.filter(p => p !== primary);
    const moreCount = others.length;

    const popoverTitle = moreCount === 1
        ? __('telefono_mas')
        : `${moreCount} ${__('telefonos_mas')}`;
    const badgeLabel = moreCount === 1 ? __('badge_1_mas') : `${moreCount} ${__('badge_mas')}`;

    return (
        <>
            {primary?.e164 || ''}
            {primary?.is_whatsapp && (
                <i className="lab la-whatsapp ms-2" aria-hidden="true" />
            )}
            {moreCount > 0 && (
                <OverlayTrigger
                    trigger={['hover', 'focus']}
                    placement="auto"
                    overlay={
                        <Popover id="phones-popover" className="phones-cell-popover">
                            <Popover.Header as="h6">
                                {popoverTitle}
                            </Popover.Header>
                            <Popover.Body className="d-flex flex-column gap-1">
                                {others.map((p, i) => (
                                    <span key={i} className="text-nowrap">
                                        {p?.e164 || ''}
                                        {p?.is_whatsapp && (
                                            <i className="lab la-whatsapp ms-1" aria-hidden="true" />
                                        )}
                                    </span>
                                ))}
                            </Popover.Body>
                        </Popover>
                    }
                >
                    <span
                        className="badge bg-secondary ms-2"
                        style={{ cursor: 'pointer' }}
                        role="button"
                        tabIndex={0}
                        aria-label={popoverTitle}
                    >
                        {badgeLabel}
                    </span>
                </OverlayTrigger>
            )}
        </>
    );
}
