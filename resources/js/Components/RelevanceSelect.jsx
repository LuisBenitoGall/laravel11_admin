import { usePage } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import { useTranslation } from '@/Hooks/useTranslation';

export default function RelevanceSelect({
    id = 'relevance',
    name = 'relevance',
    value,
    onChange,
    error,
    label,
    className = 'form-select',
}) {
    const __ = useTranslation();
    const pageProps = usePage()?.props || {};

    const serverOptions = pageProps.relevanceOptions || null;

    const fallbackOptions = [
        { value: 1, label: __('baja'),       color: '#0d6efd' },
        { value: 2, label: __('media_baja'), color: '#0dcaf0' },
        { value: 3, label: __('media'),      color: '#ffc107' },
        { value: 4, label: __('media_alta'), color: '#fd7e14' },
        { value: 5, label: __('alta'),       color: '#dc3545' },
    ];

    const options = serverOptions && serverOptions.length
        ? serverOptions
        : fallbackOptions;

    return (
        <div className="mb-3">
            <label htmlFor={id} className="form-label">
                {label ?? __('relevancia')}
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
                        {/* circulito de color + texto */}
                        &#9873; {opt.label}
                    </option>
                ))}
            </select>

            {error && <InputError message={error} className="mt-1" />}
        </div>
    );
}
