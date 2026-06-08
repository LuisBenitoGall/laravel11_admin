import { jsx, jsxs } from "react/jsx-runtime";
import "react";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
const TableExporter = ({ fetchData, columns, filename = "export" }) => {
  const __ = useTranslation();
  const txt_error_csv = __("error_export_csv");
  const txt_error_pdf = __("error_export_pdf");
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
  const cellToValue = (value, col) => {
    let v = col.export === "html" ? cleanHtml(value) : value;
    if (v === null || v === void 0) return "";
    if (typeof col.exportValue === "function") return col.exportValue(v);
    if (typeof v === "object") return JSON.stringify(v);
    return v;
  };
  const exportToExcel = async () => {
    try {
      let data = await fetchData();
      data = normalizeDataArray(data);
      const [XLSX, { saveAs }] = await Promise.all([
        import("xlsx"),
        import("file-saver")
      ]);
      const exportCols = columns.filter((col) => !col.noExport);
      const header = exportCols.map((col) => col.label);
      const body = data.map((row) => exportCols.map((col) => cellToValue(row[col.key], col)));
      const ws = XLSX.utils.aoa_to_sheet([header, ...body]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([wbout], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      });
      saveAs(blob, `${filename}.xlsx`);
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
      const exportCols = columns.filter((col) => !col.noExport);
      const headers = exportCols.map((col) => col.label);
      const rows = data.map(
        (row) => exportCols.map((col) => cellToValue(row[col.key], col))
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
    /* @__PURE__ */ jsx("button", { type: "button", onClick: exportToExcel, className: "btn btn-primary btn-rdn", children: "Excel" }),
    /* @__PURE__ */ jsx("button", { type: "button", onClick: exportToPDF, className: "btn btn-primary btn-rdn", children: "PDF" })
  ] }) });
};
export {
  TableExporter as T
};
