import { jsx } from "react/jsx-runtime";
import "react";
import { T as Tabs } from "./Tabs-Cd7Sj0t_.js";
import { usePage } from "@inertiajs/react";
function TabsLocale({ children }) {
  const { availableLocales = [], languages = {} } = usePage().props;
  const items = availableLocales.map((code) => ({
    key: code,
    label: Array.isArray(languages[code]) ? languages[code][3] : code
  }));
  return /* @__PURE__ */ jsx(Tabs, { items, children });
}
export {
  TabsLocale as T
};
