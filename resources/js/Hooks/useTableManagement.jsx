import { useState, useEffect, useRef } from 'react';
import { router, usePage } from '@inertiajs/react';
import axios from 'axios';

// Hooks:
import { useSweetAlert } from '@/Hooks/useSweetAlert';
import { useTranslation } from '@/Hooks/useTranslation';

export function useTableManagement({
  table,
  allColumnKeys = [],
  entityName,
  indexRoute = null,
  destroyRoute,
  filteredDataRoute,
  filteredDataKey = null,          // << NUEVO: clave del JSON con las filas (p.ej. 'relations', 'companies', 'users')
  labelName,
  defaultSortField = 'name',
  queryParams: initialQueryParams,
  routeParams = [],
  preserveParams = {},
  onDeleted,
  manualFiltering = false,
  onManualFilter = null
}) {
    const queryParams = typeof initialQueryParams === 'object' && initialQueryParams !== null ? initialQueryParams : {};

    const __ = useTranslation();
    const props = usePage()?.props || {};
    const { showConfirm } = useSweetAlert();
    const permissions = props.permissions || {};

    // Preferencias de columnas
    const savedPrefs = props.columnPreferences?.[table];
    const initialVisible = Array.isArray(savedPrefs) && savedPrefs.length ? savedPrefs : allColumnKeys;

    const [sortParams, setSortParams] = useState({
        sort_field: queryParams.sort_field || defaultSortField,
        sort_direction: queryParams.sort_direction || 'asc'
    });

    const [perPage, setPerPage] = useState(() => parseInt(queryParams.per_page) || 10);
    const [visibleColumns, setVisibleColumnsState] = useState(initialVisible);

    const getRouteName = r => (typeof r === 'object' ? r.name : r);
    const getRouteParams = r => (typeof r === 'object' ? r.params || [] : routeParams);

    const setVisibleColumns = columns => {
        const safeColumns = (Array.isArray(columns) ? columns : [])
            .map(c => (typeof c === 'string' ? c : typeof c === 'object' && c?.key ? c.key : null))
            .filter(c => typeof c === 'string');

        setVisibleColumnsState([...safeColumns]);

        axios.post('/admin/column-preferences', {
            table,
            columns: safeColumns
        }).catch((err) => {
            console.warn('No se pudo guardar las preferencias de columnas:', err);
        });
    };

    const toggleColumnVisibility = columnKey => {
        const updated = visibleColumns.includes(columnKey)
            ? visibleColumns.filter(key => key !== columnKey)
            : [...visibleColumns, columnKey];

            setVisibleColumns(updated);
    };

    const [localQueryParams, setLocalQueryParams] = useState({ ...queryParams });

    // Sincronizar con los queryParams que llegan por props (p. ej. tras una visita Inertia o carga con filtros en URL)
    const queryParamsSignature = JSON.stringify(queryParams);
    useEffect(() => {
        if (queryParams && typeof queryParams === 'object') {
            setLocalQueryParams(prev => {
                const next = { ...queryParams };
                if (JSON.stringify(prev) === JSON.stringify(next)) return prev;
                return next;
            });
        }
    }, [queryParamsSignature]);

    const hasSyncedPerPageRef = useRef(false);

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
            const params = { ...preserveParams, ...updatedParams };
            router.get(
                route(getRouteName(indexRoute), getRouteParams(indexRoute)),
                params,
                { preserveState: true, replace: true }
            );
        } else if (filteredDataRoute) {
            fetchAndSetRows(updatedParams);
        }
    };

    const sortChanged = name => {
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
            const baseParams = {
                ...localQueryParams,
                sort_field: name,
                sort_direction: newDirection,
                page: 1,
                per_page: perPage
            };
            const params = { ...preserveParams, ...baseParams };
            router.get(
                route(getRouteName(indexRoute), getRouteParams(indexRoute)),
                params,
                { preserveState: true }
            );
        } else if (filteredDataRoute) {
            const updatedParams = {
                ...localQueryParams,
                sort_field: name,
                sort_direction: newDirection,
                page: 1,
                per_page: perPage
            };
            setLocalQueryParams(updatedParams);
            fetchAndSetRows(updatedParams);
        }
    };

  //   useEffect(() => {
  //   if (!manualFiltering && indexRoute && parseInt(queryParams.per_page) !== parseInt(perPage)) {
  //     router.get(
  //       route(getRouteName(indexRoute), getRouteParams(indexRoute)),
  //       { ...queryParams, per_page: perPage, page: 1 },
  //       { preserveState: true }
  //     );
  //   }
  // }, [perPage]);

    // useEffect(() => {
    //     // si no hay ruta índice o se usa filtrado manual, no hacemos nada
    //     if (!indexRoute || manualFiltering) return;

    //     // si ya hicimos la sincronización inicial, no vuelvas a tocar nada aquí
    //     if (hasSyncedPerPageRef.current) return;

    //     const qpPerPage = parseInt(queryParams.per_page);
    //     const currentPer = parseInt(perPage);

    //     // solo forzar una visita si la URL NO tiene per_page pero el estado sí
    //     if (Number.isNaN(qpPerPage) && !Number.isNaN(currentPer)) {
    //       hasSyncedPerPageRef.current = true;

    //       router.get(
    //         route(getRouteName(indexRoute), getRouteParams(indexRoute)),
    //         { 
    //           ...queryParams, 
    //           per_page: currentPer, 
    //           page: 1 
    //         },
    //         { preserveState: true }
    //       );
    //     } else {
    //       // ya está sincronizado o no hace falta
    //       hasSyncedPerPageRef.current = true;
    //     }
    //     // 👈 que dependa de queryParams, no de perPage para evitar re-llamadas constantes
    // }, [indexRoute, manualFiltering, queryParams, perPage]);

  // Conversión kebab-case a snake_case si hace falta (fallback por si no se pasa filteredDataKey)
  const jsonEntityName = entityName.includes('-') ? entityName.replace(/-/g, '_') : entityName;

  const extractRows = (payload) => {
    // 1) Si se indicó filteredDataKey explícito, úsalo
    if (filteredDataKey && payload && Object.prototype.hasOwnProperty.call(payload, filteredDataKey)) {
      const maybe = payload[filteredDataKey];
      return Array.isArray(maybe) ? maybe : Array.isArray(maybe?.data) ? maybe.data : [];
    }

    // 2) Intento por entityName/jsonEntityName
    if (payload && Object.prototype.hasOwnProperty.call(payload, jsonEntityName)) {
      const maybe = payload[jsonEntityName];
      return Array.isArray(maybe) ? maybe : Array.isArray(maybe?.data) ? maybe.data : [];
    }

    // 3) Autodetección: primer array en el objeto
    if (payload && typeof payload === 'object') {
      const firstArray = Object.values(payload).find(v => Array.isArray(v));
      if (Array.isArray(firstArray)) return firstArray;

      // o paginator { data: [] }
      if (Array.isArray(payload.data)) return payload.data;
    }

    // 4) Si el payload ya es un array
    if (Array.isArray(payload)) return payload;

    return [];
  };

  const filteredData = async (params = null) => {
    try {
      const response = await axios.get(
        route(getRouteName(filteredDataRoute), getRouteParams(filteredDataRoute)),
        { params: params || queryParams, headers: { Accept: 'application/json' } }
      );

      // Devuelve SIEMPRE un array de filas
      return extractRows(response.data);
    } catch (error) {
      console.error(__('data_error'), error);
      return [];
    }
  };

  // Filas gestionadas localmente (para tablas en tab sin navegación Inertia)
  const [managedRows, setManagedRows] = useState(null);

  const fetchAndSetRows = (params) => {
    if (!filteredDataRoute) return;
    filteredData(params).then(r => setManagedRows(r));
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
            if (typeof callback === 'function') callback();
            if (typeof onDeleted === 'function') onDeleted();
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
    managedRows,
    queryParams: localQueryParams
  };
}
