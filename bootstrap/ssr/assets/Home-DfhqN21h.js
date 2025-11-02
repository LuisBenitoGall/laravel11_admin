import { jsxs, jsx } from "react/jsx-runtime";
import { G as Guest } from "./GuestLayout-BrGcrN9k.js";
import { usePage, Head, Link } from "@inertiajs/react";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import "./Header-CrOe23WK.js";
import "react";
function Home() {
  const { APP_NAME } = usePage().props;
  const { APP_FULL_NAME } = usePage().props;
  const __ = useTranslation();
  return /* @__PURE__ */ jsxs(Guest, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Home" }),
    /* @__PURE__ */ jsx("div", { className: "container-fluid p-0", children: /* @__PURE__ */ jsx("div", { className: "row g-0", children: /* @__PURE__ */ jsx("div", { className: "col-12", children: /* @__PURE__ */ jsx("main", { className: "d-flex align-items-center justify-content-center", style: { minHeight: "80vh", backgroundColor: "#fff" }, children: /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx("h2", { className: "mb-4", style: { color: "#646464", letterSpacing: "2px", fontSize: "1.8rem", fontWeight: 400 }, children: APP_NAME }),
      /* @__PURE__ */ jsx("img", { src: "/img/logo/logo-rft-portrait.jpg", alt: APP_FULL_NAME, className: "img-fluid mb-4", style: { maxWidth: "300px", objectFit: "contain" } }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Link, { href: route("login"), className: "btn btn-secondary btn-lg me-2", children: __("login") }),
        /* @__PURE__ */ jsx(Link, { href: route("register"), className: "btn btn-outline-secondary btn-lg", children: __("registro") })
      ] })
    ] }) }) }) }) })
  ] });
}
export {
  Home as default
};
