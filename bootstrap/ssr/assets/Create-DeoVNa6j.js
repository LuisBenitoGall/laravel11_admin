import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-D8RSvDxD.js";
import { usePage, useForm, Head } from "@inertiajs/react";
import "react-tooltip";
import "react";
import { C as Checkbox } from "./Checkbox-B7oBdKeZ.js";
import "./FileInput-U7oe6ye3.js";
import { I as InputError } from "./InputError-DME5vguS.js";
import { P as PrimaryButton } from "./PrimaryButton-B91ets3U.js";
import { T as TextInput } from "./TextInput-p9mIVJQL.js";
import { R as RadioButton } from "./RadioButton-BQ8Yvx79.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import "axios";
import "@inertiajs/inertia";
import "./Header-BDD-uIND.js";
import "react-bootstrap";
import "./useSweetAlert-D4PAsWYN.js";
import "sweetalert2";
import "./Sidebar-BgmCyghN.js";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
function Create({ auth, session, title, subtitle, availableLocales }) {
  var _a;
  const __ = useTranslation();
  const props = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  props.locale || false;
  props.languages || [];
  const permissions = props.permissions || {};
  const { data, setData, post, reset, errors, processing } = useForm({
    name: "",
    type: "",
    // 'product' o 'service', sin selección por defecto
    is_sale: false,
    status: true
  });
  const typeOptions = [
    { value: "p", label: __("producto") },
    { value: "s", label: __("servicio") }
  ];
  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    if (type === "checkbox") {
      setData(name, checked);
    } else {
      setData(name, value);
    }
  };
  function handleSubmit(e) {
    e.preventDefault();
    post(route("products.store"), {
      onSuccess: () => reset()
    });
  }
  const actions = [];
  if (permissions == null ? void 0 : permissions["products.index"]) {
    actions.push({
      text: __("productos_volver"),
      icon: "la-angle-left",
      url: "products.index",
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
              __("producto_nombre"),
              "*"
            ] }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                className: "",
                type: "text",
                placeholder: __("producto_nombre"),
                value: data.name,
                onChange: (e) => setData("name", e.target.value),
                maxLength: 150,
                required: true
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.name })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "col-lg-2 text-center", children: /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "status", className: "form-label", children: __("estado") }),
            /* @__PURE__ */ jsx("div", { className: "pt-1 position-relative", children: /* @__PURE__ */ jsx(
              Checkbox,
              {
                className: "xl",
                name: "status",
                checked: data.status,
                onChange: handleChange
              }
            ) })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "col-lg-3 text-center", children: /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "is_sale", className: "form-label", children: __("producto_venta") }),
            /* @__PURE__ */ jsx("div", { className: "pt-1 position-relative", children: /* @__PURE__ */ jsx(
              Checkbox,
              {
                className: "xl",
                name: "is_sale",
                checked: data.is_sale,
                onChange: handleChange
              }
            ) })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "col-lg-4", children: /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("label", { htmlFor: "type", className: "form-label", children: [
              __("tipo"),
              "*"
            ] }),
            /* @__PURE__ */ jsx(
              RadioButton,
              {
                name: "type",
                value: data.type,
                onChange: (e) => setData("type", e.target.value),
                options: typeOptions,
                required: true
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.type })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "mt-4 text-end", children: /* @__PURE__ */ jsx(PrimaryButton, { disabled: processing, className: "btn btn-rdn", children: processing ? __("procesando") + "..." : __("guardar") }) })
        ] }) }) })
      ]
    }
  );
}
export {
  Create as default
};
