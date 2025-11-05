import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-Be6zbhrA.js";
import { Head, router } from "@inertiajs/react";
import "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
/* empty css                          */
import { u as useTableManagement, C as ColumnFilter, R as RecordsPerPage, S as SortControl, F as FilterRow, P as Pagination } from "./useTableManagement-B3k5rfcT.js";
import { S as StatusButton } from "./StatusButton-DPQw0QHC.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import "axios";
import "@inertiajs/inertia";
import "./Header-DmTv-HRw.js";
import "./TextInput-CzxrbIpp.js";
import "./useSweetAlert-D4PAsWYN.js";
import "sweetalert2";
import "./Sidebar-j3CEPiJG.js";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
import "react-datepicker";
import "date-fns";
import "date-fns/locale";
import "./SelectInput-DrqFt-OA.js";
function Index({ auth, session, title, subtitle, businessAreas, queryParams: rawQueryParams = {}, availableLocales }) {
  const queryParams = typeof rawQueryParams === "object" && rawQueryParams !== null ? rawQueryParams : {};
  const __ = useTranslation();
  const columns = [
    { key: "name", label: __("nombre"), sort: true, filter: "text", type: "link", link: "business-areas.edit", placeholder: __("nombre_filtrar") },
    { key: "created_at", label: __("fecha_alta"), sort: true, filter: "date", class_th: "text-center", class_td: "text-end", placeholder: __("fecha_alta"), dateKeys: ["date_from", "date_to"] }
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
    handleDelete
  } = useTableManagement({
    table: "tblBusinessAreas",
    allColumnKeys: columns.map((col) => col.key),
    entityName: "businessAreas",
    indexRoute: "business-areas.index",
    destroyRoute: "business-areas.destroy",
    filteredDataRoute: "business-areas.filtered-data",
    labelName: "area_negocio",
    queryParams
  });
  const actions = [];
  if (permissions == null ? void 0 : permissions["business-areas.create"]) {
    actions.push({ text: __("area_negocio_nueva"), icon: "la-plus", url: "business-areas.create", modal: false });
  }
  return /* @__PURE__ */ jsxs(AdminAuthenticated, { user: auth.user, title, subtitle, actions, children: [
    /* @__PURE__ */ jsx(Head, { title }),
    /* @__PURE__ */ jsxs("div", { className: "contents", children: [
      /* @__PURE__ */ jsx("div", { className: "row", children: /* @__PURE__ */ jsxs("div", { className: "controls d-flex align-items-center", children: [
        /* @__PURE__ */ jsx(ColumnFilter, { columns, visibleColumns, toggleColumn: toggleColumnVisibility }),
        /* @__PURE__ */ jsx(RecordsPerPage, { perPage, setPerPage })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "table-responsive", children: /* @__PURE__ */ jsxs("table", { className: "table table-nowrap table-striped align-middle mb-0", id: "tblBusinessAreas", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
          columns.map((col) => /* @__PURE__ */ jsxs("th", { className: `${col.class_th ?? ""} ${visibleColumns.includes(col.key) ? "" : "d-none"}`.trim(), children: [
            __(col.label),
            col.sort && /* @__PURE__ */ jsx(SortControl, { name: col.key, sortable: true, sort_field: queryParams.sort_field, sort_direction: queryParams.sort_direction, sortChanged })
          ] }, col.key)),
          /* @__PURE__ */ jsx("th", { className: "text-center", children: __("acciones") })
        ] }) }),
        /* @__PURE__ */ jsx(FilterRow, { columns, queryParams, visibleColumns, SearchFieldChanged }),
        /* @__PURE__ */ jsx("tbody", { children: businessAreas.data.map((area) => /* @__PURE__ */ jsxs("tr", { children: [
          columns.map((col) => /* @__PURE__ */ jsx("td", { className: `${col.class_td ?? ""} ${visibleColumns.includes(col.key) ? "" : "d-none"}`.trim(), children: col.type === "link" && col.key !== "name" ? /* @__PURE__ */ jsx("a", { href: route(col.link, area.id), children: area[col.key] }) : area[col.key] }, col.key)),
          /* @__PURE__ */ jsxs("td", { className: "text-end", children: [
            (permissions == null ? void 0 : permissions["business-areas.edit"]) && /* @__PURE__ */ jsx(
              OverlayTrigger,
              {
                placement: "top",
                overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", children: area.status == 1 ? __("centro_activo") : __("centro_inactivo") }),
                children: /* @__PURE__ */ jsx(
                  StatusButton,
                  {
                    status: area.status,
                    id: area.id,
                    updateRoute: "business-areas.status",
                    reloadUrl: route("business-areas.index"),
                    reloadResource: "business-areas"
                  }
                )
              },
              "status-" + area.id
            ),
            (permissions == null ? void 0 : permissions["business-areas.edit"]) && /* @__PURE__ */ jsx("a", { href: route("business-areas.edit", area.id), className: "btn btn-sm btn-info ms-1", children: /* @__PURE__ */ jsx("i", { className: "la la-edit" }) }),
            (permissions == null ? void 0 : permissions["business-areas.destroy"]) && /* @__PURE__ */ jsx("button", { type: "button", className: "btn btn-sm btn-danger ms-1", onClick: () => handleDelete(area.id), children: /* @__PURE__ */ jsx("i", { className: "la la-trash" }) })
          ] })
        ] }, "area-" + area.id)) })
      ] }) }),
      /* @__PURE__ */ jsx(Pagination, { links: businessAreas.meta.links, totalRecords: businessAreas.meta.total, currentPage: businessAreas.meta.current_page, perPage: businessAreas.meta.per_page, onPageChange: (page) => {
        router.get(route("business-areas.index"), { ...queryParams, page, per_page: perPage, sort_field: sortParams.sort_field, sort_direction: sortParams.sort_direction }, { preserveState: true });
      } })
    ] })
  ] });
}
export {
  Index as default
};
