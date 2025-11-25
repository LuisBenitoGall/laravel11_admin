import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

// Components:
import Checkbox from '@/Components/Checkbox';
import InfoPopover from '@/Components/InfoPopover';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import SelectInput from '@/Components/SelectInput';

// Hooks:
import { useTranslation } from '@/Hooks/useTranslation';

export default function Create({ auth, session, title, subtitle, owners = [], currencies = [], costCenters = [] }) {
    const __ = useTranslation();
    const props = usePage()?.props || {};
    const locale = props.locale || false;
    const languages = props.languages || [];
    const permissions = props.permissions || {};

    const statusOptions = [
        { value: 0, label: __('campanya_borrador') },   // draft
        { value: 1, label: __('campanya_activa') },     // active
        { value: 2, label: __('campanya_finalizada') }, // finished
        { value: 3, label: __('campanya_cancelada') },  // cancelled
    ];

    // Form state
    const { data, setData, post, reset, errors, processing } = useForm({
        owner_id: '',
        name: '',
        campaign_code: '',
        campaign_type: '',
        description: '',
        total_cost: '',
        expected_cost: '',
        currency_id: '',
        promote_code: '',
        start_at: '',
        finish_at: '',
        cost_center_id: '',
        status: 0,
        is_quick: false,
        action: '',
        priority: '',
        members_type: '',
        external_id: '',
        source_system: '',
        source_type: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        post(route('marketing-campaigns.store'), {
            onSuccess: () => reset(),
        });
    };

    // Acciones:
    const actions = [];
    if (permissions?.['marketing-campaigns.index']) {
        actions.push({
            text: __('campanyas_volver'),
            icon: 'la-angle-left',
            url: 'marketing-campaigns.index',
            modal: false,
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

            {/* Contenido */}
            <div className="contents pb-4">
                {/* Formulario */}
                <form onSubmit={handleSubmit}>
                    <div className="row gy-3">
                        {/* Nombre campaña */}
                        <div className="col-lg-6">
                            <div>
                                <label htmlFor="name" className="form-label">
                                    {__('campanya_nombre')}*
                                </label>
                                <TextInput
                                    id="name"
                                    type="text"
                                    placeholder={__('campanya_nombre')}
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    maxLength={255}
                                />
                                <InputError message={errors.name} />
                            </div>
                        </div>

                        {/* Codigo campanya */}
                        <div className="col-lg-3">
                            <div>
                                <label htmlFor="campaign_code" className="form-label">
                                    {__('campanya_codigo')}
                                </label>
                                <TextInput
                                    id="campaign_code"
                                    type="text"
                                    placeholder={__('campanya_codigo')}
                                    value={data.campaign_code}
                                    onChange={(e) => setData('campaign_code', e.target.value)}
                                    maxLength={255}
                                />
                                <InputError message={errors.campaign_code} />
                            </div>
                        </div>

                        {/* Tipo de campanya */}
                        <div className="col-lg-3">
                            <div>
                                <label htmlFor="campaign_type" className="form-label">
                                    {__('campanya_tipo')}
                                </label>
                                <TextInput
                                    id="campaign_type"
                                    type="text"
                                    placeholder={__('campanya_tipo')}
                                    value={data.campaign_type}
                                    onChange={(e) => setData('campaign_type', e.target.value)}
                                    maxLength={50}
                                />
                                <InputError message={errors.campaign_type} />
                            </div>
                        </div>

                        {/* Propietario */}
                        <div className="col-lg-4">
                            <div>
                                <label htmlFor="owner_id" className="form-label">
                                    {__('campanya_propietario')}
                                </label>
                                <SelectInput
                                    id="owner_id"
                                    value={data.owner_id}
                                    onChange={(e) => setData('owner_id', e.target.value)}
                                >
                                    <option value="">{__('seleccionar_opcion')}</option>
                                    {owners.map((user) => (
                                        <option key={user.id} value={user.id}>
                                            {user.full_name || user.name}
                                        </option>
                                    ))}
                                </SelectInput>
                                <InputError message={errors.owner_id} />
                            </div>
                        </div>

                        {/* Centro de coste */}
                        <div className="col-lg-4">
                            <div>
                                <label htmlFor="cost_center_id" className="form-label">
                                    {__('centro_coste')}
                                </label>
                                <SelectInput
                                    id="cost_center_id"
                                    value={data.cost_center_id}
                                    onChange={(e) => setData('cost_center_id', e.target.value)}
                                >
                                    <option value="">{__('seleccionar_opcion')}</option>
                                    {costCenters.map((cc) => (
                                        <option key={cc.id} value={cc.id}>
                                            {cc.name}
                                        </option>
                                    ))}
                                </SelectInput>
                                <InputError message={errors.cost_center_id} />
                            </div>
                        </div>

                        {/* Estado */}
                        <div className="col-lg-4">
                            <div className="position-relative">
                                <label htmlFor="status" className="form-label">
                                    {__('campanya_estado')}
                                </label>
                                <SelectInput
                                    id="status"
                                    value={data.status}
                                    onChange={(e) => setData('status', Number(e.target.value))}
                                >
                                    {statusOptions.map((opt) => (
                                        <option key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </option>
                                    ))}
                                </SelectInput>
                                <InfoPopover code="campanya-status" />
                                <InputError message={errors.status} />
                            </div>
                        </div>

                        {/* Descripcion */}
                        <div className="col-12">
                            <div>
                                <label htmlFor="description" className="form-label">
                                    {__('campanya_descripcion')}
                                </label>
                                <textarea
                                    id="description"
                                    className="form-control"
                                    rows="4"
                                    placeholder={__('campanya_descripcion')}
                                    value={data.description || ''}
                                    onChange={(e) => setData('description', e.target.value)}
                                />
                                <InputError message={errors.description} />
                            </div>
                        </div>

                        {/* Costes y moneda */}
                        <div className="col-lg-3">
                            <div>
                                <label htmlFor="total_cost" className="form-label">
                                    {__('campanya_coste_total')}
                                </label>
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
                        </div>

                        <div className="col-lg-3">
                            <div>
                                <label htmlFor="expected_cost" className="form-label">
                                    {__('campanya_coste_esperado')}
                                </label>
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
                        </div>

                        <div className="col-lg-3">
                            <div>
                                <label htmlFor="currency_id" className="form-label">
                                    {__('moneda')}
                                </label>
                                <SelectInput
                                    id="currency_id"
                                    value={data.currency_id}
                                    onChange={(e) => setData('currency_id', e.target.value)}
                                >
                                    <option value="">{__('seleccionar_opcion')}</option>
                                    {currencies.map((currency) => (
                                        <option key={currency.id} value={currency.id}>
                                            {currency.code} {currency.symbol ? `(${currency.symbol})` : ''}
                                        </option>
                                    ))}
                                </SelectInput>
                                <InputError message={errors.currency_id} />
                            </div>
                        </div>

                        {/* Codigo promocional */}
                        <div className="col-lg-3">
                            <div>
                                <label htmlFor="promote_code" className="form-label">
                                    {__('campanya_codigo_promocion')}
                                </label>
                                <TextInput
                                    id="promote_code"
                                    type="text"
                                    value={data.promote_code || ''}
                                    onChange={(e) => setData('promote_code', e.target.value)}
                                    maxLength={255}
                                />
                                <InputError message={errors.promote_code} />
                            </div>
                        </div>

                        {/* Fechas */}
                        <div className="col-lg-3">
                            <div>
                                <label htmlFor="start_at" className="form-label">
                                    {__('campanya_inicio')}
                                </label>
                                <TextInput
                                    id="start_at"
                                    type="datetime-local"
                                    value={data.start_at || ''}
                                    onChange={(e) => setData('start_at', e.target.value)}
                                />
                                <InputError message={errors.start_at} />
                            </div>
                        </div>

                        <div className="col-lg-3">
                            <div>
                                <label htmlFor="finish_at" className="form-label">
                                    {__('campanya_fin')}
                                </label>
                                <TextInput
                                    id="finish_at"
                                    type="datetime-local"
                                    value={data.finish_at || ''}
                                    onChange={(e) => setData('finish_at', e.target.value)}
                                />
                                <InputError message={errors.finish_at} />
                            </div>
                        </div>

                        {/* Configuracion de envio */}
                        <div className="col-lg-3">
                            <div>
                                <label htmlFor="action" className="form-label">
                                    {__('campanya_accion')}
                                </label>
                                <TextInput
                                    id="action"
                                    type="text"
                                    value={data.action || ''}
                                    onChange={(e) => setData('action', e.target.value)}
                                    maxLength={255}
                                />
                                <InputError message={errors.action} />
                            </div>
                        </div>

                        <div className="col-lg-3">
                            <div>
                                <label htmlFor="priority" className="form-label">
                                    {__('campanya_prioridad')}
                                </label>
                                <TextInput
                                    id="priority"
                                    type="text"
                                    value={data.priority || ''}
                                    onChange={(e) => setData('priority', e.target.value)}
                                    maxLength={255}
                                />
                                <InputError message={errors.priority} />
                            </div>
                        </div>

                        <div className="col-lg-3">
                            <div>
                                <label htmlFor="members_type" className="form-label">
                                    {__('campanya_tipo_miembros')}
                                </label>
                                <TextInput
                                    id="members_type"
                                    type="text"
                                    value={data.members_type || ''}
                                    onChange={(e) => setData('members_type', e.target.value)}
                                    maxLength={255}
                                />
                                <InputError message={errors.members_type} />
                            </div>
                        </div>

                        {/* Campanya rapida */}
                        <div className="col-lg-3 d-flex align-items-end">
                            <div className="form-check">
                                <Checkbox
                                    id="is_quick"
                                    name="is_quick"
                                    checked={data.is_quick}
                                    onChange={(e) => setData('is_quick', e.target.checked)}
                                />
                                <label htmlFor="is_quick" className="form-check-label ms-2">
                                    {__('campanya_express')}
                                </label>
                                <InputError message={errors.is_quick} />
                            </div>
                        </div>

                        {/* Datos de origen / integracion */}
                        <div className="col-12">
                            <hr />
                            <h6 className="mb-3">{__('campanya_origen_datos')}</h6>
                        </div>

                        <div className="col-lg-4">
                            <div>
                                <label htmlFor="external_id" className="form-label">
                                    {__('campanya_external_id')}
                                </label>
                                <TextInput
                                    id="external_id"
                                    type="text"
                                    value={data.external_id || ''}
                                    onChange={(e) => setData('external_id', e.target.value)}
                                    maxLength={255}
                                />
                                <InputError message={errors.external_id} />
                            </div>
                        </div>

                        <div className="col-lg-4">
                            <div>
                                <label htmlFor="source_system" className="form-label">
                                    {__('campanya_sistema_origen')}
                                </label>
                                <TextInput
                                    id="source_system"
                                    type="text"
                                    value={data.source_system || ''}
                                    onChange={(e) => setData('source_system', e.target.value)}
                                    maxLength={50}
                                />
                                <InputError message={errors.source_system} />
                            </div>
                        </div>

                        <div className="col-lg-4">
                            <div>
                                <label htmlFor="source_type" className="form-label">
                                    {__('campanya_tipo_origen')}
                                </label>
                                <TextInput
                                    id="source_type"
                                    type="text"
                                    value={data.source_type || ''}
                                    onChange={(e) => setData('source_type', e.target.value)}
                                    maxLength={50}
                                />
                                <InputError message={errors.source_type} />
                            </div>
                        </div>

                        {/* Botones */}
                        <div className="col-12 mt-4 text-end">
                            {permissions?.['marketing-campaigns.index'] && (
                                <Link
                                    href={route('marketing-campaigns.index')}
                                    className="btn btn-outline-secondary me-2"
                                >
                                    {__('cancelar')}
                                </Link>
                            )}

                            <PrimaryButton disabled={processing} className="btn btn-rdn">
                                {processing ? `${__('procesando')}...` : __('guardar')}
                            </PrimaryButton>
                        </div>
                    </div>
                </form>
            </div>
        </AdminAuthenticatedLayout>
    );
}
