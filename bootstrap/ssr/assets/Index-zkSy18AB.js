import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-DT2NIV1N.js";
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
import "./Header-kwxCeG5H.js";
import "react-bootstrap";
import "./useSweetAlert-D4PAsWYN.js";
import "./Sidebar-BV0-sS1Z.js";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
function Index({ auth, session, title, subtitle, companies, queryParams: rawQueryParams = {}, availableLocales }) {
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
        /* @__PURE__ */ jsx("div", { className: "contents" })
      ]
    }
  );
}
export {
  Index as default
};
