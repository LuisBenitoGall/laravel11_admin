import { useMemo } from 'react';
import SelectInput from '@/Components/SelectInput';

const currentYear = () => new Date().getFullYear();

/**
 * Selector de año con rango configurable (descendente por defecto).
 * Útil para last_year_service, filtros por año, etc.
 *
 * @param {number} [minYear=2000] - Año mínimo (inclusive)
 * @param {number} [maxYear] - Año máximo (inclusive); por defecto año actual
 * @param {string|number|null} value - Valor seleccionado
 * @param {function} onChange - (e) => void
 * @param {string} [placeholder] - Texto opción vacía
 * @param {string} [className] - Clases adicionales para el select
 * @param {boolean} [descending=true] - true = años de mayor a menor
 * @param {object} [rest] - Resto de props para el <select>
 */
export default function YearSelect({
    minYear = 2000,
    maxYear = currentYear(),
    value,
    onChange,
    placeholder = '',
    className = '',
    descending = true,
    ...rest
}) {
    const options = useMemo(() => {
        const min = Math.min(minYear, maxYear);
        const max = Math.max(minYear, maxYear);
        const years = [];
        for (let y = max; y >= min; y--) {
            years.push(y);
        }
        if (!descending) {
            years.reverse();
        }
        return years;
    }, [minYear, maxYear, descending]);

    // Asegurar valor escalar para <select> (React exige string/number cuando multiple=false)
    const rawValue = (value !== null && value !== undefined && value !== '' && typeof value !== 'object')
        ? String(value)
        : '';

    return (
        <SelectInput
            className={className}
            value={rawValue}
            onChange={onChange}
            {...rest}
        >
            {placeholder ? (
                <option value="">{placeholder}</option>
            ) : null}
            {options.map((year) => (
                <option key={year} value={year}>
                    {year}
                </option>
            ))}
        </SelectInput>
    );
}
