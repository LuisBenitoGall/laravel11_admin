import React, { useState } from 'react';

//Hooks:
import { useTranslation } from '@/Hooks/useTranslation';
//import __ from '@/Hooks/useTranslation.js';

export default function RecordsPerPage({ perPage, setPerPage }) {
    const __ = useTranslation();
    const options = [10, 25, 50, 100];
    const [isOpen, setIsOpen] = useState(false);

    const toggleDropdown = () => setIsOpen(prev => !prev);
    const handleSelect = (value) => {
        setPerPage(Number(value));
        setIsOpen(false);
    };

    return (
        <div className="column-filter position-relative d-inline-flex align-items-center ms-auto" id="componentRecordsPerPage">
            <label className="me-1" style={{ paddingTop: '3px'}}>{__('mostrar')}</label>
            <div className="position-relative" style={{ display: 'flex', alignItems: 'center' }}>
                <button className="btn btn-light dropdown-toggle" onClick={toggleDropdown}>
                    {perPage}
                </button>
                {isOpen && (
                    <ul className="dropdown-menu show position-absolute" style={{top: '30px'}}>
                        {options.map((value) => (
                            <li key={value} className="dropdown-item" onClick={() => handleSelect(value)}>
                                {value}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <label className="ms-1" style={{ paddingTop: '3px'}}>{__('registros')}</label>
        </div>
    );
}
