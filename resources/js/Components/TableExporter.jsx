import React from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

//Hooks:    
import { useTranslation } from '@/Hooks/useTranslation.js';

const TableExporter = ({ fetchData, columns, filename = 'export' }) => {
    const __ = useTranslation();
    //Traducciones:
    const txt_datos = __('datos');
    const txt_error_excel = __('error_export_excel');
    const txt_error_pdf = __('error_export_pdf');

    // Limpiar HTML si se detecta contenido con etiquetas:
    const cleanHtml = (html) => {
        if (typeof html !== 'string') return html;
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    };

    //Exportar a Excel:
    const exportToExcel = async () => { 
        try {
            let data = await fetchData(); // Obtener todos los registros antes de exportar
            console.log('TableExporter fetchData result:', data);
            if (!Array.isArray(data)) {
                if (data && Array.isArray(data.data)) {
                    data = data.data;
                } else if (data && typeof data === 'object') {
                    // Buscar la primera propiedad array
                    const arrKey = Object.keys(data).find(k => Array.isArray(data[k]));
                    if (arrKey) {
                        data = data[arrKey];
                    } else {
                        throw new Error('Los datos exportados no son un array.');
                    }
                } else {
                    throw new Error('Los datos exportados no son un array.');
                }
            }
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet(txt_datos);
            
            const headers = columns.map(col => col.label);
            worksheet.addRow(headers);

            data.forEach(row => {
                const excelRow = columns.map(col => {
                    const value = row[col.key];

                    if (col.export === 'html') {
                        return cleanHtml(value);
                    }

                    return value;
                });
                worksheet.addRow(excelRow);
            });

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            saveAs(blob, `${filename}.xlsx`);
            
        } catch (error) {
            alert(txt_error_excel + ' ' + (error?.message || ''));
            console.error(txt_error_excel, error);
        }
    };

    //Exportar a PDF:
    const exportToPDF = async () => {
        try {
            let data = await fetchData(); // Obtener todos los registros antes de exportar
            console.log('TableExporter fetchData result:', data);
            if (!Array.isArray(data)) {
                if (data && Array.isArray(data.data)) {
                    data = data.data;
                } else if (data && typeof data === 'object') {
                    // Buscar la primera propiedad array
                    const arrKey = Object.keys(data).find(k => Array.isArray(data[k]));
                    if (arrKey) {
                        data = data[arrKey];
                    } else {
                        throw new Error('Los datos exportados no son un array.');
                    }
                } else {
                    throw new Error('Los datos exportados no son un array.');
                }
            }
            const doc = new jsPDF();
            
            const headers = columns.map(col => col.label);
            const rows = data.map(row => 
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
                styles: {
                    fontSize: 8
                },
                headStyles: {
                    fillColor: [91, 201, 214]
                }
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
                <button onClick={exportToExcel} className="btn btn-primary btn-rdn">
                    Excel
                </button>
                <button onClick={exportToPDF} className="btn btn-primary btn-rdn">
                    PDF
                </button>
            </div>
        </div>
    );
};

export default TableExporter;
