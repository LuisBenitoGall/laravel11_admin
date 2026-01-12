import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { useState, useRef, useMemo, useEffect } from "react";
import axios from "axios";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import "@inertiajs/react";
function RemoteCarousel({
  // Data
  fetchUrl = null,
  fetchMethod = "get",
  fetchParams = null,
  fetchHeaders = null,
  items = null,
  // si se pasa, NO hace fetch
  transformResponse = (res) => {
    var _a;
    return ((_a = res == null ? void 0 : res.data) == null ? void 0 : _a.images) ?? (res == null ? void 0 : res.data) ?? [];
  },
  // Mapping / rendering
  getKey = (item, index) => (item == null ? void 0 : item.id) ?? (item == null ? void 0 : item.uuid) ?? index,
  getSrc = (item) => (item == null ? void 0 : item.url) ?? (item == null ? void 0 : item.src) ?? (item == null ? void 0 : item.path) ?? null,
  getAlt = (item, index) => (item == null ? void 0 : item.alt) ?? (item == null ? void 0 : item.name) ?? `Imagen ${index + 1}`,
  getCaption = (item) => (item == null ? void 0 : item.caption) ?? null,
  renderItem = null,
  // (item, index, helpers) => ReactNode
  // UI
  className = "",
  style = null,
  rounded = true,
  shadow = false,
  height = 220,
  // px (si no usas aspectRatio)
  aspectRatio = null,
  // ej: "16/9" o "4/3". Si se pasa, manda sobre height.
  objectFit = "contain",
  // 'cover' | 'contain'
  background = "#f8f9fa",
  showControls = true,
  showIndicators = true,
  allowKeyboard = true,
  // Autoplay
  autoPlay = false,
  intervalMs = 4500,
  pauseOnHover = true,
  // Empty / loading / error
  loadingText = "Cargando imágenes…",
  emptyText = "Sin imágenes",
  errorText = "No se pudieron cargar las imágenes",
  emptyState = null,
  onLoaded = null,
  // (items) => void
  onError = null,
  // (error) => void
  onItemClick = null
  // (item, index) => void
}) {
  const [remoteItems, setRemoteItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [active, setActive] = useState(0);
  const hoveredRef = useRef(false);
  const timerRef = useRef(null);
  const finalItems = useMemo(() => {
    if (Array.isArray(items)) return items;
    return remoteItems;
  }, [items, remoteItems]);
  const hasItems = Array.isArray(finalItems) && finalItems.length > 0;
  const activeSafe = hasItems ? Math.min(active, finalItems.length - 1) : 0;
  useEffect(() => {
    if (Array.isArray(items)) return;
    if (!fetchUrl) return;
    const ac = new AbortController();
    (async () => {
      var _a, _b;
      setLoading(true);
      setErr(null);
      try {
        const method = String(fetchMethod || "get").toLowerCase();
        const res = await axios.request({
          url: fetchUrl,
          method,
          params: fetchParams ?? void 0,
          headers: fetchHeaders ?? void 0,
          signal: ac.signal
        });
        const list = transformResponse(res) ?? [];
        const arr = Array.isArray(list) ? list : [];
        setRemoteItems(arr);
        setActive(0);
        onLoaded == null ? void 0 : onLoaded(arr);
      } catch (e) {
        if (((_b = (_a = axios).isCancel) == null ? void 0 : _b.call(_a, e)) || (e == null ? void 0 : e.name) === "CanceledError") return;
        setErr(e);
        onError == null ? void 0 : onError(e);
      } finally {
        setLoading(false);
      }
    })();
    return () => {
      ac.abort();
    };
  }, [items, fetchUrl, fetchMethod, fetchParams, fetchHeaders, transformResponse, onLoaded, onError]);
  useEffect(() => {
    if (!autoPlay) return;
    if (!hasItems) return;
    if (finalItems.length <= 1) return;
    const clear = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
    clear();
    timerRef.current = setInterval(() => {
      if (pauseOnHover && hoveredRef.current) return;
      setActive((prev2) => (prev2 + 1) % finalItems.length);
    }, Math.max(1200, Number(intervalMs) || 4500));
    return clear;
  }, [autoPlay, intervalMs, pauseOnHover, hasItems, finalItems]);
  useEffect(() => {
    if (!allowKeyboard) return;
    if (!hasItems || finalItems.length <= 1) return;
    const onKeyDown = (e) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [allowKeyboard, hasItems, finalItems.length]);
  const prev = () => {
    if (!hasItems) return;
    setActive((p) => (p - 1 + finalItems.length) % finalItems.length);
  };
  const next = () => {
    if (!hasItems) return;
    setActive((p) => (p + 1) % finalItems.length);
  };
  const containerStyle = useMemo(() => {
    const base = {
      background,
      overflow: "hidden",
      ...rounded ? { borderRadius: "0.75rem" } : null,
      ...shadow ? { boxShadow: "0 .25rem .75rem rgba(0,0,0,.08)" } : null,
      ...style ?? null
    };
    if (aspectRatio) {
      base.aspectRatio = String(aspectRatio);
      base.width = "100%";
    } else {
      base.height = Number(height) || 220;
      base.width = "100%";
    }
    return base;
  }, [background, rounded, shadow, style, aspectRatio, height]);
  const helpers = useMemo(() => ({
    next,
    prev,
    setActive,
    active: activeSafe,
    count: (finalItems == null ? void 0 : finalItems.length) ?? 0
  }), [activeSafe, finalItems]);
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: `d-flex align-items-center justify-content-center ${className}`, style: containerStyle, children: /* @__PURE__ */ jsx("div", { className: "text-muted small", children: loadingText }) });
  }
  if (err) {
    return /* @__PURE__ */ jsxs("div", { className: `d-flex flex-column align-items-center justify-content-center ${className}`, style: containerStyle, children: [
      /* @__PURE__ */ jsx("div", { className: "text-danger small", children: errorText }),
      /* @__PURE__ */ jsx("div", { className: "text-muted small mt-1", children: String((err == null ? void 0 : err.message) ?? "") })
    ] });
  }
  if (!hasItems) {
    return /* @__PURE__ */ jsx("div", { className: `d-flex align-items-center justify-content-center ${className}`, style: containerStyle, children: emptyState ?? /* @__PURE__ */ jsx("div", { className: "text-muted small", children: emptyText }) });
  }
  const item = finalItems[activeSafe];
  const src = getSrc(item);
  const alt = getAlt(item, activeSafe);
  const caption = getCaption(item);
  return /* @__PURE__ */ jsxs(
    "div",
    {
      className: `position-relative ${className}`,
      style: containerStyle,
      onMouseEnter: () => {
        hoveredRef.current = true;
      },
      onMouseLeave: () => {
        hoveredRef.current = false;
      },
      children: [
        /* @__PURE__ */ jsx("div", { className: "w-100 h-100 d-flex align-items-center justify-content-center", children: renderItem ? renderItem(item, activeSafe, helpers) : /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            className: "btn p-0 border-0 w-100 h-100",
            style: { background: "transparent" },
            onClick: () => onItemClick == null ? void 0 : onItemClick(item, activeSafe),
            title: alt,
            children: src ? /* @__PURE__ */ jsx(
              "img",
              {
                src,
                alt,
                className: "w-100 h-100",
                style: { objectFit, display: "block" },
                loading: "lazy"
              }
            ) : /* @__PURE__ */ jsx("div", { className: "text-muted small", children: "Imagen sin URL" })
          }
        ) }),
        caption ? /* @__PURE__ */ jsx("div", { className: "position-absolute bottom-0 start-0 end-0 px-2 py-1", style: { background: "rgba(0,0,0,.35)" }, children: /* @__PURE__ */ jsx("div", { className: "text-white small text-truncate", children: caption }) }) : null,
        showControls && finalItems.length > 1 ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "btn btn-light btn-sm position-absolute top-50 start-0 translate-middle-y ms-2",
              onClick: prev,
              "aria-label": "Anterior",
              title: "Anterior",
              children: "‹"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "btn btn-light btn-sm position-absolute top-50 end-0 translate-middle-y me-2",
              onClick: next,
              "aria-label": "Siguiente",
              title: "Siguiente",
              children: "›"
            }
          )
        ] }) : null,
        showIndicators && finalItems.length > 1 ? /* @__PURE__ */ jsx("div", { className: "position-absolute bottom-0 start-50 translate-middle-x pb-2 d-flex gap-1", children: finalItems.map((it, idx) => {
          const key = getKey(it, idx);
          const isActive = idx === activeSafe;
          return /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: `btn p-0 border-0`,
              onClick: () => setActive(idx),
              "aria-label": `Ir a ${idx + 1}`,
              title: `Ir a ${idx + 1}`,
              style: {
                width: 10,
                height: 10,
                borderRadius: 999,
                opacity: isActive ? 0.95 : 0.35,
                background: isActive ? "#fff" : "#fff"
              }
            },
            key
          );
        }) }) : null
      ]
    }
  );
}
function ProductImagesCarousel({
  fetchUrl,
  images = null,
  // si ya las tienes en props, pásalas aquí y no hará fetch
  height = 220,
  aspectRatio = null,
  objectFit = "contain",
  className = "",
  showIndicators = true,
  showControls = true,
  autoPlay = false,
  intervalMs = 4500,
  onItemClick = null
}) {
  return /* @__PURE__ */ jsx(
    RemoteCarousel,
    {
      fetchUrl,
      items: images,
      height,
      aspectRatio,
      objectFit,
      className,
      showIndicators,
      showControls,
      autoPlay,
      intervalMs,
      emptyText: "Este producto no tiene imágenes",
      getKey: (img, i) => (img == null ? void 0 : img.id) ?? i,
      getSrc: (img) => (img == null ? void 0 : img.url) ?? (img == null ? void 0 : img.full_url) ?? (img == null ? void 0 : img.path) ?? null,
      getAlt: (img, i) => (img == null ? void 0 : img.alt) ?? (img == null ? void 0 : img.name) ?? `Imagen ${i + 1}`,
      getCaption: (img) => (img == null ? void 0 : img.caption) ?? null,
      onItemClick,
      transformResponse: (res) => {
        var _a;
        return ((_a = res == null ? void 0 : res.data) == null ? void 0 : _a.images) ?? [];
      }
    }
  );
}
function ProductShowView({ record }) {
  const __ = useTranslation();
  const product = record;
  const ref = product.ref ?? product.manual_ref ?? "";
  return /* @__PURE__ */ jsxs("div", { className: "contact-show-view", children: [
    /* @__PURE__ */ jsxs("div", { className: "d-flex justify-content-between align-items-start mb-3", children: [
      /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsxs("h4", { className: "mb-1", children: [
        product.name,
        ref ? ` ${ref}` : ""
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "btn-group", children: /* @__PURE__ */ jsxs(
        "a",
        {
          href: route("products.edit", { product: product.id }),
          className: "btn btn-sm btn-primary",
          children: [
            /* @__PURE__ */ jsx("i", { className: "la la-edit me-1" }),
            __("editar")
          ]
        }
      ) })
    ] }),
    /* @__PURE__ */ jsx("hr", {}),
    /* @__PURE__ */ jsxs("div", { className: "vertical-scroll", children: [
      /* @__PURE__ */ jsx("div", { className: "row mb-4", children: /* @__PURE__ */ jsxs("div", { className: "col-md-9", children: [
        /* @__PURE__ */ jsx("h5", { className: "mb-3", children: __("datos_basicos") }),
        ref && /* @__PURE__ */ jsxs("p", { className: "mb-1", children: [
          /* @__PURE__ */ jsx("strong", { children: "Ref:" }),
          " ",
          ref
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "mb-1", children: [
          /* @__PURE__ */ jsxs("strong", { children: [
            __("fecha_creacion"),
            ":"
          ] }),
          " ",
          product.formatted_created_at ?? ""
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "mb-1", children: [
          /* @__PURE__ */ jsxs("strong", { children: [
            __("creado_por"),
            ":"
          ] }),
          " ",
          product.created_by_name ?? ""
        ] })
      ] }) }),
      /* @__PURE__ */ jsx("hr", {}),
      /* @__PURE__ */ jsx("div", { className: "row mb-4", children: /* @__PURE__ */ jsxs("div", { className: "col-12", children: [
        /* @__PURE__ */ jsx("h5", { className: "mb-3", children: __("imagenes") }),
        /* @__PURE__ */ jsx(
          ProductImagesCarousel,
          {
            fetchUrl: route("product-docs.show", product.id),
            height: 200,
            objectFit: "cover",
            showIndicators: true,
            showControls: true,
            autoPlay: false
          }
        )
      ] }) }),
      /* @__PURE__ */ jsx("hr", {})
    ] })
  ] });
}
export {
  ProductShowView as default
};
