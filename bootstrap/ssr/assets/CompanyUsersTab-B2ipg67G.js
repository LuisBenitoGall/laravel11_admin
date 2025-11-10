import { jsx, jsxs } from "react/jsx-runtime";
import { useMemo } from "react";
import { Head, Link, router, usePage } from "@inertiajs/react";
import { OverlayTrigger, Tooltip, Table } from "react-bootstrap";
import { u as useTableManagement, C as ColumnFilter, R as RecordsPerPage, S as SortControl, F as FilterRow, P as Pagination } from "./useTableManagement-CA-wp9Fk.js";
import { T as TableExporter } from "./TableExporter-BjSebGA-.js";
import "./StatusButton-DPQw0QHC.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import { r as renderCellContent } from "./renderCellContent-Dpxbw8rL.js";
import "react-datepicker";
import "date-fns";
import "date-fns/locale";
import "./SelectInput-DrqFt-OA.js";
import "./TextInput-CzxrbIpp.js";
import "axios";
import "./useSweetAlert-D4PAsWYN.js";
import "sweetalert2";
import "jspdf";
import "jspdf-autotable";
import "exceljs";
import "file-saver";
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
  availableLocales = []
}) {
  const __ = useTranslation();
  const queryParams = typeof rawQueryParams === "object" && rawQueryParams !== null ? rawQueryParams : {};
  const phonesTooltip = (phones = []) => {
    if (!Array.isArray(phones) || phones.length === 0) return "";
    return phones.map((p) => {
      const tag = p.is_primary ? "[P] " : "";
      const wa = p.is_whatsapp ? " (WA)" : "";
      const lab = p.label ? ` • ${p.label}` : "";
      return `${tag}${p.e164}${wa}${lab}`;
    }).join("\n");
  };
  const rows = Array.isArray(rowsProp) ? rowsProp : Array.isArray(users == null ? void 0 : users.data) ? users.data : Array.isArray(users) ? users : [];
  const meta = users && typeof users === "object" && "meta" in users ? users.meta : null;
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
  const {
    sortParams,
    perPage,
    setPerPage,
    visibleColumns,
    toggleColumnVisibility,
    SearchFieldChanged,
    sortChanged,
    filteredData
  } = useTableManagement({
    table: tableId,
    allColumnKeys: columns.map((col) => col.key),
    entityName,
    indexRoute,
    routeParams: indexParams,
    destroyRoute,
    filteredDataRoute,
    labelName,
    queryParams
  });
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
          indexRoute,
          indexParams
        }
      ),
      /* @__PURE__ */ jsxs("tbody", { children: [
        rows.map((user) => /* @__PURE__ */ jsxs("tr", { children: [
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
                children: /* @__PURE__ */ jsx(Link, { href: route(`${entityName}.edit`, user.id), className: "btn btn-sm btn-info ms-1", children: /* @__PURE__ */ jsx("i", { className: "la la-edit" }) })
              },
              "edit-" + user.id
            ),
            /* @__PURE__ */ jsx(
              OverlayTrigger,
              {
                placement: "top",
                overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", children: __("eliminar") }),
                children: /* @__PURE__ */ jsx(
                  "a",
                  {
                    href: route(`${entityName}.destroy`, user.id),
                    className: "btn btn-sm btn-danger ms-1",
                    title: __("eliminar"),
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
    meta && /* @__PURE__ */ jsx(
      Pagination,
      {
        links: meta.links,
        totalRecords: meta.total,
        currentPage: meta.current_page,
        perPage: meta.per_page,
        onPageChange: (page) => {
          router.get(
            route(indexRoute, indexParams),
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
  ] });
}
function CompanyUsersTab({
  users: usersProp = null,
  rows: rowsProp = null,
  tableId = "tblCompanyUsers",
  indexRoute = "",
  indexParams = void 0,
  filteredDataRoute = "",
  entityName = "users"
}) {
  var _a, _b;
  const __ = useTranslation();
  const pageProps = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  const users = usersProp ?? pageProps.users ?? ((_b = pageProps.company) == null ? void 0 : _b.users) ?? { data: [], meta: { links: [], total: 0, current_page: 1, per_page: 10 } };
  const rows = useMemo(() => {
    if (Array.isArray(rowsProp)) return rowsProp;
    if (Array.isArray(pageProps.rows)) return pageProps.rows;
    const list = Array.isArray(users == null ? void 0 : users.data) ? users.data : Array.isArray(users) ? users : [];
    return list.map((u) => {
      const phones = Array.isArray(u.phones) ? u.phones : [];
      const primary = phones.find((p) => p.is_primary) ?? phones[0] ?? null;
      return {
        id: u.id,
        name: [u.name, u.surname].filter(Boolean).join(" "),
        position: u.position ?? null,
        email: u.email ?? null,
        phone_primary: (primary == null ? void 0 : primary.e164) ?? null,
        whatsapp: Boolean(primary == null ? void 0 : primary.is_whatsapp),
        phones_count: phones.length,
        phones: phones.map((p) => ({
          e164: p.e164,
          type: p.type,
          label: p.label,
          is_primary: !!p.is_primary,
          is_whatsapp: !!p.is_whatsapp
        }))
      };
    });
  }, [rowsProp, pageProps.rows, users]);
  return /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(
    TableUsers,
    {
      rows,
      users,
      tableId,
      queryParams: pageProps.queryParams ?? {},
      indexRoute,
      indexParams,
      filteredDataRoute,
      entityName,
      i18n: {
        // evita acoplar TableUsers a hooks/globales
        name: __("nombre"),
        position: __("puesto"),
        phone: __("telefono"),
        whatsapp: "WhatsApp",
        others: __("otros"),
        email: "Email",
        none: "—",
        moreSuffix: __("mas")
        // se usará como “X más”
      }
    }
  ) });
}
export {
  CompanyUsersTab as default
};
