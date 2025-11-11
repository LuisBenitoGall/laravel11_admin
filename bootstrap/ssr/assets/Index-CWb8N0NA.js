import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-CS968Wx3.js";
import { Head } from "@inertiajs/react";
import { u as useCompanySession } from "./Sidebar-CypaLfnr.js";
import "sweetalert2";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import FavoritesGrid from "./FavoritesGrid-1AK2Mn6S.js";
import "react";
import "axios";
import "@inertiajs/inertia";
import "./Header-Px-6ZOXw.js";
import "react-bootstrap";
import "./useSweetAlert-D4PAsWYN.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
import "./TextInput-CzxrbIpp.js";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
function Index({ auth, session, title, subtitle, favorites = [] }) {
  const __ = useTranslation();
  useCompanySession();
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
        /* @__PURE__ */ jsx("div", { className: "contents pb-4", children: /* @__PURE__ */ jsx("div", { className: "row", children: /* @__PURE__ */ jsxs("div", { className: "col-12 my-3", children: [
          /* @__PURE__ */ jsx("h2", { className: "mb-3", children: __("favoritos_mis") }),
          /* @__PURE__ */ jsx(FavoritesGrid, { favorites })
        ] }) }) })
      ]
    }
  );
}
export {
  Index as default
};
