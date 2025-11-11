import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-CS968Wx3.js";
import { router, usePage, useForm, Head } from "@inertiajs/react";
import "@inertiajs/inertia";
import "react-tooltip";
import { useState } from "react";
import "react-color";
import "./TextInput-CzxrbIpp.js";
import "./SelectInput-DrqFt-OA.js";
import { T as Tabs } from "./Tabs-Cd7Sj0t_.js";
import "react-draft-wysiwyg";
import "draft-js";
import "html-to-draftjs";
import "draftjs-to-html";
/* empty css                             */
import "sweetalert2";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import { I as InfoPopover } from "./InfoPopover-CwWEvwXq.js";
import { R as ReusableModal } from "./ModalTemplate-CgiU7p0h.js";
import { I as InputError } from "./InputError-DME5vguS.js";
import ModuleTab from "./ModuleTab-DVxGCaci.js";
import FunctionalitiesTab from "./FunctionalitiesTab-C-kkk7nl.js";
import "axios";
import "./Header-Px-6ZOXw.js";
import "react-bootstrap";
import "./useSweetAlert-D4PAsWYN.js";
import "./Sidebar-CypaLfnr.js";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
import "./ColorPicker-YL-42Dpw.js";
import "./Checkbox-B7oBdKeZ.js";
import "./PrimaryButton-B91ets3U.js";
import "./Textarea-nvTyMSx8.js";
import "./useTableManagement-CA-wp9Fk.js";
import "react-datepicker";
import "date-fns";
import "date-fns/locale";
import "./TableExporter-BjSebGA-.js";
import "jspdf";
import "jspdf-autotable";
import "exceljs";
import "file-saver";
function ModalFunctionalityCreate({ show, onClose, onCreate, moduleId }) {
  const __ = useTranslation();
  const [form, setForm] = useState({
    name: "",
    label: ""
  });
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      console.log("form state:", updated);
      return updated;
    });
  };
  const handleConfirm = () => {
    const newErrors = {};
    if (!form.name) newErrors.name = __("campo_obligatorio");
    if (!form.label) newErrors.label = __("campo_obligatorio");
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setProcessing(true);
    router.post(route("functionalities.store"), {
      ...form,
      module_id: moduleId
    }, {
      preserveScroll: true,
      onSuccess: (page) => {
        setForm({ name: "", label: "" });
        setErrors({});
        onClose();
        if (typeof onCreate === "function") {
          onCreate();
        }
      },
      onError: (err) => {
        setErrors(err);
      },
      onFinish: () => setProcessing(false)
    });
  };
  return /* @__PURE__ */ jsxs(
    ReusableModal,
    {
      show,
      onClose,
      onConfirm: handleConfirm,
      title: __("funcionalidad_nueva"),
      confirmText: processing ? __("guardando") : __("guardar"),
      cancelText: __("cancelar"),
      children: [
        /* @__PURE__ */ jsx("div", { className: "mb-3", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
          /* @__PURE__ */ jsxs("label", { className: "form-label", children: [
            __("funcionalidad"),
            "*"
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              name: "name",
              className: "form-control",
              value: form.name,
              onChange: handleChange,
              autoComplete: "off",
              maxLength: 100
            }
          ),
          /* @__PURE__ */ jsx(InfoPopover, { code: "functionality-name" }),
          /* @__PURE__ */ jsx(InputError, { message: errors.name })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "mb-3", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
          /* @__PURE__ */ jsxs("label", { className: "form-label", children: [
            __("etiqueta"),
            "*"
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              name: "label",
              className: "form-control",
              value: form.label,
              onChange: handleChange,
              autoComplete: "off",
              maxLength: 100
            }
          ),
          /* @__PURE__ */ jsx(InfoPopover, { code: "functionality-label" }),
          /* @__PURE__ */ jsx(InputError, { message: errors.label })
        ] }) })
      ]
    }
  );
}
function Index({ auth, session, title, subtitle, module_data, tab, levels, functionalities, availableLocales }) {
  var _a;
  const __ = useTranslation();
  const props = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  props.locale || false;
  props.languages || [];
  const permissions = props.permissions || {};
  const [activeTab, setActiveTab] = useState(tab || "module");
  const levelsArray = Object.entries(levels || {}).map(([key, value]) => ({
    value: key,
    label: value
  }));
  const { data, setData, put, reset, errors, processing } = useForm({
    name: module_data.name || "",
    level: module_data.level || "",
    label: module_data.label || "",
    icon: module_data.icon || "",
    color: module_data.color || "",
    status: module_data.status,
    explanation: module_data.explanation || ""
  });
  function handleSubmit(e) {
    e.preventDefault();
    put(
      route("modules.update", module_data.id),
      {
        preserveScroll: true,
        onSuccess: () => console.log("Movimiento actualizado")
      }
    );
  }
  const [showModalFunctionalityCreate, setShowModalFunctionalityCreate] = useState(false);
  const [showModalFunctionalityEdit, setShowModalFunctionalityEdit] = useState(false);
  const [functionalityToEdit, setFunctionalityToEdit] = useState(null);
  const handleOpenModalFunctionalityCreate = () => setShowModalFunctionalityCreate(true);
  const handleCloseModalFunctionalityCreate = () => setShowModalFunctionalityCreate(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const refreshFunctionalitiesTable = () => setRefreshKey((prev) => prev + 1);
  const actions = [];
  if (permissions == null ? void 0 : permissions["modules.index"]) {
    actions.push({
      text: __("modulos_volver"),
      icon: "la-angle-left",
      url: "modules.index",
      modal: false
    });
  }
  if (permissions == null ? void 0 : permissions["modules.create"]) {
    actions.push({
      text: __("modulo_nuevo"),
      icon: "la-plus",
      url: "modules.create",
      modal: false
    });
  }
  if (permissions == null ? void 0 : permissions["modules.edit"]) {
    actions.push({
      text: __("funcionalidad_nueva"),
      icon: "la-plus",
      url: "",
      modal: true,
      onClick: handleOpenModalFunctionalityCreate
    });
  }
  return /* @__PURE__ */ jsxs(
    AdminAuthenticated,
    {
      user: auth.user,
      title,
      subtitle,
      actions,
      children: [
        /* @__PURE__ */ jsx(Head, { title }),
        /* @__PURE__ */ jsxs("div", { className: "contents pb-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "row", children: [
            /* @__PURE__ */ jsx("div", { className: "col-12", children: /* @__PURE__ */ jsxs("h2", { className: "d-flex align-items-center gap-2", children: [
              __("modulo"),
              module_data.icon && /* @__PURE__ */ jsx("i", { className: `la la-${module_data.icon} text-muted`, style: { fontSize: "1.2em" } }),
              /* @__PURE__ */ jsx("u", { children: __(module_data.label) })
            ] }) }),
            /* @__PURE__ */ jsxs("div", { className: "col-12 mt-2 mb-4", children: [
              /* @__PURE__ */ jsxs("span", { className: "text-muted me-5", children: [
                __("creado"),
                ": ",
                /* @__PURE__ */ jsx("strong", { children: module_data.formatted_created_at })
              ] }),
              module_data.created_by_name && /* @__PURE__ */ jsxs("span", { className: "text-muted me-5", children: [
                __("creado_por"),
                ": ",
                /* @__PURE__ */ jsx("strong", { children: module_data.created_by_name })
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "text-muted me-5", children: [
                __("actualizado"),
                ": ",
                /* @__PURE__ */ jsx("strong", { children: module_data.formatted_updated_at })
              ] }),
              module_data.updated_by_name && /* @__PURE__ */ jsxs("span", { className: "text-muted me-5", children: [
                __("actualizado_por"),
                ": ",
                /* @__PURE__ */ jsx("strong", { children: module_data.updated_by_name })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            Tabs,
            {
              tabs: [
                {
                  key: "module",
                  label: __("modulo"),
                  content: /* @__PURE__ */ jsx("form", { onSubmit: handleSubmit, children: /* @__PURE__ */ jsx(
                    ModuleTab,
                    {
                      data,
                      setData,
                      errors,
                      levelsArray,
                      processing,
                      handleSubmit
                    }
                  ) })
                },
                {
                  key: "functionalities",
                  label: __("funcionalidades"),
                  content: /* @__PURE__ */ jsx(
                    FunctionalitiesTab,
                    {
                      module_data,
                      functionalities,
                      onCreated: refreshFunctionalitiesTable,
                      onDeleted: refreshFunctionalitiesTable,
                      refreshKey
                    },
                    refreshKey
                  )
                }
              ],
              defaultActive: tab
            }
          ),
          /* @__PURE__ */ jsx(
            ModalFunctionalityCreate,
            {
              show: showModalFunctionalityCreate,
              onClose: handleCloseModalFunctionalityCreate,
              onCreate: refreshFunctionalitiesTable,
              moduleId: module_data.id
            }
          )
        ] })
      ]
    }
  );
}
export {
  Index as default
};
