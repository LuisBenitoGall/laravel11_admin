import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-MrkbgmVx.js";
import { Head, Link, router } from "@inertiajs/react";
import { useState } from "react";
import { Table, OverlayTrigger, Tooltip } from "react-bootstrap";
import { u as useTableManagement, C as ColumnFilter, R as RecordsPerPage, S as SortControl, F as FilterRow, P as Pagination } from "./useTableManagement-_Ugox1d5.js";
import { S as ShowRegister } from "./ShowRegister-ChxyE8YT.js";
import { S as ShowRegisterButton } from "./ShowRegisterButton-CPwJtUP3.js";
import { S as StatusButton } from "./StatusButton-DfO41WfJ.js";
import { T as TableExporter } from "./TableExporter-RjBSwz2t.js";
import { u as useSweetAlert } from "./useSweetAlert-D4PAsWYN.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import MarketingListShowView from "./MarketingListShowView-DaZo3s4M.js";
import { r as renderCellContent } from "./renderCellContent-DkxoXe9S.js";
import "@inertiajs/inertia";
import "./Header-BVvoXjVe.js";
import "sweetalert2";
import "./Sidebar-ZJGYlWUm.js";
import "axios";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
import "./TextInput-CzxrbIpp.js";
import "react-datepicker";
import "date-fns";
import "date-fns/locale";
import "./SelectInput-DrqFt-OA.js";
import "prop-types";
function Index({
  auth,
  session,
  title,
  subtitle,
  lists,
  queryParams: rawQueryParams = {},
  availableLocales
}) {
  const queryParams = typeof rawQueryParams === "object" && rawQueryParams !== null ? rawQueryParams : {};
  const __ = useTranslation();
  const { showConfirm } = useSweetAlert();
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
  const handleExportToBrevo = (list) => {
    showConfirm({
      title: __("exportacion_listado"),
      text: __("exportacion_listado_confirm"),
      icon: "warning",
      onConfirm: () => {
        router.post(
          route("marketing-lists.export-brevo", [list.id]),
          {},
          {
            preserveScroll: true
          }
        );
      }
    });
  };
  const columns = [
    { key: "name", label: __("lista"), sort: true, filter: "text", type: "link", link: "marketing-lists.edit", class_th: "", class_td: "", placeholder: __("lista_filtrar") },
    { key: "members_count", label: __("miembros"), sort: true, filter: "", class_th: "text-center", class_td: "text-end" },
    { key: "created_by", label: __("autor"), sort: true, filter: "text", class_th: "", class_td: "", placeholder: __("nombre_filtrar") }
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
    table: "tblMarketingLists",
    allColumnKeys: columns.map((col) => col.key),
    entityName: "marketing-lists",
    indexRoute: "marketing-lists.index",
    destroyRoute: "marketing-lists.destroy",
    filteredDataRoute: "marketing-lists.filtered-data",
    labelName: "lista",
    queryParams
  });
  const actions = [];
  if (permissions == null ? void 0 : permissions["marketing-lists.create"]) {
    actions.push({
      text: __("lista_nueva"),
      icon: "la-plus",
      url: "marketing-lists.create",
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
            /* @__PURE__ */ jsx(TableExporter, { filename: __("empresas"), columns, fetchData: filteredData })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "table-responsive", children: /* @__PURE__ */ jsxs(Table, { className: "table table-nowrap table-striped align-middle mb-0", id: "tblMarketingLists", children: [
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
            /* @__PURE__ */ jsx("tbody", { children: lists.data.map((list) => /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { className: "text-center", children: /* @__PURE__ */ jsx(ShowRegisterButton, { onClick: () => handleShowRegister(list) }) }),
              columns.map((col) => /* @__PURE__ */ jsx("td", { className: `${col.class_td ?? ""} ${visibleColumns.includes(col.key) ? "" : "d-none"}`.trim(), children: renderCellContent(list[col.key], col, list) }, col.key)),
              /* @__PURE__ */ jsxs("td", { className: "text-end", children: [
                (permissions == null ? void 0 : permissions["marketing-lists.edit"]) && /* @__PURE__ */ jsx(
                  OverlayTrigger,
                  {
                    placement: "top",
                    overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", children: list.status == 1 ? __("lista_activa") : __("lista_inactiva") }),
                    children: /* @__PURE__ */ jsx(
                      StatusButton,
                      {
                        status: list.status,
                        id: list.id,
                        updateRoute: "marketing-lists.status",
                        reloadUrl: route("marketing-lists.index"),
                        reloadResource: "marketing-lists"
                      }
                    )
                  },
                  "status-" + list.id
                ),
                /* @__PURE__ */ jsx(
                  OverlayTrigger,
                  {
                    placement: "top",
                    overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", children: __("brevo_exportar") }),
                    children: /* @__PURE__ */ jsx(
                      "button",
                      {
                        type: "button",
                        className: "btn btn-sm btn-info ms-1",
                        onClick: (e) => {
                          e.preventDefault();
                          handleExportToBrevo(list);
                        },
                        children: /* @__PURE__ */ jsx("i", { className: "la la-file-export" })
                      }
                    )
                  },
                  "export-" + list.id
                ),
                (permissions == null ? void 0 : permissions["marketing-lists.edit"]) && /* @__PURE__ */ jsx(
                  OverlayTrigger,
                  {
                    placement: "top",
                    overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", children: __("editar") }),
                    children: /* @__PURE__ */ jsx(Link, { href: route("marketing-lists.edit", list.id), className: "btn btn-sm btn-info ms-1", children: /* @__PURE__ */ jsx("i", { className: "la la-edit" }) })
                  },
                  "edit-" + list.id
                ),
                (permissions == null ? void 0 : permissions["marketing-lists.destroy"]) && /* @__PURE__ */ jsx(
                  OverlayTrigger,
                  {
                    placement: "top",
                    overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", children: __("eliminar") }),
                    children: /* @__PURE__ */ jsx("span", { children: /* @__PURE__ */ jsx(
                      "button",
                      {
                        type: "button",
                        className: "btn btn-sm btn-danger ms-1",
                        onClick: () => handleDelete(list.id),
                        children: /* @__PURE__ */ jsx("i", { className: "la la-trash" })
                      }
                    ) })
                  },
                  "delete-" + list.id
                )
              ] })
            ] }, "list-" + list.id)) })
          ] }) }),
          /* @__PURE__ */ jsx(
            ShowRegister,
            {
              id: showId,
              open: showPanelOpen,
              onClose: handleCloseShowPanel,
              routeName: "marketing-lists.show",
              title: __("lista"),
              ViewComponent: MarketingListShowView
            }
          ),
          /* @__PURE__ */ jsx(
            Pagination,
            {
              links: lists.meta.links,
              totalRecords: lists.meta.total,
              currentPage: lists.meta.current_page,
              perPage: lists.meta.per_page,
              onPageChange: (page) => {
                router.get(route("marketing-lists.index"), {
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
