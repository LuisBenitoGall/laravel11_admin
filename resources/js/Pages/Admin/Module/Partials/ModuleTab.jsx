import React from 'react';
import { usePage, useForm } from '@inertiajs/react';

//Components:
import ColorPicker from '@/Components/ColorPicker';
import Checkbox from '@/Components/Checkbox';
import InfoPopover from '@/Components/InfoPopover';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SelectInput from '@/Components/SelectInput';
import Textarea from '@/Components/Textarea';
import TextInput from '@/Components/TextInput';

//Hooks:
import { useTranslation } from '@/Hooks/useTranslation';

export default function ModuleTab({ data, setData, errors, levelsArray, handleSubmit, processing }) {
    const __ = useTranslation();

    return (
        <div className="pb-4">
            {/* Formulario */}
            <div className="row gy-3">
                {/* Nombre módulo */}
                <div className="col-lg-6">
                    <div className="position-relative">
                        <label htmlFor="name" className="form-label">{ __('modulo') }*</label>
                        <TextInput 
                            className="" 
                            type="text"
                            placeholder={__('nombre')} 
                            value={data.name} 
                            onChange={(e) => setData('name', e.target.value)}
                            maxLength={100}
                            required
                        />
                        <InfoPopover code="module-name" />

                        <InputError message={errors.name} />
                    </div>
                </div>

                {/* Etiqueta */}
                <div className="col-lg-5">
                    <div className="position-relative">
                        <label htmlFor="label" className="form-label">{ __('etiqueta') }*</label>
                        <TextInput 
                            className="" 
                            type="text"
                            placeholder={__('etiqueta')} 
                            value={data.label} 
                            onChange={(e) => setData('label', e.target.value)}
                            maxLength={100}
                            required
                        />
                        <InfoPopover code="module-label" />

                        <InputError message={errors.name} />
                    </div>
                </div>

                {/* Nivel. Este campo no es editable. */}
                {/* <div className="col-lg-6">
                    <div className="position-relative">
                        <label htmlFor="level" className="form-label">{ __('nivel') }*</label>
                        <SelectInput
                            className="form-select"
                            name="level"
                            value={data.level}
                            onChange={(e) => setData('level', e.target.value)}
                            required
                        >
                            <option value="">{ __('opcion_selec') }</option>
                            {levelsArray.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </SelectInput>
                        <InfoPopover code="module-level" />
                    
                        <InputError message={errors.level} />
                    </div>
                </div> */}

                {/* Icono */}
                <div className="col-lg-2">
                    <div className="position-relative">
                        <label htmlFor="icon" className="form-label">{ __('icono') }</label>
                        <TextInput 
                            type="text"
                            placeholder={__('icon')} 
                            value={data.icon} 
                            onChange={(e) => setData('icon', e.target.value)}
                            maxLength={100}
                        />
                        <InfoPopover code="module-icon" />

                        <InputError message={errors.icon} />
                    </div>
                </div>

                {/* Color */}
                <div className="col-lg-2">
                    <div className="position-relative">
                        <label htmlFor="color" className="form-label">{ __('color') }</label>
                        <ColorPicker
                            value={data.color}
                            onChange={(e) => setData('color', e.target.value)}
                            name="color"
                        />
                        <InfoPopover code="module-color" />
                        
                        <InputError message={errors.color} />
                    </div>
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

                {/* Descripción */}
                <div className="col-12">
                    <div className="position-relative">
                        <label htmlFor="explanation" className="form-label">{ __('descripcion') }</label>
                        <Textarea
                            id="explanation"
                            name="explanation"
                            value={data.explanation ?? ''}
                            onChange={(e) => {
                                console.log('explanation value', e.target.value);
                                setData('explanation', e.target.value);
                            }}
                            className="form-control"
                        />
                    </div>
                </div>
            </div>

            <div className='mt-4 text-end'>
                <PrimaryButton disabled={processing} className='btn btn-rdn'>
                    {processing ? __('procesando')+'...':__('guardar')}
                </PrimaryButton>	
            </div>
        </div>
    );
}