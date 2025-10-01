import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-DxQfZ-Jg.js";
import { Head, Link, router } from "@inertiajs/react";
import "react";
import { Table, OverlayTrigger, Tooltip } from "react-bootstrap";
import { u as useTableManagement, C as ColumnFilter, R as RecordsPerPage, S as SortControl, F as FilterRow, P as Pagination } from "./useTableManagement-DGNlCh_d.js";
import { S as StatusButton } from "./StatusButton-DPQw0QHC.js";
import { T as TableExporter } from "./TableExporter-BjSebGA-.js";
import "sweetalert2";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import { r as renderCellContent } from "./renderCellContent-DpTRqVoZ.js";
import "axios";
import "@inertiajs/inertia";
import "./Header-BI4rRLdV.js";
import "./TextInput-p9mIVJQL.js";
import "./useSweetAlert-D4PAsWYN.js";
import "./Sidebar-CtyD8dde.js";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
import "react-datepicker";
import "date-fns";
import "date-fns/locale";
import "./SelectInput-DrqFt-OA.js";
import "jspdf";
import "jspdf-autotable";
import "exceljs";
import "file-saver";
function Index({ auth, session, title, subtitle, modules, levels, queryParams: rawQueryParams = null, availableLocales }) {
  const queryParams = typeof rawQueryParams === "object" && rawQueryParams !== null ? rawQueryParams : {};
  const __ = useTranslation();
  const levelsArray = Object.entries(levels || {}).map(([key, value]) => ({
    value: key,
    label: value
  }));
  const columns = [
    { key: "label", label: __("modulo"), sort: true, filter: "text", type: "link", link: "modules.edit", class_th: "", class_td: "", placeholder: __("modulo_filtrar") },
    { key: "level", label: __("nivel"), sort: true, filter: "select", options: levelsArray, class_th: "", class_td: "", placeholder: __("nivel_filtrar") },
    { key: "icon", label: __("icono"), sort: false, filter: "", type: "html", class_th: "text-center", class_td: "text-center", dateKeys: ["date_from", "date_to"], export: "html" },
    { key: "color", label: __("color"), sort: false, filter: "", type: "html", class_th: "text-center", class_td: "text-center", export: "html" }
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
    table: "tblModules",
    allColumnKeys: columns.map((col) => col.key),
    entityName: "modules",
    indexRoute: "modules.index",
    destroyRoute: "modules.destroy",
    filteredDataRoute: "modules.filtered-data",
    labelName: "modulo",
    queryParams
  });
  const actions = [];
  if (permissions == null ? void 0 : permissions["modules.create"]) {
    actions.push({
      text: __("modulo_nuevo"),
      icon: "la-plus",
      url: "modules.create",
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
          /* @__PURE__ */ jsx("div", { className: "row", children: /* @__PURE__ */ jsxs("div", { className: "controls d-flex align-items-center", children: [
            /* @__PURE__ */ jsx(ColumnFilter, { columns, visibleColumns, toggleColumn: toggleColumnVisibility }),
            /* @__PURE__ */ jsx(RecordsPerPage, { perPage, setPerPage }),
            /* @__PURE__ */ jsx(TableExporter, { filename: __("modulos"), columns, fetchData: filteredData })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "table-responsive", children: /* @__PURE__ */ jsxs(Table, { className: "table table-nowrap table-striped align-middle mb-0", id: "tblModules", children: [
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
            /* @__PURE__ */ jsx("tbody", { children: modules.data.map((module) => /* @__PURE__ */ jsxs("tr", { children: [
              columns.map((col) => /* @__PURE__ */ jsx("td", { className: `${col.class_td ?? ""} ${visibleColumns.includes(col.key) ? "" : "d-none"}`.trim(), children: renderCellContent(module[col.key], col, module) }, col.key)),
              /* @__PURE__ */ jsxs("td", { className: "text-end", children: [
                (permissions == null ? void 0 : permissions["modules.edit"]) && /* @__PURE__ */ jsx(
                  OverlayTrigger,
                  {
                    placement: "top",
                    overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", children: module.status == 1 ? __("modulo_activo") : __("modulo_inactivo") }),
                    children: /* @__PURE__ */ jsx(
                      StatusButton,
                      {
                        status: module.status,
                        id: module.id,
                        updateRoute: "modules.status",
                        reloadUrl: route("modules.index"),
                        reloadResource: "modules"
                      }
                    )
                  },
                  "status-" + module.id
                ),
                (permissions == null ? void 0 : permissions["modules.edit"]) && /* @__PURE__ */ jsx(
                  OverlayTrigger,
                  {
                    placement: "top",
                    overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", children: __("editar") }),
                    children: /* @__PURE__ */ jsx(Link, { href: route("modules.edit", module.id), className: "btn btn-sm btn-info ms-1", children: /* @__PURE__ */ jsx("i", { className: "la la-edit" }) })
                  },
                  "edit-" + module.id
                ),
                (permissions == null ? void 0 : permissions["modules.destroy"]) && /* @__PURE__ */ jsx(
                  OverlayTrigger,
                  {
                    placement: "top",
                    overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", children: __("eliminar") }),
                    children: /* @__PURE__ */ jsx("span", { children: /* @__PURE__ */ jsx(
                      "button",
                      {
                        type: "button",
                        className: "btn btn-sm btn-danger ms-1",
                        onClick: () => handleDelete(module.id),
                        children: /* @__PURE__ */ jsx("i", { className: "la la-trash" })
                      }
                    ) })
                  },
                  "delete-" + module.id
                )
              ] })
            ] }, "module-" + module.id)) })
          ] }) }),
          /* @__PURE__ */ jsx(
            Pagination,
            {
              links: modules.meta.links,
              totalRecords: modules.meta.total,
              currentPage: modules.meta.current_page,
              perPage: modules.meta.per_page,
              onPageChange: (page) => {
                router.get(route("modules.index"), {
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
