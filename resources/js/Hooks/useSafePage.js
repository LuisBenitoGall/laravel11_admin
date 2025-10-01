import { usePage } from '@inertiajs/react';

export function useSafePage() {
    let pageProps = {};
    try {
        pageProps = usePage().props;
    } catch (error) {
        console.error("Error en usePage():", error);
    }
    return pageProps || {}; // Siempre devuelve un objeto
}
