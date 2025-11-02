import { jsx } from "react/jsx-runtime";
function SecondaryButton({ type = "button", className = "", disabled, children, ...props }) {
  return /* @__PURE__ */ jsx(
    "button",
    {
      ...props,
      type,
      className: `btn btn-secondary text-white ${disabled && "opacity-25"} ` + className,
      disabled,
      children
    }
  );
}
export {
  SecondaryButton as S
};
