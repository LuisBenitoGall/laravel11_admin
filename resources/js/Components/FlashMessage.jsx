import { useEffect, useState } from 'react';

export default function FlashMessage({ type = 'success', message }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Si no hay mensaje, ocultamos y listo
        if (!message) {
            setVisible(false);
            return;
        }

        // Nuevo mensaje → mostramos y arrancamos contador
        setVisible(true);

        const timeout = setTimeout(() => {
            setVisible(false);
        }, 4000);

        return () => clearTimeout(timeout);
    }, [message]);

    if (!visible || !message) return null;

    return (
        <div
            className={`mx-0 alert- alert alert-${type} alert-dismissible fade show`}
            role="alert"
        >
            {message}
            <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={() => setVisible(false)}
            ></button>
        </div>
    );
}
