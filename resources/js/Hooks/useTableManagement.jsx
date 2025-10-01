import { useState, useEffect } from 'react';
import { router, usePage } from '@inertiajs/react';
import axios from 'axios';

//Hooks:
import { useSweetAlert } from '@/Hooks/useSweetAlert';
import { useTranslation } from '@/Hooks/useTranslation';

export function useTableManagement({
    table,
    allColumnKeys = [],
    entityName,
    indexRoute = null,
    destroyRoute,
    filteredDataRoute,
    labelName,
    defaultSortField = 'name',
    queryParams: initialQueryParams,
    routeParams = [],
    onDeleted,
    manualFiltering = false,
    onManualFilter = null
}) {
    const queryParams = typeof initialQueryParams === 'object' && initialQueryParams !== null ? initialQueryParams : {};

    const __ = useTranslation();
    const props = usePage()?.props || {};
    const { showConfirm } = useSweetAlert();
    const permissions = props.permissions || {};

    // Preferencias de columnas:
    const initialVisible = Array.isArray(props.columnPreferences?.[table])
        ? props.columnPreferences[table]
        : allColumnKeys;

    const [sortParams, setSortParams] = useState({
        sort_field: queryParams.sort_field || defaultSortField,
        sort_direction: queryParams.sort_direction || 'asc',
    });

    const [perPage, setPerPage] = useState(() => parseInt(queryParams.per_page) || 10);
    const [visibleColumns, setVisibleColumnsState] = useState(initialVisible);

    const getRouteName = (r) => typeof r === 'object' ? r.name : r;
    const getRouteParams = (r) => typeof r === 'object' ? r.params || [] : routeParams;

    const setVisibleColumns = (columns) => {
        const safeColumns = (Array.isArray(columns) ? columns : [])
            .map(c => typeof c === 'string' ? c : (typeof c === 'object' && c?.key ? c.key : null))
            .filter(c => typeof c === 'string');

        setVisibleColumnsState([...safeColumns]);

        axios.post('/admin/column-preferences', {
            table,
            columns: safeColumns
        }).catch((err) => {
            console.warn('No se pudo guardar las preferencias de columnas:', err);
        });
    };

    const toggleColumnVisibility = (columnKey) => {
        const updated = visibleColumns.includes(columnKey)
            ? visibleColumns.filter(key => key !== columnKey)
            : [...visibleColumns, columnKey];

        setVisibleColumns(updated);
    };

    const [localQueryParams, setLocalQueryParams] = useState({ ...queryParams });

    const SearchFieldChanged = (name, value) => {
        const updatedParams = { ...localQueryParams };
        if (value) {
            updatedParams[name] = value;
        } else {
            delete updatedParams[name];
        }
        updatedParams.page = 1;
        updatedParams.per_page = perPage;

        setLocalQueryParams(updatedParams);

        if (manualFiltering && typeof onManualFilter === 'function') {
            onManualFilter(updatedParams);
        } else if (indexRoute) {
            router.get(route(getRouteName(indexRoute), getRouteParams(indexRoute)), updatedParams, {
                preserveState: true,
                replace: true
            });
        }
    };

    const sortChanged = (name) => {
        const newDirection = sortParams.sort_field === name && sortParams.sort_direction === 'asc' ? 'desc' : 'asc';
        setSortParams({ sort_field: name, sort_direction: newDirection });

        if (manualFiltering && typeof onManualFilter === 'function') {
            const updatedParams = {
                ...localQueryParams,
                sort_field: name,
                sort_direction: newDirection,
                page: 1,
                per_page: perPage
            };
            onManualFilter(updatedParams);
        } else if (indexRoute) {
            router.get(route(getRouteName(indexRoute), getRouteParams(indexRoute)), {
                ...queryParams,
                sort_field: name,
                sort_direction: newDirection,
                page: 1,
                per_page: perPage
            }, {
                preserveState: true
            });
        }
    };

    useEffect(() => {
        if (!manualFiltering && indexRoute && parseInt(queryParams.per_page) !== parseInt(perPage)) {
            router.get(route(getRouteName(indexRoute), getRouteParams(indexRoute)), {
                ...queryParams,
                per_page: perPage,
                page: 1
            }, {
                preserveState: true
            });
        }
    }, [perPage]);

    // Conversión kebab-case a snake_case si hace falta
    const jsonEntityName = entityName.includes('-')
        ? entityName.replace(/-/g, '_')
        : entityName;

    const filteredData = async (params = null) => {
        try {
            const response = await axios.get(route(filteredDataRoute, getRouteParams(filteredDataRoute)), {
                params: params || queryParams,
                headers: { 'Accept': 'application/json' }
            });
            //return response.data[jsonEntityName] ?? [];
            return response.data ?? {};
        } catch (error) {
            console.error(__('data_error'), error);
            return [];
        }
    };

    const handleDelete = (id, callback = null) => {
        showConfirm({
            title: __(labelName + '_eliminar'),
            text: __(labelName + '_eliminar_confirm'),
            icon: 'warning',
            onConfirm: () => {
                router.delete(route(destroyRoute, [id]), {
                    data: localQueryParams,
                    preserveScroll: true,
                    preserveState: true,
                    onSuccess: () => {
                        if (typeof callback === 'function') {
                            callback();
                        }
                        if (typeof onDeleted === 'function') {
                            onDeleted();
                        }
                    }
                });
            }
        });
    };

    return {
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
        handleDelete,
        queryParams: localQueryParams
    };
}
