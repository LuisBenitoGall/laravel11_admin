import { jsxs, jsx } from "react/jsx-runtime";
import { useForm, Head, Link } from "@inertiajs/react";
import { G as Guest } from "./GuestLayout-BrGcrN9k.js";
import { A as AuthLeftColumn } from "./AuthLeftColumn-B2ZEBG4t.js";
import { I as InputError } from "./InputError-DME5vguS.js";
import { I as InputLabel } from "./InputLabel-uXgJWz9w.js";
import { S as SecondaryButton } from "./SecondaryButton-CXDrSeVp.js";
import { T as TextInput } from "./TextInput-p9mIVJQL.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import "./Header-CrOe23WK.js";
import "react";
function Register({ status }) {
  const __ = useTranslation();
  const { data, setData, post, processing, errors, reset } = useForm({
    name: "",
    email: "",
    password: "",
    password_confirmation: ""
  });
  const submit = (e) => {
    e.preventDefault();
    post(route("register"), {
      onFinish: () => reset("password", "password_confirmation")
    });
  };
  return /* @__PURE__ */ jsxs(Guest, { children: [
    /* @__PURE__ */ jsx(Head, { title: __("registro") }),
    status && /* @__PURE__ */ jsx("div", { className: "mb-4 font-medium text-sm text-green-600", children: status }),
    errors && errors.length > 0 && /* @__PURE__ */ jsx("div", { className: "mb-4 font-medium text-sm text-red-600", children: errors[0] }),
    /* @__PURE__ */ jsx("div", { className: "auth-page-content overflow-hidden pt-lg-5", id: "auth-page", children: /* @__PURE__ */ jsx("div", { className: "container", children: /* @__PURE__ */ jsx("div", { className: "row mt-5 mt-lg-0", children: /* @__PURE__ */ jsx("div", { className: "col-lg-12", children: /* @__PURE__ */ jsx("div", { className: "card overflow-hidden galaxy-border-none card-bg-fill", children: /* @__PURE__ */ jsxs("div", { className: "row justify-content-center g-0", children: [
      /* @__PURE__ */ jsx(AuthLeftColumn, {}),
      /* @__PURE__ */ jsx("div", { className: "col-lg-6", children: /* @__PURE__ */ jsxs("div", { className: "p-lg-5 p-4", children: [
        /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("h5", { className: "text-primary text-bold mb-4", children: __("registrate_texto") }) }),
        /* @__PURE__ */ jsxs("form", { onSubmit: submit, children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { htmlFor: "name", value: __("nombre") }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "name",
                name: "name",
                value: data.name,
                className: "mt-1 block w-full",
                autoComplete: "name",
                isFocused: true,
                onChange: (e) => setData("name", e.target.value),
                required: true
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.name, className: "mt-2" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
            /* @__PURE__ */ jsx(InputLabel, { htmlFor: "email", value: __("email") }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "email",
                type: "email",
                name: "email",
                value: data.email,
                className: "mt-1 block w-full",
                autoComplete: "username",
                onChange: (e) => setData("email", e.target.value),
                required: true
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.email, className: "mt-2" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
            /* @__PURE__ */ jsx(InputLabel, { htmlFor: "password", value: __("contrasena") }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "password",
                type: "password",
                name: "password",
                value: data.password,
                className: "mt-1 block w-full",
                autoComplete: "new-password",
                onChange: (e) => setData("password", e.target.value),
                required: true
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.password, className: "mt-2" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
            /* @__PURE__ */ jsx(InputLabel, { htmlFor: "password_confirmation", value: __("contrasena_confirmar") }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "password_confirmation",
                type: "password",
                name: "password_confirmation",
                value: data.password_confirmation,
                className: "mt-1 block w-full",
                autoComplete: "new-password",
                onChange: (e) => setData("password_confirmation", e.target.value),
                required: true
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.password_confirmation, className: "mt-2" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end mt-4 mb-4", children: [
            /* @__PURE__ */ jsx(
              Link,
              {
                href: route("login"),
                className: "underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
                children: __("tengo_cuenta")
              }
            ),
            /* @__PURE__ */ jsx(
              SecondaryButton,
              {
                type: "submit",
                className: "ms-4",
                disabled: processing,
                children: __("registro")
              }
            )
          ] })
        ] })
      ] }) })
    ] }) }) }) }) }) })
  ] });
}
export {
  Register as default
};
