import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-BAKikn-7.js";
import { usePage, Head, Link, router } from "@inertiajs/react";
import "react";
import { Table, OverlayTrigger, Tooltip } from "react-bootstrap";
/* empty css                          */
import { u as useInertiaLoading, A as AdHocFiltersDropdown, a as ActiveFiltersLegend, S as SpinnerInline } from "./useInertiaLoading-B2dLlwmV.js";
import { u as useTableManagement, C as ColumnFilter, R as RecordsPerPage, S as SortControl, F as FilterRow, P as Pagination } from "./useTableManagement-_Ugox1d5.js";
import { S as StatusButton } from "./StatusButton-DfO41WfJ.js";
import { T as TableExporter } from "./TableExporter-RjBSwz2t.js";
import { u as useSweetAlert } from "./useSweetAlert-D4PAsWYN.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import { r as renderCellContent } from "./renderCellContent-DkxoXe9S.js";
import "@inertiajs/inertia";
import "./Header-BVvoXjVe.js";
import "sweetalert2";
import "./Sidebar-1g4CKLZI.js";
import "axios";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
import "./TextInput-CzxrbIpp.js";
import "./DatePickerToForm-DlY2BJGL.js";
import "react-datepicker";
import "date-fns/locale";
import "./Checkbox-C9HPJULq.js";
import "./LocationSelects-B4vI2QcJ.js";
import "./ModalTemplate-BnjBXi9G.js";
import "./SelectSearch-x7o6yKJV.js";
import "react-select";
import "./UserSearch-Bn5gVs5d.js";
import "date-fns";
import "./SelectInput-DrqFt-OA.js";
const EMPTY = Object.freeze([]);
const EMPTY_OBJ = Object.freeze({});
function Index({
  auth,
  session,
  title,
  subtitle,
  companies,
  queryParams: rawQueryParams = {},
  availableLocales
}) {
  const __ = useTranslation();
  const { props } = usePage();
  const queryParams = rawQueryParams && typeof rawQueryParams === "object" ? rawQueryParams : EMPTY_OBJ;
  const adhocFilters = props.adhocFilters ?? EMPTY;
  const indexRouteName = "customers.index";
  const indexRouteParams = {};
  const { loading } = useInertiaLoading();
  const legendItems = props.activeFiltersLegend || [];
  const hasActiveFilters = legendItems.length > 0;
  useSweetAlert();
  const columns = [
    // 👇 OJO: esto debe ir a customers.edit, no companies.edit
    { key: "name", label: __("razon_social"), sort: true, filter: "text", type: "link", link: "customers.edit", class_th: "", class_td: "", placeholder: __("razon_social_filtrar") },
    { key: "tradename", label: __("nombre_comercial"), sort: true, filter: "text", class_th: "", class_td: "", placeholder: __("nombre_comercial_filtrar") },
    { key: "created_at", label: __("fecha_alta"), sort: true, filter: "date", class_th: "text-center", class_td: "text-end", placeholder: __("fecha_alta"), dateKeys: ["date_from", "date_to"] },
    { key: "nif", label: __("nif"), sort: true, filter: "text", class_th: "", class_td: "", placeholder: __("nif_filtrar") },
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
    table: "tblCustomers",
    allColumnKeys: columns.map((col) => col.key),
    entityName: "customers",
    indexRoute: "customers.index",
    destroyRoute: "customers.destroy",
    filteredDataRoute: "customers.filtered-data",
    labelName: "cliente",
    queryParams
  });
  const actions = [];
  if (permissions == null ? void 0 : permissions["customers.create"]) {
    actions.push({
      text: __("cliente_nuevo"),
      icon: "la-plus",
      url: "customers.create",
      modal: false
    });
    actions.push({
      text: __("clientes_importar"),
      icon: "la-file-import",
      url: "customers.import",
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
            /* @__PURE__ */ jsx(
              ColumnFilter,
              {
                columns,
                visibleColumns,
                toggleColumn: toggleColumnVisibility
              }
            ),
            /* @__PURE__ */ jsx(
              AdHocFiltersDropdown,
              {
                filters: adhocFilters,
                routeName: indexRouteName,
                routeParams: indexRouteParams,
                queryParams
              }
            ),
            /* @__PURE__ */ jsx(RecordsPerPage, { perPage, setPerPage }),
            /* @__PURE__ */ jsx(
              TableExporter,
              {
                filename: __("clientes"),
                columns,
                fetchData: filteredData
              }
            )
          ] }) }),
          /* @__PURE__ */ jsxs("div", { className: "d-flex justify-content-between align-items-center my-2", children: [
            /* @__PURE__ */ jsx(
              ActiveFiltersLegend,
              {
                items: legendItems,
                routeName: indexRouteName,
                routeParams: indexRouteParams
              }
            ),
            hasActiveFilters && loading ? /* @__PURE__ */ jsx(SpinnerInline, { text: __("cargando") ?? "Cargando…" }) : null
          ] }),
          /* @__PURE__ */ jsx("div", { className: "table-responsive", children: /* @__PURE__ */ jsxs(Table, { className: "table table-nowrap table-striped align-middle mb-0", id: "tblCustomers", children: [
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
                SearchFieldChanged
              }
            ),
            /* @__PURE__ */ jsx("tbody", { children: ((companies == null ? void 0 : companies.data) || []).map((company) => /* @__PURE__ */ jsxs("tr", { children: [
              columns.map((col) => /* @__PURE__ */ jsx(
                "td",
                {
                  className: `${col.class_td ?? ""} ${visibleColumns.includes(col.key) ? "" : "d-none"}`.trim(),
                  children: renderCellContent(company[col.key], col, company)
                },
                col.key
              )),
              /* @__PURE__ */ jsxs("td", { className: "text-end", children: [
                (permissions == null ? void 0 : permissions["customers.edit"]) && /* @__PURE__ */ jsx(
                  OverlayTrigger,
                  {
                    placement: "top",
                    overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", children: company.status == 1 ? __("cliente_activo") : __("cliente_inactivo") }),
                    children: /* @__PURE__ */ jsx(
                      StatusButton,
                      {
                        status: company.status,
                        id: company.id,
                        updateRoute: "customers.status",
                        reloadUrl: route("customers.index"),
                        reloadResource: "customers"
                      }
                    )
                  },
                  `status-${company.id}`
                ),
                (permissions == null ? void 0 : permissions["customers.edit"]) && /* @__PURE__ */ jsx(
                  OverlayTrigger,
                  {
                    placement: "top",
                    overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", children: __("editar") }),
                    children: /* @__PURE__ */ jsx(
                      Link,
                      {
                        href: route("customers.edit", company.id),
                        className: "btn btn-sm btn-info ms-1",
                        children: /* @__PURE__ */ jsx("i", { className: "la la-edit" })
                      }
                    )
                  },
                  `edit-${company.id}`
                ),
                (permissions == null ? void 0 : permissions["customers.destroy"]) && /* @__PURE__ */ jsx(
                  OverlayTrigger,
                  {
                    placement: "top",
                    overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", children: __("eliminar") }),
                    children: /* @__PURE__ */ jsx("span", { children: /* @__PURE__ */ jsx(
                      "button",
                      {
                        type: "button",
                        className: "btn btn-sm btn-danger ms-1",
                        onClick: () => handleDelete(company.relation_id),
                        children: /* @__PURE__ */ jsx("i", { className: "la la-trash" })
                      }
                    ) })
                  },
                  `delete-${company.id}`
                )
              ] })
            ] }, `company-${company.id}`)) })
          ] }) }),
          /* @__PURE__ */ jsx(
            Pagination,
            {
              links: companies.meta.links,
              totalRecords: companies.meta.total,
              currentPage: companies.meta.current_page,
              perPage: companies.meta.per_page,
              onPageChange: (page) => {
                router.get(route(indexRouteName, indexRouteParams), {
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
