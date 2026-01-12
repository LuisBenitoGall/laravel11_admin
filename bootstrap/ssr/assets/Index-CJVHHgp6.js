import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-D0ivmZ8I.js";
import { Head, Link, router } from "@inertiajs/react";
import { useState } from "react";
import { Table, OverlayTrigger, Tooltip } from "react-bootstrap";
import { u as useTableManagement, C as ColumnFilter, R as RecordsPerPage, S as SortControl, F as FilterRow, P as Pagination } from "./useTableManagement-BRH8bgSd.js";
import { S as ShowRegister } from "./ShowRegister-ChxyE8YT.js";
import { S as ShowRegisterButton } from "./ShowRegisterButton-CPwJtUP3.js";
import { S as StatusButton } from "./StatusButton-DfO41WfJ.js";
import { T as TableExporter } from "./TableExporter-RjBSwz2t.js";
import "sweetalert2";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import CrmCampaignShowView from "./MarketingCampaignShowView-D3zrRo5w.js";
import { r as renderCellContent } from "./renderCellContent-wSYduAQV.js";
import "@inertiajs/inertia";
import "./Header-DbWsFjJj.js";
import "./useSweetAlert-D4PAsWYN.js";
import "./Sidebar-YTcA2cN_.js";
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
function Index({ auth, session, title, subtitle, campaigns, queryParams: rawQueryParams = {}, availableLocales }) {
  const queryParams = typeof rawQueryParams === "object" && rawQueryParams !== null ? rawQueryParams : {};
  const __ = useTranslation();
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
    { key: "name", label: __("campanya"), sort: true, filter: "text", type: "link", link: "marketing-campaigns.edit", class_th: "", class_td: "", placeholder: __("campanya_filtrar") },
    { key: "code", label: __("codigo"), sort: true, filter: "text", class_th: "", class_td: "", placeholder: __("codigo_filtrar") },
    { key: "type", label: __("tipo"), sort: true, filter: "text", class_th: "", class_td: "", placeholder: __("tipo_filtrar") },
    { key: "start_at", label: __("fecha_inicio"), sort: true, filter: "date", class_th: "text-center", class_td: "text-end", placeholder: __("fecha_inicio"), dateKeys: ["date_from", "date_to"] },
    { key: "finish_at", label: __("fecha_fin"), sort: true, filter: "date", class_th: "text-center", class_td: "text-end", placeholder: __("fecha_fin"), dateKeys: ["date_from", "date_to"] }
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
    table: "tblMarketingCampaigns",
    allColumnKeys: columns.map((col) => col.key),
    entityName: "marketing-campaigns",
    indexRoute: "marketing-campaigns.index",
    destroyRoute: "marketing-campaigns.destroy",
    filteredDataRoute: "marketing-campaigns.filtered-data",
    labelName: "campanya",
    queryParams
  });
  const actions = [];
  if (permissions == null ? void 0 : permissions["marketing-campaigns.create"]) {
    actions.push({
      text: __("campanya_nueva"),
      icon: "la-plus",
      url: "marketing-campaigns.create",
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
          /* @__PURE__ */ jsx("div", { className: "table-responsive", children: /* @__PURE__ */ jsxs(Table, { className: "table table-nowrap table-striped align-middle mb-0", id: "tblMarketingCampaigns", children: [
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
            /* @__PURE__ */ jsx("tbody", { children: campaigns.data.map((campaign) => /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { className: "text-center", children: /* @__PURE__ */ jsx(ShowRegisterButton, { onClick: () => handleShowRegister(campaign) }) }),
              columns.map((col) => /* @__PURE__ */ jsx("td", { className: `${col.class_td ?? ""} ${visibleColumns.includes(col.key) ? "" : "d-none"}`.trim(), children: renderCellContent(campaign[col.key], col, campaign) }, col.key)),
              /* @__PURE__ */ jsxs("td", { className: "text-end", children: [
                (permissions == null ? void 0 : permissions["marketing-campaigns.edit"]) && /* @__PURE__ */ jsx(
                  OverlayTrigger,
                  {
                    placement: "top",
                    overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", children: campaign.status == 1 ? __("campanya_activa") : __("campanya_inactiva") }),
                    children: /* @__PURE__ */ jsx(
                      StatusButton,
                      {
                        status: campaign.status,
                        id: campaign.id,
                        updateRoute: "marketing-campaigns.status",
                        reloadUrl: route("marketing-campaigns.index"),
                        reloadResource: "marketing-campaigns"
                      }
                    )
                  },
                  "status-" + campaign.id
                ),
                (permissions == null ? void 0 : permissions["marketing-campaigns.edit"]) && /* @__PURE__ */ jsx(
                  OverlayTrigger,
                  {
                    placement: "top",
                    overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", children: __("editar") }),
                    children: /* @__PURE__ */ jsx(Link, { href: route("marketing-campaigns.edit", campaign.id), className: "btn btn-sm btn-info ms-1", children: /* @__PURE__ */ jsx("i", { className: "la la-edit" }) })
                  },
                  "edit-" + campaign.id
                ),
                (permissions == null ? void 0 : permissions["marketing-campaigns.destroy"]) && /* @__PURE__ */ jsx(
                  OverlayTrigger,
                  {
                    placement: "top",
                    overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", children: __("eliminar") }),
                    children: /* @__PURE__ */ jsx("span", { children: /* @__PURE__ */ jsx(
                      "button",
                      {
                        type: "button",
                        className: "btn btn-sm btn-danger ms-1",
                        onClick: () => handleDelete(campaign.id),
                        children: /* @__PURE__ */ jsx("i", { className: "la la-trash" })
                      }
                    ) })
                  },
                  "delete-" + campaign.id
                )
              ] })
            ] }, "campaign-" + campaign.id)) })
          ] }) }),
          /* @__PURE__ */ jsx(
            ShowRegister,
            {
              id: showId,
              open: showPanelOpen,
              onClose: handleCloseShowPanel,
              routeName: "marketing-campaigns.show",
              title: __("campanya"),
              ViewComponent: CrmCampaignShowView
            }
          ),
          /* @__PURE__ */ jsx(
            Pagination,
            {
              links: campaigns.meta.links,
              totalRecords: campaigns.meta.total,
              currentPage: campaigns.meta.current_page,
              perPage: campaigns.meta.per_page,
              onPageChange: (page) => {
                router.get(route("marketing-campaigns.index"), {
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
