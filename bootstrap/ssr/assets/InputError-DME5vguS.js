import { jsx } from "react/jsx-runtime";
function InputError({ message, className = "", ...props }) {
  return message ? /* @__PURE__ */ jsx("p", { ...props, className: "msg-error pt-1 " + className, children: message }) : null;
}
export {
  InputError as I
};
