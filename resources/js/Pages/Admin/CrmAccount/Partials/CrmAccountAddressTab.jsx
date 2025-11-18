// resources/js/Pages/Admin/CrmAccount/Partials/CrmAccountAddressTab.jsx
import React, { useMemo } from 'react';
import { useForm, usePage } from '@inertiajs/react';

// Hooks
import { useTranslation } from '@/Hooks/useTranslation';

// Componentes propios
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import Checkbox from '@/Components/Checkbox';

export default function CrmAccountAddressTab({
    account,
    countries = [],
    currencies = [],
}) {
    const __ = useTranslation();
    const { url } = usePage(); // por si necesitas algo del contexto

    // Normaliza países a {code:'ES', name:'España'}
    const countryOptions = useMemo(() => {
        return countries.map(c => ({
            code: c.code || c.id,
            name: c.name
        })).filter(c => c.code && c.name);
    }, [countries]);

    const currencyOptions = useMemo(() => {
        return currencies.map(c => ({
            id: c.id,
            label: c.code ? `${c.code}${c.symbol ? ` (${c.symbol})` : ''}` : (c.name || c.id),
        }));
    }, [currencies]);

    const { data, setData, put, processing, errors } = useForm({
        website: account.website || '',
        currency_id: account.currency_id || '',
        // Billing
        billing_street: account.billing_street || '',
        billing_city: account.billing_city || '',
        billing_state: account.billing_state || '',
        billing_postal_code: account.billing_postal_code || '',
        billing_country_code: account.billing_country_code || '',
        // Shipping
        shipping_street: account.shipping_street || '',
        shipping_city: account.shipping_city || '',
        shipping_state: account.shipping_state || '',
        shipping_postal_code: account.shipping_postal_code || '',
        shipping_country_code: account.shipping_country_code || '',
        // UI only
        copy_billing_to_shipping: false,
    });

    const onSubmit = e => {
        e.preventDefault();
        // Si está activado copiar, replica billing sobre shipping antes de enviar
        let payload = { ...data };
        if (payload.copy_billing_to_shipping) {
            payload.shipping_street = payload.billing_street;
            payload.shipping_city = payload.billing_city;
            payload.shipping_state = payload.billing_state;
            payload.shipping_postal_code = payload.billing_postal_code;
            payload.shipping_country_code = payload.billing_country_code;
        }
        delete payload.copy_billing_to_shipping;

        put(route('crm-accounts.update', account.id), {
        preserveScroll: true,
        data: payload,
        });
    };

    return (
        <form onSubmit={onSubmit} className="mt-3">
            {/* Website y divisa */}
            <div className="row g-3 mb-4">
                <div className="col-md-8">
                    <label className="form-label">{__('website')}</label>
                    <TextInput
                        value={data.website}
                        onChange={e => setData('website', e.target.value)}
                        placeholder="https://example.com"
                    />
                    <InputError message={errors.website} className="mt-1" />
                </div>

                <div className="col-md-4">
                    <label className="form-label">{__('divisa')}</label>
                    <select
                        value={data.currency_id ?? ''}
                        onChange={e => setData('currency_id', e.target.value)}
                        className="form-select"
                    >
                        <option value="">{__('moneda_selec')}</option>
                        {currencyOptions.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.label}</option>
                        ))}
                    </select>
                    <InputError message={errors.currency_id} className="mt-1" />
                </div>
            </div>

            {/* Dirección de facturación */}
            <div className="card mb-4">
                <div className="card-header fw-semibold">{__('direccion')} · {__('factura')}</div>

                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-12">
                            <label className="form-label">{__('direccion') || 'Calle'}</label>
                            <TextInput
                                value={data.billing_street}
                                onChange={e => setData('billing_street', e.target.value)}
                            />
                            <InputError message={errors.billing_street} className="mt-1" />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">{__('poblacion') || 'Ciudad'}</label>
                            <TextInput
                                value={data.billing_city}
                                onChange={e => setData('billing_city', e.target.value)}
                            />
                            <InputError message={errors.billing_city} className="mt-1" />
                        </div>

                        <div className="col-md-3">
                            <label className="form-label">{__('provincia') || 'Provincia/Estado'}</label>
                            <TextInput
                                value={data.billing_state}
                                onChange={e => setData('billing_state', e.target.value)}
                            />
                            <InputError message={errors.billing_state} className="mt-1" />
                        </div>

                        <div className="col-md-3">
                            <label className="form-label">{__('cp') || 'CP'}</label>
                            <TextInput
                                value={data.billing_postal_code}
                                onChange={e => setData('billing_postal_code', e.target.value)}
                            />
                            <InputError message={errors.billing_postal_code} className="mt-1" />
                        </div>

                        <div className="col-md-4">
                            <label className="form-label">{__('pais') || 'País'}</label>
                            <select
                                value={data.billing_country_code ?? ''}
                                onChange={e => setData('billing_country_code', e.target.value)}
                                className="form-select"
                            >
                                <option value="">{__('pais_selec')}</option>
                                {countryOptions.map(opt => (
                                    <option key={opt.code} value={opt.code}>{opt.name}</option>
                                ))}
                            </select>
                            <InputError message={errors.billing_country_code} className="mt-1" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Dirección de envío */}
            <div className="card mb-4">
                <div className="card-header d-flex align-items-center justify-content-between">
                    <span className="fw-semibold">{__('direccion')} · {__('envios') || 'Envío'}</span>
                    <label className="d-flex align-items-center gap-2 m-0">
                        <Checkbox
                        checked={data.copy_billing_to_shipping}
                        onChange={e => setData('copy_billing_to_shipping', e.target.checked)}
                    />
                        <span className="small text-muted">
                        {__('copiar') || 'Copiar facturación a envío'}
                        </span>
                    </label>
                </div>

                <div className="card-body">
                    <div className="row g-3">
                        <div className="col-12">
                            <label className="form-label">{__('direccion_envio') || 'Calle'}</label>
                            <TextInput
                                value={data.shipping_street}
                                onChange={e => setData('shipping_street', e.target.value)}
                            />
                            <InputError message={errors.shipping_street} className="mt-1" />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">{__('poblacion') || 'Ciudad'}</label>
                    <TextInput
                        value={data.shipping_city}
                        onChange={e => setData('shipping_city', e.target.value)}
                    />
                    <InputError message={errors.shipping_city} className="mt-1" />
                    </div>
                    <div className="col-md-3">
                    <label className="form-label">{__('provincia') || 'Provincia/Estado'}</label>
                    <TextInput
                        value={data.shipping_state}
                        onChange={e => setData('shipping_state', e.target.value)}
                    />
                    <InputError message={errors.shipping_state} className="mt-1" />
                        </div>

                        <div className="col-md-3">
                            <label className="form-label">{__('cp') || 'CP'}</label>
                            <TextInput
                                value={data.shipping_postal_code}
                                onChange={e => setData('shipping_postal_code', e.target.value)}
                            />
                            <InputError message={errors.shipping_postal_code} className="mt-1" />
                        </div>

                        <div className="col-md-4">
                            <label className="form-label">{__('pais') || 'País'}</label>
                            <select
                                value={data.shipping_country_code ?? ''}
                                onChange={e => setData('shipping_country_code', e.target.value)}
                                className="form-select"
                            >
                                <option value="">{__('pais_selec')}</option>
                                {countryOptions.map(opt => (
                                <option key={opt.code} value={opt.code}>{opt.name}</option>
                                ))}
                            </select>
                            <InputError message={errors.shipping_country_code} className="mt-1" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="d-flex justify-content-end gap-2">
                <PrimaryButton type="submit" disabled={processing}>
                {processing ? __('guardando') : __('guardar')}
                </PrimaryButton>
            </div>
        </form>
    );
}
