import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { SketchPicker } from "react-color";
import { T as TextInput } from "./TextInput-CzxrbIpp.js";
function ColorPicker({ value = "#000000", onChange, className = "", name = "color" }) {
  const [displayColorPicker, setDisplayColorPicker] = useState(false);
  const [color, setColor] = useState(value || "#000000");
  const pickerRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setDisplayColorPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const togglePicker = () => setDisplayColorPicker(!displayColorPicker);
  const handleColorChange = (newColor) => {
    setColor(newColor.hex);
    onChange == null ? void 0 : onChange({ target: { name, value: newColor.hex } });
  };
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setColor(newValue);
    onChange == null ? void 0 : onChange({ target: { name, value: newValue } });
  };
  return /* @__PURE__ */ jsxs("div", { className: `position-relative d-flex align-items-center ${className}`, style: { maxWidth: "100%" }, children: [
    /* @__PURE__ */ jsx(
      TextInput,
      {
        type: "text",
        name,
        value: color,
        onChange: handleInputChange,
        className: "form-control me-2",
        style: { paddingRight: "2.5rem" }
      }
    ),
    /* @__PURE__ */ jsx(
      "div",
      {
        onClick: togglePicker,
        className: "color-picker",
        style: {
          backgroundColor: color
        }
      }
    ),
    displayColorPicker && /* @__PURE__ */ jsx("div", { ref: pickerRef, style: { position: "absolute", top: "100%", right: 0, zIndex: 10 }, children: /* @__PURE__ */ jsx(SketchPicker, { color, onChange: handleColorChange }) })
  ] });
}
export {
  ColorPicker as C
};
