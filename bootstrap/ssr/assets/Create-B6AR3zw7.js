import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-DT2NIV1N.js";
import { usePage, useForm, Head } from "@inertiajs/react";
import { C as Checkbox } from "./Checkbox-B7oBdKeZ.js";
import { I as InputError } from "./InputError-DME5vguS.js";
import { P as PrimaryButton } from "./PrimaryButton-B91ets3U.js";
import { T as Textarea } from "./Textarea-nvTyMSx8.js";
import { T as TextInput } from "./TextInput-CzxrbIpp.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import "react";
import "axios";
import "@inertiajs/inertia";
import "./Header-kwxCeG5H.js";
import "react-bootstrap";
import "./useSweetAlert-D4PAsWYN.js";
import "sweetalert2";
import "./Sidebar-BV0-sS1Z.js";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
import "react-draft-wysiwyg";
import "draft-js";
import "html-to-draftjs";
import "draftjs-to-html";
/* empty css                             */
function Create({ auth, title, subtitle, module, slug, availableLocales }) {
  var _a;
  const __ = useTranslation();
  const props = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  const permissions = props.permissions || {};
  const { data, setData, post, reset, errors, processing } = useForm({
    name: "",
    universal: true,
    description: ""
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    post(route("roles.store"), {
      onSuccess: () => reset()
    });
  };
  const actions = [];
  if (permissions == null ? void 0 : permissions["roles.index"]) {
    actions.push({
      text: __("roles_volver"),
      icon: "la-angle-left",
      url: "roles.index",
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
              /* @__PURE__ */ jsxs("label", { htmlFor: "name", className: "form-label", children: [
                __("role"),
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
            ] }) }),
            /* @__PURE__ */ jsx("div", { className: "col-lg-2 text-center", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "universal", className: "form-label", children: __("role_universal") }),
              /* @__PURE__ */ jsx("div", { className: "pt-1 position-relative", children: /* @__PURE__ */ jsx(
                Checkbox,
                {
                  className: "xl",
                  name: "universal",
                  checked: data.universal,
                  onChange: (e) => setData("universal", e.target.checked)
                }
              ) })
            ] }) }),
            /* @__PURE__ */ jsx("div", { className: "col-12", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "description", className: "form-label", children: __("descripcion") }),
              /* @__PURE__ */ jsx(
                Textarea,
                {
                  id: "description",
                  name: "description",
                  value: data.description ?? "",
                  onChange: (e) => {
                    console.log("description value", e.target.value);
                    setData("description", e.target.value);
                  },
                  className: "form-control"
                }
              )
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
