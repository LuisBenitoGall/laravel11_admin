import React, { useState, useEffect, useMemo } from 'react';
import Select from 'react-select';

const SelectSearch = ({
  options = [],
  onChange,
  placeholder = 'Search...',
  isMulti = false,
  name,
  required,
  value,
  // nuevas props para hacerlo útil de verdad
  disabled,
  isDisabled,
  isClearable = true,
  className,
  noOptionsMessage,
  ...rest
}) => {
  // Determina si está deshabilitado (acepta ambos nombres por compatibilidad)
  const finalDisabled = typeof isDisabled !== 'undefined' ? !!isDisabled : !!disabled;

  // Normaliza el value entrante: react-select quiere null u opción completa
  const findOption = (val) =>
    options.find((o) => o?.value === val) || null;

  const normalizedInitial = useMemo(() => {
    if (isMulti) {
      if (Array.isArray(value)) {
        return value.map((v) => (typeof v === 'object' ? v : findOption(v))).filter(Boolean);
      }
      return [];
    }
    return typeof value === 'object' ? value : findOption(value);
  }, [value, options, isMulti]);

  const [inputValue, setInputValue] = useState('');
  const [selectedValue, setSelectedValue] = useState(normalizedInitial);

  useEffect(() => {
    setSelectedValue(normalizedInitial);
  }, [normalizedInitial]);

  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? '#80bdff' : '#ced4da',
      boxShadow: 'none',
      opacity: finalDisabled ? 0.65 : 1,
      cursor: finalDisabled ? 'not-allowed' : 'default',
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    menu: (provided) => ({ ...provided, zIndex: 9999 }),
  };

  const handleInputChange = (val) => setInputValue(val);

  const handleChange = (selectedOption) => {
    setSelectedValue(selectedOption);
    onChange && onChange(selectedOption);
  };

  return (
    <>
      <div className={className}>
        <Select
          options={options}
          onChange={handleChange}
          onInputChange={handleInputChange}
          inputValue={inputValue}
          placeholder={placeholder}
          isMulti={isMulti}
          isClearable={isClearable}
          isDisabled={finalDisabled}
          styles={customStyles}
          classNamePrefix="select-search"
          required={required}
          value={selectedValue}
          menuPortalTarget={typeof document !== 'undefined' ? document.body : null}
          noOptionsMessage={
            noOptionsMessage ||
            (() => 'No options')
          }
          {...rest}
        />
      </div>

      {name && !isMulti && (
        <input type="hidden" name={name} value={selectedValue ? selectedValue.value : ''} />
      )}
      {name && isMulti && (
        <input
          type="hidden"
          name={name}
          value={
            Array.isArray(selectedValue)
              ? selectedValue.map((o) => o.value).join(',')
              : ''
          }
        />
      )}
    </>
  );
};

export default SelectSearch;
