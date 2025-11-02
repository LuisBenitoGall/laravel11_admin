import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-D8RSvDxD.js";
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
import "./Header-BDD-uIND.js";
import "./TextInput-p9mIVJQL.js";
import "./useSweetAlert-D4PAsWYN.js";
import "./Sidebar-BgmCyghN.js";
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
function Index({ auth, session, title, subtitle, units, levels, queryParams: rawQueryParams = null, availableLocales }) {
  const queryParams = typeof rawQueryParams === "object" && rawQueryParams !== null ? rawQueryParams : {};
  const __ = useTranslation();
  Object.entries(levels || {}).map(([key, value]) => ({
    value: key,
    label: value
  }));
  const columns = [
    { key: "name", label: __("unidad"), sort: true, filter: "text", type: "link", link: "units.edit", class_th: "", class_td: "", placeholder: __("unidad_filtrar") },
    { key: "symbol", label: __("simbolo"), sort: true, filter: "text", class_th: "", class_td: "", placeholder: __("simbolo_filtrar") }
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
    table: "tblUnits",
    allColumnKeys: columns.map((col) => col.key),
    entityName: "units",
    indexRoute: "units.index",
    destroyRoute: "units.destroy",
    filteredDataRoute: "units.filtered-data",
    labelName: "unidad",
    queryParams
  });
  const actions = [];
  if (permissions == null ? void 0 : permissions["units.create"]) {
    actions.push({
      text: __("unidad_nueva"),
      icon: "la-plus",
      url: "units.create",
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
          /* @__PURE__ */ jsx("div", { className: "row", children: /* @__PURE__ */ jsxs("div", { className: "controls d-flex align-items-center ms-auto", children: [
            /* @__PURE__ */ jsx(ColumnFilter, { columns, visibleColumns, toggleColumn: toggleColumnVisibility }),
            /* @__PURE__ */ jsx(RecordsPerPage, { perPage, setPerPage }),
            /* @__PURE__ */ jsx(TableExporter, { filename: __("unidades"), columns, fetchData: filteredData })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "table-responsive", children: /* @__PURE__ */ jsxs(Table, { className: "table table-nowrap table-striped align-middle mb-0", id: "tblUnits", children: [
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
            /* @__PURE__ */ jsx("tbody", { children: units.data.map((unit) => /* @__PURE__ */ jsxs("tr", { children: [
              columns.map((col) => /* @__PURE__ */ jsx("td", { className: `${col.class_td ?? ""} ${visibleColumns.includes(col.key) ? "" : "d-none"}`.trim(), children: renderCellContent(unit[col.key], col, unit) }, col.key)),
              /* @__PURE__ */ jsxs("td", { className: "text-end", children: [
                (permissions == null ? void 0 : permissions["units.edit"]) && /* @__PURE__ */ jsx(
                  OverlayTrigger,
                  {
                    placement: "top",
                    overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", children: unit.status == 1 ? __("unidad_activa") : __("unidad_inactiva") }),
                    children: /* @__PURE__ */ jsx(
                      StatusButton,
                      {
                        status: unit.status,
                        id: unit.id,
                        updateRoute: "units.status",
                        reloadUrl: route("units.index"),
                        reloadResource: "units"
                      }
                    )
                  },
                  "status-" + unit.id
                ),
                (permissions == null ? void 0 : permissions["units.edit"]) && /* @__PURE__ */ jsx(
                  OverlayTrigger,
                  {
                    placement: "top",
                    overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", children: __("editar") }),
                    children: /* @__PURE__ */ jsx(Link, { href: route("units.edit", unit.id), className: "btn btn-sm btn-info ms-1", children: /* @__PURE__ */ jsx("i", { className: "la la-edit" }) })
                  },
                  "edit-" + unit.id
                ),
                (permissions == null ? void 0 : permissions["units.destroy"]) && /* @__PURE__ */ jsx(
                  OverlayTrigger,
                  {
                    placement: "top",
                    overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", children: __("eliminar") }),
                    children: /* @__PURE__ */ jsx("span", { children: /* @__PURE__ */ jsx(
                      "button",
                      {
                        type: "button",
                        className: "btn btn-sm btn-danger ms-1",
                        onClick: () => handleDelete(unit.id),
                        children: /* @__PURE__ */ jsx("i", { className: "la la-trash" })
                      }
                    ) })
                  },
                  "delete-" + unit.id
                )
              ] })
            ] }, "unit-" + unit.id)) })
          ] }) }),
          /* @__PURE__ */ jsx(
            Pagination,
            {
              links: units.meta.links,
              totalRecords: units.meta.total,
              currentPage: units.meta.current_page,
              perPage: units.meta.per_page,
              onPageChange: (page) => {
                router.get(route("units.index"), {
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
