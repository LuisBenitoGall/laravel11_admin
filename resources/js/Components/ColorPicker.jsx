import { useState, useRef, useEffect } from 'react';
import { SketchPicker } from 'react-color';
import TextInput from '@/Components/TextInput';

export default function ColorPicker({ value = '#000000', onChange, className = '', name = 'color' }) {
    const [displayColorPicker, setDisplayColorPicker] = useState(false);
    const [color, setColor] = useState(value || '#000000');
    const pickerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                setDisplayColorPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const togglePicker = () => setDisplayColorPicker(!displayColorPicker);

    const handleColorChange = (newColor) => {
        setColor(newColor.hex);
        onChange?.({ target: { name, value: newColor.hex } });
    };

    const handleInputChange = (e) => {
        const newValue = e.target.value;
        setColor(newValue);
        onChange?.({ target: { name, value: newValue } });
    };

    return (
        <div className={`position-relative d-flex align-items-center ${className}`} style={{ maxWidth: '100%' }}>
            <TextInput
                type="text"
                name={name}
                value={color}
                onChange={handleInputChange}
                className="form-control me-2"
                style={{ paddingRight: '2.5rem' }}
            />

            <div
                onClick={togglePicker}
                className="color-picker"
                style={{
                    backgroundColor: color
                }}
            />

            {displayColorPicker && (
                <div ref={pickerRef} style={{ position: 'absolute', top: '100%', right: 0, zIndex: 10 }}>
                    <SketchPicker color={color} onChange={handleColorChange} />
                </div>
            )}
        </div>
    );
}
