// resources/js/Pages/Admin/Dashboard/Index.jsx
import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

// Hooks:
import { useCompanySession } from '@/Hooks/useCompanySession';
import { useSweetAlert } from '@/Hooks/useSweetAlert';
import { useTranslation } from '@/Hooks/useTranslation';

// Partials:
import FavoritesGrid from './Partials/FavoritesGrid';

// Widgets:
import UserNotesRemindersWidget from '@/Components/UserNotesRemindersWidget';

export default function Index({ auth, session, title, subtitle, favorites = [] }){
    const __ = useTranslation();
    const { currentCompany, companyModules, companySettings } = useCompanySession();
    
    // Acciones:
    const actions = [];

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
                <div className="row">
                    {/* Favoritos */}
                    <div className="col-12 my-3">
                        <h2 className="mb-3">{__('favoritos_mis')}</h2>
                        <FavoritesGrid favorites={favorites} />
                    </div>

                    {/* Widgets */}
                    <div className="col-md-6 col-lg-4 my-5">
                        <UserNotesRemindersWidget />
                    </div>

                    {/* Aquí podrás añadir más widgets en el futuro:
                    <div className="col-md-6 my-5">
                        <OtroWidget />
                    </div>
                    */}
                </div>
            </div>
        </AdminAuthenticatedLayout>
    );
}
