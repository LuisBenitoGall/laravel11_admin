import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useMemo, useState, useEffect } from "react";
import { usePage } from "@inertiajs/react";
function Tabs({
  tabs = [],
  items = [],
  // Array de pestañas: [{ key, label }, ...]
  defaultActive = null,
  // key de pestaña inicial (por defecto, el primero)
  onChange = () => {
  },
  // función callback al cambiar de tab
  children,
  // render-prop: función que recibe activeKey y devuelve contenido
  className = ""
  // clases adicionales en nav
}) {
  var _a;
  const isDeclarative = Array.isArray(tabs) && tabs.length > 0 && tabs[0].content !== void 0;
  const source = isDeclarative ? tabs : items;
  const routeName = ((_a = usePage()) == null ? void 0 : _a.component) || "default";
  const storageKey = `tabs_active_index_${routeName}`;
  const initialIndex = useMemo(() => {
    if (!defaultActive) return 0;
    const index = source.findIndex((tab) => tab.key === defaultActive);
    return index >= 0 ? index : 0;
  }, [defaultActive, source]);
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  useEffect(() => {
    var _a2;
    sessionStorage.setItem(storageKey, activeIndex);
    const currentKey = (_a2 = source[activeIndex]) == null ? void 0 : _a2.key;
    if (currentKey) {
      onChange(currentKey);
    }
  }, [activeIndex]);
  if (source.length === 0) return null;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("ul", { className: `nav nav-tabs ${className}`.trim(), children: source.map((tab, index) => /* @__PURE__ */ jsx("li", { className: "nav-item", children: /* @__PURE__ */ jsx(
      "button",
      {
        className: `nav-link ${activeIndex === index ? "active" : ""}`,
        onClick: () => setActiveIndex(index),
        type: "button",
        children: tab.label
      }
    ) }, isDeclarative ? index : tab.key)) }),
    /* @__PURE__ */ jsx("div", { className: "tab-content px-2 py-4", children: /* @__PURE__ */ jsx("div", { className: "tab-pane fade show active", children: isDeclarative ? source[activeIndex].content : typeof children === "function" ? children(source[activeIndex].key) : null }) })
  ] });
}
export {
  Tabs as T
};
