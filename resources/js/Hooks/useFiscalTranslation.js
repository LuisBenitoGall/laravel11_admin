import { usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

function useFiscalTranslation() {
    const { props } = usePage();
    const locale = props.locale || 'en';
    const [translations, setTranslations] = useState({});

    useEffect(() => {
        import(`../../lang/${locale}_fiscal.json`).then(module => {
            setTranslations(module.default);
        });
    }, [locale]);

    return (key) => {
        return translations[key] || key;
    };
}

export { useFiscalTranslation };