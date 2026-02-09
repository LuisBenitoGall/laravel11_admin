import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-BAKikn-7.js";
import { usePage, Head, Link, router } from "@inertiajs/react";
import { useState } from "react";
import { Table, OverlayTrigger, Tooltip } from "react-bootstrap";
import { u as useInertiaLoading, A as AdHocFiltersDropdown, a as ActiveFiltersLegend, S as SpinnerInline } from "./useInertiaLoading-B2dLlwmV.js";
import { u as useTableManagement, C as ColumnFilter, R as RecordsPerPage, S as SortControl, F as FilterRow, P as Pagination } from "./useTableManagement-_Ugox1d5.js";
import { S as ShowRegister } from "./ShowRegister-ChxyE8YT.js";
import { S as ShowRegisterButton } from "./ShowRegisterButton-CPwJtUP3.js";
import { S as StatusButton } from "./StatusButton-DfO41WfJ.js";
import { T as TableExporter } from "./TableExporter-RjBSwz2t.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import CrmAccountShowView from "./CrmAccountShowView-ChM5a15M.js";
import { r as renderCellContent } from "./renderCellContent-DkxoXe9S.js";
import "@inertiajs/inertia";
import "./Header-BVvoXjVe.js";
import "./useSweetAlert-D4PAsWYN.js";
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
/* empty css                          */
import "date-fns/locale";
import "./Checkbox-C9HPJULq.js";
import "./LocationSelects-B4vI2QcJ.js";
import "./ModalTemplate-BnjBXi9G.js";
import "./SelectSearch-x7o6yKJV.js";
import "react-select";
import "./UserSearch-Bn5gVs5d.js";
import "date-fns";
import "./SelectInput-DrqFt-OA.js";
import "prop-types";
import "./ManagePhones-LdkmCbcO.js";
const EMPTY = Object.freeze([]);
const EMPTY_OBJ = Object.freeze({});
function Index({
  auth,
  session,
  title,
  subtitle,
  accounts,
  queryParams: rawQueryParams = {},
  availableLocales
}) {
  const __ = useTranslation();
  const { props } = usePage();
  const queryParams = rawQueryParams && typeof rawQueryParams === "object" ? rawQueryParams : EMPTY_OBJ;
  const adhocFilters = props.adhocFilters ?? EMPTY;
  const legendItems = props.activeFiltersLegend || [];
  const hasActiveFilters = legendItems.length > 0;
  const indexRouteName = "crm-accounts.index";
  const indexRouteParams = {};
  const { loading } = useInertiaLoading();
  const [showId, setShowId] = useState(null);
  const [showPanelOpen, setShowPanelOpen] = useState(false);
  const handleShowRegister = (row) => {
    setShowId(row.id);
    setShowPanelOpen(true);
  };
  const handleCloseShowPanel = () => {
    setShowPanelOpen(false);
    setShowId(null);
  };
  const columns = [
    { key: "name", label: __("razon_social"), sort: true, filter: "text", type: "link", link: "crm-accounts.edit", class_th: "", class_td: "", placeholder: __("razon_social_filtrar") },
    { key: "tradename", label: __("nombre_comercial"), sort: true, filter: "text", class_th: "", class_td: "", placeholder: __("nombre_comercial_filtrar") },
    { key: "owner", label: __("propietario"), sort: true, filter: "text", class_th: "", class_td: "", placeholder: __("propietario_filtrar") },
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
    table: "tblCrmAccounts",
    allColumnKeys: columns.map((col) => col.key),
    // 👉 Puedes dejar entityName como quieras, pero para exportar necesitamos esto sí o sí:
    entityName: "crm-accounts",
    indexRoute: "crm-accounts.index",
    destroyRoute: "crm-accounts.destroy",
    filteredDataRoute: "crm-accounts.filtered-data",
    // ✅ CRÍTICO: tu endpoint devuelve { accounts: ... }
    filteredDataKey: "accounts",
    labelName: "cuenta",
    queryParams
  });
  const actions = [];
  if (permissions == null ? void 0 : permissions["crm-accounts.create"]) {
    actions.push({
      text: __("cuenta_nueva"),
      icon: "la-plus",
      url: "crm-accounts.create",
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
                queryParams
              }
            ),
            /* @__PURE__ */ jsx(RecordsPerPage, { perPage, setPerPage }),
            /* @__PURE__ */ jsx(TableExporter, { filename: __("empresas"), columns, fetchData: filteredData })
          ] }) }),
          /* @__PURE__ */ jsxs("div", { className: "d-flex justify-content-between align-items-center my-2", children: [
            /* @__PURE__ */ jsx(
              ActiveFiltersLegend,
              {
                items: legendItems,
                routeName: indexRouteName,
                routeParams: indexRouteParams,
                queryParams
              }
            ),
            hasActiveFilters && loading ? /* @__PURE__ */ jsx(SpinnerInline, { text: __("cargando") ?? "Cargando…" }) : null
          ] }),
          /* @__PURE__ */ jsx("div", { className: "table-responsive", children: /* @__PURE__ */ jsxs(Table, { className: "table table-nowrap table-striped align-middle mb-0", id: "tblCrmAccounts", children: [
            /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("th", { className: "text-center first-column", children: " " }),
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
                SearchFieldChanged,
                PrependColumns: 1
              }
            ),
            /* @__PURE__ */ jsx("tbody", { children: accounts.data.map((account) => /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { className: "text-center", children: /* @__PURE__ */ jsx(ShowRegisterButton, { onClick: () => handleShowRegister(account) }) }),
              columns.map((col) => /* @__PURE__ */ jsx(
                "td",
                {
                  className: `${col.class_td ?? ""} ${visibleColumns.includes(col.key) ? "" : "d-none"}`.trim(),
                  children: renderCellContent(account[col.key], col, account)
                },
                col.key
              )),
              /* @__PURE__ */ jsxs("td", { className: "text-end", children: [
                (permissions == null ? void 0 : permissions["crm-accounts.edit"]) && /* @__PURE__ */ jsx(
                  OverlayTrigger,
                  {
                    placement: "top",
                    overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", children: account.status == 1 ? __("empresa_activa") : __("empresa_inactiva") }),
                    children: /* @__PURE__ */ jsx(
                      StatusButton,
                      {
                        status: account.status,
                        id: account.id,
                        updateRoute: "crm-accounts.status",
                        reloadUrl: route("crm-accounts.index"),
                        reloadResource: "crm-accounts"
                      }
                    )
                  },
                  `status-${account.id}`
                ),
                (permissions == null ? void 0 : permissions["crm-accounts.edit"]) && /* @__PURE__ */ jsx(
                  OverlayTrigger,
                  {
                    placement: "top",
                    overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", children: __("editar") }),
                    children: /* @__PURE__ */ jsx(Link, { href: route("crm-accounts.edit", account.id), className: "btn btn-sm btn-info ms-1", children: /* @__PURE__ */ jsx("i", { className: "la la-edit" }) })
                  },
                  `edit-${account.id}`
                ),
                (permissions == null ? void 0 : permissions["crm-accounts.destroy"]) && /* @__PURE__ */ jsx(
                  OverlayTrigger,
                  {
                    placement: "top",
                    overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", children: __("eliminar") }),
                    children: /* @__PURE__ */ jsx("span", { children: /* @__PURE__ */ jsx(
                      "button",
                      {
                        type: "button",
                        className: "btn btn-sm btn-danger ms-1",
                        onClick: () => handleDelete(account.id),
                        children: /* @__PURE__ */ jsx("i", { className: "la la-trash" })
                      }
                    ) })
                  },
                  `delete-${account.id}`
                )
              ] })
            ] }, `account-${account.id}`)) })
          ] }) }),
          /* @__PURE__ */ jsx(
            ShowRegister,
            {
              id: showId,
              open: showPanelOpen,
              onClose: handleCloseShowPanel,
              routeName: "crm-accounts.show",
              title: __("cuenta"),
              ViewComponent: CrmAccountShowView
            }
          ),
          /* @__PURE__ */ jsx(
            Pagination,
            {
              links: accounts.meta.links,
              totalRecords: accounts.meta.total,
              currentPage: accounts.meta.current_page,
              perPage: accounts.meta.per_page,
              onPageChange: (page) => {
                router.get(route("crm-accounts.index"), {
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
