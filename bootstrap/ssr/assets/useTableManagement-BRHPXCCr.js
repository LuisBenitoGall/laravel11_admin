import { useState, useEffect, useRef } from "react";
import { usePage, router } from "@inertiajs/react";
import axios from "axios";
import { u as useSweetAlert } from "./useSweetAlert-D4PAsWYN.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
function useTableManagement({
  table,
  allColumnKeys = [],
  defaultHiddenKeys = [],
  entityName,
  indexRoute = null,
  destroyRoute,
  filteredDataRoute,
  filteredDataKey = null,
  // compat legacy: clave JSON de filas (p.ej. 'accounts')
  labelName,
  defaultSortField = "name",
  queryParams: initialQueryParams,
  routeParams = [],
  preserveParams = {},
  onDeleted,
  manualFiltering = false,
  onManualFilter = null
}) {
  var _a;
  const queryParams = typeof initialQueryParams === "object" && initialQueryParams !== null ? initialQueryParams : {};
  const __ = useTranslation();
  const props = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  const { showConfirm } = useSweetAlert();
  const pageTable = props.table && typeof props.table === "object" ? props.table : null;
  const permissions = (pageTable == null ? void 0 : pageTable.permissions) && typeof pageTable.permissions === "object" ? pageTable.permissions : props.permissions || {};
  const columnPrefsSource = (pageTable == null ? void 0 : pageTable.columnPreferences) && typeof pageTable.columnPreferences === "object" ? pageTable.columnPreferences : props.columnPreferences || {};
  const savedPrefs = columnPrefsSource == null ? void 0 : columnPrefsSource[table];
  const initialVisible = Array.isArray(savedPrefs) && savedPrefs.length ? savedPrefs : allColumnKeys.filter((k) => !defaultHiddenKeys.includes(k));
  const [sortParams, setSortParams] = useState({
    sort_field: queryParams.sort_field || defaultSortField,
    sort_direction: queryParams.sort_direction || "asc"
  });
  const [perPage, setPerPage] = useState(() => parseInt(queryParams.per_page) || 10);
  const [visibleColumns, setVisibleColumnsState] = useState(initialVisible);
  const getRouteName = (r) => typeof r === "object" ? r.name : r;
  const getRouteParams = (r) => typeof r === "object" ? r.params || [] : routeParams;
  const setVisibleColumns = (columns) => {
    const safeColumns = (Array.isArray(columns) ? columns : []).map((c) => typeof c === "string" ? c : typeof c === "object" && (c == null ? void 0 : c.key) ? c.key : null).filter((c) => typeof c === "string");
    setVisibleColumnsState([...safeColumns]);
    axios.post("/admin/column-preferences", {
      table,
      columns: safeColumns
    }).catch((err) => {
      console.warn("No se pudo guardar las preferencias de columnas:", err);
    });
  };
  const toggleColumnVisibility = (columnKey) => {
    const updated = visibleColumns.includes(columnKey) ? visibleColumns.filter((key) => key !== columnKey) : [...visibleColumns, columnKey];
    setVisibleColumns(updated);
  };
  const [localQueryParams, setLocalQueryParams] = useState({ ...queryParams });
  const queryParamsSignature = JSON.stringify(queryParams);
  useEffect(() => {
    if (queryParams && typeof queryParams === "object") {
      setLocalQueryParams((prev) => {
        const next = { ...queryParams };
        if (JSON.stringify(prev) === JSON.stringify(next)) return prev;
        return next;
      });
    }
  }, [queryParamsSignature]);
  useRef(false);
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
    if (manualFiltering && typeof onManualFilter === "function") {
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
  const sortChanged = (name) => {
    const newDirection = sortParams.sort_field === name && sortParams.sort_direction === "asc" ? "desc" : "asc";
    setSortParams({ sort_field: name, sort_direction: newDirection });
    if (manualFiltering && typeof onManualFilter === "function") {
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
  const unwrapCollection = (maybe) => {
    if (Array.isArray(maybe)) return maybe;
    if (maybe && Array.isArray(maybe.data)) return maybe.data;
    return null;
  };
  const extractRows = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (!payload || typeof payload !== "object") return [];
    if (Object.prototype.hasOwnProperty.call(payload, "rows")) {
      const fromRows = unwrapCollection(payload.rows);
      if (fromRows) return fromRows;
    }
    if (filteredDataKey && Object.prototype.hasOwnProperty.call(payload, filteredDataKey)) {
      const fromKey = unwrapCollection(payload[filteredDataKey]);
      if (fromKey) return fromKey;
    }
    if (typeof entityName === "string" && entityName.length > 0) {
      const jsonEntityName = entityName.includes("-") ? entityName.replace(/-/g, "_") : entityName;
      for (const key of [jsonEntityName, entityName]) {
        if (Object.prototype.hasOwnProperty.call(payload, key)) {
          const fromEntity = unwrapCollection(payload[key]);
          if (fromEntity) return fromEntity;
        }
      }
    }
    const firstArray = Object.values(payload).find((v) => Array.isArray(v));
    if (Array.isArray(firstArray)) return firstArray;
    if (Array.isArray(payload.data)) return payload.data;
    return [];
  };
  const filteredData = async (params = null) => {
    try {
      const response = await axios.get(
        route(getRouteName(filteredDataRoute), getRouteParams(filteredDataRoute)),
        { params: params || queryParams, headers: { Accept: "application/json" } }
      );
      return extractRows(response.data);
    } catch (error) {
      console.error(__("data_error"), error);
      return [];
    }
  };
  const [managedRows, setManagedRows] = useState(null);
  const fetchAndSetRows = (params) => {
    if (!filteredDataRoute) return;
    filteredData(params).then((r) => setManagedRows(r));
  };
  const handleDelete = (id, callback = null) => {
    showConfirm({
      title: __(labelName + "_eliminar"),
      text: __(labelName + "_eliminar_confirm"),
      icon: "warning",
      onConfirm: () => {
        router.delete(route(destroyRoute, [id]), {
          data: localQueryParams,
          preserveScroll: true,
          preserveState: true,
          onSuccess: () => {
            if (typeof callback === "function") callback();
            if (typeof onDeleted === "function") onDeleted();
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
export {
  useTableManagement as u
};
