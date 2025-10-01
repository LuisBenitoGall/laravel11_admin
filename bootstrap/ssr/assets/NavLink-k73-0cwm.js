import { jsx } from "react/jsx-runtime";
import { Link } from "@inertiajs/react";
function NavLink({ active = false, className = "", children, ...props }) {
  return /* @__PURE__ */ jsx(
    Link,
    {
      ...props,
      className: " " + (active ? " " : " ") + className,
      children
    }
  );
}
export {
  NavLink as N
};
