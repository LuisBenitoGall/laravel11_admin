import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-D8RSvDxD.js";
import { Head, router } from "@inertiajs/react";
import "react";
import { Table, OverlayTrigger, Tooltip } from "react-bootstrap";
import { u as useTableManagement, C as ColumnFilter, R as RecordsPerPage, S as SortControl, F as FilterRow, P as Pagination } from "./useTableManagement-DGNlCh_d.js";
import "./StatusButton-DPQw0QHC.js";
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
function Index({ auth, session, title, subtitle, accounts, currency, queryParams: rawQueryParams = {}, availableLocales }) {
  const queryParams = typeof rawQueryParams === "object" && rawQueryParams !== null ? rawQueryParams : {};
  const __ = useTranslation();
  const columns = [
    { key: "name", label: __("cuenta"), sort: true, filter: "text", class_th: "", class_td: "", placeholder: __("cuenta_filtrar") },
    { key: "start_date", label: __("inicio"), sort: true, filter: "date", class_th: "text-center", class_td: "text-end", placeholder: __("inicio"), dateKeys: ["start_date"] },
    { key: "end_date", label: __("fin"), sort: true, filter: "date", class_th: "text-center", class_td: "text-end", placeholder: __("fin"), dateKeys: ["end_date"] },
    { key: "price", label: __("precio"), sort: false, filter: "", class_th: "text-center", class_td: "text-end", currency, placeholder: __("precio") }
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
    table: "tblCompanyAccounts",
    allColumnKeys: columns.map((col) => col.key),
    entityName: "company-accounts",
    indexRoute: "company-accounts.index",
    destroyRoute: "company-accounts.destroy",
    filteredDataRoute: "company-accounts.filtered-data",
    labelName: "cuenta",
    queryParams
  });
  const actions = [];
  if (permissions == null ? void 0 : permissions["my-account.edit"]) {
    actions.push({
      text: __("cuenta_renovar"),
      icon: "la-shopping-cart",
      url: "company-accounts.create",
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
            /* @__PURE__ */ jsx(TableExporter, { filename: __("empresa_cuentas"), columns, fetchData: filteredData })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "table-responsive", children: /* @__PURE__ */ jsxs(Table, { className: "table table-nowrap table-striped align-middle mb-0", id: "tblCompanyAccounts", children: [
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
              /* @__PURE__ */ jsx("td", { className: "text-end", children: (permissions == null ? void 0 : permissions["my-account.destroy"]) && /* @__PURE__ */ jsx(
                OverlayTrigger,
                {
                  placement: "top",
                  overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", children: __("cancelar") }),
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
              ) })
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
                router.get(route("company-accounts.index"), {
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
