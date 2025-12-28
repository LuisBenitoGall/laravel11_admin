import { jsxs, jsx } from "react/jsx-runtime";
import { useState } from "react";
import { usePage, useForm, router } from "@inertiajs/react";
import { C as Checkbox } from "./Checkbox-C9HPJULq.js";
import { F as FormDatePickerInput, t as toLocalYmd } from "./DatePickerToForm-DlY2BJGL.js";
import { F as FileInput } from "./FileInput-U7oe6ye3.js";
import { I as InputError } from "./InputError-DME5vguS.js";
import { M as ManagePhones } from "./ManagePhones-LdkmCbcO.js";
import { P as PrimaryButton } from "./PrimaryButton-CIbKPOjQ.js";
import { R as RadioButton } from "./RadioButton-BQ8Yvx79.js";
import { S as SelectInput } from "./SelectInput-DrqFt-OA.js";
import { S as SetSex } from "./SetSex-BUKGr851.js";
import { T as TextInput } from "./TextInput-CzxrbIpp.js";
import { u as useSweetAlert } from "./useSweetAlert-D4PAsWYN.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import "react-datepicker";
/* empty css                          */
import "date-fns/locale";
import "react-bootstrap";
import "sweetalert2";
function UserPersonalData({
  user,
  roles = {},
  user_roles = {},
  salutations = [],
  contact_types = [],
  contact_subtypes = [],
  contact_subtype_id = null,
  crm_contact,
  pivot,
  // ya no lo usamos aquí, pero lo dejo en la firma por si otros tabs lo necesitan
  company_context = null,
  user_companies = []
  // TODAS las relaciones user <-> companies
}) {
  var _a, _b, _c, _d, _e;
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
    ...dynamicCompanyFields
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
        /* @__PURE__ */ jsxs("div", { className: "col-md-4", children: [
          /* @__PURE__ */ jsx("label", { htmlFor: "accept_emails", className: "form-label", children: __("emails_acepta") }),
          /* @__PURE__ */ jsxs("div", { className: "pt-1 position-relative", children: [
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
            /* @__PURE__ */ jsx("span", { className: "ms-3 pt-5 text-warning", children: __("emails_acepta_texto") })
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
              className: "form-select",
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
              className: "form-select",
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
        ] })
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
      companiesArray.length > 0 && /* @__PURE__ */ jsxs("div", { className: "my-4", children: [
        /* @__PURE__ */ jsx("h6", { className: "mb-2", children: __("empresas") }),
        /* @__PURE__ */ jsx("div", { className: "table-responsive", style: { minHeight: "0px" }, children: /* @__PURE__ */ jsxs("table", { className: "table table-sm table-striped mb-0", children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { children: __("empresa") }),
            /* @__PURE__ */ jsx("th", { children: __("cargo") }),
            /* @__PURE__ */ jsx("th", { children: __("departamento") })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { children: companiesArray.map((uc) => {
            var _a2, _b2;
            const posKey = `position_company_${uc.company_id}`;
            const deptKey = `department_company_${uc.company_id}`;
            return /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { className: "ps-2 align-middle", children: ((_a2 = uc.company) == null ? void 0 : _a2.tradename) || ((_b2 = uc.company) == null ? void 0 : _b2.name) || "-" }),
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
