import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { useTranslation } from '@/Hooks/useTranslation';

export default function ShowRegisterButton({ onClick }) {
    const __ = useTranslation();

    return (
        <OverlayTrigger
            placement="top"
            overlay={
                <Tooltip className="ttp-top">
                    {__('ver_detalle')}
                </Tooltip>
            }
        >
            <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={onClick}
            >
                <i className="la la-eye" />
            </button>
        </OverlayTrigger>
    );
}
