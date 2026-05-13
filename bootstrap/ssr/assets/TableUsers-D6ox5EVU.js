import { jsx, jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import { OverlayTrigger, Tooltip, Table } from "react-bootstrap";
import { C as ColumnFilter, R as RecordsPerPage, S as SortControl, F as FilterRow, P as Pagination } from "./SortControl-BYPcBqgI.js";
import { S as ShowRegisterButton, a as ShowRegister } from "./ShowRegisterButton-DPAZE_RX.js";
import { T as TableExporter } from "./TableExporter-Bc1iQF0N.js";
import "./StatusButton-DfO41WfJ.js";
import { u as useTableManagement } from "./useTableManagement-DhW01hp7.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import UserShowView from "./UserShowView-BriFAEee.js";
import { r as renderCellContent } from "./renderCellContent-9r3OTWM8.js";
function TableUsers({
  users,
  // puede ser array [] o paginator { data, meta }
  rows: rowsProp = null,
  // NUEVO: dataset ya formateado desde backend
  tableId = "tblUsers",
  queryParams: rawQueryParams = {},
  columns: columnsProp = null,
  entityName = "users",
  indexRoute = "customers.edit",
  // ruta para recargar listado (Inertia)
  indexParams = null,
  // id u objeto de params para route()
  destroyRoute = "user-companies.destroy",
  filteredDataRoute = false,
  labelName = "usuarios",
  availableLocales = [],
  disablePagination = false,
  // NUEVO: desactiva paginación para uso en tabs
  userEditCompanyId = null,
  /**
   * Ruta DELETE para desvincular la fila (pivot/lista/contacto). Si no se pasa, se usa `destroyRoute`.
   * Debe ser `undefined` por defecto: si tuviera el mismo valor por defecto que `destroyRoute`,
   * `deleteUserRoute ?? destroyRoute` ignoraría siempre `destroyRoute` (p. ej. marketing-list-users).
   */
  deleteUserRoute = void 0,
  rowDeleteKey = "id",
  /** Id de la cuenta CRM desde la que se editó (para "Volver a la cuenta X"); se añade como ?from_account= */
  editFromAccountId = null
}) {
  const __ = useTranslation();
  const queryParams = typeof rawQueryParams === "object" && rawQueryParams !== null ? rawQueryParams : {};
  const [showId, setShowId] = useState(null);
  const [showPanelOpen, setShowPanelOpen] = useState(false);
  const handleShowRegister = (user) => {
    const showUserId = user.user_id ?? user.id;
    setShowId(showUserId);
    setShowPanelOpen(true);
  };
  const handleCloseShowPanel = () => {
    setShowPanelOpen(false);
    setShowId(null);
  };
  const phonesTooltip = (phones = []) => {
    if (!Array.isArray(phones) || phones.length === 0) return "";
    return phones.map((p) => {
      const tag = p.is_primary ? "[P] " : "";
      const wa = p.is_whatsapp ? " (WA)" : "";
      const lab = p.label ? ` • ${p.label}` : "";
      return `${tag}${p.e164}${wa}${lab}`;
    }).join("\n");
  };
  const baseRows = Array.isArray(rowsProp) ? rowsProp : Array.isArray(users == null ? void 0 : users.data) ? users.data : Array.isArray(users) ? users : [];
  const hasServerRows = Array.isArray(rowsProp);
  const onlyProps = hasServerRows ? ["users", "rows"] : ["users"];
  let meta = null;
  if (users && typeof users === "object" && !Array.isArray(users)) {
    if ("meta" in users && users.meta) {
      meta = users.meta;
      if (!meta.links && Array.isArray(users.links)) {
        meta.links = users.links;
      }
    } else if ("total" in users && "per_page" in users && "current_page" in users) {
      meta = {
        total: users.total,
        per_page: users.per_page,
        current_page: users.current_page,
        links: Array.isArray(users.links) ? users.links : []
      };
    }
  }
  const defaultColumns = [
    {
      key: "name",
      label: __("nombre"),
      sort: true,
      filter: "text",
      class_th: "",
      class_td: "",
      placeholder: __("nombre_filtrar"),
      // Si el backend ya nos pasó "name" unido, esto solo lo devuelve.
      // Si llega separado, renderCellContent recibirá rowData igualmente.
      render: ({ rowData, value }) => {
        if (value) return value;
        const parts = [(rowData == null ? void 0 : rowData.name) ?? "", (rowData == null ? void 0 : rowData.surname) ?? ""].filter(Boolean);
        return parts.join(" ").trim();
      }
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
    },
    { key: "email", label: __("email"), sort: true, filter: "text", class_th: "", class_td: "", placeholder: __("email_filtrar") },
    {
      key: "phones",
      label: __("telefonos"),
      sort: true,
      filter: "text",
      class_th: "",
      class_td: "",
      placeholder: __("telefonos_filtrar"),
      // Render muestra principal + badge con tooltip del resto
      render: ({ rowData, value }) => {
        const list = Array.isArray(value) ? value : [];
        const primary = list.find((p) => p.is_primary) ?? list[0] ?? null;
        if (!primary) return "—";
        const othersCount = Math.max(list.length - 1, 0);
        const othersBadge = othersCount > 0 ? /* @__PURE__ */ jsx(
          OverlayTrigger,
          {
            placement: "top",
            overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", style: { whiteSpace: "pre-line" }, children: phonesTooltip(list) }),
            children: /* @__PURE__ */ jsxs("span", { className: "badge bg-secondary ms-2", style: { cursor: "help" }, children: [
              othersCount,
              " ",
              __("mas")
            ] })
          }
        ) : null;
        return /* @__PURE__ */ jsxs("span", { children: [
          primary.e164,
          primary.is_whatsapp ? /* @__PURE__ */ jsx("i", { className: "la la-whatsapp ms-2", "aria-label": "WhatsApp" }) : null,
          othersBadge
        ] });
      }
    },
    { key: "position", label: __("cargo"), sort: false, filter: "text", class_th: "", class_td: "" },
    { key: "avatar", label: __("imagen"), sort: false, filter: "", type: "image", icon: "user-tie", class_th: "text-center", class_td: "text-center", placeholder: "" }
  ];
  const columns = Array.isArray(columnsProp) && columnsProp.length ? columnsProp : defaultColumns;
  const effectiveDestroyRoute = deleteUserRoute ?? destroyRoute;
  const {
    sortParams,
    perPage,
    setPerPage,
    visibleColumns,
    toggleColumnVisibility,
    SearchFieldChanged,
    sortChanged,
    filteredData,
    handleDelete,
    managedRows
  } = useTableManagement({
    table: tableId,
    allColumnKeys: columns.map((col) => col.key),
    entityName,
    indexRoute: disablePagination ? null : indexRoute,
    routeParams: indexParams,
    destroyRoute: effectiveDestroyRoute,
    filteredDataRoute,
    labelName,
    queryParams
  });
  const rows = managedRows !== null ? managedRows : baseRows;
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx(Head, { title: __("usuarios") }),
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
      /* @__PURE__ */ jsx(TableExporter, { filename: __(labelName), columns, fetchData: filteredData })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "table-responsive", children: /* @__PURE__ */ jsxs(Table, { className: "table table-nowrap table-striped align-middle mb-0", id: tableId, children: [
      /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
        /* @__PURE__ */ jsx("th", { className: "text-center first-column", children: " " }),
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
          SearchFieldChanged,
          indexRoute: disablePagination ? null : indexRoute,
          indexParams,
          PrependColumns: 1
        }
      ),
      /* @__PURE__ */ jsxs("tbody", { children: [
        rows.map((user) => /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("td", { className: "text-center", children: /* @__PURE__ */ jsx(ShowRegisterButton, { onClick: () => handleShowRegister(user) }) }),
          columns.map((col) => /* @__PURE__ */ jsx(
            "td",
            {
              className: `${col.class_td ?? ""} ${visibleColumns.includes(col.key) ? "" : "d-none"}`.trim(),
              children: renderCellContent(user[col.key], col, user)
            },
            col.key
          )),
          /* @__PURE__ */ jsxs("td", { className: "text-end", children: [
            /* @__PURE__ */ jsx(
              OverlayTrigger,
              {
                placement: "top",
                overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", children: __("editar") }),
                children: /* @__PURE__ */ jsx(
                  Link,
                  {
                    href: (() => {
                      const userId = user.user_id ?? user.id;
                      const baseUrl = route(`${entityName}.edit`, userEditCompanyId != null ? [userId, userEditCompanyId] : [userId]);
                      if (editFromAccountId != null && editFromAccountId !== "") {
                        const sep = baseUrl.includes("?") ? "&" : "?";
                        return `${baseUrl}${sep}from_account=${encodeURIComponent(editFromAccountId)}`;
                      }
                      return baseUrl;
                    })(),
                    className: "btn btn-sm btn-info ms-1",
                    children: /* @__PURE__ */ jsx("i", { className: "la la-edit" })
                  }
                )
              },
              "edit-" + user.id
            ),
            /* @__PURE__ */ jsx(
              OverlayTrigger,
              {
                placement: "top",
                overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", children: __("desvincular") }),
                children: /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    className: "btn btn-sm btn-danger ms-1",
                    title: __("desvincular"),
                    onClick: () => handleDelete(user[rowDeleteKey]),
                    children: /* @__PURE__ */ jsx("i", { className: "la la-trash" })
                  }
                )
              },
              "delete-" + user.id
            )
          ] })
        ] }, user.id)),
        rows.length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: columns.length + 1, className: "text-center py-4", children: __("sin_resultados") }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx(
      ShowRegister,
      {
        id: showId,
        open: showPanelOpen,
        onClose: handleCloseShowPanel,
        routeName: "users.show",
        title: __("usuario"),
        ViewComponent: UserShowView
      }
    ),
    !disablePagination && meta && /* @__PURE__ */ jsx(
      Pagination,
      {
        links: meta.links,
        totalRecords: meta.total,
        currentPage: meta.current_page,
        perPage: meta.per_page,
        onPageChange: (page) => {
          router.reload({
            data: {
              ...queryParams,
              page,
              per_page: perPage,
              sort_field: sortParams.sort_field,
              sort_direction: sortParams.sort_direction
            },
            only: onlyProps,
            // 👈 ahora pide users (+ rows si existen)
            preserveState: true,
            preserveScroll: true
          });
        }
      }
    )
  ] });
}
export {
  TableUsers as T
};
