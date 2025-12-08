import { jsxs, jsx } from "react/jsx-runtime";
function PrimaryButton({ className = "", disabled = false, loading = false, loadingText = "guardando", children, ...props }) {
  const isDisabled = disabled || loading;
  return /* @__PURE__ */ jsxs(
    "button",
    {
      ...props,
      className: `btn btn-primary text-white ${isDisabled && "opacity-25"} ` + className,
      disabled: isDisabled,
      children: [
        loading && /* @__PURE__ */ jsx(
          "span",
          {
            className: "spinner-border spinner-border-sm me-2",
            role: "status",
            "aria-hidden": "true"
          }
        ),
        loading ? loadingText + "..." : children
      ]
    }
  );
}
export {
  PrimaryButton as P
};
