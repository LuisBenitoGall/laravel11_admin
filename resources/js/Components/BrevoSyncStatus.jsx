import { OverlayTrigger, Tooltip } from 'react-bootstrap';

import { getBrevoStatusConfig } from '@/Hooks/useMarketingListBrevoExport';

export default function BrevoSyncStatus({ list, __, isSubmitting = false, className = 'ms-1' }) {
    const config = getBrevoStatusConfig(list, __, { isSubmitting });

    return (
        <OverlayTrigger
            placement="top"
            overlay={<Tooltip className="ttp-top">{config.tooltip}</Tooltip>}
        >
            <span
                className={`${className} ${config.color}`}
                style={{ fontSize: '1.1rem', verticalAlign: 'middle' }}
            >
                {config.type === 'spinner' ? (
                    <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                    />
                ) : (
                    <i className={`la ${config.icon}`}></i>
                )}
            </span>
        </OverlayTrigger>
    );
}
