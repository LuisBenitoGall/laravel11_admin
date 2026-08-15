import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { Link } from "@inertiajs/react";
import { Table, OverlayTrigger, Tooltip } from "react-bootstrap";
import { C as ColumnFilter, R as RecordsPerPage, S as SortControl, F as FilterRow, P as Pagination } from "./SortControl-B-edZX2D.js";
import { T as TableExporter } from "./TableExporter-ozLWJjAM.js";
import "sweetalert2";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import { u as useTableManagement } from "./useTableManagement-UWRr8jtd.js";
import "react-datepicker";
import "date-fns";
import "date-fns/locale";
import "./SelectInput-BpRRLwUE.js";
import "./TextInput-CzxrbIpp.js";
import "axios";
import "./useSweetAlert-D4PAsWYN.js";
function FunctionalitiesTab({
  module_data,
  functionalities,
  refreshKey,
  queryParams: rawQueryParams = {},
  availableLocales,
  onDeleted
}) {
  var _a, _b, _c, _d;
  const queryParams = typeof rawQueryParams === "object" && rawQueryParams !== null ? rawQueryParams : {};
  const __ = useTranslation();
  const columns = [
    { key: "label", label: __("etiqueta"), sort: true, filter: "text", class_th: "", class_td: "", placeholder: __("etiqueta_filtrar") },
    { key: "name", label: __("funcionalidad"), sort: true, filter: "text", class_th: "", class_td: "", placeholder: __("funcionalidad_filtrar") }
  ];
  const {
    permissions,
    sortParams,
    perPage,
    setPerPage,
    visibleColumns,
    toggleColumnVisibility,
    SearchFieldChanged,
    sortChanged,
    filteredData
  } = useTableManagement({
    table: "tblFunctionalities",
    allColumnKeys: columns.map((col) => col.key),
    entityName: "functionalities",
    indexRoute: null,
    destroyRoute: "functionalities.destroy",
    filteredDataRoute: "functionalities.filtered-data",
    routeParams: { module_id: module_data.id },
    labelName: "funcionalidad",
    queryParams: { ...queryParams, module_id: module_data.id }
  });
  const [tableData, setTableData] = useState(() => {
    return {
      data: Array.isArray(functionalities == null ? void 0 : functionalities.data) ? functionalities.data : Array.isArray(functionalities) ? functionalities : [],
      meta: (functionalities == null ? void 0 : functionalities.meta) ?? {},
      links: (functionalities == null ? void 0 : functionalities.links) ?? []
    };
  });
  const refreshData = async () => {
    try {
      const response = await filteredData({ module_id: module_data.id });
      const newData = (response == null ? void 0 : response.functionalities) ?? (response == null ? void 0 : response.data) ?? response ?? [];
      setTableData({
        data: Array.isArray(newData) ? newData : [],
        meta: (response == null ? void 0 : response.meta) ?? {},
        links: (response == null ? void 0 : response.links) ?? []
      });
      if (typeof onDeleted === "function") {
        onDeleted();
      }
    } catch (error) {
      console.error("Error fetching functionalities:", error);
      setTableData({
        data: [],
        meta: {},
        links: []
      });
    }
  };
  useEffect(() => {
    refreshData();
  }, [refreshKey]);
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("div", { className: "row", children: /* @__PURE__ */ jsxs("div", { className: "controls d-flex align-items-center", children: [
      /* @__PURE__ */ jsx(ColumnFilter, { columns, visibleColumns, toggleColumn: toggleColumnVisibility }),
      /* @__PURE__ */ jsx(RecordsPerPage, { perPage, setPerPage }),
      /* @__PURE__ */ jsx(TableExporter, { filename: __("funcionalidades"), columns, fetchData: filteredData })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "table-responsive", children: /* @__PURE__ */ jsxs(Table, { className: "table table-nowrap table-striped align-middle mb-0", id: "tblCountries", children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
        columns.map((col) => /* @__PURE__ */ jsxs("th", { className: `${col.class_th ?? ""} ${visibleColumns.includes(col.key) ? "" : "d-none"}`.trim(), children: [
          __(col.label),
          col.sort && /* @__PURE__ */ jsx(
            SortControl,
            {
              name: col.key,
              sortable: true,
              sort_field: queryParams.sort_field,
              sort_direction: queryParams.sort_direction,
              sortChanged
            }
          )
        ] }, col.key)),
        /* @__PURE__ */ jsx("th", { className: "text-center", children: __("acciones") })
      ] }) }),
      /* @__PURE__ */ jsx(
        FilterRow,
        {
          columns,
          queryParams,
          visibleColumns,
          SearchFieldChanged
        }
      ),
      /* @__PURE__ */ jsx("tbody", { children: tableData.data.map((func) => /* @__PURE__ */ jsxs("tr", { children: [
        columns.map((col) => /* @__PURE__ */ jsx("td", { className: `${col.class_td ?? ""} ${visibleColumns.includes(col.key) ? "" : "d-none"}`.trim(), children: func[col.key] }, col.key)),
        /* @__PURE__ */ jsxs("td", { className: "text-end", children: [
          (permissions == null ? void 0 : permissions["modules.edit"]) && /* @__PURE__ */ jsx(
            OverlayTrigger,
            {
              placement: "top",
              overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", children: __("editar") }),
              children: /* @__PURE__ */ jsx(Link, { href: route("functionalities.edit", func.id), className: "btn btn-sm btn-info ms-1", children: /* @__PURE__ */ jsx("i", { className: "la la-edit" }) })
            },
            "edit-" + func.id
          ),
          (permissions == null ? void 0 : permissions["modules.edit"]) && /* @__PURE__ */ jsx(
            OverlayTrigger,
            {
              placement: "top",
              overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", children: __("eliminar") }),
              children: /* @__PURE__ */ jsx(
                Link,
                {
                  href: route("functionalities.destroy", func.id),
                  className: "btn btn-sm btn-danger ms-1",
                  title: __("eliminar"),
                  children: /* @__PURE__ */ jsx("i", { className: "la la-trash" })
                }
              )
            },
            "delete-" + func.id
          )
        ] })
      ] }, `func-${func.id}`)) })
    ] }) }),
    ((_a = tableData.meta) == null ? void 0 : _a.total) > 0 && /* @__PURE__ */ jsx(
      Pagination,
      {
        links: tableData.links || [],
        totalRecords: ((_b = tableData.meta) == null ? void 0 : _b.total) || 0,
        currentPage: ((_c = tableData.meta) == null ? void 0 : _c.current_page) || 1,
        perPage: ((_d = tableData.meta) == null ? void 0 : _d.per_page) || perPage,
        onPageChange: (page) => {
          ({
            ...queryParams,
            module_id: module_data.id,
            sort_field: sortParams.sort_field,
            sort_direction: sortParams.sort_direction
          });
          refreshData();
        }
      }
    )
  ] });
}
export {
  FunctionalitiesTab as default
};
