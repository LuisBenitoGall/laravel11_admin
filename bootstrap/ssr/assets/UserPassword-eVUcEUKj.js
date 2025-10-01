import { jsx, jsxs } from "react/jsx-runtime";
import "react";
import { useForm, router } from "@inertiajs/react";
import { I as InputError } from "./InputError-DME5vguS.js";
import { P as PrimaryButton } from "./PrimaryButton-B91ets3U.js";
import { T as TextInput } from "./TextInput-p9mIVJQL.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
function UserPassword({ user }) {
  const __ = useTranslation();
  const { data, setData, put, processing, errors } = useForm({
    password: "",
    password_confirmation: ""
  });
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
    router.post(route("users.pwd.update", user.id), formData, {
      forceFormData: true,
      preserveScroll: true,
      //onSuccess: () => console.log('Usuario actualizado'),
      onError: (errors2) => console.error("Errores:", errors2)
      //onFinish: () => console.log('Petición finalizada'),
    });
  }
  return /* @__PURE__ */ jsx("div", { className: "col-12 gy-2", children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
    /* @__PURE__ */ jsxs("div", { className: "row gy-3 mb-3", children: [
      /* @__PURE__ */ jsx("div", { className: "col-md-6", children: /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("label", { htmlFor: "password", className: "form-label", children: [
          __("password"),
          "*"
        ] }),
        /* @__PURE__ */ jsx(
          TextInput,
          {
            className: "",
            name: "password",
            type: "password",
            placeholder: __("password"),
            value: data.password,
            onChange: (e) => setData("password", e.target.value),
            maxLength: 14,
            required: true
          }
        ),
        /* @__PURE__ */ jsx(InputError, { message: errors.password })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "col-md-6", children: /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("label", { htmlFor: "password_confirmation", className: "form-label", children: [
          __("password_confirm"),
          "*"
        ] }),
        /* @__PURE__ */ jsx(
          TextInput,
          {
            className: "",
            name: "password_confirmation",
            type: "password",
            placeholder: __("password_repite"),
            value: data.password_confirmation,
            onChange: (e) => setData("password_confirmation", e.target.value),
            maxLength: 14,
            required: true
          }
        ),
        /* @__PURE__ */ jsx(InputError, { message: errors.password_confirmation })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-4 text-end", children: /* @__PURE__ */ jsx(PrimaryButton, { disabled: processing, className: "btn btn-rdn", children: processing ? __("procesando") + "..." : __("guardar") }) })
  ] }) });
}
export {
  UserPassword as default
};
