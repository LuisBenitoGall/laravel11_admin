import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-DT2NIV1N.js";
import { Head, Link, router } from "@inertiajs/react";
import "react";
import { Table, OverlayTrigger, Tooltip } from "react-bootstrap";
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
function Index({ auth, session, title, subtitle, accounts, queryParams: rawQueryParams = {}, availableLocales }) {
  const queryParams = typeof rawQueryParams === "object" && rawQueryParams !== null ? rawQueryParams : {};
  const __ = useTranslation();
  const columns = [
    { key: "name", label: __("cuenta"), sort: true, filter: "text", type: "link", link: "accounts.edit", class_th: "", class_td: "", placeholder: __("cuenta_filtrar") },
    { key: "description", label: __("descripcion"), sort: true, filter: "text", class_th: "", class_td: "", placeholder: __("descripcion_filtrar") },
    { key: "rate", label: __("tarifa"), sort: false, class_th: "text-center", class_td: "text-end" },
    { key: "duration", label: /* @__PURE__ */ jsxs(Fragment, { children: [
      " ",
      __("duracion"),
      " ",
      /* @__PURE__ */ jsxs("small", { children: [
        "(",
        __("dias"),
        ")"
      ] }),
      " "
    ] }), sort: false, class_th: "text-center", class_td: "text-end" }
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
    table: "tblAccounts",
    allColumnKeys: columns.map((col) => col.key),
    entityName: "accounts",
    indexRoute: "accounts.index",
    destroyRoute: "accounts.destroy",
    filteredDataRoute: "accounts.filtered-data",
    labelName: "cuenta",
    queryParams
  });
  const actions = [];
  if (permissions == null ? void 0 : permissions["accounts.create"]) {
    actions.push({
      text: __("cuenta_nueva"),
      icon: "la-plus",
      url: "accounts.create",
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
            /* @__PURE__ */ jsx(TableExporter, { filename: __("cuentas"), columns, fetchData: filteredData })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "table-responsive", children: /* @__PURE__ */ jsxs(Table, { className: "table table-nowrap table-striped align-middle mb-0", id: "tblAccounts", children: [
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
            /* @__PURE__ */ jsx("tbody", { children: accounts.data.map((account) => /* @__PURE__ */ jsxs("tr", { children: [
              columns.map((col) => /* @__PURE__ */ jsx("td", { className: `${col.class_td ?? ""} ${visibleColumns.includes(col.key) ? "" : "d-none"}`.trim(), children: renderCellContent(account[col.key], col, account) }, col.key)),
              /* @__PURE__ */ jsxs("td", { className: "text-end", children: [
                (permissions == null ? void 0 : permissions["accounts.edit"]) && /* @__PURE__ */ jsx(
                  OverlayTrigger,
                  {
                    placement: "top",
                    overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", children: account.status == 1 ? __("cuenta_activa") : __("cuenta_inactiva") }),
                    children: /* @__PURE__ */ jsx(
                      StatusButton,
                      {
                        status: account.status,
                        id: account.id,
                        updateRoute: "accounts.status",
                        reloadUrl: route("accounts.index"),
                        reloadResource: "accounts"
                      }
                    )
                  },
                  "status-" + account.id
                ),
                (permissions == null ? void 0 : permissions["accounts.edit"]) && /* @__PURE__ */ jsx(
                  OverlayTrigger,
                  {
                    placement: "top",
                    overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", children: __("editar") }),
                    children: /* @__PURE__ */ jsx(Link, { href: route("accounts.edit", account.id), className: "btn btn-sm btn-info ms-1", children: /* @__PURE__ */ jsx("i", { className: "la la-edit" }) })
                  },
                  "edit-" + account.id
                ),
                (permissions == null ? void 0 : permissions["accounts.destroy"]) && /* @__PURE__ */ jsx(
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
                  "delete-" + account.id
                )
              ] })
            ] }, "account-" + account.id)) })
          ] }) }),
          /* @__PURE__ */ jsx(
            Pagination,
            {
              links: accounts.meta.links,
              totalRecords: accounts.meta.total,
              currentPage: accounts.meta.current_page,
              perPage: accounts.meta.per_page,
              onPageChange: (page) => {
                router.get(route("accounts.index"), {
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
