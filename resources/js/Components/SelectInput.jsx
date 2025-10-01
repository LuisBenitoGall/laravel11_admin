import { forwardRef, useRef, useEffect } from 'react';

export default forwardRef(function SelectInput({
    className = '',
    isFocused = false,
    multiple = false,
    children,
    ...props
}, ref) {
    const inputRef = ref || useRef();

    useEffect(() => {
        if (isFocused && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isFocused]);

    return (
        <select
            {...props}
            ref={inputRef}
            className={`form-control ${className}`}
            multiple={multiple}
        >
            {children}
        </select>
    );
});
