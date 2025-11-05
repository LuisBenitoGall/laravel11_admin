import { forwardRef, useEffect, useRef } from 'react';
import { useTranslation } from '@/Hooks/useTranslation';

export default forwardRef(function TextInput({ type = 'text', className = '', onChange, isFocused = false, addon = false, required = false, ...props }, ref) {
    const __ = useTranslation();
    const input = ref ? ref : useRef();

    useEffect(() => {
        if (isFocused) {
            input.current.focus();
        }
    }, []);

    //Validador de decimales:
    const handleInputChange = (e) => {
        let value = e.target.value;

        if (className.includes('setDecimal')) {
            // Reemplazar coma por punto
            value = value.replace(',', '.');

            // Eliminar caracteres no numéricos excepto el punto
            value = value.replace(/[^0-9.]/g, '');

            // Solo permitir un punto decimal
            const parts = value.split('.');
            if (parts.length > 2) {
                value = parts[0] + '.' + parts.slice(1).join('');
            }
        }   

        const syntheticEvent = {
            ...e,
            target: {
                ...e.target,
                value: value
            }
        };

        onChange && onChange(syntheticEvent);
    };

    const inputElement = (
        <input
            {...props}
            type={type}
            className={`form-control ${className}`}
            onChange={handleInputChange}
            ref={input}
            autoComplete="off"
            maxLength={props.maxLength || 255}
            required={required}
            aria-required={required}
        />
    );

    return addon ? (
        <div className="input-group">
            {inputElement}
            <span className="input-group-text">{addon}</span>
        </div>
    ) : inputElement;
});
