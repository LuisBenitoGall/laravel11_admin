import { usePage } from '@inertiajs/react'

export function useTranslation() {
	const props = usePage().props || {};
    const translations = props.translations || {};

    return (key) => translations[key] ?? key;
}

