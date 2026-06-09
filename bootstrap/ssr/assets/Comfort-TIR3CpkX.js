import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-CS0xV2Ze.js";
import { usePage, Head, Link, router } from "@inertiajs/react";
import "react";
import "./Header-BVvoXjVe.js";
import "@inertiajs/inertia";
import "react-bootstrap";
import "./useSweetAlert-D4PAsWYN.js";
import "sweetalert2";
import "./useTranslation-Nsy_Cpi1.js";
import "./Sidebar-DgixJBon.js";
import "axios";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
import "./TextInput-CzxrbIpp.js";
function Comfort({ title, subtitle, intended, alert }) {
  var _a;
  const { props } = usePage();
  const message = alert || props.alert || "Necesitas seleccionar una empresa activa para continuar.";
  return /* @__PURE__ */ jsxs(
    AdminAuthenticated,
    {
      user: (_a = props.auth) == null ? void 0 : _a.user,
      title,
      subtitle,
      actions: [],
      children: [
        /* @__PURE__ */ jsx(Head, { title }),
        /* @__PURE__ */ jsxs("div", { className: "contents", children: [
          /* @__PURE__ */ jsxs("div", { className: "alert alert-warning", children: [
            /* @__PURE__ */ jsx("div", { className: "fw-semibold mb-1", children: message }),
            /* @__PURE__ */ jsx("div", { className: "small text-muted", children: "No pasa nada: selecciona una empresa y vuelves a donde estabas." })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "d-flex flex-wrap gap-2", children: [
            /* @__PURE__ */ jsx(Link, { className: "btn btn-primary", href: route("companies.index"), children: "Ir a empresas" }),
            intended ? /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                className: "btn btn-outline-secondary",
                onClick: () => router.visit(intended),
                children: "Reintentar"
              }
            ) : null,
            /* @__PURE__ */ jsx(Link, { className: "btn btn-outline-secondary", href: route("dashboard"), children: "Ir al inicio" })
          ] })
        ] })
      ]
    }
  );
}
export {
  Comfort as default
};
