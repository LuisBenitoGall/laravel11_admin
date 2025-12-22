import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-C651LzvL.js";
import { usePage, Head } from "@inertiajs/react";
import "@inertiajs/inertia";
import "react-tooltip";
import "react";
import "./TextInput-CzxrbIpp.js";
import "sweetalert2";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import { T as Tabs } from "./Tabs-CZO-HKNH.js";
import MarketingCampaignInfoTab from "./MarketingCampaignInfoTab-CUEQNekb.js";
import MarketingCampaignMembersTab from "./MarketingCampaignListsTab-D3pW5wKx.js";
import "./Header-DbWsFjJj.js";
import "react-bootstrap";
import "./useSweetAlert-D4PAsWYN.js";
import "./Sidebar-BsJktKN8.js";
import "axios";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
import "./PrimaryButton-CIbKPOjQ.js";
import "./SelectInput-DrqFt-OA.js";
import "./ShowRegister-ChxyE8YT.js";
import "prop-types";
import "./StatusButton-DfO41WfJ.js";
function Index({
  auth,
  session,
  title,
  subtitle,
  campaign,
  tab,
  costCenters,
  owners,
  currencies,
  campaignStatus,
  priorities,
  availableLocales
}) {
  var _a;
  const __ = useTranslation();
  const props = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  props.locale || false;
  props.languages || [];
  const permissions = props.permissions || {};
  const actions = [];
  if (permissions == null ? void 0 : permissions["marketing-campaigns.index"]) {
    actions.push({
      text: __("campanyas_volver"),
      icon: "la-angle-left",
      url: "marketing-campaigns.index",
      modal: false
    });
  }
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
        /* @__PURE__ */ jsxs("div", { className: "contents pb-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "row", children: [
            /* @__PURE__ */ jsx("div", { className: "col-12", children: /* @__PURE__ */ jsxs("h2", { children: [
              __("campanya"),
              " ",
              /* @__PURE__ */ jsx("u", { children: campaign.name })
            ] }) }),
            /* @__PURE__ */ jsxs("div", { className: "col-12 mt-2 mb-4", children: [
              /* @__PURE__ */ jsxs("span", { className: "text-muted me-5", children: [
                __("creado"),
                ": ",
                /* @__PURE__ */ jsx("strong", { children: campaign.formatted_created_at })
              ] }),
              campaign.created_by_name && /* @__PURE__ */ jsxs("span", { className: "text-muted me-5", children: [
                __("creado_por"),
                ": ",
                /* @__PURE__ */ jsx("strong", { children: campaign.created_by_name })
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "text-muted", children: [
                __("actualizado"),
                ": ",
                /* @__PURE__ */ jsx("strong", { children: campaign.formatted_updated_at })
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
                    MarketingCampaignInfoTab,
                    {
                      campaign,
                      side: "marketing-campaigns",
                      updateRoute: "marketing-campaigns.update",
                      updateParams: [campaign.id]
                    }
                  )
                },
                {
                  key: "lists",
                  label: __("listas"),
                  content: /* @__PURE__ */ jsx(
                    MarketingCampaignMembersTab,
                    {
                      users: members ?? null,
                      rows: rows ?? [],
                      indexRoute: "marketing-campaigns.edit",
                      indexParams: [list.id, "members"],
                      tableId: "tblMarketingListMembers",
                      filteredDataRoute: "marketing-campaigns.members.filtered-data",
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
