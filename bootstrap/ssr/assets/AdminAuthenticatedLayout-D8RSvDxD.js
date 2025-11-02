import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import axios from "axios";
import { usePage, useForm } from "@inertiajs/react";
import { Inertia } from "@inertiajs/inertia";
import Header from "./Header-BDD-uIND.js";
import { S as Sidebar } from "./Sidebar-BgmCyghN.js";
import "./Dropdown-DLZR1XDp.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import "./TextInput-p9mIVJQL.js";
import { u as useSweetAlert } from "./useSweetAlert-D4PAsWYN.js";
function FlashMessage({ type = "success", message }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const timeout = setTimeout(() => {
      setVisible(false);
    }, 4e3);
    return () => clearTimeout(timeout);
  }, []);
  if (!visible || !message) return null;
  return /* @__PURE__ */ jsxs("div", { className: `alert- alert alert-${type} alert-dismissible fade show`, role: "alert", children: [
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
  ] });
}
const modalCompaniesSession = ({ show, onClose, title, children, onConfirm, confirmText, cancelText = "Cancelar" }) => {
  useTranslation();
  return /* @__PURE__ */ jsx(Fragment, { children: show && /* @__PURE__ */ jsx("div", { className: "modal fade show", style: { display: "block" }, tabIndex: "-1", role: "dialog", "aria-labelledby": "modalTitle", "aria-hidden": "true", children: /* @__PURE__ */ jsx("div", { className: "modal-dialog", role: "document", children: /* @__PURE__ */ jsxs("div", { className: "modal-content", children: [
    /* @__PURE__ */ jsx("div", { className: "modal-header", children: /* @__PURE__ */ jsx("h5", { className: "modal-title", children: title }) }),
    children
  ] }) }) }) });
};
function AdminAuthenticated({ user, title, subtitle, actions, header, children }) {
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
  const { showAlert } = useSweetAlert();
  useEffect(() => {
    if (!currentCompany) {
      setTimeout(() => setShowModalCompaniesSession(true), 200);
    }
  }, [currentCompany]);
  const swal_text = __("empresa_selec_aviso");
  const selectCompanySubmit = async (e) => {
    e.preventDefault();
    if (!selectedId) {
      showAlert("Error", swal_text, "error");
      return;
    }
    try {
      await axios.post(route("companies.select"), { selectedCompany: selectedId });
      setShowModalCompaniesSession(false);
      Inertia.reload({ preserveState: false, preserveScroll: true });
    } catch (err) {
      showAlert("Error", __("empresa_selec_aviso"), "error");
    }
  };
  return (
    // <div id="app">
    // <StrictMode>
    /* @__PURE__ */ jsxs("div", { id: "layout-wrapper", children: [
      /* @__PURE__ */ jsx(Header, { title, subtitle, user, actions, companies, current_company: currentCompany }),
      /* @__PURE__ */ jsx(Sidebar, {}),
      /* @__PURE__ */ jsx("div", { className: "main-content", children: /* @__PURE__ */ jsx("div", { className: "page-content", children: /* @__PURE__ */ jsxs("main", { children: [
        /* @__PURE__ */ jsx(FlashMessage, { type: "success", message: props.msg }),
        /* @__PURE__ */ jsx(FlashMessage, { type: "danger", message: props.alert }),
        children
      ] }) }) }),
      /* @__PURE__ */ jsx(
        modalCompaniesSession,
        {
          show: showModalCompaniesSession,
          onClose: () => setShowModalCompaniesSession(false),
          onConfirm: selectCompanySubmit,
          title: __("empresa_selec"),
          children: /* @__PURE__ */ jsxs("form", { onSubmit: selectCompanySubmit, children: [
            /* @__PURE__ */ jsx("input", { type: "hidden", name: "_token", value: document.querySelector('meta[name="csrf-token"]').getAttribute("content") }),
            /* @__PURE__ */ jsx("div", { className: "modal-body", children: companies.map((company) => /* @__PURE__ */ jsxs("div", { className: "form-check", children: [
              /* @__PURE__ */ jsx(
                "input",
                {
                  className: "form-check-input mt-1",
                  type: "radio",
                  name: "selectedCompany",
                  id: `company-${company.id}`,
                  value: company.id,
                  checked: selectedId === company.id,
                  onChange: () => setSelectedId(company.id)
                }
              ),
              /* @__PURE__ */ jsx("label", { className: "form-check-label", htmlFor: `company-${company.id}`, children: company.name })
            ] }, company.id)) }),
            /* @__PURE__ */ jsx("div", { className: "modal-footer", children: /* @__PURE__ */ jsx("button", { type: "submit", className: "btn btn-primary", disabled: processing, children: processing ? __("enviando") : __("enviar") }) })
          ] })
        }
      )
    ] })
  );
}
export {
  AdminAuthenticated as A
};
