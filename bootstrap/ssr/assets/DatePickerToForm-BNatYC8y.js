import { jsx, jsxs } from "react/jsx-runtime";
import "react";
import DatePicker, { registerLocale } from "react-datepicker";
/* empty css                          */
import { es } from "date-fns/locale";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
function toLocalYmd(date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return null;
  }
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function parseLocalYmd(value) {
  if (!value) return null;
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }
  if (typeof value !== "string") {
    return null;
  }
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;
  const [, y, m, d] = match;
  const date = new Date(
    Number(y),
    Number(m) - 1,
    Number(d)
  );
  return isNaN(date.getTime()) ? null : date;
}
registerLocale("es", es);
function FormDatePickerInput({
  name,
  selected,
  onChange,
  className = "",
  label = "",
  placeholder = "",
  dateFormat = "yyyy-MM-dd",
  minDate = null,
  // OJO: sin valor por defecto aquí; lo distinguimos de null dentro
  maxDate,
  required = false,
  disabled = false,
  addon = true,
  addonElement = null,
  // Autocomplete value for the input. Use a semantic token so password managers
  // don't mistake this for a credential field. Default to 'bday' (birthday).
  autoComplete = "bday",
  // Allow quick selection of month/year (useful for birth_date)
  showMonthDropdown = true,
  showYearDropdown = true,
  scrollableYearDropdown = true,
  yearDropdownItemNumber = 100
}) {
  const __ = useTranslation();
  const Icon = addonElement ?? /* @__PURE__ */ jsx("i", { className: "la la-calendar me-1", "aria-hidden": "true" });
  const computedMaxDate = typeof maxDate === "undefined" ? /* @__PURE__ */ new Date() : maxDate;
  const selectedDate = parseLocalYmd(selected);
  const picker = /* @__PURE__ */ jsx(
    DatePicker,
    {
      id: name,
      name,
      locale: "es",
      selected: selectedDate,
      onChange: (date) => onChange(name, date),
      dateFormat,
      className: `form-control text-end ${className}`,
      placeholderText: placeholder || __("fecha_selec"),
      required,
      disabled,
      minDate,
      maxDate: computedMaxDate,
      autoComplete,
      "data-lpignore": "true",
      showMonthDropdown,
      showYearDropdown,
      scrollableYearDropdown,
      yearDropdownItemNumber,
      dropdownMode: "select",
      withPortal: true
    }
  );
  return /* @__PURE__ */ jsxs("div", { children: [
    label && /* @__PURE__ */ jsx("label", { htmlFor: name, className: "form-label", children: __(label) }),
    addon ? /* @__PURE__ */ jsxs("div", { className: "input-group", children: [
      /* @__PURE__ */ jsx("span", { className: "input-group-text", children: Icon }),
      picker
    ] }) : picker
  ] });
}
export {
  FormDatePickerInput as F,
  toLocalYmd as t
};
