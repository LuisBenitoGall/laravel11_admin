import { jsx, jsxs } from "react/jsx-runtime";
import "react";
import { usePage, useForm, router } from "@inertiajs/react";
import { C as Checkbox } from "./Checkbox-B7oBdKeZ.js";
import "./DatePickerToForm-HPj3On-3.js";
import "./FileInput-U7oe6ye3.js";
import { I as InfoPopover } from "./InfoPopover-CwWEvwXq.js";
import { I as InputError } from "./InputError-DME5vguS.js";
import { P as PrimaryButton } from "./PrimaryButton-B91ets3U.js";
import { T as TextInput } from "./TextInput-CzxrbIpp.js";
import { S as SelectInput } from "./SelectInput-DrqFt-OA.js";
import { u as useSweetAlert } from "./useSweetAlert-D4PAsWYN.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import "react-datepicker";
/* empty css                          */
import "date-fns/locale";
import "react-bootstrap";
import "axios";
import "sweetalert2";
function ProductData({ product, arr_production_status, arr_patterns }) {
  var _a;
  const __ = useTranslation();
  const props = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  props.locale || false;
  props.languages || [];
  useSweetAlert();
  props.permissions || {};
  const { data, setData, put, processing, errors } = useForm({
    name: product.name || "",
    production_status: product.production_status || "",
    status: product.status || true
  });
  console.log(arr_patterns);
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
    router.post(route("products.update", product.id), formData, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => console.log("Producto actualizado"),
      onError: (errors2) => console.error("Errores:", errors2),
      onFinish: () => console.log("Petición finalizada")
    });
  }
  return /* @__PURE__ */ jsx("div", { className: "col-12 gy-2", children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
    /* @__PURE__ */ jsxs("div", { className: "row gy-3 mb-3", children: [
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
            maxLength: 150,
            required: true
          }
        ),
        /* @__PURE__ */ jsx(InputError, { message: errors.name })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "col-md-4", children: /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "production_status", className: "form-label", children: __("producto_tipo") }),
        /* @__PURE__ */ jsxs(
          SelectInput,
          {
            className: "form-select",
            name: "production_status",
            value: data.production_status,
            onChange: (e) => setData("production_status", e.target.value),
            children: [
              /* @__PURE__ */ jsx("option", { value: "", children: __("opcion_selec") }),
              Array.isArray(arr_production_status) && arr_production_status.length > 0 && arr_production_status.map((option) => /* @__PURE__ */ jsx("option", { value: option.value, children: option.label }, option.value)),
              arr_production_status && typeof arr_production_status === "object" && !Array.isArray(arr_production_status) && Object.entries(arr_production_status).map(([value, label]) => /* @__PURE__ */ jsx("option", { value, children: label }, value))
            ]
          }
        ),
        /* @__PURE__ */ jsx(InfoPopover, { code: "" }),
        /* @__PURE__ */ jsx(InputError, { message: errors.production_status })
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
      /* @__PURE__ */ jsx("div", { className: "col-md-4", children: /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "pattern_id", className: "form-label", children: __("ref_automatica") }),
        Array.isArray(arr_patterns) && arr_patterns.length > 0 || arr_patterns && typeof arr_patterns === "object" && !Array.isArray(arr_patterns) && Object.keys(arr_patterns).length > 0 ? /* @__PURE__ */ jsxs(
          SelectInput,
          {
            className: "form-select",
            name: "pattern_id",
            value: data.pattern_id,
            onChange: (e) => setData("pattern_id", e.target.value),
            children: [
              /* @__PURE__ */ jsx("option", { value: "", children: __("opcion_selec") }),
              Array.isArray(arr_patterns) && arr_patterns.length > 0 && arr_patterns.map((option) => /* @__PURE__ */ jsx("option", { value: option.id, children: option.name }, option.id)),
              arr_patterns && typeof arr_patterns === "object" && !Array.isArray(arr_patterns) && Object.entries(arr_patterns).map(([value, label]) => /* @__PURE__ */ jsx("option", { value, children: label }, value))
            ]
          }
        ) : /* @__PURE__ */ jsx("label", { className: "text-warning mt-1", children: __("patrones_no_hay") }),
        /* @__PURE__ */ jsx(InfoPopover, { code: "" }),
        /* @__PURE__ */ jsx(InputError, { message: errors.pattern_id })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "col-md-4", children: /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "", className: "form-label", children: __("ref_manual") }),
        /* @__PURE__ */ jsx(
          TextInput,
          {
            className: "",
            name: "name",
            type: "text",
            placeholder: __("ref_manual"),
            value: data.name,
            onChange: (e) => setData("name", e.target.value),
            maxLength: 150,
            required: true
          }
        ),
        /* @__PURE__ */ jsx(InputError, { message: errors.name })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "col-md-4", children: /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "cost_center", className: "form-label", children: __("centro_coste") }),
        /* @__PURE__ */ jsx(
          TextInput,
          {
            className: "",
            name: "cost_center",
            type: "text",
            placeholder: __("centro_coste"),
            value: data.cost_center,
            onChange: (e) => setData("cost_center", e.target.value),
            maxLength: 150,
            required: true
          }
        ),
        /* @__PURE__ */ jsx(InputError, { message: errors.cost_center })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-4 text-end", children: /* @__PURE__ */ jsx(PrimaryButton, { disabled: processing, className: "btn btn-rdn", children: processing ? __("procesando") + "..." : __("guardar") }) })
  ] }) });
}
export {
  ProductData as default
};
