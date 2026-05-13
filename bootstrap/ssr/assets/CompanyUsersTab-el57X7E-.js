import { jsx } from "react/jsx-runtime";
import { useMemo } from "react";
import { usePage } from "@inertiajs/react";
import { T as TableUsers } from "./TableUsers-D6ox5EVU.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import "react-bootstrap";
import "./SortControl-BYPcBqgI.js";
import "react-datepicker";
import "date-fns";
import "date-fns/locale";
import "./SelectInput-BpRRLwUE.js";
import "./TextInput-CzxrbIpp.js";
import "./ShowRegisterButton-DPAZE_RX.js";
import "prop-types";
import "axios";
import "./TableExporter-Bc1iQF0N.js";
import "./StatusButton-DfO41WfJ.js";
import "./useTableManagement-DhW01hp7.js";
import "./useSweetAlert-D4PAsWYN.js";
import "sweetalert2";
import "./UserShowView-BriFAEee.js";
import "./ManagePhones-LdkmCbcO.js";
import "./renderCellContent-9r3OTWM8.js";
function CompanyUsersTab({
  users: usersProp = null,
  rows: rowsProp = null,
  tableId = "tblCompanyUsers",
  indexRoute = "",
  indexParams = void 0,
  filteredDataRoute = "",
  entityName = "users",
  userEditCompanyId = null,
  deleteUserRoute = "user-companies.destroy",
  editFromAccountId = null
}) {
  var _a, _b, _c, _d;
  const __ = useTranslation();
  const pageProps = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  const editCtxId = userEditCompanyId ?? ((_b = pageProps == null ? void 0 : pageProps.crm_account) == null ? void 0 : _b.linked_company_id) ?? ((_c = pageProps == null ? void 0 : pageProps.company) == null ? void 0 : _c.id) ?? null;
  const users = usersProp ?? pageProps.users ?? ((_d = pageProps.company) == null ? void 0 : _d.users) ?? { data: [], meta: { links: [], total: 0, current_page: 1, per_page: 10 } };
  const rows = useMemo(() => {
    if (Array.isArray(rowsProp)) return rowsProp;
    if (Array.isArray(pageProps.rows)) return pageProps.rows;
    const list = Array.isArray(users == null ? void 0 : users.data) ? users.data : Array.isArray(users) ? users : [];
    return list.map((u) => {
      const phones = Array.isArray(u.phones) ? u.phones : [];
      const primary = phones.find((p) => p.is_primary) ?? phones[0] ?? null;
      const relationId = u.user_company_id ?? u.pivot_id ?? (u.pivot && typeof u.pivot.id !== "undefined" ? u.pivot.id : null) ?? u.id;
      return {
        id: relationId,
        user_id: u.id,
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
  const effectiveIndexParams = indexParams ?? (editFromAccountId ? [editFromAccountId] : void 0);
  return /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(
    TableUsers,
    {
      rows,
      users,
      tableId,
      queryParams: pageProps.queryParams ?? {},
      indexRoute,
      indexParams: effectiveIndexParams,
      filteredDataRoute,
      entityName,
      disablePagination: true,
      userEditCompanyId: editCtxId,
      deleteUserRoute,
      editFromAccountId,
      i18n: {
        name: __("nombre"),
        position: __("puesto"),
        phone: __("telefono"),
        whatsapp: "WhatsApp",
        others: __("otros"),
        email: "Email",
        none: "—",
        moreSuffix: __("mas")
      }
    }
  ) });
}
export {
  CompanyUsersTab as default
};
