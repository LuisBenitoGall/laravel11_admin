import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-CS968Wx3.js";
import { usePage, useForm, Head } from "@inertiajs/react";
import "react-tooltip";
import "react";
import { C as CompanyFormCreate } from "./CompanyFormCreate-BPjcyLNZ.js";
import { C as CompanyFormSearch } from "./CompanyFormSearch-DJBLKKDE.js";
import "./FileInput-U7oe6ye3.js";
import "./TextInput-CzxrbIpp.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import "axios";
import "@inertiajs/inertia";
import "./Header-Px-6ZOXw.js";
import "react-bootstrap";
import "./useSweetAlert-D4PAsWYN.js";
import "sweetalert2";
import "./Sidebar-CypaLfnr.js";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
import "./Checkbox-B7oBdKeZ.js";
import "./InfoPopover-CwWEvwXq.js";
import "./InputError-DME5vguS.js";
import "./PrimaryButton-B91ets3U.js";
import "./SelectSearch-C7ksrTDE.js";
import "react-select";
function Index({ auth, session, title, subtitle, side, other_companies, availableLocales }) {
  var _a;
  const __ = useTranslation();
  const props = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  props.locale || false;
  props.languages || [];
  const permissions = props.permissions || {};
  const { data, setData, post, reset, errors, processing } = useForm({
    name: "",
    tradename: "",
    nif: "",
    is_ute: false,
    auto_link: false
  });
  const actions = [];
  if (permissions == null ? void 0 : permissions["providers.index"]) {
    actions.push({
      text: __("proveedores_volver"),
      icon: "la-angle-left",
      url: "providers.index",
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
          /* @__PURE__ */ jsx("p", { className: "text-warning", children: __("empresa_selec_texto") }),
          /* @__PURE__ */ jsx(
            CompanyFormSearch,
            {
              side,
              options: other_companies.map((company) => ({ value: company.id, label: company.name }))
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "py-3", children: /* @__PURE__ */ jsx("hr", {}) }),
          /* @__PURE__ */ jsx("h5", { children: __("empresa_nueva") }),
          /* @__PURE__ */ jsx(CompanyFormCreate, { side })
        ] })
      ]
    }
  );
}
export {
  Index as default
};
