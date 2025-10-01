import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

//Components:
import PatternForm from '@/Components/PatternForm';

//Hooks:
import { useTranslation } from '@/Hooks/useTranslation';

export default function Create({ auth, session, title, subtitle, availableLocales }) {
    const __ = useTranslation();
    const props = usePage()?.props || {};
    const locale = props.locale || false;
    const languages = props.languages || [];
    const permissions = props.permissions || {};

    //Acciones:
    const actions = [];
    if (permissions?.['product-patterns.index']) {
        actions.push({
            text: __('patrones_volver'),
            icon: 'la-angle-left',
            url: 'product-patterns.index',
            modal: false
        });
    }

    return (
        <AdminAuthenticatedLayout
            user={auth.user}
            title={title}
            subtitle={subtitle}
            actions={actions}
        >
            <Head title={title} />

            {/* Contenido */}
            <div className="contents pb-4">
                {/* Puedes pasar una ruta absoluta o el resultado de route('...') si usas Ziggy */}
                <PatternForm action={ route('product-patterns.store') } />
            </div>
        </AdminAuthenticatedLayout>
    );
}

