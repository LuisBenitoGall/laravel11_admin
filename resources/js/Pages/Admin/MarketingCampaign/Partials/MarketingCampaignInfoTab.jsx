import React, { useEffect } from 'react';
import { useForm } from '@inertiajs/react';

// Components:
import Checkbox from '@/Components/Checkbox';
import InfoPopover from '@/Components/InfoPopover';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SelectInput from '@/Components/SelectInput';
import TextInput from '@/Components/TextInput';

// Hooks:
import { useTranslation } from '@/Hooks/useTranslation';
import { useSweetAlert } from '@/Hooks/useSweetAlert';

const toDateValue = (val) => (val ? String(val).substring(0, 10) : '');

const normalizeOptions = (raw) => {
    if (Array.isArray(raw)) {
        if (raw.length && typeof raw[0] === 'object') return raw;
        return raw.map((name, idx) => ({ id: idx + 1, name }));
    }
    if (raw && typeof raw === 'object') {
        return Object.entries(raw).map(([key, value]) => {
            if (value && typeof value === 'object') {
                return { id: value.id ?? key, name: value.name ?? value.title ?? String(value) };
            }
            return { id: key, name: value };
        });
    }
    return [];
};

export default function MarketingCampaignInfoTab({
    campaign,
    costCenters = [],
    owners = [],
    currencies = [],
    campaignStatus = {},
    priorities = {},
    updateRoute = 'marketing-campaigns.update',
    updateParams = null,
}) {
    const __ = useTranslation();
    const { showAlert } = useSweetAlert();

    const params = updateParams ?? [campaign?.id];

    const campaignStatusArray = normalizeOptions(campaignStatus);
    const prioritiesArray     = normalizeOptions(priorities);

    const buildData = (c) => ({
        owner_id:       c?.owner_id       ?? '',
        name:           c?.name           ?? '',
        campaign_code:  c?.campaign_code  ?? '',
        campaign_type:  c?.campaign_type  ?? '',
        description:    c?.description    ?? '',
        total_cost:     c?.total_cost     ?? '',
        expected_cost:  c?.expected_cost  ?? '',
        currency_id:    c?.currency_id    ?? '',
        promote_code:   c?.promote_code   ?? '',
        start_at:       toDateValue(c?.start_at),
        finish_at:      toDateValue(c?.finish_at),
        cost_center_id: c?.cost_center_id ?? '',
        status:         c?.status          ? String(c.status) : '',
        is_quick:       c?.is_quick       ?? false,
        action:         c?.action         ?? '',
        priority:       c?.priority       ?? '',
        members_type:   c?.members_type   ?? '',
    });

    const { data, setData, put, processing, errors } = useForm(buildData(campaign));

    useEffect(() => {
        setData(buildData(campaign));
    }, [campaign?.id]);

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route(updateRoute, params), {
            preserveScroll: true,
            onError: () => showAlert(__('error'), __('error_guardando'), 'error'),
        });
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="row gy-3">

                {/* Nombre */}
                <div className="col-lg-6">
                    <label htmlFor="name" className="form-label">{__('nombre')}*</label>
                    <TextInput
                        id="name"
                        type="text"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        maxLength={255}
                    />
                    <InputError message={errors.name} />
                </div>

                {/* Código */}
                <div className="col-lg-3">
                    <label htmlFor="campaign_code" className="form-label">{__('codigo')}</label>
                    <TextInput
                        id="campaign_code"
                        type="text"
                        value={data.campaign_code}
                        onChange={(e) => setData('campaign_code', e.target.value)}
                        maxLength={255}
                    />
                    <InputError message={errors.campaign_code} />
                </div>

                {/* Tipo */}
                <div className="col-lg-3">
                    <label htmlFor="campaign_type" className="form-label">{__('tipo')}</label>
                    <TextInput
                        id="campaign_type"
                        type="text"
                        value={data.campaign_type}
                        onChange={(e) => setData('campaign_type', e.target.value)}
                        maxLength={50}
                    />
                    <InputError message={errors.campaign_type} />
                </div>

                {/* Propietario */}
                <div className="col-lg-4">
                    <label htmlFor="owner_id" className="form-label">{__('propietario')}</label>
                    <SelectInput
                        id="owner_id"
                        value={data.owner_id}
                        onChange={(e) => setData('owner_id', e.target.value)}
                    >
                        <option value="">{__('opcion_selec')}</option>
                        {owners.map((u) => (
                            <option key={u.id} value={u.id}>
                                {u.full_name || [u.name, u.surname].filter(Boolean).join(' ')}
                            </option>
                        ))}
                    </SelectInput>
                    <InputError message={errors.owner_id} />
                </div>

                {/* Centro de coste */}
                <div className="col-lg-4">
                    <label htmlFor="cost_center_id" className="form-label">{__('centro_coste')}</label>
                    <SelectInput
                        id="cost_center_id"
                        value={data.cost_center_id}
                        onChange={(e) => setData('cost_center_id', e.target.value)}
                    >
                        <option value="">{__('opcion_selec')}</option>
                        {costCenters.map((cc) => (
                            <option key={cc.id} value={cc.id}>{cc.name}</option>
                        ))}
                    </SelectInput>
                    <InputError message={errors.cost_center_id} />
                </div>

                {/* Estado */}
                <div className="col-lg-4">
                    <label htmlFor="campaign_status" className="form-label">{__('estado')}</label>
                    <SelectInput
                        id="campaign_status"
                        value={data.status}
                        onChange={(e) => setData('status', e.target.value)}
                    >
                        <option value="">{__('opcion_selec')}</option>
                        {campaignStatusArray.map((cs) => (
                            <option key={cs.id} value={cs.id}>{cs.name}</option>
                        ))}
                    </SelectInput>
                    {/* <InfoPopover code="campanya-status" /> */}
                    <InputError message={errors.status} />
                </div>

                {/* Descripción */}
                <div className="col-12">
                    <label htmlFor="description" className="form-label">{__('descripcion')}</label>
                    <textarea
                        id="description"
                        className="form-control"
                        rows="4"
                        value={data.description || ''}
                        onChange={(e) => setData('description', e.target.value)}
                    />
                    <InputError message={errors.description} />
                </div>

                {/* Costes */}
                <div className="col-lg-3">
                    <label htmlFor="total_cost" className="form-label">{__('coste_total')}</label>
                    <TextInput
                        id="total_cost"
                        type="number"
                        step="0.01"
                        min="0"
                        value={data.total_cost}
                        onChange={(e) => setData('total_cost', e.target.value)}
                    />
                    <InputError message={errors.total_cost} />
                </div>

                <div className="col-lg-3">
                    <label htmlFor="expected_cost" className="form-label">{__('coste_previsto')}</label>
                    <TextInput
                        id="expected_cost"
                        type="number"
                        step="0.01"
                        min="0"
                        value={data.expected_cost || ''}
                        onChange={(e) => setData('expected_cost', e.target.value)}
                    />
                    <InputError message={errors.expected_cost} />
                </div>

                {/* Moneda */}
                <div className="col-lg-3">
                    <label htmlFor="currency_id" className="form-label">{__('moneda')}</label>
                    <SelectInput
                        id="currency_id"
                        value={data.currency_id}
                        onChange={(e) => setData('currency_id', e.target.value)}
                    >
                        <option value="">{__('opcion_selec')}</option>
                        {currencies.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}{c.symbol ? ` (${c.symbol})` : ''}
                            </option>
                        ))}
                    </SelectInput>
                    <InputError message={errors.currency_id} />
                </div>

                {/* Código promocional */}
                <div className="col-lg-3">
                    <label htmlFor="promote_code" className="form-label">{__('codigo_promocion')}</label>
                    <TextInput
                        id="promote_code"
                        type="text"
                        value={data.promote_code || ''}
                        onChange={(e) => setData('promote_code', e.target.value)}
                        maxLength={255}
                    />
                    <InputError message={errors.promote_code} />
                </div>

                {/* Fechas */}
                <div className="col-lg-3">
                    <label htmlFor="start_at" className="form-label">{__('inicio')}</label>
                    <TextInput
                        id="start_at"
                        type="date"
                        value={data.start_at || ''}
                        onChange={(e) => setData('start_at', e.target.value)}
                    />
                    <InputError message={errors.start_at} />
                </div>

                <div className="col-lg-3">
                    <label htmlFor="finish_at" className="form-label">{__('fin')}</label>
                    <TextInput
                        id="finish_at"
                        type="date"
                        value={data.finish_at || ''}
                        onChange={(e) => setData('finish_at', e.target.value)}
                    />
                    <InputError message={errors.finish_at} />
                </div>

                {/* Acción */}
                <div className="col-lg-3">
                    <label htmlFor="action" className="form-label">{__('accion')}</label>
                    <TextInput
                        id="action"
                        type="text"
                        value={data.action || ''}
                        onChange={(e) => setData('action', e.target.value)}
                        maxLength={255}
                    />
                    <InputError message={errors.action} />
                </div>

                {/* Prioridad */}
                <div className="col-lg-3">
                    <label htmlFor="priority" className="form-label">{__('prioridad')}</label>
                    <SelectInput
                        id="priority"
                        value={data.priority}
                        onChange={(e) => setData('priority', e.target.value)}
                    >
                        <option value="">{__('opcion_selec')}</option>
                        {prioritiesArray.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </SelectInput>
                    <InputError message={errors.priority} />
                </div>

                {/* Tipo de miembros */}
                <div className="col-lg-3">
                    <label htmlFor="members_type" className="form-label">{__('miembros_tipo')}</label>
                    <TextInput
                        id="members_type"
                        type="text"
                        value={data.members_type || ''}
                        onChange={(e) => setData('members_type', e.target.value)}
                        maxLength={255}
                    />
                    <InputError message={errors.members_type} />
                </div>

                {/* Campaña express */}
                <div className="col-lg-3 d-flex align-items-end">
                    <div className="form-check">
                        <Checkbox
                            id="is_quick"
                            checked={data.is_quick}
                            onChange={(e) => setData('is_quick', e.target.checked)}
                        />
                        <label htmlFor="is_quick" className="form-check-label ms-2">
                            {__('campanya_express')}
                        </label>
                        <InputError message={errors.is_quick} />
                    </div>
                </div>

                {/* Guardar */}
                <div className="col-12 mt-4 text-end">
                    <PrimaryButton disabled={processing} className="btn btn-rdn">
                        {processing ? `${__('procesando')}...` : __('guardar')}
                    </PrimaryButton>
                </div>

            </div>
        </form>
    );
}
