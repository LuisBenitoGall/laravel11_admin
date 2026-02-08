import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import React from "react";
import { Link } from "@inertiajs/react";
import { parseISO, format } from "date-fns";
import { OverlayTrigger, Popover } from "react-bootstrap";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
function PhonesCell({ phones = [] }) {
  const __ = useTranslation();
  const list = Array.isArray(phones) ? phones : [];
  if (!list.length) {
    return "—";
  }
  const primary = list.find((p) => p && p.is_primary) || list[0];
  const others = list.filter((p) => p !== primary);
  const moreCount = others.length;
  const popoverTitle = moreCount === 1 ? __("telefono_mas") : `${moreCount} ${__("telefonos_mas")}`;
  const badgeLabel = moreCount === 1 ? __("badge_1_mas") : `${moreCount} ${__("badge_mas")}`;
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    (primary == null ? void 0 : primary.e164) || "",
    (primary == null ? void 0 : primary.is_whatsapp) && /* @__PURE__ */ jsx("i", { className: "lab la-whatsapp ms-2", "aria-hidden": "true" }),
    moreCount > 0 && /* @__PURE__ */ jsx(
      OverlayTrigger,
      {
        trigger: ["hover", "focus"],
        placement: "auto",
        overlay: /* @__PURE__ */ jsxs(Popover, { id: "phones-popover", className: "phones-cell-popover", children: [
          /* @__PURE__ */ jsx(Popover.Header, { as: "h6", children: popoverTitle }),
          /* @__PURE__ */ jsx(Popover.Body, { className: "d-flex flex-column gap-1", children: others.map((p, i) => /* @__PURE__ */ jsxs("span", { className: "text-nowrap", children: [
            (p == null ? void 0 : p.e164) || "",
            (p == null ? void 0 : p.is_whatsapp) && /* @__PURE__ */ jsx("i", { className: "lab la-whatsapp ms-1", "aria-hidden": "true" })
          ] }, i)) })
        ] }),
        children: /* @__PURE__ */ jsx(
          "span",
          {
            className: "badge bg-secondary ms-2",
            style: { cursor: "pointer" },
            role: "button",
            tabIndex: 0,
            "aria-label": popoverTitle,
            children: badgeLabel
          }
        )
      }
    )
  ] });
}
function renderCellContent(value, column, rowData = {}) {
  var _a;
  if (column.render && typeof column.render === "function") {
    return column.render({ value, rowData });
  }
  if (column.type === "image") {
    const possible = [
      rowData.logo_url,
      rowData.logo,
      rowData.avatar_url,
      (_a = rowData.avatar) == null ? void 0 : _a.url,
      rowData.image,
      value
    ];
    const logoUrl = possible.find((v) => typeof v === "string" && v.length) || null;
    if (logoUrl) {
      return /* @__PURE__ */ jsx(
        "img",
        {
          src: logoUrl,
          alt: column.name || "",
          style: {
            width: "30px",
            height: "30px",
            objectFit: "cover",
            borderRadius: "50%"
          }
        }
      );
    }
    if (column.icon) {
      return /* @__PURE__ */ jsx("i", { className: `la la-${column.icon} text-muted`, style: { fontSize: "24px" } });
    }
    return "";
  }
  if (column.key === "categories" && Array.isArray(value)) {
    return /* @__PURE__ */ jsx("div", { className: "d-flex flex-wrap gap-1", children: value.map((cat, i) => /* @__PURE__ */ jsx("span", { className: "badge bg-primary text-light", children: cat }, i)) });
  }
  if (column.key === "companies" && Array.isArray(value)) {
    if (!value.length) {
      return "—";
    }
    return /* @__PURE__ */ jsx(Fragment, { children: value.map((company, index) => /* @__PURE__ */ jsxs(React.Fragment, { children: [
      index > 0 && ", ",
      /* @__PURE__ */ jsx(Link, { href: company.link, className: "link-text", children: company.name })
    ] }, company.id || index)) });
  }
  if (column.key === "phones") {
    return /* @__PURE__ */ jsx(PhonesCell, { phones: value });
  }
  if (column.type === "link") {
    if (value) {
      let href = "#";
      try {
        if (typeof column.link === "function") {
          href = column.link(rowData) || "#";
        } else if (typeof column.link === "string") {
          let params = {};
          if (typeof column.buildParams === "function") {
            params = column.buildParams(rowData) || {};
          } else if (rowData && rowData.__routeParams && !Array.isArray(rowData.__routeParams)) {
            params = rowData.__routeParams;
          } else if (column.routeParams && !Array.isArray(column.routeParams)) {
            params = column.routeParams;
          }
          try {
            href = route(column.link, params);
          } catch (errNamed) {
            if ((rowData == null ? void 0 : rowData.id) != null) {
              try {
                href = route(column.link, rowData.id);
              } catch (errPositional) {
                console.warn("[renderCellContent] Ruta inválida:", column.link, { params, id: rowData == null ? void 0 : rowData.id }, errPositional);
              }
            } else {
              console.warn("[renderCellContent] Parámetros insuficientes para ruta:", column.link, params, errNamed);
            }
          }
        } else {
          href = String(value);
        }
      } catch (fatal) {
        console.warn("[renderCellContent] Error generando href:", fatal);
        href = "#";
      }
      return /* @__PURE__ */ jsx(Link, { href, className: "link-text", children: value });
    }
    return "";
  }
  const looksLikeDateKey = typeof column.key === "string" && /date|created_at|updated_at|birth/i.test(column.key);
  if (column.filter === "date" || looksLikeDateKey) {
    if (typeof value === "string" && value.length) {
      try {
        const dt = parseISO(value);
        return format(dt, "dd/MM/yyyy");
      } catch (e) {
        try {
          const dt2 = new Date(value);
          if (!isNaN(dt2)) return format(dt2, "dd/MM/yyyy");
        } catch (e2) {
        }
      }
    }
  }
  const isBooleanLike = (val) => {
    if (typeof val === "number") return val === 0 || val === 1;
    if (typeof val === "string") {
      const v = val.trim().toLowerCase();
      return ["0", "1", "true", "false", "yes", "no", "si", "sí"].includes(v);
    }
    return false;
  };
  if (typeof value === "boolean") {
    return value ? /* @__PURE__ */ jsx("i", { className: "la la-check text-success" }) : /* @__PURE__ */ jsx("i", { className: "la la-ban text-danger" });
  }
  if (column.booleanLike && isBooleanLike(value)) {
    let v = value;
    if (typeof v === "string") v = v.trim().toLowerCase();
    if (v === 1 || v === "1" || v === "true" || v === "yes" || v === "si" || v === "sí") {
      return /* @__PURE__ */ jsx("i", { className: "la la-check text-success" });
    }
    if (v === 0 || v === "0" || v === "false" || v === "no") {
      return /* @__PURE__ */ jsx("i", { className: "la la-ban text-danger" });
    }
  }
  if (column.currency && column.currency.symbol) {
    return /* @__PURE__ */ jsxs("span", { children: [
      value,
      " ",
      /* @__PURE__ */ jsx("span", { className: "text-muted", children: column.currency.symbol })
    ] });
  }
  if (column.type === "html" && typeof value === "string") {
    return /* @__PURE__ */ jsx("div", { dangerouslySetInnerHTML: { __html: value } });
  }
  if (Array.isArray(value)) {
    const items = value.map((v) => {
      if (v && typeof v === "object") {
        return v.phone ?? v.number ?? v.value ?? JSON.stringify(v);
      }
      return v;
    }).filter(Boolean);
    return items.join(", ");
  }
  if (value === null || value === void 0 || value === "") {
    return "";
  }
  if (typeof value === "object") {
    if ("name" in value || "surname" in value) {
      return [value.name, value.surname].filter(Boolean).join(" ");
    }
    if ("label" in value) return value.label;
    if ("title" in value) return value.title;
    if ("email" in value) return value.email;
    try {
      return JSON.stringify(value);
    } catch (e) {
      return String(value);
    }
  }
  return value;
}
export {
  renderCellContent as r
};
