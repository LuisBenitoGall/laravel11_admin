import React from 'react';
import Tabs from '@/Components/Tabs';
import { usePage } from '@inertiajs/react';

export default function TabsLocale({ children }) {
    const { availableLocales = [], languages = {} } = usePage().props;
    const items = availableLocales.map(code => ({
        key: code,
        label: Array.isArray(languages[code]) ? languages[code][3] : code,
    }));

    return <Tabs items={items}>{children}</Tabs>;
}
