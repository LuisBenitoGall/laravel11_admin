import { jsxs, jsx } from "react/jsx-runtime";
import "react";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-DT2NIV1N.js";
import { usePage, Head } from "@inertiajs/react";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import "axios";
import "@inertiajs/inertia";
import "./Header-kwxCeG5H.js";
import "react-bootstrap";
import "./useSweetAlert-D4PAsWYN.js";
import "sweetalert2";
import "./Sidebar-BV0-sS1Z.js";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
import "./TextInput-CzxrbIpp.js";
function Forbidden() {
  const __ = useTranslation();
  const { auth, alert, title = "403", subtitle = __("permisos_sin") } = usePage().props;
  const actions = [
    {
      text: __("Dashboard"),
      icon: "la-home",
      url: "dashboard",
      modal: false
    }
  ];
  return /* @__PURE__ */ jsxs(
    AdminAuthenticated,
    {
      user: auth.user,
      title,
      subtitle,
      actions,
      children: [
        /* @__PURE__ */ jsx(Head, { title }),
        /* @__PURE__ */ jsxs("div", { className: "text-center py-5", children: [
          /* @__PURE__ */ jsx("h1", { className: "text-danger display-1", children: /* @__PURE__ */ jsx("b", { children: "error 403" }) }),
          /* @__PURE__ */ jsx("h2", { className: "mb-4", children: __("permisos_sin_texto") }),
          alert && /* @__PURE__ */ jsx("div", { className: "alert alert-danger", children: alert })
        ] })
      ]
    }
  );
}
export {
  Forbidden as default
};
