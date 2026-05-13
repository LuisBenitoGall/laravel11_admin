import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-DpAdFN-U.js";
import { router, useForm, usePage, Head } from "@inertiajs/react";
import { u as useHandleDelete } from "./useHandleDelete-B2XtFf-J.js";
import { useState, useRef, useEffect } from "react";
import { C as CategoryAssigner } from "./CategoryAssigner-771-XyNo.js";
import { Badge, OverlayTrigger, Tooltip } from "react-bootstrap";
import { R as ReusableModal } from "./ModalTemplate-BiHkGcpB.js";
import { T as TextInput } from "./TextInput-CzxrbIpp.js";
import { T as Textarea } from "./Textarea-nvTyMSx8.js";
import { I as InputError } from "./InputError-DME5vguS.js";
import { C as Checkbox } from "./Checkbox-C9HPJULq.js";
import { P as PrimaryButton } from "./PrimaryButton-CIbKPOjQ.js";
import { I as InfoPopover } from "./InfoPopover-CwWEvwXq.js";
import { L as LocationSelects } from "./LocationSelects-B4vI2QcJ.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import { u as useSweetAlert } from "./useSweetAlert-D4PAsWYN.js";
import { T as Tabs } from "./Tabs-CZO-HKNH.js";
import "react-draft-wysiwyg";
import "draft-js";
import "html-to-draftjs";
import "draftjs-to-html";
/* empty css                             */
import { F as FormDatePickerInput, t as toLocalYmd } from "./DatePickerToForm-DlY2BJGL.js";
import { R as RelevanceSelect } from "./RelevanceSelect-C-e1h0gP.js";
import UserImages from "./UserImages-fTJRUy_n.js";
import UserNotes from "./UserNotes-T01UE5--.js";
import UserPersonalData from "./UserPersonalData-O8ZppJmt.js";
import UserPassword from "./UserPassword-B_T7uAmO.js";
import "@inertiajs/inertia";
import "./Header-BVvoXjVe.js";
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
import "./FileInput-U7oe6ye3.js";
import "./ManagePhones-LdkmCbcO.js";
import "./RadioButton-BQ8Yvx79.js";
import "./SelectInput-BpRRLwUE.js";
import "./SetSex-BUKGr851.js";
import "./YearSelect-CdvirGha.js";
function ManageUserAddresses({
  userId,
  addresses = [],
  countries = []
}) {
  const __ = useTranslation();
  const { showConfirm } = useSweetAlert();
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});
  const formRef = useRef(null);
  const emptyForm = {
    country_id: "",
    province_id: "",
    town_id: "",
    cp: "",
    address: "",
    address_extra: "",
    label: "",
    observations: "",
    is_main: false
  };
  const [form, setForm] = useState(emptyForm);
  const openCreateModal = () => {
    setEditingAddress(null);
    setForm(emptyForm);
    setErrors({});
    setShowModal(true);
  };
  const openEditModal = (address) => {
    setEditingAddress(address);
    setErrors({});
    setForm({
      country_id: address.country_id || "",
      province_id: address.province_id || "",
      town_id: address.town_id || "",
      cp: address.cp || "",
      address: address.address || "",
      address_extra: address.address_extra || "",
      label: address.label || "",
      observations: address.observations || "",
      is_main: !!address.is_main
    });
    setShowModal(true);
  };
  const closeModal = () => {
    if (processing) return;
    setShowModal(false);
    setEditingAddress(null);
    setErrors({});
    setForm(emptyForm);
  };
  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };
  const setData = (field, value) => {
    handleChange(field, value);
  };
  const hasAtLeastOneLocation = () => {
    const townId = form.town_id != null && form.town_id !== "" ? String(form.town_id).trim() : "";
    const cp = form.cp != null ? String(form.cp).trim() : "";
    const address = form.address != null ? String(form.address).trim() : "";
    return townId !== "" || cp !== "" || address !== "";
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (processing) return;
    if (!hasAtLeastOneLocation()) {
      setErrors({ address: __("direccion_al_menos_uno") });
      return;
    }
    setProcessing(true);
    setErrors({});
    const payload = {
      ...form,
      user_id: userId
    };
    const url = editingAddress ? route("user-addresses.update", editingAddress.id) : route("user-addresses.store");
    const method = editingAddress ? "put" : "post";
    router[method](url, payload, {
      preserveScroll: true,
      onError: (errors2) => {
        setErrors(errors2 || {});
        setProcessing(false);
      },
      onSuccess: () => {
        setProcessing(false);
        setShowModal(false);
        setEditingAddress(null);
        setForm(emptyForm);
      }
    });
  };
  const handleConfirm = () => {
    if (!hasAtLeastOneLocation()) {
      setErrors({ address: __("direccion_al_menos_uno") });
      return;
    }
    setErrors((prev) => ({ ...prev, address: void 0 }));
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
  const handleDelete = (address) => {
    showConfirm({
      title: __("direccion_eliminar") || __("eliminar"),
      text: __("direccion_eliminar_confirm") || __("¿Seguro que quieres eliminar esta dirección?"),
      icon: "warning",
      onConfirm: () => {
        router.delete(route("user-addresses.destroy", address.id), {
          preserveScroll: true
        });
      }
    });
  };
  const handleSetMain = (address) => {
    if (address.is_main) {
      return;
    }
    router.post(
      route("user-addresses.primary"),
      {
        address_id: address.id,
        user_id: userId
      },
      {
        preserveScroll: true
      }
    );
  };
  const getLocationInfo = (address) => {
    const town = address.town || {};
    const province = town.province || address.province || {};
    const country = province.country || address.country || {};
    const townName = address.town_name || town.name || town.label || town.town || "";
    const provinceName = address.province_name || province.name || "";
    const countryName = address.country_name || country.name || "";
    return { townName, provinceName, countryName };
  };
  const modalTitle = editingAddress ? __("Editar dirección") : __("Añadir dirección");
  return /* @__PURE__ */ jsxs("div", { className: "card mb-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "card-header d-flex justify-content-between align-items-center", children: [
      /* @__PURE__ */ jsxs("div", { className: "d-flex align-items-center gap-2", children: [
        /* @__PURE__ */ jsx("h6", { className: "mb-0", children: __("direcciones") }),
        /* @__PURE__ */ jsx(
          InfoPopover,
          {
            content: __(
              "Puedes añadir varias direcciones para el usuario y marcar una como principal."
            )
          }
        )
      ] }),
      /* @__PURE__ */ jsxs(PrimaryButton, { type: "button", size: "sm", onClick: openCreateModal, children: [
        /* @__PURE__ */ jsx("i", { className: "la la-plus me-1" }),
        __("Añadir dirección")
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "card-body", children: addresses.length === 0 ? /* @__PURE__ */ jsx("p", { className: "mb-0 text-muted small", children: __("No hay direcciones definidas para este usuario.") }) : /* @__PURE__ */ jsx("div", { className: "row g-3", children: addresses.map((address) => {
      const { townName, provinceName, countryName } = getLocationInfo(address);
      return /* @__PURE__ */ jsx(
        "div",
        {
          className: "col-12 col-md-6 col-lg-4",
          children: /* @__PURE__ */ jsx(
            "div",
            {
              className: "card h-100 " + (address.is_main ? "border-primary shadow-sm" : ""),
              children: /* @__PURE__ */ jsxs("div", { className: "card-body d-flex flex-column", children: [
                /* @__PURE__ */ jsxs("div", { className: "d-flex justify-content-between align-items-start mb-2", children: [
                  /* @__PURE__ */ jsxs("div", { children: [
                    /* @__PURE__ */ jsx("div", { className: "fw-semibold", children: address.label || __("Dirección") }),
                    (address.cp || townName) && /* @__PURE__ */ jsxs("div", { className: "text-muted small", children: [
                      address.cp,
                      townName ? (address.cp ? " · " : "") + townName : ""
                    ] }),
                    (provinceName || countryName) && /* @__PURE__ */ jsxs("div", { className: "text-muted small", children: [
                      provinceName,
                      provinceName && countryName ? " · " : "",
                      countryName
                    ] })
                  ] }),
                  /* @__PURE__ */ jsx("div", { className: "ms-2", children: address.is_main ? /* @__PURE__ */ jsxs(Badge, { bg: "primary", children: [
                    /* @__PURE__ */ jsx("i", { className: "la la-star me-1" }),
                    __("Principal")
                  ] }) : /* @__PURE__ */ jsx(
                    OverlayTrigger,
                    {
                      placement: "top",
                      overlay: /* @__PURE__ */ jsx(Tooltip, { id: `tt-main-${address.id}`, children: __("Marcar como principal") }),
                      children: /* @__PURE__ */ jsx(
                        "button",
                        {
                          type: "button",
                          className: "btn btn-sm btn-light border rounded-circle",
                          onClick: () => handleSetMain(address),
                          children: /* @__PURE__ */ jsx("i", { className: "la la-star-o" })
                        }
                      )
                    }
                  ) })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "mb-2", children: [
                  /* @__PURE__ */ jsx("div", { className: "fw-bold", children: address.address || "—" }),
                  address.address_extra && /* @__PURE__ */ jsx("div", { className: "text-muted small", children: address.address_extra })
                ] }),
                address.observations && /* @__PURE__ */ jsx("div", { className: "mt-1 small text-muted", children: address.observations }),
                /* @__PURE__ */ jsxs("div", { className: "mt-auto pt-2 border-top d-flex justify-content-end gap-2", children: [
                  /* @__PURE__ */ jsx(
                    OverlayTrigger,
                    {
                      placement: "top",
                      overlay: /* @__PURE__ */ jsx(
                        Tooltip,
                        {
                          id: `tt-edit-${address.id}`,
                          children: __("Editar")
                        }
                      ),
                      children: /* @__PURE__ */ jsx(
                        "button",
                        {
                          type: "button",
                          className: "btn btn-sm btn-warning rounded-pill",
                          onClick: () => openEditModal(address),
                          children: /* @__PURE__ */ jsx("i", { className: "la la-edit" })
                        }
                      )
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    OverlayTrigger,
                    {
                      placement: "top",
                      overlay: /* @__PURE__ */ jsx(
                        Tooltip,
                        {
                          id: `tt-delete-${address.id}`,
                          children: __("Eliminar")
                        }
                      ),
                      children: /* @__PURE__ */ jsx(
                        "button",
                        {
                          type: "button",
                          className: "btn btn-sm btn-danger rounded-pill",
                          onClick: () => handleDelete(address),
                          children: /* @__PURE__ */ jsx("i", { className: "la la-trash" })
                        }
                      )
                    }
                  )
                ] })
              ] })
            }
          )
        },
        address.id
      );
    }) }) }),
    /* @__PURE__ */ jsx(
      ReusableModal,
      {
        show: showModal,
        onClose: closeModal,
        onConfirm: handleConfirm,
        title: modalTitle,
        confirmText: processing ? __("Guardando...") : __("Guardar"),
        cancelText: __("Cancelar"),
        dialogClassName: "modal-dialog-centered modal-xl",
        confirmDisabled: processing,
        confirmLoading: processing,
        children: /* @__PURE__ */ jsx("form", { ref: formRef, onSubmit: handleSubmit, children: /* @__PURE__ */ jsxs("div", { className: "row g-3", children: [
          /* @__PURE__ */ jsx("div", { className: "col-12", children: /* @__PURE__ */ jsx(
            LocationSelects,
            {
              countries,
              formData: form,
              setData,
              provincesUrl: "/api/provinces",
              townsUrl: "/api/towns",
              labels: {
                country: __("pais"),
                province: __("provincia"),
                town: __("poblacion")
              },
              layout: "split2x2",
              extraRight: /* @__PURE__ */ jsxs(Fragment, { children: [
                /* @__PURE__ */ jsx("label", { className: "form-label", children: __("cp") }),
                /* @__PURE__ */ jsx(
                  TextInput,
                  {
                    name: "cp",
                    value: form.cp,
                    onChange: (e) => handleChange("cp", e.target.value),
                    maxLength: 10
                  }
                ),
                /* @__PURE__ */ jsx(InputError, { message: errors.cp, className: "mt-1" })
              ] })
            }
          ) }),
          /* @__PURE__ */ jsxs("div", { className: "col-12", children: [
            /* @__PURE__ */ jsxs("label", { className: "form-label", children: [
              __("direccion"),
              " ",
              /* @__PURE__ */ jsx("span", { className: "text-danger" })
            ] }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                name: "address",
                value: form.address,
                onChange: (e) => handleChange("address", e.target.value),
                maxLength: 255
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.address, className: "mt-1" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "col-md-6", children: [
            /* @__PURE__ */ jsxs("label", { className: "form-label", children: [
              __("etiqueta"),
              /* @__PURE__ */ jsxs("span", { className: "text-muted small ms-1", children: [
                "(",
                __("ej: Casa, Oficina..."),
                ")"
              ] })
            ] }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                name: "label",
                value: form.label,
                onChange: (e) => handleChange("label", e.target.value),
                maxLength: 100
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.label, className: "mt-1" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "col-md-6", children: [
            /* @__PURE__ */ jsx("label", { className: "form-label", children: __("Complemento dirección") }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                name: "address_extra",
                value: form.address_extra,
                onChange: (e) => handleChange("address_extra", e.target.value),
                maxLength: 255
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.address_extra, className: "mt-1" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "col-12", children: [
            /* @__PURE__ */ jsx("label", { className: "form-label", children: __("observaciones") }),
            /* @__PURE__ */ jsx(
              Textarea,
              {
                name: "observations",
                value: form.observations,
                onChange: (e) => handleChange("observations", e.target.value),
                rows: 3
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.observations, className: "mt-1" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "col-12", children: [
            /* @__PURE__ */ jsxs("div", { className: "form-check", children: [
              /* @__PURE__ */ jsx(
                Checkbox,
                {
                  id: "is_main",
                  name: "is_main",
                  checked: form.is_main,
                  onChange: (e) => handleChange("is_main", e.target.checked)
                }
              ),
              /* @__PURE__ */ jsx("label", { htmlFor: "is_main", className: "form-check-label ms-2", children: __("Marcar como dirección principal") })
            ] }),
            /* @__PURE__ */ jsx(InputError, { message: errors.is_main, className: "mt-1" })
          ] })
        ] }) })
      }
    )
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
  contact_subtypes,
  contact_subtype_id,
  cost_centers,
  user_cost_centers,
  business_types,
  crm_contact,
  crm_account,
  addresses,
  countries,
  profile,
  company,
  company_context,
  pivot,
  user_companies
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
  try {
    const backRoute = crm_contact != null ? "crm-contacts.index" : "users.index";
    const backTextKey = crm_contact != null ? "contactos_volver" : "usuarios_volver";
    actions.push({
      text: __(backTextKey),
      icon: "la-angle-left",
      url: backRoute,
      modal: false
    });
  } catch (e) {
    actions.push({ text: __("usuarios_volver"), icon: "la-angle-left", url: "users.index", modal: false });
  }
  if ((crm_account == null ? void 0 : crm_account.id) && (crm_account == null ? void 0 : crm_account.name)) {
    actions.push({
      text: __("cuenta_volver") + ` ${crm_account.name}`,
      icon: "la-angle-left",
      url: "crm-accounts.edit",
      params: [crm_account.id, "users"],
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
    { key: "user-addresses", label: __("direcciones") },
    // { key: 'user-categories', label: __('categorias') },
    { key: "user-images", label: __("documentos") },
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
                contact_subtypes,
                contact_subtype_id,
                cost_centers,
                user_cost_centers,
                business_types: business_types ?? [],
                crm_contact,
                pivot,
                company_context,
                user_companies
              }
            );
          case "user-password":
            return /* @__PURE__ */ jsx(UserPassword, { user });
          case "user-addresses":
            return /* @__PURE__ */ jsx(
              ManageUserAddresses,
              {
                userId: user.id,
                addresses,
                countries
              }
            );
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
