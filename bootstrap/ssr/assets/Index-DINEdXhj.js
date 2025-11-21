import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-C61SrhEp.js";
import { Head } from "@inertiajs/react";
import "react";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import "./SelectInput-DrqFt-OA.js";
import "./TextInput-CzxrbIpp.js";
import "./StatusButton-DfO41WfJ.js";
import "jspdf";
import "jspdf-autotable";
import "exceljs";
import "file-saver";
import "sweetalert2";
import "axios";
import "@inertiajs/inertia";
import "./Header-dr5I36ZE.js";
import "react-bootstrap";
import "./useSweetAlert-D4PAsWYN.js";
import "./Sidebar-KWaSAYKU.js";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
function Index({ auth, session, title, subtitle, queryParams: rawQueryParams = {}, availableLocales }) {
  useTranslation();
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
        /* @__PURE__ */ jsx("div", { className: "contents", children: /* @__PURE__ */ jsx("div", { className: "row", children: /* @__PURE__ */ jsx("h2", { className: "text-center mx-auto my-5 text-warning", children: "En Construcción" }) }) })
      ]
    }
  );
}
export {
  Index as default
};
