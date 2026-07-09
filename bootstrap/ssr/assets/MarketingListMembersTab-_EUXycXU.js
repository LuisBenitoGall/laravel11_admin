import { jsxs, jsx } from "react/jsx-runtime";
import React, { useMemo } from "react";
import { usePage, Link } from "@inertiajs/react";
import { T as TableUsers } from "./TableUsers-Bq29FRJM.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import "react-bootstrap";
import "./SortControl-B-edZX2D.js";
import "react-datepicker";
import "date-fns";
import "date-fns/locale";
import "./SelectInput-BpRRLwUE.js";
import "./TextInput-CzxrbIpp.js";
import "./ShowRegisterButton-DPAZE_RX.js";
import "prop-types";
import "axios";
import "./TableExporter-CrDOX5NX.js";
import "./StatusButton-DfO41WfJ.js";
import "./useTableManagement-UWRr8jtd.js";
import "./useSweetAlert-D4PAsWYN.js";
import "sweetalert2";
import "./UserShowView-Uc93NpSJ.js";
import "./ManagePhones-8V9K-iFw.js";
import "./renderCellContent-DJWyVzIY.js";
function MarketingListMembersTab({
  users: usersProp = null,
  rows: rowsProp = null,
  tableId = "tblMarketingListMembers",
  indexRoute = "",
  indexParams = void 0,
  filteredDataRoute = "",
  entityName = "users",
  userEditCompanyId = null
}) {
  var _a;
  const __ = useTranslation();
  const pageProps = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  const columns = useMemo(() => [
    { key: "name", label: __("nombre"), sort: true, filter: "text", class_th: "", class_td: "", placeholder: __("nombre_filtrar") },
    { key: "email", label: __("email"), sort: true, filter: "text", class_th: "", class_td: "", placeholder: __("email_filtrar") },
    { key: "other_emails", label: __("otros_emails"), sort: false, filter: "text", class_th: "", class_td: "", placeholder: __("otros_emails_filtrar"), exportValue: (v) => Array.isArray(v) ? v.filter(Boolean).join("; ") : v ?? "" },
    { key: "phones", label: __("telefonos"), sort: true, filter: "text", class_th: "", class_td: "", placeholder: __("telefonos_filtrar"), exportValue: (v) => Array.isArray(v) ? v.map((p) => p.e164).filter(Boolean).join("; ") : v ?? "" },
    { key: "position", label: __("cargo"), sort: false, filter: "text", class_th: "", class_td: "" },
    {
      key: "accounts",
      label: __("cuentas"),
      sort: false,
      filter: "text",
      class_th: "",
      class_td: "",
      placeholder: __("cuentas_filtrar"),
      exportValue: (v) => Array.isArray(v) ? v.map((a) => a.name).join(", ") : v ?? "",
      render: ({ value }) => {
        if (!Array.isArray(value) || !value.length) return "—";
        return value.map((a, i) => /* @__PURE__ */ jsxs(React.Fragment, { children: [
          i > 0 && ", ",
          /* @__PURE__ */ jsx(Link, { href: route("crm-accounts.edit", a.id), className: "link-text", children: a.name })
        ] }, a.id));
      }
    },
    { key: "avatar", label: __("imagen"), sort: false, filter: "", type: "image", icon: "user-tie", class_th: "text-center", class_td: "text-center", placeholder: "", defaultHidden: true, noExport: true },
    { key: "created_at", label: __("fecha_alta"), sort: true, filter: "date", dateKeys: ["date_from", "date_to"], filterOnly: true, noExport: true }
  ], [__]);
  const users = usersProp ?? pageProps.users ?? null;
  const rows = useMemo(() => {
    if (Array.isArray(rowsProp)) return rowsProp;
    if (Array.isArray(pageProps.rows)) return pageProps.rows;
    const source = Array.isArray(users == null ? void 0 : users.data) ? users.data : Array.isArray(users) ? users : [];
    return source.map((u) => {
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
  const editCtxId = userEditCompanyId;
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
      columns,
      deleteUserRoute: "marketing-list-users.destroy",
      rowDeleteKey: "mlu_id",
      disablePagination: false,
      userEditCompanyId: editCtxId,
      labelName: "miembros"
    }
  ) });
}
export {
  MarketingListMembersTab as default
};
