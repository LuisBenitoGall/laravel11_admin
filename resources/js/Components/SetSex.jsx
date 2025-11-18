// resources/js/Components/SetSex.jsx
import React, { useMemo, useCallback } from 'react';
import RadioButton from '@/Components/RadioButton';
import InputError from '@/Components/InputError';
import { useTranslation } from '@/Hooks/useTranslation';

export default function SetSex({
  value,          // 'm' | 'h' | ''
  onChange,       // recibe event o string, lo normalizamos
  error = null,
  name = 'sex',
  required = false,
  disabled = false,
}) {
  const __ = useTranslation();

  const options = useMemo(() => ([
    { value: 'm', label: __('mujer') },
    { value: 'h', label: __('hombre') },
  ]), [__]);

  const handleChange = useCallback((eOrVal) => {
    const v = typeof eOrVal === 'string' ? eOrVal : eOrVal?.target?.value;
    if (onChange) onChange({ target: { name, value: v } });
  }, [onChange, name]);

  return (
    <div className="col-lg-4">
      <label className="form-label d-block mb-2">{__('sexo')}</label>

      <RadioButton
        name={name}
        value={String(value ?? '')}     // controlado
        checkedValue={String(value ?? '')} // por si tu componente usa esta prop
        options={options}
        onChange={handleChange}
        required={required}
        disabled={disabled}
      />

      {error && <InputError className="mt-1" message={error} />}
    </div>
  );
}
