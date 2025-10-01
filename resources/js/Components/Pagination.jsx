import { Link } from '@inertiajs/react';

//Hooks:
import { useTranslation } from '@/Hooks/useTranslation';
//import __ from '@/Hooks/useTranslation';

export function Pagination({ links = [], totalRecords = 0, currentPage = 1, perPage = 10, onPageChange }) {
    const __ = useTranslation();
    // Cálculo del rango de registros mostrados actualmente
    const startRecord = (currentPage - 1) * perPage + 1;
    const endRecord = Math.min(currentPage * perPage, totalRecords);

    // Manejo del clic en los enlaces de paginación
    const handleClick = (e, url, label) => {
        e.preventDefault();
        if (!url || !onPageChange) return;

        // Extraer el número de página desde el parámetro `page` de la URL
        const urlObj = new URL(url, window.location.origin);
        const page = urlObj.searchParams.get('page');
        if (page) {
            onPageChange(Number(page));
        }
    };

    return (
        <div className="row mt-4" id="pagination">
            {/* Total de registros mostrados */}
            <div className="col-lg-4 mb-4">
                {__('registros')} {startRecord} - {endRecord} {__('de')} {totalRecords}
            </div>

            {/* Botones de navegación */}
            <div className="col-lg-8 text-start text-lg-end">
                {links.map((link, index) => (
                    <Link
                        href={link.url || ""}
                        key={`${link.label}-${index}`}
                        preserveScroll
                        className={
                            "btn btn-sm mx-1 mb-1 " +
                            (link.active ? "btn-secondary" : "btn-info") +
                            (!link.url ? " disabled" : "")
                        }
                        onClick={(e) => handleClick(e, link.url, link.label)}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ))}
            </div>
        </div>
    );
}
