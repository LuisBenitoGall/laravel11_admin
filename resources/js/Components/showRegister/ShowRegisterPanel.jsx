import React from 'react';
import PropTypes from 'prop-types';
import { Spinner } from 'react-bootstrap';

export default function ShowRegisterPanel({
    open,
    title = '',
    loading = false,
    onClose,
    children,
}) {
    return (
        <>
            {/* Fondo oscuro */}
            <div
                className={`show-register-backdrop ${open ? 'show' : ''}`}
            />

            {/* Panel lateral */}
            <div className={`show-register-panel ${open ? 'show' : ''}`}>
                <div className="show-register-header d-flex align-items-center justify-content-between">
                    <h5 className="mb-0">{title}</h5>
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={onClose}
                    >
                        <i className="la la-times" />
                    </button>
                </div>

                <div className="show-register-body">
                    {loading ? (
                        <div className="show-register-spinner">
                            <Spinner animation="border" role="status">
                                <span className="visually-hidden">Cargando...</span>
                            </Spinner>
                        </div>
                    ) : (
                        children
                    )}
                </div>
            </div>
        </>
    );
}

ShowRegisterPanel.propTypes = {
    open: PropTypes.bool.isRequired,
    title: PropTypes.string,
    loading: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
    children: PropTypes.node,
};
