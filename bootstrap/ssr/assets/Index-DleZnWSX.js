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
function Index({ auth, session, title, subtitle, countries, queryParams: rawQueryParams = {}, availableLocales }) {
  const queryParams = typeof rawQueryParams === "object" && rawQueryParams !== null ? rawQueryParams : {};
  const __ = useTranslation();
  const columns = [
    { key: "name", label: __("pais"), sort: true, filter: "text", class_th: "", class_td: "", placeholder: __("pais_filtrar") },
    { key: "code", label: __("codigo"), sort: true, filter: "text", class_th: "", class_td: "", placeholder: __("codigo_filtrar") },
    { key: "alfa2", label: __("Alfa 2"), sort: true, filter: "text", class_th: "text-center", class_td: "text-end", placeholder: __("filtrar_por") + " Alfa 2" },
    { key: "alfa3", label: __("Alfa 3"), sort: true, filter: "text", class_th: "text-center", class_td: "text-end", placeholder: __("filtrar_por") + " Alfa 3" },
    { key: "flag", label: __("bandera"), sort: false, filter: "", class_th: "text-center", class_td: "text-center" }
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
    table: "tblCountries",
    allColumnKeys: columns.map((col) => col.key),
    entityName: "countries",
    indexRoute: "countries.index",
    destroyRoute: "countries.delete",
    filteredDataRoute: "countries.filtered-data",
    labelName: "pais",
    queryParams
  });
  const actions = [];
  if (permissions == null ? void 0 : permissions["countries.create"]) {
    actions.push({
      text: __("pais_nuevo"),
      icon: "la-plus",
      url: "countries.create",
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
            /* @__PURE__ */ jsx(TableExporter, { filename: __("pais"), columns, fetchData: filteredData })
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
            /* @__PURE__ */ jsx("tbody", { children: countries.data.map((country) => /* @__PURE__ */ jsxs("tr", { children: [
              columns.map((col) => /* @__PURE__ */ jsx("td", { className: `${col.class_td ?? ""} ${visibleColumns.includes(col.key) ? "" : "d-none"}`.trim(), children: renderCellContent(country[col.key], col, country) }, col.key)),
              /* @__PURE__ */ jsxs("td", { className: "text-end", children: [
                (permissions == null ? void 0 : permissions["countries.edit"]) && /* @__PURE__ */ jsx(
                  OverlayTrigger,
                  {
                    placement: "top",
                    overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", children: country.status == 1 ? __("pais_activo") : __("pais_inactivo") }),
                    children: /* @__PURE__ */ jsx(
                      StatusButton,
                      {
                        status: country.status,
                        id: country.id,
                        updateRoute: "countries.status",
                        reloadUrl: route("countries.index"),
                        reloadResource: "countries"
                      }
                    )
                  },
                  "status-" + country.id
                ),
                (permissions == null ? void 0 : permissions["countries.edit"]) && /* @__PURE__ */ jsx(
                  OverlayTrigger,
                  {
                    placement: "top",
                    overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", children: __("provincias") }),
                    children: /* @__PURE__ */ jsx(Link, { href: route("provinces.index", country.id), className: "btn btn-sm btn-info ms-1", children: /* @__PURE__ */ jsx("i", { className: "la la-flag" }) })
                  },
                  "provinces-" + country.id
                ),
                (permissions == null ? void 0 : permissions["countries.edit"]) && /* @__PURE__ */ jsx(
                  OverlayTrigger,
                  {
                    placement: "top",
                    overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", children: __("editar") }),
                    children: /* @__PURE__ */ jsx(Link, { href: route("countries.edit", country.id), className: "btn btn-sm btn-info ms-1", children: /* @__PURE__ */ jsx("i", { className: "la la-edit" }) })
                  },
                  "edit-" + country.id
                ),
                (permissions == null ? void 0 : permissions["countries.destroy"]) && /* @__PURE__ */ jsx(
                  OverlayTrigger,
                  {
                    placement: "top",
                    overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", children: __("eliminar") }),
                    children: /* @__PURE__ */ jsx("span", { children: /* @__PURE__ */ jsx(
                      "button",
                      {
                        type: "button",
                        className: "btn btn-sm btn-danger ms-1",
                        onClick: () => handleDelete(country.id),
                        children: /* @__PURE__ */ jsx("i", { className: "la la-trash" })
                      }
                    ) })
                  },
                  "delete-" + country.id
                )
              ] })
            ] }, "country-" + country.id)) })
          ] }) }),
          /* @__PURE__ */ jsx(
            Pagination,
            {
              links: countries.meta.links,
              totalRecords: countries.meta.total,
              currentPage: countries.meta.current_page,
              perPage: countries.meta.per_page,
              onPageChange: (page) => {
                router.get(route("countries.index"), {
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
