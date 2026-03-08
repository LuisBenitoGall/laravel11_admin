import React from 'react';

const ReusableModal = ({
    show,
    onClose,
    title,
    children,
    onConfirm,
    confirmText = 'Confirmar',
    confirmIcon = null,
    confirmClassName = 'btn-primary',
    cancelText = 'Cancelar',
    dialogClassName = '',
    confirmDisabled = false,
    confirmLoading = false,
    footerLeft = null,
    /** Si se pasa, el botón confirm será type="submit" form={submitFormId} para enviar ese formulario */
    submitFormId = null,
}) => {
    return (
        <>
            {show && (
                <div
                    className="modal fade show"
                    style={{ display: 'block' }}
                    tabIndex="-1"
                    role="dialog"
                    aria-labelledby="modalTitle"
                    aria-hidden="true"
                >
                    <div className={`modal-dialog ${dialogClassName}`} role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="modalTitle">
                                    {title}
                                </h5>
                                <button
                                    type="button"
                                    className="close ms-auto"
                                    onClick={onClose}
                                    aria-label="Close"
                                    disabled={confirmLoading}
                                >
                                    <span aria-hidden="true">&times;</span>
                                </button>
                            </div>

                            <div className="modal-body">
                                {children}
                            </div>

                            <div className="modal-footer d-flex justify-content-between">
                                <div className="d-flex align-items-center">
                                    {footerLeft}
                                </div>

                                <div className="d-flex gap-2">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={onClose}
                                        disabled={confirmLoading}
                                    >
                                        {cancelText}
                                    </button>

                                    <button
                                        type={submitFormId ? 'submit' : 'button'}
                                        form={submitFormId || undefined}
                                        className={`btn ${confirmClassName} d-inline-flex align-items-center`}
                                        onClick={submitFormId ? undefined : onConfirm}
                                        disabled={confirmDisabled || confirmLoading}
                                    >
                                        {confirmLoading && (
                                            <span
                                                className="spinner-border spinner-border-sm me-2"
                                                role="status"
                                                aria-hidden="true"
                                            />
                                        )}
                                        {!confirmLoading && confirmIcon && (
                                            <i className={`la ${confirmIcon} me-1`} aria-hidden="true" />
                                        )}
                                        {confirmText}
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ReusableModal;
