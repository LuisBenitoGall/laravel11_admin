import { jsxs, jsx } from "react/jsx-runtime";
import { G as Guest } from "./GuestLayout-BrGcrN9k.js";
import { useForm, Head, Link } from "@inertiajs/react";
import { A as AuthLeftColumn } from "./AuthLeftColumn-B2ZEBG4t.js";
import { S as SecondaryButton } from "./SecondaryButton-CXDrSeVp.js";
import "./TextInput-CzxrbIpp.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import "./Header-CrOe23WK.js";
import "react";
function VerifyEmail({ status }) {
  const __ = useTranslation();
  const { post, processing } = useForm({});
  const submit = (e) => {
    e.preventDefault();
    post(route("verification.send"));
  };
  return /* @__PURE__ */ jsxs(Guest, { children: [
    /* @__PURE__ */ jsx(Head, { title: __("email_verificacion") }),
    status === "verification-link-sent" && /* @__PURE__ */ jsx("div", { className: "mb-4 font-medium text-sm text-green-600", children: __("email_verificacion_enviado") }),
    /* @__PURE__ */ jsx("div", { className: "auth-page-content overflow-hidden pt-lg-5", id: "auth-page", children: /* @__PURE__ */ jsx("div", { className: "container", children: /* @__PURE__ */ jsx("div", { className: "row mt-5 mt-lg-0", children: /* @__PURE__ */ jsx("div", { className: "col-lg-12", children: /* @__PURE__ */ jsx("div", { className: "card overflow-hidden galaxy-border-none card-bg-fill", children: /* @__PURE__ */ jsxs("div", { className: "row justify-content-center g-0", children: [
      /* @__PURE__ */ jsx(AuthLeftColumn, {}),
      /* @__PURE__ */ jsx("div", { className: "col-lg-6", children: /* @__PURE__ */ jsxs("div", { className: "p-lg-5 p-4", children: [
        /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("h5", { className: "text-primary text-bold", children: __("email_verificacion_texto") }) }),
        /* @__PURE__ */ jsx("form", { onSubmit: submit, children: /* @__PURE__ */ jsxs("div", { className: "mt-4 flex items-center justify-between", children: [
          /* @__PURE__ */ jsx(
            SecondaryButton,
            {
              type: "submit",
              disabled: processing,
              children: __("email_verificacion_reenviar")
            }
          ),
          /* @__PURE__ */ jsx(
            Link,
            {
              href: route("logout"),
              method: "post",
              as: "button",
              className: "btn btn-warning ms-3",
              children: "Log Out"
            }
          )
        ] }) })
      ] }) })
    ] }) }) }) }) }) })
  ] });
}
export {
  VerifyEmail as default
};
