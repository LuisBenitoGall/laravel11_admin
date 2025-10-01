import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-DxQfZ-Jg.js";
import { usePage, useForm, Head, router } from "@inertiajs/react";
import "@inertiajs/inertia";
import "react-tooltip";
import { useState } from "react";
import { C as Checkbox } from "./Checkbox-B7oBdKeZ.js";
import { I as InputError } from "./InputError-DME5vguS.js";
import { P as PrimaryButton } from "./PrimaryButton-B91ets3U.js";
import { T as Textarea } from "./Textarea-nvTyMSx8.js";
import { T as TextInput } from "./TextInput-p9mIVJQL.js";
import { u as useSweetAlert } from "./useSweetAlert-D4PAsWYN.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import { u as useHandleDelete } from "./useHandleDelete-B2XtFf-J.js";
import "axios";
import "./Header-BI4rRLdV.js";
import "react-bootstrap";
import "./Sidebar-CtyD8dde.js";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
import "react-draft-wysiwyg";
import "draft-js";
import "html-to-draftjs";
import "draftjs-to-html";
/* empty css                             */
import "sweetalert2";
function Index({ auth, session, title, subtitle, account, currency, availableLocales }) {
  var _a;
  const __ = useTranslation();
  const props = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  props.locale || false;
  props.languages || [];
  useSweetAlert();
  const permissions = props.permissions || {};
  const { data, setData, errors, processing } = useForm({
    name: account.name || "",
    rate: account.rate || "",
    duration: account.duration || "",
    description: account.description || "",
    status: account.status
  });
  const [localErrors, setLocalErrors] = useState({});
  useHandleDelete("cuenta", "accounts.delete", [account.id]);
  function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append("_method", "PUT");
    Object.entries(data).forEach(([key, value]) => {
      if (key === "logo" && value instanceof File) {
        formData.append(key, value);
      } else if (typeof value === "object" && value !== null) {
        formData.append(key, JSON.stringify(value));
      } else if (value !== null && value !== void 0) {
        formData.append(key, value);
      }
    });
    router.post(route("accounts.update", account.id), formData, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => console.log("Cuenta actualizada"),
      onError: (errors2) => setLocalErrors(errors2),
      onFinish: () => console.log("Petición finalizada")
    });
  }
  const actions = [];
  if (permissions == null ? void 0 : permissions["accounts.index"]) {
    actions.push({
      text: __("cuentas_volver"),
      icon: "la-angle-left",
      url: "accounts.index",
      modal: false
    });
  }
  if (permissions == null ? void 0 : permissions["accounts.create"]) {
    actions.push({
      text: __("cuenta_nueva"),
      icon: "la-plus",
      url: "accounts.create",
      modal: false
    });
  }
  if (permissions == null ? void 0 : permissions["accounts.destroy"]) {
    actions.push({
      text: __("eliminar"),
      icon: "la-trash",
      method: "delete",
      url: "accounts.destroy",
      params: [account.id],
      title: __("cuenta_eliminar"),
      message: __("cuenta_eliminar_confirm"),
      modal: false
    });
  }
  return /* @__PURE__ */ jsxs(
    AdminAuthenticated,
    {
      user: auth.user,
      title,
      subtitle,
      actions,
      children: [
        /* @__PURE__ */ jsx(Head, { title }),
        /* @__PURE__ */ jsxs("div", { className: "contents pb-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "row", children: [
            /* @__PURE__ */ jsx("div", { className: "col-12", children: /* @__PURE__ */ jsxs("h2", { children: [
              __("cuenta"),
              " ",
              /* @__PURE__ */ jsx("u", { children: account.name })
            ] }) }),
            /* @__PURE__ */ jsxs("div", { className: "col-12 mt-2 mb-4", children: [
              /* @__PURE__ */ jsxs("span", { className: "text-muted me-5", children: [
                __("creado"),
                ": ",
                /* @__PURE__ */ jsx("strong", { children: account.formatted_created_at })
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "text-muted", children: [
                __("actualizado"),
                ": ",
                /* @__PURE__ */ jsx("strong", { children: account.formatted_updated_at })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
            /* @__PURE__ */ jsxs("div", { className: "row gy-3", children: [
              /* @__PURE__ */ jsx("div", { className: "col-lg-6", children: /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("label", { htmlFor: "name", className: "form-label", children: [
                  __("cuenta"),
                  "*"
                ] }),
                /* @__PURE__ */ jsx(
                  TextInput,
                  {
                    className: "",
                    type: "text",
                    name: "name",
                    placeholder: __("nombre"),
                    value: data.name,
                    onChange: (e) => setData("name", e.target.value),
                    maxLength: 100,
                    required: true
                  }
                ),
                /* @__PURE__ */ jsx(InputError, { message: localErrors.name })
              ] }) }),
              /* @__PURE__ */ jsx("div", { className: "col-lg-1 text-center", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "status", className: "form-label", children: __("estado") }),
                /* @__PURE__ */ jsx("div", { className: "pt-1 position-relative", children: /* @__PURE__ */ jsx(
                  Checkbox,
                  {
                    className: "xl",
                    name: "status",
                    checked: data.status,
                    onChange: (e) => setData("status", e.target.checked)
                  }
                ) })
              ] }) }),
              /* @__PURE__ */ jsx("div", { className: "col-lg-3", children: /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "rate", className: "form-label", children: __("precio") }),
                /* @__PURE__ */ jsx(
                  TextInput,
                  {
                    className: "text-end",
                    type: "text",
                    name: "rate",
                    placeholder: "",
                    value: data.rate,
                    onChange: (e) => setData("rate", e.target.value),
                    maxLength: 7,
                    addon: currency
                  }
                ),
                /* @__PURE__ */ jsx(InputError, { message: localErrors.rate })
              ] }) }),
              /* @__PURE__ */ jsx("div", { className: "col-lg-3", children: /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("label", { htmlFor: "duration", className: "form-label", children: [
                  __("duracion"),
                  " ",
                  /* @__PURE__ */ jsxs("small", { className: "text-warning", children: [
                    "(",
                    __("dias"),
                    ")"
                  ] })
                ] }),
                /* @__PURE__ */ jsx(
                  TextInput,
                  {
                    className: "text-end",
                    type: "text",
                    name: "duration",
                    placeholder: "",
                    value: data.duration,
                    onChange: (e) => setData("duration", e.target.value),
                    maxLength: 7
                  }
                ),
                /* @__PURE__ */ jsx(InputError, { message: localErrors.duration })
              ] }) }),
              /* @__PURE__ */ jsx("div", { className: "col-12", children: /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "description", className: "form-label", children: __("descripcion") }),
                /* @__PURE__ */ jsx(
                  Textarea,
                  {
                    value: data.description,
                    name: "description",
                    onChange: (e) => setData("description", e.target.value),
                    rows: 4
                  }
                )
              ] }) })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "mt-4 text-end", children: /* @__PURE__ */ jsx(PrimaryButton, { disabled: processing, className: "btn btn-rdn", children: processing ? __("procesando") + "..." : __("guardar") }) })
          ] })
        ] })
      ]
    }
  );
}
export {
  Index as default
};
