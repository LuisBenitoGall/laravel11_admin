import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-DxQfZ-Jg.js";
import { usePage, useForm, Head } from "@inertiajs/react";
import { I as InputError } from "./InputError-DME5vguS.js";
import { P as PrimaryButton } from "./PrimaryButton-B91ets3U.js";
import { T as TextInput } from "./TextInput-p9mIVJQL.js";
import { S as SelectInput } from "./SelectInput-DrqFt-OA.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import "react";
import "axios";
import "@inertiajs/inertia";
import "./Header-BI4rRLdV.js";
import "react-bootstrap";
import "./useSweetAlert-D4PAsWYN.js";
import "sweetalert2";
import "./Sidebar-CtyD8dde.js";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
function Create({ auth, title, subtitle, module, slug, functionalities, availableLocales }) {
  var _a;
  const __ = useTranslation();
  const props = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  const permissions = props.permissions || {};
  const functionalitiesArray = Object.entries(functionalities || {}).map(([key, value]) => ({
    value: key,
    label: value
  }));
  const { data, setData, post, reset, errors, processing } = useForm({
    name: "",
    functionality: ""
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    post(route("permissions.store"), {
      onSuccess: () => reset()
    });
  };
  const actions = [];
  if (permissions == null ? void 0 : permissions["permissions.index"]) {
    actions.push({
      text: __("permisos_volver"),
      icon: "la-angle-left",
      url: "permissions.index",
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
        /* @__PURE__ */ jsx("div", { className: "contents pb-4", children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
          /* @__PURE__ */ jsxs("div", { className: "row gy-3", children: [
            /* @__PURE__ */ jsx("div", { className: "col-lg-6", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
              /* @__PURE__ */ jsxs("label", { htmlFor: "functionality", className: "form-label", children: [
                __("funcionalidad"),
                "*"
              ] }),
              /* @__PURE__ */ jsxs(
                SelectInput,
                {
                  className: "form-select",
                  name: "functionality",
                  value: data.functionality,
                  onChange: (e) => setData("functionality", e.target.value),
                  required: true,
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "", children: __("opcion_selec") }),
                    functionalitiesArray.map((option) => /* @__PURE__ */ jsx("option", { value: option.value, children: option.label }, option.value))
                  ]
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.functionality })
            ] }) }),
            /* @__PURE__ */ jsx("div", { className: "col-lg-6", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
              /* @__PURE__ */ jsxs("label", { htmlFor: "name", className: "form-label", children: [
                __("permiso"),
                "*"
              ] }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  type: "text",
                  name: "name",
                  value: data.name,
                  onChange: (e) => setData("name", e.target.value),
                  maxLength: 100,
                  required: true
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.name })
            ] }) })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mt-4 text-end", children: /* @__PURE__ */ jsx(PrimaryButton, { disabled: processing, className: "btn btn-rdn", children: processing ? __("procesando") + "..." : __("guardar") }) })
        ] }) })
      ]
    }
  );
}
export {
  Create as default
};
