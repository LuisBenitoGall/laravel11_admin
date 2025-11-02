import { jsx, jsxs } from "react/jsx-runtime";
import "react";
import { Link } from "@inertiajs/react";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
function Header() {
  useTranslation();
  return /* @__PURE__ */ jsx("nav", { className: "navbar navbar-expand-lg navbar-landing fixed-top job-navbar", id: "navbar", children: /* @__PURE__ */ jsxs("div", { className: "container-fluid custom-container", children: [
    /* @__PURE__ */ jsx(Link, { href: "/", className: "navbar-brand" }),
    /* @__PURE__ */ jsx("div", { className: "collapse navbar-collapse", id: "navbarSupportedContent" })
  ] }) });
}
export {
  Header as default
};
