import { jsx, jsxs } from "react/jsx-runtime";
import { forwardRef, useRef, useEffect } from "react";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
const TextInput = forwardRef(function TextInput2({ type = "text", className = "", onChange, isFocused = false, addon = false, ...props }, ref) {
  useTranslation();
  const input = ref ? ref : useRef();
  useEffect(() => {
    if (isFocused) {
      input.current.focus();
    }
  }, []);
  const handleInputChange = (e) => {
    let value = e.target.value;
    if (className.includes("setDecimal")) {
      value = value.replace(",", ".");
      value = value.replace(/[^0-9.]/g, "");
      const parts = value.split(".");
      if (parts.length > 2) {
        value = parts[0] + "." + parts.slice(1).join("");
      }
    }
    const syntheticEvent = {
      ...e,
      target: {
        ...e.target,
        value
      }
    };
    onChange && onChange(syntheticEvent);
  };
  const inputElement = /* @__PURE__ */ jsx(
    "input",
    {
      ...props,
      type,
      className: `form-control ${className}`,
      onChange: handleInputChange,
      ref: input,
      autoComplete: "off",
      maxLength: props.maxLength || 255
    }
  );
  return addon ? /* @__PURE__ */ jsxs("div", { className: "input-group", children: [
    inputElement,
    /* @__PURE__ */ jsx("span", { className: "input-group-text", children: addon })
  ] }) : inputElement;
});
export {
  TextInput as T
};
