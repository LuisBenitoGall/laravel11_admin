import { jsx } from "react/jsx-runtime";
function PrimaryButton({ className = "", disabled, children, ...props }) {
  return /* @__PURE__ */ jsx(
    "button",
    {
      ...props,
      className: `btn btn-primary text-white ${disabled && "opacity-25"} ` + className,
      disabled,
      children
    }
  );
}
export {
  PrimaryButton as P
};
