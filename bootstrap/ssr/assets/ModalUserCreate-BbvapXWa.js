import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from "react";
import { usePage, useForm, router } from "@inertiajs/react";
import { F as FormDatePickerInput } from "./DatePickerToForm-DlY2BJGL.js";
import { I as InputError } from "./InputError-DME5vguS.js";
import { R as ReusableModal } from "./ModalTemplate-BnjBXi9G.js";
import { S as SelectInput } from "./SelectInput-DrqFt-OA.js";
import { T as TextInput } from "./TextInput-CzxrbIpp.js";
import { U as UserSearch } from "./UserSearch-Bn5gVs5d.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
function ModalUserCreate({
  show,
  onClose,
  onCreate,
  companyId = false,
  side,
  salutations,
  contact_types,
  contact_subtypes,
  crm_account = false,
  linkCompany = true,
  showUserSearch = false,
  redirectTo = null
}) {
  var _a;
  const __ = useTranslation();
  const pageProps = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  const roles = pageProps.roles || {};
  Object.entries(roles).map(([key, label]) => ({ value: key, label }));
  const [selectedExistingUser, setSelectedExistingUser] = useState(null);
  const [isLinking, setIsLinking] = useState(false);
  const { data, setData, post, processing, reset, errors, clearErrors } = useForm({
    role: "",
    name: "",
    surname: "",
    email: "",
    status: true,
    link_company: linkCompany,
    send_pwd: false,
    birthday: null,
    position: "",
    salutation: "",
    department: "",
    contact_type: "",
    contact_subtype: "",
    phones: [""],
    company_id: companyId || null,
    side: side || "",
    crm_account_id: crm_account ? crm_account.id : null
  });
  useEffect(() => {
    setData("company_id", companyId || null);
    clearErrors();
    if (!show) setSelectedExistingUser(null);
  }, [show, companyId]);
  const handleAddPhone = () => {
    setData("phones", [...data.phones || [], ""]);
  };
  const handlePhoneChange = (index, value) => {
    const next = [...data.phones || []];
    next[index] = value;
    setData("phones", next);
  };
  const handleRemovePhone = (index) => {
    const next = [...data.phones || []];
    next.splice(index, 1);
    setData("phones", next.length ? next : [""]);
  };
  const formRef = useRef(null);
  const handleConfirm = () => {
    if (selectedExistingUser) {
      setIsLinking(true);
      const linkPayload = {
        user_id: selectedExistingUser.id,
        crm_account_id: data.crm_account_id ?? ((crm_account == null ? void 0 : crm_account.id) ?? null),
        company_id: data.company_id ?? companyId ?? null,
        link_company: data.link_company
      };
      if (redirectTo == null ? void 0 : redirectTo.route) {
        linkPayload.redirect_to = redirectTo.route;
        if (Array.isArray(redirectTo.params)) linkPayload.redirect_params = redirectTo.params;
      }
      router.post(route("users.store"), linkPayload, {
        preserveScroll: true,
        onSuccess: (resp) => {
          reset();
          setSelectedExistingUser(null);
          onClose == null ? void 0 : onClose();
          if (typeof onCreate === "function") onCreate(resp);
        },
        onFinish: () => setIsLinking(false)
      });
      return;
    }
    if (formRef.current && typeof formRef.current.reportValidity === "function") {
      const valid = formRef.current.reportValidity();
      if (!valid) return;
    }
    const payload = { ...data };
    if (redirectTo == null ? void 0 : redirectTo.route) {
      payload.redirect_to = redirectTo.route;
      if (Array.isArray(redirectTo.params)) payload.redirect_params = redirectTo.params;
    }
    router.post(route("users.store"), payload, {
      preserveScroll: true,
      preserveState: true,
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
      title: __("usuario_nuevo"),
      confirmText: processing || isLinking ? __("guardando") : __("guardar"),
      cancelText: __("cancelar"),
      confirmDisabled: processing || isLinking,
      confirmLoading: processing || isLinking,
      children: /* @__PURE__ */ jsxs("form", { ref: formRef, onSubmit: (e) => {
        e.preventDefault();
        handleConfirm();
      }, children: [
        showUserSearch && /* @__PURE__ */ jsxs("div", { className: "mb-4", children: [
          /* @__PURE__ */ jsx("p", { className: "text-warning", children: __("usuario_agregar_autocomplete") }),
          /* @__PURE__ */ jsx(
            UserSearch,
            {
              label: __("usuario_buscar") ?? "Buscar usuario ya registrado",
              searchUrl: route("users.search"),
              value: selectedExistingUser,
              onChange: (user) => setSelectedExistingUser(user ?? null),
              placeholder: __("usuario_buscar") ?? "Buscar usuario...",
              extraParams: { for_crm_link: 1 }
            }
          ),
          /* @__PURE__ */ jsx("hr", {})
        ] }),
        /* @__PURE__ */ jsxs("fieldset", { disabled: !!selectedExistingUser, className: selectedExistingUser ? "opacity-75" : "", children: [
          /* @__PURE__ */ jsx("div", { className: "mb-3", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
            /* @__PURE__ */ jsxs("label", { className: "form-label", children: [
              __("nombre"),
              "*"
            ] }),
            /* @__PURE__ */ jsx(TextInput, { value: data.name, onChange: (e) => setData("name", e.target.value), required: true }),
            /* @__PURE__ */ jsx(InputError, { message: errors.name })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "mb-3", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
            /* @__PURE__ */ jsxs("label", { className: "form-label", children: [
              __("apellidos"),
              "*"
            ] }),
            /* @__PURE__ */ jsx(TextInput, { value: data.surname, onChange: (e) => setData("surname", e.target.value), required: true }),
            /* @__PURE__ */ jsx(InputError, { message: errors.surname })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "mb-3", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
            /* @__PURE__ */ jsx("label", { className: "form-label", children: __("email") }),
            /* @__PURE__ */ jsx(TextInput, { type: "email", value: data.email, onChange: (e) => setData("email", e.target.value) }),
            /* @__PURE__ */ jsx(InputError, { message: errors.email })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "mb-3", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
            /* @__PURE__ */ jsx("label", { className: "form-label", children: __("cargo") }),
            /* @__PURE__ */ jsx(TextInput, { value: data.position, onChange: (e) => setData("position", e.target.value) }),
            /* @__PURE__ */ jsx(InputError, { message: errors.position })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "mb-3", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "department", className: "form-label", children: __("departamento") }),
            /* @__PURE__ */ jsx(TextInput, { type: "text", value: data.department, onChange: (e) => setData("department", e.target.value) }),
            /* @__PURE__ */ jsx(InputError, { message: errors.department })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "mb-3", children: /* @__PURE__ */ jsx("div", { className: "position-relative", children: /* @__PURE__ */ jsxs("div", { className: "row", children: [
            /* @__PURE__ */ jsxs("div", { className: "col-lg-6", children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "contact_type", className: "form-label", children: __("contacto_tipo") }),
              /* @__PURE__ */ jsxs(
                SelectInput,
                {
                  className: "form-select",
                  name: "contact_type",
                  value: data.contact_type,
                  onChange: (e) => setData("contact_type", e.target.value),
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "", children: __("opcion_selec") }, "empty-contact-type"),
                    contact_types.map((option, idx) => {
                      const value = (option == null ? void 0 : option.value) ?? (option == null ? void 0 : option.id) ?? (option == null ? void 0 : option.slug) ?? `contact-type-${idx}`;
                      const label = (option == null ? void 0 : option.label) ?? (option == null ? void 0 : option.name) ?? (option == null ? void 0 : option.title) ?? String(value);
                      return /* @__PURE__ */ jsx("option", { value, children: label }, value);
                    })
                  ]
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.contact_type })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "col-lg-6", children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "contact_subtype", className: "form-label", children: __("contacto_subtipo") }),
              /* @__PURE__ */ jsxs(
                SelectInput,
                {
                  className: "form-select",
                  name: "contact_subtype",
                  value: data.contact_subtype,
                  onChange: (e) => setData("contact_subtype", e.target.value),
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "", children: __("opcion_selec") }, "empty-contact-subtype"),
                    contact_subtypes.map((option, idx) => {
                      const value = (option == null ? void 0 : option.value) ?? (option == null ? void 0 : option.id) ?? (option == null ? void 0 : option.slug) ?? `contact-subtype-${idx}`;
                      const label = (option == null ? void 0 : option.label) ?? (option == null ? void 0 : option.name) ?? (option == null ? void 0 : option.title) ?? String(value);
                      return /* @__PURE__ */ jsx("option", { value, children: label }, value);
                    })
                  ]
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.contact_subtype })
            ] })
          ] }) }) }),
          /* @__PURE__ */ jsx("div", { className: "mb-3", children: /* @__PURE__ */ jsx("div", { className: "position-relative", children: /* @__PURE__ */ jsxs("div", { className: "row", children: [
            /* @__PURE__ */ jsxs("div", { className: "col-lg-6", children: [
              /* @__PURE__ */ jsx(
                FormDatePickerInput,
                {
                  name: "birthday",
                  selected: data.birthday ? new Date(data.birthday) : null,
                  onChange: (name, date) => setData(name, date ? date.toISOString().split("T")[0] : null),
                  dateFormat: "dd/MM/yyyy",
                  label: "fecha_nacimiento",
                  required: false
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.birthday })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "col-lg-6", children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "salutation", className: "form-label", children: __("tratamiento") }),
              /* @__PURE__ */ jsxs(
                SelectInput,
                {
                  className: "form-select",
                  name: "salutation",
                  value: data.salutation,
                  onChange: (e) => setData("salutation", e.target.value),
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "", children: __("opcion_selec") }, "empty-salutation"),
                    salutations.map((option, idx) => {
                      const value = (option == null ? void 0 : option.value) ?? (option == null ? void 0 : option.id) ?? (option == null ? void 0 : option.slug) ?? `salutation-${idx}`;
                      const label = (option == null ? void 0 : option.label) ?? (option == null ? void 0 : option.name) ?? (option == null ? void 0 : option.title) ?? String(value);
                      return /* @__PURE__ */ jsx("option", { value, children: label }, value);
                    })
                  ]
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.salutation })
            ] })
          ] }) }) }),
          /* @__PURE__ */ jsx("div", { className: "mb-3", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
            /* @__PURE__ */ jsx("label", { className: "form-label", children: __("telefonos") }),
            /* @__PURE__ */ jsxs("div", { className: "row", children: [
              /* @__PURE__ */ jsxs("div", { className: "col-md-9", children: [
                (data.phones || []).map((ph, idx) => /* @__PURE__ */ jsxs("div", { className: "input-group mb-3", children: [
                  /* @__PURE__ */ jsx("input", { type: "text", className: "form-control", value: ph, onChange: (e) => handlePhoneChange(idx, e.target.value), maxLength: 14 }),
                  /* @__PURE__ */ jsx("button", { type: "button", className: "btn btn-outline-danger", onClick: () => handleRemovePhone(idx), children: /* @__PURE__ */ jsx("i", { className: "la la-trash" }) })
                ] }, `phone-${idx}`)),
                /* @__PURE__ */ jsx(InputError, { message: errors.phones })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "col-md-3", children: /* @__PURE__ */ jsxs("button", { type: "button", className: "btn btn-sm btn-secondary mt-2", onClick: handleAddPhone, children: [
                /* @__PURE__ */ jsx("i", { className: "la la-plus" }),
                " ",
                __("telefono") || "Añadir teléfono"
              ] }) })
            ] })
          ] }) })
        ] })
      ] })
    }
  );
}
export {
  ModalUserCreate as M
};
