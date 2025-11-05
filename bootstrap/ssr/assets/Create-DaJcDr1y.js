import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-Be6zbhrA.js";
import { usePage, useForm, Head } from "@inertiajs/react";
import { C as Checkbox } from "./Checkbox-B7oBdKeZ.js";
import { I as InputError } from "./InputError-DME5vguS.js";
import { P as PrimaryButton } from "./PrimaryButton-B91ets3U.js";
import { T as TextInput } from "./TextInput-CzxrbIpp.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import "react";
import "axios";
import "@inertiajs/inertia";
import "./Header-DmTv-HRw.js";
import "react-bootstrap";
import "./useSweetAlert-D4PAsWYN.js";
import "sweetalert2";
import "./Sidebar-j3CEPiJG.js";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
function Create({ auth, session, title, subtitle, company, availableLocales }) {
  var _a;
  const __ = useTranslation();
  const props = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  const permissions = props.permissions || {};
  const { data, setData, post, reset, errors, processing } = useForm({ name: "", status: 1 });
  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    if (type === "checkbox") {
      setData(name, checked ? 1 : 0);
    } else {
      setData(name, value);
    }
  };
  function handleSubmit(e) {
    e.preventDefault();
    post(route("business-areas.store"), { onSuccess: () => reset() });
  }
  const actions = [];
  if (permissions == null ? void 0 : permissions["business-areas.index"]) {
    actions.push({ text: __("areas_negocio_volver"), icon: "la-angle-left", url: "business-areas.index", modal: false });
  }
  return /* @__PURE__ */ jsxs(AdminAuthenticated, { user: auth.user, title, subtitle, actions, children: [
    /* @__PURE__ */ jsx(Head, { title }),
    /* @__PURE__ */ jsxs("div", { className: "contents pb-4", children: [
      /* @__PURE__ */ jsx("div", { className: "row", children: /* @__PURE__ */ jsx("div", { className: "col-12", children: /* @__PURE__ */ jsxs("h2", { children: [
        __("area_nueva"),
        " ",
        /* @__PURE__ */ jsx("u", { children: company == null ? void 0 : company.name })
      ] }) }) }),
      /* @__PURE__ */ jsx("form", { onSubmit: handleSubmit, children: /* @__PURE__ */ jsxs("div", { className: "row gy-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "col-lg-6", children: [
          /* @__PURE__ */ jsxs("label", { htmlFor: "name", className: "form-label", children: [
            __("nombre"),
            "*"
          ] }),
          /* @__PURE__ */ jsx(TextInput, { className: "", type: "text", placeholder: __("nombre"), value: data.name, onChange: (e) => setData("name", e.target.value), maxLength: 150, required: true }),
          /* @__PURE__ */ jsx(InputError, { message: errors.name })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "col-lg-2 text-center", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "status", className: "form-label", children: __("estado") }),
          /* @__PURE__ */ jsx("div", { className: "pt-1 position-relative", children: /* @__PURE__ */ jsx(Checkbox, { className: "xl", name: "status", checked: !!data.status, onChange: handleChange }) }),
          /* @__PURE__ */ jsx(InputError, { message: errors.status })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-4 text-end", children: /* @__PURE__ */ jsx(PrimaryButton, { disabled: processing, className: "btn btn-rdn", children: processing ? __("procesando") + "..." : __("guardar") }) })
      ] }) })
    ] })
  ] });
}
export {
  Create as default
};
