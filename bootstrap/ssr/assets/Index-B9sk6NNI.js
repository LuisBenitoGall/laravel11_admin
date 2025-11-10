import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-DT2NIV1N.js";
import { Head, Link, router } from "@inertiajs/react";
import "react";
import { Table, OverlayTrigger, Tooltip } from "react-bootstrap";
/* empty css                          */
import { u as useTableManagement, C as ColumnFilter, R as RecordsPerPage, S as SortControl, F as FilterRow, P as Pagination } from "./useTableManagement-CA-wp9Fk.js";
import { S as StatusButton } from "./StatusButton-DPQw0QHC.js";
import { T as TableExporter } from "./TableExporter-BjSebGA-.js";
import "sweetalert2";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import { r as renderCellContent } from "./renderCellContent-Dpxbw8rL.js";
import "axios";
import "@inertiajs/inertia";
import "./Header-kwxCeG5H.js";
import "./useSweetAlert-D4PAsWYN.js";
import "./Sidebar-BV0-sS1Z.js";
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
function Index({ auth, session, title, subtitle, companies, queryParams: rawQueryParams = {}, availableLocales }) {
  const queryParams = typeof rawQueryParams === "object" && rawQueryParams !== null ? rawQueryParams : {};
  const __ = useTranslation();
  const columns = [
    { key: "name", label: __("razon_social"), sort: true, filter: "text", type: "link", link: "companies.edit", class_th: "", class_td: "", placeholder: __("razon_social_filtrar") },
    { key: "tradename", label: __("nombre_comercial"), sort: true, filter: "text", class_th: "", class_td: "", placeholder: __("nombre_comercial_filtrar") },
    { key: "created_at", label: __("fecha_alta"), sort: true, filter: "date", class_th: "text-center", class_td: "text-end", placeholder: __("fecha_alta"), dateKeys: ["date_from", "date_to"] },
    { key: "nif", label: __("nif"), sort: true, filter: "text", class_th: "", class_td: "", placeholder: __("nif_filtrar") },
    // { key: 'is_ute', label: __('ute'), sort: true, filter: 'select', options: [
    //     { value: '1', label: __('si') },
    //     { value: '0', label: __('no') }
    // ], class_th: 'text-center', class_td: 'text-center', placeholder: __('ute_filtrar') },
    { key: "logo", label: __("logo"), sort: false, filter: "", type: "image", icon: "building", class_th: "text-center", class_td: "text-center", placeholder: "" }
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
    table: "tblProviders",
    allColumnKeys: columns.map((col) => col.key),
    entityName: "providers",
    indexRoute: "providers.index",
    destroyRoute: "providers.destroy",
    filteredDataRoute: "providers.filtered-data",
    labelName: "proveedor",
    queryParams
  });
  const actions = [];
  if (permissions == null ? void 0 : permissions["providers.create"]) {
    actions.push({
      text: __("proveedor_nuevo"),
      icon: "la-plus",
      url: "providers.create",
      modal: false
    });
  }
  if (permissions == null ? void 0 : permissions["providers.create"]) {
    actions.push({
      text: __("proveedores_importar"),
      icon: "la-file-import",
      url: "providers.import",
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
            /* @__PURE__ */ jsx(TableExporter, { filename: __("proveedores"), columns, fetchData: filteredData })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "table-responsive", children: /* @__PURE__ */ jsxs(Table, { className: "table table-nowrap table-striped align-middle mb-0", id: "tblProviders", children: [
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
            /* @__PURE__ */ jsx("tbody", { children: companies.data.map((company) => /* @__PURE__ */ jsxs("tr", { children: [
              columns.map((col) => /* @__PURE__ */ jsx("td", { className: `${col.class_td ?? ""} ${visibleColumns.includes(col.key) ? "" : "d-none"}`.trim(), children: renderCellContent(company[col.key], col, company) }, col.key)),
              /* @__PURE__ */ jsxs("td", { className: "text-end", children: [
                (permissions == null ? void 0 : permissions["providers.edit"]) && /* @__PURE__ */ jsx(
                  OverlayTrigger,
                  {
                    placement: "top",
                    overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", children: company.status == 1 ? __("proveedor_activo") : __("proveedor_inactivo") }),
                    children: /* @__PURE__ */ jsx(
                      StatusButton,
                      {
                        status: company.status,
                        id: company.id,
                        updateRoute: "providers.status",
                        reloadUrl: route("providers.index"),
                        reloadResource: "providers"
                      }
                    )
                  },
                  "status-" + company.id
                ),
                (permissions == null ? void 0 : permissions["providers.edit"]) && /* @__PURE__ */ jsx(
                  OverlayTrigger,
                  {
                    placement: "top",
                    overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", children: __("editar") }),
                    children: /* @__PURE__ */ jsx(Link, { href: route("providers.edit", company.id), className: "btn btn-sm btn-info ms-1", children: /* @__PURE__ */ jsx("i", { className: "la la-edit" }) })
                  },
                  "edit-" + company.id
                ),
                (permissions == null ? void 0 : permissions["providers.destroy"]) && /* @__PURE__ */ jsx(
                  OverlayTrigger,
                  {
                    placement: "top",
                    overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", children: __("eliminar") }),
                    children: /* @__PURE__ */ jsx("span", { children: /* @__PURE__ */ jsx(
                      "button",
                      {
                        type: "button",
                        className: "btn btn-sm btn-danger ms-1",
                        onClick: () => handleDelete(company.id),
                        children: /* @__PURE__ */ jsx("i", { className: "la la-trash" })
                      }
                    ) })
                  },
                  "delete-" + company.id
                )
              ] })
            ] }, "company-" + company.id)) })
          ] }) }),
          /* @__PURE__ */ jsx(
            Pagination,
            {
              links: companies.meta.links,
              totalRecords: companies.meta.total,
              currentPage: companies.meta.current_page,
              perPage: companies.meta.per_page,
              onPageChange: (page) => {
                router.get(route("providers.index"), {
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
