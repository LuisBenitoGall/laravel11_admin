import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { router, usePage, useForm } from "@inertiajs/react";
import { C as Checkbox } from "./Checkbox-C9HPJULq.js";
import { F as FormDatePickerInput, t as toLocalYmd } from "./DatePickerToForm-DlY2BJGL.js";
import { F as FileInput } from "./FileInput-U7oe6ye3.js";
import { I as InputError } from "./InputError-DME5vguS.js";
import { Button, Spinner, Row, Col, Card, OverlayTrigger, Tooltip, Modal, Form } from "react-bootstrap";
import { u as useSweetAlert } from "./useSweetAlert-D4PAsWYN.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import { M as ManagePhones } from "./ManagePhones-LdkmCbcO.js";
import { P as PrimaryButton } from "./PrimaryButton-CIbKPOjQ.js";
import { R as RadioButton } from "./RadioButton-BQ8Yvx79.js";
import { S as SelectInput } from "./SelectInput-DrqFt-OA.js";
import { S as SetSex } from "./SetSex-BUKGr851.js";
import { T as TextInput } from "./TextInput-CzxrbIpp.js";
import { Y as YearSelect } from "./YearSelect-BnIqrNoW.js";
import "react-datepicker";
/* empty css                          */
import "date-fns/locale";
import "sweetalert2";
const mailHref = (email) => {
  if (!email) return "#";
  return `mailto:${encodeURIComponent(email)}`;
};
function ManageExtraEmails({
  userId,
  titleKey = "emails_adicionales",
  // clave i18n del título
  addNewEmail = true,
  rowXs = 1,
  rowMd = 2,
  rowLg = 3
}) {
  const __ = useTranslation();
  const { showConfirm } = useSweetAlert();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const fetchData = async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const url = route("user-emails.get", { user: userId });
      const res = await fetch(url, {
        headers: { "X-Requested-With": "XMLHttpRequest" }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Error");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, [userId]);
  const openCreate = () => {
    setFormErrors({});
    setError(null);
    setEditing({
      id: null,
      email: "",
      observations: ""
    });
    setShowModal(true);
  };
  const openEdit = (item) => {
    setFormErrors({});
    setError(null);
    setEditing({
      id: item.id,
      email: item.email || "",
      observations: item.observations || ""
    });
    setShowModal(true);
  };
  const closeModal = () => {
    if (saving) return;
    setShowModal(false);
    setEditing(null);
  };
  const handleChange = (field, value) => {
    setEditing((prev) => ({ ...prev, [field]: value }));
  };
  const handleSave = (e) => {
    var _a;
    (_a = e == null ? void 0 : e.preventDefault) == null ? void 0 : _a.call(e);
    if (!editing || !userId) return;
    setSaving(true);
    setError(null);
    const payload = {
      user_id: userId,
      email: editing.email,
      observations: editing.observations || null
    };
    const common = {
      preserveScroll: true,
      onSuccess: () => {
        setFormErrors({});
        setError(null);
        fetchData();
        closeModal();
      },
      onError: (errors) => {
        setFormErrors(errors || {});
        const first = errors && Object.values(errors)[0];
        setError(first || null);
      },
      onFinish: () => setSaving(false)
    };
    if (editing.id) {
      router.put(route("user-emails.update", editing.id), payload, common);
    } else {
      router.post(route("user-emails.store"), payload, common);
    }
  };
  const handleDelete = (id) => {
    if (!id) return;
    showConfirm({
      title: __("email_eliminar"),
      text: __("email_eliminar_confirm"),
      icon: "warning",
      onConfirm: () => {
        setDeletingId(id);
        router.delete(route("user-emails.destroy", id), {
          preserveScroll: true,
          onSuccess: () => fetchData(),
          onError: () => setError(__("error_generico")),
          onFinish: () => setDeletingId(null)
        });
      }
    });
  };
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "position-relative mt-3", children: [
    /* @__PURE__ */ jsx("hr", {}),
    /* @__PURE__ */ jsxs("div", { className: "d-flex justify-content-between align-items-center mt-4 mb-3", children: [
      /* @__PURE__ */ jsx("h5", { className: "mb-0", children: __(titleKey) }),
      addNewEmail && /* @__PURE__ */ jsxs(
        Button,
        {
          variant: "primary",
          size: "sm",
          onClick: openCreate,
          disabled: !userId,
          children: [
            /* @__PURE__ */ jsx("i", { className: "la la-plus me-1" }),
            __("email")
          ]
        }
      )
    ] }),
    loading && /* @__PURE__ */ jsxs("div", { className: "text-center py-4", children: [
      /* @__PURE__ */ jsx(Spinner, { animation: "border", size: "sm", className: "me-2" }),
      __("cargando")
    ] }),
    !loading && error && /* @__PURE__ */ jsx("div", { className: "alert alert-danger mx-0 mb-3", children: __("error_generico") }),
    !loading && !error && items.length === 0 && /* @__PURE__ */ jsx("div", { className: "text-muted", children: __("emails_sin") }),
    !loading && !error && items.length > 0 && /* @__PURE__ */ jsx(Row, { xs: rowXs, md: rowMd, lg: rowLg, className: "g-3", children: items.map((item) => /* @__PURE__ */ jsx(Col, { children: /* @__PURE__ */ jsxs(Card, { className: "h-100", children: [
      /* @__PURE__ */ jsx(Card.Body, { children: /* @__PURE__ */ jsx("div", { className: "d-flex justify-content-between align-items-start", children: /* @__PURE__ */ jsxs("div", { className: "w-100", children: [
        /* @__PURE__ */ jsx("div", { className: "fw-semibold", children: item.email || "—" }),
        item.observations && /* @__PURE__ */ jsxs("div", { className: "text-muted small mt-2", children: [
          /* @__PURE__ */ jsxs("strong", { children: [
            __("observaciones"),
            ":"
          ] }),
          " ",
          item.observations
        ] })
      ] }) }) }),
      /* @__PURE__ */ jsxs(Card.Footer, { className: "d-flex justify-content-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "btn-group", role: "group", children: [
          /* @__PURE__ */ jsx(OverlayTrigger, { placement: "top", overlay: /* @__PURE__ */ jsx(Tooltip, { children: __("email_enviar") }), children: /* @__PURE__ */ jsx("a", { className: "btn btn-sm btn-outline-secondary", href: mailHref(item.email), children: /* @__PURE__ */ jsx("i", { className: "la la-envelope" }) }) }),
          /* @__PURE__ */ jsx(OverlayTrigger, { placement: "top", overlay: /* @__PURE__ */ jsx(Tooltip, { children: __("copiar") }), children: /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "btn btn-sm btn-outline-secondary",
              onClick: () => copyToClipboard(item.email),
              disabled: !item.email,
              children: /* @__PURE__ */ jsx("i", { className: "la la-copy" })
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "btn-group", role: "group", children: [
          /* @__PURE__ */ jsx(OverlayTrigger, { placement: "top", overlay: /* @__PURE__ */ jsx(Tooltip, { children: __("editar") }), children: /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "btn btn-sm btn-info text-white",
              onClick: () => openEdit(item),
              children: /* @__PURE__ */ jsx("i", { className: "la la-edit" })
            }
          ) }),
          /* @__PURE__ */ jsx(OverlayTrigger, { placement: "top", overlay: /* @__PURE__ */ jsx(Tooltip, { children: __("eliminar") }), children: /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "btn btn-sm btn-danger",
              onClick: () => handleDelete(item.id),
              disabled: deletingId === item.id,
              children: deletingId === item.id ? /* @__PURE__ */ jsx(Spinner, { size: "sm", animation: "border" }) : /* @__PURE__ */ jsx("i", { className: "la la-trash" })
            }
          ) })
        ] })
      ] })
    ] }) }, item.id)) }),
    /* @__PURE__ */ jsx(Modal, { show: showModal, onHide: closeModal, backdrop: "static", children: /* @__PURE__ */ jsxs(Form, { onSubmit: handleSave, children: [
      /* @__PURE__ */ jsx(Modal.Header, { closeButton: true, children: /* @__PURE__ */ jsx(Modal.Title, { children: (editing == null ? void 0 : editing.id) ? __("email_editar") : __("email_nuevo") }) }),
      /* @__PURE__ */ jsxs(Modal.Body, { children: [
        error && /* @__PURE__ */ jsx("div", { className: "alert alert-danger", children: error }),
        /* @__PURE__ */ jsxs(Row, { className: "g-2", children: [
          /* @__PURE__ */ jsxs(Col, { xs: 12, children: [
            /* @__PURE__ */ jsxs(Form.Label, { children: [
              __("email"),
              "*"
            ] }),
            /* @__PURE__ */ jsx(
              Form.Control,
              {
                type: "email",
                value: (editing == null ? void 0 : editing.email) ?? "",
                onChange: (e) => handleChange("email", e.target.value),
                placeholder: "usuario@example.com",
                required: true,
                maxLength: 255,
                isInvalid: !!formErrors.email
              }
            ),
            /* @__PURE__ */ jsx(Form.Control.Feedback, { type: "invalid", children: formErrors.email })
          ] }),
          /* @__PURE__ */ jsxs(Col, { xs: 12, children: [
            /* @__PURE__ */ jsx(Form.Label, { children: __("observaciones") }),
            /* @__PURE__ */ jsx(
              Form.Control,
              {
                as: "textarea",
                rows: 3,
                value: (editing == null ? void 0 : editing.observations) ?? "",
                onChange: (e) => handleChange("observations", e.target.value),
                maxLength: 2e3,
                isInvalid: !!formErrors.observations
              }
            ),
            /* @__PURE__ */ jsx(Form.Control.Feedback, { type: "invalid", children: formErrors.observations })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Modal.Footer, { children: [
        /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: closeModal, disabled: saving, children: __("cancelar") }),
        /* @__PURE__ */ jsx(Button, { variant: "primary", type: "submit", disabled: saving, children: saving ? /* @__PURE__ */ jsx(Spinner, { size: "sm", animation: "border" }) : __("guardar") })
      ] })
    ] }) })
  ] });
}
function UserPersonalData({
  user,
  roles = {},
  user_roles = {},
  salutations = [],
  contact_types = [],
  contact_subtypes = [],
  contact_subtype_id = null,
  cost_centers = [],
  user_cost_centers = [],
  business_types = [],
  crm_contact,
  pivot,
  // ya no lo usamos aquí, pero lo dejo en la firma por si otros tabs lo necesitan
  company_context = null,
  user_companies = []
  // TODAS las relaciones user <-> companies
}) {
  var _a, _b, _c, _d, _e, _f;
  const __ = useTranslation();
  const props = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  const locale = props.locale || false;
  const { showConfirm } = useSweetAlert();
  const datepickerFormat = ((_c = (_b = props.languages) == null ? void 0 : _b[locale]) == null ? void 0 : _c[6]) || "dd/MM/yyyy";
  const normalizeOptions = (input) => {
    const out = [];
    if (!input) return out;
    if (Array.isArray(input)) {
      if (input.length && typeof input[0] === "object") {
        return input.map((item, idx) => {
          const value = item.value ?? item.id ?? item.key ?? item.name ?? item.label ?? idx;
          const label = item.label ?? item.name ?? item.title ?? String(item);
          return { value: String(value), label };
        });
      }
      return input.map((item) => ({ value: String(item), label: String(item) }));
    }
    if (typeof input === "object") {
      return Object.entries(input).map(([key, value]) => {
        if (value && typeof value === "object") {
          const v = value.id ?? value.value ?? key;
          const l = value.name ?? value.label ?? value.title ?? String(value);
          return { value: String(v), label: l };
        }
        return { value: String(key), label: String(value) };
      });
    }
    return out;
  };
  const contactTypeOptions = normalizeOptions(contact_types);
  const contactSubtypeOptions = normalizeOptions(contact_subtypes);
  const costCenters = normalizeOptions(cost_centers);
  const normalizeSelected = (input) => {
    if (!input) return [];
    if (Array.isArray(input)) {
      if (input.length && typeof input[0] === "object") {
        return input.map((item) => String(item.id ?? item.value ?? item.key ?? item.name ?? item));
      }
      return input.map((item) => String(item));
    }
    if (typeof input === "object") {
      return Object.entries(input).map(([, value]) => String((value == null ? void 0 : value.id) ?? (value == null ? void 0 : value.value) ?? value));
    }
    return [];
  };
  const initialCostCenters = normalizeSelected(user_cost_centers);
  const arrRoles = Object.entries(roles).map(([key, label]) => ({
    value: key,
    label
  }));
  const currentRole = ((_e = (_d = user_roles == null ? void 0 : user_roles[0]) == null ? void 0 : _d.id) == null ? void 0 : _e.toString()) || "";
  const parseYMD = (s) => {
    if (!s) return null;
    const [y, m, d] = String(s).split("-").map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  };
  const toYMD = (d) => {
    if (!d) return null;
    if (typeof d === "string") {
      const match = d.match(/^\d{4}-\d{2}-\d{2}$/);
      return match ? d : null;
    }
    if (d instanceof Date && !isNaN(d.getTime())) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    }
    return null;
  };
  const normalizeSex = (v) => v == null ? "" : String(v).trim().toLowerCase().charAt(0);
  (company_context == null ? void 0 : company_context.company_id_real) || null;
  const dynamicCompanyFields = {};
  const companiesArray = Array.isArray(user_companies) ? user_companies : [];
  companiesArray.forEach((uc) => {
    const posKey = `position_company_${uc.company_id}`;
    const deptKey = `department_company_${uc.company_id}`;
    dynamicCompanyFields[posKey] = uc.position || "";
    dynamicCompanyFields[deptKey] = uc.department || "";
  });
  const { data, setData, processing, errors, setError } = useForm({
    role: currentRole || ((user == null ? void 0 : user.isAdmin) == 1 ? "" : "Invitados"),
    name: user.name || "",
    surname: user.surname || "",
    salutation: user.salutation || "",
    email: user.email || "",
    nif: user.nif || "",
    sex: normalizeSex(user.sex),
    accept_emails: !!user.accept_emails,
    birthday: user.birthday ? parseYMD(user.birthday) : null,
    signature: null,
    contact_type: contactTypeOptions.length ? (crm_contact == null ? void 0 : crm_contact.contact_type) ?? "" : "",
    contact_subtype: contactSubtypeOptions.length ? contact_subtype_id && typeof contact_subtype_id === "object" && contact_subtype_id.category_id ? String(contact_subtype_id.category_id) : contact_subtype_id ? String(contact_subtype_id) : (crm_contact == null ? void 0 : crm_contact.contact_subtype_id) ? String(crm_contact.contact_subtype_id) : (crm_contact == null ? void 0 : crm_contact.contact_subtype) ? String(crm_contact.contact_subtype) : "" : "",
    // campos dinámicos para empresas
    ...dynamicCompanyFields,
    cost_centers: initialCostCenters,
    business_type: (crm_contact == null ? void 0 : crm_contact.business_type) ?? "",
    last_year_service: (crm_contact == null ? void 0 : crm_contact.last_year_service) ?? ""
  });
  const [submitting, setSubmitting] = useState(false);
  const handleChange = (e) => {
    const { name, type, checked, value, files } = e.target;
    if (type === "checkbox") {
      setData(name, checked);
    } else if (type === "file") {
      setData(name, files.length ? files[0] : null);
    } else {
      setData(name, value);
    }
  };
  function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    const formData = new FormData();
    formData.append("_method", "PUT");
    Object.entries(data).forEach(([key, value]) => {
      if (key === "signature") {
        if (value instanceof File) {
          formData.append(key, value);
        }
        return;
      }
      if (key === "birthday") {
        const ymd = toYMD(value);
        if (ymd) {
          formData.append(key, ymd);
        }
        return;
      }
      if (Array.isArray(value)) {
        value.forEach((v) => {
          if (v !== null && v !== void 0) {
            formData.append(`${key}[]`, v);
          }
        });
        return;
      }
      if (value !== null && value !== void 0) {
        formData.append(key, value);
      }
    });
    setSubmitting(true);
    router.post(route("users.update", user.id), formData, {
      forceFormData: true,
      preserveScroll: true,
      onError: (errBag) => {
        setError(errBag);
      },
      onFinish: () => setSubmitting(false)
    });
  }
  const handleDeleteSignature = () => {
    showConfirm({
      title: __("firma_eliminar"),
      text: __("firma_eliminar_confirm"),
      icon: "warning",
      onConfirm: () => {
        router.delete(route("users.signature.delete", user.id), {
          preserveScroll: true,
          onSuccess: () => {
            location.reload();
          }
        });
      }
    });
  };
  (company_context == null ? void 0 : company_context.name) || "";
  const canEditUserCompanies = !!((_f = props.permissions) == null ? void 0 : _f["user-companies.edit"]);
  const handleDeleteUserCompany = (ucId, name) => {
    showConfirm({
      title: __("empresa_desvincular"),
      text: `${__("empresa_desvincular_confirm")} (${name})`,
      icon: "warning",
      onConfirm: () => {
        router.delete(route("user-companies.destroy", ucId), {
          preserveScroll: true
        });
      }
    });
  };
  return /* @__PURE__ */ jsxs("div", { className: "col-12 gy-2", children: [
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
      /* @__PURE__ */ jsxs("div", { className: "row gy-3 mb-3", children: [
        /* @__PURE__ */ jsx("div", { className: "col-12", children: /* @__PURE__ */ jsx("h6", { className: "mb-3", children: __("datos_personales") }) }),
        (user == null ? void 0 : user.isAdmin) == 1 ? /* @__PURE__ */ jsxs("div", { className: "col-12", children: [
          /* @__PURE__ */ jsxs("label", { htmlFor: "role", className: "form-label", children: [
            __("role"),
            "*"
          ] }),
          /* @__PURE__ */ jsx(
            RadioButton,
            {
              name: "role",
              value: data.role,
              onChange: (e) => setData("role", e.target.value),
              options: arrRoles,
              required: true
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors.role })
        ] }) : /* @__PURE__ */ jsx("input", { type: "hidden", name: "role", value: data.role }),
        /* @__PURE__ */ jsxs("div", { className: "col-md-2", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "salutation", className: "form-label", children: __("tratamiento") }),
          /* @__PURE__ */ jsxs(
            SelectInput,
            {
              name: "salutation",
              value: data.salutation,
              onChange: (e) => setData("salutation", e.target.value),
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: __("opcion_selec") }),
                salutations.map((option) => /* @__PURE__ */ jsx("option", { value: option.value, children: option.label }, option.value))
              ]
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors.salutation })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "col-md-5", children: [
          /* @__PURE__ */ jsxs("label", { htmlFor: "name", className: "form-label", children: [
            __("nombre"),
            "*"
          ] }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              name: "name",
              type: "text",
              placeholder: __("nombre"),
              value: data.name,
              onChange: (e) => setData("name", e.target.value),
              maxLength: 100,
              required: true
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors.name })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "col-md-5", children: [
          /* @__PURE__ */ jsxs("label", { htmlFor: "surname", className: "form-label", children: [
            __("apellidos"),
            "*"
          ] }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              name: "surname",
              type: "text",
              placeholder: __("apellidos"),
              value: data.surname,
              onChange: (e) => setData("surname", e.target.value),
              maxLength: 100,
              required: true
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors.surname })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "col-md-6", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "email", className: "form-label", children: __("email") }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              name: "email",
              type: "email",
              placeholder: __("email"),
              value: data.email,
              onChange: (e) => setData("email", e.target.value),
              maxLength: 100
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors.email })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "col-md-3", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "nif", className: "form-label", children: __("nif") }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              name: "nif",
              type: "text",
              placeholder: __("nif"),
              value: data.nif,
              onChange: (e) => setData("nif", e.target.value),
              maxLength: 15
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors.nif })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "col-md-3", children: [
          /* @__PURE__ */ jsx(
            FormDatePickerInput,
            {
              id: "birthday",
              name: "birthday",
              selected: data.birthday,
              onChange: (name, date) => setData(name, toLocalYmd(date)),
              dateFormat: datepickerFormat,
              label: "fecha_nacimiento",
              required: false
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors.birthday })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "w-100 m-0" }),
        /* @__PURE__ */ jsx(
          SetSex,
          {
            value: data.sex,
            onChange: (e) => setData("sex", e.target.value),
            error: errors.sex
          }
        ),
        (company_context == null ? void 0 : company_context.type) === "contact" && /* @__PURE__ */ jsxs("div", { className: "col-md-2", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "last_year_service", className: "form-label", children: __("ultimo_servicio_any") }),
          /* @__PURE__ */ jsx(
            YearSelect,
            {
              id: "last_year_service",
              name: "last_year_service",
              minYear: 2e3,
              maxYear: (/* @__PURE__ */ new Date()).getFullYear(),
              value: typeof data.last_year_service === "number" || typeof data.last_year_service === "string" && data.last_year_service !== "" ? String(data.last_year_service) : "",
              onChange: (e) => setData("last_year_service", e.target.value ? parseInt(e.target.value, 10) : ""),
              placeholder: __("opcion_selec"),
              className: "form-select"
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors.last_year_service })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "col-md-4", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "accept_emails", className: "form-label", children: __("emails_acepta") }),
          /* @__PURE__ */ jsxs("div", { className: "d-flex align-items-start gap-2", children: [
            /* @__PURE__ */ jsx(
              Checkbox,
              {
                className: "xl",
                id: "accept_emails",
                name: "accept_emails",
                checked: !!data.accept_emails,
                onChange: (e) => setData("accept_emails", e.target.checked)
              }
            ),
            /* @__PURE__ */ jsx(
              "label",
              {
                htmlFor: "accept_emails",
                className: "mb-0 text-warning user-select-none",
                style: { cursor: "pointer", lineHeight: 1.25 },
                children: __("emails_acepta_texto")
              }
            )
          ] }),
          /* @__PURE__ */ jsx(InputError, { message: errors.accept_emails })
        ] })
      ] }),
      crm_contact && /* @__PURE__ */ jsxs("div", { className: "row gy-3 mb-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "col-md-4", children: [
          /* @__PURE__ */ jsx(
            "label",
            {
              htmlFor: "contact_type",
              className: "form-label",
              children: __("contacto_tipo")
            }
          ),
          /* @__PURE__ */ jsxs(
            SelectInput,
            {
              name: "contact_type",
              value: data.contact_type,
              onChange: (e) => setData("contact_type", e.target.value),
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: __("opcion_selec") }),
                contactTypeOptions.map((option) => /* @__PURE__ */ jsx("option", { value: option.value, children: option.label }, option.value))
              ]
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors.contact_type })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "col-md-4", children: [
          /* @__PURE__ */ jsx(
            "label",
            {
              htmlFor: "contact_subtype",
              className: "form-label",
              children: __("contacto_subtipo")
            }
          ),
          /* @__PURE__ */ jsxs(
            SelectInput,
            {
              name: "contact_subtype",
              value: data.contact_subtype,
              onChange: (e) => setData("contact_subtype", e.target.value),
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: __("opcion_selec") }),
                contactSubtypeOptions.map((option) => /* @__PURE__ */ jsx("option", { value: option.value, children: option.label }, option.value))
              ]
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors.contact_subtype })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "col-md-4", children: [
          /* @__PURE__ */ jsx(
            "label",
            {
              htmlFor: "cost_centers",
              className: "form-label",
              children: __("centro_coste")
            }
          ),
          /* @__PURE__ */ jsxs(
            SelectInput,
            {
              name: "cost_centers",
              multiple: false,
              value: Array.isArray(data.cost_centers) && data.cost_centers.length ? String(data.cost_centers[0]) : "",
              onChange: (e) => {
                const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
                setData("cost_centers", selected);
              },
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: __("opcion_selec") }),
                costCenters.map((option) => /* @__PURE__ */ jsx("option", { value: option.value, children: option.label }, option.value))
              ]
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors.cost_centers })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "col-md-4", children: /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "business_type", className: "form-label", children: __("negocio_tipo") }),
          /* @__PURE__ */ jsxs(
            SelectInput,
            {
              name: "business_type",
              value: data.business_type,
              onChange: (e) => setData("business_type", e.target.value),
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: __("opcion_selec") }),
                business_types.map((bt, idx) => /* @__PURE__ */ jsx("option", { value: (bt == null ? void 0 : bt.id) ?? (bt == null ? void 0 : bt.value) ?? (bt == null ? void 0 : bt.slug) ?? idx, children: (bt == null ? void 0 : bt.name) ?? (bt == null ? void 0 : bt.title) ?? (bt == null ? void 0 : bt.label) ?? String(bt) }, (bt == null ? void 0 : bt.id) ?? (bt == null ? void 0 : bt.value) ?? (bt == null ? void 0 : bt.slug) ?? idx))
              ]
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors.business_type })
        ] }) })
      ] }),
      (user == null ? void 0 : user.isAdmin) == 1 && /* @__PURE__ */ jsx("div", { className: "row gy-3 mb-3", children: /* @__PURE__ */ jsxs("div", { className: "col-md-6", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "signature", className: "form-label", children: __("firma") }),
        user.signature ? /* @__PURE__ */ jsxs("div", { className: "d-flex align-items-start", children: [
          /* @__PURE__ */ jsx(
            "img",
            {
              src: `/storage/signatures/${user.signature}`,
              alt: user.name,
              className: "img-thumbnail me-3",
              style: {
                maxWidth: "300px",
                objectFit: "contain"
              }
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "ms-2 btn btn-sm btn-danger",
              onClick: handleDeleteSignature,
              children: /* @__PURE__ */ jsx("i", { className: "la la-trash" })
            }
          )
        ] }) : /* @__PURE__ */ jsx(
          FileInput,
          {
            name: "signature",
            accept: "image/*",
            onChange: handleChange,
            error: errors.signature
          }
        )
      ] }) }),
      companiesArray.length > 0 && /* @__PURE__ */ jsxs("div", { className: "my-5", children: [
        /* @__PURE__ */ jsx("h6", { className: "mb-2", children: __("empresas") }),
        /* @__PURE__ */ jsx("div", { className: "table-responsive", style: { minHeight: "0px" }, children: /* @__PURE__ */ jsxs("table", { className: "table table-sm table-striped mb-0", children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { children: __("empresa") }),
            /* @__PURE__ */ jsx("th", { children: __("cargo") }),
            /* @__PURE__ */ jsx("th", { children: __("departamento") }),
            canEditUserCompanies && /* @__PURE__ */ jsx("th", { style: { width: "1%" } })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { children: companiesArray.map((uc) => {
            var _a2, _b2;
            const posKey = `position_company_${uc.company_id}`;
            const deptKey = `department_company_${uc.company_id}`;
            const ucName = ((_a2 = uc.company) == null ? void 0 : _a2.tradename) || ((_b2 = uc.company) == null ? void 0 : _b2.name) || "-";
            return /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { className: "ps-2 align-middle", children: ucName }),
              /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx(
                TextInput,
                {
                  name: posKey,
                  type: "text",
                  value: data[posKey] ?? "",
                  onChange: (e) => setData(
                    posKey,
                    e.target.value
                  ),
                  maxLength: 150
                }
              ) }),
              /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx(
                TextInput,
                {
                  name: deptKey,
                  type: "text",
                  value: data[deptKey] ?? "",
                  onChange: (e) => setData(
                    deptKey,
                    e.target.value
                  ),
                  maxLength: 150
                }
              ) }),
              canEditUserCompanies && /* @__PURE__ */ jsx("td", { className: "align-middle text-end", children: /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  className: "btn btn-sm btn-danger",
                  title: __("empresa_desvincular"),
                  onClick: () => handleDeleteUserCompany(uc.id, ucName),
                  children: /* @__PURE__ */ jsx("i", { className: "la la-trash" })
                }
              ) })
            ] }, uc.id);
          }) })
        ] }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-0 text-end", children: /* @__PURE__ */ jsx(
        PrimaryButton,
        {
          loading: submitting,
          loadingText: __("guardando"),
          className: "btn btn-rdn",
          children: __("guardar")
        }
      ) })
    ] }),
    /* @__PURE__ */ jsx(ManageExtraEmails, { userId: user.id, addNewEmail: true }),
    /* @__PURE__ */ jsx(
      ManagePhones,
      {
        phoneableType: "User",
        phoneableId: user.id,
        defaultWaMessage: __("whatsapp_mensaje")
      }
    )
  ] });
}
export {
  UserPersonalData as default
};
