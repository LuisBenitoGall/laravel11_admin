import React from 'react';

export default function RadioButton({
	name,
	value,
	onChange,
	options = [],
	className = '',
	required = false
}) {
	return (
		<div className="d-flex flex-wrap gap-3">
			{options.map((opt, index) => (
                <div className="align-items-center d-flex form-check gap-2 me-2" key={index}>
                    <input 
                        className={`form-check-input mt-1 md ${className}`} 
                        type="radio" 
                        name={name} 
                        id={`${name}-${opt.value}`} 
                        value={String(opt.value)}
                        checked={String(value) === String(opt.value)}
                        onChange={(e) => onChange(e)}
                        required={required}
                    />
                    <label className="form-check-label" htmlFor={`${name}-${opt.value}`}>
                        {opt.label}
                    </label>
                </div>
			))}
		</div>
	);
}
