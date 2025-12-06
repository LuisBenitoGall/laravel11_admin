import { jsxs, jsx } from "react/jsx-runtime";
import { G as Guest } from "./GuestLayout-BrGcrN9k.js";
import { useForm, Head } from "@inertiajs/react";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import "./Header-CrOe23WK.js";
import "react";
function LoginVerify({ email, status }) {
  const __ = useTranslation();
  const { data, setData, post, processing, errors } = useForm({
    code: ""
  });
  const submit = (e) => {
    e.preventDefault();
    post(route("login.verify.store"));
  };
  return /* @__PURE__ */ jsxs(Guest, { children: [
    /* @__PURE__ */ jsx(Head, { title: __("verificar_acceso") }),
    /* @__PURE__ */ jsx("div", { className: "container py-5", children: /* @__PURE__ */ jsx("div", { className: "row justify-content-center", children: /* @__PURE__ */ jsx("div", { className: "col-md-6 col-lg-4", children: /* @__PURE__ */ jsx("div", { className: "card shadow-sm", children: /* @__PURE__ */ jsxs("div", { className: "card-body", children: [
      /* @__PURE__ */ jsx("h1", { className: "h4 mb-3 text-center", children: "Verificación de acceso" }),
      email && /* @__PURE__ */ jsxs("p", { className: "text-muted small text-center mb-3", children: [
        "Hemos enviado un código a ",
        /* @__PURE__ */ jsx("strong", { children: email }),
        "."
      ] }),
      status && /* @__PURE__ */ jsx("div", { className: "alert alert-info py-2 small", children: status }),
      errors.code && /* @__PURE__ */ jsx("div", { className: "alert alert-danger py-2 small", children: errors.code }),
      /* @__PURE__ */ jsxs("form", { onSubmit: submit, children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-3", children: [
          /* @__PURE__ */ jsx("label", { className: "form-label", children: "Código de verificación" }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              className: "form-control",
              value: data.code,
              onChange: (e) => setData("code", e.target.value),
              autoFocus: true,
              autoComplete: "one-time-code"
            }
          ),
          /* @__PURE__ */ jsx("div", { className: "form-text", children: "Introduce el código de 6 dígitos que te hemos enviado por email." })
        ] }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            className: "btn btn-primary w-100",
            disabled: processing,
            children: processing ? "Verificando…" : "Acceder"
          }
        )
      ] }),
      /* @__PURE__ */ jsx("p", { className: "mt-3 mb-0 text-center", children: /* @__PURE__ */ jsx("a", { href: route("login"), className: "small", children: "Volver al inicio de sesión" }) })
    ] }) }) }) }) })
  ] });
}
export {
  LoginVerify as default
};
