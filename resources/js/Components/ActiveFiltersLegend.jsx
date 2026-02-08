import React from 'react';
import { router, usePage } from '@inertiajs/react';

// Hooks
import { useTranslation } from '@/Hooks/useTranslation';

const cleanParams = (obj) => {
    const out = {};
    Object.entries(obj || {}).forEach(([k, v]) => {
        if (v === null || v === undefined) return;
        if (typeof v === 'string' && v.trim() === '') return;

        if (Array.isArray(v)) {
            const arr = v.filter(x => !(x === null || x === undefined || (typeof x === 'string' && x.trim() === '')));
            if (arr.length === 0) return;
            out[k] = arr;
            return;
        }

        if (typeof v === 'object') {
            const nested = cleanParams(v);
            if (Object.keys(nested).length === 0) return;
            out[k] = nested;
            return;
        }

        out[k] = v;
    });
    return out;
};

export default function ActiveFiltersLegend({
    items = [],
    routeName,
    routeParams = {},
    queryParams: queryParamsProp,
}) {
    const __ = useTranslation();
    const { props } = usePage();
    const queryParams = (typeof queryParamsProp === 'object' && queryParamsProp !== null)
        ? queryParamsProp
        : (props.queryParams || {});

    if (!Array.isArray(items) || items.length === 0) return null;

    const removeFilter = (item) => {
        if (!item || typeof item !== 'object') return;

        const next = { ...queryParams, page: 1 };

        if (item.scope === 'adhoc') {
            const adhoc = { ...(next.adhoc || {}) };

            const paths = Array.isArray(item.clearPaths) && item.clearPaths.length
                ? item.clearPaths
                : [item.path];

            paths.forEach(p => { delete adhoc[p]; });

            if (Object.keys(cleanParams(adhoc)).length === 0) delete next.adhoc;
            else next.adhoc = adhoc;
        } else {
            // header (o cualquier otra cosa top-level)
            delete next[item.path];
        }

        router.get(route(routeName, routeParams), cleanParams(next), {
            preserveState: true,
            replace: true,
        });
    };

    return (
        <div className="d-flex flex-wrap gap-2 align-items-center">
            <span>{__('filtrado_por')}:</span>

            {items.map((it) => (
                <span
                    key={it.key}
                    className="badge text-bg-light border d-inline-flex align-items-center gap-2"
                >
                    <span>
                        <strong className="me-1">{it.label}:</strong>
                        {it.value}
                    </span>

                    <button
                        type="button"
                        className="btn btn-sm p-0 border-0 bg-transparent"
                        onClick={() => removeFilter(it)}   
                        aria-label={__('filtro_eliminar') ?? 'Eliminar filtro'}
                        title={__('filtro_eliminar') ?? 'Eliminar filtro'}
                        style={{ lineHeight: 1 }}
                    >
                        <span aria-hidden="true">
                            &times;    
                        </span>
                    </button>
                </span>
            ))}
        </div>
    );
}
