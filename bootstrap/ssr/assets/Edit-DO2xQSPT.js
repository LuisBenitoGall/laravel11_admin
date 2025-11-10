import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-DT2NIV1N.js";
import { usePage, useForm, Head, router } from "@inertiajs/react";
import "@inertiajs/inertia";
import "react-tooltip";
import "react";
import { I as InputError } from "./InputError-DME5vguS.js";
import { P as PrimaryButton } from "./PrimaryButton-B91ets3U.js";
import { T as TextInput } from "./TextInput-CzxrbIpp.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import "axios";
import "./Header-kwxCeG5H.js";
import "react-bootstrap";
import "./useSweetAlert-D4PAsWYN.js";
import "sweetalert2";
import "./Sidebar-BV0-sS1Z.js";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
function Index({ auth, session, title, subtitle, availableLocales, functionality, module_name }) {
  var _a;
  const __ = useTranslation();
  const props = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  props.locale || false;
  props.languages || [];
  const permissions = props.permissions || {};
  const { data, setData, errors, processing } = useForm({
    label: functionality.label || ""
  });
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
    router.post(route("functionalities.update", functionality.id), formData, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => console.log("Funcionalidad actualizada"),
      onError: (errors2) => console.error("Errores:", errors2),
      onFinish: () => console.log("Petición finalizada")
    });
  }
  const actions = [];
  if (permissions == null ? void 0 : permissions["modules.edit"]) {
    actions.push({
      text: `${__("modulo_volver")} ${module_name}`,
      icon: "la-angle-left",
      url: "modules.edit",
      params: [functionality.module_id, "functionalities"],
      modal: false
    });
  }
  if (permissions == null ? void 0 : permissions["modules.edit"]) {
    actions.push({
      text: __("eliminar"),
      icon: "la-trash",
      method: "delete",
      url: "functionalities.destroy",
      params: [functionality.id],
      title: __("funcionalidad_eliminar"),
      message: __("funcionalidad_eliminar_confirm"),
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
              __("funcionalidad"),
              " ",
              /* @__PURE__ */ jsx("u", { children: functionality.name })
            ] }) }),
            /* @__PURE__ */ jsxs("div", { className: "col-12 mt-2 mb-4", children: [
              /* @__PURE__ */ jsxs("span", { className: "text-muted me-5", children: [
                __("creado"),
                ": ",
                /* @__PURE__ */ jsx("strong", { children: functionality.formatted_created_at })
              ] }),
              functionality.created_by_name && /* @__PURE__ */ jsxs("span", { className: "text-muted me-5", children: [
                __("creado_por"),
                ": ",
                /* @__PURE__ */ jsx("strong", { children: functionality.created_by_name })
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "text-muted me-5", children: [
                __("actualizado"),
                ": ",
                /* @__PURE__ */ jsx("strong", { children: functionality.formatted_updated_at })
              ] }),
              functionality.updated_by_name && /* @__PURE__ */ jsxs("span", { className: "text-muted me-5", children: [
                __("actualizado_por"),
                ": ",
                /* @__PURE__ */ jsx("strong", { children: functionality.updated_by_name })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
            /* @__PURE__ */ jsx("div", { className: "row gy-3", children: /* @__PURE__ */ jsx("div", { className: "col-lg-6", children: /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("label", { htmlFor: "label", className: "form-label", children: [
                __("etiqueta"),
                "*"
              ] }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  className: "",
                  type: "text",
                  placeholder: __("etiqueta"),
                  value: data.label,
                  onChange: (e) => setData("label", e.target.value),
                  maxLength: 100,
                  required: true
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.label })
            ] }) }) }),
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
