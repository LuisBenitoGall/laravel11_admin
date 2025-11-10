import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-DT2NIV1N.js";
import { Head } from "@inertiajs/react";
import { u as useCompanySession } from "./Sidebar-BV0-sS1Z.js";
import "sweetalert2";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import FavoritesGrid from "./FavoritesGrid-1AK2Mn6S.js";
import "react";
import "axios";
import "@inertiajs/inertia";
import "./Header-kwxCeG5H.js";
import "react-bootstrap";
import "./useSweetAlert-D4PAsWYN.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
import "./TextInput-CzxrbIpp.js";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
function Index({ auth, session, title, subtitle, favorites = [] }) {
  useTranslation();
  const { currentCompany, companyModules, companySettings } = useCompanySession();
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
          /* @__PURE__ */ jsxs("div", { className: "col-12 my-5", children: [
            /* @__PURE__ */ jsx("h2", { className: "mb-3", children: "Mis opciones preferidas" }),
            /* @__PURE__ */ jsx(FavoritesGrid, { favorites })
          ] }),
          /* @__PURE__ */ jsxs("pre", { children: [
            "User: ",
            JSON.stringify(auth.user, null, 2)
          ] }),
          /* @__PURE__ */ jsxs("pre", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Empresa activa:" }),
            " ",
            JSON.stringify(currentCompany, null, 2)
          ] }),
          /* @__PURE__ */ jsxs("pre", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Módulos:" }),
            " ",
            JSON.stringify(companyModules, null, 2)
          ] }),
          /* @__PURE__ */ jsxs("pre", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Configuración empresa:" }),
            " ",
            JSON.stringify(companySettings, null, 2)
          ] })
        ] }) })
      ]
    }
  );
}
export {
  Index as default
};
