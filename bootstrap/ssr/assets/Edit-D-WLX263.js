import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-DxQfZ-Jg.js";
import { usePage, useForm, Head, router } from "@inertiajs/react";
import "@inertiajs/inertia";
import "react-tooltip";
import "react";
import { C as Checkbox } from "./Checkbox-B7oBdKeZ.js";
import { I as InputError } from "./InputError-DME5vguS.js";
import { P as PrimaryButton } from "./PrimaryButton-B91ets3U.js";
import { T as TextInput } from "./TextInput-p9mIVJQL.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import { u as useHandleDelete } from "./useHandleDelete-B2XtFf-J.js";
import "axios";
import "./Header-BI4rRLdV.js";
import "react-bootstrap";
import "./useSweetAlert-D4PAsWYN.js";
import "sweetalert2";
import "./Sidebar-CtyD8dde.js";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
function Index({ auth, session, title, subtitle, unit, availableLocales }) {
  var _a;
  const __ = useTranslation();
  const props = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  props.locale || false;
  props.languages || [];
  const permissions = props.permissions || {};
  const { data, setData, post, reset, errors, processing } = useForm({
    name: unit.name || "",
    symbol: unit.symbol || "",
    status: unit.status
  });
  useHandleDelete("unidad", "units.destroy", [unit.id]);
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
    router.put(route("units.update", unit.id), formData, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => console.log("Unidad actualizada"),
      onError: (errors2) => console.error("Errores:", errors2),
      onFinish: () => console.log("Petición finalizada")
    });
  }
  const actions = [];
  if (permissions == null ? void 0 : permissions["units.index"]) {
    actions.push({
      text: __("unidades_volver"),
      icon: "la-angle-left",
      url: "units.index",
      modal: false
    });
  }
  if (permissions == null ? void 0 : permissions["units.create"]) {
    actions.push({
      text: __("unidad_nueva"),
      icon: "la-plus",
      url: "units.create",
      modal: false
    });
  }
  if (permissions == null ? void 0 : permissions["units.destroy"]) {
    actions.push({
      text: __("eliminar"),
      icon: "la-trash",
      method: "delete",
      url: "units.destroy",
      params: [unit.id],
      title: __("unidad_eliminar"),
      message: __("unidad_eliminar_confirm"),
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
              __("unidad"),
              " ",
              /* @__PURE__ */ jsx("u", { children: unit.name })
            ] }) }),
            /* @__PURE__ */ jsxs("div", { className: "col-12 mt-2 mb-4", children: [
              /* @__PURE__ */ jsxs("span", { className: "text-muted me-5", children: [
                __("creado"),
                ": ",
                /* @__PURE__ */ jsx("strong", { children: unit.formatted_created_at })
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "text-muted", children: [
                __("actualizado"),
                ": ",
                /* @__PURE__ */ jsx("strong", { children: unit.formatted_updated_at })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
            /* @__PURE__ */ jsxs("div", { className: "row gy-3 mb-3", children: [
              /* @__PURE__ */ jsx("div", { className: "col-lg-5", children: /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("label", { htmlFor: "name", className: "form-label", children: [
                  __("unidad"),
                  "*"
                ] }),
                /* @__PURE__ */ jsx(
                  TextInput,
                  {
                    className: "",
                    type: "text",
                    placeholder: __("nombre"),
                    value: data.name,
                    onChange: (e) => setData("name", e.target.value),
                    maxLength: 50,
                    required: true
                  }
                ),
                /* @__PURE__ */ jsx(InputError, { message: errors.name })
              ] }) }),
              /* @__PURE__ */ jsx("div", { className: "col-lg-2", children: /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "symbol", className: "form-label", children: __("simbolo") }),
                /* @__PURE__ */ jsx(
                  TextInput,
                  {
                    className: "",
                    type: "text",
                    placeholder: __("simbolo"),
                    value: data.symbol,
                    onChange: (e) => setData("symbol", e.target.value),
                    maxLength: 4
                  }
                ),
                /* @__PURE__ */ jsx(InputError, { message: errors.symbol })
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
