import { jsxs, jsx } from "react/jsx-runtime";
import "react";
function SpinnerInline({ text = null }) {
  return /* @__PURE__ */ jsxs("span", { className: "d-inline-flex align-items-center gap-2", children: [
    /* @__PURE__ */ jsx("span", { className: "spinner-border spinner-border-sm", role: "status", "aria-hidden": "true" }),
    text ? /* @__PURE__ */ jsx("span", { children: text }) : null
  ] });
}
export {
  SpinnerInline as S
};
