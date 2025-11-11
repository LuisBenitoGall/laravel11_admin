import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-CS968Wx3.js";
import { Head, Link, router } from "@inertiajs/react";
import "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
/* empty css                          */
import { u as useTableManagement, C as ColumnFilter, R as RecordsPerPage, S as SortControl, F as FilterRow, P as Pagination } from "./useTableManagement-CA-wp9Fk.js";
import { S as StatusButton } from "./StatusButton-DPQw0QHC.js";
import "jspdf";
import "jspdf-autotable";
import "exceljs";
import "file-saver";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import { r as renderCellContent } from "./renderCellContent-Dpxbw8rL.js";
import "axios";
import "@inertiajs/inertia";
import "./Header-Px-6ZOXw.js";
import "./useSweetAlert-D4PAsWYN.js";
import "sweetalert2";
import "./Sidebar-CypaLfnr.js";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
import "./TextInput-CzxrbIpp.js";
import "react-datepicker";
import "date-fns";
import "date-fns/locale";
import "./SelectInput-DrqFt-OA.js";
function Index({ auth, session, title, subtitle, company, side, returnRoutes, costCenters, queryParams: rawQueryParams = {}, availableLocales }) {
  const queryParams = typeof rawQueryParams === "object" && rawQueryParams !== null ? rawQueryParams : {};
  const __ = useTranslation();
  const labelFromRoute = (rr, __2) => {
    if (rr == null ? void 0 : rr.label) return rr.label;
    if (String(rr == null ? void 0 : rr.name).includes("customers.edit")) return __2("cliente_volver");
    if (String(rr == null ? void 0 : rr.name).includes("providers.edit")) return __2("proveedor_volver");
    return __2("volver");
  };
  const columns = [
    { key: "name", label: __("nombre"), sort: true, filter: "text", type: "text", placeholder: __("nombre_filtrar") },
    { key: "code", label: __("codigo"), sort: true, filter: "text", type: "text", placeholder: __("codigo_filtrar") },
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
    table: "tblCostCenters",
    allColumnKeys: columns.map((col) => col.key),
    entityName: "costCenters",
    indexRoute: "cost-centers.index",
    destroyRoute: "cost-centers.destroy",
    filteredDataRoute: "cost-centers.filtered-data",
    routeParams: [company == null ? void 0 : company.id],
    labelName: "centro_coste",
    queryParams
  });
  const actions = [];
  returnRoutes.forEach((rr) => {
    actions.push({
      text: labelFromRoute(rr, __),
      icon: "la-angle-left",
      url: rr.name,
      // p.ej. 'customers.edit' | 'providers.edit'
      params: rr.params ?? (company == null ? void 0 : company.id) ?? null,
      modal: false
    });
  });
  if (permissions == null ? void 0 : permissions["cost-centers.create"]) {
    actions.push({
      text: __("centro_coste_nuevo"),
      icon: "la-plus",
      url: "cost-centers.create",
      params: (company == null ? void 0 : company.id) ?? null,
      modal: false
    });
  }
  return /* @__PURE__ */ jsxs(
    AdminAuthenticated,
    {
      user: auth.user,
      title,
      subtitle,
      actions,
      children: [
        /* @__PURE__ */ jsx(Head, { title }),
        /* @__PURE__ */ jsxs("div", { className: "contents", children: [
          /* @__PURE__ */ jsxs("div", { className: "row", children: [
            /* @__PURE__ */ jsx("div", { className: "col-12", children: /* @__PURE__ */ jsxs("h2", { children: [
              __("centros_coste"),
              " ",
              /* @__PURE__ */ jsx("u", { children: company.name })
            ] }) }),
            /* @__PURE__ */ jsxs("div", { className: "controls d-flex align-items-center", children: [
              /* @__PURE__ */ jsx(ColumnFilter, { columns, visibleColumns, toggleColumn: toggleColumnVisibility }),
              /* @__PURE__ */ jsx(RecordsPerPage, { perPage, setPerPage })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "table-responsive", children: /* @__PURE__ */ jsxs("table", { className: "table table-nowrap table-striped align-middle mb-0", id: "tblCostCenters", children: [
            /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
              columns.map((col) => /* @__PURE__ */ jsxs("th", { className: `${col.class_th ?? ""} ${visibleColumns.includes(col.key) ? "" : "d-none"}`.trim(), children: [
                __(col.label),
                col.sort && /* @__PURE__ */ jsx(SortControl, { name: col.key, sortable: true, sort_field: queryParams.sort_field, sort_direction: queryParams.sort_direction, sortChanged })
              ] }, col.key)),
              /* @__PURE__ */ jsx("th", { className: "text-center", children: __("acciones") })
            ] }) }),
            /* @__PURE__ */ jsx(FilterRow, { columns, queryParams, visibleColumns, SearchFieldChanged }),
            /* @__PURE__ */ jsx("tbody", { children: costCenters.data.map((center) => (
              // <tr key={"center-"+center.id}>
              //     {columns.map(col => (
              //         <td key={col.key} className={`${col.class_td ?? ''} ${visibleColumns.includes(col.key) ? '' : 'd-none'}`.trim()}>
              //             {center[col.key]}
              //         </td>
              //     ))}
              /* @__PURE__ */ jsxs("tr", { children: [
                columns.map((col) => /* @__PURE__ */ jsx("td", { className: `${col.class_td ?? ""} ${visibleColumns.includes(col.key) ? "" : "d-none"}`.trim(), children: renderCellContent(center[col.key], col, center) }, col.key)),
                /* @__PURE__ */ jsxs("td", { className: "text-end", children: [
                  (permissions == null ? void 0 : permissions["cost-centers.edit"]) && /* @__PURE__ */ jsx(
                    OverlayTrigger,
                    {
                      placement: "top",
                      overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", children: center.status == 1 ? __("centro_activo") : __("centro_inactivo") }),
                      children: /* @__PURE__ */ jsx(
                        StatusButton,
                        {
                          status: center.status,
                          id: center.id,
                          updateRoute: "cost-centers.status",
                          reloadUrl: route("cost-centers.index"),
                          reloadResource: "cost-centers"
                        }
                      )
                    },
                    "status-" + center.id
                  ),
                  (permissions == null ? void 0 : permissions["cost-centers.edit"]) && /* @__PURE__ */ jsx(
                    OverlayTrigger,
                    {
                      placement: "top",
                      overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", children: __("editar") }),
                      children: /* @__PURE__ */ jsx(Link, { href: route("cost-centers.edit", center.id), className: "btn btn-sm btn-info ms-1", children: /* @__PURE__ */ jsx("i", { className: "la la-edit" }) })
                    },
                    "edit-" + center.id
                  ),
                  (permissions == null ? void 0 : permissions["cost-centers.destroy"]) && /* @__PURE__ */ jsx("button", { type: "button", className: "btn btn-sm btn-danger ms-1", onClick: () => handleDelete(center.id), children: /* @__PURE__ */ jsx("i", { className: "la la-trash" }) })
                ] })
              ] }, "center-" + center.id)
            )) })
          ] }) }),
          /* @__PURE__ */ jsx(Pagination, { links: costCenters.meta.links, totalRecords: costCenters.meta.total, currentPage: costCenters.meta.current_page, perPage: costCenters.meta.per_page, onPageChange: (page) => {
            router.get(route("cost-centers.index"), { ...queryParams, page, per_page: perPage, sort_field: sortParams.sort_field, sort_direction: sortParams.sort_direction }, { preserveState: true });
          } })
        ] })
      ]
    }
  );
}
export {
  Index as default
};
