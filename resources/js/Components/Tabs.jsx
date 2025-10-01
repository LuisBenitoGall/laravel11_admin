import React, { useEffect, useState, useMemo } from 'react';
import { usePage, useForm } from '@inertiajs/react';

export default function Tabs({
    tabs = [],
    items = [],              // Array de pestañas: [{ key, label }, ...]
    defaultActive = null,    // key de pestaña inicial (por defecto, el primero)
    onChange = () => {},     // función callback al cambiar de tab
    children,                // render-prop: función que recibe activeKey y devuelve contenido
    className = ''           // clases adicionales en nav
}) {
    // Detectar si es el modo declarativo (label + content) o render-prop (items + children)
	const isDeclarative = Array.isArray(tabs) && tabs.length > 0 && tabs[0].content !== undefined;
	const source = isDeclarative ? tabs : items;
    const routeName = usePage()?.component || 'default';
	const storageKey = `tabs_active_index_${routeName}`;
    // Determinar índice inicial desde defaultActive
    const initialIndex = useMemo(() => {
        if (!defaultActive) return 0;
        const index = source.findIndex(tab => tab.key === defaultActive);
        return index >= 0 ? index : 0;
    }, [defaultActive, source]);
	const [activeIndex, setActiveIndex] = useState(initialIndex);

	// useEffect(() => {
	// 	// Guardar en sessionStorage cada vez que cambie
	// 	sessionStorage.setItem(storageKey, activeIndex);
	// }, [activeIndex]);

    useEffect(() => {
        sessionStorage.setItem(storageKey, activeIndex);
        const currentKey = source[activeIndex]?.key;
        if (currentKey) {
            onChange(currentKey);
        }
    }, [activeIndex]);

    //const activeKey = defaultActive || (source.length > 0 ? source[0].key : '');

    if (source.length === 0) return null;

    return (
        <>
        <ul className={`nav nav-tabs ${className}`.trim()}>
            {source.map((tab, index) => (
                <li className="nav-item" key={isDeclarative ? index : tab.key}>
                    <button
                        className={`nav-link ${activeIndex === index ? 'active' : ''}`}
						onClick={() => setActiveIndex(index)}
                        type="button"
                    >
                        {tab.label}
                    </button>
                </li>
            ))}
        </ul>

        <div className="tab-content px-2 py-4">
            <div className="tab-pane fade show active">
                {isDeclarative
                    ? source[activeIndex].content
                    : typeof children === 'function'
                        ? children(source[activeIndex].key)
                        : null}
            </div>
        </div>
        </>
    );
}
