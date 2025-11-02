import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-D8RSvDxD.js";
import { usePage, useForm, Head } from "@inertiajs/react";
import "react-tooltip";
import "react";
import { C as Checkbox } from "./Checkbox-B7oBdKeZ.js";
import "./FileInput-U7oe6ye3.js";
import { I as InputError } from "./InputError-DME5vguS.js";
import { P as PrimaryButton } from "./PrimaryButton-B91ets3U.js";
import { T as TextInput } from "./TextInput-p9mIVJQL.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import "axios";
import "@inertiajs/inertia";
import "./Header-BDD-uIND.js";
import "react-bootstrap";
import "./useSweetAlert-D4PAsWYN.js";
import "sweetalert2";
import "./Sidebar-BgmCyghN.js";
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
    code: "",
    alfa2: "",
    alfa3: "",
    flag: "",
    status: true
  });
  function handleSubmit(e) {
    e.preventDefault();
    post(route("countries.store"), {
      onSuccess: () => reset()
    });
  }
  const actions = [];
  if (permissions == null ? void 0 : permissions["countries.index"]) {
    actions.push({
      text: __("paises_volver"),
      icon: "la-angle-left",
      url: "countries.index",
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
          /* @__PURE__ */ jsxs("div", { className: "row gy-3 mb-3", children: [
            /* @__PURE__ */ jsx("div", { className: "col-lg-6", children: /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("label", { htmlFor: "name", className: "form-label", children: [
                __("pais"),
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
              /* @__PURE__ */ jsx(InputError, { message: errors.name })
            ] }) }),
            /* @__PURE__ */ jsx("div", { className: "col-lg-1 text-center", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "status", className: "form-label", children: __("estado") }),
              /* @__PURE__ */ jsx("div", { className: "pt-1 position-relative", children: /* @__PURE__ */ jsx(
                Checkbox,
                {
                  className: "xl",
                  name: "status",
                  checked: data.status,
                  onChange: (e) => setData("status", e.target.checked)
                }
              ) })
            ] }) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "row gy-3", children: [
            /* @__PURE__ */ jsx("div", { className: "col-lg-2", children: /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "code", className: "form-label", children: __("codigo") }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  className: "",
                  type: "text",
                  placeholder: __("codigo"),
                  value: data.code,
                  onChange: (e) => setData("code", e.target.value),
                  maxLength: 6
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.code })
            ] }) }),
            /* @__PURE__ */ jsx("div", { className: "col-lg-2", children: /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "alfa2", className: "form-label", children: __("Alfa 2") }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  className: "",
                  type: "text",
                  placeholder: __("Alfa 2"),
                  value: data.alfa2,
                  onChange: (e) => setData("alfa2", e.target.value),
                  maxLength: 2
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.alfa2 })
            ] }) }),
            /* @__PURE__ */ jsx("div", { className: "col-lg-2", children: /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "alfa3", className: "form-label", children: __("Alfa 3") }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  className: "",
                  type: "text",
                  placeholder: __("Alfa 3"),
                  value: data.alfa3,
                  onChange: (e) => setData("alfa3", e.target.value),
                  maxLength: 3
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.alfa3 })
            ] }) }),
            /* @__PURE__ */ jsx("div", { className: "col-lg-2", children: /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "flag", className: "form-label", children: __("bandera") }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  className: "",
                  type: "text",
                  placeholder: __("bandera"),
                  value: data.flag,
                  onChange: (e) => setData("flag", e.target.value),
                  maxLength: 6
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.flag })
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
