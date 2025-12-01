import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-B-FXti_B.js";
import { usePage, useForm, Head } from "@inertiajs/react";
import { u as useHandleDelete } from "./useHandleDelete-B2XtFf-J.js";
import { useState, useEffect, useRef } from "react";
import { C as CategoryAssigner } from "./CategoryAssigner-771-XyNo.js";
import { T as Tabs } from "./Tabs-CZO-HKNH.js";
import "react-draft-wysiwyg";
import "draft-js";
import "html-to-draftjs";
import "draftjs-to-html";
/* empty css                             */
import { T as TextInput } from "./TextInput-CzxrbIpp.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import { R as ReusableModal } from "./ModalTemplate-BcyfW0_g.js";
import { F as FormDatePickerInput, t as toLocalYmd } from "./DatePickerToForm-DlY2BJGL.js";
import { I as InputError } from "./InputError-DME5vguS.js";
import { T as Textarea } from "./Textarea-nvTyMSx8.js";
import { P as PrimaryButton } from "./PrimaryButton-B91ets3U.js";
import UserImages from "./UserImages-CZESt1jq.js";
import UserNotes from "./UserNotes-T01UE5--.js";
import UserPersonalData from "./UserPersonalData-Do0qjUYH.js";
import UserPassword from "./UserPassword-BLQBXZX2.js";
import "@inertiajs/inertia";
import "./Header-dr5I36ZE.js";
import "react-bootstrap";
import "./useSweetAlert-D4PAsWYN.js";
import "sweetalert2";
import "./Sidebar-CXopVqqu.js";
import "axios";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
import "react-datepicker";
/* empty css                          */
import "date-fns/locale";
import "./FileInput-U7oe6ye3.js";
import "./ManagePhones-C_mhnW8c.js";
import "./RadioButton-BQ8Yvx79.js";
import "./SelectInput-DrqFt-OA.js";
import "./SetSex-BUKGr851.js";
function RelevanceSelect({
  id = "relevance",
  name = "relevance",
  value,
  onChange,
  error,
  label,
  className = "form-select"
}) {
  var _a;
  const __ = useTranslation();
  const pageProps = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  const serverOptions = pageProps.relevanceOptions || null;
  const fallbackOptions = [
    { value: 1, label: __("baja"), color: "#0d6efd" },
    { value: 2, label: __("media_baja"), color: "#0dcaf0" },
    { value: 3, label: __("media"), color: "#ffc107" },
    { value: 4, label: __("media_alta"), color: "#fd7e14" },
    { value: 5, label: __("alta"), color: "#dc3545" }
  ];
  const options = serverOptions && serverOptions.length ? serverOptions : fallbackOptions;
  return /* @__PURE__ */ jsxs("div", { className: "mb-3", children: [
    /* @__PURE__ */ jsx("label", { htmlFor: id, className: "form-label", children: label ?? __("relevancia") }),
    /* @__PURE__ */ jsx(
      "select",
      {
        id,
        name,
        className,
        value,
        onChange,
        children: options.map((opt) => /* @__PURE__ */ jsxs(
          "option",
          {
            value: opt.value,
            style: { color: opt.color },
            children: [
              "⚑ ",
              opt.label
            ]
          },
          opt.value
        ))
      }
    ),
    error && /* @__PURE__ */ jsx(InputError, { message: error, className: "mt-1" })
  ] });
}
function UserNoteForm({
  contact,
  // usuario objeto de la nota (requerido para crear)
  user_company,
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
    id: (note == null ? void 0 : note.id) ?? null,
    contact_id: (note == null ? void 0 : note.contact_id) ?? (contact == null ? void 0 : contact.id) ?? null,
    user_company: user_company ?? null,
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
    post(route("user-notes.store"), {
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
    /* @__PURE__ */ jsx("input", { type: "hidden", name: "id", value: data.id || "" }),
    /* @__PURE__ */ jsx("input", { type: "hidden", name: "contact_id", value: data.contact_id || "" }),
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
function ModalUserNoteCreate({
  show,
  onClose,
  contact,
  user_company,
  onSaved,
  // callback para refrescar listado de notas, etc.
  onCreated
}) {
  const __ = useTranslation();
  const formRef = useRef(null);
  const [saving, setSaving] = useState(false);
  if (!contact) {
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
  const contactLabel = contact.full_name ?? `${contact.name ?? ""} ${contact.surname ?? ""}`.trim();
  return /* @__PURE__ */ jsx(
    ReusableModal,
    {
      show,
      onClose,
      onConfirm: handleConfirm,
      title: `${__("nota_nueva")}${contactLabel ? ` · ${contactLabel}` : ""}`,
      confirmText: saving ? __("procesando") + "…" : __("guardar"),
      cancelText: __("cancelar"),
      dialogClassName: "modal-dialog-centered modal-xl",
      confirmDisabled: saving,
      confirmLoading: saving,
      children: /* @__PURE__ */ jsx(
        UserNoteForm,
        {
          contact,
          user_company,
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
function Index({
  auth,
  session,
  title,
  subtitle,
  user,
  roles,
  user_roles,
  images,
  salutations,
  contact_types,
  crm_contact,
  profile,
  company,
  company_context,
  pivot,
  user_company_id
}) {
  var _a;
  const __ = useTranslation();
  const props = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  const permissions = props.permissions || {};
  useHandleDelete("usuario", "users.destroy", [user.id]);
  const [showModalUserNoteCreate, setShowModalUserNoteCreate] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const handleOpenModalUserNoteCreate = () => setShowModalUserNoteCreate(true);
  const handleCloseModalUserNoteCreate = () => setShowModalUserNoteCreate(false);
  const handleUserNoteSaved = () => {
    setRefreshKey((prev) => prev + 1);
    setShowModalUserNoteCreate(false);
  };
  const handleNoteCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };
  const actions = [];
  const cc = company_context;
  if (cc && cc.type === "crm_account" && permissions["crm-accounts.edit"]) {
    actions.push({
      text: __("volver_a") + " " + cc.name,
      icon: "la-angle-left",
      url: "crm-accounts.edit",
      params: [cc.crm_id, "users"],
      modal: false
    });
  } else if (cc && cc.type === "company" && (permissions["companies.edit"] || permissions["users.index"])) {
    if (permissions["companies.edit"]) {
      actions.push({
        text: __("volver_a") + " " + cc.name,
        icon: "la-angle-left",
        url: "companies.edit",
        params: [cc.ref_id, "users"],
        modal: false
      });
    } else {
      actions.push({
        text: __("usuarios_volver"),
        icon: "la-angle-left",
        url: "users.index",
        modal: false
      });
    }
  } else if (permissions["users.index"]) {
    actions.push({
      text: __("usuarios_volver"),
      icon: "la-angle-left",
      url: "users.index",
      modal: false
    });
  }
  if (permissions["users.create"] && crm_contact === false) {
    actions.push({
      text: __("usuario_nuevo"),
      icon: "la-plus",
      url: "users.create",
      modal: false
    });
  }
  if (profile === false) {
    actions.push({
      text: __("nota_nueva"),
      icon: "la-plus",
      url: "",
      modal: true,
      onClick: handleOpenModalUserNoteCreate
    });
  }
  if (permissions["users.destroy"] && profile === false) {
    actions.push({
      text: __("eliminar"),
      icon: "la-trash",
      method: "delete",
      url: "users.destroy",
      params: [user.id],
      title: __("usuario_eliminar"),
      message: __("usuario_eliminar_confirm"),
      modal: false
    });
  }
  const envForCategories = "users";
  const categoryEndpoints = {
    list: route("categorizables.list"),
    // GET  ?environment=&type=&id=
    assign: route("categorizables.assign"),
    // POST body {environment,type,id,category_ids}
    unassign: route("categorizables.unassign"),
    // POST body {environment,type,id,category_ids}
    tree: route("categories.tree", { environment: envForCategories }),
    // GET  ?environment=
    create: route("categories.store", { environment: envForCategories })
    // POST body {environment,name,parent_id?}
  };
  const tabs = [
    { key: "user-personal-data", label: __("datos_personales") },
    ...profile === true ? [{ key: "user-password", label: __("contrasena") }] : [],
    { key: "user-categories", label: __("categorias") },
    { key: "user-images", label: __("imagenes") },
    { key: "user-notes", label: __("notas") }
  ];
  return /* @__PURE__ */ jsxs(AdminAuthenticated, { user: auth.user, title, subtitle, actions, children: [
    /* @__PURE__ */ jsx(Head, { title }),
    /* @__PURE__ */ jsxs("div", { className: "contents pb-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "row", children: [
        /* @__PURE__ */ jsx("div", { className: "col-12", children: /* @__PURE__ */ jsxs("h2", { children: [
          __("usuario"),
          " ",
          /* @__PURE__ */ jsxs("u", { children: [
            user.name,
            " ",
            user.surname
          ] })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "col-12 mt-2 mb-4", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-muted me-5", children: [
            __("creado"),
            ": ",
            /* @__PURE__ */ jsx("strong", { children: user.formatted_created_at })
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "text-muted me-5", children: [
            __("actualizado"),
            ": ",
            /* @__PURE__ */ jsx("strong", { children: user.formatted_updated_at })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx(Tabs, { defaultActive: "user-personal-data", items: tabs, children: (activeKey) => {
        switch (activeKey) {
          case "user-personal-data":
            return /* @__PURE__ */ jsx(
              UserPersonalData,
              {
                user,
                roles,
                user_roles,
                salutations,
                contact_types,
                crm_contact,
                user_company_id,
                pivot,
                company_context
              }
            );
          case "user-password":
            return /* @__PURE__ */ jsx(UserPassword, { user });
          case "user-categories":
            return /* @__PURE__ */ jsx(
              CategoryAssigner,
              {
                environment: envForCategories,
                categorizable: { type: "App\\Models\\User", id: user.id },
                endpoints: categoryEndpoints,
                title: __("categorias"),
                allowCreate: true,
                readOnly: false
              }
            );
          case "user-images": {
            const inferredImagePath = (user == null ? void 0 : user.image_path) || (user == null ? void 0 : user.imagePath) || "users";
            return /* @__PURE__ */ jsx(
              UserImages,
              {
                images: images ?? [],
                uploadUrl: route("user-images.store"),
                deleteUrl: (img) => route("user-images.delete", { image: img.id ?? img.image }),
                setFeaturedUrl: route("user-images.set-featured"),
                entityId: user.id,
                imagePath: inferredImagePath
              }
            );
          }
          case "user-notes": {
            return /* @__PURE__ */ jsx(
              UserNotes,
              {
                userId: user.id,
                refreshKey
              }
            );
          }
          default:
            return null;
        }
      } }),
      /* @__PURE__ */ jsx(
        ModalUserNoteCreate,
        {
          show: showModalUserNoteCreate,
          onClose: handleCloseModalUserNoteCreate,
          contact: user,
          user_company: user_company_id,
          onSaved: handleUserNoteSaved,
          onCreated: handleNoteCreated
        }
      )
    ] })
  ] });
}
export {
  Index as default
};
