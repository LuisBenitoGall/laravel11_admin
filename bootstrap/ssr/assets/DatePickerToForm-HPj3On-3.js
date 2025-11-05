import { jsx, jsxs } from "react/jsx-runtime";
import "react";
import DatePicker, { registerLocale } from "react-datepicker";
/* empty css                          */
import { es } from "date-fns/locale";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
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
  maxDate = null,
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
  const computedMaxDate = maxDate === null ? /* @__PURE__ */ new Date() : maxDate;
  const picker = /* @__PURE__ */ jsx(
    DatePicker,
    {
      id: name,
      name,
      locale: "es",
      selected,
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
  FormDatePickerInput as F
};
