import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import "react";
import { usePage, useForm, router } from "@inertiajs/react";
import { F as FormDatePickerInput, t as toLocalYmd } from "./DatePickerToForm-DlY2BJGL.js";
import { F as FileInput } from "./FileInput-U7oe6ye3.js";
import { I as InputError } from "./InputError-DME5vguS.js";
import { M as ManagePhones } from "./ManagePhones-C_mhnW8c.js";
import { P as PrimaryButton } from "./PrimaryButton-B91ets3U.js";
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
  crm_contact,
  user_company_id,
  pivot,
  company_context = null
}) {
  var _a, _b, _c, _d, _e;
  const __ = useTranslation();
  const props = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  const locale = props.locale || false;
  props.languages || [];
  const { showConfirm } = useSweetAlert();
  props.permissions || {};
  ((_c = (_b = props.languages) == null ? void 0 : _b[locale]) == null ? void 0 : _c[6]) || "dd/MM/yyyy";
  const contactTypeOptions = Array.isArray(contact_types) ? contact_types : [];
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
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };
  const normalizeSex = (v) => v == null ? "" : String(v).trim().toLowerCase().charAt(0);
  const { data, setData, put, processing, errors } = useForm({
    // si no tiene role y no es admin, asignamos por defecto 'Invitados'
    role: currentRole || ((user == null ? void 0 : user.isAdmin) == 1 ? "" : "Invitados"),
    name: user.name || "",
    surname: user.surname || "",
    salutation: user.salutation || "",
    email: user.email || "",
    nif: user.nif || "",
    sex: normalizeSex(user.sex),
    birthday: user.birthday ? parseYMD(user.birthday) : null,
    signature: null,
    user_company_id: user_company_id ?? "",
    contact_type: Array.isArray(contactTypeOptions) && contactTypeOptions.length ? (crm_contact == null ? void 0 : crm_contact.contact_type) ?? "" : "",
    position: (pivot == null ? void 0 : pivot.position) ?? "",
    department: (pivot == null ? void 0 : pivot.department) ?? ""
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
      if (key === "signature") {
        if (value instanceof File) formData.append(key, value);
        return;
      }
      if (key === "birthday") {
        const ymd = toYMD(value);
        if (ymd) formData.append(key, ymd);
        return;
      }
      if (value !== null && value !== void 0) {
        formData.append(key, value);
      }
    });
    router.post(route("users.update", user.id), formData, {
      forceFormData: true,
      preserveScroll: true
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
          /* @__PURE__ */ jsx(
            FormDatePickerInput,
            {
              id: "birthday",
              name: "birthday",
              selected: data.birthday,
              onChange: (name, date) => setData(name, toLocalYmd(date)),
              dateFormat: "dd/MM/yyyy",
              label: "fecha_nacimiento",
              required: false
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors.birthday })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "w-100 m-0" }),
        crm_contact && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("div", { className: "col-md-4", children: /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "contact_type", className: "form-label", children: __("contacto_tipo") }),
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
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "col-md-4", children: /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "position", className: "form-label", children: __("cargo") }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                className: "",
                name: "position",
                type: "text",
                placeholder: __("cargo"),
                value: data.position,
                onChange: (e) => setData("position", e.target.value),
                maxLength: 150
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.position })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "col-md-4", children: /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "department", className: "form-label", children: __("departamento") }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                className: "",
                name: "department",
                type: "text",
                placeholder: __("departamento"),
                value: data.department,
                onChange: (e) => setData("department", e.target.value),
                maxLength: 150
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.department })
          ] }) })
        ] }),
        /* @__PURE__ */ jsx(
          SetSex,
          {
            value: data.sex,
            onChange: (e) => setData("sex", e.target.value),
            error: errors.sex
          }
        ),
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
