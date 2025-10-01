import React from 'react';
import { useTranslation } from '@/Hooks/useTranslation';

const modalCompaniesSession = ({ show, onClose, title, children, onConfirm, confirmText, cancelText = 'Cancelar' }) => {
    const __ = useTranslation();
    
    return (
        <>
            {show && (
                <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1" role="dialog" aria-labelledby="modalTitle" aria-hidden="true">
                    <div className="modal-dialog" role="document">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{title}</h5>
                                {/* <button type="button" className="close ms-auto" aria-label="Close" onClick={onClose}>
                                    <span aria-hidden="true">
                                        <i className="la la-close"></i>
                                    </span>
                                </button> */}
                            </div>
                            
                            {children}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default modalCompaniesSession;
