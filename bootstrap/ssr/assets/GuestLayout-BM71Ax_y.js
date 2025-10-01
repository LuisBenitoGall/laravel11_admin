import { jsxs, jsx } from "react/jsx-runtime";
import "@inertiajs/react";
import Header from "./Header-BT-uMu0Z.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
function Guest({ children }) {
  useTranslation();
  return (
    // <div id="app">
    /* @__PURE__ */ jsxs("div", { className: "layout-wrapper landing", children: [
      /* @__PURE__ */ jsx(Header, {}),
      children
    ] })
  );
}
export {
  Guest as G
};
