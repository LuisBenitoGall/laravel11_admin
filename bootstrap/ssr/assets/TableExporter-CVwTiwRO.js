import { jsx, jsxs } from "react/jsx-runtime";
import "react";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
const TableExporter = ({ fetchData, columns, filename = "export" }) => {
  const __ = useTranslation();
  const txt_error_csv = __("error_export_csv");
  const txt_error_pdf = __("error_export_pdf");
  const txt_export_csv = __("export_csv");
  const cleanHtml = (html) => {
    if (typeof html !== "string") return html;
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };
  const normalizeDataArray = (data) => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.data)) {
      return data.data;
    }
    if (data && typeof data === "object") {
      const arrKey = Object.keys(data).find((k) => Array.isArray(data[k]));
      if (arrKey) return data[arrKey];
    }
    throw new Error("Los datos exportados no son un array.");
  };
  const cellToCsvString = (value, col) => {
    let v = value;
    if (col.export === "html") {
      v = cleanHtml(v);
    }
    if (v === null || v === void 0) {
      return "";
    }
    if (typeof v === "object") {
      return JSON.stringify(v);
    }
    return String(v);
  };
  const escapeCsvField = (str) => {
    const s = str == null ? "" : String(str);
    if (/[",\r\n]/.test(s)) {
      return `"${s.replace(/"/g, '""')}"`;
    }
    return s;
  };
  const exportToCsv = async () => {
    try {
      let data = await fetchData();
      data = normalizeDataArray(data);
      const { saveAs } = await import("file-saver");
      const headerLine = columns.map((col) => escapeCsvField(col.label)).join(",");
      const bodyLines = data.map(
        (row) => columns.map((col) => escapeCsvField(cellToCsvString(row[col.key], col))).join(",")
      );
      const csvBody = [headerLine, ...bodyLines].join("\r\n");
      const blob = new Blob([`\uFEFF${csvBody}`], { type: "text/csv;charset=utf-8" });
      saveAs(blob, `${filename}.csv`);
    } catch (error) {
      alert(txt_error_csv + " " + ((error == null ? void 0 : error.message) || ""));
      console.error(txt_error_csv, error);
    }
  };
  const exportToPDF = async () => {
    try {
      let data = await fetchData();
      data = normalizeDataArray(data);
      const [{ default: jsPDF }, autoTableModule] = await Promise.all([
        import("jspdf"),
        import("jspdf-autotable")
      ]);
      const autoTable = autoTableModule.default || autoTableModule;
      const doc = new jsPDF();
      const headers = columns.map((col) => col.label);
      const rows = data.map(
        (row) => columns.map((col) => {
          const value = row[col.key];
          if (col.export === "html") {
            return cleanHtml(value);
          }
          return value;
        })
      );
      autoTable(doc, {
        head: [headers],
        body: rows,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [91, 201, 214] }
      });
      doc.save(`${filename}.pdf`);
    } catch (error) {
      alert(txt_error_pdf + " " + ((error == null ? void 0 : error.message) || ""));
      console.error(txt_error_pdf, error);
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "d-flex align-items-center ms-4", children: /* @__PURE__ */ jsxs("div", { className: "ms-auto d-flex gap-2", children: [
    /* @__PURE__ */ jsx("button", { type: "button", onClick: exportToCsv, className: "btn btn-primary btn-rdn", children: txt_export_csv }),
    /* @__PURE__ */ jsx("button", { type: "button", onClick: exportToPDF, className: "btn btn-primary btn-rdn", children: "PDF" })
  ] }) });
};
export {
  TableExporter as T
};
