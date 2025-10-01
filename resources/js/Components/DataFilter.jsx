import React, { useState } from 'react';

//Hooks:
import { useTranslation } from '@/Hooks/useTranslation';

export default function DataFilter(){
    const __ = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    
    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="column-filter position-relative d-inline-block float-start ms-2">
            <button 
                className="btn btn-light dropdown-toggle" 
                onClick={toggleDropdown}>
                {__('filtros')} 
            </button>    
        </div>
    );
}