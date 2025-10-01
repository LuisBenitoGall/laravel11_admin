import { jsx } from "react/jsx-runtime";
import { forwardRef, useRef, useEffect } from "react";
const SelectInput = forwardRef(function SelectInput2({
  className = "",
  isFocused = false,
  multiple = false,
  children,
  ...props
}, ref) {
  const inputRef = ref || useRef();
  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);
  return /* @__PURE__ */ jsx(
    "select",
    {
      ...props,
      ref: inputRef,
      className: `form-control ${className}`,
      multiple,
      children
    }
  );
});
export {
  SelectInput as S
};
