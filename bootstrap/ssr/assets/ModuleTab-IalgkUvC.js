import { jsxs, jsx } from "react/jsx-runtime";
import "react";
import "@inertiajs/react";
import { C as ColorPicker } from "./ColorPicker-CLEOPZFY.js";
import { C as Checkbox } from "./Checkbox-B7oBdKeZ.js";
import { I as InfoPopover } from "./InfoPopover-CwWEvwXq.js";
import { I as InputError } from "./InputError-DME5vguS.js";
import { P as PrimaryButton } from "./PrimaryButton-B91ets3U.js";
import "./SelectInput-DrqFt-OA.js";
import { T as Textarea } from "./Textarea-nvTyMSx8.js";
import { T as TextInput } from "./TextInput-p9mIVJQL.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import "react-color";
import "react-bootstrap";
import "axios";
import "react-draft-wysiwyg";
import "draft-js";
import "html-to-draftjs";
import "draftjs-to-html";
/* empty css                             */
function ModuleTab({ data, setData, errors, levelsArray, handleSubmit, processing }) {
  const __ = useTranslation();
  return /* @__PURE__ */ jsxs("div", { className: "pb-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "row gy-3", children: [
      /* @__PURE__ */ jsx("div", { className: "col-lg-6", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
        /* @__PURE__ */ jsxs("label", { htmlFor: "name", className: "form-label", children: [
          __("modulo"),
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
            maxLength: 100,
            required: true
          }
        ),
        /* @__PURE__ */ jsx(InfoPopover, { code: "module-name" }),
        /* @__PURE__ */ jsx(InputError, { message: errors.name })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "col-lg-5", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
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
        /* @__PURE__ */ jsx(InfoPopover, { code: "module-label" }),
        /* @__PURE__ */ jsx(InputError, { message: errors.name })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "col-lg-2", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "icon", className: "form-label", children: __("icono") }),
        /* @__PURE__ */ jsx(
          TextInput,
          {
            type: "text",
            placeholder: __("icon"),
            value: data.icon,
            onChange: (e) => setData("icon", e.target.value),
            maxLength: 100
          }
        ),
        /* @__PURE__ */ jsx(InfoPopover, { code: "module-icon" }),
        /* @__PURE__ */ jsx(InputError, { message: errors.icon })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "col-lg-2", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "color", className: "form-label", children: __("color") }),
        /* @__PURE__ */ jsx(
          ColorPicker,
          {
            value: data.color,
            onChange: (e) => setData("color", e.target.value),
            name: "color"
          }
        ),
        /* @__PURE__ */ jsx(InfoPopover, { code: "module-color" }),
        /* @__PURE__ */ jsx(InputError, { message: errors.color })
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
      /* @__PURE__ */ jsx("div", { className: "col-12", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "explanation", className: "form-label", children: __("descripcion") }),
        /* @__PURE__ */ jsx(
          Textarea,
          {
            id: "explanation",
            name: "explanation",
            value: data.explanation ?? "",
            onChange: (e) => {
              console.log("explanation value", e.target.value);
              setData("explanation", e.target.value);
            },
            className: "form-control"
          }
        )
      ] }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-4 text-end", children: /* @__PURE__ */ jsx(PrimaryButton, { disabled: processing, className: "btn btn-rdn", children: processing ? __("procesando") + "..." : __("guardar") }) })
  ] });
}
export {
  ModuleTab as default
};
