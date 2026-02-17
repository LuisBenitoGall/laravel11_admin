import { jsxs, jsx } from "react/jsx-runtime";
import { useMemo } from "react";
import { S as SelectInput } from "./SelectInput-DrqFt-OA.js";
const currentYear = () => (/* @__PURE__ */ new Date()).getFullYear();
function YearSelect({
  minYear = 2e3,
  maxYear = currentYear(),
  value,
  onChange,
  placeholder = "",
  className = "",
  descending = true,
  ...rest
}) {
  const options = useMemo(() => {
    const min = Math.min(minYear, maxYear);
    const max = Math.max(minYear, maxYear);
    const years = [];
    for (let y = max; y >= min; y--) {
      years.push(y);
    }
    if (!descending) {
      years.reverse();
    }
    return years;
  }, [minYear, maxYear, descending]);
  const rawValue = value !== null && value !== void 0 && value !== "" && typeof value !== "object" ? String(value) : "";
  return /* @__PURE__ */ jsxs(
    SelectInput,
    {
      className,
      value: rawValue,
      onChange,
      ...rest,
      children: [
        placeholder ? /* @__PURE__ */ jsx("option", { value: "", children: placeholder }) : null,
        options.map((year) => /* @__PURE__ */ jsx("option", { value: year, children: year }, year))
      ]
    }
  );
}
export {
  YearSelect as Y
};
