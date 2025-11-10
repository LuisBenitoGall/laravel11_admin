import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-DT2NIV1N.js";
import { usePage, useForm, Head } from "@inertiajs/react";
import "react-tooltip";
import "react";
import { C as Checkbox } from "./Checkbox-B7oBdKeZ.js";
import { F as FileInput } from "./FileInput-U7oe6ye3.js";
import { I as InfoPopover } from "./InfoPopover-CwWEvwXq.js";
import { I as InputError } from "./InputError-DME5vguS.js";
import { P as PrimaryButton } from "./PrimaryButton-B91ets3U.js";
import { T as TextInput } from "./TextInput-CzxrbIpp.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import "axios";
import "@inertiajs/inertia";
import "./Header-kwxCeG5H.js";
import "react-bootstrap";
import "./useSweetAlert-D4PAsWYN.js";
import "sweetalert2";
import "./Sidebar-BV0-sS1Z.js";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
function Index({ auth, session, title, subtitle, availableLocales }) {
  var _a;
  const __ = useTranslation();
  const props = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  props.locale || false;
  props.languages || [];
  const permissions = props.permissions || {};
  const { data, setData, post, reset, errors, processing } = useForm({
    name: "",
    tradename: "",
    nif: "",
    auto_link: false
  });
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
  function handleSubmit(e) {
    e.preventDefault();
    post(route("crm-accounts.store"), {
      onSuccess: () => reset()
    });
  }
  const actions = [];
  if (permissions == null ? void 0 : permissions["crm-accounts.index"]) {
    actions.push({
      text: __("cuentas_volver"),
      icon: "la-angle-left",
      url: "crm-accounts.index",
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
        /* @__PURE__ */ jsx("div", { className: "contents pb-4", children: /* @__PURE__ */ jsx("form", { onSubmit: handleSubmit, children: /* @__PURE__ */ jsxs("div", { className: "row gy-3", children: [
          /* @__PURE__ */ jsx("div", { className: "col-lg-6", children: /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("label", { htmlFor: "name", className: "form-label", children: [
              __("razon_social"),
              "*"
            ] }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                className: "",
                type: "text",
                placeholder: __("empresa_nombre"),
                value: data.name,
                onChange: (e) => setData("name", e.target.value),
                maxLength: 100
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.name })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "col-lg-6", children: /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("label", { htmlFor: "tradename", className: "form-label", children: [
              __("nombre_comercial"),
              "*"
            ] }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                className: "",
                type: "text",
                placeholder: __("nombre_comercial"),
                value: data.tradename,
                onChange: (e) => setData("tradename", e.target.value),
                maxLength: 100
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.tradename })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "col-lg-3", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
            /* @__PURE__ */ jsxs("label", { htmlFor: "nif", className: "form-label", children: [
              __("nif"),
              "*"
            ] }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                className: "",
                type: "text",
                placeholder: __("nif"),
                value: data.nif,
                onChange: (e) => setData("nif", e.target.value),
                maxLength: 15
              }
            ),
            /* @__PURE__ */ jsx(InfoPopover, { code: "company-nif" }),
            /* @__PURE__ */ jsx(InputError, { message: errors.nif })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "col-lg-1 text-center", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "is_ute", className: "form-label", children: __("ute") }),
            /* @__PURE__ */ jsxs("div", { className: "pt-1 position-relative", children: [
              /* @__PURE__ */ jsx(
                Checkbox,
                {
                  className: "xl",
                  name: "is_ute",
                  checked: data.is_ute,
                  onChange: (e) => setData("is_ute", e.target.checked)
                }
              ),
              /* @__PURE__ */ jsx(InfoPopover, { code: "company-ute", style: { left: "calc(50% + 13px)", top: "8px" } })
            ] })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "col-lg-2 text-center", children: /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "auto_link", className: "form-label", children: __("vincularse") }),
            /* @__PURE__ */ jsx("div", { className: "pt-1 position-relative", children: /* @__PURE__ */ jsx(
              Checkbox,
              {
                className: "xl",
                name: "auto_link",
                checked: data.auto_link,
                onChange: (e) => setData("auto_link", e.target.checked)
              }
            ) }),
            /* @__PURE__ */ jsx(InfoPopover, { code: "company-auto-link", style: { left: "calc(50% + 13px)", top: "8px" } })
          ] }) }),
          /* @__PURE__ */ jsxs("div", { className: "col-lg-6", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "logo", className: "form-label", children: __("logo") }),
              /* @__PURE__ */ jsx(
                FileInput,
                {
                  name: "logo",
                  accept: "image/*",
                  onChange: handleChange,
                  error: errors.logo
                }
              )
            ] }),
            /* @__PURE__ */ jsxs("p", { className: "pt-1 text-warning small", children: [
              /* @__PURE__ */ jsx("span", { className: "me-5", children: __("imagen_formato") }),
              /* @__PURE__ */ jsxs("span", { className: "me-5", children: [
                __("imagen_peso_max"),
                ": 1MB"
              ] }),
              __("imagen_medidas_recomendadas"),
              ": 400x400px"
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mt-4 text-end", children: /* @__PURE__ */ jsx(PrimaryButton, { disabled: processing, className: "btn btn-rdn", children: processing ? __("procesando") + "..." : __("guardar") }) })
        ] }) }) })
      ]
    }
  );
}
export {
  Index as default
};
