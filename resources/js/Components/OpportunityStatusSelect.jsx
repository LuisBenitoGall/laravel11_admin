import { usePage } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import { useTranslation } from '@/Hooks/useTranslation';

export default function OpportunityStatusSelect({
    id = 'status',
    name = 'status',
    value,
    onChange,
    error,
    label,
    className = 'form-select',
}) {
    const __ = useTranslation();
    const pageProps = usePage()?.props || {};

    // Si el backend quiere sobreescribir opciones, que las envíe aquí
    const serverOptions = pageProps.crmOpportunityStatusOptions || null;

    // Fallback por defecto (puedes ajustar textos / keys de traducción)
    const fallbackOptions = [
        { value: 1, label: __('oportunidad_nueva'),        color: '#0d6efd' },  // azul
        { value: 2, label: __('oportunidad_en_proceso'),   color: '#0dcaf0' },  // celeste
        { value: 3, label: __('oportunidad_negociacion'),  color: '#ffc107' },  // amarillo
        { value: 4, label: __('oportunidad_ganada'),       color: '#198754' },  // verde
        { value: 5, label: __('oportunidad_perdida'),      color: '#dc3545' },  // rojo
    ];

    const options = serverOptions && serverOptions.length
        ? serverOptions
        : fallbackOptions;

    return (
        <div className="mb-3">
            <label htmlFor={id} className="form-label">
                {label ?? __('estado')}
            </label>

            <select
                id={id}
                name={name}
                className={className}
                value={value}
                onChange={onChange}
            >
                {options.map((opt) => (
                    <option
                        key={opt.value}
                        value={opt.value}
                        style={{ color: opt.color }}
                    >
                        {/* banderita + texto */}
                        &#9873; {opt.label}
                    </option>
                ))}
            </select>

            {error && <InputError message={error} className="mt-1" />}
        </div>
    );
}
