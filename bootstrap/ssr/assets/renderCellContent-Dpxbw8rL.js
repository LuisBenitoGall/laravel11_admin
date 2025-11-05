import { jsx, jsxs } from "react/jsx-runtime";
import "react";
import { Link } from "@inertiajs/react";
import { parseISO, format } from "date-fns";
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
  if (column.type === "link") {
    if (value) {
      let href = "#";
      if (typeof column.link === "function") {
        href = column.link(rowData);
      } else if (typeof column.link === "string") {
        href = route(column.link, rowData.id);
      } else {
        href = value;
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
  return value;
}
export {
  renderCellContent as r
};
