import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-D0ivmZ8I.js";
import { usePage, useForm, Head } from "@inertiajs/react";
import "react-tooltip";
import "react";
import { C as CompanyFormCreate } from "./CompanyFormCreate-vbwjb-7h.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import "@inertiajs/inertia";
import "./Header-DbWsFjJj.js";
import "react-bootstrap";
import "./useSweetAlert-D4PAsWYN.js";
import "sweetalert2";
import "./Sidebar-YTcA2cN_.js";
import "axios";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
import "./TextInput-CzxrbIpp.js";
import "./Checkbox-C9HPJULq.js";
import "./FileInput-U7oe6ye3.js";
import "./InfoPopover-CwWEvwXq.js";
import "./InputError-DME5vguS.js";
import "./PrimaryButton-CIbKPOjQ.js";
function Index({ auth, session, title, subtitle, availableLocales }) {
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
  if (permissions == null ? void 0 : permissions["companies.index"]) {
    actions.push({
      text: __("empresas_volver"),
      icon: "la-angle-left",
      url: "companies.index",
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
        /* @__PURE__ */ jsx("div", { className: "contents pb-4", children: /* @__PURE__ */ jsx(CompanyFormCreate, {}) })
      ]
    }
  );
}
export {
  Index as default
};
