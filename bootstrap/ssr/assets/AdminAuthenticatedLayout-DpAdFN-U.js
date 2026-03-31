import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { usePage, useForm } from "@inertiajs/react";
import "@inertiajs/inertia";
import Header from "./Header-BVvoXjVe.js";
import { S as Sidebar } from "./Sidebar-DgixJBon.js";
import "./Dropdown-DLZR1XDp.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import "./TextInput-CzxrbIpp.js";
import { u as useSweetAlert } from "./useSweetAlert-D4PAsWYN.js";
function FlashMessage({ type = "success", message }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!message) {
      setVisible(false);
      return;
    }
    setVisible(true);
    const timeout = setTimeout(() => {
      setVisible(false);
    }, 4e3);
    return () => clearTimeout(timeout);
  }, [message]);
  if (!visible || !message) return null;
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: `alert- alert alert-${type} alert-dismissible fade show`,
      role: "alert",
      children: [
        message,
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            className: "btn-close",
            "aria-label": "Close",
            onClick: () => setVisible(false)
          }
        )
      ]
    }
  );
}
function AdminAuthenticated({
  user,
  title,
  subtitle,
  actions,
  header,
  children
}) {
  var _a;
  const __ = useTranslation();
  const props = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  const sessionData = props.sessionData || {};
  const currentCompany = (sessionData == null ? void 0 : sessionData.currentCompany) || false;
  const [showingNavigationDropdown, setShowingNavigationDropdown] = useState(false);
  const [showModalCompaniesSession, setShowModalCompaniesSession] = useState(!currentCompany);
  const [selectedId, setSelectedId] = useState(null);
  (sessionData == null ? void 0 : sessionData.companySettings) || false;
  const companies = (sessionData == null ? void 0 : sessionData.companies) || [];
  (sessionData == null ? void 0 : sessionData.companyModules) || false;
  const { data, setData, post, processing } = useForm({
    selectedCompany: null
  });
  useSweetAlert();
  useEffect(() => {
    if (!currentCompany) {
      setTimeout(() => setShowModalCompaniesSession(true), 200);
    }
  }, [currentCompany]);
  __("empresa_selec_aviso");
  return (
    // <div id="app">
    // <StrictMode>
    /* @__PURE__ */ jsxs("div", { id: "layout-wrapper", children: [
      /* @__PURE__ */ jsx(
        Header,
        {
          title,
          subtitle,
          user,
          actions,
          companies,
          current_company: currentCompany
        }
      ),
      /* @__PURE__ */ jsx(Sidebar, {}),
      /* @__PURE__ */ jsx("div", { className: "main-content", children: /* @__PURE__ */ jsx("div", { className: "page-content", children: /* @__PURE__ */ jsxs("main", { children: [
        /* @__PURE__ */ jsx(FlashMessage, { type: "success", message: props.msg }),
        /* @__PURE__ */ jsx(FlashMessage, { type: "danger", message: props.alert }),
        children
      ] }) }) })
    ] })
  );
}
export {
  AdminAuthenticated as A,
  FlashMessage as F
};
