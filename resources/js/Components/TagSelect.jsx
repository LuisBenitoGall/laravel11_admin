import React from 'react';
import CreatableSelect from 'react-select/creatable';

export default function TagSelect({ value = [], onChange, placeholder = '' }) {
    // react-select espera un array [{ label, value }, …]
    const currentTags = Array.isArray(value) ? value : [];  

    const options = currentTags.map(v => ({ label: v, value: v }));

    return (
        <CreatableSelect
        isMulti
        placeholder={placeholder}
        options={options}
        value={options}
        onChange={(selected) => {
            // selected: array de objetos {label, value}
            const tags = selected ? selected.map(o => o.value) : [];
            onChange(tags);
        }}
        className="react-select-container"
        classNamePrefix="react-select"
        />
    );
}
