import { jsx } from "react/jsx-runtime";
import { useMemo } from "react";
import { usePage } from "@inertiajs/react";
import { T as TableUsers } from "./TableUsers-DnSnGial.js";
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
import "./UserShowView-CJCAJiz0.js";
import "./ManagePhones-LdkmCbcO.js";
import "./renderCellContent-DJWyVzIY.js";
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
