import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-CS0xV2Ze.js";
import { usePage, Head, Link, router } from "@inertiajs/react";
import { useState } from "react";
import { Table, OverlayTrigger, Tooltip } from "react-bootstrap";
import { u as useInertiaLoading, A as AdHocFiltersDropdown, a as ActiveFiltersLegend, S as SpinnerInline } from "./useInertiaLoading-CLsmBBTW.js";
import { C as ColumnFilter, R as RecordsPerPage, S as SortControl, F as FilterRow, P as Pagination } from "./SortControl-B-edZX2D.js";
import { S as ShowRegisterButton, a as ShowRegister } from "./ShowRegisterButton-DPAZE_RX.js";
import { S as StatusButton } from "./StatusButton-DfO41WfJ.js";
import { T as TableExporter } from "./TableExporter-CrDOX5NX.js";
import { u as useSweetAlert } from "./useSweetAlert-D4PAsWYN.js";
import { u as useTableManagement } from "./useTableManagement-UWRr8jtd.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import ProductShowView from "./ProductShowView-CVZdA3z-.js";
import { r as renderCellContent } from "./renderCellContent-DJWyVzIY.js";
import "./Header-BVvoXjVe.js";
import "@inertiajs/inertia";
import "sweetalert2";
import "./Sidebar-DgixJBon.js";
import "axios";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
import "./TextInput-CzxrbIpp.js";
import "./DatePickerToForm-BNatYC8y.js";
import "react-datepicker";
/* empty css                          */
import "date-fns/locale";
import "./Checkbox-C9HPJULq.js";
import "./LocationSelects-B4vI2QcJ.js";
import "./ModalTemplate-BiHkGcpB.js";
import "./SelectSearch-x7o6yKJV.js";
import "react-select";
import "./UserSearch-Bn5gVs5d.js";
import "./YearSelect-CdvirGha.js";
import "./SelectInput-BpRRLwUE.js";
import "date-fns";
import "prop-types";
const EMPTY = Object.freeze([]);
const EMPTY_OBJ = Object.freeze({});
function Index({
  auth,
  session,
  title,
  subtitle,
  table = EMPTY_OBJ,
  slug,
  queryParams: rawQueryParams = {},
  availableLocales
}) {
  const __ = useTranslation();
  const t = table && typeof table === "object" ? table : EMPTY_OBJ;
  const { props } = usePage();
  const tableId = t.id ?? "tblProducts";
  const rows = t.rows ?? EMPTY_OBJ;
  const queryParams = t.queryParams ?? EMPTY_OBJ;
  const adhocFilters = t.adhocFilters ?? EMPTY;
  const legendItems = t.activeFiltersLegend ?? EMPTY;
  const { loading } = useInertiaLoading();
  const hasActiveFilters = legendItems.length > 0;
  useSweetAlert();
  const indexRouteName = `${slug}.index`;
  const indexRouteParams = {};
  const [showId, setShowId] = useState(null);
  const [showPanelOpen, setShowPanelOpen] = useState(false);
  const handleShowRegister = (product) => {
    setShowId(product.id);
    setShowPanelOpen(true);
  };
  const handleCloseShowPanel = () => {
    setShowPanelOpen(false);
    setShowId(null);
  };
  const columns = [
    { key: "name", label: __("articulo"), sort: true, filter: "text", type: "link", link: "products.edit", class_th: "", class_td: "", placeholder: __("articulo_filtrar") },
    { key: "reference", label: __("referencia"), sort: true, filter: "text", class_th: "", class_td: "", placeholder: __("referencia_filtrar") },
    { key: "description", label: __("descripcion"), sort: true, filter: "text", class_th: "", class_td: "", placeholder: __("descripcion_filtrar") },
    { key: "price", label: __("precio"), sort: true, filter: "text", class_th: "text-center", class_td: "text-end", placeholder: __("precio_filtrar") },
    { key: "created_at", label: __("fecha_alta"), sort: true, filter: "date", class_th: "text-center", class_td: "text-end", placeholder: __("fecha_alta"), dateKeys: ["date_from", "date_to"] },
    { key: "status", label: __("estado"), sort: true, filter: "select", options: [
      { value: "1", label: __("activo") },
      { value: "0", label: __("inactivo") }
    ], class_th: "text-center", class_td: "text-center", placeholder: __("estado_filtrar"), booleanLike: true },
    { key: "image", label: __("imagen"), sort: false, filter: "", type: "image", icon: "box", class_th: "text-center", class_td: "text-center", placeholder: "" }
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
    handleDelete,
    queryParams: tableQueryParams
  } = useTableManagement({
    table: tableId,
    allColumnKeys: columns.map((col) => col.key),
    entityName: "products",
    indexRoute: slug + ".index",
    destroyRoute: "products.destroy",
    filteredDataRoute: slug + ".filtered-data",
    labelName: "productos",
    queryParams
  });
  const actions = [];
  if (permissions == null ? void 0 : permissions["products.create"]) {
    actions.push({
      text: __("producto_nuevo"),
      icon: "la-plus",
      url: "products.create",
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
            /* @__PURE__ */ jsx(
              AdHocFiltersDropdown,
              {
                filters: adhocFilters,
                routeName: indexRouteName,
                routeParams: indexRouteParams,
                queryParams: tableQueryParams
              }
            ),
            /* @__PURE__ */ jsx(RecordsPerPage, { perPage, setPerPage }),
            /* @__PURE__ */ jsx(TableExporter, { filename: __("productos"), columns, fetchData: filteredData })
          ] }) }),
          /* @__PURE__ */ jsxs("div", { className: "d-flex justify-content-between align-items-center my-2", children: [
            /* @__PURE__ */ jsx(
              ActiveFiltersLegend,
              {
                items: legendItems,
                routeName: indexRouteName,
                routeParams: indexRouteParams,
                queryParams: tableQueryParams
              }
            ),
            hasActiveFilters && loading ? /* @__PURE__ */ jsx(SpinnerInline, { text: __("cargando") ?? "Cargando…" }) : null
          ] }),
          /* @__PURE__ */ jsx("div", { className: "table-responsive", children: /* @__PURE__ */ jsxs(Table, { className: "table table-nowrap table-striped align-middle mb-0", id: tableId, children: [
            /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("th", { className: "text-center first-column", children: " " }),
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
                SearchFieldChanged,
                PrependColumns: 1
              }
            ),
            /* @__PURE__ */ jsx("tbody", { children: rows.data.map((product) => /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { className: "text-center", children: /* @__PURE__ */ jsx(ShowRegisterButton, { onClick: () => handleShowRegister(product) }) }),
              columns.map((col) => /* @__PURE__ */ jsx("td", { className: `${col.class_td ?? ""} ${visibleColumns.includes(col.key) ? "" : "d-none"}`.trim(), children: renderCellContent(product[col.key], col, product) }, col.key)),
              /* @__PURE__ */ jsxs("td", { className: "text-end", children: [
                (permissions == null ? void 0 : permissions["products.edit"]) && /* @__PURE__ */ jsx(
                  OverlayTrigger,
                  {
                    placement: "top",
                    overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", children: product.status == 1 ? __("producto_activo") : __("producto_inactivo") }),
                    children: /* @__PURE__ */ jsx(
                      StatusButton,
                      {
                        status: product.status,
                        id: product.id,
                        updateRoute: "products.status",
                        reloadUrl: route("products.index"),
                        reloadResource: "products"
                      }
                    )
                  },
                  "status-" + product.id
                ),
                (permissions == null ? void 0 : permissions["products.edit"]) && /* @__PURE__ */ jsx(
                  OverlayTrigger,
                  {
                    placement: "top",
                    overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", children: __("editar") }),
                    children: /* @__PURE__ */ jsx(Link, { href: route("products.edit", product.id), className: "btn btn-sm btn-info ms-1", children: /* @__PURE__ */ jsx("i", { className: "la la-edit" }) })
                  },
                  "edit-" + product.id
                ),
                (permissions == null ? void 0 : permissions["products.destroy"]) && /* @__PURE__ */ jsx(
                  OverlayTrigger,
                  {
                    placement: "top",
                    overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", children: __("eliminar") }),
                    children: /* @__PURE__ */ jsx("span", { children: /* @__PURE__ */ jsx(
                      "button",
                      {
                        type: "button",
                        className: "btn btn-sm btn-danger ms-1",
                        onClick: () => handleDelete(product.id),
                        children: /* @__PURE__ */ jsx("i", { className: "la la-trash" })
                      }
                    ) })
                  },
                  "delete-" + product.id
                )
              ] })
            ] }, "product-" + product.id)) })
          ] }) }),
          /* @__PURE__ */ jsx(
            ShowRegister,
            {
              id: showId,
              open: showPanelOpen,
              onClose: handleCloseShowPanel,
              routeName: "products.show",
              title: __("articulo"),
              ViewComponent: ProductShowView
            }
          ),
          /* @__PURE__ */ jsx(
            Pagination,
            {
              links: rows.meta.links,
              totalRecords: rows.meta.total,
              currentPage: rows.meta.current_page,
              perPage: rows.meta.per_page,
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
