import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { router, useForm } from "@inertiajs/react";
import { F as FileInput } from "./FileInput-U7oe6ye3.js";
import { I as InfoPopover } from "./InfoPopover-CwWEvwXq.js";
import { I as InputError } from "./InputError-DME5vguS.js";
import { Button, Spinner, Row, Col, Card, OverlayTrigger, Tooltip, Modal, Form } from "react-bootstrap";
import { u as useSweetAlert } from "./useSweetAlert-D4PAsWYN.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import { M as ManagePhones } from "./ManagePhones-C_mhnW8c.js";
import { P as PrimaryButton } from "./PrimaryButton-B91ets3U.js";
import { T as TextInput } from "./TextInput-CzxrbIpp.js";
import "axios";
import "sweetalert2";
function ManageEmails({
  companyId,
  titleKey = "Emails",
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
  const [featuringId, setFeaturingId] = useState(null);
  const fetchData = async () => {
    if (!companyId) return;
    setLoading(true);
    setError(null);
    try {
      const url = route("company-emails.get", { company: companyId });
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
  }, [companyId]);
  const openCreate = () => {
    setFormErrors({});
    setError(null);
    setEditing({
      id: null,
      email: "",
      featured: false,
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
      featured: !!item.featured,
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
    if (!editing || !companyId) return;
    setSaving(true);
    setError(null);
    const payload = {
      company_id: companyId,
      email: editing.email,
      featured: editing.featured ? 1 : 0,
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
      router.put(route("company-emails.update", editing.id), payload, common);
    } else {
      router.post(route("company-emails.store"), payload, common);
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
        router.delete(route("company-emails.destroy", id), {
          preserveScroll: true,
          onSuccess: () => fetchData(),
          onError: () => setError(__("error_generico")),
          onFinish: () => setDeletingId(null)
        });
      }
    });
  };
  const handleFeatured = (id) => {
    if (!id || !companyId) return;
    setFeaturingId(id);
    setError(null);
    router.post(
      route("company-emails.featured"),
      {
        email_id: id,
        company_id: companyId
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          fetchData();
        },
        onError: (errors) => {
          const first = errors && (typeof errors === "string" ? errors : Object.values(errors)[0]);
          setError(first || __("error_generico"));
        },
        onFinish: () => setFeaturingId(null)
      }
    );
  };
  const mailHref = (email) => {
    if (!email) return "#";
    return `mailto:${encodeURIComponent(email)}`;
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
          disabled: !companyId,
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
      /* @__PURE__ */ jsx(Card.Body, { children: /* @__PURE__ */ jsx("div", { className: "d-flex justify-content-between align-items-start", children: /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("div", { className: "fw-semibold", children: [
          item.email || "—",
          item.featured && /* @__PURE__ */ jsx("span", { className: "badge bg-primary ms-2", children: __("primario") })
        ] }),
        item.observations && /* @__PURE__ */ jsxs("div", { className: "text-muted small mt-1", children: [
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
          /* @__PURE__ */ jsx(
            OverlayTrigger,
            {
              placement: "top",
              overlay: /* @__PURE__ */ jsx(Tooltip, { children: __("email_enviar") }),
              children: /* @__PURE__ */ jsx(
                "a",
                {
                  className: "btn btn-sm btn-outline-secondary",
                  href: mailHref(item.email),
                  children: /* @__PURE__ */ jsx("i", { className: "la la-envelope" })
                }
              )
            }
          ),
          !item.featured && /* @__PURE__ */ jsx(
            OverlayTrigger,
            {
              placement: "top",
              overlay: /* @__PURE__ */ jsx(Tooltip, { children: __("primario_marcar") }),
              children: /* @__PURE__ */ jsx(
                "button",
                {
                  className: "btn btn-sm btn-outline-primary",
                  onClick: () => handleFeatured(item.id),
                  disabled: featuringId === item.id,
                  children: featuringId === item.id ? /* @__PURE__ */ jsx(Spinner, { size: "sm", animation: "border" }) : /* @__PURE__ */ jsx("i", { className: "la la-star" })
                }
              )
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "btn-group", role: "group", children: [
          /* @__PURE__ */ jsx(
            OverlayTrigger,
            {
              placement: "top",
              overlay: /* @__PURE__ */ jsx(Tooltip, { children: __("editar") }),
              children: /* @__PURE__ */ jsx(
                "button",
                {
                  className: "btn btn-sm btn-info text-white",
                  onClick: () => openEdit(item),
                  children: /* @__PURE__ */ jsx("i", { className: "la la-edit" })
                }
              )
            }
          ),
          /* @__PURE__ */ jsx(
            OverlayTrigger,
            {
              placement: "top",
              overlay: /* @__PURE__ */ jsx(Tooltip, { children: __("eliminar") }),
              children: /* @__PURE__ */ jsx(
                "button",
                {
                  className: "btn btn-sm btn-danger",
                  onClick: () => handleDelete(item.id),
                  disabled: deletingId === item.id,
                  children: deletingId === item.id ? /* @__PURE__ */ jsx(Spinner, { size: "sm", animation: "border" }) : /* @__PURE__ */ jsx("i", { className: "la la-trash" })
                }
              )
            }
          )
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
                placeholder: "empresa@example.com",
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
          ] }),
          /* @__PURE__ */ jsx(Col, { md: 4, className: "pt-2", children: /* @__PURE__ */ jsx(
            Form.Check,
            {
              type: "switch",
              id: "chk-featured-email",
              label: __("primario"),
              checked: !!(editing == null ? void 0 : editing.featured),
              onChange: (e) => handleChange("featured", e.target.checked)
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
function CompanyFormEdit({
  company = {},
  side = false,
  updateRoute = "companies.update",
  updateParams = null,
  crm_account = false
}) {
  const __ = useTranslation();
  const { showConfirm } = useSweetAlert();
  updateParams ?? [company == null ? void 0 : company.id];
  const { data, setData, post, reset, errors, processing } = useForm({
    name: company.name ?? "",
    tradename: company.tradename ?? "",
    email: (crm_account == null ? void 0 : crm_account.main_email) ?? company.main_email ?? "",
    nif: company.nif ?? "",
    side: side || "",
    logo: null,
    crm_account_id: crm_account.id || false,
    crm_account_linked_company_id: crm_account.linked_company_id || false
  });
  useEffect(() => {
    setData("name", company.name ?? "");
    setData("tradename", company.tradename ?? "");
    setData("nif", company.nif ?? "");
  }, [company]);
  const [showFileInput, setShowFileInput] = useState(!company.logo && !company.logo_url);
  const handleChange = (e) => {
    const { name, type, checked, value, files } = e.target;
    if (type === "checkbox") {
      setData(name, checked);
    } else if (type === "file") {
      setData(name, files[0]);
    } else {
      setData(name, value);
    }
  };
  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append("_method", "PUT");
    Object.entries(data).forEach(([key, value]) => {
      if (key === "logo" && value instanceof File) {
        formData.append(key, value);
      } else if (typeof value === "object" && value !== null) {
        formData.append(key, JSON.stringify(value));
      } else if (value !== null && typeof value !== "undefined") {
        formData.append(key, value);
      }
    });
    router.post(route("companies.update", company.id), formData, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => console.log("Empresa actualizada"),
      onError: (errors2) => console.error("Errores:", errors2),
      onFinish: () => console.log("Petición finalizada")
    });
  }
  const handleDeleteLogo = () => {
    showConfirm({
      title: __("logo_eliminar"),
      text: __("logo_eliminar_confirm"),
      icon: "warning",
      onConfirm: () => {
        router.delete(route("companies.logo.delete", company.id), {
          preserveScroll: true,
          onSuccess: () => {
            setShowFileInput(true);
          }
        });
      }
    });
  };
  const computeLogoSrc = (raw) => {
    if (typeof raw !== "string") return "";
    const r = raw.trim();
    if (!r) return "";
    if (r.startsWith("http") || r.startsWith("//")) return r;
    if (r.startsWith("/")) return r;
    if (r.includes("storage/")) return "/" + r.replace(/^\/+/, "");
    if (r.includes("companies/")) return "/storage/" + r.replace(/^\/+/, "");
    return `/storage/companies/${r.replace(/^\/+/, "")}`;
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("form", { onSubmit: handleSubmit, children: /* @__PURE__ */ jsxs("div", { className: "row gy-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "col-lg-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "form-label", children: [
          __("razon_social"),
          "*"
        ] }),
        /* @__PURE__ */ jsx(
          TextInput,
          {
            type: "text",
            placeholder: __("empresa_nombre"),
            value: data.name,
            onChange: (e) => setData("name", e.target.value),
            maxLength: 100,
            required: true
          }
        ),
        /* @__PURE__ */ jsx(InputError, { message: errors.name })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "col-lg-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "form-label", children: [
          __("nombre_comercial"),
          "*"
        ] }),
        /* @__PURE__ */ jsx(
          TextInput,
          {
            type: "text",
            placeholder: __("nombre_comercial"),
            value: data.tradename,
            onChange: (e) => setData("tradename", e.target.value),
            maxLength: 100,
            required: true
          }
        ),
        /* @__PURE__ */ jsx(InputError, { message: errors.tradename })
      ] }),
      crm_account == false && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { className: "col-lg-3", children: [
          /* @__PURE__ */ jsxs("label", { className: "form-label", children: [
            __("nif"),
            "*"
          ] }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              type: "text",
              placeholder: __("nif"),
              value: data.nif,
              onChange: (e) => setData("nif", e.target.value),
              maxLength: 15,
              required: true
            }
          ),
          /* @__PURE__ */ jsx(InfoPopover, { code: "company-nif" }),
          /* @__PURE__ */ jsx(InputError, { message: errors.nif })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "offset-lg-1 col-lg-8", children: [
          /* @__PURE__ */ jsx("label", { className: "form-label", children: __("logo") }),
          company.logo ? /* @__PURE__ */ jsxs("div", { className: "d-flex align-items-start", children: [
            /* @__PURE__ */ jsx(
              "img",
              {
                src: company.logo_url ?? computeLogoSrc(company.logo),
                alt: company.name,
                className: "img-thumbnail me-3",
                style: { maxWidth: "300px", objectFit: "contain" }
              }
            ),
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                className: "ms-2 btn btn-sm btn-danger",
                onClick: handleDeleteLogo,
                children: /* @__PURE__ */ jsx("i", { className: "la la-trash" })
              }
            )
          ] }) : /* @__PURE__ */ jsx(FileInput, { name: "logo", accept: "image/*", onChange: handleChange, error: errors.logo }),
          /* @__PURE__ */ jsxs("p", { className: "pt-1 text-warning small", children: [
            /* @__PURE__ */ jsx("span", { className: "me-5", children: __("imagen_formato") }),
            /* @__PURE__ */ jsxs("span", { className: "me-5", children: [
              __("imagen_peso_max"),
              ": 1MB"
            ] }),
            __("imagen_medidas_recomendadas"),
            ": 400x400px"
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-4 text-end", children: /* @__PURE__ */ jsx(PrimaryButton, { disabled: processing, className: "btn btn-rdn", children: processing ? __("procesando") + "..." : __("guardar") }) })
    ] }) }),
    /* @__PURE__ */ jsx(
      ManagePhones,
      {
        phoneableType: "Company",
        phoneableId: company.id,
        defaultWaMessage: __("whatsapp_mensaje")
      }
    ),
    /* @__PURE__ */ jsx(
      ManageEmails,
      {
        companyId: company.id
      }
    )
  ] });
}
function CompanyInfoTab({
  company,
  side = false,
  updateRoute = "companies.update",
  updateParams = null,
  crm_account = false
}) {
  return /* @__PURE__ */ jsx(
    CompanyFormEdit,
    {
      company,
      side,
      updateRoute,
      updateParams,
      crm_account
    }
  );
}
export {
  CompanyInfoTab as default
};
