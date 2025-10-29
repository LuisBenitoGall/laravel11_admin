import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Tooltip } from 'react-tooltip';
import { useState, useEffect } from 'react';
import axios from 'axios';

//Components:
import Checkbox from '@/Components/Checkbox';
import InfoPopover from '@/Components/InfoPopover';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import RadioButton from '@/Components/RadioButton';
import SelectSearch from '@/Components/SelectSearch';
import Textarea from '@/Components/Textarea';
import TextInput from '@/Components/TextInput';

//Hooks:
import { useTranslation } from '@/Hooks/useTranslation';

export default function Index({ auth, session, title, subtitle, types, natureOptions, currencies, availableLocales }){
    const __ = useTranslation();
    const props = usePage()?.props || {};
    const permissions = props.permissions || {};

    // Form
    const { data, setData, post, reset, errors, processing } = useForm({
        name: '',
        nature: null,
        status: true,
        manual_code: '',
        level1: null,
        level2: null,
        level3: null,
        level4: null,
        reconcile: false,
        currency_id: null,
        normal_side: null,      // 'debit' | 'credit'
        is_group: false,
        digits: '',
        notes: ''
    });

    const [normalSideTouched, setNormalSideTouched] = useState(false);
    const [normalSideFlash, setNormalSideFlash] = useState(false);
    const [showNormalSideControls, setShowNormalSideControls] = useState(false);

    // Opciones por nivel
    const [level2Options, setLevel2Options] = useState([]);
    const [level3Options, setLevel3Options] = useState([]);
    const [level4Options, setLevel4Options] = useState([]);

    // Disabled: derivado del estado, no con flags sueltos
    const isLevel2Disabled = !data.level1 || level2Options.length === 0;
    const isLevel3Disabled = !data.level2 || level3Options.length === 0;
    const isLevel4Disabled = !data.level3 || level4Options.length === 0;

    function handleSubmit(e){
        e.preventDefault();
        post(route('accounting-accounts.store'), { onSuccess: () => reset() });
    }

    const actions = [];
    if (permissions?.['accounting-accounts.index']) {
        actions.push({ text: __('cuentas_volver'), icon: 'la-angle-left', url: 'accounting-accounts.index', modal: false });
    }

    // Reset en cascada, sin reventar otros campos del form
    const resetSelectors = (fromLevel) => {
        setData(current => {
        const next = { ...current };
        if (fromLevel <= 1) {
            next.level2 = null; next.level3 = null; next.level4 = null;
            setLevel2Options([]); setLevel3Options([]); setLevel4Options([]);
        } else if (fromLevel === 2) {
            next.level3 = null; next.level4 = null;
            setLevel3Options([]); setLevel4Options([]);
        } else if (fromLevel === 3) {
            next.level4 = null;
            setLevel4Options([]);
        }
        return next;
        });
    };

    // Carga anidada
    const handleLevelChange = async (level, selectedId) => {
        if (level === 1) {
        setData('level1', selectedId || null);
        resetSelectors(1);
        if (!selectedId) return;

        try {
            const { data: items } = await axios.get(route('accounting-account-types.select', { type: selectedId }));
            setLevel2Options(items || []);
        } catch (e) {
            setLevel2Options([]);
            console.error('Error fetching level2 options:', e);
        }
        }

        if (level === 2) {
        setData('level2', selectedId || null);
        resetSelectors(2);
        if (!selectedId) return;

        try {
            const { data: items } = await axios.get(route('accounting-account-types.select', { type: selectedId }));
            setLevel3Options(items || []);
        } catch (e) {
            setLevel3Options([]);
            console.error('Error fetching level3 options:', e);
        }
        }

        if (level === 3) {
        setData('level3', selectedId || null);
        resetSelectors(3);
        if (!selectedId) return;

        try {
            const { data: items } = await axios.get(route('accounting-account-types.select', { type: selectedId }));
            setLevel4Options(items || []);
        } catch (e) {
            setLevel4Options([]);
            console.error('Error fetching level4 options:', e);
        }
        }
    };

    useEffect(() => {
        if (!data.reconcile) {
            setData('currency_id', null);
        }
    }, [data.reconcile]);

    const computeNormalSide = (nature) => {
        if (!nature) return null;
        return ['asset', 'expense'].includes(nature) ? 'debit' : 'credit';
    };

    useEffect(() => {
        if (!normalSideTouched) {
            setData('normal_side', computeNormalSide(data.nature));
        }
    }, [data.nature, normalSideTouched]);

    useEffect(() => {
        if (data.is_group) {
            setData('normal_side', null);
            setNormalSideTouched(false);
        }
    }, [data.is_group]);

    useEffect(() => {
        if (data.normal_side) {
            setNormalSideFlash(true);
            const t = setTimeout(() => setNormalSideFlash(false), 700);
            return () => clearTimeout(t);
        }
    }, [data.normal_side]);

    return (
        <AdminAuthenticatedLayout user={auth.user} title={title} subtitle={subtitle} actions={actions}>
            <Head title={title} />

            <div className="contents pb-4">
                <form onSubmit={handleSubmit}>
                    <div className="row gy-3">
                        {/* Nombre */}
                        <div className="col-lg-6">
                            <label className="form-label">{__('cuenta_nombre')}*</label>
                            <TextInput
                                type="text"
                                placeholder={__('cuenta_nombre')}
                                value={data.name ?? ''}
                                onChange={(e) => setData('name', e.target.value)}
                                maxLength={100}
                            />
                            <InputError message={errors.name} />
                        </div>

                        {/* Estado */}
                        <div className="col-lg-1 text-center">
                            <div className="position-relative">
                                <label htmlFor="status" className="form-label">{ __('estado') }</label>
                                <div className='pt-1 position-relative'>
                                    <Checkbox 
                                        className="xl"
                                        name="status"
                                        checked={data.status}
                                        onChange={(e) => setData('status', e.target.checked)}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="w-100 m-0"></div>

                        {/* Tipo contable */}
                        <div className="col-lg-3">
                            <label className="form-label">{__('tipo_contable')}*</label>
                            <SelectSearch
                                name="nature"
                                options={natureOptions}
                                value={data.nature}
                                onChange={(opt) => setData('nature', opt ? opt.value : null)}
                                placeholder={__('opcion_selec')}
                                required
                            />
                        </div>

                        {/* Saldo esperado (siempre visible cuando no es agrupadora) */}
                        <div className="col-md-3">
                            <label className="form-label d-flex align-items-center gap-2">
                                {__('saldo_esperado')}
                                <small className="text-muted">
                                ({__('sugerido_por_tipo')}: {['asset','expense'].includes(data.nature) ? __('debe') : __('haber')})
                                </small>

                                {data.normal_side && (
                                <span className={`mt-2 badge ${data.normal_side === 'debit' ? 'bg-primary' : 'bg-success'}`}>
                                    {data.normal_side === 'debit' ? __('debe') : __('haber')}
                                </span>
                                )}
                            </label>

                            {!data.is_group && data.nature && (
                                <RadioButton
                                name="normal_side"
                                value={data.normal_side}
                                onChange={(e) => {
                                    setData('normal_side', e?.target?.value);
                                    setNormalSideTouched(true);
                                }}
                                options={[
                                    { value: 'debit',  label: __('debe') },
                                    { value: 'credit', label: __('haber') },
                                ]}
                                />
                            )}

                            <InputError message={errors.normal_side} />
                        </div>

                        {/* Conciliable */}
                        <div className="col-md-2">
                            <label className="form-label d-block">{__('conciliable')}</label>
                            <div className="form-check form-switch pt-2">
                                <Checkbox
                                id="reconcile"
                                name="reconcile"
                                checked={!!data.reconcile}
                                onChange={(e) => setData('reconcile', e.target.checked)}
                                />
                                <label htmlFor="reconcile" className="ms-2">
                                {data.reconcile ? __('si') : __('no')}
                                </label>
                            </div>
                            <InputError message={errors.reconcile} />
                        </div>

                        {/* Divisa (solo si conciliable = true) */}
                        <div className="col-md-3">
                            <label className="form-label">{__('divisa')}</label>
                            <SelectSearch
                                name="currency_id"
                                value={data.currency_id}
                                options={(props.currencies || []).map(c => ({
                                value: c.id,
                                label: `${c.name}`,
                                }))}
                                onChange={(opt) => setData('currency_id', opt ? opt.value : null)}
                                placeholder={__('divisa_selec')}
                                isDisabled={!data.reconcile}
                            />
                            <InputError message={errors.currency_id} />
                        </div>

                        

                        <h5 className="text-warning mb-0 mt-4">{__('cuenta_contable_manual_texto')}</h5>

                        {/* Numeración manual */}
                        <div className="col-lg-6">
                            <label className="form-label">{__('numeracion_manual')}</label>
                            <TextInput
                                type="text"
                                placeholder={__('numeracion_manual')}
                                value={data.manual_code ?? ''}
                                onChange={(e) => setData('manual_code', e.target.value)}
                                maxLength={100}
                            />
                            <InputError message={errors.manual_code} />
                        </div>

                        <div className="py-3">
                            <hr />
                        </div>
                        <h5 className="text-warning">{__('cuenta_contable_asistente_texto')}</h5>

                        {/* Nivel 1 */}
                        <div className="col-md-6">
                            <label className="form-label">{__('nivel')} 1</label>
                            <SelectSearch
                                name="level1"
                                value={data.level1}
                                options={(types || []).map(t => ({ value: t.id, label: t.type }))}
                                onChange={(opt) => handleLevelChange(1, opt ? opt.value : null)}
                                required
                                placeholder={__('nivel_selec')}
                            />
                        </div>

                        {/* Nivel 2 */}
                        <div className="col-md-6">
                            <label className="form-label">{__('nivel')} 2</label>
                            <SelectSearch
                                name="level2"
                                value={data.level2}
                                options={level2Options.map(o => ({ value: o.id, label: `${o.code} - ${o.name.charAt(0).toUpperCase() + o.name.slice(1)}` }))}
                                onChange={(opt) => handleLevelChange(2, opt ? opt.value : null)}
                                disabled={isLevel2Disabled}
                                placeholder={__('nivel_selec')}
                            />
                        </div>

                        {/* Nivel 3 */}
                        <div className="col-md-6">
                            <label className="form-label">{__('nivel')} 3</label>
                            <SelectSearch
                                name="level3"
                                value={data.level3}
                                options={level3Options.map(o => ({ value: o.id, label: `${o.code} - ${o.name.charAt(0).toUpperCase() + o.name.slice(1)}` }))}
                                onChange={(opt) => handleLevelChange(3, opt ? opt.value : null)}
                                disabled={isLevel3Disabled}
                                placeholder={__('nivel_selec')}
                            />
                        </div>

                        {/* Nivel 4 */}
                        <div className="col-md-6">
                            <label className="form-label">{__('nivel')} 4</label>
                            <SelectSearch
                                name="level4"
                                value={data.level4}
                                options={level4Options.map(o => ({ value: o.id, label: `${o.code} - ${o.name.charAt(0).toUpperCase() + o.name.slice(1)}` }))}
                                onChange={(opt) => setData('level4', opt ? opt.value : null)}
                                disabled={isLevel4Disabled}
                                placeholder={__('nivel_selec')}
                            />
                        </div>

                        <h5 className="text-warning mb-0 mt-4">{__('cuenta_contable_asistente_texto_2')}</h5>

                        {/* Numeración restante */}
                        <div className="col-md-6">
                            <label className="form-label">{__('completar_numeracion')} </label>
                            <TextInput
                                type="text"
                                value={data.digits}
                                onChange={(e) => setData('digits', e.target.value)}
                                maxLength={30}
                            />
                            <InputError message={errors.digits} />
                        </div>

                        {/* Notas */}
                        <div className="col-12 mb-3">
                            <label htmlFor="notes" className="form-label">
                                {__('notas')}
                            </label>
                            <Textarea
                                name="notes"
                                value={data.notes || ''}
                                onChange={(e) => setData('notes', e.target.value)}
                                className="form-control"
                            />
                            <InputError
                            message={errors.notes}
                            />
                        </div>

                        <div className="mt-4 text-end">
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