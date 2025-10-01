import { jsxs, jsx } from "react/jsx-runtime";
import { forwardRef, useState, useEffect } from "react";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
const FileInput = forwardRef(function FileInput2({ id, name, label = "", className = "", multiple = false, accept = "", error = "", required = false, showPreview = true, ...props }, ref) {
  const __ = useTranslation();
  const [previews, setPreviews] = useState([]);
  const [files, setFiles] = useState([]);
  const handleChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
    if (props.onChange) {
      props.onChange(e);
    }
  };
  useEffect(() => {
    if (!showPreview || files.length === 0) {
      setPreviews([]);
      return;
    }
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    const objectUrls = imageFiles.map((file) => URL.createObjectURL(file));
    setPreviews(objectUrls);
    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [files, showPreview]);
  const clearImages = () => {
    setFiles([]);
    setPreviews([]);
    const input = document.getElementById(id || name);
    if (input) input.value = "";
  };
  return /* @__PURE__ */ jsxs("div", { className: `form-group position-relative ${className}`, children: [
    label && /* @__PURE__ */ jsxs("label", { htmlFor: id || name, className: "form-label", children: [
      __(label),
      " ",
      required && /* @__PURE__ */ jsx("span", { className: "text-danger", children: "*" })
    ] }),
    /* @__PURE__ */ jsx(
      "input",
      {
        type: "file",
        id: id || name,
        name,
        className: `form-control ${error ? "is-invalid" : ""}`,
        ref,
        accept,
        required,
        multiple,
        onChange: handleChange
      }
    ),
    error && /* @__PURE__ */ jsx("div", { className: "invalid-feedback", children: error }),
    previews.length > 0 && showPreview && /* @__PURE__ */ jsxs("div", { className: "mt-2 d-flex flex-wrap gap-2", children: [
      previews.map((src, index) => /* @__PURE__ */ jsx(
        "img",
        {
          src,
          alt: `preview-${index}`,
          className: "img-thumbnail",
          style: { maxWidth: "200px", maxHeight: "200px", objectFit: "cover" }
        },
        index
      )),
      /* @__PURE__ */ jsx("div", { className: "w-100", children: /* @__PURE__ */ jsx("button", { type: "button", className: "ms-2 btn btn-sm btn-danger", onClick: clearImages, children: /* @__PURE__ */ jsx("i", { className: "la la-trash" }) }) })
    ] })
  ] });
});
export {
  FileInput as F
};
