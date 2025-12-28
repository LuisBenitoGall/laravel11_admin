import React from 'react';

export default function SpinnerInline({ text = null }) {
    return (
        <span className="d-inline-flex align-items-center gap-2">
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
            {text ? <span>{text}</span> : null}
        </span>
    );
}
