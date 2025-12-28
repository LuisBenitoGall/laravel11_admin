import React, { useEffect, useMemo, useState } from 'react';
import { router, usePage } from '@inertiajs/react';
import { toLocalYmd } from '@/Utils/dateHelpers';

// Components
import Checkbox from '@/Components/Checkbox';
import DatePickerToForm from '@/Components/DatePickerToForm';
import LocationSelects from '@/Components/LocationSelects';
import ReusableModal from '@/Components/modals/ModalTemplate';
import SelectSearch from '@/Components/SelectSearch';
import TextInput from '@/Components/TextInput';
import UserSearch from '@/Components/UserSearch';

// Hooks
import { useTranslation } from '@/Hooks/useTranslation';

const EMPTY_ARR = Object.freeze([]);
const EMPTY_OBJ = Object.freeze({});

const cleanParams = (obj) => {
    const out = {};
    Object.entries(obj || {}).forEach(([k, v]) => {
        if (v === null || v === undefined) return;
        if (typeof v === 'string' && v.trim() === '') return;

        if (Array.isArray(v)) {
            const arr = v.filter(
                (x) => !(x === null || x === undefined || (typeof x === 'string' && x.trim() === ''))
            );
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

export default function AdHocFiltersDropdown({
    filters = [],
    routeName,
    routeParams = {},
    queryParams = EMPTY_OBJ
}) {
    const __ = useTranslation();
    const { props } = usePage();
    const locale = props.locale || false;
    const datepickerFormat = props.languages?.[locale]?.[6] || 'dd/MM/yyyy';

    const enabled = Array.isArray(filters) && filters.length > 0;

    const stableQueryParams =
        queryParams && typeof queryParams === 'object' ? queryParams : EMPTY_OBJ;

    const initialAdhoc = useMemo(() => {
        const adh = stableQueryParams.adhoc;
        return adh && typeof adh === 'object' ? adh : EMPTY_OBJ;
    }, [stableQueryParams]);

    const [open, setOpen] = useState(false);
    const [values, setValues] = useState(initialAdhoc);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (open) setValues(initialAdhoc);
    }, [open, initialAdhoc]);

    const activeCount = useMemo(() => {
        const source = open ? values : initialAdhoc;
        const v = cleanParams(source);
        return Object.keys(v).length;
    }, [open, values, initialAdhoc]);

    if (!enabled) return null;

    // 👇 si no te pasan queryParams, usa el del backend (props.queryParams) y si no, objeto estable
    const qp = useMemo(() => {
        const candidate = queryParams ?? props.queryParams ?? EMPTY_OBJ;
        return (candidate && typeof candidate === 'object') ? candidate : EMPTY_OBJ;
    }, [queryParams, props.queryParams]);

    // Re-sincroniza SOLO cuando está abierto y realmente cambia la referencia base
    useEffect(() => {
        if (!open) return;

        setValues((prev) => {
            if (prev === initialAdhoc) return prev;
            return initialAdhoc;
        });
    }, [open, initialAdhoc]);

    const setValue = (key, v) => {
        setValues((prev) => ({ ...prev, [key]: v }));
    };

    const adhocPayload = { ...values };

    // aplanar user_search (u otros objetos {id,...}) a su id
    Object.keys(adhocPayload).forEach((k) => {
        const v = adhocPayload[k];
        if (v && typeof v === 'object' && Object.prototype.hasOwnProperty.call(v, 'id')) {
            adhocPayload[k] = v.id;
        }
    });

    const apply = () => {
        const merged = {
            ...qp,
            page: 1,
            adhoc: cleanParams(adhocPayload)
        };

        if (Object.keys(merged.adhoc || {}).length === 0) {
            delete merged.adhoc;
        }

        router.get(route(routeName, routeParams), cleanParams(merged), {
            preserveState: true,
            replace: true,
            onStart: () => setProcessing(true),
            onFinish: () => setProcessing(false),
        });

        setOpen(false);
    };

    const clearAll = () => {
        const merged = { ...qp, page: 1 };
        delete merged.adhoc;

        setValues(EMPTY_OBJ);

        router.get(route(routeName, routeParams), cleanParams(merged), {
            preserveState: true,
            replace: true,
            onStart: () => setProcessing(true),
            onFinish: () => setProcessing(false),
        });

        setOpen(false);
    };

    const renderField = (f) => {
        const key = f.key;
        const type = f.type;

        if (type === 'checkbox') {
            return (
                <div className="form-check mt-2">
                    <Checkbox
                        checked={!!values[key]}
                        onChange={(e) => setValue(key, e.target.checked ? 1 : 0)}
                    />
                    <label className="form-check-label ms-2">
                        {f.label}
                    </label>
                </div>
            );
        }

        if (type === 'text') {
            return (
                <>
                    <label className="form-label">{f.label}</label>
                    <TextInput
                        className="form-control"
                        value={values[key] ?? ''}
                        onChange={(e) => setValue(key, e.target.value)}
                        placeholder={f.placeholder || ''}
                    />
                </>
            );
        }

        if (type === 'select') {
            const multiple = !!f.multiple;
            const options = f.options || [];
            const raw = values[key];

            const computeSelected = () => {
                if (multiple) {
                    const arr = Array.isArray(raw) ? raw.map(String) : [];
                    return options.filter(o => arr.includes(String(o.value)));
                }

                const val = (raw && typeof raw === 'object') ? raw.value : raw;
                return options.find(o => String(o.value) === String(val)) || null;
            };

            const selected = computeSelected();

            const onChange = (v) => {
                if (multiple) {
                    const ids = Array.isArray(v)
                        ? v.map(x => x?.value).filter(x => x !== null && x !== undefined && String(x).trim() !== '')
                        : [];
                    setValue(key, ids);
                } else {
                    setValue(key, v?.value ?? '');
                }
            };

            return (
                <>
                    <label className="form-label">{f.label}</label>
                    <SelectSearch
                        options={options}
                        value={selected}
                        onChange={onChange}
                        isMulti={multiple}
                        placeholder=''
                    />
                </>
            );
        }

        if (type === 'daterange') {
            const current = values[key] && typeof values[key] === 'object' ? values[key] : {};

            const onDateChange = (field, date) => {
                setValue(key, {
                    ...current,
                    [field]: date ? toLocalYmd(date) : null,
                });
            };

            return (
                <>
                    <label className="form-label">{f.label}</label>
                    <div className="row g-2">
                        <div className="col-12 col-md-6">
                            <DatePickerToForm
                                name="from"
                                selected={current.from ?? null}
                                dateFormat={datepickerFormat}
                                onChange={onDateChange}
                                placeholder={__('desde')}
                            />
                        </div>
                        <div className="col-12 col-md-6">
                            <DatePickerToForm
                                name="to"
                                selected={current.to ?? null}
                                dateFormat={datepickerFormat}
                                onChange={onDateChange}
                                placeholder={__('hasta')}
                                maxDate={null}
                            />
                        </div>
                    </div>
                </>
            );
        }

        if (type === 'location_selects') {
            const countryKey = f.countryKey || 'country_id';
            const provinceKey = f.provinceKey || 'province_id';
            const townKey = f.townKey || 'town_id';
            const cpKey = f.cpKey || 'cp';

            const setData = (field, value) => setValue(field, value);
            const countries = f.countries || props.countries || EMPTY_ARR;

            return (
                <div className="row g-0">
                    <div className="col-12">
                        <label className="form-label">{f.label}</label>

                        <div className="adhoc-location-wrap">
                            <LocationSelects
                                countries={countries}
                                formData={values}
                                setData={setData}
                                countryField={countryKey}
                                provinceField={provinceKey}
                                townField={townKey}
                                layout="split2x2"
                                labels={{
                                    country: __('pais') ?? 'País',
                                    province: __('provincia') ?? 'Provincia',
                                    town: __('poblacion') ?? 'Población',
                                }}
                                extraRight={
                                    <div>
                                        <label className="form-label">{__('cp') ?? 'Código Postal'}</label>
                                        <TextInput
                                            className="form-control"
                                            value={values[cpKey] ?? ''}
                                            onChange={(e) => setValue(cpKey, e.target.value)}
                                            placeholder=""
                                            maxLength={5}
                                        />
                                    </div>
                                }
                            />
                        </div>
                    </div>
                </div>
            );
        }

        if (type === 'user_search') {
            const raw = values[key] ?? null;

            // UserSearch trabaja mejor con objeto {id,name,email}, pero nosotros guardaremos SOLO el id en la URL.
            // Para no complicarlo, guardamos id y dejamos que el input muestre el name si nos lo pasan en props (opcional).
            // Aquí simplemente: cuando seleccionas, guardas el id.
            return (
                <>
                    <UserSearch
                        label={f.label}
                        name={null} // NO uses hidden input, nosotros controlamos values y query params
                        value={raw && typeof raw === 'object' ? raw : null}
                        onChange={(u) => {
                            // guardamos ID (lo que realmente irá en adhoc[owner_id])
                            setValue(key, u ? u.id : null);
                        }}
                        searchUrl={f.searchUrl}
                        placeholder={f.placeholder || ''}
                        disabled={!!f.disabled}
                        minLength={f.minLength ?? 2}
                        limit={f.limit ?? 10}
                        extraParams={f.extraParams ?? null}
                        allowClear={true}
                    />
                </>
            );
        }

        return (
            <>
                <label className="form-label">{f.label}</label>
                <TextInput
                    className="form-control"
                    value={values[key] ?? ''}
                    onChange={(u) => {
                        // guardamos objeto para que se vea el nombre al reabrir
                        setValue(key, u ? { id: u.id, name: u.name, email: u.email } : null);
                    }}
                />
            </>
        );
    };

    return (
        <>
            <button
                type="button"
                className="btn btn-light ms-2"
                onClick={() => setOpen(true)}
            >
                {__('filtros_avanzados')}
                {activeCount > 0 ? (
                    <span className="badge text-bg-secondary ms-2">{activeCount}</span>
                ) : null}
            </button>

            <ReusableModal
                show={open}
                onClose={() => setOpen(false)}
                onConfirm={apply}
                title={__('filtros_avanzados') ?? __('Filtros avanzados')}
                confirmText={__('aplicar') ?? __('Aplicar')}
                cancelText={__('cancelar') ?? __('Cancelar')}
                dialogClassName="modal-dialog-centered modal-xl modal-dialog-scrollable modal-superwide"
                confirmDisabled={processing}
                confirmLoading={processing}
                footerLeft={
                    <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={clearAll}
                    >
                        {__('limpiar') ?? __('Limpiar')}
                    </button>
                }
            >
                <div className="container-fluid adhoc-filters-modal">
                    <div className="row g-4">
                        {filters.map((f) => {
                            const colClass = f.colClass || "col-12 col-md-6 col-xl-4";
                            return (
                                <div key={f.key} className={colClass}>
                                    {renderField(f)}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </ReusableModal>
        </>
    );
}
