import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-BAKikn-7.js";
import { usePage, useForm, Head } from "@inertiajs/react";
import "react-tooltip";
import "react";
import { C as CompanyFormCreate } from "./CompanyFormCreate-vbwjb-7h.js";
import { C as CompanyFormSearch } from "./CompanyFormSearch-B58zbhM0.js";
import "./FileInput-U7oe6ye3.js";
import "./TextInput-CzxrbIpp.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import "@inertiajs/inertia";
import "./Header-BVvoXjVe.js";
import "react-bootstrap";
import "./useSweetAlert-D4PAsWYN.js";
import "sweetalert2";
import "./Sidebar-1g4CKLZI.js";
import "axios";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
import "./Checkbox-C9HPJULq.js";
import "./InfoPopover-CwWEvwXq.js";
import "./InputError-DME5vguS.js";
import "./PrimaryButton-CIbKPOjQ.js";
import "./SelectSearch-x7o6yKJV.js";
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
