import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';

//Hooks:
import { useCompanySession } from '@/Hooks/useCompanySession';
import { useSweetAlert } from '@/Hooks/useSweetAlert';
import { useTranslation } from '@/Hooks/useTranslation';

//Partials:
import FavoritesGrid from './Partials/FavoritesGrid';

export default function Index({ auth, session, title, subtitle, favorites = [] }){
	const __ = useTranslation();
	const { currentCompany, companyModules, companySettings } = useCompanySession();
	
	//Acciones:
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
                    {/* <div className="col-12">
                        <h2>DASHBOARD</h2>
					</div> */}

                    {/* Favoritos */}
                    <div className="col-12 my-3">
                        <h2 className="mb-3">{__('favoritos_mis')}</h2>
                        <FavoritesGrid favorites={favorites} />
                    </div>



					{/* <pre>User: {JSON.stringify(auth.user, null, 2)}</pre>

					<pre><strong>Empresa activa:</strong> {JSON.stringify(currentCompany, null, 2)}</pre>
					<pre><strong>Módulos:</strong> {JSON.stringify(companyModules, null, 2)}</pre>
					<pre><strong>Configuración empresa:</strong> {JSON.stringify(companySettings, null, 2)}</pre> */}
				</div>
			</div>
		</AdminAuthenticatedLayout>
	);
}