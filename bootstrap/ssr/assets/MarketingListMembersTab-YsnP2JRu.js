import { jsx } from "react/jsx-runtime";
import { useMemo } from "react";
import { usePage } from "@inertiajs/react";
import { T as TableUsers } from "./TableUsers-Evm6lNuM.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import "react-bootstrap";
import "./useTableManagement-BYbZ3SAG.js";
import "react-datepicker";
import "date-fns";
import "date-fns/locale";
import "./SelectInput-DrqFt-OA.js";
import "./TextInput-CzxrbIpp.js";
import "axios";
import "./useSweetAlert-D4PAsWYN.js";
import "sweetalert2";
import "./ShowRegisterButton-DPAZE_RX.js";
import "prop-types";
import "./TableExporter-DatfQStH.js";
import "jspdf";
import "jspdf-autotable";
import "exceljs";
import "file-saver";
import "./StatusButton-DfO41WfJ.js";
import "./UserShowView-BsMJBKtO.js";
import "./ManagePhones-C_mhnW8c.js";
import "./renderCellContent-uXg9jeR2.js";
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
  const rows = useMemo(() => {
    if (Array.isArray(rowsProp)) return rowsProp;
    if (Array.isArray(pageProps.rows)) return pageProps.rows;
    const list = Array.isArray(usersProp == null ? void 0 : usersProp.data) ? usersProp.data : Array.isArray(usersProp) ? usersProp : [];
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
  }, [rowsProp, pageProps.rows, usersProp]);
  const editCtxId = userEditCompanyId;
  return /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(
    TableUsers,
    {
      rows,
      users: usersProp,
      tableId,
      queryParams: pageProps.queryParams ?? {},
      indexRoute,
      indexParams,
      filteredDataRoute,
      entityName,
      disablePagination: false,
      userEditCompanyId: editCtxId,
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
  MarketingListMembersTab as default
};
