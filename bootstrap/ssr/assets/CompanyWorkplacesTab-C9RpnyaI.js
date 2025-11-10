import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useCallback, useMemo, useEffect } from "react";
import { Head, usePage } from "@inertiajs/react";
import axios from "axios";
import { Table, OverlayTrigger, Tooltip } from "react-bootstrap";
import { u as useTableManagement, C as ColumnFilter, R as RecordsPerPage, S as SortControl, F as FilterRow, P as Pagination } from "./useTableManagement-CA-wp9Fk.js";
import { T as TableExporter } from "./TableExporter-BjSebGA-.js";
import { S as StatusButton } from "./StatusButton-DPQw0QHC.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import { r as renderCellContent } from "./renderCellContent-Dpxbw8rL.js";
import "react-datepicker";
import "date-fns";
import "date-fns/locale";
import "./SelectInput-DrqFt-OA.js";
import "./TextInput-CzxrbIpp.js";
import "./useSweetAlert-D4PAsWYN.js";
import "sweetalert2";
import "jspdf";
import "jspdf-autotable";
import "exceljs";
import "file-saver";
function TableWorkplaces({
  company,
  // objeto company
  side = "customers",
  // 'customers' | 'providers'
  tableId = "tblWorkplaces",
  queryParams: rawQueryParams = {},
  columns: columnsProp = null,
  entityName = "workplaces",
  indexRoute = null,
  // 'customers.edit' | 'providers.edit' (solo para construir reloadUrl en acciones)
  indexParams = null,
  // id de la company
  destroyRoute = "workplaces.destroy",
  fetchRoute = "customers.workplaces.index",
  // endpoint que devuelve el listado paginado
  filteredDataRoute = "customers.workplaces.data",
  // endpoint para export
  filteredDataKey = "workplaces",
  labelName = "centros_trabajo",
  availableLocales = []
}) {
  const __ = useTranslation();
  const baseQuery = typeof rawQueryParams === "object" && rawQueryParams !== null ? rawQueryParams : {};
  const [rows, setRows] = useState([]);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const formatTownProvince = useCallback((row) => {
    var _a, _b, _c, _d;
    const townName = ((_a = row == null ? void 0 : row.town) == null ? void 0 : _a.name) ?? (row == null ? void 0 : row.town_name) ?? (row == null ? void 0 : row.town) ?? "";
    const provinceName = ((_c = (_b = row == null ? void 0 : row.town) == null ? void 0 : _b.province) == null ? void 0 : _c.name) ?? ((_d = row == null ? void 0 : row.province) == null ? void 0 : _d.name) ?? (row == null ? void 0 : row.province_name) ?? "";
    if (townName && provinceName) return `${townName} (${provinceName})`;
    return townName || provinceName || "";
  }, []);
  const defaultColumns = useMemo(() => [
    {
      key: "name",
      label: __("nombre"),
      sort: true,
      filter: "text",
      class_th: "",
      class_td: "",
      placeholder: __("nombre_filtrar")
    },
    {
      key: "address",
      label: __("direccion"),
      sort: true,
      filter: "text",
      class_th: "",
      class_td: "",
      placeholder: __("direccion_filtrar")
    },
    {
      key: "cp",
      label: __("cp"),
      sort: true,
      filter: "text",
      class_th: "text-center",
      class_td: "text-center",
      placeholder: __("cp_filtrar")
    },
    {
      key: "town_province",
      label: __("poblacion"),
      sort: true,
      // si tu backend soporta ordenación por join/compute
      filter: "text",
      class_th: "",
      class_td: "",
      placeholder: __("municipio_filtrar"),
      render: ({ rowData }) => formatTownProvince(rowData)
    },
    {
      key: "created_at",
      label: __("fecha_alta"),
      sort: true,
      filter: "date",
      class_th: "text-center",
      class_td: "text-end",
      placeholder: __("fecha_alta"),
      dateKeys: ["date_from", "date_to"]
    }
  ], [__, formatTownProvince]);
  const columns = Array.isArray(columnsProp) && columnsProp.length ? columnsProp : defaultColumns;
  const {
    sortParams,
    perPage,
    setPerPage,
    visibleColumns,
    toggleColumnVisibility,
    SearchFieldChanged,
    sortChanged,
    filteredData,
    // se usará para Exporter
    handleDelete,
    queryParams
    // params locales que va acumulando FilterRow
  } = useTableManagement({
    table: tableId,
    allColumnKeys: columns.map((col) => col.key),
    entityName,
    indexRoute: null,
    // no queremos navegación, todo es AJAX
    destroyRoute,
    filteredDataRoute,
    filteredDataKey,
    labelName,
    queryParams: baseQuery,
    routeParams: indexParams,
    manualFiltering: true,
    // << clave: evita router.get
    onManualFilter: (params) => {
      fetchList({
        ...params,
        sort_field: sortParams.sort_field,
        sort_direction: sortParams.sort_direction,
        per_page: perPage,
        page: 1
      });
    }
  });
  const fetchList = useCallback(async (params = {}) => {
    if (!(company == null ? void 0 : company.id)) return;
    setLoading(true);
    try {
      const { data } = await axios.get(
        route(fetchRoute, [company.id]),
        // workplaces/{company}
        { params }
      );
      const payload = (data == null ? void 0 : data[filteredDataKey]) ?? data;
      if (Array.isArray(payload == null ? void 0 : payload.data)) {
        setRows(payload.data);
        setMeta(payload.meta ?? null);
      } else if (Array.isArray(payload)) {
        setRows(payload);
        setMeta(null);
      } else if (Array.isArray(data == null ? void 0 : data.data)) {
        setRows(data.data);
        setMeta(data.meta ?? null);
      } else {
        setRows([]);
        setMeta(null);
      }
    } finally {
      setLoading(false);
    }
  }, [company == null ? void 0 : company.id, fetchRoute, filteredDataKey]);
  useEffect(() => {
    fetchList({
      ...baseQuery,
      page: 1,
      per_page: baseQuery.per_page || 10
    });
  }, [company == null ? void 0 : company.id, side]);
  useEffect(() => {
    fetchList({
      ...queryParams,
      sort_field: sortParams.sort_field,
      sort_direction: sortParams.sort_direction,
      per_page: perPage,
      page: 1
    });
  }, [sortParams.sort_field, sortParams.sort_direction]);
  useEffect(() => {
    fetchList({
      ...queryParams,
      sort_field: sortParams.sort_field,
      sort_direction: sortParams.sort_direction,
      per_page: perPage,
      page: 1
    });
  }, [perPage]);
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(Head, { title: __("centros_trabajo") }),
    /* @__PURE__ */ jsx("div", { className: "row", children: /* @__PURE__ */ jsxs("div", { className: "controls d-flex align-items-center", children: [
      /* @__PURE__ */ jsx(
        ColumnFilter,
        {
          columns,
          visibleColumns,
          toggleColumn: toggleColumnVisibility
        }
      ),
      /* @__PURE__ */ jsx(RecordsPerPage, { perPage, setPerPage }),
      /* @__PURE__ */ jsx(
        TableExporter,
        {
          filename: __(labelName),
          columns,
          fetchData: (params) => (
            // el exporter llama con params; pedimos al hook su util,
            // que ya apunta a filteredDataRoute y devolverá [] con la clave correcta
            filteredData(params)
          )
        }
      )
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "table-responsive", children: /* @__PURE__ */ jsxs(Table, { className: "table table-nowrap table-striped align-middle mb-0", id: tableId, children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
        columns.map((col) => /* @__PURE__ */ jsxs(
          "th",
          {
            className: `${col.class_th ?? ""} ${visibleColumns.includes(col.key) ? "" : "d-none"}`.trim(),
            children: [
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
            ]
          },
          col.key
        )),
        /* @__PURE__ */ jsx("th", { className: "text-center", children: __("acciones") })
      ] }) }),
      /* @__PURE__ */ jsx(
        FilterRow,
        {
          columns,
          queryParams,
          visibleColumns,
          SearchFieldChanged,
          indexRoute: null,
          indexParams: null
        }
      ),
      /* @__PURE__ */ jsxs("tbody", { children: [
        rows.map((wp) => /* @__PURE__ */ jsxs("tr", { children: [
          columns.map((col) => /* @__PURE__ */ jsx(
            "td",
            {
              className: `${col.class_td ?? ""} ${visibleColumns.includes(col.key) ? "" : "d-none"}`.trim(),
              children: renderCellContent(wp[col.key], col, wp)
            },
            col.key
          )),
          /* @__PURE__ */ jsxs("td", { className: "text-end", children: [
            /* @__PURE__ */ jsx(
              OverlayTrigger,
              {
                placement: "top",
                overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", children: wp.status == 1 ? __("activo") : __("inactivo") }),
                children: /* @__PURE__ */ jsx(
                  StatusButton,
                  {
                    status: wp.status,
                    id: wp.id,
                    updateRoute: `${entityName}.status`,
                    reloadUrl: indexRoute && indexParams ? route(indexRoute, indexParams) : void 0,
                    reloadResource: entityName,
                    onUpdated: () => {
                      fetchList({
                        ...queryParams,
                        sort_field: sortParams.sort_field,
                        sort_direction: sortParams.sort_direction,
                        per_page: perPage,
                        page: (meta == null ? void 0 : meta.current_page) || 1
                      });
                    }
                  }
                )
              },
              "status-" + wp.id
            ),
            /* @__PURE__ */ jsx(
              OverlayTrigger,
              {
                placement: "top",
                overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", children: __("editar") }),
                children: /* @__PURE__ */ jsx("a", { href: route(`${entityName}.edit`, wp.id), className: "btn btn-sm btn-info ms-1", children: /* @__PURE__ */ jsx("i", { className: "la la-edit" }) })
              },
              "edit-" + wp.id
            ),
            /* @__PURE__ */ jsx(
              OverlayTrigger,
              {
                placement: "top",
                overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", children: __("eliminar") }),
                children: /* @__PURE__ */ jsx(
                  "a",
                  {
                    href: route(`${entityName}.destroy`, wp.id),
                    className: "btn btn-sm btn-danger ms-1",
                    title: __("eliminar"),
                    onClick: (e) => {
                      e.preventDefault();
                      handleDelete(wp.id, () => {
                        fetchList({
                          ...queryParams,
                          sort_field: sortParams.sort_field,
                          sort_direction: sortParams.sort_direction,
                          per_page: perPage,
                          page: (meta == null ? void 0 : meta.current_page) || 1
                        });
                      });
                    },
                    children: /* @__PURE__ */ jsx("i", { className: "la la-trash" })
                  }
                )
              },
              "delete-" + wp.id
            )
          ] })
        ] }, wp.id)),
        !loading && rows.length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: columns.length + 1, className: "text-center py-4", children: __("sin_resultados") }) }),
        loading && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsxs("td", { colSpan: columns.length + 1, className: "text-center py-4", children: [
          __("cargando"),
          "…"
        ] }) })
      ] })
    ] }) }),
    meta && /* @__PURE__ */ jsx(
      Pagination,
      {
        links: meta.links,
        totalRecords: meta.total,
        currentPage: meta.current_page,
        perPage: meta.per_page,
        onPageChange: (page) => {
          fetchList({
            ...queryParams,
            sort_field: sortParams.sort_field,
            sort_direction: sortParams.sort_direction,
            per_page: perPage,
            page
          });
        }
      }
    )
  ] });
}
function CompanyWorkplacesTab({
  company,
  // objeto company completo
  side = "customers"
  // 'customers' | 'providers'
}) {
  var _a;
  useTranslation();
  const pageProps = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  return /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(
    TableWorkplaces,
    {
      company,
      side,
      tableId: "tblCompanyWorkplaces",
      entityName: "workplaces",
      indexRoute: side === "providers" ? "providers.edit" : "customers.edit",
      indexParams: company == null ? void 0 : company.id,
      fetchRoute: "workplaces.index",
      filteredDataRoute: "workplaces.filtered-data",
      filteredDataKey: "workplaces",
      labelName: "centros_trabajo",
      availableLocales: pageProps.availableLocales || [],
      queryParams: pageProps.queryParams || {}
    }
  ) });
}
export {
  CompanyWorkplacesTab as default
};
