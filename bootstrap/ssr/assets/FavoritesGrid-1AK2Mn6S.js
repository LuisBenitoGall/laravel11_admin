import { jsx, jsxs } from "react/jsx-runtime";
import "react";
import { Link, router } from "@inertiajs/react";
import { u as useSweetAlert } from "./useSweetAlert-D4PAsWYN.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import "sweetalert2";
const isInternal = (url) => {
  try {
    const u = new URL(url, window.location.origin);
    return u.origin === window.location.origin;
  } catch {
    return url == null ? void 0 : url.startsWith("/");
  }
};
function FavoritesGrid({ favorites }) {
  const __ = useTranslation();
  const { showConfirm } = useSweetAlert();
  if (!Array.isArray(favorites) || favorites.length === 0) {
    return /* @__PURE__ */ jsx("p", { className: "text-muted", children: __("favoritos_sin") });
  }
  const doRemove = (id) => {
    router.get(route("user-preferences.destroy", id), {}, {
      preserveScroll: true,
      onSuccess: () => router.reload({ only: ["favorites"] })
    });
  };
  const confirmRemove = (id, name) => {
    showConfirm({
      title: __("favorito_eliminar") || "¿Eliminar favorito?",
      text: __("favorito_eliminar_confirm") || `Vas a eliminar "${name}".`,
      icon: "warning",
      confirmButtonText: __("eliminar") || "Eliminar",
      cancelButtonText: __("cancelar") || "Cancelar",
      onConfirm: () => doRemove(id)
    });
  };
  const cap = (s) => typeof s === "string" && s.length ? s.charAt(0).toUpperCase() + s.slice(1) : "";
  return /* @__PURE__ */ jsx("div", { className: "row g-3", children: favorites.map((f) => {
    const bg = f.module_color || "#0d6efd";
    const icon = f.module_icon || "bookmark";
    const moduleLabel = cap(f.module_label);
    const internal = isInternal(f.url);
    return /* @__PURE__ */ jsx("div", { className: "col-12 col-sm-6 col-md-3 col-lg-2", children: /* @__PURE__ */ jsxs(
      "div",
      {
        className: "card border-0 shadow-sm h-100 position-relative",
        style: { backgroundColor: bg, borderRadius: 12 },
        children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              onClick: (e) => {
                e.preventDefault();
                e.stopPropagation();
                confirmRemove(f.id, f.name);
              },
              className: "btn btn-sm position-absolute top-0 end-0 text-white",
              style: { padding: "6px", opacity: 0.9, zIndex: 2 },
              "aria-label": __("eliminar_favorito") || "Eliminar favorito",
              title: __("eliminar_favorito") || "Eliminar favorito",
              children: /* @__PURE__ */ jsx("i", { className: "la la-times" })
            }
          ),
          internal ? /* @__PURE__ */ jsx(Link, { href: f.url, className: "stretched-link", preserveScroll: true }) : /* @__PURE__ */ jsx("a", { href: f.url, className: "stretched-link", target: "_blank", rel: "noopener noreferrer" }),
          /* @__PURE__ */ jsxs(
            "div",
            {
              className: "card-body d-flex flex-column align-items-center justify-content-center text-center",
              style: { minHeight: 160 },
              children: [
                /* @__PURE__ */ jsx("i", { className: `la la-${icon}`, style: { fontSize: 48, lineHeight: 1, color: "#fff" } }),
                /* @__PURE__ */ jsx("div", { className: "fw-semibold mt-3", style: { color: "#fff" }, children: f.name }),
                moduleLabel ? /* @__PURE__ */ jsx("div", { className: "small mt-1", style: { color: "#fff", opacity: 0.9 }, children: moduleLabel }) : null
              ]
            }
          )
        ]
      }
    ) }, f.id);
  }) });
}
export {
  FavoritesGrid as default
};
