import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-Be6zbhrA.js";
import { useForm, usePage, Head } from "@inertiajs/react";
import "react";
import { C as Checkbox } from "./Checkbox-B7oBdKeZ.js";
import { I as InputError } from "./InputError-DME5vguS.js";
import { T as TextInput } from "./TextInput-CzxrbIpp.js";
import { P as PrimaryButton } from "./PrimaryButton-B91ets3U.js";
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
function PatternForm({ action, initial = {} }) {
  const __ = useTranslation();
  const { data, setData, post, processing, errors } = useForm({
    name: initial.name || "",
    ndigits: initial.ndigits || 1,
    status: initial.status ?? true,
    yearly_reset: initial.yearly_reset ?? false,
    segments: initial.segments || [{ type: "digits" }]
  });
  const hasDigits = data.segments.some((s) => s.type === "digits");
  const addSegment = () => {
    setData("segments", [...data.segments, { type: hasDigits ? "text" : "digits", value: "" }]);
  };
  const removeSegment = (idx) => {
    const arr = data.segments.filter((_, i) => i !== idx);
    setData("segments", arr);
  };
  const updateSegment = (idx, patch) => {
    if (patch.type === "digits" && hasDigits && data.segments[idx].type !== "digits") return;
    const arr = data.segments.map((s, i) => i === idx ? { ...s, ...patch } : s);
    setData("segments", arr);
  };
  const onSubmit = (e) => {
    e.preventDefault();
    if (!data.segments.some((s) => s.type === "digits")) return;
    post(action);
  };
  const preview = () => {
    const y = /* @__PURE__ */ new Date();
    const YY = y.getFullYear().toString().slice(-2);
    const YYYY = y.getFullYear().toString();
    const num = String(1).padStart(data.ndigits || 1, "0");
    return (data.segments || []).map((seg) => {
      if (seg.type === "digits") return num;
      if (seg.type === "text") return seg.value || "";
      if (seg.type === "year") return (seg.value || "YYYY") === "YY" ? YY : YYYY;
      return "";
    }).join("");
  };
  return /* @__PURE__ */ jsxs("form", { onSubmit, autoComplete: "off", children: [
    /* @__PURE__ */ jsxs("div", { className: "row gy-3 mb-4", children: [
      /* @__PURE__ */ jsx("div", { className: "col-6", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
        /* @__PURE__ */ jsxs("label", { htmlFor: "name", className: "form-label", children: [
          __("patron_nombre"),
          " *"
        ] }),
        /* @__PURE__ */ jsx(
          TextInput,
          {
            type: "text",
            name: "name",
            value: data.name,
            onChange: (e) => setData("name", e.target.value),
            maxLength: 150,
            required: true
          }
        ),
        /* @__PURE__ */ jsx(InputError, { message: errors.name })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "col-2", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
        /* @__PURE__ */ jsxs("label", { htmlFor: "ndigits", className: "form-label", children: [
          __("digitos_num"),
          "*"
        ] }),
        /* @__PURE__ */ jsx(
          TextInput,
          {
            type: "number",
            name: "ndigits",
            value: data.ndigits,
            onChange: (e) => setData("ndigits", e.target.value),
            maxLength: 150,
            required: true
          }
        ),
        /* @__PURE__ */ jsx(InputError, { message: errors.ndigits })
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
      initial.yearly_reset === true && /* @__PURE__ */ jsx("div", { className: "col-lg-2 text-center", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "yearly_reset", className: "form-label", children: __("reset_anual") }),
        /* @__PURE__ */ jsx("div", { className: "pt-1 position-relative", children: /* @__PURE__ */ jsx(
          Checkbox,
          {
            className: "xl",
            name: "yearly_reset",
            checked: data.yearly_reset,
            onChange: (e) => setData("yearly_reset", e.target.checked)
          }
        ) })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "row gy-3 mb-4", children: [
      /* @__PURE__ */ jsx("label", { className: "col-lg-2 col-form-label", children: __("segmento_add") }),
      /* @__PURE__ */ jsx("div", { className: "col-lg-1 pt-1", children: /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: "btn btn-warning btn-circle text-white",
          onClick: addSegment,
          disabled: hasDigits && data.segments.filter((s) => s.type === "digits").length > 0,
          children: /* @__PURE__ */ jsx("i", { className: "la la-plus" })
        }
      ) }),
      /* @__PURE__ */ jsx("label", { className: "col-lg-8 col-form-label text-warning", children: /* @__PURE__ */ jsx("span", { dangerouslySetInnerHTML: { __html: __("segmento_add_info") } }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "gy-3 mb-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "row", children: [
        /* @__PURE__ */ jsx("label", { className: "col-lg-2 col-form-label", children: __("segmentos") }),
        /* @__PURE__ */ jsxs("div", { className: "col-md-8", children: [
          errors.segments && /* @__PURE__ */ jsx("div", { className: "text-danger mb-2", children: errors.segments }),
          !data.segments.some((s) => s.type === "digits") && /* @__PURE__ */ jsx("div", { className: "pb-1", children: /* @__PURE__ */ jsx("small", { className: "text-danger", children: __("patron_digitos_aviso") }) }),
          data.segments.map((seg, idx) => /* @__PURE__ */ jsxs("div", { className: "row g-2 align-items-start mb-2", children: [
            /* @__PURE__ */ jsx("div", { className: "col-6", children: /* @__PURE__ */ jsxs(
              "select",
              {
                className: "form-select",
                value: seg.type,
                onChange: (e) => updateSegment(idx, { type: e.target.value, value: void 0 }),
                children: [
                  /* @__PURE__ */ jsx("option", { value: "digits", children: "Dígitos" }),
                  /* @__PURE__ */ jsx("option", { value: "text", children: "Texto" }),
                  /* @__PURE__ */ jsx("option", { value: "year", children: "Año" })
                ]
              }
            ) }),
            /* @__PURE__ */ jsxs("div", { className: "col-5", children: [
              seg.type === "text" && /* @__PURE__ */ jsx(
                "input",
                {
                  className: "form-control",
                  value: seg.value || "",
                  onChange: (e) => updateSegment(idx, { value: e.target.value })
                }
              ),
              seg.type === "year" && /* @__PURE__ */ jsxs(
                "select",
                {
                  className: "form-select",
                  value: seg.value || "YYYY",
                  onChange: (e) => updateSegment(idx, { value: e.target.value }),
                  children: [
                    /* @__PURE__ */ jsx("option", { value: "YYYY", children: "YYYY" }),
                    /* @__PURE__ */ jsx("option", { value: "YY", children: "YY" })
                  ]
                }
              ),
              seg.type === "digits" && /* @__PURE__ */ jsx("input", { className: "form-control", value: "#".repeat(Math.min(10, data.ndigits)), disabled: true })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "col-1 d-flex justify-content-start pt-1", children: idx > 0 && /* @__PURE__ */ jsx("button", { type: "button", className: "btn btn-danger btn-sm", onClick: () => removeSegment(idx), title: __("segmento_eliminar"), children: /* @__PURE__ */ jsx("i", { className: "la la-times" }) }) })
          ] }, idx))
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "row mt-4", children: [
        /* @__PURE__ */ jsx("label", { className: "col-lg-2 col-form-label", children: __("vista_previa") }),
        /* @__PURE__ */ jsx("div", { className: "col-md-5 text-center", children: /* @__PURE__ */ jsx("code", { className: "pattern-code", children: preview() }) })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-4 text-end", children: /* @__PURE__ */ jsx(
        PrimaryButton,
        {
          disabled: processing || !data.segments.some((s) => s.type === "digits"),
          className: "btn btn-rdn",
          children: processing ? __("procesando") + "..." : __("guardar")
        }
      ) })
    ] })
  ] });
}
function Create({ auth, session, title, subtitle, availableLocales }) {
  var _a;
  const __ = useTranslation();
  const props = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  props.locale || false;
  props.languages || [];
  const permissions = props.permissions || {};
  const actions = [];
  if (permissions == null ? void 0 : permissions["product-patterns.index"]) {
    actions.push({
      text: __("patrones_volver"),
      icon: "la-angle-left",
      url: "product-patterns.index",
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
        /* @__PURE__ */ jsx("div", { className: "contents pb-4", children: /* @__PURE__ */ jsx(PatternForm, { action: route("product-patterns.store") }) })
      ]
    }
  );
}
export {
  Create as default
};
