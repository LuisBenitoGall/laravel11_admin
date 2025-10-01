import React from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import useInfo from '@/Hooks/useInfo';

export default function InfoPopover({ code, placement = 'right', style = false }) {
    const { title, excerpt } = useInfo(code);

    if (!excerpt) return null;

    const popover = (
        <Popover id={`popover-${code}`} className="shadow-sm">
            {title && <Popover.Header as="h3">{title}</Popover.Header>}
            <Popover.Body dangerouslySetInnerHTML={{ __html: excerpt }} />
        </Popover>
    );

    return (
        <OverlayTrigger trigger={['hover', 'focus']} placement={placement} overlay={popover}>
            <span 
                className="pop-info text-warning"
                style={style !== false ? style : undefined}
            >
                <i className="la la-info-circle" />
            </span>
        </OverlayTrigger>
    );
}
