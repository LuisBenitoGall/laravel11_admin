import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function FlashMessage({ type = 'success', message }) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setVisible(false);
        }, 4000);

        return () => clearTimeout(timeout);
    }, []);

    if (!visible || !message) return null;

    return (
        <div className={`alert- alert alert-${type} alert-dismissible fade show`} role="alert">          
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
