import { jsxs, jsx } from "react/jsx-runtime";
import { usePage } from "@inertiajs/react";
import { I as InputError } from "./InputError-DME5vguS.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
function RelevanceSelect({
  id = "relevance",
  name = "relevance",
  value,
  onChange,
  error,
  label,
  className = "form-select"
}) {
  var _a;
  const __ = useTranslation();
  const pageProps = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  const serverOptions = pageProps.relevanceOptions || null;
  const fallbackOptions = [
    { value: 1, label: __("baja"), color: "#0d6efd" },
    { value: 2, label: __("media_baja"), color: "#0dcaf0" },
    { value: 3, label: __("media"), color: "#ffc107" },
    { value: 4, label: __("media_alta"), color: "#fd7e14" },
    { value: 5, label: __("alta"), color: "#dc3545" }
  ];
  const options = serverOptions && serverOptions.length ? serverOptions : fallbackOptions;
  return /* @__PURE__ */ jsxs("div", { className: "mb-3", children: [
    /* @__PURE__ */ jsx("label", { htmlFor: id, className: "form-label", children: label ?? __("relevancia") }),
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
  RelevanceSelect as R
};
