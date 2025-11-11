import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-CS968Wx3.js";
import { Head } from "@inertiajs/react";
import "react";
/* empty css                          */
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import "./SelectInput-DrqFt-OA.js";
import "./TextInput-CzxrbIpp.js";
import "./StatusButton-DPQw0QHC.js";
import "jspdf";
import "jspdf-autotable";
import "exceljs";
import "file-saver";
import "sweetalert2";
import "axios";
import "@inertiajs/inertia";
import "./Header-Px-6ZOXw.js";
import "react-bootstrap";
import "./useSweetAlert-D4PAsWYN.js";
import "./Sidebar-CypaLfnr.js";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
function Index({ auth, session, title, subtitle, company, queryParams: rawQueryParams = {}, availableLocales }) {
  const __ = useTranslation();
  const actions = [];
  return /* @__PURE__ */ jsxs(
    AdminAuthenticated,
    {
      user: auth.user,
      title,
      subtitle,
      actions,
      children: [
        /* @__PURE__ */ jsx(Head, { title }),
        /* @__PURE__ */ jsx("div", { className: "contents pb-4", children: /* @__PURE__ */ jsxs("div", { className: "row", children: [
          /* @__PURE__ */ jsx("div", { className: "col-12", children: /* @__PURE__ */ jsxs("h2", { children: [
            __("configuracion"),
            " ",
            /* @__PURE__ */ jsx("u", { children: company.name })
          ] }) }),
          /* @__PURE__ */ jsx("h1", { className: "text-warning text-center py-5", children: "Módulo en construcción" })
        ] }) })
      ]
    }
  );
}
export {
  Index as default
};
