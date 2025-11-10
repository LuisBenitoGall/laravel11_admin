import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-DT2NIV1N.js";
import { usePage, useForm, Head } from "@inertiajs/react";
import "react-tooltip";
import "react";
import { C as Checkbox } from "./Checkbox-B7oBdKeZ.js";
import { I as InputError } from "./InputError-DME5vguS.js";
import { P as PrimaryButton } from "./PrimaryButton-B91ets3U.js";
import { R as RadioButton } from "./RadioButton-BQ8Yvx79.js";
import "react-draft-wysiwyg";
import "draft-js";
import "html-to-draftjs";
import "draftjs-to-html";
/* empty css                             */
import { T as TextInput } from "./TextInput-CzxrbIpp.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
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
function Index({ auth, session, title, subtitle, availableLocales }) {
  var _a;
  const __ = useTranslation();
  const props = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  props.locale || false;
  props.languages || [];
  const permissions = props.permissions || {};
  const { data, setData, post, reset, errors, processing } = useForm({
    name: "",
    type: "",
    status: true
  });
  function handleSubmit(e) {
    e.preventDefault();
    post(route("contents.store"), {
      onSuccess: () => reset()
    });
  }
  const actions = [];
  if (permissions == null ? void 0 : permissions["contents.index"]) {
    actions.push({
      text: __("contenidos_volver"),
      icon: "la-angle-left",
      url: "contents.index",
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
            /* @__PURE__ */ jsx("div", { className: "col-lg-6", children: /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("label", { htmlFor: "name", className: "form-label", children: [
                __("contenido_nombre"),
                "*"
              ] }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  className: "",
                  type: "text",
                  placeholder: __("nombre"),
                  value: data.name,
                  onChange: (e) => setData("name", e.target.value),
                  maxLength: 100,
                  required: true
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.name }),
              /* @__PURE__ */ jsx(InputError, { message: errors.code })
            ] }) }),
            /* @__PURE__ */ jsx("div", { className: "col-lg-2 text-center", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "status", className: "form-label", children: __("contenido_activo") }),
              /* @__PURE__ */ jsx("div", { className: "pt-1 position-relative", children: /* @__PURE__ */ jsx(
                Checkbox,
                {
                  className: "xl",
                  name: "status",
                  checked: data.status,
                  onChange: (e) => setData("status", e.target.checked)
                }
              ) })
            ] }) }),
            /* @__PURE__ */ jsx("div", { className: "col-lg-4", children: /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("label", { htmlFor: "type", className: "form-label", children: [
                __("tipo"),
                "*"
              ] }),
              /* @__PURE__ */ jsx(
                RadioButton,
                {
                  name: "sign",
                  value: data.type,
                  onChange: (e) => setData("type", e.target.value),
                  inline: true,
                  options: [
                    { label: __("informacion"), value: 1 },
                    { label: __("contenido"), value: 2 }
                  ],
                  required: true
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.type })
            ] }) })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mt-4 text-end", children: /* @__PURE__ */ jsx(PrimaryButton, { disabled: processing, className: "btn btn-rdn", children: processing ? __("procesando") + "..." : __("guardar") }) })
        ] }) })
      ]
    }
  );
}
export {
  Index as default
};
