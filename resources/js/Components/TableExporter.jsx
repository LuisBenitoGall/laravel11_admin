import React from 'react';

// Hooks:
import { useTranslation } from '@/Hooks/useTranslation.js';

const TableExporter = ({ fetchData, columns, filename = 'export' }) => {
    const __ = useTranslation();
    const txt_error_csv = __('error_export_csv');
    const txt_error_pdf = __('error_export_pdf');
    const txt_export_csv = __('export_csv');

    // Limpiar HTML si se detecta contenido con etiquetas:
    const cleanHtml = (html) => {
        if (typeof html !== 'string') return html;
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    };

    // Helper para normalizar el array de datos
    const normalizeDataArray = (data) => {
        if (Array.isArray(data)) return data;

        if (data && Array.isArray(data.data)) {
            return data.data;
        }

        if (data && typeof data === 'object') {
            const arrKey = Object.keys(data).find(k => Array.isArray(data[k]));
            if (arrKey) return data[arrKey];
        }

        throw new Error('Los datos exportados no son un array.');
    };

    /** Valor escalar/lista/objeto → string para CSV (RFC 4180 campo ya escapado aparte). */
    const cellToCsvString = (value, col) => {
        let v = value;
        if (col.export === 'html') {
            v = cleanHtml(v);
        }
        if (v === null || v === undefined) {
            return '';
        }
        if (typeof v === 'object') {
            return JSON.stringify(v);
        }
        return String(v);
    };

    const escapeCsvField = (str) => {
        const s = str == null ? '' : String(str);
        if (/[",\r\n]/.test(s)) {
            return `"${s.replace(/"/g, '""')}"`;
        }
        return s;
    };

    // Exportar a CSV (UTF-8 con BOM para Excel en Windows; file-saver)
    const exportToCsv = async () => {
        try {
            let data = await fetchData();
            data = normalizeDataArray(data);

            const { saveAs } = await import('file-saver');

            const headerLine = columns.map(col => escapeCsvField(col.label)).join(',');
            const bodyLines = data.map(row =>
                columns
                    .map(col => escapeCsvField(cellToCsvString(row[col.key], col)))
                    .join(',')
            );

            const csvBody = [headerLine, ...bodyLines].join('\r\n');
            const blob = new Blob([`\uFEFF${csvBody}`], { type: 'text/csv;charset=utf-8' });

            saveAs(blob, `${filename}.csv`);
        } catch (error) {
            alert(txt_error_csv + ' ' + (error?.message || ''));
            console.error(txt_error_csv, error);
        }
    };

    // Exportar a PDF (carga diferida de jsPDF y autotable)
    const exportToPDF = async () => {
        try {
            let data = await fetchData();
            data = normalizeDataArray(data);

            const [{ default: jsPDF }, autoTableModule] = await Promise.all([
                import('jspdf'),
                import('jspdf-autotable'),
            ]);

            const autoTable = autoTableModule.default || autoTableModule; // por si cambia el export
            const doc       = new jsPDF();

            const headers = columns.map(col => col.label);
            const rows    = data.map(row =>
                columns.map(col => {
                    const value = row[col.key];

                    if (col.export === 'html') {
                        return cleanHtml(value);
                    }

                    return value;
                })
            );

            autoTable(doc, {
                head: [headers],
                body: rows,
                styles: { fontSize: 8 },
                headStyles: { fillColor: [91, 201, 214] },
            });

            doc.save(`${filename}.pdf`);
        } catch (error) {
            alert(txt_error_pdf + ' ' + (error?.message || ''));
            console.error(txt_error_pdf, error);
        }
    };

    return (
        <div className="d-flex align-items-center ms-4">
            <div className="ms-auto d-flex gap-2">
                <button type="button" onClick={exportToCsv} className="btn btn-primary btn-rdn">
                    {txt_export_csv}
                </button>
                <button type="button" onClick={exportToPDF} className="btn btn-primary btn-rdn">
                    PDF
                </button>
            </div>
        </div>
    );
};

export default TableExporter;
