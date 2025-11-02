import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Tooltip } from 'react-tooltip';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

// Components
import Checkbox from '@/Components/Checkbox';
import InfoPopover from '@/Components/InfoPopover';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
// import RadioButton from '@/Components/RadioButton'; // FLEX OFF: radios de "Saldo esperado" deshabilitados por ortodoxia
import SelectSearch from '@/Components/SelectSearch';
import Textarea from '@/Components/Textarea';
import TextInput from '@/Components/TextInput';

// Hooks
import { useTranslation } from '@/Hooks/useTranslation';

export default function Index({ auth, session, title, subtitle, types, natureOptions, parentOptions, currencies, availableLocales }){
    const __ = useTranslation();
    const props = usePage()?.props || {};
    const permissions = props.permissions || {};

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
        normal_side: null,      // 'debit' | 'credit' (calculado, no editable)
        opening_balance: '',
        is_group: false,
        parent_id: null,
        level: null,            // preview (backend recalcula)
        digits: '',
        notes: ''
    });

    // ====== FLEX OFF (ortodoxia): radios y animaciones desactivados ======
    // const [normalSideTouched, setNormalSideTouched] = useState(false);
    // const [normalSideFlash, setNormalSideFlash] = useState(false);
    // const [showNormalSideControls, setShowNormalSideControls] = useState(false);

    // ====== Asistente por niveles ======
    const [level2Options, setLevel2Options] = useState([]);
    const [level3Options, setLevel3Options] = useState([]);
    const [level4Options, setLevel4Options] = useState([]);

    // ====== Cuenta padre: búsqueda asíncrona con debounce ======
    const [parentOpts, setParentOpts] = useState(
        (parentOptions || []).map(p => ({
        value: p.id,
        label: `${p.code} — ${p.name}`,
        meta: p, // level, is_group, etc.
        }))
    );
    const [parentLoading, setParentLoading] = useState(false);
    const parentDebounceRef = useRef(null);

    const fetchParentOptions = async (q = '') => {
        try {
            setParentLoading(true);
            const { data: opts } = await axios.get(route('accounting-accounts.parent-options'), { params: { q, limit: 20 } });
            setParentOpts((opts || []).map(o => ({
                value: o.value ?? o.id,
                label: o.label ?? `${o.code} — ${o.name}`,
                meta: o.meta ?? { level: o.level ?? 0, is_group: true, code: o.code, name: o.name },
            })));
        } catch (e) {
            console.error('Error fetching parent options:', e);
            setParentOpts([]);
        } finally {
            setParentLoading(false);
        }
    };

    const handleParentSearchChange = (q) => {
        if (parentDebounceRef.current) clearTimeout(parentDebounceRef.current);
        parentDebounceRef.current = setTimeout(() => fetchParentOptions(q || ''), 300);
    };

    // ====== Numeración manual vs asistente (mutuamente excluyentes) ======
    const manualFilled = (data.manual_code || '').trim() !== '';
    const anyLevelSelected = !!data.level1 || !!data.level2 || !!data.level3 || !!data.level4;

    useEffect(() => {
        if (manualFilled) {
        setData(current => {
            const next = { ...current, level1: null, level2: null, level3: null, level4: null };
            setLevel2Options([]); setLevel3Options([]); setLevel4Options([]);
            return next;
        });
        }
    }, [manualFilled]);

    const manualDisabled = anyLevelSelected;

    // ====== Saldo esperado (calculado por naturaleza) ======
    const computeNormalSide = (nature) => {
        if (!nature) return null;
        return ['asset', 'expense'].includes(nature) ? 'debit' : 'credit';
    };

    useEffect(() => {
        setData('normal_side', computeNormalSide(data.nature));
    }, [data.nature]);

    // ====== Reconciliación solo en Activo/Pasivo y nunca en agrupadoras ======
    const canReconcileByNature = ['asset', 'liability'].includes(data.nature);
    useEffect(() => {
        if (!canReconcileByNature || data.is_group) {
        if (data.reconcile) setData('reconcile', false);
        if (data.currency_id) setData('currency_id', null);
        }
    }, [data.nature, data.is_group]);

    useEffect(() => {
        if (!data.reconcile) setData('currency_id', null);
    }, [data.reconcile]);

    // ====== Árbol: nivel preview a partir del padre ======
    useEffect(() => {
        const opt = parentOpts.find(o => o.value === data.parent_id);
        const parentLevel = opt?.meta?.level;
        setData('level', typeof parentLevel === 'number' ? parentLevel + 1 : null);
    }, [data.parent_id, parentOpts]);

    // ====== Asistente PGC: carga anidada ======
    const handleLevelChange = async (level, selectedId) => {
        if (level === 1) {
            setData('level1', selectedId || null);
            setData(current => ({ ...current, level2: null, level3: null, level4: null }));
            setLevel2Options([]); setLevel3Options([]); setLevel4Options([]);

            if (!selectedId) return;
            try {
                const { data: items } = await axios.get(route('accounting-account-types.select', { type: selectedId }));
                setLevel2Options(items || []);
            } catch {
                setLevel2Options([]);
            }
        }

        if (level === 2) {
            setData('level2', selectedId || null);
            setData(current => ({ ...current, level3: null, level4: null }));
            setLevel3Options([]); setLevel4Options([]);

        if (!selectedId) return;
            try {
                const { data: items } = await axios.get(route('accounting-account-types.select', { type: selectedId }));
                setLevel3Options(items || []);
            } catch {
                setLevel3Options([]);
            }
        }

        if (level === 3) {
            setData('level3', selectedId || null);
            setData(current => ({ ...current, level4: null }));
            setLevel4Options([]);

            if (!selectedId) return;
            try {
                const { data: items } = await axios.get(route('accounting-account-types.select', { type: selectedId }));
                setLevel4Options(items || []);
            } catch {
                setLevel4Options([]);
            }
        }
    };

    // Disabled derivado del estado de niveles
    const isLevel2Disabled = !data.level1 || level2Options.length === 0;
    const isLevel3Disabled = !data.level2 || level3Options.length === 0;
    const isLevel4Disabled = !data.level3 || level4Options.length === 0;

    const sanitizeMoney = (v) => v.replace(',', '.').replace(/[^\d.]/g, '');
    const handleOpeningChange = (e) => setData('opening_balance', sanitizeMoney(e.target.value));

    function handleSubmit(e){
        e.preventDefault();
        post(route('accounting-accounts.store'), { onSuccess: () => reset() });
    }

    const actions = [];
    if (permissions?.['accounting-accounts.index']) {
        actions.push({ text: __('cuentas_volver'), icon: 'la-angle-left', url: 'accounting-accounts.index', modal: false });
    }

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
                        <InputError message={errors.nature} />
                        </div>

                        {/* Saldo esperado (calculado, no editable) */}
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

                        {/* FLEX OFF: radios para forzar Debe/Haber deshabilitados por ortodoxia
                        <RadioButton
                            name="normal_side"
                            value={data.normal_side}
                            onChange={(e) => { setData('normal_side', e?.target?.value); setNormalSideTouched(true); }}
                            options={[
                            { value: 'debit',  label: __('debe') },
                            { value: 'credit', label: __('haber') },
                            ]}
                        />
                        */}
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
                            disabled={data.is_group || !canReconcileByNature}
                            />
                            <label htmlFor="reconcile" className="ms-2">
                            {data.reconcile ? __('si') : __('no')}
                            </label>
                        </div>
                        <small className="text-muted">
                            {!canReconcileByNature ? __('solo_activo_pasivo') : ''}
                        </small>
                        <InputError message={errors.reconcile} />
                        </div>

                        {/* Divisa */}
                        <div className="col-md-3">
                        <label className="form-label">{__('divisa')}</label>
                        <SelectSearch
                            name="currency_id"
                            value={data.currency_id}
                            options={(currencies || props.currencies || []).map(c => ({
                            value: c.id,
                            label: `${c.name}`,
                            }))}
                            onChange={(opt) => setData('currency_id', opt ? opt.value : null)}
                            placeholder={__('divisa_selec')}
                            isDisabled={data.is_group || !data.reconcile}
                        />
                        <InputError message={errors.currency_id} />
                        </div>

                        {/* Agrupadora */}
                        <div className="col-md-2">
                        <label className="form-label d-block">{__('agrupadora')}</label>
                        <div className="form-check form-switch pt-2">
                            <Checkbox
                            id="is_group"
                            name="is_group"
                            checked={!!data.is_group}
                            onChange={(e) => setData('is_group', e.target.checked)}
                            />
                            <label htmlFor="is_group" className="ms-2">
                            {data.is_group ? __('si') : __('no')}
                            </label>
                        </div>
                        <InputError message={errors.is_group} />
                        </div>

                        {/* Saldo de apertura (solo postables) */}
                        {!data.is_group && (
                        <div className="col-md-3">
                            <label className="form-label">{__('saldo_apertura')}</label>
                            <TextInput
                            type="number"
                            inputMode="decimal"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            value={data.opening_balance ?? ''}
                            onChange={handleOpeningChange}
                            disabled={data.is_group}
                            />
                            <small className="text-muted d-block mt-1">
                            {__('moneda_base_empresa')}. {__('se_aplica_en')} {data.normal_side === 'debit' ? __('debe') : __('haber')}
                            </small>
                            <InputError message={errors.opening_balance} />
                        </div>
                        )}

                        {/* Cuenta padre (filtrada + búsqueda asíncrona) */}
                        <div className="col-lg-3">
                        <label className="form-label">{__('cuenta_padre')}</label>
                        <SelectSearch
                            name="parent_id"
                            value={data.parent_id}
                            options={parentOpts.filter(o => o?.meta?.is_group)}
                            onChange={(opt) => setData('parent_id', opt ? opt.value : null)}
                            placeholder={__('cuenta_padre_selec')}
                            onMenuOpen={() => { if (parentOpts.length === 0) fetchParentOptions(''); }}
                            onSearchChange={handleParentSearchChange}
                            isLoading={parentLoading}
                            // FLEX OFF: no bloquear para postables; el backend ya valida que el padre sea agrupadora
                            // isDisabled={!data.is_group}
                        />
                        <InputError message={errors.parent_id} />
                        </div>

                        {/* Nivel (preview calculado) */}
                        <div className="col-md-2">
                        <label className="form-label">{__('nivel')}</label>
                        <div className="form-control bg-light">
                            {typeof data.level === 'number' ? data.level : '—'}
                        </div>
                        <small className="text-muted">
                            {__('nivel_autocalculado_aviso')}
                        </small>
                        </div>

                        <h5 className="text-warning mb-0 mt-4">{__('cuenta_contable_manual_texto')}</h5>

                        {/* Numeración manual (bloqueada si se usan niveles) */}
                        <div className="col-lg-6">
                        <label className="form-label">{__('numeracion_manual')}</label>
                        <TextInput
                            type="text"
                            placeholder={__('numeracion_manual')}
                            value={data.manual_code ?? ''}
                            onChange={(e) => setData('manual_code', e.target.value)}
                            maxLength={100}
                            disabled={manualDisabled}
                        />
                        <InputError message={errors.manual_code} />
                        </div>

                        <div className="py-3"><hr /></div>
                        <h5 className="text-warning">{__('cuenta_contable_asistente_texto')}</h5>

                        {/* Nivel 1 */}
                        <div className="col-md-6">
                        <label className="form-label">{__('nivel')} 1</label>
                        <SelectSearch
                            name="level1"
                            value={data.level1}
                            options={(types || []).map(t => ({ value: t.id, label: t.type }))}
                            onChange={(opt) => handleLevelChange(1, opt ? opt.value : null)}
                            required={!manualFilled}
                            placeholder={__('nivel_selec')}
                            isDisabled={manualFilled}
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
                            isDisabled={manualFilled || isLevel2Disabled}
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
                            isDisabled={manualFilled || isLevel3Disabled}
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
                            isDisabled={manualFilled || isLevel4Disabled}
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
                        <InputError message={errors.notes} />
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
