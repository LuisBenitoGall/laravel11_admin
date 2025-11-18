import { jsxs, jsx } from "react/jsx-runtime";
import { useMemo, useCallback } from "react";
import { R as RadioButton } from "./RadioButton-BQ8Yvx79.js";
import { I as InputError } from "./InputError-DME5vguS.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
function SetSex({
  value,
  // 'm' | 'h' | ''
  onChange,
  // recibe event o string, lo normalizamos
  error = null,
  name = "sex",
  required = false,
  disabled = false
}) {
  const __ = useTranslation();
  const options = useMemo(() => [
    { value: "m", label: __("mujer") },
    { value: "h", label: __("hombre") }
  ], [__]);
  const handleChange = useCallback((eOrVal) => {
    var _a;
    const v = typeof eOrVal === "string" ? eOrVal : (_a = eOrVal == null ? void 0 : eOrVal.target) == null ? void 0 : _a.value;
    if (onChange) onChange({ target: { name, value: v } });
  }, [onChange, name]);
  return /* @__PURE__ */ jsxs("div", { className: "col-lg-4", children: [
    /* @__PURE__ */ jsx("label", { className: "form-label d-block mb-2", children: __("sexo") }),
    /* @__PURE__ */ jsx(
      RadioButton,
      {
        name,
        value: String(value ?? ""),
        checkedValue: String(value ?? ""),
        options,
        onChange: handleChange,
        required,
        disabled
      }
    ),
    error && /* @__PURE__ */ jsx(InputError, { className: "mt-1", message: error })
  ] });
}
export {
  SetSex as S
};
