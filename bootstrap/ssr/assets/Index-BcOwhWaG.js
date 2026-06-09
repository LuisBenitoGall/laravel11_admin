import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import React, { useState, useRef, useCallback } from "react";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-CS0xV2Ze.js";
import { usePage, Head, router } from "@inertiajs/react";
import { InputGroup, Form, Button, Card, OverlayTrigger, Tooltip, Spinner, Modal } from "react-bootstrap";
import ReactCrop from "react-image-crop";
import axios from "axios";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import { u as useSweetAlert } from "./useSweetAlert-D4PAsWYN.js";
import "./Header-BVvoXjVe.js";
import "@inertiajs/inertia";
import "sweetalert2";
import "./Sidebar-DgixJBon.js";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
import "./TextInput-CzxrbIpp.js";
const TYPE_OPTIONS = [
  { value: "", labelKey: "todos" },
  { value: "image", labelKey: "imagenes" },
  { value: "pdf", labelKey: "pdf" },
  { value: "office", labelKey: "office" }
];
const SORT_OPTIONS = [
  { value: "created_at", labelKey: "fecha" },
  { value: "original_name", labelKey: "nombre" },
  { value: "title", labelKey: "titulo" }
];
function Index({ auth, title, documents, filters }) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _i;
  const __ = useTranslation();
  const { showAlert, showConfirm } = useSweetAlert();
  const [selected, setSelected] = useState(/* @__PURE__ */ new Set());
  const [previewDoc, setPreviewDoc] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [panelSaving, setPanelSaving] = useState(false);
  const [panelForm, setPanelForm] = useState({ title: "", alt_text: "", description: "" });
  const [imageToolsDoc, setImageToolsDoc] = useState(null);
  const [crop, setCrop] = useState(null);
  const [imageNaturalSize, setImageNaturalSize] = useState({ width: 0, height: 0 });
  const [resizeMax, setResizeMax] = useState({ maxWidth: 1280, maxHeight: 1280 });
  const [resizeLockAspect, setResizeLockAspect] = useState(true);
  const [imageToolsApplying, setImageToolsApplying] = useState(false);
  const [urlCopyFeedback, setUrlCopyFeedback] = useState(false);
  const urlCopyFeedbackTimeoutRef = useRef(null);
  const detailRef = useRef(null);
  const galleryTopRef = useRef(null);
  const imgRef = useRef(null);
  const page = usePage();
  const permissions = ((_b = (_a = page == null ? void 0 : page.props) == null ? void 0 : _a.auth) == null ? void 0 : _b.permissions) ?? [];
  const canCreate = permissions.includes("documents.create") || ((_d = (_c = page == null ? void 0 : page.props) == null ? void 0 : _c.auth) == null ? void 0 : _d.is_super_admin);
  const canUpdate = permissions.includes("documents.update") || ((_f = (_e = page == null ? void 0 : page.props) == null ? void 0 : _e.auth) == null ? void 0 : _f.is_super_admin);
  const canDestroy = permissions.includes("documents.destroy") || ((_h = (_g = page == null ? void 0 : page.props) == null ? void 0 : _g.auth) == null ? void 0 : _h.is_super_admin);
  const items = (documents == null ? void 0 : documents.data) ?? [];
  const selectedList = items.filter((d) => selected.has(d.uuid));
  const singleSelected = selectedList.length === 1 ? selectedList[0] : null;
  const applyFilters = (overrides = {}) => {
    router.get(route("documents.index"), {
      type: overrides.type ?? (filters == null ? void 0 : filters.type) ?? "",
      search: overrides.search ?? (filters == null ? void 0 : filters.search) ?? "",
      sort: overrides.sort ?? (filters == null ? void 0 : filters.sort) ?? "created_at",
      dir: overrides.dir ?? (filters == null ? void 0 : filters.dir) ?? "desc",
      page: overrides.page ?? 1
    }, { preserveState: true });
  };
  const handleSearch = (e) => {
    const v = e.target.value;
    applyFilters({ search: v, page: 1 });
  };
  const handleTypeChange = (e) => {
    applyFilters({ type: e.target.value, page: 1 });
  };
  const handleSortChange = (e) => {
    const val = e.target.value;
    applyFilters({ sort: val, page: 1 });
  };
  const toggleSelect = (uuid, addOnly = false) => (e) => {
    if (addOnly && !e.ctrlKey && !e.metaKey) {
      setSelected(/* @__PURE__ */ new Set([uuid]));
      return;
    }
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(uuid)) next.delete(uuid);
      else next.add(uuid);
      return next;
    });
  };
  const openPreview = (doc) => {
    setPreviewDoc(doc);
  };
  const closePreview = () => setPreviewDoc(null);
  const onImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    setImageNaturalSize({ width: naturalWidth, height: naturalHeight });
    setCrop({ unit: "%", x: 0, y: 0, width: 100, height: 100 });
    setResizeMax({ maxWidth: naturalWidth, maxHeight: naturalHeight });
  };
  const applyImageTools = async () => {
    var _a2, _b2, _c2, _d2, _e2, _f2;
    if (!imageToolsDoc || !canUpdate) return;
    const isFullCrop = crop && crop.unit === "%" && crop.x === 0 && crop.y === 0 && crop.width === 100 && crop.height === 100;
    const hasCrop = crop && crop.width > 0 && crop.height > 0 && !isFullCrop;
    const hasResize = resizeMax.maxWidth > 0 && resizeMax.maxHeight > 0;
    if (!hasCrop && !hasResize) {
      showAlert(__("error") || "Error", __("Indica recorte (crop) y/o redimensionado (resize).") || "Indica recorte y/o redimensionado.", "error");
      return;
    }
    setImageToolsApplying(true);
    try {
      const payload = {};
      if (hasCrop && crop) {
        const pct = crop.unit === "%" ? { unit: "percent", x: crop.x, y: crop.y, width: crop.width, height: crop.height } : {
          unit: "percent",
          x: crop.x / imageNaturalSize.width * 100,
          y: crop.y / imageNaturalSize.height * 100,
          width: crop.width / imageNaturalSize.width * 100,
          height: crop.height / imageNaturalSize.height * 100
        };
        if (pct.width < 0.01 || pct.height < 0.01) throw new Error("Recorte demasiado pequeño");
        payload.crop = pct;
      }
      if (hasResize) {
        payload.resize = { max_width: resizeMax.maxWidth, max_height: resizeMax.maxHeight };
      }
      await axios.patch(route("documents.image-tools", imageToolsDoc.uuid), payload);
      setImageToolsDoc(null);
      setCrop(null);
      applyFilters();
      showAlert(__("guardado_correctamente") || "Guardado correctamente", "", "success");
    } catch (err) {
      const msg = ((_b2 = (_a2 = err == null ? void 0 : err.response) == null ? void 0 : _a2.data) == null ? void 0 : _b2.message) || ((_f2 = (_e2 = (_d2 = (_c2 = err == null ? void 0 : err.response) == null ? void 0 : _c2.data) == null ? void 0 : _d2.errors) == null ? void 0 : _e2.crop) == null ? void 0 : _f2[0]) || (err == null ? void 0 : err.message) || "Error al aplicar";
      showAlert(__("error") || "Error", msg, "error");
    } finally {
      setImageToolsApplying(false);
    }
  };
  const handleUpload = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = ".jpg,.jpeg,.png,.gif,.webp,.pdf,.xls,.xlsx,.docx";
    input.onchange = async (e) => {
      var _a2, _b2, _c2, _d2, _e2, _f2, _g2;
      const files = Array.from(e.target.files || []);
      if (files.length === 0) return;
      setUploading(true);
      setUploadProgress(0);
      const form = new FormData();
      files.forEach((f, i) => form.append(`files[${i}]`, f));
      try {
        await axios.post(route("documents.store"), form, {
          headers: { "Content-Type": "multipart/form-data", "X-XSRF-TOKEN": ((_a2 = document.querySelector('meta[name="csrf-token"]')) == null ? void 0 : _a2.content) || "" },
          onUploadProgress: (p) => {
            const percent = p.total ? Math.round(p.loaded * 100 / p.total) : 0;
            setUploadProgress(percent);
          }
        });
        applyFilters({ page: 1 });
        showAlert(__("guardado_correctamente") || "Guardado correctamente", "", "success");
      } catch (err) {
        const msg = ((_c2 = (_b2 = err == null ? void 0 : err.response) == null ? void 0 : _b2.data) == null ? void 0 : _c2.message) || ((_g2 = (_f2 = (_e2 = (_d2 = err == null ? void 0 : err.response) == null ? void 0 : _d2.data) == null ? void 0 : _e2.errors) == null ? void 0 : _f2.files) == null ? void 0 : _g2[0]) || "Error subiendo archivos";
        showAlert(__("error") || "Error", msg, "error");
      } finally {
        setUploading(false);
        setUploadProgress(0);
      }
    };
    input.click();
  }, [filters, showAlert, __]);
  const handleDeleteOne = (doc, e) => {
    if (e) e.stopPropagation();
    if (!canDestroy) return;
    showConfirm({
      title: __("eliminar"),
      text: __("documento_eliminar_confirm") || "¿Eliminar este documento?",
      icon: "warning",
      onConfirm: async () => {
        var _a2, _b2;
        try {
          await axios.delete(route("documents.destroy", doc.uuid));
          setSelected((prev) => {
            const next = new Set(prev);
            next.delete(doc.uuid);
            return next;
          });
          applyFilters();
          showAlert(__("eliminado_correctamente") || "Eliminado correctamente", "", "success");
        } catch (err) {
          showAlert(__("error") || "Error", ((_b2 = (_a2 = err == null ? void 0 : err.response) == null ? void 0 : _a2.data) == null ? void 0 : _b2.message) || "Error al eliminar", "error");
        }
      }
    });
  };
  const handleDeleteSelected = () => {
    if (selectedList.length === 0) return;
    showConfirm({
      title: __("eliminar"),
      text: __("documento_eliminar_confirm") || `¿Eliminar ${selectedList.length} documento(s)?`,
      icon: "warning",
      onConfirm: async () => {
        var _a2, _b2;
        try {
          for (const doc of selectedList) {
            await axios.delete(route("documents.destroy", doc.uuid));
          }
          setSelected(/* @__PURE__ */ new Set());
          applyFilters({ page: 1 });
          showAlert(__("eliminado_correctamente") || "Eliminado correctamente", "", "success");
        } catch (e) {
          showAlert(__("error") || "Error", ((_b2 = (_a2 = e == null ? void 0 : e.response) == null ? void 0 : _a2.data) == null ? void 0 : _b2.message) || "Error al eliminar", "error");
        }
      }
    });
  };
  const updatePanelForm = (field, value) => {
    if (!singleSelected) return;
    setPanelForm((prev) => ({ ...prev, [field]: value }));
  };
  const savePanel = async () => {
    var _a2, _b2;
    if (!singleSelected || !canUpdate) return;
    setPanelSaving(true);
    try {
      await axios.patch(route("documents.update", singleSelected.uuid), {
        title: panelForm.title,
        alt_text: panelForm.alt_text,
        description: panelForm.description
      });
      applyFilters();
      showAlert(__("guardado_correctamente") || "Guardado correctamente", "", "success");
    } catch (e) {
      showAlert(__("error") || "Error", ((_b2 = (_a2 = e == null ? void 0 : e.response) == null ? void 0 : _a2.data) == null ? void 0 : _b2.message) || "Error al guardar", "error");
    } finally {
      setPanelSaving(false);
    }
  };
  React.useEffect(() => {
    if (singleSelected) {
      setPanelForm({
        title: singleSelected.title ?? "",
        alt_text: singleSelected.alt_text ?? "",
        description: singleSelected.description ?? ""
      });
      const scrollToGalleryTop = () => {
        const el = galleryTopRef.current;
        if (!el) return;
        const top = el.getBoundingClientRect().top + (window.scrollY ?? window.pageYOffset);
        window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
      };
      requestAnimationFrame(() => {
        setTimeout(scrollToGalleryTop, 80);
      });
    } else {
      setPanelForm({ title: "", alt_text: "", description: "" });
    }
    setUrlCopyFeedback(false);
    if (urlCopyFeedbackTimeoutRef.current) {
      clearTimeout(urlCopyFeedbackTimeoutRef.current);
      urlCopyFeedbackTimeoutRef.current = null;
    }
  }, [singleSelected == null ? void 0 : singleSelected.uuid]);
  const isOffice = (mime) => /spreadsheet|wordprocessing|ms-excel|openxmlformats-officedocument/.test(mime || "");
  const actions = [];
  if (canCreate) {
    actions.push({
      text: __("documentos_subir") || "Subir documentos",
      icon: "la-upload",
      modal: true,
      onClick: handleUpload
    });
  }
  return /* @__PURE__ */ jsxs(AdminAuthenticated, { user: auth == null ? void 0 : auth.user, title, subtitle: "", actions, children: [
    /* @__PURE__ */ jsx(Head, { title }),
    /* @__PURE__ */ jsxs("div", { className: "contents pb-4", ref: galleryTopRef, children: [
      /* @__PURE__ */ jsx("div", { className: "row", children: /* @__PURE__ */ jsx("div", { className: "col-12 pt-3", children: /* @__PURE__ */ jsx("p", { children: __("documentos_texto") }) }) }),
      /* @__PURE__ */ jsxs("div", { className: "d-flex flex-wrap align-items-center gap-2 mb-3", children: [
        /* @__PURE__ */ jsx(InputGroup, { style: { maxWidth: 280 }, children: /* @__PURE__ */ jsx(
          Form.Control,
          {
            type: "search",
            placeholder: __("buscar") || "Buscar",
            defaultValue: filters == null ? void 0 : filters.search,
            onBlur: handleSearch,
            onKeyDown: (e) => e.key === "Enter" && handleSearch(e)
          }
        ) }),
        /* @__PURE__ */ jsx(
          Form.Select,
          {
            style: { width: "auto" },
            value: (filters == null ? void 0 : filters.type) ?? "",
            onChange: handleTypeChange,
            children: TYPE_OPTIONS.map((o) => /* @__PURE__ */ jsx("option", { value: o.value, children: __(o.labelKey) }, o.value || "all"))
          }
        ),
        /* @__PURE__ */ jsx(
          Form.Select,
          {
            style: { width: "auto" },
            value: (filters == null ? void 0 : filters.sort) ?? "created_at",
            onChange: handleSortChange,
            children: SORT_OPTIONS.map((o) => /* @__PURE__ */ jsx("option", { value: o.value, children: __(o.labelKey) }, o.value))
          }
        ),
        selectedList.length > 0 && canDestroy && /* @__PURE__ */ jsxs(Button, { variant: "outline-danger", size: "sm", onClick: handleDeleteSelected, children: [
          __("eliminar"),
          " (",
          selectedList.length,
          ")"
        ] })
      ] }),
      uploading && /* @__PURE__ */ jsx("div", { className: "mb-2", children: /* @__PURE__ */ jsx("div", { className: "progress", style: { height: 6 }, children: /* @__PURE__ */ jsx(
        "div",
        {
          className: "progress-bar",
          role: "progressbar",
          style: { width: `${uploadProgress}%` }
        }
      ) }) }),
      /* @__PURE__ */ jsxs("div", { className: "row", children: [
        /* @__PURE__ */ jsxs("div", { className: singleSelected ? "col-lg-8" : "col-12", children: [
          /* @__PURE__ */ jsx("div", { className: "row g-3", children: items.map((doc) => /* @__PURE__ */ jsx("div", { className: "col-6 col-md-4 col-lg-3", children: /* @__PURE__ */ jsx(
            Card,
            {
              className: `h-100 position-relative ${selected.has(doc.uuid) ? "border-primary border-2" : ""}`,
              onClick: toggleSelect(doc.uuid, true),
              style: { cursor: "pointer" },
              children: /* @__PURE__ */ jsxs("div", { className: "card-body p-2 d-flex flex-column text-center", style: { minHeight: 200 }, children: [
                /* @__PURE__ */ jsx("div", { className: "flex-grow-1 d-flex align-items-center justify-content-center", children: doc.is_image && doc.thumb_url ? /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: doc.thumb_url,
                    alt: doc.alt_text || doc.original_name,
                    className: "img-fluid rounded",
                    style: { maxHeight: 160, objectFit: "cover" },
                    loading: "lazy"
                  }
                ) : /* @__PURE__ */ jsx("div", { className: "d-flex align-items-center justify-content-center bg-light rounded py-4 w-100", children: doc.mime_type === "application/pdf" ? /* @__PURE__ */ jsx("i", { className: "la la-file-pdf la-3x text-danger" }) : isOffice(doc.mime_type) ? /* @__PURE__ */ jsx("i", { className: "la la-file-excel la-3x text-success" }) : /* @__PURE__ */ jsx("i", { className: "la la-file la-3x text-secondary" }) }) }),
                /* @__PURE__ */ jsx("div", { className: "small text-truncate mt-1", title: doc.original_name, children: doc.title || doc.original_name }),
                /* @__PURE__ */ jsxs("div", { className: "mt-1 d-flex justify-content-end gap-1", onClick: (e) => e.stopPropagation(), children: [
                  canDestroy && /* @__PURE__ */ jsx(OverlayTrigger, { placement: "top", overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", children: __("eliminar") }), children: /* @__PURE__ */ jsx("button", { type: "button", className: "btn btn-sm btn-light btn-shadow", onClick: (e) => handleDeleteOne(doc, e), children: /* @__PURE__ */ jsx("i", { className: "la la-trash text-danger" }) }) }),
                  /* @__PURE__ */ jsx(OverlayTrigger, { placement: "top", overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", children: __("vista_previa") || "Ver ampliado" }), children: /* @__PURE__ */ jsx("button", { type: "button", className: "btn btn-sm btn-light btn-shadow", onClick: (e) => {
                    e.stopPropagation();
                    openPreview(doc);
                  }, children: /* @__PURE__ */ jsx("i", { className: "la la-expand" }) }) }),
                  doc.is_image && /* @__PURE__ */ jsx(OverlayTrigger, { placement: "top", overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", children: __("herramientas_imagen") || "Herramientas de imagen" }), children: /* @__PURE__ */ jsx("button", { type: "button", className: "btn btn-sm btn-light btn-shadow", onClick: (e) => {
                    e.stopPropagation();
                    setImageToolsDoc(doc);
                  }, children: /* @__PURE__ */ jsx("i", { className: "la la-crop" }) }) })
                ] })
              ] })
            }
          ) }, doc.uuid)) }),
          ((_i = documents == null ? void 0 : documents.links) == null ? void 0 : _i.length) > 1 && /* @__PURE__ */ jsx("nav", { className: "mt-3 d-flex justify-content-center", children: /* @__PURE__ */ jsx("ul", { className: "pagination pagination-sm mb-0", children: documents.links.map((link, i) => /* @__PURE__ */ jsx(
            "li",
            {
              className: `page-item ${link.active ? "active" : ""} ${!link.url ? "disabled" : ""}`,
              children: /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  className: "page-link",
                  dangerouslySetInnerHTML: { __html: link.label },
                  onClick: () => link.url && router.get(link.url),
                  disabled: !link.url
                }
              )
            },
            i
          )) }) })
        ] }),
        singleSelected && /* @__PURE__ */ jsx("div", { className: "col-lg-4", ref: detailRef, children: /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsxs(Card.Header, { className: "d-flex justify-content-between align-items-center py-2", children: [
            /* @__PURE__ */ jsx("span", { children: __("detalle") || "Detalle" }),
            /* @__PURE__ */ jsx(OverlayTrigger, { placement: "left", overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", children: __("cerrar") || "Cerrar panel" }), children: /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                className: "btn btn-sm btn-link text-secondary p-0",
                "aria-label": __("cerrar") || "Cerrar panel",
                onClick: () => setSelected((prev) => {
                  const next = new Set(prev);
                  next.delete(singleSelected.uuid);
                  return next;
                }),
                children: /* @__PURE__ */ jsx("i", { className: "la la-times" })
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxs(Card.Body, { children: [
            /* @__PURE__ */ jsxs("div", { className: "small text-muted mb-2", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                "UUID: ",
                singleSelected.uuid
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                __("nombre"),
                ": ",
                singleSelected.original_name
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                "Ext: ",
                singleSelected.extension,
                " · ",
                singleSelected.mime_type
              ] }),
              /* @__PURE__ */ jsxs("div", { children: [
                (singleSelected.size_bytes / 1024).toFixed(1),
                " KB"
              ] }),
              /* @__PURE__ */ jsx("div", { children: singleSelected.created_at }),
              /* @__PURE__ */ jsxs("div", { className: "mt-2 d-flex align-items-center gap-1", children: [
                /* @__PURE__ */ jsx(
                  Form.Control,
                  {
                    size: "sm",
                    readOnly: true,
                    className: "font-monospace small",
                    value: typeof window !== "undefined" ? `${window.location.origin}${route("documents.preview", singleSelected.uuid)}` : route("documents.preview", singleSelected.uuid)
                  }
                ),
                /* @__PURE__ */ jsx(OverlayTrigger, { placement: "top", overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", children: urlCopyFeedback ? __("copiado") || "Copiado" : __("copiar") || "Copiar URL" }), children: /* @__PURE__ */ jsx(
                  Button,
                  {
                    size: "sm",
                    variant: "outline-secondary",
                    onClick: () => {
                      var _a2;
                      const url = typeof window !== "undefined" ? `${window.location.origin}${route("documents.preview", singleSelected.uuid)}` : route("documents.preview", singleSelected.uuid);
                      (_a2 = navigator.clipboard) == null ? void 0 : _a2.writeText(url).then(() => {
                        if (urlCopyFeedbackTimeoutRef.current) clearTimeout(urlCopyFeedbackTimeoutRef.current);
                        setUrlCopyFeedback(true);
                        urlCopyFeedbackTimeoutRef.current = setTimeout(() => {
                          setUrlCopyFeedback(false);
                          urlCopyFeedbackTimeoutRef.current = null;
                        }, 3e3);
                      });
                    },
                    children: /* @__PURE__ */ jsx("i", { className: urlCopyFeedback ? "la la-check text-success" : "la la-copy" })
                  }
                ) })
              ] })
            ] }),
            canUpdate && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsxs(Form.Group, { className: "mb-2", children: [
                /* @__PURE__ */ jsx(Form.Label, { className: "small", children: __("titulo") }),
                /* @__PURE__ */ jsx(
                  Form.Control,
                  {
                    size: "sm",
                    value: panelForm.title,
                    onChange: (e) => updatePanelForm("title", e.target.value)
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs(Form.Group, { className: "mb-2", children: [
                /* @__PURE__ */ jsx(Form.Label, { className: "small", children: __("alt_text") || "Alt text" }),
                /* @__PURE__ */ jsx(
                  Form.Control,
                  {
                    size: "sm",
                    value: panelForm.alt_text,
                    onChange: (e) => updatePanelForm("alt_text", e.target.value)
                  }
                )
              ] }),
              /* @__PURE__ */ jsxs(Form.Group, { className: "mb-2", children: [
                /* @__PURE__ */ jsx(Form.Label, { className: "small", children: __("descripcion") }),
                /* @__PURE__ */ jsx(
                  Form.Control,
                  {
                    as: "textarea",
                    rows: 2,
                    size: "sm",
                    value: panelForm.description,
                    onChange: (e) => updatePanelForm("description", e.target.value)
                  }
                )
              ] }),
              /* @__PURE__ */ jsx(Button, { size: "sm", variant: "primary", onClick: savePanel, disabled: panelSaving, children: panelSaving ? /* @__PURE__ */ jsx(Spinner, { animation: "border", size: "sm" }) : __("guardar") })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "mt-3", children: [
              /* @__PURE__ */ jsx(
                Button,
                {
                  size: "sm",
                  variant: "outline-secondary",
                  className: "me-1",
                  onClick: () => openPreview(singleSelected),
                  children: __("vista_previa") || "Vista previa"
                }
              ),
              /* @__PURE__ */ jsx(
                "a",
                {
                  href: route("documents.download", singleSelected.uuid),
                  target: "_blank",
                  rel: "noopener noreferrer",
                  className: "btn btn-sm btn-outline-secondary",
                  children: __("descargar")
                }
              )
            ] })
          ] })
        ] }) }),
        selectedList.length > 1 && !singleSelected && /* @__PURE__ */ jsx("div", { className: "col-12", children: /* @__PURE__ */ jsxs("p", { className: "text-muted small", children: [
          selectedList.length,
          " ",
          __("seleccionados") || "seleccionados",
          ". ",
          __("documento_selecciona_uno") || "Selecciona uno para editar."
        ] }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs(Modal, { show: !!imageToolsDoc, onHide: () => {
      setImageToolsDoc(null);
      setCrop(null);
    }, size: "lg", centered: true, children: [
      /* @__PURE__ */ jsx(Modal.Header, { closeButton: true, children: /* @__PURE__ */ jsx(Modal.Title, { children: __("herramientas_imagen") || "Herramientas de imagen" }) }),
      /* @__PURE__ */ jsx(Modal.Body, { children: imageToolsDoc && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("p", { className: "text-muted small mb-3", children: imageToolsDoc.title || imageToolsDoc.original_name }),
        /* @__PURE__ */ jsx("div", { className: "mb-3 d-flex justify-content-center bg-dark rounded p-2", style: { minHeight: 280 }, children: /* @__PURE__ */ jsx(
          ReactCrop,
          {
            crop,
            onChange: (_, percentCrop) => setCrop(percentCrop),
            aspect: void 0,
            className: "mw-100",
            children: /* @__PURE__ */ jsx(
              "img",
              {
                ref: imgRef,
                src: route("documents.preview", imageToolsDoc.uuid),
                alt: imageToolsDoc.original_name,
                style: { maxHeight: 360, width: "auto" },
                onLoad: onImageLoad
              }
            )
          }
        ) }),
        /* @__PURE__ */ jsxs("div", { className: "row g-2 mb-3 align-items-end", children: [
          /* @__PURE__ */ jsxs("div", { className: "col-md-4", children: [
            /* @__PURE__ */ jsx(Form.Label, { className: "small", children: __("resize_max_width") || "Ancho máx. (resize)" }),
            /* @__PURE__ */ jsx(
              Form.Control,
              {
                type: "number",
                min: 1,
                max: 4096,
                value: resizeMax.maxWidth,
                onChange: (e) => {
                  const v = parseInt(e.target.value, 10) || 1280;
                  const clamped = Math.max(1, Math.min(4096, v));
                  if (resizeLockAspect && imageNaturalSize.width > 0 && imageNaturalSize.height > 0) {
                    const aspect = imageNaturalSize.width / imageNaturalSize.height;
                    const h = Math.max(1, Math.min(4096, Math.round(clamped / aspect)));
                    setResizeMax((prev) => ({ ...prev, maxWidth: clamped, maxHeight: h }));
                  } else {
                    setResizeMax((prev) => ({ ...prev, maxWidth: clamped }));
                  }
                }
              }
            )
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "col-md-4 d-flex justify-content-center pb-2", children: [
            /* @__PURE__ */ jsx(Form.Label, { className: "small", children: __("mantener_proporciones") || "Mantener proporciones" }),
            /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(
              Form.Check,
              {
                type: "checkbox",
                id: "resize-lock-aspect",
                checked: resizeLockAspect,
                onChange: (e) => setResizeLockAspect(e.target.checked)
              }
            ) })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "col-md-4", children: [
            /* @__PURE__ */ jsx(Form.Label, { className: "small", children: __("resize_max_height") || "Alto máx. (resize)" }),
            /* @__PURE__ */ jsx(
              Form.Control,
              {
                type: "number",
                min: 1,
                max: 4096,
                value: resizeMax.maxHeight,
                onChange: (e) => {
                  const v = parseInt(e.target.value, 10) || 1280;
                  const clamped = Math.max(1, Math.min(4096, v));
                  if (resizeLockAspect && imageNaturalSize.width > 0 && imageNaturalSize.height > 0) {
                    const aspect = imageNaturalSize.width / imageNaturalSize.height;
                    const w = Math.max(1, Math.min(4096, Math.round(clamped * aspect)));
                    setResizeMax((prev) => ({ ...prev, maxWidth: w, maxHeight: clamped }));
                  } else {
                    setResizeMax((prev) => ({ ...prev, maxHeight: clamped }));
                  }
                }
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "d-flex justify-content-end gap-2", children: [
          /* @__PURE__ */ jsx(Button, { variant: "secondary", onClick: () => {
            setImageToolsDoc(null);
            setCrop(null);
          }, children: __("cancelar") }),
          /* @__PURE__ */ jsxs(Button, { variant: "primary", onClick: applyImageTools, disabled: imageToolsApplying, children: [
            imageToolsApplying ? /* @__PURE__ */ jsx(Spinner, { animation: "border", size: "sm", className: "me-1" }) : null,
            __("aplicar") || "Aplicar"
          ] })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs(Modal, { show: !!previewDoc, onHide: closePreview, size: "lg", centered: true, children: [
      /* @__PURE__ */ jsx(Modal.Header, { closeButton: true, children: /* @__PURE__ */ jsx(Modal.Title, { children: (previewDoc == null ? void 0 : previewDoc.title) || (previewDoc == null ? void 0 : previewDoc.original_name) }) }),
      /* @__PURE__ */ jsxs(Modal.Body, { className: "text-center", children: [
        (previewDoc == null ? void 0 : previewDoc.is_image) && /* @__PURE__ */ jsx(
          "img",
          {
            src: route("documents.preview", previewDoc.uuid),
            alt: previewDoc.alt_text || previewDoc.original_name,
            className: "img-fluid",
            style: { maxHeight: "70vh" }
          }
        ),
        (previewDoc == null ? void 0 : previewDoc.mime_type) === "application/pdf" && /* @__PURE__ */ jsx(
          "iframe",
          {
            title: "PDF preview",
            src: route("documents.preview", previewDoc.uuid),
            className: "w-100 border-0",
            style: { height: "70vh" }
          }
        ),
        previewDoc && isOffice(previewDoc.mime_type) && /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("i", { className: "la la-file-excel la-4x text-success mb-3" }),
          /* @__PURE__ */ jsx("p", { className: "text-muted", children: __("documento_descargar_office") || "Documento Office. Usa descarga para abrir." }),
          /* @__PURE__ */ jsx(
            "a",
            {
              href: route("documents.download", previewDoc.uuid),
              target: "_blank",
              rel: "noopener noreferrer",
              className: "btn btn-primary",
              children: __("descargar")
            }
          )
        ] })
      ] })
    ] })
  ] });
}
export {
  Index as default
};
