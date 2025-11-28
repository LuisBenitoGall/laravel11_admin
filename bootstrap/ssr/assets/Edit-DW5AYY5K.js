import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-CXi9lJ8D.js";
import { usePage, useForm, Head } from "@inertiajs/react";
import "@inertiajs/inertia";
import "react-tooltip";
import "react";
import "./TextInput-CzxrbIpp.js";
import { u as useSweetAlert } from "./useSweetAlert-D4PAsWYN.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import { T as Tabs } from "./Tabs-CZO-HKNH.js";
import MarketingListInfoTab from "./MarketingListInfoTab-B8IxSGQy.js";
import MarketingListMembersTab from "./MarketingListMembersTab-YsnP2JRu.js";
import "./Header-dr5I36ZE.js";
import "react-bootstrap";
import "sweetalert2";
import "./Sidebar-KWaSAYKU.js";
import "axios";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
import "./Checkbox-B7oBdKeZ.js";
import "./InputError-DME5vguS.js";
import "./PrimaryButton-B91ets3U.js";
import "./TableUsers-Evm6lNuM.js";
import "./useTableManagement-BYbZ3SAG.js";
import "react-datepicker";
import "date-fns";
import "date-fns/locale";
import "./SelectInput-DrqFt-OA.js";
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
function Index({ auth, session, title, subtitle, list, tab, members, rows, availableLocales }) {
  var _a;
  const __ = useTranslation();
  const props = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  props.locale || false;
  props.languages || [];
  useSweetAlert();
  const permissions = props.permissions || {};
  const rawQueryParams = props.queryParams || {};
  const queryParams = typeof rawQueryParams === "object" && rawQueryParams !== null ? rawQueryParams : {};
  const { data, setData, errors, processing } = useForm({
    name: list.name || "",
    status: list.status
  });
  const actions = [];
  if (permissions == null ? void 0 : permissions["marketing-lists.index"]) {
    actions.push({
      text: __("listas_volver"),
      icon: "la-angle-left",
      url: "marketing-lists.index",
      modal: false
    });
  }
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
        /* @__PURE__ */ jsxs("div", { className: "contents pb-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "row", children: [
            /* @__PURE__ */ jsx("div", { className: "col-12", children: /* @__PURE__ */ jsxs("h2", { children: [
              __("lista"),
              " ",
              /* @__PURE__ */ jsx("u", { children: list.name })
            ] }) }),
            /* @__PURE__ */ jsxs("div", { className: "col-12 mt-2 mb-4", children: [
              /* @__PURE__ */ jsxs("span", { className: "text-muted me-5", children: [
                __("creado"),
                ": ",
                /* @__PURE__ */ jsx("strong", { children: list.formatted_created_at })
              ] }),
              list.created_by_name && /* @__PURE__ */ jsxs("span", { className: "text-muted me-5", children: [
                __("creado_por"),
                ": ",
                /* @__PURE__ */ jsx("strong", { children: list.created_by_name })
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "text-muted", children: [
                __("actualizado"),
                ": ",
                /* @__PURE__ */ jsx("strong", { children: list.formatted_updated_at })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            Tabs,
            {
              tabs: [
                {
                  key: "info",
                  label: __("informacion_general"),
                  content: /* @__PURE__ */ jsx(
                    MarketingListInfoTab,
                    {
                      list,
                      side: "marketing-lists",
                      updateRoute: "marketing-lists.update",
                      updateParams: [list.id]
                    }
                  )
                },
                {
                  key: "members",
                  label: __("miembros"),
                  content: /* @__PURE__ */ jsx(
                    MarketingListMembersTab,
                    {
                      users: members ?? null,
                      rows: rows ?? [],
                      indexRoute: "marketing-lists.edit",
                      indexParams: [list.id, "members"],
                      tableId: "tblMarketingListMembers",
                      filteredDataRoute: "marketing-lists.members.filtered-data",
                      queryParams
                    }
                  )
                }
              ],
              defaultActive: tab
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
