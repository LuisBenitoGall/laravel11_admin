import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-C61SrhEp.js";
import { usePage, useForm, Head } from "@inertiajs/react";
import "@inertiajs/inertia";
import "react-tooltip";
import "react";
import "./TextInput-CzxrbIpp.js";
import { u as useSweetAlert } from "./useSweetAlert-D4PAsWYN.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import "axios";
import "./Header-dr5I36ZE.js";
import "react-bootstrap";
import "sweetalert2";
import "./Sidebar-KWaSAYKU.js";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
function Index({ auth, session, title, subtitle, list, availableLocales }) {
  var _a;
  const __ = useTranslation();
  const props = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  props.locale || false;
  props.languages || [];
  useSweetAlert();
  const permissions = props.permissions || {};
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
  return /* @__PURE__ */ jsxs(
    AdminAuthenticated,
    {
      user: auth.user,
      title,
      subtitle,
      actions,
      children: [
        /* @__PURE__ */ jsx(Head, { title }),
        /* @__PURE__ */ jsx("div", { className: "contents pb-4", children: /* @__PURE__ */ jsxs("div", { className: "row", children: [
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
            /* @__PURE__ */ jsxs("span", { className: "text-muted", children: [
              __("actualizado"),
              ": ",
              /* @__PURE__ */ jsx("strong", { children: list.formatted_updated_at })
            ] })
          ] })
        ] }) })
      ]
    }
  );
}
export {
  Index as default
};
