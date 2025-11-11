import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-CS968Wx3.js";
import { Head, Link, router } from "@inertiajs/react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { u as useTableManagement, C as ColumnFilter, R as RecordsPerPage, S as SortControl, F as FilterRow, P as Pagination } from "./useTableManagement-CA-wp9Fk.js";
import { S as StatusButton } from "./StatusButton-DPQw0QHC.js";
import { T as TableExporter } from "./TableExporter-BjSebGA-.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import { r as renderCellContent } from "./renderCellContent-Dpxbw8rL.js";
import "react";
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
function Index({
  auth,
  session,
  title,
  subtitle,
  environment,
  // sectors | customers | providers | crm
  filters = {},
  categories,
  queryParams: rawQueryParams = {},
  availableLocales
}) {
  const queryParams = typeof rawQueryParams === "object" && rawQueryParams !== null ? rawQueryParams : {};
  const __ = useTranslation();
  const columns = [
    {
      key: "name",
      label: __("categoria"),
      sort: true,
      filter: "text",
      type: "link",
      link: "categories.edit",
      routeParams: [environment],
      // <- usar environment
      placeholder: __("categorias_filtrar")
    },
    {
      key: "depth",
      label: __("nivel"),
      sort: true,
      filter: "number",
      class_th: "text-center",
      class_td: "text-center",
      placeholder: __("nivel_filtrar")
    },
    {
      key: "position",
      label: __("posicion"),
      sort: true,
      filter: "number",
      class_th: "text-center",
      class_td: "text-center",
      placeholder: __("posicion_filtrar")
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
  ];
  const rows = Array.isArray(categories == null ? void 0 : categories.data) ? categories.data : Array.isArray(categories) ? categories : [];
  const meta = (categories == null ? void 0 : categories.meta) ?? null;
  const safeTotal = (meta == null ? void 0 : meta.total) ?? rows.length;
  const safeCurrentPage = (meta == null ? void 0 : meta.current_page) ?? 1;
  const safePerPage = (meta == null ? void 0 : meta.per_page) ?? rows.length;
  const safeLinks = (meta == null ? void 0 : meta.links) ?? [];
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
    table: "tblCategories",
    allColumnKeys: columns.map((col) => col.key),
    entityName: "categories",
    indexRoute: "categories.index",
    destroyRoute: "categories.destroy",
    filteredDataRoute: "categories.filtered-data",
    routeParams: [environment],
    // <- clave para Ziggy
    labelName: "categoria",
    queryParams
  });
  const actions = [];
  if (permissions == null ? void 0 : permissions["companies.edit"]) {
    actions.push({
      text: __("categoria_nueva"),
      icon: "la-plus",
      url: "categories.create",
      modal: false,
      params: [environment]
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
            /* @__PURE__ */ jsx(RecordsPerPage, { perPage, setPerPage }),
            /* @__PURE__ */ jsx(
              TableExporter,
              {
                filename: __("categorias"),
                columns,
                fetchData: filteredData
              }
            )
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "table-responsive", children: /* @__PURE__ */ jsxs("table", { className: "table table-nowrap table-striped align-middle mb-0", id: "tblCategories", children: [
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
                SearchFieldChanged
              }
            ),
            /* @__PURE__ */ jsxs("tbody", { children: [
              rows.map((category) => /* @__PURE__ */ jsxs("tr", { children: [
                columns.map((col) => /* @__PURE__ */ jsx(
                  "td",
                  {
                    className: `${col.class_td ?? ""} ${visibleColumns.includes(col.key) ? "" : "d-none"}`.trim(),
                    children: renderCellContent(
                      category[col.key],
                      col,
                      { ...category, __routeParams: [environment] }
                      // <- env
                    )
                  },
                  col.key
                )),
                /* @__PURE__ */ jsxs("td", { className: "text-end", children: [
                  (permissions == null ? void 0 : permissions["categories.edit"]) && /* @__PURE__ */ jsx(
                    OverlayTrigger,
                    {
                      placement: "top",
                      overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", children: category.status == 1 ? __("categoria_activa") : __("categoria_inactiva") }),
                      children: /* @__PURE__ */ jsx("span", { children: /* @__PURE__ */ jsx(
                        StatusButton,
                        {
                          status: category.status,
                          id: category.id,
                          updateRoute: "categories.toggle",
                          updateRouteParams: [environment, category.id],
                          reloadUrl: route("categories.index", environment),
                          reloadResource: "categories"
                        }
                      ) })
                    },
                    `status-${category.id}`
                  ),
                  (permissions == null ? void 0 : permissions["categories.edit"]) && /* @__PURE__ */ jsx(
                    OverlayTrigger,
                    {
                      placement: "top",
                      overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", children: __("editar") }),
                      children: /* @__PURE__ */ jsx(
                        Link,
                        {
                          href: route("categories.edit", [environment, category.id]),
                          className: "btn btn-sm btn-info ms-1",
                          children: /* @__PURE__ */ jsx("i", { className: "la la-edit" })
                        }
                      )
                    },
                    `edit-${category.id}`
                  ),
                  (permissions == null ? void 0 : permissions["categories.destroy"]) && /* @__PURE__ */ jsx(
                    OverlayTrigger,
                    {
                      placement: "top",
                      overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", children: __("eliminar") }),
                      children: /* @__PURE__ */ jsx("span", { children: /* @__PURE__ */ jsx(
                        "button",
                        {
                          type: "button",
                          className: "btn btn-sm btn-danger ms-1",
                          onClick: () => handleDelete(category.id, [environment]),
                          children: /* @__PURE__ */ jsx("i", { className: "la la-trash" })
                        }
                      ) })
                    },
                    `delete-${category.id}`
                  )
                ] })
              ] }, `category-${category.id}`)),
              rows.length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: columns.length + 1, className: "text-center py-5", children: __("sin_resultados") }) })
            ] })
          ] }) }),
          meta && /* @__PURE__ */ jsx(
            Pagination,
            {
              links: safeLinks,
              totalRecords: safeTotal,
              currentPage: safeCurrentPage,
              perPage: safePerPage,
              onPageChange: (page) => {
                router.get(
                  route("categories.index", environment),
                  // <- env
                  {
                    ...queryParams,
                    page,
                    per_page: perPage,
                    sort_field: sortParams.sort_field,
                    sort_direction: sortParams.sort_direction
                  },
                  { preserveState: true }
                );
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
