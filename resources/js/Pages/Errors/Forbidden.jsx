import React from 'react';
import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { useTranslation } from '@/Hooks/useTranslation';

export default function Forbidden() {
    const __ = useTranslation();
    const { auth, alert, title = '403', subtitle = __('permisos_sin') } = usePage().props;

    const actions = [
        {
            text: __('Dashboard'),
            icon: 'la-home',
            url: 'dashboard', 
            modal: false,
        },
    ];

    return (
        <AdminAuthenticatedLayout
            user={auth.user}
            title={title}
            subtitle={subtitle}
            actions={actions}
        >
            <Head title={title} />

            <div className="text-center py-5">
                <h1 className="text-danger display-1"><b>error 403</b></h1>
                <h2 className="mb-4">{__('permisos_sin_texto')}</h2>
                {alert && <div className="alert alert-danger">{alert}</div>}
            </div>
        </AdminAuthenticatedLayout>
    );
}
