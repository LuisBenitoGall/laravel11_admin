import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-Be6zbhrA.js";
import { usePage, useForm, Head, router } from "@inertiajs/react";
import { useState } from "react";
import { C as Checkbox } from "./Checkbox-B7oBdKeZ.js";
import { I as InfoPopover } from "./InfoPopover-CwWEvwXq.js";
import { I as InputError } from "./InputError-DME5vguS.js";
import { P as PrimaryButton } from "./PrimaryButton-B91ets3U.js";
import "react-draft-wysiwyg";
import "draft-js";
import "html-to-draftjs";
import "draftjs-to-html";
/* empty css                             */
import { T as TextInput } from "./TextInput-CzxrbIpp.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import "axios";
import "@inertiajs/inertia";
import "./Header-DmTv-HRw.js";
import "react-bootstrap";
import "./useSweetAlert-D4PAsWYN.js";
import "sweetalert2";
import "./Sidebar-j3CEPiJG.js";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
function Index({ auth, session, title, subtitle, availableLocales, currency }) {
  var _a;
  const __ = useTranslation();
  const props = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  props.locale || false;
  props.languages || [];
  const permissions = props.permissions || {};
  const { data, setData, errors, processing, post } = useForm({
    name: currency.name || "",
    status: currency.status,
    code: currency.code || "",
    number: currency.number || "",
    symbol: currency.symbol || ""
  });
  const [localErrors, setLocalErrors] = useState({});
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
    router.post(route("currencies.update", currency.id), formData, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => console.log("Moneda actualizada"),
      onError: (errors2) => setLocalErrors(errors2),
      onFinish: () => console.log("Petición finalizada")
    });
  }
  const actions = [];
  if (permissions == null ? void 0 : permissions["currencies.index"]) {
    actions.push({
      text: __("monedas_volver"),
      icon: "la-angle-left",
      url: "currencies.index",
      modal: false
    });
  }
  if (permissions == null ? void 0 : permissions["currencies.create"]) {
    actions.push({
      text: __("moneda_nueva"),
      icon: "la-plus",
      url: "currencies.create",
      modal: false
    });
  }
  if (permissions == null ? void 0 : permissions["currencies.destroy"]) {
    actions.push({
      text: __("eliminar"),
      icon: "la-trash",
      method: "delete",
      url: "currencies.destroy",
      params: [currency.id],
      title: __("moneda_eliminar"),
      message: __("moneda_eliminar_confirm"),
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
              __("moneda"),
              " ",
              /* @__PURE__ */ jsx("u", { children: currency.name })
            ] }) }),
            /* @__PURE__ */ jsxs("div", { className: "col-12 mt-2 mb-4", children: [
              /* @__PURE__ */ jsxs("span", { className: "text-muted me-5", children: [
                __("creado"),
                ": ",
                /* @__PURE__ */ jsx("strong", { children: currency.formatted_created_at })
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "text-muted me-5", children: [
                __("actualizado"),
                ": ",
                /* @__PURE__ */ jsx("strong", { children: currency.formatted_updated_at })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
            /* @__PURE__ */ jsxs("div", { className: "row gy-3 mb-3", children: [
              /* @__PURE__ */ jsx("div", { className: "col-lg-6", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
                /* @__PURE__ */ jsxs("label", { htmlFor: "name", className: "form-label", children: [
                  __("moneda"),
                  "*"
                ] }),
                /* @__PURE__ */ jsx(
                  TextInput,
                  {
                    type: "text",
                    name: "name",
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
              ] }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "row gy-3", children: [
              /* @__PURE__ */ jsx("div", { className: "col-lg-2", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "code", className: "form-label", children: __("codigo") }),
                /* @__PURE__ */ jsx(
                  TextInput,
                  {
                    className: "",
                    type: "text",
                    name: "code",
                    placeholder: __("codigo"),
                    value: data.code,
                    onChange: (e) => setData("code", e.target.value),
                    maxLength: 3
                  }
                ),
                /* @__PURE__ */ jsx(InfoPopover, { code: "currency-code" }),
                /* @__PURE__ */ jsx(InputError, { message: localErrors.code })
              ] }) }),
              /* @__PURE__ */ jsx("div", { className: "col-lg-2", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
                /* @__PURE__ */ jsxs("label", { htmlFor: "number", className: "form-label", children: [
                  __("numero"),
                  " ISO"
                ] }),
                /* @__PURE__ */ jsx(
                  TextInput,
                  {
                    className: "",
                    type: "text",
                    name: "number",
                    placeholder: __("numero"),
                    value: data.number,
                    onChange: (e) => setData("number", e.target.value),
                    maxLength: 4
                  }
                ),
                /* @__PURE__ */ jsx(InfoPopover, { code: "currency-number" }),
                /* @__PURE__ */ jsx(InputError, { message: localErrors.number })
              ] }) }),
              /* @__PURE__ */ jsx("div", { className: "col-lg-2", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "symbol", className: "form-label", children: __("simbolo") }),
                /* @__PURE__ */ jsx(
                  TextInput,
                  {
                    className: "",
                    type: "text",
                    name: "symbol",
                    placeholder: __("simbolo"),
                    value: data.symbol,
                    onChange: (e) => setData("symbol", e.target.value),
                    maxLength: 2
                  }
                ),
                /* @__PURE__ */ jsx(InfoPopover, { code: "currency-symbol" }),
                /* @__PURE__ */ jsx(InputError, { message: localErrors.symbol })
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
