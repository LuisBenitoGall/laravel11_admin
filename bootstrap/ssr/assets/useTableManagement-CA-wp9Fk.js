import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import { usePage, router, Link } from "@inertiajs/react";
import DatePicker from "react-datepicker";
import { addYears } from "date-fns";
import * as locales from "date-fns/locale";
import { S as SelectInput } from "./SelectInput-DrqFt-OA.js";
import { T as TextInput } from "./TextInput-CzxrbIpp.js";
import axios from "axios";
import { u as useSweetAlert } from "./useSweetAlert-D4PAsWYN.js";
const ColumnFilter = ({ columns, visibleColumns, toggleColumn }) => {
  const __ = useTranslation();
  const txt_columnas_on_off = __("columnas_ver_ocultar");
  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdown = () => setIsOpen((prev) => !prev);
  return /* @__PURE__ */ jsxs("div", { className: "column-filter position-relative d-inline-block float-start", children: [
    /* @__PURE__ */ jsx("button", { className: "btn btn-light dropdown-toggle", onClick: toggleDropdown, children: txt_columnas_on_off }),
    isOpen && /* @__PURE__ */ jsx("ul", { className: "dropdown-menu show position-absolute", children: columns.map(({ key, label }) => /* @__PURE__ */ jsx("li", { className: "dropdown-item d-flex justify-content-between align-items-center", children: /* @__PURE__ */ jsxs("label", { className: "d-flex w-100 justify-content-between align-items-center", children: [
      /* @__PURE__ */ jsx("span", { children: label }),
      /* @__PURE__ */ jsx("div", { className: "form-check form-check-success", children: /* @__PURE__ */ jsx(
        "input",
        {
          type: "checkbox",
          checked: visibleColumns.includes(key),
          onChange: () => toggleColumn(key),
          className: "form-check-input ms-2"
        }
      ) })
    ] }) }, key)) })
  ] });
};
function FilterRow({ columns, queryParams, visibleColumns, SearchFieldChanged, indexRoute = "users.index", indexParams = void 0 }) {
  var _a, _b;
  const __ = useTranslation();
  const txt_fechas_selec = __("fechas_selec");
  __("todos");
  const txt_opcion_selec = __("opcion_selec");
  const props = usePage().props;
  const locale = props.locale || "es";
  const datepickerFormat = ((_b = (_a = props.languages) == null ? void 0 : _a[locale]) == null ? void 0 : _b[6]) || "dd/MM/yyyy";
  const isManualFiltering = typeof SearchFieldChanged === "function" && !queryParams.hasOwnProperty("page");
  const translatedColumns = columns.map((col) => {
    var _a2;
    return {
      ...col,
      translatedLabel: __(col.label),
      translatedPlaceholder: col.placeholder ? __(col.placeholder) : "",
      translatedOptions: ((_a2 = col.options) == null ? void 0 : _a2.map((opt) => ({
        value: opt.value,
        label: opt.label
      }))) || []
    };
  });
  const [dateRanges, setDateRanges] = useState(() => {
    const initial = {};
    columns.forEach((col) => {
      if (col.filter === "date" && Array.isArray(col.dateKeys) && col.dateKeys.length === 2) {
        initial[col.key] = [
          queryParams[col.dateKeys[0]] ? new Date(queryParams[col.dateKeys[0]]) : null,
          queryParams[col.dateKeys[1]] ? new Date(queryParams[col.dateKeys[1]]) : null
        ];
      }
    });
    return initial;
  });
  const [textValues, setTextValues] = useState(() => {
    const initialValues = {};
    columns.forEach((col) => {
      if (col.filter === "text") {
        initialValues[col.key] = queryParams[col.key] || "";
      }
    });
    return initialValues;
  });
  useEffect(() => {
    const newRanges = {};
    const updatedTextValues = {};
    columns.forEach((col) => {
      if (col.filter === "date" && Array.isArray(col.dateKeys) && col.dateKeys.length === 2) {
        newRanges[col.key] = [
          queryParams[col.dateKeys[0]] ? new Date(queryParams[col.dateKeys[0]]) : null,
          queryParams[col.dateKeys[1]] ? new Date(queryParams[col.dateKeys[1]]) : null
        ];
      }
      if (col.filter === "text") {
        const newValue = queryParams[col.key] || "";
        updatedTextValues[col.key] = newValue;
      }
    });
    setDateRanges(newRanges);
    setTextValues((prev) => {
      const next = { ...prev };
      for (const key in updatedTextValues) {
        if (updatedTextValues[key] !== prev[key]) {
          next[key] = updatedTextValues[key];
        }
      }
      return next;
    });
  }, [JSON.stringify(queryParams)]);
  const handleDateChange = (colKey, dateKeys, update) => {
    const [start, end] = update;
    setDateRanges((prev) => ({
      ...prev,
      [colKey]: [start, end]
    }));
    if (start && end) {
      const filters = {
        [dateKeys[0]]: start.toISOString().split("T")[0],
        [dateKeys[1]]: end.toISOString().split("T")[0]
      };
      const updatedParams = {
        ...queryParams,
        ...filters,
        page: 1
      };
      router.get(route(indexRoute, indexParams), updatedParams, {
        preserveState: true,
        replace: true
      });
    }
  };
  const clearDateFilter = (colKey, dateKeys) => {
    const updatedParams = { ...queryParams };
    delete updatedParams[dateKeys[0]];
    delete updatedParams[dateKeys[1]];
    updatedParams.page = 1;
    setDateRanges((prev) => ({
      ...prev,
      [colKey]: [null, null]
    }));
    router.get(route(indexRoute, indexParams), updatedParams, {
      preserveState: true,
      replace: true
    });
  };
  const handleKeyPress = (name) => (e) => {
    if (e.key === "Enter") {
      SearchFieldChanged(name, e.target.value.trim());
    }
  };
  return /* @__PURE__ */ jsx("thead", { className: "tbl-filters", children: /* @__PURE__ */ jsxs("tr", { className: "text-nowrap", children: [
    translatedColumns.map((col) => {
      var _a2, _b2;
      const localValue = textValues[col.key] || "";
      return /* @__PURE__ */ jsx("th", { className: visibleColumns.includes(col.key) ? "" : "d-none", children: /* @__PURE__ */ jsxs("div", { className: "input-group", children: [
        col.filter === "text" && /* @__PURE__ */ jsx(
          TextInput,
          {
            className: "form-control-sm input-rounded input-rounded-sm",
            value: localValue,
            placeholder: col.translatedPlaceholder,
            onChange: (e) => {
              const newValue = e.target.value;
              setTextValues((prev) => ({
                ...prev,
                [col.key]: newValue
              }));
              if (!isManualFiltering) {
                SearchFieldChanged(col.key, newValue.trim());
              }
            },
            onBlur: () => {
              if (isManualFiltering) {
                SearchFieldChanged(col.key, localValue.trim());
              }
            },
            onKeyPress: handleKeyPress(col.key),
            type: "search"
          }
        ),
        col.filter === "select" && Array.isArray(col.translatedOptions) && /* @__PURE__ */ jsxs(
          SelectInput,
          {
            className: "select-rounded select-rounded-sm",
            value: queryParams[col.key] || "",
            onChange: (e) => SearchFieldChanged(col.key, e.target.value),
            children: [
              /* @__PURE__ */ jsx("option", { value: "", children: txt_opcion_selec }),
              col.translatedOptions.map((option) => /* @__PURE__ */ jsx("option", { value: option.value, children: option.label }, option.value))
            ]
          }
        ),
        col.filter === "date" && Array.isArray(col.dateKeys) && col.dateKeys.length === 2 && /* @__PURE__ */ jsx(
          DatePicker,
          {
            selectsRange: true,
            startDate: ((_a2 = dateRanges[col.key]) == null ? void 0 : _a2[0]) || null,
            endDate: ((_b2 = dateRanges[col.key]) == null ? void 0 : _b2[1]) || null,
            onChange: (update) => handleDateChange(col.key, col.dateKeys, update),
            selected: null,
            dateFormat: datepickerFormat,
            locale: locales[locale] || locales["es"],
            placeholderText: txt_fechas_selec,
            className: "form-control form-control-sm input-rounded input-rounded-sm",
            showMonthDropdown: true,
            showYearDropdown: true,
            dropdownMode: "select",
            minDate: new Date(2010, 0, 1),
            maxDate: addYears(/* @__PURE__ */ new Date(), 5),
            yearDropdownItemNumber: 10,
            preventOpenOnFocus: true
          }
        ),
        col.filter !== "date" && !!(localValue && localValue.toString().trim()) && /* @__PURE__ */ jsx(
          "button",
          {
            className: "clean-filter",
            onClick: () => {
              setTextValues((prev) => ({
                ...prev,
                [col.key]: ""
              }));
              SearchFieldChanged(col.key, "");
            },
            children: /* @__PURE__ */ jsx("i", { className: "lar la-times-circle" })
          }
        ),
        col.filter === "date" && Array.isArray(col.dateKeys) && ((queryParams[col.dateKeys[0]] || queryParams[col.dateKeys[1]]) && /* @__PURE__ */ jsx(
          "button",
          {
            className: "clean-filter",
            onClick: () => clearDateFilter(col.key, col.dateKeys),
            children: /* @__PURE__ */ jsx("i", { className: "lar la-times-circle" })
          }
        ))
      ] }) }, col.key);
    }),
    /* @__PURE__ */ jsx("th", {})
  ] }) });
}
function Pagination({ links = [], totalRecords = 0, currentPage = 1, perPage = 10, onPageChange }) {
  const __ = useTranslation();
  const startRecord = (currentPage - 1) * perPage + 1;
  const endRecord = Math.min(currentPage * perPage, totalRecords);
  const handleClick = (e, url, label) => {
    e.preventDefault();
    if (!url || !onPageChange) return;
    const urlObj = new URL(url, window.location.origin);
    const page = urlObj.searchParams.get("page");
    if (page) {
      onPageChange(Number(page));
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "row mt-4", id: "pagination", children: [
    /* @__PURE__ */ jsxs("div", { className: "col-lg-4 mb-4", children: [
      __("registros"),
      " ",
      startRecord,
      " - ",
      endRecord,
      " ",
      __("de"),
      " ",
      totalRecords
    ] }),
    /* @__PURE__ */ jsx("div", { className: "col-lg-8 text-start text-lg-end", children: links.map((link, index) => /* @__PURE__ */ jsx(
      Link,
      {
        href: link.url || "",
        preserveScroll: true,
        className: "btn btn-sm mx-1 mb-1 " + (link.active ? "btn-secondary" : "btn-info") + (!link.url ? " disabled" : ""),
        onClick: (e) => handleClick(e, link.url, link.label),
        dangerouslySetInnerHTML: { __html: link.label }
      },
      `${link.label}-${index}`
    )) })
  ] });
}
function RecordsPerPage({ perPage, setPerPage }) {
  const __ = useTranslation();
  const options = [10, 25, 50, 100];
  const [isOpen, setIsOpen] = useState(false);
  const toggleDropdown = () => setIsOpen((prev) => !prev);
  const handleSelect = (value) => {
    setPerPage(Number(value));
    setIsOpen(false);
  };
  return /* @__PURE__ */ jsxs("div", { className: "column-filter position-relative d-inline-flex align-items-center ms-auto", id: "componentRecordsPerPage", children: [
    /* @__PURE__ */ jsx("label", { className: "me-1", style: { paddingTop: "3px" }, children: __("mostrar") }),
    /* @__PURE__ */ jsxs("div", { className: "position-relative", style: { display: "flex", alignItems: "center" }, children: [
      /* @__PURE__ */ jsx("button", { className: "btn btn-light dropdown-toggle", onClick: toggleDropdown, children: perPage }),
      isOpen && /* @__PURE__ */ jsx("ul", { className: "dropdown-menu show position-absolute", style: { top: "30px" }, children: options.map((value) => /* @__PURE__ */ jsx("li", { className: "dropdown-item", onClick: () => handleSelect(value), children: value }, value)) })
    ] }),
    /* @__PURE__ */ jsx("label", { className: "ms-1", style: { paddingTop: "3px" }, children: __("registros") })
  ] });
}
function SortControl({
  name,
  sortable = true,
  sort_field = null,
  sort_direction = null,
  sortChanged = () => {
  },
  children
}) {
  const handleSortChange = () => {
    if (sortable) {
      sortChanged(name);
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "d-inline-block float-end", onClick: handleSortChange, children: /* @__PURE__ */ jsx("span", { className: "float-end cursor-pointer", children: sort_field === name && sort_direction === "asc" ? /* @__PURE__ */ jsx("i", { className: "la la-sort-alpha-down" }) : sort_field === name && sort_direction === "desc" ? /* @__PURE__ */ jsx("i", { className: "la la-sort-alpha-up-alt" }) : /* @__PURE__ */ jsx("i", { className: "la la-sort" }) }) });
}
function useTableManagement({
  table,
  allColumnKeys = [],
  entityName,
  indexRoute = null,
  destroyRoute,
  filteredDataRoute,
  filteredDataKey = null,
  // << NUEVO: clave del JSON con las filas (p.ej. 'relations', 'companies', 'users')
  labelName,
  defaultSortField = "name",
  queryParams: initialQueryParams,
  routeParams = [],
  onDeleted,
  manualFiltering = false,
  onManualFilter = null
}) {
  var _a, _b;
  const queryParams = typeof initialQueryParams === "object" && initialQueryParams !== null ? initialQueryParams : {};
  const __ = useTranslation();
  const props = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  const { showConfirm } = useSweetAlert();
  const permissions = props.permissions || {};
  const savedPrefs = (_b = props.columnPreferences) == null ? void 0 : _b[table];
  const initialVisible = Array.isArray(savedPrefs) && savedPrefs.length ? savedPrefs : allColumnKeys;
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
      router.get(
        route(getRouteName(indexRoute), getRouteParams(indexRoute)),
        updatedParams,
        { preserveState: true, replace: true }
      );
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
      router.get(
        route(getRouteName(indexRoute), getRouteParams(indexRoute)),
        {
          ...queryParams,
          sort_field: name,
          sort_direction: newDirection,
          page: 1,
          per_page: perPage
        },
        { preserveState: true }
      );
    }
  };
  useEffect(() => {
    if (!manualFiltering && indexRoute && parseInt(queryParams.per_page) !== parseInt(perPage)) {
      router.get(
        route(getRouteName(indexRoute), getRouteParams(indexRoute)),
        { ...queryParams, per_page: perPage, page: 1 },
        { preserveState: true }
      );
    }
  }, [perPage]);
  const jsonEntityName = entityName.includes("-") ? entityName.replace(/-/g, "_") : entityName;
  const extractRows = (payload) => {
    if (filteredDataKey && payload && Object.prototype.hasOwnProperty.call(payload, filteredDataKey)) {
      const maybe = payload[filteredDataKey];
      return Array.isArray(maybe) ? maybe : Array.isArray(maybe == null ? void 0 : maybe.data) ? maybe.data : [];
    }
    if (payload && Object.prototype.hasOwnProperty.call(payload, jsonEntityName)) {
      const maybe = payload[jsonEntityName];
      return Array.isArray(maybe) ? maybe : Array.isArray(maybe == null ? void 0 : maybe.data) ? maybe.data : [];
    }
    if (payload && typeof payload === "object") {
      const firstArray = Object.values(payload).find((v) => Array.isArray(v));
      if (Array.isArray(firstArray)) return firstArray;
      if (Array.isArray(payload.data)) return payload.data;
    }
    if (Array.isArray(payload)) return payload;
    return [];
  };
  const filteredData = async (params = null) => {
    try {
      const response = await axios.get(
        route(filteredDataRoute, getRouteParams(filteredDataRoute)),
        { params: params || queryParams, headers: { Accept: "application/json" } }
      );
      return extractRows(response.data);
    } catch (error) {
      console.error(__("data_error"), error);
      return [];
    }
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
    queryParams: localQueryParams
  };
}
export {
  ColumnFilter as C,
  FilterRow as F,
  Pagination as P,
  RecordsPerPage as R,
  SortControl as S,
  useTableManagement as u
};
