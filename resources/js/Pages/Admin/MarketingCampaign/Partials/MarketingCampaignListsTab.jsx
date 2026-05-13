import React, { useState, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { OverlayTrigger, Table, Tooltip } from 'react-bootstrap';
import axios from 'axios';

// Components:
import ColumnFilter from '@/Components/ColumnFilter';
import FilterRow from '@/Components/FilterRow';
import { Pagination } from '@/Components/Pagination';
import RecordsPerPage from '@/Components/RecordsPerPage';
import { SortControl } from '@/Components/SortControl';

// Hooks:
import { useSweetAlert } from '@/Hooks/useSweetAlert';
import { useTranslation } from '@/Hooks/useTranslation';

export default function MarketingCampaignListsTab({
    campaign,
    queryParams: rawQueryParams = {},
    refreshKey = 0,
}) {
    const __ = useTranslation();
    const pageProps = usePage()?.props || {};
    const permissions = pageProps.permissions || {};
    const { showConfirm } = useSweetAlert();

    const queryParams = typeof rawQueryParams === 'object' && rawQueryParams !== null ? rawQueryParams : {};

    const columns = [
        { key: 'name',          label: __('nombre'),   sort: true,  filter: 'text', placeholder: __('nombre') },
        { key: 'members_count', label: __('miembros'), sort: true,  filter: '',     class_th: 'text-center', class_td: 'text-center' },
        { key: 'status',        label: __('estado'),   sort: false, filter: '',     class_th: 'text-center', class_td: 'text-center' },
        { key: 'created_at',    label: __('creado'),   sort: true,  filter: '' },
    ];

    const allColumnKeys = columns.map((c) => c.key);
    const savedPrefs = pageProps.columnPreferences?.['tblCampaignLists'];
    const [visibleColumns, setVisibleColumns] = useState(
        Array.isArray(savedPrefs) && savedPrefs.length ? savedPrefs : allColumnKeys
    );
    const toggleColumnVisibility = (key) =>
        setVisibleColumns((prev) =>
            prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
        );

    const [sortParams, setSortParams] = useState({
        sort_field:     queryParams.sort_field     || 'name',
        sort_direction: queryParams.sort_direction || 'asc',
    });
    const [perPage, setPerPage] = useState(() => parseInt(queryParams.per_page) || 10);
    const [localParams, setLocalParams] = useState({ ...queryParams });
    const [tableData, setTableData] = useState({ data: [], meta: {}, links: [] });
    const [loading, setLoading] = useState(false);

    const fetchData = async (extraParams = {}) => {
        if (!campaign?.id) return;
        setLoading(true);
        try {
            const response = await axios.get(
                route('marketing-campaigns.lists.filtered-data', { campaign: campaign.id }),
                {
                    params: { ...localParams, ...extraParams, per_page: perPage },
                    headers: { Accept: 'application/json' },
                }
            );
            setTableData({
                data:  response.data?.data       ?? [],
                meta:  response.data?.meta       ?? {},
                links: response.data?.meta?.links ?? [],
            });
        } catch (e) {
            console.error('Error fetching campaign lists:', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [campaign?.id, refreshKey]);

    const SearchFieldChanged = (name, value) => {
        const updated = { ...localParams };
        if (value) {
            updated[name] = value;
        } else {
            delete updated[name];
        }
        updated.page = 1;
        setLocalParams(updated);
        fetchData(updated);
    };

    const sortChanged = (field) => {
        const direction =
            sortParams.sort_field === field && sortParams.sort_direction === 'asc' ? 'desc' : 'asc';
        setSortParams({ sort_field: field, sort_direction: direction });
        const updated = { ...localParams, sort_field: field, sort_direction: direction, page: 1 };
        setLocalParams(updated);
        fetchData(updated);
    };

    const handlePerPageChange = (val) => {
        setPerPage(val);
        const updated = { ...localParams, per_page: val, page: 1 };
        setLocalParams(updated);
        fetchData({ ...updated });
    };

    const handlePageChange = (page) => {
        const updated = { ...localParams, page };
        setLocalParams(updated);
        fetchData(updated);
    };

    const handleDetach = (list) => {
        showConfirm({
            title: __('lista_desvincular'),
            text:  __('lista_desvincular_confirm'),
            icon:  'warning',
            onConfirm: async () => {
                try {
                    await axios.delete(
                        route('marketing-campaigns.lists.detach', {
                            campaign: campaign.id,
                            list:     list.id,
                        }),
                        { headers: { Accept: 'application/json' } }
                    );
                    fetchData();
                } catch (e) {
                    console.error('Error desvinculando lista:', e);
                }
            },
        });
    };

    return (
        <div>
            {/* Controles */}
            <div className="row mb-2">
                <div className="controls d-flex align-items-center">
                    <ColumnFilter
                        columns={columns}
                        visibleColumns={visibleColumns}
                        toggleColumn={toggleColumnVisibility}
                    />
                    <RecordsPerPage perPage={perPage} setPerPage={handlePerPageChange} />
                </div>
            </div>

            {/* Tabla */}
            <div className="table-responsive">
                <Table className="table table-nowrap table-striped align-middle mb-0">
                    <thead>
                        <tr>
                            {columns.map((col) => (
                                <th
                                    key={col.key}
                                    className={`${col.class_th ?? ''} ${visibleColumns.includes(col.key) ? '' : 'd-none'}`.trim()}
                                >
                                    {col.label}
                                    {col.sort && (
                                        <SortControl
                                            name={col.key}
                                            sortable={true}
                                            sort_field={sortParams.sort_field}
                                            sort_direction={sortParams.sort_direction}
                                            sortChanged={sortChanged}
                                        />
                                    )}
                                </th>
                            ))}
                            <th className="text-center">{__('acciones')}</th>
                        </tr>
                    </thead>

                    <FilterRow
                        columns={columns}
                        queryParams={localParams}
                        visibleColumns={visibleColumns}
                        SearchFieldChanged={SearchFieldChanged}
                    />

                    <tbody>
                        {loading && (
                            <tr>
                                <td colSpan={columns.length + 1} className="text-center py-4">
                                    <span className="spinner-border spinner-border-sm me-2" />
                                    {__('cargando')}...
                                </td>
                            </tr>
                        )}

                        {!loading && tableData.data.length === 0 && (
                            <tr>
                                <td colSpan={columns.length + 1} className="text-center py-4 text-muted">
                                    {__('sin_registros')}
                                </td>
                            </tr>
                        )}

                        {!loading && tableData.data.map((list) => (
                            <tr key={`list-${list.id}`}>
                                {columns.map((col) => (
                                    <td
                                        key={col.key}
                                        className={`${col.class_td ?? ''} ${visibleColumns.includes(col.key) ? '' : 'd-none'}`.trim()}
                                    >
                                        {col.key === 'name' && (
                                            permissions?.['marketing-lists.edit']
                                                ? <Link href={route('marketing-lists.edit', list.id)}>{list.name}</Link>
                                                : list.name
                                        )}
                                        {col.key === 'members_count' && (list.members_count || 0)}
                                        {col.key === 'status' && (
                                            <span className={`badge ${list.status == 1 ? 'bg-success' : 'bg-secondary'}`}>
                                                {list.status == 1 ? __('activa') : __('inactiva')}
                                            </span>
                                        )}
                                        {col.key === 'created_at' && list.created_at}
                                    </td>
                                ))}

                                {/* Acciones */}
                                <td className="text-end">
                                    {permissions?.['marketing-lists.edit'] && (
                                        <OverlayTrigger
                                            placement="top"
                                            overlay={<Tooltip>{__('editar')}</Tooltip>}
                                        >
                                            <Link
                                                href={route('marketing-lists.edit', list.id)}
                                                className="btn btn-sm btn-info ms-1"
                                            >
                                                <i className="la la-edit" />
                                            </Link>
                                        </OverlayTrigger>
                                    )}

                                    {permissions?.['marketing-campaigns.edit'] && (
                                        <OverlayTrigger
                                            placement="top"
                                            overlay={<Tooltip>{__('desvincular')}</Tooltip>}
                                        >
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-warning ms-1"
                                                onClick={() => handleDetach(list)}
                                            >
                                                <i className="la la-unlink" />
                                            </button>
                                        </OverlayTrigger>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>

            {/* Paginación */}
            <Pagination
                links={tableData.links || []}
                totalRecords={tableData.meta?.total || 0}
                currentPage={tableData.meta?.current_page || 1}
                perPage={tableData.meta?.per_page || perPage}
                onPageChange={handlePageChange}
            />
        </div>
    );
}
