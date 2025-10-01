import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-DxQfZ-Jg.js";
import { usePage, Head } from "@inertiajs/react";
import { useState } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import axios from "axios";
import { u as useSweetAlert } from "./useSweetAlert-D4PAsWYN.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import "@inertiajs/inertia";
import "./Header-BI4rRLdV.js";
import "./TextInput-p9mIVJQL.js";
import "./Sidebar-CtyD8dde.js";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
import "sweetalert2";
function Index({ auth, session, title, subtitle, modules, company_modules, queryParams = {}, availableLocales }) {
  var _a;
  const __ = useTranslation();
  const props = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  props.locale || false;
  props.languages || [];
  const { showConfirm } = useSweetAlert();
  props.permissions || {};
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [selectedModuleInfo, setSelectedModuleInfo] = useState(null);
  const handleToggleModule = (module) => {
    const isLinked = company_modules.includes(module.id);
    const action = isLinked ? __("desactivar") : __("activar");
    showConfirm({
      title: action,
      text: `${__("confirma_deseas")} ${action.toLowerCase()} ${module.label}`,
      icon: "warning",
      onConfirm: async () => {
        try {
          await axios.post(route("company-modules.toggle", module.id));
          await axios.get(route("companies.refresh-session"));
          window.location.reload();
        } catch (error) {
          console.error("Error al cambiar el estado del módulo", error);
        }
      }
    });
  };
  const showModuleInfo = (module) => {
    console.log("Módulo seleccionado:", module);
    setSelectedModuleInfo(module);
    setInfoModalVisible(true);
  };
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
        /* @__PURE__ */ jsxs("div", { className: "contents pb-5", children: [
          /* @__PURE__ */ jsx("div", { className: "row", children: /* @__PURE__ */ jsx("div", { className: "col-12 pt-3", children: /* @__PURE__ */ jsx("p", { children: __("modulos_selecciona_para_empresa") }) }) }),
          /* @__PURE__ */ jsx("div", { className: "row g-3 mt-2", id: "company-modules", children: modules.map((module) => /* @__PURE__ */ jsx("div", { className: "col-12 col-sm-6 col-md-4 col-lg-2", children: /* @__PURE__ */ jsx("div", { className: `card position-relative shadow-sm h-100 ${company_modules.includes(module.id) ? "active" : ""}`, style: { backgroundColor: module.color }, children: /* @__PURE__ */ jsxs("div", { className: "card-module card-body d-flex flex-column justify-content-between", children: [
            /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
              /* @__PURE__ */ jsx("i", { className: `main-icon la la-${module.icon} mb-2` }),
              /* @__PURE__ */ jsx("h5", { className: "card-title text-capitalize", children: module.label })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "d-flex justify-content-between align-items-end mt-2", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => showModuleInfo(module),
                  className: "btn btn-sm btn-light p-1 border rounded-circle",
                  title: __("informacion"),
                  children: /* @__PURE__ */ jsx("i", { className: "la la-info" })
                }
              ),
              /* @__PURE__ */ jsx(
                OverlayTrigger,
                {
                  placement: "top",
                  overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", children: company_modules.includes(module.id) ? __("desactivar") : __("activar") }),
                  children: company_modules.includes(module.id) ? /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => handleToggleModule(module),
                      className: "btn btn-sm btn-danger rounded-circle",
                      title: "{__('desactivar')}",
                      children: /* @__PURE__ */ jsx("i", { className: "la la-ban" })
                    }
                  ) : /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: () => handleToggleModule(module),
                      className: "btn btn-sm btn-success rounded-circle",
                      children: /* @__PURE__ */ jsx("i", { className: "la la-check" })
                    }
                  )
                },
                "status-" + module.id
              )
            ] })
          ] }) }) }, module.id)) })
        ] }),
        infoModalVisible && /* @__PURE__ */ jsx("div", { className: "modal fade show d-block", tabIndex: "-1", style: { backgroundColor: "rgba(0,0,0,0.5)" }, children: /* @__PURE__ */ jsx("div", { className: "modal-dialog", children: /* @__PURE__ */ jsxs("div", { className: "modal-content", children: [
          /* @__PURE__ */ jsxs("div", { className: "modal-header", children: [
            /* @__PURE__ */ jsx("h5", { className: "modal-title", children: selectedModuleInfo == null ? void 0 : selectedModuleInfo.label }),
            /* @__PURE__ */ jsx("button", { type: "button", className: "btn-close", onClick: () => setInfoModalVisible(false) })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "modal-body text-center", children: /* @__PURE__ */ jsx("p", { className: "mb-0", children: typeof (selectedModuleInfo == null ? void 0 : selectedModuleInfo.explanation) === "string" && selectedModuleInfo.explanation.trim() || __("modulo_sin_info") }) })
        ] }) }) })
      ]
    }
  );
}
export {
  Index as default
};
