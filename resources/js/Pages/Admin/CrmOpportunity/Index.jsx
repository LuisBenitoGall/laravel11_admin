import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { OverlayTrigger, Table, Tooltip } from 'react-bootstrap';
import axios from 'axios';

//Components:
import ColumnFilter from '@/Components/ColumnFilter';
import FilterRow from '@/Components/FilterRow';
import { Pagination } from '@/Components/Pagination';
import RecordsPerPage from '@/Components/RecordsPerPage';
import ShowRegister from '@/Components/ShowRegister/ShowRegister';
import ShowRegisterButton from '@/Components/ShowRegister/ShowRegisterButton';
import { SortControl } from '@/Components/SortControl';
import StatusButton from '@/Components/StatusButton';
import TableExporter from '@/Components/TableExporter';

//Hooks:
import { useSweetAlert } from '@/Hooks/useSweetAlert';
import { useTableManagement } from '@/Hooks/useTableManagement';
import { useTranslation } from '@/Hooks/useTranslation';

//Partials:
import CrmOpportunitiesShowView from '@/Pages/Admin/CrmOpportunity/Partials/CrmOpportunitiesShowView';

//Utils:
import renderCellContent from '@/Utils/renderCellContent.jsx';

export default function Index({ auth, session, title, subtitle, opportunities, queryParams: rawQueryParams = {}, availableLocales }) {
    const queryParams = typeof rawQueryParams === 'object' && rawQueryParams !== null ? rawQueryParams : {};
    const __ = useTranslation();

    //Columna Show Register
    const [showId, setShowId] = useState(null);
    const [showPanelOpen, setShowPanelOpen] = useState(false);

    const handleShowRegister = (row) => {
        setShowId(row.id);
        setShowPanelOpen(true);
    };

    const handleCloseShowPanel = () => {
        setShowPanelOpen(false);
        setShowId(null);
    };

    //Columnas:
    const columns = [
        { key: 'name', label: __('oportunidad'), sort: true, filter: 'text', type: 'link', link: 'crm-opportunities.edit', class_th: '', class_td: '', placeholder: __('oportunidad_filtrar') },
        { key: 'code', label: __('codigo'), sort: true, filter: 'text', class_th: '', class_td: '', placeholder: __('codigo_filtrar') },
        { key: 'type', label: __('tipo'), sort: true, filter: 'text', class_th: '', class_td: '', placeholder: __('tipo_filtrar') },
        { key: 'start_at', label: __('fecha_inicio'), sort: true, filter: 'date', class_th: 'text-center', class_td: 'text-end', placeholder: __('fecha_inicio'), dateKeys: ['date_from', 'date_to'] },
        { key: 'finish_at', label: __('fecha_fin'), sort: true, filter: 'date', class_th: 'text-center', class_td: 'text-end', placeholder: __('fecha_fin'), dateKeys: ['date_from', 'date_to'] },
    ];    

    //Métodos de la tabla:
	const {
        permissions,
        sortParams,
        perPage,
        setPerPage,
        visibleColumns,
        setVisibleColumns,
        toggleColumnVisibility,
        SearchFieldChanged,
        sortChanged,
        filteredData,
        handleDelete
    } = useTableManagement({
        table: 'tblMarketingopportunities',
        allColumnKeys: columns.map(col => col.key),
        entityName: 'crm-opportunities',
        indexRoute: 'crm-opportunities.index',
        destroyRoute: 'crm-opportunities.destroy',
        filteredDataRoute: 'crm-opportunities.filtered-data',
        labelName: 'oportunidad',
        queryParams
    });

    //Acciones:
    const actions = [];
    if (permissions?.['crm-opportunities.create']) {
        actions.push({
            text: __('oportunidad_nueva'),
            icon: 'la-plus',
            url: 'crm-opportunities.create',
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

            <div className="contents">
                {/* Controles */}
                <div className="row">
                    <div className="controls d-flex align-items-center">
                        <ColumnFilter columns={columns} visibleColumns={visibleColumns} toggleColumn={toggleColumnVisibility} />
                        <RecordsPerPage perPage={perPage} setPerPage={setPerPage} />
                        <TableExporter filename={ __('empresas') } columns={columns} fetchData={filteredData}/>
                    </div>
                </div>

                {/* Tabla */}
                <div className="table-responsive">
                    <Table className="table table-nowrap table-striped align-middle mb-0" id="tblMarketingopportunities">
                        <thead>
                            <tr>
                                <th className="text-center first-column">
                                    &nbsp;
                                </th>

                                {columns.map(col => (
                                    <th key={col.key} className={`${col.class_th ?? ''} ${visibleColumns.includes(col.key) ? '' : 'd-none'}`.trim()}>
                                        {__(col.label)}
                                        {col.sort && (
                                            <SortControl
                                                name={col.key}
                                                sortable={true}
                                                sort_field={queryParams.sort_field}
                                                sort_direction={queryParams.sort_direction}
                                                sortChanged={sortChanged}
                                            />
                                        )}
                                    </th>
                                ))}
                                <th className="text-center">{ __('acciones') }</th> 
                            </tr>
                        </thead>

                        <FilterRow
                            columns={columns}
                            queryParams={queryParams}
                            visibleColumns={visibleColumns}
                            SearchFieldChanged={SearchFieldChanged}
                            PrependColumns={1}
                        />

                        <tbody>
                            {opportunities.data.map((campaign) => (
                                <tr key={"campaign-"+campaign.id}>
                                    {/* Columna "show" fija */}
                                    <td className="text-center">
                                        <ShowRegisterButton onClick={() => handleShowRegister(campaign)} />
                                    </td>

                                    {columns.map(col => (
                                        <td key={col.key} className={`${col.class_td ?? ''} ${visibleColumns.includes(col.key) ? '' : 'd-none'}`.trim()}>
                                            {renderCellContent(campaign[col.key], col, campaign)}
                                        </td>
                                    ))}

                                    {/* Acciones */}
                                    <td className="text-end">
                                        {/* Estado */}
                                        {permissions?.['crm-opportunities.edit'] && (
                                            <OverlayTrigger
                                                key={"status-"+campaign.id}
                                                placement="top"
                                                overlay={<Tooltip className="ttp-top">{ campaign.status == 1 ? __('oportunidad_activa') : __('oportunidad_inactiva') }</Tooltip>}
                                            >
                                                <StatusButton 
                                                    status={campaign.status} 
                                                    id={campaign.id} 
                                                    updateRoute='crm-opportunities.status'
                                                    reloadUrl={route('crm-opportunities.index')}
  													reloadResource="crm-opportunities"
                                                />
                                            </OverlayTrigger>
                                        )}

                                        {/* Editar */}
                                        {permissions?.['crm-opportunities.edit'] && (
                                            <OverlayTrigger
                                                key={"edit-"+campaign.id}
                                                placement="top"
                                                overlay={<Tooltip className="ttp-top">{ __('editar') }</Tooltip>}
                                            >
                                                <Link href={route('crm-opportunities.edit', campaign.id)} className="btn btn-sm btn-info ms-1">
                                                    <i className="la la-edit"></i>
                                                </Link>
                                            </OverlayTrigger>
                                        )}

                                        {/* Eliminar */}
                                        {permissions?.['crm-opportunities.destroy'] && (
                                            <OverlayTrigger
                                                key={"delete-"+campaign.id}
                                                placement="top"
                                                overlay={<Tooltip className="ttp-top">{ __('eliminar') }</Tooltip>}
                                            >
                                                <span>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-danger ms-1"
                                                        onClick={() => handleDelete(campaign.id)}
                                                    >
                                                        <i className="la la-trash"></i>
                                                    </button>
                                                </span>
                                            </OverlayTrigger>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                </div>

                <ShowRegister
                    id={showId}
                    open={showPanelOpen}
                    onClose={handleCloseShowPanel}
                    routeName="crm-opportunities.show"        // tu ruta JSON
                    title={__('oportunidad')}        
                    ViewComponent={CrmOpportunitiesShowView}
                />

                <Pagination 
                    links={opportunities.meta.links} 
                    totalRecords={opportunities.meta.total} 
                    currentPage={opportunities.meta.current_page} 
                    perPage={opportunities.meta.per_page}
                    onPageChange={(page) => {
                        router.get(route("crm-opportunities.index"), {
                            ...queryParams,
                            page,
                            per_page: perPage,
                            sort_field: sortParams.sort_field,
                            sort_direction: sortParams.sort_direction,
                        }, { preserveState: true });
                    }}
                />
            </div>
        </AdminAuthenticatedLayout>
    );
}