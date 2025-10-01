import { useEffect, useState } from 'react';

export default function BackToTop({ offset = 300 }) {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setVisible(window.scrollY > offset);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [offset]);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (!visible) return null;

    return (
        <button
            type="button"
            onClick={scrollToTop}
            className="btn btn-primary position-fixed"
            style={{
                bottom: '30px',
                right: '30px',
                zIndex: 1050,
                borderRadius: '50%',
                width: '45px',
                height: '45px',
                boxShadow: '0 0 10px rgba(0,0,0,0.2)',
            }}
            title="Volver arriba"
        >
            <i className="la la-arrow-up" />
        </button>
    );
}
