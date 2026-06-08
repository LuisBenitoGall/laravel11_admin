import React from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { useTranslation } from '@/Hooks/useTranslation';

/**
 * Celda reutilizable para la columna "Otros emails" en tablas.
 * Muestra el primer email adicional y, si hay más, un badge con el número de extras;
 * al hacer hover sobre el badge se muestra un popover con el resto de emails.
 *
 * @param {Array} emails - Array de strings (direcciones de email)
 */
export default function EmailsCell({ emails = [] }) {
    const __ = useTranslation();
    const list = Array.isArray(emails) ? emails.filter(Boolean) : [];

    if (!list.length) {
        return '—';
    }

    const primary = list[0];
    const others = list.slice(1);
    const moreCount = others.length;

    const popoverTitle = moreCount === 1
        ? __('email_mas')
        : `${moreCount} ${__('emails_mas')}`;
    const badgeLabel = moreCount === 1 ? __('badge_1_mas') : `${moreCount} ${__('badge_mas')}`;

    return (
        <>
            {primary}
            {moreCount > 0 && (
                <OverlayTrigger
                    trigger={['hover', 'focus']}
                    placement="auto"
                    overlay={
                        <Popover id="emails-popover" className="emails-cell-popover">
                            <Popover.Header as="h6">
                                {popoverTitle}
                            </Popover.Header>
                            <Popover.Body className="d-flex flex-column gap-1">
                                {others.map((email, i) => (
                                    <span key={i} className="text-nowrap">
                                        {email}
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
