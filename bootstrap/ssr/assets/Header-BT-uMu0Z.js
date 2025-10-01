import { jsx, jsxs } from "react/jsx-runtime";
import "react";
import { Link } from "@inertiajs/react";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
function Header() {
  const __ = useTranslation();
  return /* @__PURE__ */ jsx("nav", { className: "navbar navbar-expand-lg navbar-landing fixed-top job-navbar", id: "navbar", children: /* @__PURE__ */ jsxs("div", { className: "container-fluid custom-container", children: [
    /* @__PURE__ */ jsx(Link, { href: "/", className: "navbar-brand", children: /* @__PURE__ */ jsx("img", { src: "/images/logo-light.png", className: "card-logo card-logo-light", alt: "logo light", height: "17" }) }),
    /* @__PURE__ */ jsx("button", { className: "navbar-toggler py-0 fs-20 text-body", type: "button", "data-bs-toggle": "collapse", "data-bs-target": "#navbarSupportedContent", "aria-controls": "navbarSupportedContent", "aria-expanded": "false", "aria-label": "Toggle navigation", children: /* @__PURE__ */ jsx("i", { className: "mdi mdi-menu" }) }),
    /* @__PURE__ */ jsxs("div", { className: "collapse navbar-collapse", id: "navbarSupportedContent", children: [
      /* @__PURE__ */ jsxs("ul", { className: "navbar-nav mx-auto mt-2 mt-lg-0", id: "navbar-example", children: [
        /* @__PURE__ */ jsx("li", { className: "nav-item", children: /* @__PURE__ */ jsx(Link, { href: "/", className: "nav-link active", children: "Home" }) }),
        /* @__PURE__ */ jsx("li", { className: "nav-item", children: /* @__PURE__ */ jsx(Link, { href: "/", className: "nav-link", children: __("sobre_nosotros") }) }),
        /* @__PURE__ */ jsx("li", { className: "nav-item", children: /* @__PURE__ */ jsx(Link, { href: "/", className: "nav-link", children: __("contacta") }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "", children: /* @__PURE__ */ jsxs(Link, { href: route("login"), className: "btn btn-soft-primary", children: [
        /* @__PURE__ */ jsx("i", { className: "ri-user-3-line align-bottom me-1" }),
        " Login & Register"
      ] }) })
    ] })
  ] }) });
}
export {
  Header as default
};
