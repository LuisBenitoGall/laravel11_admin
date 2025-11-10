import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useEffect, useMemo } from "react";
import { router, usePage, useForm } from "@inertiajs/react";
import { F as FormDatePickerInput } from "./DatePickerToForm-HPj3On-3.js";
import { F as FileInput } from "./FileInput-U7oe6ye3.js";
import { I as InputError } from "./InputError-DME5vguS.js";
import { Button, Spinner, Row, Col, Card, OverlayTrigger, Tooltip, Modal, Form } from "react-bootstrap";
import { u as useSweetAlert } from "./useSweetAlert-D4PAsWYN.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import { P as PrimaryButton } from "./PrimaryButton-B91ets3U.js";
import { R as RadioButton } from "./RadioButton-BQ8Yvx79.js";
import { S as SelectInput } from "./SelectInput-DrqFt-OA.js";
import { T as TextInput } from "./TextInput-CzxrbIpp.js";
import "react-datepicker";
/* empty css                          */
import "date-fns/locale";
import "sweetalert2";
const formatPretty = (e164) => {
  if (!e164 || typeof e164 !== "string") return "—";
  const clean = e164.replace(/\s+/g, "");
  const m = clean.match(/^\+(\d{1,3})(\d+)$/);
  if (!m) return e164;
  const cc = `+${m[1]}`;
  const rest = m[2];
  const groups = rest.replace(/(\d{3})(?=\d)/g, "$1 ").trim();
  return `${cc} ${groups}`.trim();
};
const telHref = (e164, ext) => {
  if (!e164) return "#";
  return ext ? `tel:${e164};ext=${encodeURIComponent(ext)}` : `tel:${e164}`;
};
const waHref = (e164, message = "") => {
  if (!e164) return "#";
  const num = e164.replace(/^\+/, "");
  const params = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${num}${params}`;
};
const sortPhones = (arr) => [...arr || []].sort((a, b) => {
  if (a.is_primary && !b.is_primary) return -1;
  if (!a.is_primary && b.is_primary) return 1;
  return (a.id ?? 0) - (b.id ?? 0);
});
function ManagePhones({
  phoneableType,
  // 'User' | 'Company' | 'CrmContact'  (nombre de modelo según tu ruta)
  phoneableId,
  // id numérico del owner
  defaultWaMessage = "Hola"
  // se traducirá abajo con __()
}) {
  const __ = useTranslation();
  const { showConfirm } = useSweetAlert();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [promotingId, setPromotingId] = useState(null);
  const [verifyingId, setVerifyingId] = useState(null);
  const waDefaultText = __(defaultWaMessage) || defaultWaMessage;
  const fetchData = async () => {
    if (!phoneableType || !phoneableId) return;
    setLoading(true);
    setError(null);
    try {
      const url = route("phones.get", { id: phoneableId, model: phoneableType });
      const res = await fetch(url, { headers: { "X-Requested-With": "XMLHttpRequest" } });
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
  }, [phoneableType, phoneableId]);
  const sorted = useMemo(() => sortPhones(items), [items]);
  const openCreate = () => {
    setEditing({
      id: null,
      number: "",
      // input libre, backend normaliza a E.164
      type: "",
      label: "",
      ext: "",
      is_whatsapp: false,
      is_primary: false,
      notes: ""
    });
    setShowModal(true);
  };
  const openEdit = (ph) => {
    setEditing({
      id: ph.id,
      number: ph.e164,
      // mostramos e164; el backend igualmente re-normaliza
      type: ph.type || "mobile",
      label: ph.label || "",
      ext: ph.ext || "",
      is_whatsapp: !!ph.is_whatsapp,
      is_primary: !!ph.is_primary,
      notes: ph.notes || ""
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
    if (!editing) return;
    setSaving(true);
    setError(null);
    const payload = {
      phoneable_type: phoneableType,
      phoneable_id: phoneableId,
      number: editing.number,
      // el backend normaliza a E.164 (ES por defecto)
      type: editing.type,
      label: editing.label || null,
      ext: editing.ext || null,
      is_whatsapp: editing.is_whatsapp ? 1 : 0,
      is_primary: editing.is_primary ? 1 : 0,
      notes: editing.notes || null
    };
    const common = {
      preserveScroll: true,
      onSuccess: () => {
        fetchData();
        closeModal();
      },
      onError: (errors) => {
        const first = errors && Object.values(errors)[0];
        setError(first || __("error_generic"));
      },
      onFinish: () => setSaving(false)
    };
    if (editing.id) {
      router.put(route("phones.update", editing.id), payload, common);
    } else {
      router.post(route("phones.store"), payload, common);
    }
  };
  const handleDelete = async (id) => {
    if (!id) return;
    showConfirm({
      title: __("telefono_eliminar"),
      text: __("telefono_eliminar_confirm"),
      icon: "warning",
      onConfirm: async () => {
        setDeletingId(id);
        router.delete(route("phones.destroy", id), {
          preserveScroll: true,
          onSuccess: () => fetchData(),
          onError: () => setError(__("error_generic")),
          onFinish: () => setDeletingId(null)
        });
      }
    });
  };
  const handlePrimary = (id) => {
    if (!id) return;
    setPromotingId(id);
    setError(null);
    router.post(
      route("phones.primary"),
      {
        phone_id: id,
        phoneable_type: phoneableType,
        phoneable_id: phoneableId
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          fetchData();
        },
        onError: (errors) => {
          const first = errors && (typeof errors === "string" ? errors : Object.values(errors)[0]);
          setError(first || __("error_generic"));
        },
        onFinish: () => setPromotingId(null)
      }
    );
  };
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
    }
  };
  const handleVerify = (id) => {
    if (!id) return;
    showConfirm({
      title: __("telefono_verificar"),
      text: __("telefono_verificar_confirm"),
      icon: "warning",
      onConfirm: () => {
        setVerifyingId(id);
        setError(null);
        router.post(
          route("phones.verify"),
          { phone_id: id },
          // el backend ya sabe a quién pertenece por el id
          {
            preserveScroll: true,
            onSuccess: () => {
              fetchData();
            },
            onError: (errors) => {
              const first = errors && (typeof errors === "string" ? errors : Object.values(errors)[0]);
              setError(first || __("error_generic"));
            },
            onFinish: () => setVerifyingId(null)
          }
        );
      }
    });
  };
  return /* @__PURE__ */ jsxs("div", { className: "position-relative mt-5", children: [
    /* @__PURE__ */ jsx("hr", {}),
    /* @__PURE__ */ jsxs("div", { className: "d-flex justify-content-between align-items-center mt-4 mb-3", children: [
      /* @__PURE__ */ jsx("h5", { className: "mb-0", children: __("telefonos") }),
      /* @__PURE__ */ jsxs(Button, { variant: "primary", size: "sm", onClick: openCreate, children: [
        /* @__PURE__ */ jsx("i", { className: "la la-plus me-1" }),
        __("telefono")
      ] })
    ] }),
    loading && /* @__PURE__ */ jsxs("div", { className: "text-center py-4", children: [
      /* @__PURE__ */ jsx(Spinner, { animation: "border", size: "sm", className: "me-2" }),
      __("cargando")
    ] }),
    !loading && error && /* @__PURE__ */ jsx("div", { className: "alert alert-danger mx-0 mb-3", children: __("error_generico") }),
    !loading && !error && sorted.length === 0 && /* @__PURE__ */ jsx("div", { className: "text-muted", children: __("telefonos_sin") }),
    /* @__PURE__ */ jsx(Row, { xs: 1, md: 2, lg: 3, className: "g-3", children: sorted.map((ph) => /* @__PURE__ */ jsx(Col, { children: /* @__PURE__ */ jsxs(Card, { className: `h-100 ${ph.is_primary ? "border-primary" : ""}`, children: [
      /* @__PURE__ */ jsxs(Card.Body, { children: [
        /* @__PURE__ */ jsxs("div", { className: "d-flex justify-content-between align-items-start", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("div", { className: "fw-semibold", children: [
              formatPretty(ph.e164),
              ph.is_primary && /* @__PURE__ */ jsx("span", { className: "badge bg-primary ms-2", children: __("primario") }),
              ph.is_whatsapp && /* @__PURE__ */ jsx("i", { className: "la la-whatsapp ms-2", "aria-label": "WhatsApp" })
            ] }),
            ph.ext && /* @__PURE__ */ jsxs("div", { className: "text-muted small", children: [
              __("extension"),
              ": ",
              ph.ext
            ] })
          ] }),
          /* @__PURE__ */ jsx("span", { className: `badge ${ph.is_verified ? "bg-success" : "bg-secondary"}`, children: ph.is_verified ? __("verificado") : __("verificado_no") })
        ] }),
        (ph.label || ph.type || ph.notes) && /* @__PURE__ */ jsx("div", { className: "mt-2", children: /* @__PURE__ */ jsxs("div", { className: "text-muted small", children: [
          ph.label ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsxs("strong", { children: [
              __("etiqueta"),
              ":"
            ] }),
            " ",
            ph.label,
            /* @__PURE__ */ jsx("br", {})
          ] }) : null,
          ph.type ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsxs("strong", { children: [
              __("tipo"),
              ":"
            ] }),
            " ",
            __(`${ph.type}`),
            /* @__PURE__ */ jsx("br", {})
          ] }) : null,
          ph.notes ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsxs("strong", { children: [
              __("notas"),
              ":"
            ] }),
            " ",
            ph.notes
          ] }) : null
        ] }) })
      ] }),
      /* @__PURE__ */ jsxs(Card.Footer, { className: "d-flex justify-content-between", children: [
        /* @__PURE__ */ jsxs("div", { className: "btn-group", role: "group", children: [
          /* @__PURE__ */ jsx(OverlayTrigger, { placement: "top", overlay: /* @__PURE__ */ jsx(Tooltip, { children: __("llamar") }), children: /* @__PURE__ */ jsx("a", { className: "btn btn-sm btn-outline-secondary", href: telHref(ph.e164, ph.ext), children: /* @__PURE__ */ jsx("i", { className: "la la-phone" }) }) }),
          !ph.is_verified && /* @__PURE__ */ jsx(OverlayTrigger, { placement: "top", overlay: /* @__PURE__ */ jsx(Tooltip, { children: __("verificar") }), children: /* @__PURE__ */ jsx(
            "button",
            {
              className: "btn btn-sm btn-outline-secondary",
              onClick: () => handleVerify(ph.id),
              disabled: verifyingId === ph.id,
              children: verifyingId === ph.id ? /* @__PURE__ */ jsx(Spinner, { size: "sm", animation: "border" }) : /* @__PURE__ */ jsx("i", { className: "la la-check-circle" })
            }
          ) }),
          ph.is_whatsapp && /* @__PURE__ */ jsx(OverlayTrigger, { placement: "top", overlay: /* @__PURE__ */ jsx(Tooltip, { children: "WhatsApp" }), children: /* @__PURE__ */ jsx(
            "a",
            {
              className: "btn btn-sm btn-outline-success",
              href: waHref(ph.e164, waDefaultText),
              target: "_blank",
              rel: "noopener noreferrer",
              children: /* @__PURE__ */ jsx("i", { className: "la la-whatsapp" })
            }
          ) }),
          /* @__PURE__ */ jsx(OverlayTrigger, { placement: "top", overlay: /* @__PURE__ */ jsx(Tooltip, { children: __("copiar") }), children: /* @__PURE__ */ jsx("button", { className: "btn btn-sm btn-outline-secondary", onClick: () => copyToClipboard(ph.e164), children: /* @__PURE__ */ jsx("i", { className: "la la-copy" }) }) }),
          !ph.is_primary && /* @__PURE__ */ jsx(OverlayTrigger, { placement: "top", overlay: /* @__PURE__ */ jsx(Tooltip, { children: __("primario_marcar") }), children: /* @__PURE__ */ jsx(
            "button",
            {
              className: "btn btn-sm btn-outline-primary",
              onClick: () => handlePrimary(ph.id),
              disabled: promotingId === ph.id,
              children: promotingId === ph.id ? /* @__PURE__ */ jsx(Spinner, { size: "sm", animation: "border" }) : /* @__PURE__ */ jsx("i", { className: "la la-star" })
            }
          ) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "btn-group", role: "group", children: [
          /* @__PURE__ */ jsx(OverlayTrigger, { placement: "top", overlay: /* @__PURE__ */ jsx(Tooltip, { children: __("editar") }), children: /* @__PURE__ */ jsx("button", { className: "btn btn-sm btn-info text-white", onClick: () => openEdit(ph), children: /* @__PURE__ */ jsx("i", { className: "la la-edit" }) }) }),
          /* @__PURE__ */ jsx(OverlayTrigger, { placement: "top", overlay: /* @__PURE__ */ jsx(Tooltip, { children: __("eliminar") }), children: /* @__PURE__ */ jsx(
            "button",
            {
              className: "btn btn-sm btn-danger",
              onClick: () => handleDelete(ph.id),
              disabled: deletingId === ph.id,
              children: deletingId === ph.id ? /* @__PURE__ */ jsx(Spinner, { size: "sm", animation: "border" }) : /* @__PURE__ */ jsx("i", { className: "la la-trash" })
            }
          ) })
        ] })
      ] })
    ] }) }, ph.id)) }),
    /* @__PURE__ */ jsx(Modal, { show: showModal, onHide: closeModal, backdrop: "static", children: /* @__PURE__ */ jsxs(Form, { onSubmit: handleSave, children: [
      /* @__PURE__ */ jsx(Modal.Header, { closeButton: true, children: /* @__PURE__ */ jsx(Modal.Title, { children: (editing == null ? void 0 : editing.id) ? __("telefono_editar") : __("telefono_nuevo") }) }),
      /* @__PURE__ */ jsxs(Modal.Body, { children: [
        error && /* @__PURE__ */ jsx("div", { className: "alert alert-danger", children: __("error_generico") }),
        /* @__PURE__ */ jsxs(Row, { className: "g-2", children: [
          /* @__PURE__ */ jsxs(Col, { md: 8, children: [
            /* @__PURE__ */ jsxs(Form.Label, { children: [
              __("numero"),
              "*"
            ] }),
            /* @__PURE__ */ jsx(
              Form.Control,
              {
                type: "text",
                value: (editing == null ? void 0 : editing.number) ?? "",
                onChange: (e) => handleChange("number", e.target.value),
                placeholder: "+34600111222",
                maxLength: 14,
                required: true
              }
            )
          ] }),
          /* @__PURE__ */ jsxs(Col, { md: 4, children: [
            /* @__PURE__ */ jsx(Form.Label, { children: __("extension") }),
            /* @__PURE__ */ jsx(
              Form.Control,
              {
                type: "text",
                value: (editing == null ? void 0 : editing.ext) ?? "",
                onChange: (e) => handleChange("ext", e.target.value),
                placeholder: "123",
                maxLength: 8
              }
            )
          ] }),
          /* @__PURE__ */ jsxs(Col, { md: 6, children: [
            /* @__PURE__ */ jsx(Form.Label, { children: __("tipo") }),
            /* @__PURE__ */ jsxs(
              Form.Select,
              {
                value: (editing == null ? void 0 : editing.type) ?? "",
                onChange: (e) => handleChange("type", e.target.value),
                children: [
                  /* @__PURE__ */ jsx("option", { value: "", children: __("opcion_selec") }),
                  /* @__PURE__ */ jsx("option", { value: "mobile", children: __("movil") }),
                  /* @__PURE__ */ jsx("option", { value: "landline", children: __("fijo") }),
                  /* @__PURE__ */ jsx("option", { value: "other", children: __("otro") })
                ]
              }
            )
          ] }),
          /* @__PURE__ */ jsxs(Col, { md: 6, children: [
            /* @__PURE__ */ jsx(Form.Label, { children: __("etiqueta") }),
            /* @__PURE__ */ jsx(
              Form.Control,
              {
                type: "text",
                value: (editing == null ? void 0 : editing.label) ?? "",
                onChange: (e) => handleChange("label", e.target.value),
                placeholder: __("etiqueta_ej"),
                maxLength: 50
              }
            )
          ] }),
          /* @__PURE__ */ jsxs(Col, { xs: 12, children: [
            /* @__PURE__ */ jsx(Form.Label, { children: __("notas") }),
            /* @__PURE__ */ jsx(
              Form.Control,
              {
                as: "textarea",
                rows: 2,
                value: (editing == null ? void 0 : editing.notes) ?? "",
                onChange: (e) => handleChange("notes", e.target.value)
              }
            )
          ] }),
          /* @__PURE__ */ jsx(Col, { md: 4, className: "pt-2", children: /* @__PURE__ */ jsx(
            Form.Check,
            {
              type: "switch",
              id: "chk-whatsapp",
              label: "WhatsApp",
              checked: !!(editing == null ? void 0 : editing.is_whatsapp),
              onChange: (e) => handleChange("is_whatsapp", e.target.checked)
            }
          ) }),
          /* @__PURE__ */ jsx(Col, { md: 4, className: "pt-2", children: /* @__PURE__ */ jsx(
            Form.Check,
            {
              type: "switch",
              id: "chk-primary",
              label: __("primario"),
              checked: !!(editing == null ? void 0 : editing.is_primary),
              onChange: (e) => handleChange("is_primary", e.target.checked)
            }
          ) })
        ] })
      ] }),
      /* @__PURE__ */ jsxs(Modal.Footer, { children: [
        /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: closeModal, disabled: saving, children: __("cancelar") }),
        /* @__PURE__ */ jsx(Button, { variant: "primary", type: "submit", disabled: saving, children: saving ? /* @__PURE__ */ jsx(Spinner, { size: "sm", animation: "border" }) : __("guardar") })
      ] })
    ] }) })
  ] });
}
function UserPersonalData({ user, roles = {}, user_roles = {}, salutations = [] }) {
  var _a, _b, _c, _d, _e;
  const __ = useTranslation();
  const props = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  const locale = props.locale || false;
  props.languages || [];
  const { showConfirm } = useSweetAlert();
  props.permissions || {};
  const datepickerFormat = ((_c = (_b = props.languages) == null ? void 0 : _b[locale]) == null ? void 0 : _c[6]) || "dd/MM/yyyy";
  const arrRoles = Object.entries(roles).map(([key, label]) => ({
    value: key,
    label
  }));
  const currentRole = ((_e = (_d = user_roles == null ? void 0 : user_roles[0]) == null ? void 0 : _d.id) == null ? void 0 : _e.toString()) || "";
  const { data, setData, put, processing, errors } = useForm({
    // si no tiene role y no es admin, asignamos por defecto 'Invitados'
    role: currentRole || ((user == null ? void 0 : user.isAdmin) == 1 ? "" : "Invitados"),
    name: user.name || "",
    surname: user.surname || "",
    salutation: user.salutation || "",
    email: user.email || "",
    nif: user.nif || "",
    birthday: user.birthday ? new Date(user.birthday) : null,
    signature: null
  });
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
    const formData = new FormData();
    formData.append("_method", "PUT");
    Object.entries(data).forEach(([key, value]) => {
      if (key === "signature" && value instanceof File) {
        formData.append(key, value);
      } else if (typeof value === "object" && value !== null) {
        formData.append(key, JSON.stringify(value));
      } else if (value !== null && value !== void 0) {
        formData.append(key, value);
      }
    });
    router.post(route("users.update", user.id), formData, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => console.log("Usuario actualizado"),
      onError: (errors2) => console.error("Errores:", errors2),
      onFinish: () => console.log("Petición finalizada")
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
  return /* @__PURE__ */ jsxs("div", { className: "col-12 gy-2", children: [
    /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
      /* @__PURE__ */ jsxs("div", { className: "row gy-3 mb-3", children: [
        (user == null ? void 0 : user.isAdmin) == 1 ? /* @__PURE__ */ jsx("div", { className: "col-12", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
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
        ] }) }) : (
          // Si no es admin, incluimos el role como campo oculto (por defecto 'Invitados')
          /* @__PURE__ */ jsx("input", { type: "hidden", name: "role", value: data.role })
        ),
        /* @__PURE__ */ jsx("div", { className: "col-md-2", children: /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "salutation", className: "form-label", children: __("tratamiento") }),
          /* @__PURE__ */ jsxs(
            SelectInput,
            {
              className: "form-select",
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
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "col-md-5", children: /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("label", { htmlFor: "name", className: "form-label", children: [
            __("nombre"),
            "*"
          ] }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              className: "",
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
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "col-md-5", children: /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("label", { htmlFor: "surname", className: "form-label", children: [
            __("apellidos"),
            "*"
          ] }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              className: "",
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
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "col-md-6", children: /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("label", { htmlFor: "email", className: "form-label", children: [
            __("email"),
            "*"
          ] }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              className: "",
              name: "email",
              type: "email",
              placeholder: __("email"),
              value: data.email,
              onChange: (e) => setData("email", e.target.value),
              maxLength: 100,
              required: true
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors.email })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "col-md-3", children: /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "nif", className: "form-label", children: __("nif") }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              className: "",
              name: "nif",
              type: "text",
              placeholder: __("nif"),
              value: data.nif,
              onChange: (e) => setData("nif", e.target.value),
              maxLength: 15
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors.nif })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "col-md-3", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "birthday", className: "form-label", children: __("fecha_nacimiento") }),
          /* @__PURE__ */ jsx(
            FormDatePickerInput,
            {
              id: "birthday",
              name: "birthday",
              selected: data.birthday ? new Date(data.birthday) : null,
              onChange: (name, date) => {
                setData(name, date);
                if (!date) {
                  setData("published_end", null);
                }
              },
              dateFormat: datepickerFormat
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors.birthday })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "w-100 m-0" }),
        (user == null ? void 0 : user.isAdmin) == 1 && /* @__PURE__ */ jsx("div", { className: "col-md-6", children: /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "signature", className: "form-label", children: __("firma") }),
          user.signature ? /* @__PURE__ */ jsxs("div", { className: "d-flex align-items-start", children: [
            /* @__PURE__ */ jsx(
              "img",
              {
                src: `/storage/signatures/${user.signature}`,
                alt: user.name,
                className: "img-thumbnail me-3",
                style: { maxWidth: "300px", objectFit: "contain" }
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
          ),
          /* @__PURE__ */ jsxs("p", { className: "pt-1 text-warning small", children: [
            /* @__PURE__ */ jsx("span", { className: "me-5", children: __("imagen_formato") }),
            /* @__PURE__ */ jsxs("span", { className: "me-5", children: [
              __("imagen_peso_max"),
              ": 1MB"
            ] }),
            __("imagen_medidas_recomendadas"),
            ": 400x400px"
          ] })
        ] }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-4 text-end", children: /* @__PURE__ */ jsx(PrimaryButton, { disabled: processing, className: "btn btn-rdn", children: processing ? __("procesando") + "..." : __("guardar") }) })
    ] }),
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
