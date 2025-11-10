// CompanyWorkplacesTab.jsx
import React from 'react';
import { usePage } from '@inertiajs/react';
import TableWorkplaces from '@/Components/TableWorkplaces';
import { useTranslation } from '@/Hooks/useTranslation';

export default function CompanyWorkplacesTab({
    company,                // objeto company completo
    side = 'customers',     // 'customers' | 'providers'
}) {
    const __ = useTranslation();
    const pageProps = usePage()?.props || {};

    // Ruta de retorno (para recargar la misma edición si hicieras reloads manuales)
    const indexRoute = side === 'providers' ? 'providers.edit' : 'customers.edit';

    // Endpoints para listar y exportar (ajusta si tus nombres difieren)
    // Sugerido:
    //   GET admin/customers/{company}/workplaces           -> 'customers.workplaces.index'
    //   GET admin/customers/{company}/workplaces/data      -> 'customers.workplaces.data'
    //   GET admin/providers/{company}/workplaces           -> 'providers.workplaces.index'
    //   GET admin/providers/{company}/workplaces/data      -> 'providers.workplaces.data'
    const fetchRoute = side === 'providers'
        ? 'providers.workplaces.index'
        : 'customers.workplaces.index';

    const filteredDataRoute = side === 'providers'
        ? 'providers.workplaces.data'
        : 'customers.workplaces.data';

    return (
        <div>
            <TableWorkplaces
                company={company}
                side={side}
                tableId="tblCompanyWorkplaces"
                entityName="workplaces"
                indexRoute={side === 'providers' ? 'providers.edit' : 'customers.edit'}
                indexParams={company?.id}
                fetchRoute="workplaces.index"
                filteredDataRoute="workplaces.filtered-data"
                filteredDataKey="workplaces"
                labelName="centros_trabajo"
                availableLocales={pageProps.availableLocales || []}
                queryParams={pageProps.queryParams || {}}
            />
        </div>
    );
}
