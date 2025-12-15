export default function Checkbox({ 
    className = '', 
    checked = false, 
    value = '1', 
    onChange, 
    size = null,       // 'sm' | 'lg' | null
    ...props 
}){
    let sizeClass = '';

    if (size === 'sm') {
        sizeClass = 'checkbox-sm';
    } else if (size === 'lg') {
        sizeClass = 'checkbox-lg';
    }
    
    return (
        <input
            {...props}
            type="checkbox"
            className={`form-check-input ${sizeClass} ${className}`.trim()}
            checked={checked}
            value={value}
            onChange={onChange}
        />
    );
}
