import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-DpAdFN-U.js";
import { useForm, usePage, Head, router } from "@inertiajs/react";
import { useState, useEffect, useRef } from "react";
import { C as CategoryAssigner } from "./CategoryAssigner-771-XyNo.js";
import { T as Tabs } from "./Tabs-CZO-HKNH.js";
import { u as useSweetAlert } from "./useSweetAlert-D4PAsWYN.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import { R as ReusableModal } from "./ModalTemplate-BiHkGcpB.js";
import { F as FormDatePickerInput, t as toLocalYmd } from "./DatePickerToForm-DlY2BJGL.js";
import { R as RelevanceSelect } from "./RelevanceSelect-C-e1h0gP.js";
import { T as TextInput } from "./TextInput-CzxrbIpp.js";
import { T as Textarea } from "./Textarea-nvTyMSx8.js";
import { I as InputError } from "./InputError-DME5vguS.js";
import { P as PrimaryButton } from "./PrimaryButton-CIbKPOjQ.js";
import { M as ModalUserCreate } from "./ModalUserCreate-BApZ6QZ9.js";
import { C as Checkbox } from "./Checkbox-C9HPJULq.js";
import CompanyNotes from "./CompanyNotes-BGq9K4xA.js";
import CompanyInfoTab from "./CompanyInfoTab-DPuXbufB.js";
import CompanyUsersTab from "./CompanyUsersTab-BkiAWI9i.js";
import CrmAccountAddressTab from "./CrmAccountAddressTab-CUiFwONu.js";
import "@inertiajs/inertia";
import "./Header-BVvoXjVe.js";
import "react-bootstrap";
import "sweetalert2";
import "./Sidebar-DgixJBon.js";
import "axios";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
import "react-datepicker";
/* empty css                          */
import "date-fns/locale";
import "react-draft-wysiwyg";
import "draft-js";
import "html-to-draftjs";
import "draftjs-to-html";
/* empty css                             */
import "./SelectInput-BpRRLwUE.js";
import "./UserSearch-Bn5gVs5d.js";
import "./FileInput-U7oe6ye3.js";
import "./InfoPopover-CwWEvwXq.js";
import "./ManagePhones-LdkmCbcO.js";
import "./TableUsers-DzgpCE5C.js";
import "./SortControl-BYPcBqgI.js";
import "date-fns";
import "./ShowRegisterButton-DPAZE_RX.js";
import "prop-types";
import "./TableExporter-BksHazGG.js";
import "./StatusButton-DfO41WfJ.js";
import "./useTableManagement-DhW01hp7.js";
import "./UserShowView-BriFAEee.js";
import "./renderCellContent-9r3OTWM8.js";
function UserNoteForm({
  company,
  crmAccount,
  note = null,
  // nota existente para edición (opcional)
  onProcessingChange,
  onSuccess,
  // callback opcional para cerrar modal / refrescar lista
  className = "",
  formRef = null,
  // ref externo al <form> (para usar con ReusableModal)
  showSubmitButton = true,
  submitLabel = null
}) {
  const __ = useTranslation();
  const datepickerFormat = "dd/MM/yyyy";
  const isEdit = !!(note && note.id);
  const { data, setData, post, processing, errors, reset } = useForm({
    crm_account_id: (crmAccount == null ? void 0 : crmAccount.id) ?? null,
    subject_company_id: (company == null ? void 0 : company.id) ?? null,
    title: (note == null ? void 0 : note.title) ?? "",
    body: (note == null ? void 0 : note.body) ?? "",
    tags: Array.isArray(note == null ? void 0 : note.tags) ? note.tags.join(", ") : (note == null ? void 0 : note.tags) ?? "",
    relevance: (note == null ? void 0 : note.relevance) ?? 3,
    remind_at: (note == null ? void 0 : note.remind_at) ?? "",
    is_pinned: (note == null ? void 0 : note.is_pinned) ?? false,
    is_archived: (note == null ? void 0 : note.is_archived) ?? false
  });
  const [submitting, setSubmitting] = useState(false);
  const handleChange = (field) => (e) => {
    const value = (e == null ? void 0 : e.target) ? e.target.value : e;
    setData(field, value);
  };
  const handleCheckboxChange = (field) => (e) => {
    setData(field, e.target.checked);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    post(route("company-notes.store"), {
      preserveScroll: true,
      onStart: () => setSubmitting(true),
      onFinish: () => setSubmitting(false),
      onSuccess: () => {
        if (!isEdit) {
          reset("title", "body", "tags", "relevance", "remind_at", "is_pinned", "is_archived");
        }
        if (typeof onSuccess === "function") {
          onSuccess();
        }
      }
    });
  };
  const submitText = submitLabel || (isEdit ? __("guardar_cambios") : __("guardar_nota"));
  const isBusy = processing || submitting;
  useEffect(() => {
    if (typeof onProcessingChange === "function") {
      onProcessingChange(isBusy);
    }
  }, [isBusy, onProcessingChange]);
  return /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className, ref: formRef, children: [
    /* @__PURE__ */ jsxs("div", { className: "row", children: [
      /* @__PURE__ */ jsx("div", { className: "col-md-8", children: /* @__PURE__ */ jsxs("div", { className: "mb-3", children: [
        /* @__PURE__ */ jsxs("label", { htmlFor: "user-note-title", className: "form-label", children: [
          __("titulo"),
          "*"
        ] }),
        /* @__PURE__ */ jsx(
          TextInput,
          {
            id: "user-note-title",
            name: "title",
            value: data.title,
            onChange: handleChange("title"),
            autoComplete: "off",
            required: true
          }
        ),
        /* @__PURE__ */ jsx(InputError, { message: errors.title, className: "mt-1" })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "col-md-4", children: /* @__PURE__ */ jsxs("div", { className: "mb-3", children: [
        /* @__PURE__ */ jsx(
          RelevanceSelect,
          {
            id: "user-note-relevance",
            name: "relevance",
            value: data.relevance,
            onChange: handleChange("relevance"),
            error: errors.relevance
          }
        ),
        /* @__PURE__ */ jsx(InputError, { message: errors.relevance, className: "mt-1" })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mb-3", children: [
      /* @__PURE__ */ jsxs("label", { htmlFor: "user-note-body", className: "form-label", children: [
        __("nota"),
        "*"
      ] }),
      /* @__PURE__ */ jsx(
        Textarea,
        {
          id: "user-note-body",
          name: "body",
          value: data.body,
          onChange: handleChange("body"),
          wysiwyg: true,
          rows: 6,
          required: true
        }
      ),
      /* @__PURE__ */ jsx(InputError, { message: errors.body, className: "mt-1" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "row", children: [
      /* @__PURE__ */ jsx("div", { className: "col-md-8", children: /* @__PURE__ */ jsxs("div", { className: "mb-3", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "user-note-tags", className: "form-label", children: __("etiquetas") }),
        /* @__PURE__ */ jsx(
          TextInput,
          {
            id: "user-note-tags",
            name: "tags",
            placeholder: __("etiquetas_placeholder_comas"),
            value: data.tags,
            onChange: handleChange("tags"),
            autoComplete: "off"
          }
        ),
        /* @__PURE__ */ jsx("small", { className: "text-muted", children: __("etiquetas_ayuda_comas") }),
        /* @__PURE__ */ jsx(InputError, { message: errors.tags, className: "mt-1" })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "col-md-4", children: /* @__PURE__ */ jsxs("div", { className: "mb-3", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "remind_at", className: "form-label", children: __("recordar_en_fecha") }),
        /* @__PURE__ */ jsx(
          FormDatePickerInput,
          {
            id: "user-note-remind-at",
            name: "remind_at",
            selected: data.remind_at,
            onChange: (name, date) => {
              setData(name, toLocalYmd(date));
            },
            dateFormat: datepickerFormat,
            minDate: /* @__PURE__ */ new Date(),
            maxDate: null
          }
        ),
        /* @__PURE__ */ jsx(InputError, { message: errors.remind_at, className: "mt-1" })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "row mb-3", children: /* @__PURE__ */ jsxs("div", { className: "col-md-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "form-check form-switch", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            className: "form-check-input",
            type: "checkbox",
            id: "user-note-pinned",
            checked: !!data.is_pinned,
            onChange: handleCheckboxChange("is_pinned")
          }
        ),
        /* @__PURE__ */ jsx("label", { className: "form-check-label", htmlFor: "user-note-pinned", children: __("nota_fijar") })
      ] }),
      /* @__PURE__ */ jsx(InputError, { message: errors.is_pinned, className: "mt-1" })
    ] }) }),
    /* @__PURE__ */ jsx("input", { type: "hidden", name: "subject_company_id", value: company.id || "" }),
    showSubmitButton && /* @__PURE__ */ jsx("div", { className: "d-flex justify-content-end gap-2 mt-3", children: /* @__PURE__ */ jsxs(
      PrimaryButton,
      {
        type: "submit",
        disabled: isBusy,
        className: "btn btn-rdn d-inline-flex align-items-center",
        children: [
          isBusy && /* @__PURE__ */ jsx(
            "span",
            {
              className: "spinner-border spinner-border-sm me-2",
              role: "status",
              "aria-hidden": "true"
            }
          ),
          isBusy ? __("procesando") + "…" : submitText
        ]
      }
    ) })
  ] });
}
function ModalCompanyNoteCreate({
  show,
  onClose,
  company,
  crmAccount,
  onSaved,
  // callback para refrescar listado de notas, etc.
  onCreated
}) {
  const __ = useTranslation();
  const formRef = useRef(null);
  const [saving, setSaving] = useState(false);
  if (!company) {
    return null;
  }
  const handleConfirm = () => {
    if (formRef.current && typeof formRef.current.reportValidity === "function") {
      const valid = formRef.current.reportValidity();
      if (!valid) return;
    }
    if (formRef.current && typeof formRef.current.requestSubmit === "function") {
      formRef.current.requestSubmit();
    } else if (formRef.current) {
      formRef.current.dispatchEvent(
        new Event("submit", { cancelable: true, bubbles: true })
      );
    }
  };
  const handleSuccess = () => {
    if (typeof onSaved === "function") {
      onSaved();
    }
    if (typeof onClose === "function") {
      onClose();
    }
  };
  const companyLabel = company.full_name ?? `${company.name ?? ""} ${company.tradename ?? ""}`.trim();
  return /* @__PURE__ */ jsx(
    ReusableModal,
    {
      show,
      onClose,
      onConfirm: handleConfirm,
      title: `${__("nota_nueva")}${companyLabel ? ` · ${companyLabel}` : ""}`,
      confirmText: saving ? __("procesando") + "…" : __("guardar"),
      cancelText: __("cancelar"),
      dialogClassName: "modal-dialog-centered modal-xl",
      confirmDisabled: saving,
      confirmLoading: saving,
      children: /* @__PURE__ */ jsx(
        UserNoteForm,
        {
          company,
          crmAccount,
          onSuccess: handleSuccess,
          formRef,
          showSubmitButton: false,
          submitLabel: __("guardar"),
          onProcessingChange: setSaving
        }
      )
    }
  );
}
function ModalConvertCrmAccount({
  show,
  onClose,
  crmAccount,
  canCreateCustomer = false,
  canCreateProvider = false
}) {
  const __ = useTranslation();
  const { data, setData, post, processing, errors, reset } = useForm({
    as_customer: false,
    as_provider: false,
    crm_account_id: (crmAccount == null ? void 0 : crmAccount.id) || null
  });
  const [localError, setLocalError] = useState("");
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setData(name, checked);
    if (localError) {
      setLocalError("");
    }
  };
  const formRef = useRef(null);
  const handleConfirm = () => {
    if (formRef.current && typeof formRef.current.reportValidity === "function") {
      const valid = formRef.current.reportValidity();
      if (!valid) return;
    }
    post(route("crm-accounts.convert", crmAccount.id), {
      preserveScroll: true,
      onSuccess: (resp) => {
        reset();
        onClose == null ? void 0 : onClose();
        if (typeof onCreate === "function") onCreate(resp);
      }
    });
  };
  return /* @__PURE__ */ jsx(
    ReusableModal,
    {
      show,
      onClose,
      onConfirm: handleConfirm,
      title: __("convertir_cliente_proveedor"),
      confirmText: processing ? __("guardando") : __("guardar"),
      cancelText: __("cancelar"),
      size: "md",
      children: /* @__PURE__ */ jsxs("form", { ref: formRef, onSubmit: (e) => {
        e.preventDefault();
        handleConfirm();
      }, children: [
        /* @__PURE__ */ jsx("p", { className: "mb-3", children: __("convertir_cliente_proveedor_texto", {
          name: (crmAccount == null ? void 0 : crmAccount.name) || ""
        }) }),
        /* @__PURE__ */ jsxs("div", { className: "mb-3", children: [
          canCreateCustomer && /* @__PURE__ */ jsxs("label", { className: "d-flex align-items-center mb-2", children: [
            /* @__PURE__ */ jsx(
              Checkbox,
              {
                name: "as_customer",
                checked: data.as_customer,
                onChange: handleCheckboxChange
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "ms-2", children: __("crear_como_cliente") })
          ] }),
          canCreateProvider && /* @__PURE__ */ jsxs("label", { className: "d-flex align-items-center mb-2", children: [
            /* @__PURE__ */ jsx(
              Checkbox,
              {
                name: "as_provider",
                checked: data.as_provider,
                onChange: handleCheckboxChange
              }
            ),
            /* @__PURE__ */ jsx("span", { className: "ms-2", children: __("crear_como_proveedor") })
          ] })
        ] }),
        (localError || errors.as_customer || errors.as_provider) && /* @__PURE__ */ jsx(
          InputError,
          {
            message: localError || errors.as_customer || errors.as_provider,
            className: "mt-2"
          }
        )
      ] })
    }
  );
}
function Edit({
  auth,
  session,
  title,
  subtitle,
  module,
  availableLocales,
  company,
  crm_account,
  users,
  rows,
  salutations,
  contact_types,
  contact_subtypes,
  business_types = [],
  cost_centers = [],
  countries,
  currencies,
  tab
}) {
  var _a;
  const __ = useTranslation();
  const props = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  useSweetAlert();
  const permissions = props.permissions || {};
  const isCrmAccount = crm_account && typeof crm_account === "object";
  const requestedTab = tab || "info";
  const validTab = !isCrmAccount && (requestedTab === "users" || requestedTab === "categories" || requestedTab === "notes") ? "info" : requestedTab;
  const { data, setData, errors, processing } = useForm({
    name: company.name || "",
    tradename: company.tradename || "",
    nif: company.nif || "",
    logo: null
  });
  const [showModalUserCreate, setShowModalUserCreate] = useState(false);
  const [showModalCompanyNoteCreate, setShowModalCompanyNoteCreate] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const handleOpenModalUserCreate = () => setShowModalUserCreate(true);
  const handleCloseModalUserCreate = () => setShowModalUserCreate(false);
  const handleOpenModalCompanyNoteCreate = () => setShowModalCompanyNoteCreate(true);
  const handleCloseModalCompanyNoteCreate = () => setShowModalCompanyNoteCreate(false);
  const handleOpenConvertModal = () => setShowConvertModal(true);
  const handleCloseConvertModal = () => setShowConvertModal(false);
  const refreshUsersTable = () => {
    router.reload({ only: ["users", "rows"] });
  };
  const [notesRefreshKey, setNotesRefreshKey] = useState(0);
  const handleNoteCreated = () => {
    setNotesRefreshKey((prev) => prev + 1);
    setShowModalCompanyNoteCreate(false);
  };
  const actions = [];
  if (permissions == null ? void 0 : permissions["companies.index"]) {
    actions.push({
      text: __("empresas_volver"),
      icon: "la-angle-left",
      url: "companies.index",
      modal: false
    });
  }
  if (permissions == null ? void 0 : permissions["crm-accounts.index"]) {
    actions.push({
      text: __("cuentas_volver"),
      icon: "la-angle-left",
      url: "crm-accounts.index",
      modal: false
    });
  }
  if (permissions == null ? void 0 : permissions["companies.create"]) {
    actions.push({
      text: __("empresa_nueva"),
      icon: "la-plus",
      url: "companies.create",
      modal: false
    });
  }
  if (isCrmAccount && ((permissions == null ? void 0 : permissions["customers.create"]) || (permissions == null ? void 0 : permissions["providers.create"]))) {
    actions.push({
      text: __("convertir_cliente_proveedor"),
      icon: "la-plus",
      url: "",
      modal: true,
      onClick: handleOpenConvertModal
    });
  }
  if (permissions == null ? void 0 : permissions["workplaces.index"]) {
    actions.push({
      text: __("centros_trabajo"),
      icon: "la-map-marker-alt",
      url: "workplaces.index",
      params: [company.id],
      modal: false
    });
  }
  if ((permissions == null ? void 0 : permissions["crm-accounts.edit"]) && isCrmAccount) {
    actions.push({
      text: __("contacto_nuevo"),
      icon: "la-plus",
      url: "",
      modal: true,
      onClick: handleOpenModalUserCreate
    });
  }
  if ((permissions == null ? void 0 : permissions["crm-accounts.edit"]) && isCrmAccount) {
    actions.push({
      text: __("nota_nueva"),
      icon: "la-plus",
      url: "",
      modal: true,
      onClick: handleOpenModalCompanyNoteCreate
    });
  }
  if ((permissions == null ? void 0 : permissions["crm-accounts.destroy"]) && isCrmAccount) {
    actions.push({
      text: __("eliminar"),
      icon: "la-trash",
      method: "delete",
      url: "crm-accounts.destroy",
      params: [crm_account.id],
      title: __("cuenta_eliminar"),
      message: __("cuenta_eliminar_confirm"),
      modal: false
    });
  }
  const envForCategories = "sectors";
  const categoryEndpoints = {
    list: route("categorizables.list"),
    assign: route("categorizables.assign"),
    unassign: route("categorizables.unassign"),
    tree: route("categories.tree", { environment: envForCategories }),
    create: route("categories.store", { environment: envForCategories })
  };
  const tabs = [
    {
      key: "info",
      label: __("informacion_general"),
      content: /* @__PURE__ */ jsx(
        CompanyInfoTab,
        {
          company,
          side: "companies",
          updateRoute: "companies.update",
          updateParams: [company.id],
          crm_account,
          business_types: business_types ?? [],
          cost_centers: cost_centers ?? []
        }
      )
    }
  ];
  if (isCrmAccount) {
    tabs.push({
      key: "address",
      label: __("informacion_fiscal"),
      content: /* @__PURE__ */ jsx(
        CrmAccountAddressTab,
        {
          account: crm_account,
          countries: countries ?? [],
          currencies: currencies ?? []
        }
      )
    });
    tabs.push({
      key: "users",
      label: __("usuarios"),
      content: /* @__PURE__ */ jsx(
        CompanyUsersTab,
        {
          users: users ?? null,
          rows: rows ?? [],
          indexRoute: "crm-accounts.edit",
          indexParams: [crm_account.id, "users"],
          tableId: "tblCompanyUsers",
          filteredDataRoute: "crm-accounts.users.filtered-data",
          queryParams: props.queryParams || {},
          userEditCompanyId: (crm_account == null ? void 0 : crm_account.linked_company_id) ?? company.id,
          deleteUserRoute: module === "crm" ? "crm-contacts.destroy" : "user-companies.destroy",
          editFromAccountId: (crm_account == null ? void 0 : crm_account.id) ?? null
        }
      )
    });
    tabs.push({
      key: "categories",
      label: __("categorias"),
      content: /* @__PURE__ */ jsx("div", { className: "mt-3", children: /* @__PURE__ */ jsx(
        CategoryAssigner,
        {
          environment: envForCategories,
          categorizable: { type: "App\\Models\\Company", id: company.id },
          endpoints: categoryEndpoints,
          title: __("sectores"),
          allowCreate: true,
          readOnly: false
        }
      ) })
    });
    tabs.push({
      key: "notes",
      label: __("notas"),
      content: /* @__PURE__ */ jsxs("div", { className: "mt-3", children: [
        (permissions == null ? void 0 : permissions["companies.edit"]) && /* @__PURE__ */ jsx("div", { className: "d-flex justify-content-end mb-3", children: /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            className: "btn btn-sm btn-primary",
            onClick: handleOpenModalCompanyNoteCreate,
            children: [
              /* @__PURE__ */ jsx("i", { className: "la la-plus me-1" }),
              __("nota_nueva") || "Nueva nota"
            ]
          }
        ) }),
        /* @__PURE__ */ jsx(
          CompanyNotes,
          {
            companyId: company.id,
            refreshKey: notesRefreshKey
          }
        )
      ] })
    });
  }
  return /* @__PURE__ */ jsxs(AdminAuthenticated, { user: auth.user, title, subtitle, actions, children: [
    /* @__PURE__ */ jsx(Head, { title }),
    /* @__PURE__ */ jsxs("div", { className: "contents pb-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "row", children: [
        /* @__PURE__ */ jsx("div", { className: "col-12", children: /* @__PURE__ */ jsxs("h2", { children: [
          __("empresa"),
          " ",
          /* @__PURE__ */ jsx("u", { children: company.name }),
          company.is_ute ? /* @__PURE__ */ jsx("span", { className: "ms-2", children: "(UTE)" }) : ""
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "col-12 mt-2 mb-4", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-muted me-5", children: [
            __("creado"),
            ": ",
            /* @__PURE__ */ jsx("strong", { children: company.formatted_created_at })
          ] }),
          company.created_by_name && /* @__PURE__ */ jsxs("span", { className: "text-muted me-5", children: [
            __("creado_por"),
            ": ",
            /* @__PURE__ */ jsx("strong", { children: company.created_by_name })
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "text-muted me-5", children: [
            __("actualizado"),
            ": ",
            /* @__PURE__ */ jsx("strong", { children: company.formatted_updated_at })
          ] }),
          company.updated_by_name && /* @__PURE__ */ jsxs("span", { className: "text-muted me-5", children: [
            __("actualizado_por"),
            ": ",
            /* @__PURE__ */ jsx("strong", { children: company.updated_by_name })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx(Tabs, { tabs, defaultActive: validTab }),
      isCrmAccount && /* @__PURE__ */ jsx(
        ModalUserCreate,
        {
          show: showModalUserCreate,
          onClose: handleCloseModalUserCreate,
          onCreate: refreshUsersTable,
          companyId: company.id,
          side: "crm-accounts",
          salutations,
          contact_types,
          contact_subtypes,
          crm_account,
          showUserSearch: true,
          redirectTo: { route: "crm-accounts.edit", params: [crm_account.id, "users"] }
        }
      ),
      isCrmAccount && /* @__PURE__ */ jsx(
        ModalConvertCrmAccount,
        {
          show: showConvertModal,
          onClose: handleCloseConvertModal,
          crmAccount: crm_account,
          canCreateCustomer: !!(permissions == null ? void 0 : permissions["customers.create"]),
          canCreateProvider: !!(permissions == null ? void 0 : permissions["providers.create"])
        }
      ),
      isCrmAccount && /* @__PURE__ */ jsx(
        ModalCompanyNoteCreate,
        {
          show: showModalCompanyNoteCreate,
          onClose: handleCloseModalCompanyNoteCreate,
          company,
          crmAccount: crm_account,
          onCreated: handleNoteCreated
        }
      )
    ] })
  ] });
}
export {
  Edit as default
};
