import React, { useState } from 'react';
import { useTranslation } from '@/Hooks/useTranslation';

const ColumnFilter = ({ columns, visibleColumns, toggleColumn }) => {
    const __ = useTranslation();
    const txt_columnas_on_off = __('columnas_ver_ocultar');
    const [isOpen, setIsOpen] = useState(false);

    const toggleDropdown = () => setIsOpen(prev => !prev);

    return (
        <div className="column-filter position-relative d-inline-block float-start">
            <button className="btn btn-light dropdown-toggle" onClick={toggleDropdown}>
                {txt_columnas_on_off}
            </button>
            {isOpen && (
                <ul className="dropdown-menu show position-absolute">
                    {columns.map(({ key, label }) => (
                        <li key={key} className="dropdown-item d-flex justify-content-between align-items-center">
                            <label className="d-flex w-100 justify-content-between align-items-center">
                                <span>{label}</span>
                                <div className="form-check form-check-success">
                                    <input
                                        type="checkbox"
                                        checked={visibleColumns.includes(key)}
                                        onChange={() => toggleColumn(key)} 
                                        className="form-check-input ms-2"
                                    />
                                </div>
                            </label>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default ColumnFilter;
