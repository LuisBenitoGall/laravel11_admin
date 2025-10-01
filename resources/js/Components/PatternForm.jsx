import React from 'react';
import { useForm } from '@inertiajs/react';

//Components:
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import RadioButton from '@/Components/RadioButton';
import TextInput from '@/Components/TextInput';
import PrimaryButton from '@/Components/PrimaryButton';

//Hooks:
import { useTranslation } from '@/Hooks/useTranslation';

export default function PatternForm({ action, initial = {} }) {
    const __ = useTranslation();

    const { data, setData, post, processing, errors } = useForm({
        name: initial.name || '',
        ndigits: initial.ndigits || 1,
        status: initial.status ?? true,
        yearly_reset: initial.yearly_reset ?? false,
        segments: initial.segments || [{ type: 'digits' }]
    });

    // Solo permite añadir un segmento digits
    const hasDigits = data.segments.some(s => s.type === 'digits');
    const addSegment = () => {
        // Si ya existe digits, solo permite añadir text o year
        setData('segments', [...data.segments, { type: hasDigits ? 'text' : 'digits', value: '' }]);
    };

    const removeSegment = (idx) => {
        const arr = data.segments.filter((_, i) => i !== idx);
        // Si no queda ningún digits, permite añadirlo de nuevo
        setData('segments', arr);
    };

    const updateSegment = (idx, patch) => {
        // Si se intenta cambiar a digits y ya existe otro, no lo permite
        if (patch.type === 'digits' && hasDigits && data.segments[idx].type !== 'digits') return;
        const arr = data.segments.map((s, i) => (i === idx ? { ...s, ...patch } : s));
        setData('segments', arr);
    };

    const onSubmit = (e) => {
        e.preventDefault();
        if (!data.segments.some(s => s.type === 'digits')) return;
        post(action);
    };

    // Vista previa simple (no es la numeración real del backend)
    const preview = () => {
        const y = new Date();
        const YY = y.getFullYear().toString().slice(-2);
        const YYYY = y.getFullYear().toString();
        const num = String(1).padStart(data.ndigits || 1, '0');
        return (data.segments || []).map(seg => {
            if (seg.type === 'digits') return num;
            if (seg.type === 'text') return seg.value || '';
            if (seg.type === 'year') return (seg.value || 'YYYY') === 'YY' ? YY : YYYY;
            return '';
        }).join('');
    };

    return (
        <form onSubmit={onSubmit} autoComplete="off">
            <div className="row gy-3 mb-4">
                {/* Nombre del patrón */}
                <div className="col-6">
                    <div className="position-relative">
                        <label htmlFor="name" className="form-label">{__('patron_nombre')} *</label>
                        <TextInput
                            type="text"
                            name="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            maxLength={150}
                            required
                        />

                        <InputError message={errors.name} />
                    </div>
                </div>

                {/* Dígitos del número */}
                <div className="col-2">
                    <div className="position-relative">
                        <label htmlFor="ndigits" className="form-label">{__('digitos_num')}*</label>
                        <TextInput
                            type="number"
                            name="ndigits"
                            value={data.ndigits}
                            onChange={(e) => setData('ndigits', e.target.value)}
                            maxLength={150}
                            required
                        />

                        <InputError message={errors.ndigits} />
                    </div>
                </div>

                {/* Patrón activo */}
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

                {/* Reseteo anual */}
                {initial.yearly_reset === true && (
                  <div className="col-lg-2 text-center">
                      <div className="position-relative">
                          <label htmlFor="yearly_reset" className="form-label">{ __('reset_anual') }</label>
                          <div className='pt-1 position-relative'>
                              <Checkbox 
                                  className="xl"
                                  name="yearly_reset"
                                  checked={data.yearly_reset}
                                  onChange={(e) => setData('yearly_reset', e.target.checked)}
                              />
                          </div>
                      </div>
                  </div>
                )}
            </div>

            <div className="row gy-3 mb-4">
                {/* Añadir segmento */}
                <label className="col-lg-2 col-form-label">{__('segmento_add')}</label>
                <div className="col-lg-1 pt-1">
                    <button
                        type="button"
                        className="btn btn-warning btn-circle text-white"
                        onClick={addSegment}
                        disabled={hasDigits && data.segments.filter(s => s.type === 'digits').length > 0}
                    >
                        <i className="la la-plus" />
                    </button>
                </div>
                <label className="col-lg-8 col-form-label text-warning">
                    <span dangerouslySetInnerHTML={{ __html: __('segmento_add_info') }} />
                </label>
            </div>

            <div className="gy-3 mb-3">
                <div className="row">
                    <label className="col-lg-2 col-form-label">{ __('segmentos') }</label>
                    <div className="col-md-8">
                        {errors.segments && <div className="text-danger mb-2">{errors.segments}</div>}
                        {!data.segments.some(s => s.type === 'digits') && (
                            <div className="pb-1">
                                <small className="text-danger">
                                    {__('patron_digitos_aviso')}
                                </small>
                            </div>
                        )}
                        {data.segments.map((seg, idx) => (
                            <div className="row g-2 align-items-start mb-2" key={idx}>
                                <div className="col-6">
                                    <select className="form-select" value={seg.type}
                                    onChange={e => updateSegment(idx, { type: e.target.value, value: undefined })}>
                                        <option value="digits">Dígitos</option>
                                        <option value="text">Texto</option>
                                        <option value="year">Año</option>
                                    </select>
                                </div>

                                <div className="col-5">
                                    {seg.type === 'text' && (
                                    <input className="form-control"
                                    value={seg.value || ''}
                                    onChange={e => updateSegment(idx, { value: e.target.value })} />
                                    )}
                                    {seg.type === 'year' && (
                                    <select className="form-select"
                                    value={seg.value || 'YYYY'}
                                    onChange={e => updateSegment(idx, { value: e.target.value })}>
                                    <option value="YYYY">YYYY</option>
                                    <option value="YY">YY</option>
                                    </select>
                                    )}
                                    {seg.type === 'digits' && (
                                    <input className="form-control" value={'#'.repeat(Math.min(10, data.ndigits))} disabled />
                                    )}
                                </div>

                                <div className="col-1 d-flex justify-content-start pt-1">
                                    {idx > 0 && (
                                        <button type="button" className="btn btn-danger btn-sm" onClick={() => removeSegment(idx)} title={__('segmento_eliminar')}>
                                            <i className="la la-times" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Vista previa */}
                <div className="row mt-4">
                    <label className="col-lg-2 col-form-label">{ __('vista_previa') }</label>
                    <div className="col-md-5 text-center">
                        <code className="pattern-code">{ preview() }</code>
                    </div>                     
                </div>

                <div className='mt-4 text-end'>
                    <PrimaryButton
                        disabled={processing || !data.segments.some(s => s.type === 'digits')}
                        className='btn btn-rdn'
                    >
                        {processing ? __('procesando')+'...':__('guardar')}
                    </PrimaryButton>
                </div>
            </div>
        </form>
    );
}