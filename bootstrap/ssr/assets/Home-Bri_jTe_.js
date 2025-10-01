import { jsxs, jsx } from "react/jsx-runtime";
import { G as Guest } from "./GuestLayout-BM71Ax_y.js";
import { Head, Link } from "@inertiajs/react";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import "./Header-BT-uMu0Z.js";
import "react";
function Home() {
  const __ = useTranslation();
  return /* @__PURE__ */ jsxs(Guest, { children: [
    /* @__PURE__ */ jsx(Head, { title: "Home" }),
    /* @__PURE__ */ jsx("div", { className: "container-fluid p-0", children: /* @__PURE__ */ jsx("div", { className: "row g-0", children: /* @__PURE__ */ jsx("div", { className: "col-12", children: /* @__PURE__ */ jsx("main", { className: "d-flex align-items-center justify-content-center", style: { minHeight: "80vh", backgroundColor: "#2f3f4a" }, children: /* @__PURE__ */ jsxs("div", { className: "text-center text-white", children: [
      /* @__PURE__ */ jsx("h2", { className: "mb-4 text-white", style: { letterSpacing: "2px", fontWeight: 400 }, children: "AMDT Admin Systems" }),
      /* @__PURE__ */ jsx("img", { src: "/img/logo-amdt.png", alt: "AMDT", className: "img-fluid mb-4", style: { maxWidth: "260px", objectFit: "contain" } }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(Link, { href: route("login"), className: "btn btn-info btn-lg me-2", children: __("login") }),
        /* @__PURE__ */ jsx(Link, { href: route("register"), className: "btn btn-outline-info btn-lg", children: __("registro") })
      ] })
    ] }) }) }) }) })
  ] });
}
export {
  Home as default
};
