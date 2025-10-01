import { jsx } from "react/jsx-runtime";
function Checkbox({ className = "", checked = false, value = "1", onChange, ...props }) {
  return /* @__PURE__ */ jsx(
    "input",
    {
      ...props,
      type: "checkbox",
      className: `form-check-input ${className}`,
      checked,
      value,
      onChange
    }
  );
}
export {
  Checkbox as C
};
