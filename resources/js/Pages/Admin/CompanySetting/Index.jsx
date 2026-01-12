import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect, useMemo } from 'react';
import { OverlayTrigger, Table, Tooltip } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import axios from 'axios';

//Components:
import Checkbox from '@/Components/Checkbox';
import ColorPicker from '@/Components/ColorPicker';
import InfoPopover from '@/Components/InfoPopover';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SelectInput from '@/Components/SelectInput';
import StatusButton from '@/Components/StatusButton';
import TextInput from '@/Components/TextInput';

//Hooks:
import { useTranslation } from '@/Hooks/useTranslation';

function normalizeOptions(input) {
    const out = [];
    if (!input) return out;

    if (Array.isArray(input)) {
        if (input.length && typeof input[0] === 'object') {
            return input.map((item, idx) => {
                const value = item.value ?? item.id ?? item.key ?? idx;
                const label = item.label ?? item.name ?? item.title ?? String(value);
                return { value: String(value), label };
            });
        }
        return input.map((item) => ({ value: String(item), label: String(item) }));
    }

    if (typeof input === 'object') {
        return Object.entries(input).map(([key, value]) => {
            if (value && typeof value === 'object') {
                const v = value.id ?? value.value ?? key;
                const l = value.name ?? value.label ?? value.title ?? String(value);
                return { value: String(v), label: l };
            }
            return { value: String(key), label: String(value) };
        });
    }

    return out;
}

function normalizeLocales(availableLocales) {
    // acepta ["es","en"], [{code,name}], { es:"Español" }
    if (!availableLocales) return [];

    if (Array.isArray(availableLocales)) {
        if (!availableLocales.length) return [];
        if (typeof availableLocales[0] === 'string') {
            return availableLocales.map((code) => ({ value: code, label: code.toUpperCase() }));
        }
        return availableLocales
            .map((x) => ({
                value: String(x.code ?? x.locale ?? x.value ?? ''),
                label: String(x.name ?? x.label ?? x.title ?? (x.code ?? '')).trim(),
            }))
            .filter((x) => x.value);
    }

    if (typeof availableLocales === 'object') {
        return Object.entries(availableLocales).map(([code, name]) => ({
            value: String(code),
            label: String(name),
        }));
    }

    return [];
}

