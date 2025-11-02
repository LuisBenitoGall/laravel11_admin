import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useMemo, useState, useEffect } from "react";
import Select from "react-select";
const SelectSearch = ({
  options = [],
  onChange,
  placeholder = "Search...",
  isMulti = false,
  name,
  required,
  value,
  // nuevas props para hacerlo útil de verdad
  disabled,
  isDisabled,
  isClearable = true,
  className,
  noOptionsMessage,
  onSearchChange,
  onMenuOpen,
  isLoading = false,
  ...rest
}) => {
  const finalDisabled = typeof isDisabled !== "undefined" ? !!isDisabled : !!disabled;
  const findOption = (val) => options.find((o) => (o == null ? void 0 : o.value) === val) || null;
  const normalizedInitial = useMemo(() => {
    if (isMulti) {
      if (Array.isArray(value)) {
        return value.map((v) => typeof v === "object" ? v : findOption(v)).filter(Boolean);
      }
      return [];
    }
    return typeof value === "object" ? value : findOption(value);
  }, [value, options, isMulti]);
  const [inputValue, setInputValue] = useState("");
  const [selectedValue, setSelectedValue] = useState(normalizedInitial);
  useEffect(() => {
    setSelectedValue(normalizedInitial);
  }, [normalizedInitial]);
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      borderColor: state.isFocused ? "#80bdff" : "#ced4da",
      boxShadow: "none",
      opacity: finalDisabled ? 0.65 : 1,
      cursor: finalDisabled ? "not-allowed" : "default"
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
    menu: (provided) => ({ ...provided, zIndex: 9999 })
  };
  const handleInputChange = (val) => setInputValue(val);
  const handleChange = (selectedOption) => {
    setSelectedValue(selectedOption);
    onChange && onChange(selectedOption);
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("div", { className, children: /* @__PURE__ */ jsx(
      Select,
      {
        options,
        onChange: handleChange,
        onInputChange: handleInputChange,
        onMenuOpen,
        inputValue,
        placeholder,
        isMulti,
        isClearable,
        isDisabled: finalDisabled,
        isLoading,
        styles: customStyles,
        classNamePrefix: "select-search",
        required,
        value: selectedValue,
        menuPortalTarget: typeof document !== "undefined" ? document.body : null,
        noOptionsMessage: noOptionsMessage || (() => "No options"),
        ...rest
      }
    ) }),
    name && !isMulti && /* @__PURE__ */ jsx("input", { type: "hidden", name, value: selectedValue ? selectedValue.value : "" }),
    name && isMulti && /* @__PURE__ */ jsx(
      "input",
      {
        type: "hidden",
        name,
        value: Array.isArray(selectedValue) ? selectedValue.map((o) => o.value).join(",") : ""
      }
    )
  ] });
};
export {
  SelectSearch as S
};
