import { jsx, jsxs } from "react/jsx-runtime";
import "react";
function RadioButton({
  name,
  value,
  onChange,
  options = [],
  className = "",
  required = false
}) {
  return /* @__PURE__ */ jsx("div", { className: "d-flex flex-wrap gap-3", children: options.map((opt, index) => /* @__PURE__ */ jsxs("div", { className: "align-items-center d-flex form-check gap-2 me-2", children: [
    /* @__PURE__ */ jsx(
      "input",
      {
        className: `form-check-input mt-1 md ${className}`,
        type: "radio",
        name,
        id: `${name}-${opt.value}`,
        value: String(opt.value),
        checked: String(value) === String(opt.value),
        onChange: (e) => onChange(e),
        required
      }
    ),
    /* @__PURE__ */ jsx("label", { className: "form-check-label", htmlFor: `${name}-${opt.value}`, children: opt.label })
  ] }, index)) });
}
export {
  RadioButton as R
};