export default function Index({ 
    auth, 
    session, 
    title, 
    subtitle, 
    company, 
    setting,
    currencies,
    queryParams: rawQueryParams = {}, 
    availableLocales,
    languages
}) {
    const __ = useTranslation();
    const queryParams = typeof rawQueryParams === 'object' && rawQueryParams !== null ? rawQueryParams : {};

    const currencyOptions = useMemo(() => {
        // currencies suele venir como [{id,name,code,symbol}]
        if (!Array.isArray(currencies)) return [];
        return currencies.map((c) => ({
            value: String(c.id),
            label: c.name ?? c.code ?? c.symbol ?? `#${c.id}`,
        }));
    }, [currencies]);

    const localeOptions = useMemo(() => normalizeLocales(availableLocales), [availableLocales]);

    const languageOptions = useMemo(() => {
        if (languages && !Array.isArray(languages) && typeof languages === 'object') {
            return Object.entries(languages).map(([code, arr]) => ({
                value: String(code),
                label: String((arr && arr[3]) ? arr[3] : code),
                secondary: arr && arr[0] ? String(arr[0]) : '',
            }));
        }

        if (Array.isArray(languages)) {
            return languages
                .map((opt) => {
                    if (Array.isArray(opt)) {
                        const code = opt[0];
                        const label = opt[3] ?? opt[1] ?? code;
                        const secondary = opt[0] ?? '';
                        return { value: String(code), label: String(label), secondary: String(secondary) };
                    }
                    if (opt && typeof opt === 'object') {
                        return { value: String(opt.value ?? opt.code ?? ''), label: String(opt.label ?? opt.name ?? '') };
                    }
                    return { value: String(opt), label: String(opt) };
                })
                .filter((x) => x.value);
        }

        return localeOptions;
    }, [languages, localeOptions]);

    const initialPublicInfo = useMemo(() => {
        const pi = setting?.public_info || {};
        return {
            business_areas: !!pi.business_areas,
            work_centers: !!pi.work_centers,
            cost_centers: !!pi.cost_centers,

            orders_production_forecasts: !!pi.orders_production_forecasts,
            projects_required: !!pi.projects_required,

            accounting_method: pi.accounting_method ?? '',
        };
    }, [setting]);

    const { data, setData, processing, errors, setError } = useForm({
        currency_id: setting?.currency_id ? String(setting.currency_id) : '',
        language: setting?.language ?? '',

        customers_management: !!setting?.customers_management,
        providers_management: !!setting?.providers_management,
        validate_nif: !!setting?.validate_nif,
        require_2fa: !!setting?.require_2fa,

        primary_color: setting?.primary_color ?? '',
        secondary_color: setting?.secondary_color ?? '',
        base_color_budgets: setting?.base_color_budgets ?? '#10172c',
        base_color_orders: setting?.base_color_orders ?? '#10172c',
        base_color_invoices: setting?.base_color_invoices ?? '#f8b96e',

        iva: setting?.iva ?? '',
        ip: setting?.ip ?? '',

        emails: Array.isArray(setting?.emails) ? setting.emails : (setting?.emails ? setting.emails : []),

        public_catalogue: !!setting?.public_catalogue,

        accounting_account_digits: setting?.accounting_account_digits ?? 11,

        pattern_budgets: !!setting?.pattern_budgets,
        pattern_sales: !!setting?.pattern_sales,
        pattern_purchases: !!setting?.pattern_purchases,
        pattern_deliveries: !!setting?.pattern_deliveries,
        pattern_projects: !!setting?.pattern_projects,
        pattern_invoices: !!setting?.pattern_invoices,

        public_info: initialPublicInfo,
    });

    const [submitting, setSubmitting] = useState(false);

    const sectionTitleStyle = {
        color: '#f0ad4e',
        fontWeight: 600,
        marginBottom: 8,
    };

    const sectionHintStyle = {
        color: '#f0ad4e',
        fontSize: 13,
        lineHeight: '16px',
        maxWidth: 260,
    };
    
    //Acciones:
    const actions = [];

    const addEmail = () => setData('emails', [...(data.emails || []), '']);

    const updateEmail = (idx, value) => {
        const next = [...(data.emails || [])];
        next[idx] = value;
        setData('emails', next);
    };

    const removeEmail = (idx) => {
        const next = [...(data.emails || [])];
        next.splice(idx, 1);
        setData('emails', next);
    };

    const setPublicInfo = (key, value) => {
        setData('public_info', { ...(data.public_info || {}), [key]: value });
    };

    function handleSubmit(e) {
        e.preventDefault();
        if (submitting) return;

        setSubmitting(true);

        const payload = {
            ...data,
            emails: (data.emails || []).map(e => String(e || '').trim()).filter(Boolean),
        };

        router.put(route('company-settings.update'), payload, {
            preserveScroll: true,
            onError: (errBag) => setError(errBag),
            onFinish: () => setSubmitting(false),
        });
    }

    return (
        <AdminAuthenticatedLayout
            user={auth.user}
            title={title}
            subtitle={subtitle}
            actions={actions}
        >
            <Head title={title} />

            <div className="contents pb-4">
                <div className="row">
                    <div className="col-12">
                        <h2>{__('configuracion')} <u>{company.name}</u></h2>
                    </div>

                    {/* Info */}
                    <div className="col-12 mt-2 mb-4">
                        <span className="text-muted me-5">{__('creado')}: <strong>{setting.formatted_created_at}</strong></span>
                        <span className="text-muted me-5">{__('actualizado')}: <strong>{setting.formatted_updated_at}</strong></span>
                    </div>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit}>
                    <div className="col-12 text-warning">
                        {__('empresa_configuracion_texto')}
                    </div>

                    <div className="row gy-3 my-3">
                        <div className="col-lg-6 col-xl-4">
                            <div className="position-relative">
                                <label htmlFor="customers_management" className="form-label">{ __('clientes_gestion') }</label>
                                <div className='pt-1 position-relative'>
                                    <Checkbox 
                                        className="xl"
                                        name="customers_management"
                                        checked={data.customers_management}
                                        onChange={(e) => setData('customers_management', e.target.checked)}
                                    />
                                    <span className="ms-3 pt-5 text-warning">{__('clientes_gestion_texto')}</span>
                                </div>
                                <InputError message={errors.customers_management} />
                            </div>
                        </div>

                        <div className="col-lg-6 col-xl-4">
                            <div className="position-relative">
                                <label htmlFor="providers_management" className="form-label">{ __('proveedores_gestion') }</label>
                                <div className='pt-1 position-relative'>
                                    <Checkbox 
                                        className="xl"
                                        name="providers_management"
                                        checked={data.providers_management}
                                        onChange={(e) => setData('providers_management', e.target.checked)}
                                    />
                                    <span className="ms-3 pt-5 text-warning">{__('proveedores_gestion_texto')}</span>
                                </div>
                                <InputError message={errors.providers_management} />
                            </div>
                        </div>
                    </div>

                    <div className="row gy-3 my-3">
                        <div className="col-lg-6 col-xl-4">
                            <div className="position-relative">
                                <label htmlFor="validate_nif" className="form-label">{ __('nif_validacion') }</label>
                                <div className='pt-1 position-relative'>
                                    <Checkbox 
                                        className="xl"
                                        name="validate_nif"
                                        checked={data.validate_nif}
                                        onChange={(e) => setData('validate_nif', e.target.checked)}
                                    />
                                    <span className="ms-3 pt-5 text-warning">{__('nif_validacion_texto')}</span>
                                </div>
                                <InputError message={errors.validate_nif} />
                            </div>
                        </div>

                        <div className="col-lg-6 col-xl-4">
                            <div className="position-relative">
                                <label htmlFor="require_2fa" className="form-label">{ __('validacion_doble') }</label>
                                <div className="pt-1 position-relative">
                                    <Checkbox 
                                        className="xl"
                                        name="require_2fa"
                                        checked={data.require_2fa}
                                        onChange={(e) => setData('require_2fa', e.target.checked)}
                                    />
                                    <span className="ms-3 pt-5 text-warning">{__('validacion_doble_texto')}</span>
                                </div>
                                <InputError message={errors.require_2fa} />
                            </div>
                        </div>
                    </div>
                    <hr className="my-4" />
                    
                    <div className="row gy-3 mb-3">
                        {/* Currency */}
                        <div className="col-md-4">
                            <div className="position-relative">
                                <label htmlFor="currency_id" className="form-label">{ __('moneda') }</label>
                                <SelectInput
                                    className="form-select"
                                    name="currency_id"
                                    value={data.currency_id}
                                    onChange={(e) => setData('currency_id', e.target.value)}
                                >
                                    <option value="">{__('opcion_selec')}</option>
                                    {currencyOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </SelectInput>
                                <InputError message={errors.currency_id} />
                            </div>
                        </div>

                        {/* Language */}
                        <div className="col-md-4">
                            <div className="position-relative">
                                <label htmlFor="language" className="form-label">{ __('idioma') }</label>
                                <SelectInput
                                    className="form-select"
                                    name="language"
                                    value={data.language || ''}
                                    onChange={(e) => setData('language', e.target.value)}
                                >
                                    <option value="">{__('opcion_selec')}</option>
                                    {languageOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}{opt.secondary ? ` (${opt.secondary})` : null}
                                        </option>
                                    ))}
                                </SelectInput>
                                <InputError message={errors.language} />
                            </div>
                        </div>
                    </div>
                    <hr className="my-4" />
                    
                    {/* <div className="row gy-3 my-3">
                        <div className="col-md-4">
                            <div className="position-relative">
                                <label htmlFor="iva" className="form-label">{ __('iva') }</label>
                                <TextInput
                                    name="iva"
                                    type="number"
                                    step="0.01"
                                    value={data.iva ?? ''}
                                    onChange={(e) => setData('iva', e.target.value)}
                                    placeholder="21"
                                    addon='%'
                                />
                                <InputError message={errors.iva} />
                            </div>
                        </div>
                    </div> */}

                    {/* Emails */}
                    <div className="row gy-3 mb-3">
                        <div className="col-12 fw-semibold mt-4">
                            { __('emails_corporativos') }
                        </div>
                        <div className="col-md-6 col-lg-6 col-xl-6">
                            <div className="position-relative">
                                {/* CTA + lista */}
                                <div className="d-flex align-items-start gap-3">
                                    {/* CTA añadir */}
                                    <button
                                        type="button"
                                        className="btn btn-warning rounded-circle d-flex align-items-center justify-content-center"
                                        style={{ width: 38, height: 38, fontWeight: 800, lineHeight: '38px' }}
                                        onClick={addEmail}
                                        title={__('añadir')}
                                    >
                                        <i className="la la-plus"></i>
                                    </button>

                                    {/* Lista */}
                                    <div className="flex-grow-1">
                                        {(data.emails || []).length === 0 ? (
                                            <div className="text-muted small pt-2">
                                                {__('emails_no_registrados')}
                                            </div>
                                        ) : null}

                                        {(data.emails || []).map((email, idx) => (
                                            <div key={idx} className="d-flex align-items-center gap-2 mb-2">
                                                <div className="flex-grow-1">
                                                    <TextInput
                                                        name={`email_${idx}`}
                                                        type="email"
                                                        value={email ?? ''}
                                                        onChange={(e) => updateEmail(idx, e.target.value)}
                                                        placeholder="mail@empresa.com"
                                                        maxLength={255}
                                                    />
                                                </div>

                                                <button
                                                    type="button"
                                                    className="btn btn-light rounded-circle"
                                                    style={{ width: 38, height: 38, border: '1px solid #eee' }}
                                                    onClick={() => removeEmail(idx)}
                                                    title={__('Eliminar')}
                                                >
                                                    <span style={{ color: '#dc3545', fontWeight: 800 }}>×</span>
                                                </button>
                                            </div>
                                        ))}

                                        <InputError message={errors.emails} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <hr className="my-4" />

                    {/* Colors (primary / secondary) */}
                    <div className="row gy-3 my-3">
                        <div className="col-12 fw-semibold">
                            { __('colores') }
                        </div>
                        <div className="col-md-4">
							<div className="position-relative">
    							<label htmlFor="primary_color" className="form-label">{ __('color_principal') }</label>
								<ColorPicker
									color={data.primary_color}
									onChange={(e) => setData('primary_color', e.target.value)}
									name="primary_color"
								/>
								<InfoPopover code="company-color" />

								<InputError message={errors.primary_color} />
							</div>
						</div>

                        <div className="col-md-4">
                            <div className="position-relative">
                                <label htmlFor="secondary_color" className="form-label">{ __('color_secundario') }</label>
                                <ColorPicker
                                    color={data.secondary_color}
                                    onChange={(e) => setData('secondary_color', e.target.value)}
                                    name="secondary_color"
                                />
                            </div>
                        </div>
                    </div>
                    <hr className="my-4" />

                    {/* ===== CATÁLOGO ===== */}
                    <div className="row gy-3 my-3">
                        <div className="col-12">
                            <span className="fw-semibold">{ __('catalogo') }</span> 
                        </div>
                        <div className="col-lg-6 col-xl-4">
                            <div className="position-relative">
                                <label htmlFor="public_catalogue" className="form-label">{ __('catalogo_publico') }</label>
                                <div className="pt-1 position-relative">
                                    <Checkbox 
                                        className="xl"
                                        name="public_catalogue"
                                        checked={data.public_catalogue}
                                        onChange={(e) => setData('public_catalogue', e.target.checked)}
                                    />
                                    <span className="ms-3 pt-5 text-warning">{__('catalogo_publico_texto')}</span>
                                </div>
                                <InputError message={errors.public_catalogue} />
                            </div>
                        </div>
                    </div>    
                    <hr className="my-4" />                    

                    {/* ===== PATRONES ===== */}
                    <div className="row gy-3 my-3">
                        <div className="col-12">
                            <span className="fw-semibold">{ __('patrones') }.</span> <span className="text-warning">{ __('patrones_configuracion_texto') }</span>
                        </div>
                        <div className="col-lg-6 col-xl-4">
                            <div className="position-relative">
                                <label htmlFor="pattern_budgets" className="form-label">{__('presupuestos')}</label>
                                <div className="pt-1 position-relative">
                                    <Checkbox
                                        className="xl"
                                        id="pattern_budgets"
                                        name="pattern_budgets"
                                        checked={data.pattern_budgets}
                                        onChange={(e) => setData('pattern_budgets', e.target.checked)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-6 col-xl-4">
                            <div className="position-relative">
                                <label htmlFor="pattern_sales" className="form-label">{__('Pedidos de venta')}</label>
                                <div className="pt-1 position-relative">
                                    <Checkbox
                                        className="xl"
                                        id="pattern_sales"
                                        name="pattern_sales"
                                        checked={data.pattern_sales}
                                        onChange={(e) => setData('pattern_sales', e.target.checked)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-6 col-xl-4">
                            <div className="position-relative">
                                <label htmlFor="pattern_purchases" className="form-label">{__('Pedidos de compra')}</label>
                                <div className="pt-1 position-relative">
                                    <Checkbox
                                        className="xl"
                                        id="pattern_purchases"
                                        name="pattern_purchases"
                                        checked={data.pattern_purchases}
                                        onChange={(e) => setData('pattern_purchases', e.target.checked)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-6 col-xl-4">
                            <div className="position-relative">
                                <label htmlFor="pattern_deliveries" className="form-label">{__('Albaranes')}</label>
                                <div className="pt-1 position-relative">
                                    <Checkbox
                                        className="xl"
                                        id="pattern_deliveries"
                                        name="pattern_deliveries"
                                        checked={data.pattern_deliveries}
                                        onChange={(e) => setData('pattern_deliveries', e.target.checked)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-6 col-xl-4">
                            <div className="position-relative">
                                <label htmlFor="pattern_projects" className="form-label">{__('Proyectos')}</label>
                                <div className="pt-1 position-relative">
                                    <Checkbox
                                        className="xl"
                                        id="pattern_projects"
                                        name="pattern_projects"
                                        checked={data.pattern_projects}
                                        onChange={(e) => setData('pattern_projects', e.target.checked)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="col-lg-6 col-xl-4">
                            <div className="position-relative">
                                <label htmlFor="pattern_invoices" className="form-label">{__('Facturas')}</label>
                                <div className="pt-1 position-relative">
                                    <Checkbox
                                        className="xl"
                                        id="pattern_invoices"
                                        name="pattern_invoices"
                                        checked={data.pattern_invoices}
                                        onChange={(e) => setData('pattern_invoices', e.target.checked)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <hr className="my-4" />

                    {/* ===== CONTABILIDAD ===== */}
                    <div className="row gy-3 my-3">
                        <div className="col-12 fw-semibold">
                            { __('contabilidad') } <span className="text-warning"></span>
                        </div>

                        <div className="col-md-4 col-lg-2">
                            <label className="form-label text-muted small mb-1">
                                {__('cuentas_contables_digitos')}
                            </label>
                            <TextInput
                                name="accounting_account_digits"
                                type="number"
                                min="1"
                                max="30"
                                className="text-end"
                                value={data.accounting_account_digits}
                                onChange={(e) => setData('accounting_account_digits', e.target.value)}
                            />
                            <InputError message={errors.accounting_account_digits} />
                        </div>
                    </div>
                    <hr className="my-4" />

                    {/* SAVE */}
                    <div className="mt-0 text-end">
                        <PrimaryButton
                            loading={submitting || processing}
                            loadingText={__('guardando')}
                            className="btn btn-rdn"
                        >
                            {__('guardar')}
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </AdminAuthenticatedLayout>
    );
}

