import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { registerLocale } from 'react-datepicker';
import { es } from 'date-fns/locale';
import { useTranslation } from '@/Hooks/useTranslation';

registerLocale('es', es);

export default function DatePickerInput({
    selected,
    onChange,
    className = '',
    placeholder = '',
    name,
    dateFormat = 'yyyy-MM-dd',
    minDate = null,
    maxDate = null,
    required = false,
    disabled = false,
}) {
    const __ = useTranslation();

    return (
        <DatePicker
            locale="es"
            selected={selected}
            onChange={(date) => onChange(name, date)}
            dateFormat={dateFormat}
            className={`form-control ${className}`}
            placeholderText={placeholder || __('selecciona_fecha')}
            name={name}
            required={required}
            minDate={minDate}
            maxDate={maxDate}
            disabled={disabled}
            autoComplete="off"
        />
    );
}