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
import MarketingListShowView from '@/Pages/Admin/MarketingList/Partials/MarketingListShowView';

//Utils:
import renderCellContent from '@/Utils/renderCellContent.jsx';

export default function Index({ 
    auth, 
    session, 
    title, 
    subtitle, 
    lists, 
    queryParams: rawQueryParams = {}, 
    availableLocales 
}) {
    const queryParams = typeof rawQueryParams === 'object' && rawQueryParams !== null ? rawQueryParams : {};
    const __ = useTranslation();
    const { showConfirm } = useSweetAlert();

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

    const handleExportToBrevo = (list) => {
        showConfirm({
            title: __('exportacion_listado'),
            text: __('exportacion_listado_confirm'),
            icon: 'warning',
            onConfirm: () => {
                router.post(
                    route('marketing-lists.export-brevo', [list.id]),
                    {},
                    {
                        preserveScroll: true,
                    }
                );
            },
        });
    };

    //Columnas:
    const columns = [
        { key: 'name', label: __('lista'), sort: true, filter: 'text', type: 'link', link: 'marketing-lists.edit', class_th: '', class_td: '', placeholder: __('lista_filtrar') },
        { key: 'members_count', label: __('miembros'), sort: true, filter: '', class_th: 'text-center', class_td: 'text-end' },
        { key: 'created_by', label: __('creado'), sort: true, filter: 'text', class_th: '', class_td: '', placeholder: __('nombre_filtrar') }
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
        table: 'tblMarketingLists',
        allColumnKeys: columns.map(col => col.key),
        entityName: 'marketing-lists',
        indexRoute: 'marketing-lists.index',
        destroyRoute: 'marketing-lists.destroy',
        filteredDataRoute: 'marketing-lists.filtered-data',
        labelName: 'lista',
        queryParams
    });

    //Acciones:
    const actions = [];
    if (permissions?.['marketing-lists.create']) {
        actions.push({
            text: __('lista_nueva'),
            icon: 'la-plus',
            url: 'marketing-lists.create',
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
                    <Table className="table table-nowrap table-striped align-middle mb-0" id="tblMarketingLists">
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
                            {lists.data.map((list) => (
                                <tr key={"list-"+list.id}>
                                    {/* Columna "show" fija */}
                                    <td className="text-center">
                                        <ShowRegisterButton onClick={() => handleShowRegister(list)} />
                                    </td>

                                    {columns.map(col => (
                                        <td key={col.key} className={`${col.class_td ?? ''} ${visibleColumns.includes(col.key) ? '' : 'd-none'}`.trim()}>
                                            {renderCellContent(list[col.key], col, list)}
                                        </td>
                                    ))}

                                    {/* Acciones */}
                                    <td className="text-end">
                                        {/* Estado */}
                                        {permissions?.['marketing-lists.edit'] && (
                                            <OverlayTrigger
                                                key={"status-"+list.id}
                                                placement="top"
                                                overlay={<Tooltip className="ttp-top">{ list.status == 1 ? __('lista_activa') : __('lista_inactiva') }</Tooltip>}
                                            >
                                                <StatusButton 
                                                    status={list.status} 
                                                    id={list.id} 
                                                    updateRoute='marketing-lists.status'
                                                    reloadUrl={route('marketing-lists.index')}
                                                    reloadResource="marketing-lists"
                                                />
                                            </OverlayTrigger>
                                        )}

                                        {/* Exportar a Brevo */}
                                        <OverlayTrigger
                                                key={"export-"+list.id}
                                                placement="top"
                                                overlay={<Tooltip className="ttp-top">{ __('brevo_exportar') }</Tooltip>}
                                            >
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-info ms-1"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    handleExportToBrevo(list);
                                                }}
                                            >
                                                <i className="la la-file-export"></i>
                                            </button>
                                        </OverlayTrigger>

                                        {/* Editar */}
                                        {permissions?.['marketing-lists.edit'] && (
                                            <OverlayTrigger
                                                key={"edit-"+list.id}
                                                placement="top"
                                                overlay={<Tooltip className="ttp-top">{ __('editar') }</Tooltip>}
                                            >
                                                <Link href={route('marketing-lists.edit', list.id)} className="btn btn-sm btn-info ms-1">
                                                    <i className="la la-edit"></i>
                                                </Link>
                                            </OverlayTrigger>
                                        )}

                                        {/* Eliminar */}
                                        {permissions?.['marketing-lists.destroy'] && (
                                            <OverlayTrigger
                                                key={"delete-"+list.id}
                                                placement="top"
                                                overlay={<Tooltip className="ttp-top">{ __('eliminar') }</Tooltip>}
                                            >
                                                <span>
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-danger ms-1"
                                                        onClick={() => handleDelete(list.id)}
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
                    routeName="marketing-lists.show"        // tu ruta JSON
                    title={__('lista')}         
                    ViewComponent={MarketingListShowView}
                />

                <Pagination 
                    links={lists.meta.links} 
                    totalRecords={lists.meta.total} 
                    currentPage={lists.meta.current_page} 
                    perPage={lists.meta.per_page}
                    onPageChange={(page) => {
                        router.get(route("marketing-lists.index"), {
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