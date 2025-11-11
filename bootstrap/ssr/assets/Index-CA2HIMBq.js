import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-CS968Wx3.js";
import { Head, Link, router } from "@inertiajs/react";
import "react";
import { Table, OverlayTrigger, Tooltip } from "react-bootstrap";
/* empty css                          */
import { u as useTableManagement, C as ColumnFilter, R as RecordsPerPage, S as SortControl, F as FilterRow, P as Pagination } from "./useTableManagement-CA-wp9Fk.js";
import { S as StatusButton } from "./StatusButton-DPQw0QHC.js";
import { T as TableExporter } from "./TableExporter-BjSebGA-.js";
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
import "jspdf";
import "jspdf-autotable";
import "exceljs";
import "file-saver";
function Index({ auth, session, title, subtitle, company, side, returnRoutes, workplaces, queryParams: rawQueryParams = {}, availableLocales }) {
  const queryParams = typeof rawQueryParams === "object" && rawQueryParams !== null ? rawQueryParams : {};
  const __ = useTranslation();
  const labelFromRoute = (rr, __2) => {
    if (rr == null ? void 0 : rr.label) return rr.label;
    if (String(rr == null ? void 0 : rr.name).includes("customers.edit")) return __2("cliente_volver");
    if (String(rr == null ? void 0 : rr.name).includes("providers.edit")) return __2("proveedor_volver");
    return __2("volver");
  };
  const columns = [
    { key: "name", label: __("centro_trabajo"), sort: true, filter: "text", type: "link", link: "workplaces.edit", class_th: "", class_td: "", placeholder: __("centro_trabajo_filtrar") },
    { key: "town", label: __("poblacion"), sort: true, filter: "text", class_th: "", class_td: "", placeholder: __("poblacion_filtrar") },
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
    filteredData,
    handleDelete
  } = useTableManagement({
    table: "tblWorkplaces",
    allColumnKeys: columns.map((col) => col.key),
    entityName: "workplaces",
    indexRoute: "workplaces.index",
    destroyRoute: "workplaces.destroy",
    filteredDataRoute: "workplaces.filtered-data",
    routeParams: [company == null ? void 0 : company.id],
    labelName: "centro_trabajo",
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
  if (permissions == null ? void 0 : permissions["workplaces.create"]) {
    actions.push({
      text: __("centro_trabajo_nuevo"),
      icon: "la-plus",
      url: "workplaces.create",
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
              __("centros_trabajo"),
              " ",
              /* @__PURE__ */ jsx("u", { children: company.name })
            ] }) }),
            /* @__PURE__ */ jsxs("div", { className: "controls d-flex align-items-center", children: [
              /* @__PURE__ */ jsx(ColumnFilter, { columns, visibleColumns, toggleColumn: toggleColumnVisibility }),
              /* @__PURE__ */ jsx(RecordsPerPage, { perPage, setPerPage }),
              /* @__PURE__ */ jsx(TableExporter, { filename: __("centros_trabajo"), columns, fetchData: filteredData })
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "table-responsive", children: /* @__PURE__ */ jsxs(Table, { className: "table table-nowrap table-striped align-middle mb-0", id: "tblWorkplaces", children: [
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
            /* @__PURE__ */ jsx("tbody", { children: workplaces.data.map((workplace) => /* @__PURE__ */ jsxs("tr", { children: [
              columns.map((col) => /* @__PURE__ */ jsx("td", { className: `${col.class_td ?? ""} ${visibleColumns.includes(col.key) ? "" : "d-none"}`.trim(), children: renderCellContent(workplace[col.key], col, workplace) }, col.key)),
              /* @__PURE__ */ jsxs("td", { className: "text-end", children: [
                (permissions == null ? void 0 : permissions["workplaces.edit"]) && /* @__PURE__ */ jsx(
                  OverlayTrigger,
                  {
                    placement: "top",
                    overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", children: workplace.status == 1 ? __("centro_activo") : __("centro_inactivo") }),
                    children: /* @__PURE__ */ jsx(
                      StatusButton,
                      {
                        status: workplace.status,
                        id: workplace.id,
                        updateRoute: "workplaces.status",
                        reloadUrl: route("workplaces.index"),
                        reloadResource: "workplaces"
                      }
                    )
                  },
                  "status-" + workplace.id
                ),
                (permissions == null ? void 0 : permissions["workplaces.edit"]) && /* @__PURE__ */ jsx(
                  OverlayTrigger,
                  {
                    placement: "top",
                    overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", children: __("editar") }),
                    children: /* @__PURE__ */ jsx(Link, { href: route("workplaces.edit", workplace.id), className: "btn btn-sm btn-info ms-1", children: /* @__PURE__ */ jsx("i", { className: "la la-edit" }) })
                  },
                  "edit-" + workplace.id
                ),
                (permissions == null ? void 0 : permissions["workplaces.destroy"]) && /* @__PURE__ */ jsx(
                  OverlayTrigger,
                  {
                    placement: "top",
                    overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", children: __("eliminar") }),
                    children: /* @__PURE__ */ jsx("span", { children: /* @__PURE__ */ jsx(
                      "button",
                      {
                        type: "button",
                        className: "btn btn-sm btn-danger ms-1",
                        onClick: () => handleDelete(workplace.id),
                        children: /* @__PURE__ */ jsx("i", { className: "la la-trash" })
                      }
                    ) })
                  },
                  "delete-" + workplace.id
                )
              ] })
            ] }, "workplace-" + workplace.id)) })
          ] }) }),
          /* @__PURE__ */ jsx(
            Pagination,
            {
              links: workplaces.meta.links,
              totalRecords: workplaces.meta.total,
              currentPage: workplaces.meta.current_page,
              perPage: workplaces.meta.per_page,
              onPageChange: (page) => {
                router.get(route("workplaces.index"), {
                  ...queryParams,
                  page,
                  per_page: perPage,
                  sort_field: sortParams.sort_field,
                  sort_direction: sortParams.sort_direction
                }, { preserveState: true });
              }
            }
          )
        ] })
      ]
    }
  );
}
export {
  Index as default
};
