import { jsx } from "react/jsx-runtime";
import "react";
import { usePage } from "@inertiajs/react";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import "./SelectInput-DrqFt-OA.js";
import "./TextInput-CzxrbIpp.js";
import "./ShowRegister-ChxyE8YT.js";
import "./StatusButton-DfO41WfJ.js";
import "sweetalert2";
import "prop-types";
import "axios";
import "react-bootstrap";
function MarketingCampaignMembersTab({
  users: usersProp = null,
  rows: rowsProp = null,
  tableId = "tblMarketingCampaignMembers",
  indexRoute = "",
  indexParams = void 0,
  filteredDataRoute = "",
  entityName = "users",
  userEditCompanyId = null
}) {
  var _a;
  useTranslation();
  const pageProps = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  usersProp ?? pageProps.users ?? null;
  return /* @__PURE__ */ jsx("div", {});
}
export {
  MarketingCampaignMembersTab as default
};
