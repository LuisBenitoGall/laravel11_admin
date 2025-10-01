import { jsxs, jsx } from "react/jsx-runtime";
import { G as Guest } from "./GuestLayout-BM71Ax_y.js";
import { useForm, Head, Link } from "@inertiajs/react";
import { useEffect } from "react";
import { C as Checkbox } from "./Checkbox-B7oBdKeZ.js";
import { I as InputError } from "./InputError-DME5vguS.js";
import { I as InputLabel } from "./InputLabel-uXgJWz9w.js";
import { P as PrimaryButton } from "./PrimaryButton-B91ets3U.js";
import { T as TextInput } from "./TextInput-p9mIVJQL.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import "./Header-BT-uMu0Z.js";
function Login({ status, canResetPassword }) {
  const __ = useTranslation();
  const { data, setData, post, processing, errors, reset } = useForm({
    email: "",
    password: "",
    remember: false
  });
  const submit = (e) => {
    e.preventDefault();
    post(route("login"), {
      onFinish: () => reset("password")
    });
  };
  useEffect(() => {
    if (status) {
      alert(status);
    }
  }, [status]);
  return /* @__PURE__ */ jsxs(Guest, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Log in" }),
    status && /* @__PURE__ */ jsx("div", { className: "mb-4 font-medium text-sm text-green-600", children: status }),
    errors && errors.length > 0 && /* @__PURE__ */ jsx("div", { className: "mb-4 font-medium text-sm text-red-600", children: errors[0] }),
    /* @__PURE__ */ jsx("div", { className: "auth-page-content overflow-hidden pt-lg-5", children: /* @__PURE__ */ jsx("div", { className: "container", children: /* @__PURE__ */ jsx("div", { className: "row", children: /* @__PURE__ */ jsx("div", { className: "col-lg-12", children: /* @__PURE__ */ jsx("div", { className: "card overflow-hidden galaxy-border-none card-bg-fill", children: /* @__PURE__ */ jsxs("div", { className: "row justify-content-center g-0", children: [
      /* @__PURE__ */ jsx("div", { className: "col-lg-6", children: /* @__PURE__ */ jsxs("div", { className: "p-lg-5 p-4 auth-one-bg h-100", children: [
        /* @__PURE__ */ jsx("div", { className: "bg-overlay" }),
        /* @__PURE__ */ jsx("div", { className: "position-relative h-100 d-flex flex-column" })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "col-lg-6", children: /* @__PURE__ */ jsxs("div", { className: "p-lg-5 p-4", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("h5", { className: "text-primary", children: "Lock Screen" }),
          /* @__PURE__ */ jsx("p", { className: "text-muted", children: "Enter your password to unlock the screen!" })
        ] }),
        /* @__PURE__ */ jsxs("form", { onSubmit: submit, children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { htmlFor: "email", value: "Email" }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "email",
                type: "email",
                name: "email",
                value: data.email,
                className: "mt-1 block w-full",
                autoComplete: "username",
                isFocused: true,
                onChange: (e) => setData("email", e.target.value)
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.email, className: "mt-2" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
            /* @__PURE__ */ jsx(InputLabel, { htmlFor: "password", value: "Password" }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "password",
                type: "password",
                name: "password",
                value: data.password,
                className: "mt-1 block w-full",
                autoComplete: "current-password",
                onChange: (e) => setData("password", e.target.value)
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.password, className: "mt-2" })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "block mt-4", children: /* @__PURE__ */ jsxs("label", { className: "flex items-center", children: [
            /* @__PURE__ */ jsx(
              Checkbox,
              {
                name: "remember",
                checked: data.remember,
                onChange: (e) => setData("remember", e.target.checked)
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "ms-2 text-sm text-gray-600", children: __("recordarme") })
          ] }) }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end mt-4", children: [
            canResetPassword && /* @__PURE__ */ jsx(
              Link,
              {
                href: route("password.request"),
                className: "underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
                children: __("contrasena_olvidada")
              }
            ),
            /* @__PURE__ */ jsx(PrimaryButton, { className: "ms-4 btn-rdn", disabled: processing, children: __("login") })
          ] })
        ] })
      ] }) })
    ] }) }) }) }) }) })
  ] });
}
export {
  Login as default
};
