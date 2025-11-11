import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-CS968Wx3.js";
import { usePage, useForm, Head } from "@inertiajs/react";
import "react";
import { C as Checkbox } from "./Checkbox-B7oBdKeZ.js";
import { I as InputError } from "./InputError-DME5vguS.js";
import { R as RadioButton } from "./RadioButton-BQ8Yvx79.js";
import { T as TextInput } from "./TextInput-CzxrbIpp.js";
import { P as PrimaryButton } from "./PrimaryButton-B91ets3U.js";
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
function Create({ auth, session, title, subtitle, roles = {}, availableLocales }) {
  var _a;
  const __ = useTranslation();
  const props = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  props.locale || false;
  props.languages || [];
  const permissions = props.permissions || {};
  const arrRoles = Object.entries(roles).map(([key, label]) => ({
    value: key,
    label
  }));
  const { data, setData, post, reset, errors, processing } = useForm({
    role: "",
    name: "",
    surname: "",
    email: "",
    status: true,
    link_company: true,
    send_password: false
  });
  function handleSubmit(e) {
    e.preventDefault();
    post(route("users.store"), {
      onSuccess: () => reset()
    });
  }
  const actions = [];
  if (permissions == null ? void 0 : permissions["users.index"]) {
    actions.push({
      text: __("usuarios_volver"),
      icon: "la-angle-left",
      url: "users.index",
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
        /* @__PURE__ */ jsx("div", { className: "contents pb-4", children: /* @__PURE__ */ jsx("form", { onSubmit: handleSubmit, children: /* @__PURE__ */ jsxs("div", { className: "row gy-3 mb-3", children: [
          /* @__PURE__ */ jsx("div", { className: "col-12", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
            /* @__PURE__ */ jsxs("label", { htmlFor: "role", className: "form-label", children: [
              __("role"),
              "*"
            ] }),
            /* @__PURE__ */ jsx(
              RadioButton,
              {
                name: "role",
                value: data.role,
                onChange: (e) => setData("role", e.target.value),
                options: arrRoles,
                required: true
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.role })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "col-md-6", children: /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("label", { htmlFor: "name", className: "form-label", children: [
              __("nombre"),
              "*"
            ] }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                type: "text",
                name: "name",
                value: data.name,
                onChange: (e) => setData("name", e.target.value),
                maxLength: 150,
                required: true
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.name })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "col-md-6", children: /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("label", { htmlFor: "surname", className: "form-label", children: [
              __("apellidos"),
              "*"
            ] }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                type: "text",
                name: "surname",
                value: data.surname,
                onChange: (e) => setData("surname", e.target.value),
                maxLength: 150,
                required: true
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.surname })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "col-md-6", children: /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("label", { htmlFor: "name", className: "form-label", children: [
              __("email"),
              "*"
            ] }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                type: "email",
                name: "email",
                value: data.email,
                onChange: (e) => setData("email", e.target.value),
                maxLength: 100,
                required: true
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.email })
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
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "col-lg-2 text-center", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "link_company", className: "form-label", children: __("vincular_a_empresa") }),
            /* @__PURE__ */ jsx("div", { className: "pt-1 position-relative", children: /* @__PURE__ */ jsx(
              Checkbox,
              {
                className: "xl",
                name: "link_company",
                checked: data.link_company,
                onChange: (e) => setData("link_company", e.target.checked)
              }
            ) })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "col-md-3 text-center", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "send_password", className: "form-label", children: __("usuario_envio_password") }),
            /* @__PURE__ */ jsx("div", { className: "pt-1 position-relative", children: /* @__PURE__ */ jsx(
              Checkbox,
              {
                className: "xl",
                name: "send_password",
                checked: data.send_password,
                onChange: (e) => setData("send_password", e.target.checked)
              }
            ) })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "mt-4 text-end", children: /* @__PURE__ */ jsx(PrimaryButton, { disabled: processing, className: "btn btn-rdn", children: processing ? __("procesando") + "..." : __("guardar") }) })
        ] }) }) })
      ]
    }
  );
}
export {
  Create as default
};
