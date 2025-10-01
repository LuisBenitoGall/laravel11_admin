import React from 'react';

const ReusableModal = ({ show, onClose, title, children, onConfirm, confirmText = 'Confirmar', cancelText = 'Cancelar' }) => {
    return (
        <>
            {show && (
                <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" role="dialog" aria-labelledby="modalTitle" aria-hidden="true">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="modalTitle">{title}</h5>
                                <button type="button" className="close ms-auto" onClick={onClose} aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                {children}
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={onClose}>{cancelText}</button>
                                <button type="button" className="btn btn-primary" onClick={onConfirm}>{confirmText}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ReusableModal;
