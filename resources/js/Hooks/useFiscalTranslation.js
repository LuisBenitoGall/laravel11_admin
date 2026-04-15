import { usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

/** Rutas relativas a este archivo → raíz del proyecto /lang/*_fiscal.json */
const fiscalModules = import.meta.glob('../../../lang/*_fiscal.json');

function useFiscalTranslation() {
    const { props } = usePage();
    const locale = props.locale || 'en';
    const [translations, setTranslations] = useState({});

    useEffect(() => {
        const key = `../../../lang/${locale}_fiscal.json`;
        const loader =
            fiscalModules[key] ?? fiscalModules['../../../lang/es_fiscal.json'];
        if (loader) {
            loader().then((module) => setTranslations(module.default));
        } else {
            setTranslations({});
        }
    }, [locale]);

    return (key) => {
        return translations[key] || key;
    };
}

export { useFiscalTranslation };
