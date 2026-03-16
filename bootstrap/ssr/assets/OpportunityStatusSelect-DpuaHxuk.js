import { jsxs, jsx } from "react/jsx-runtime";
import { usePage } from "@inertiajs/react";
import { I as InputError } from "./InputError-DME5vguS.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
function OpportunityStatusSelect({
  id = "opportunity_status",
  name = "status",
  value,
  onChange,
  error,
  label,
  className = "form-select"
}) {
  var _a;
  const __ = useTranslation();
  const pageProps = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  const serverOptions = pageProps.crmOpportunityStatusOptions || null;
  const fallbackOptions = [
    { value: 1, label: __("oportunidad_nueva"), color: "#0d6efd" },
    // azul
    { value: 2, label: __("oportunidad_en_proceso"), color: "#0dcaf0" },
    // celeste
    { value: 3, label: __("oportunidad_negociacion"), color: "#ffc107" },
    // amarillo
    { value: 4, label: __("oportunidad_ganada"), color: "#198754" },
    // verde
    { value: 5, label: __("oportunidad_perdida"), color: "#dc3545" }
    // rojo
  ];
  const options = serverOptions && serverOptions.length ? serverOptions : fallbackOptions;
  return /* @__PURE__ */ jsxs("div", { className: "mb-3", children: [
    /* @__PURE__ */ jsx("label", { htmlFor: id, className: "form-label", children: label ?? __("estado") }),
    /* @__PURE__ */ jsx(
      "select",
      {
        id,
        name,
        className,
        value,
        onChange,
        children: options.map((opt) => /* @__PURE__ */ jsxs(
          "option",
          {
            value: opt.value,
            style: { color: opt.color },
            children: [
              "⚑ ",
              opt.label
            ]
          },
          opt.value
        ))
      }
    ),
    error && /* @__PURE__ */ jsx(InputError, { message: error, className: "mt-1" })
  ] });
}
export {
  OpportunityStatusSelect as O
};
