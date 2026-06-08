import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { usePage, Link } from "@inertiajs/react";
import { Table, OverlayTrigger, Tooltip } from "react-bootstrap";
import axios from "axios";
import { C as ColumnFilter, R as RecordsPerPage, S as SortControl, F as FilterRow, P as Pagination } from "./SortControl-B-edZX2D.js";
import { u as useSweetAlert } from "./useSweetAlert-D4PAsWYN.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import "react-datepicker";
import "date-fns";
import "date-fns/locale";
import "./SelectInput-BpRRLwUE.js";
import "./TextInput-CzxrbIpp.js";
import "sweetalert2";
function MarketingCampaignListsTab({
  campaign,
  queryParams: rawQueryParams = {},
  refreshKey = 0
}) {
  var _a, _b, _c, _d, _e;
  const __ = useTranslation();
  const pageProps = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  const permissions = pageProps.permissions || {};
  const { showConfirm } = useSweetAlert();
  const queryParams = typeof rawQueryParams === "object" && rawQueryParams !== null ? rawQueryParams : {};
  const columns = [
    { key: "name", label: __("nombre"), sort: true, filter: "text", placeholder: __("nombre") },
    { key: "members_count", label: __("miembros"), sort: true, filter: "", class_th: "text-center", class_td: "text-center" },
    { key: "status", label: __("estado"), sort: false, filter: "", class_th: "text-center", class_td: "text-center" },
    { key: "created_at", label: __("creado"), sort: true, filter: "" }
  ];
  const allColumnKeys = columns.map((c) => c.key);
  const savedPrefs = (_b = pageProps.columnPreferences) == null ? void 0 : _b["tblCampaignLists"];
  const [visibleColumns, setVisibleColumns] = useState(
    Array.isArray(savedPrefs) && savedPrefs.length ? savedPrefs : allColumnKeys
  );
  const toggleColumnVisibility = (key) => setVisibleColumns(
    (prev) => prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
  );
  const [sortParams, setSortParams] = useState({
    sort_field: queryParams.sort_field || "name",
    sort_direction: queryParams.sort_direction || "asc"
  });
  const [perPage, setPerPage] = useState(() => parseInt(queryParams.per_page) || 10);
  const [localParams, setLocalParams] = useState({ ...queryParams });
  const [tableData, setTableData] = useState({ data: [], meta: {}, links: [] });
  const [loading, setLoading] = useState(false);
  const fetchData = async (extraParams = {}) => {
    var _a2, _b2, _c2, _d2;
    if (!(campaign == null ? void 0 : campaign.id)) return;
    setLoading(true);
    try {
      const response = await axios.get(
        route("marketing-campaigns.lists.filtered-data", { campaign: campaign.id }),
        {
          params: { ...localParams, ...extraParams, per_page: perPage },
          headers: { Accept: "application/json" }
        }
      );
      setTableData({
        data: ((_a2 = response.data) == null ? void 0 : _a2.data) ?? [],
        meta: ((_b2 = response.data) == null ? void 0 : _b2.meta) ?? {},
        links: ((_d2 = (_c2 = response.data) == null ? void 0 : _c2.meta) == null ? void 0 : _d2.links) ?? []
      });
    } catch (e) {
      console.error("Error fetching campaign lists:", e);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, [campaign == null ? void 0 : campaign.id, refreshKey]);
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
    const direction = sortParams.sort_field === field && sortParams.sort_direction === "asc" ? "desc" : "asc";
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
      title: __("lista_desvincular"),
      text: __("lista_desvincular_confirm"),
      icon: "warning",
      onConfirm: async () => {
        try {
          await axios.delete(
            route("marketing-campaigns.lists.detach", {
              campaign: campaign.id,
              list: list.id
            }),
            { headers: { Accept: "application/json" } }
          );
          fetchData();
        } catch (e) {
          console.error("Error desvinculando lista:", e);
        }
      }
    });
  };
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("div", { className: "row mb-2", children: /* @__PURE__ */ jsxs("div", { className: "controls d-flex align-items-center", children: [
      /* @__PURE__ */ jsx(
        ColumnFilter,
        {
          columns,
          visibleColumns,
          toggleColumn: toggleColumnVisibility
        }
      ),
      /* @__PURE__ */ jsx(RecordsPerPage, { perPage, setPerPage: handlePerPageChange })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "table-responsive", children: /* @__PURE__ */ jsxs(Table, { className: "table table-nowrap table-striped align-middle mb-0", children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
        columns.map((col) => /* @__PURE__ */ jsxs(
          "th",
          {
            className: `${col.class_th ?? ""} ${visibleColumns.includes(col.key) ? "" : "d-none"}`.trim(),
            children: [
              col.label,
              col.sort && /* @__PURE__ */ jsx(
                SortControl,
                {
                  name: col.key,
                  sortable: true,
                  sort_field: sortParams.sort_field,
                  sort_direction: sortParams.sort_direction,
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
          queryParams: localParams,
          visibleColumns,
          SearchFieldChanged
        }
      ),
      /* @__PURE__ */ jsxs("tbody", { children: [
        loading && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsxs("td", { colSpan: columns.length + 1, className: "text-center py-4", children: [
          /* @__PURE__ */ jsx("span", { className: "spinner-border spinner-border-sm me-2" }),
          __("cargando"),
          "..."
        ] }) }),
        !loading && tableData.data.length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: columns.length + 1, className: "text-center py-4 text-muted", children: __("sin_registros") }) }),
        !loading && tableData.data.map((list) => /* @__PURE__ */ jsxs("tr", { children: [
          columns.map((col) => /* @__PURE__ */ jsxs(
            "td",
            {
              className: `${col.class_td ?? ""} ${visibleColumns.includes(col.key) ? "" : "d-none"}`.trim(),
              children: [
                col.key === "name" && ((permissions == null ? void 0 : permissions["marketing-lists.edit"]) ? /* @__PURE__ */ jsx(Link, { href: route("marketing-lists.edit", list.id), children: list.name }) : list.name),
                col.key === "members_count" && (list.members_count || 0),
                col.key === "status" && /* @__PURE__ */ jsx("span", { className: `badge ${list.status == 1 ? "bg-success" : "bg-secondary"}`, children: list.status == 1 ? __("activa") : __("inactiva") }),
                col.key === "created_at" && list.created_at
              ]
            },
            col.key
          )),
          /* @__PURE__ */ jsxs("td", { className: "text-end", children: [
            (permissions == null ? void 0 : permissions["marketing-lists.edit"]) && /* @__PURE__ */ jsx(
              OverlayTrigger,
              {
                placement: "top",
                overlay: /* @__PURE__ */ jsx(Tooltip, { children: __("editar") }),
                children: /* @__PURE__ */ jsx(
                  Link,
                  {
                    href: route("marketing-lists.edit", list.id),
                    className: "btn btn-sm btn-info ms-1",
                    children: /* @__PURE__ */ jsx("i", { className: "la la-edit" })
                  }
                )
              }
            ),
            (permissions == null ? void 0 : permissions["marketing-campaigns.edit"]) && /* @__PURE__ */ jsx(
              OverlayTrigger,
              {
                placement: "top",
                overlay: /* @__PURE__ */ jsx(Tooltip, { children: __("desvincular") }),
                children: /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    className: "btn btn-sm btn-warning ms-1",
                    onClick: () => handleDetach(list),
                    children: /* @__PURE__ */ jsx("i", { className: "la la-unlink" })
                  }
                )
              }
            )
          ] })
        ] }, `list-${list.id}`))
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(
      Pagination,
      {
        links: tableData.links || [],
        totalRecords: ((_c = tableData.meta) == null ? void 0 : _c.total) || 0,
        currentPage: ((_d = tableData.meta) == null ? void 0 : _d.current_page) || 1,
        perPage: ((_e = tableData.meta) == null ? void 0 : _e.per_page) || perPage,
        onPageChange: handlePageChange
      }
    )
  ] });
}
export {
  MarketingCampaignListsTab as default
};
