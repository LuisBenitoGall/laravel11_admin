export default function Checkbox({ className = '', checked = false, value = '1', onChange, ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={`form-check-input ${className}`}
            checked={checked}
            value={value}
            onChange={onChange}
        />
    );
}
