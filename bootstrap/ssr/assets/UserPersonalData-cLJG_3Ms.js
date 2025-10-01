import { jsx, jsxs } from "react/jsx-runtime";
import "react";
import { usePage, useForm, router } from "@inertiajs/react";
import { F as FormDatePickerInput } from "./DatePickerToForm-7KZUnzNv.js";
import { F as FileInput } from "./FileInput-U7oe6ye3.js";
import { I as InputError } from "./InputError-DME5vguS.js";
import { P as PrimaryButton } from "./PrimaryButton-B91ets3U.js";
import { R as RadioButton } from "./RadioButton-BQ8Yvx79.js";
import { T as TextInput } from "./TextInput-p9mIVJQL.js";
import { u as useSweetAlert } from "./useSweetAlert-D4PAsWYN.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import "react-datepicker";
/* empty css                          */
import "date-fns/locale";
import "sweetalert2";
function UserPersonalData({ user, roles = {}, user_roles = {} }) {
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
    role: currentRole,
    name: user.name || "",
    surname: user.surname || "",
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
  return /* @__PURE__ */ jsx("div", { className: "col-12 gy-2", children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
    /* @__PURE__ */ jsxs("div", { className: "row gy-3 mb-3", children: [
      /* @__PURE__ */ jsx("div", { className: "col-12", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
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
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "col-md-6", children: /* @__PURE__ */ jsxs("div", { children: [
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
      /* @__PURE__ */ jsx("div", { className: "col-md-6", children: /* @__PURE__ */ jsxs("div", { children: [
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
      /* @__PURE__ */ jsx("div", { className: "col-md-6", children: /* @__PURE__ */ jsxs("div", { children: [
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
  ] }) });
}
export {
  UserPersonalData as default
};
