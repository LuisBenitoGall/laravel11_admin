import { jsxs, jsx } from "react/jsx-runtime";
import { G as Guest } from "./GuestLayout-BrGcrN9k.js";
import { useForm, Head, Link } from "@inertiajs/react";
import { A as AuthLeftColumn } from "./AuthLeftColumn-B2ZEBG4t.js";
import { I as InputError } from "./InputError-DME5vguS.js";
import { I as InputLabel } from "./InputLabel-uXgJWz9w.js";
import { S as SecondaryButton } from "./SecondaryButton-CXDrSeVp.js";
import { T as TextInput } from "./TextInput-CzxrbIpp.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import "./Header-CrOe23WK.js";
import "react";
function ForgotPassword({ status }) {
  const __ = useTranslation();
  const { data, setData, post, processing, errors } = useForm({
    email: ""
  });
  const submit = (e) => {
    e.preventDefault();
    post(route("password.email"));
  };
  return /* @__PURE__ */ jsxs(Guest, { children: [
    /* @__PURE__ */ jsx(Head, { title: __("contrasena_recuperar") }),
    status && /* @__PURE__ */ jsx("div", { className: "mb-4 font-medium text-sm text-green-600", children: status }),
    errors && errors.length > 0 && /* @__PURE__ */ jsx("div", { className: "mb-4 font-medium text-sm text-red-600", children: errors[0] }),
    /* @__PURE__ */ jsx("div", { className: "auth-page-content overflow-hidden pt-lg-5", id: "auth-page", children: /* @__PURE__ */ jsx("div", { className: "container", children: /* @__PURE__ */ jsx("div", { className: "row mt-5 mt-lg-0", children: /* @__PURE__ */ jsx("div", { className: "col-lg-12", children: /* @__PURE__ */ jsx("div", { className: "card overflow-hidden galaxy-border-none card-bg-fill", children: /* @__PURE__ */ jsxs("div", { className: "row justify-content-center g-0", children: [
      /* @__PURE__ */ jsx(AuthLeftColumn, {}),
      /* @__PURE__ */ jsx("div", { className: "col-lg-6", children: /* @__PURE__ */ jsxs("div", { className: "p-lg-5 p-4", children: [
        /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("h5", { className: "text-primary text-bold", children: __("contrasena_olvidada_texto") }) }),
        /* @__PURE__ */ jsxs("form", { onSubmit: submit, children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx(InputLabel, { htmlFor: "email", value: __("email") }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "email",
                type: "email",
                name: "email",
                value: data.email,
                className: "mt-1 block w-full",
                isFocused: true,
                onChange: (e) => setData("email", e.target.value)
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.email, className: "mt-2" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end mt-4", children: [
            /* @__PURE__ */ jsx(
              Link,
              {
                href: route("login"),
                className: "underline text-sm text-gray-600 hover:text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500",
                children: __("login_volver")
              }
            ),
            /* @__PURE__ */ jsx(
              SecondaryButton,
              {
                type: "submit",
                className: "ms-4",
                disabled: processing,
                children: __("contrasena_recuperar")
              }
            )
          ] })
        ] })
      ] }) })
    ] }) }) }) }) }) })
  ] });
}
export {
  ForgotPassword as default
};
