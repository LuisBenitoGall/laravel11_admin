import { forwardRef, useEffect, useState } from 'react';

//Hooks:
import { useTranslation } from '@/Hooks/useTranslation';

export default forwardRef(function FileInput({id, name, label = '', className = '', multiple = false, accept = '', error = '', required = false, showPreview = true, ...props }, ref) {
    const __ = useTranslation();
    const [previews, setPreviews] = useState([]);
    const [files, setFiles] = useState([]);

    const handleChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(selectedFiles);

        if (props.onChange) {
            props.onChange(e);
        }
    };

    useEffect(() => {
        if (!showPreview || files.length === 0) {
            setPreviews([]);
            return;
        }

        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        const objectUrls = imageFiles.map(file => URL.createObjectURL(file));
        setPreviews(objectUrls);

        return () => {
            objectUrls.forEach(url => URL.revokeObjectURL(url));
        };
    }, [files, showPreview]);

    const clearImages = () => {
        setFiles([]);
        setPreviews([]);
        const input = document.getElementById(id || name);
        if (input) input.value = '';
    };    
    
    return (
        <div className={`form-group position-relative ${className}`}>
            {label && (
                <label htmlFor={id || name} className="form-label">
                    {__(label)} {required && <span className="text-danger">*</span>}
                </label>
            )}

            <input
                type="file"
                id={id || name}
                name={name}
                className={`form-control ${error ? 'is-invalid' : ''}`}
                ref={ref}
                accept={accept}
                required={required}
                multiple={multiple}
                onChange={handleChange}
            />

            {error && <div className="invalid-feedback">{error}</div>}

            {/* Preview */}
            {previews.length > 0 && showPreview && (
                <div className="mt-2 d-flex flex-wrap gap-2">
                    {previews.map((src, index) => (
                        <img
                            key={index}
                            src={src}
                            alt={`preview-${index}`}
                            className="img-thumbnail"
                            style={{ maxWidth: '200px', maxHeight: '200px', objectFit: 'cover' }}
                        />
                    ))}
                    <div className="w-100">
                        <button type="button" className="ms-2 btn btn-sm btn-danger" onClick={clearImages}>
                            <i className="la la-trash"></i>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
});
