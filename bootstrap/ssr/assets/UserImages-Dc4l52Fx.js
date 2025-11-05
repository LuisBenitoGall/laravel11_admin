import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useRef, useState, useEffect } from "react";
import axios from "axios";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import { u as useSweetAlert } from "./useSweetAlert-D4PAsWYN.js";
import "@inertiajs/react";
import "sweetalert2";
function DropzoneGallery({
  existingImages = [],
  imagePath = null,
  uploadUrl,
  deleteUrl = null,
  uploadParamName = "file",
  maxFiles = 20,
  maxFileSize = 3 * 1024 * 1024,
  // 3MB
  acceptedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"],
  onChange = () => {
  },
  autoUpload = true,
  showProgress = false,
  className = "",
  // id of the related entity (user/company/whatever) to include in the request
  entityId = null,
  // form field name to send the entity id as (defaults to entity_id)
  entityParamName = "entity_id"
}) {
  const __ = useTranslation();
  const { showConfirm } = useSweetAlert();
  const inputRef = useRef(null);
  const resolveUrl = (u, params = {}) => {
    try {
      if (typeof u === "string" && typeof route === "function") {
        try {
          return route(u, params);
        } catch (e) {
        }
      }
    } catch (e) {
    }
    return u;
  };
  const [images, setImages] = useState(Array.isArray(existingImages) ? existingImages.slice() : []);
  const [uploadingMap, setUploadingMap] = useState({});
  const [error, setError] = useState(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerSrc, setViewerSrc] = useState(null);
  const [viewerAlt, setViewerAlt] = useState("");
  const totalCount = images.length + Object.keys(uploadingMap).length;
  const isAcceptable = (file) => {
    if (!acceptedTypes.includes(file.type)) return false;
    if (file.size > maxFileSize) return false;
    return true;
  };
  const handleFiles = (filesList) => {
    setError(null);
    const files = Array.from(filesList || []);
    if (totalCount + files.length > maxFiles) {
      setError(`Máximo ${maxFiles} imágenes permitidas.`);
      return;
    }
    const valid = files.filter((f) => isAcceptable(f));
    const invalid = files.length - valid.length;
    if (invalid) setError(`Algunos archivos no válidos (tipo/tamaño).`);
    valid.forEach((f) => uploadOne(f));
  };
  const uploadOne = async (file) => {
    const tempId = `tmp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    setUploadingMap((prev) => ({ ...prev, [tempId]: { progress: 0, file } }));
    if (!autoUpload || !uploadUrl) {
      const localObj = { __tmp: tempId, name: file.name, url: URL.createObjectURL(file), file };
      setImages((prev) => {
        const next = prev.concat(localObj);
        onChange(next);
        return next;
      });
      setUploadingMap((prev) => {
        const copy = { ...prev };
        delete copy[tempId];
        return copy;
      });
      return;
    }
    try {
      const form = new FormData();
      form.append(uploadParamName, file);
      if (entityId !== null && entityId !== void 0) {
        form.append(entityParamName, entityId);
      }
      const target = resolveUrl(uploadUrl, entityId || {});
      const res = await axios.post(target, form, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          const percent = e.total ? Math.round(e.loaded * 100 / e.total) : 0;
          setUploadingMap((prev) => ({ ...prev, [tempId]: { progress: percent, file } }));
        }
      });
      let added = [];
      if (!res || !res.data) {
        added = [];
      } else if (Array.isArray(res.data)) {
        added = res.data;
      } else if (Array.isArray(res.data.images)) {
        added = res.data.images;
      } else if (res.data.image) {
        added = Array.isArray(res.data.image) ? res.data.image : [res.data.image];
      } else if (res.data.data && Array.isArray(res.data.data)) {
        added = res.data.data;
      } else {
        const maybe = res.data;
        if (maybe && (maybe.id || maybe.url)) added = [maybe];
      }
      setImages((prev) => {
        const next = prev.concat(added);
        onChange(next);
        return next;
      });
    } catch (err) {
      console.error("Upload error", err);
      setError("Error subiendo archivo");
    } finally {
      setUploadingMap((prev) => {
        const copy = { ...prev };
        delete copy[tempId];
        return copy;
      });
    }
  };
  const handleDelete = async (img) => {
    showConfirm({
      title: __("imagen_eliminar") ?? "Eliminar imagen",
      text: __("imagen_eliminar_confirm") ?? "¿Quieres eliminar esta imagen?",
      icon: "warning",
      onConfirm: async () => {
        var _a;
        if (img.__tmp) {
          setImages((prev) => {
            const next = prev.filter((i) => i.__tmp !== img.__tmp);
            onChange(next);
            return next;
          });
          return;
        }
        if (!deleteUrl) {
          setImages((prev) => {
            const next = prev.filter((i) => i.id !== img.id);
            onChange(next);
            return next;
          });
          return;
        }
        console.debug("DropzoneGallery handleDelete deleteUrl:", deleteUrl);
        console.debug("DropzoneGallery handleDelete img object:", img);
        let url = null;
        if (typeof deleteUrl === "function") {
          url = deleteUrl(img);
        } else if (typeof deleteUrl === "string") {
          if (deleteUrl.includes(":id")) {
            url = deleteUrl.replace(":id", img.id);
          } else {
            let maybe = resolveUrl(deleteUrl, [img.id]);
            if (!maybe || maybe === deleteUrl) maybe = resolveUrl(deleteUrl, img.id);
            if (maybe && typeof maybe === "string" && maybe !== deleteUrl) url = maybe;
            else url = `${deleteUrl.replace(/\/$/, "")}/${img.id}`;
          }
        }
        try {
          if (!url) {
            try {
              const maybe = resolveUrl(deleteUrl, [img.id]);
              if (maybe && typeof maybe === "string" && maybe !== deleteUrl) url = maybe;
            } catch (e) {
            }
          }
          if (!url) {
            console.error("Could not resolve deleteUrl for image", { deleteUrl, img });
            setError("Url de borrado inválida");
            return;
          }
          console.debug("DropzoneGallery deleting URL:", url);
          await axios.delete(url, { data: {} });
          setImages((prev) => {
            const next = prev.filter((i) => i.id !== img.id);
            onChange(next);
            return next;
          });
        } catch (err) {
          console.error("Delete error", err);
          const status = (_a = err == null ? void 0 : err.response) == null ? void 0 : _a.status;
          if (status === 405 || status === 404) {
            try {
              console.debug("DropzoneGallery attempting fallback POST _method=DELETE to", url);
              const form = new FormData();
              form.append("_method", "DELETE");
              const res2 = await axios.post(url, form, { headers: { "Content-Type": "multipart/form-data" } });
              if (res2 && (res2.status === 200 || res2.status === 204 || res2.status === 202)) {
                setImages((prev) => {
                  const next = prev.filter((i) => i.id !== img.id);
                  onChange(next);
                  return next;
                });
                return;
              }
            } catch (err2) {
              console.error("Fallback delete error", err2);
            }
          }
          setError("Error borrando imagen");
        }
      }
    });
  };
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && viewerOpen) setViewerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewerOpen]);
  const openViewer = (src, alt = "") => {
    setViewerSrc(src);
    setViewerAlt(alt);
    setViewerOpen(true);
  };
  const closeViewer = () => setViewerOpen(false);
  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const dt = e.dataTransfer;
    if (dt && dt.files) handleFiles(dt.files);
  };
  const onDragOver = (e) => {
    e.preventDefault();
  };
  const openFilePicker = () => inputRef.current && inputRef.current.click();
  return /* @__PURE__ */ jsxs("div", { className: `dropzone-gallery ${className}`, children: [
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: "p-3 mb-3 border rounded text-center",
        style: { borderStyle: "dashed", cursor: "pointer" },
        onDrop,
        onDragOver,
        onClick: openFilePicker,
        children: [
          /* @__PURE__ */ jsx(
            "input",
            {
              ref: inputRef,
              type: "file",
              multiple: true,
              accept: acceptedTypes.map((t) => t).join(","),
              style: { display: "none" },
              onChange: (e) => handleFiles(e.target.files)
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "mb-2 pt-3", children: [
            /* @__PURE__ */ jsx("strong", { children: __("imagenes_anadir") }),
            /* @__PURE__ */ jsx("br", {}),
            /* @__PURE__ */ jsx("i", { className: "la la-image fs-1 my-4" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "small text-muted pb-4", children: [
            __("imagenes_arrastrar_click"),
            " (máx ",
            maxFiles,
            " archivos)"
          ] })
        ]
      }
    ),
    error && /* @__PURE__ */ jsx("div", { className: "alert alert-danger small mx-0 mb-3", children: error }),
    /* @__PURE__ */ jsxs("div", { className: "row g-2", children: [
      images.map((img) => {
        let src = null;
        if (img.url) src = img.url;
        else if (img.path) src = img.path;
        else if (img.preview) src = img.preview;
        else if (img.file && img.file.url) src = img.file.url;
        else if (img.filename) src = img.filename;
        else if (img.image) {
          const val = img.image;
          if (typeof val === "string" && (val.startsWith("http") || val.startsWith("/") || val.startsWith("data:") || val.includes("/"))) {
            src = val;
          } else if (imagePath) {
            src = `/storage/${imagePath.replace(/\/$/, "")}/${val}`;
          } else {
            src = val;
          }
        }
        src = src || "";
        if (src && typeof src === "string" && !src.startsWith("http") && !src.startsWith("/") && !src.startsWith("data:") && !src.includes("/")) {
          const prefix = imagePath ? `/storage/${imagePath.replace(/\/$/, "")}/` : "/storage/";
          src = `${prefix}${src}`;
        }
        return /* @__PURE__ */ jsx("div", { className: "col-6 col-sm-4 col-md-3", children: /* @__PURE__ */ jsxs("div", { className: "position-relative border rounded overflow-hidden", style: { minHeight: 80 }, children: [
          /* @__PURE__ */ jsx(
            "img",
            {
              src,
              alt: img.name ?? "",
              style: { width: "100%", height: 120, objectFit: "cover", cursor: "pointer" },
              onClick: () => openViewer(src, img.name ?? "")
            }
          ),
          /* @__PURE__ */ jsx("button", { type: "button", className: "btn btn-sm btn-danger position-absolute", style: { top: 6, right: 6 }, onClick: () => handleDelete(img), children: /* @__PURE__ */ jsx("i", { className: "la la-trash" }) })
        ] }) }, img.id ?? img.__tmp ?? img.url ?? img.image);
      }),
      Object.keys(uploadingMap).map((tmpId) => /* @__PURE__ */ jsx("div", { className: "col-6 col-sm-4 col-md-3", children: /* @__PURE__ */ jsx("div", { className: "position-relative border rounded d-flex align-items-center justify-content-center", style: { minHeight: 120 }, children: /* @__PURE__ */ jsxs("div", { className: "text-center small", children: [
        /* @__PURE__ */ jsx("div", { className: "spinner-border spinner-border-sm", role: "status", children: /* @__PURE__ */ jsx("span", { className: "visually-hidden", children: __("cargando") }) }),
        /* @__PURE__ */ jsx("div", { className: "mt-2", children: __("subiendo") })
      ] }) }) }, tmpId))
    ] }),
    viewerOpen && /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "modal-backdrop fade show",
          style: { position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1050 },
          onClick: closeViewer
        }
      ),
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "image-viewer-overlay d-flex align-items-center justify-content-center",
          style: { position: "fixed", inset: 0, zIndex: 1060, pointerEvents: "none" },
          children: /* @__PURE__ */ jsxs("div", { style: { pointerEvents: "auto", maxWidth: "95%", maxHeight: "95%", position: "relative" }, children: [
            /* @__PURE__ */ jsx("button", { type: "button", className: "btn btn-sm btn-light position-absolute", style: { top: -12, right: -12, zIndex: 1070 }, onClick: closeViewer, children: /* @__PURE__ */ jsx("i", { className: "la la-close" }) }),
            /* @__PURE__ */ jsx("img", { src: viewerSrc, alt: viewerAlt, style: { display: "block", maxWidth: "100%", maxHeight: "80vh", borderRadius: 6 } })
          ] })
        }
      )
    ] })
  ] });
}
function UserImages({ images = [], uploadUrl = null, deleteUrl = null, onChange = () => {
}, entityId = null, imagePath = null }) {
  const handleChange = (nextImages) => {
    if (typeof onChange === "function") onChange(nextImages);
  };
  return /* @__PURE__ */ jsx("div", { className: "col-12 gy-2", children: /* @__PURE__ */ jsx(
    DropzoneGallery,
    {
      existingImages: images,
      imagePath,
      uploadUrl,
      deleteUrl,
      entityId,
      uploadParamName: "file",
      maxFiles: 20,
      maxFileSize: 3 * 1024 * 1024,
      acceptedTypes: ["image/jpeg", "image/png", "image/gif", "image/webp"],
      onChange: handleChange,
      autoUpload: true
    }
  ) });
}
export {
  UserImages as default
};
