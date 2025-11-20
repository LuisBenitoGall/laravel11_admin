import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { registerLocale } from 'react-datepicker';
import { es } from 'date-fns/locale';

// Hooks:
import { useTranslation } from '@/Hooks/useTranslation';

// Utils:
import { parseLocalYmd } from '@/Utils/dateHelpers';

registerLocale('es', es);

export default function FormDatePickerInput({
    name,
    selected,
    onChange,
    className = '',
    label = '',
    placeholder = '',
    dateFormat = 'yyyy-MM-dd',
    minDate = null,
    // OJO: sin valor por defecto aquí; lo distinguimos de null dentro
    maxDate,
    required = false,
    disabled = false,
    addon = true,
    addonElement = null,
    // Autocomplete value for the input. Use a semantic token so password managers
    // don't mistake this for a credential field. Default to 'bday' (birthday).
    autoComplete = 'bday',
    // Allow quick selection of month/year (useful for birth_date)
    showMonthDropdown = true,
    showYearDropdown = true,
    scrollableYearDropdown = true,
    yearDropdownItemNumber = 100,
}) {
    const __ = useTranslation();
    const Icon = addonElement ?? (
        <i className="la la-calendar me-1" aria-hidden="true" />
    );

    /**
     * Lógica de maxDate:
     * - Si NO se pasa maxDate (undefined) -> tope hoy (caso típico: cumpleaños).
     * - Si se pasa maxDate (incluido null) -> respetamos su valor tal cual.
     *   - maxDate={null} => sin límite superior.
     */
    const computedMaxDate =
        typeof maxDate === 'undefined' ? new Date() : maxDate;

    const selectedDate = parseLocalYmd(selected);

    const picker = (
        <DatePicker
            id={name}
            name={name}
            locale="es"
            selected={selectedDate}
            onChange={(date) => onChange(name, date)}
            dateFormat={dateFormat}
            className={`form-control text-end ${className}`}
            placeholderText={placeholder || __('fecha_selec')}
            required={required}
            disabled={disabled}
            minDate={minDate}
            maxDate={computedMaxDate}
            autoComplete={autoComplete}
            data-lpignore="true"
            showMonthDropdown={showMonthDropdown}
            showYearDropdown={showYearDropdown}
            scrollableYearDropdown={scrollableYearDropdown}
            yearDropdownItemNumber={yearDropdownItemNumber}
            dropdownMode="select"
            withPortal
        />
    );

    return (
        <div>
            {/* Label al estilo de los demás formularios */}
            {label && (
                <label htmlFor={name} className="form-label">
                    {__(label)}
                </label>
            )}

            {addon ? (
                <div className="input-group">
                    <span className="input-group-text">
                        {Icon}
                    </span>
                    {picker}
                </div>
            ) : (
                picker
            )}
        </div>
    );
}
