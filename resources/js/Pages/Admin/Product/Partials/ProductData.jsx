import React from 'react';
import { router, useForm, usePage } from '@inertiajs/react';

//Components:
import Checkbox from '@/Components/Checkbox';
import DatePickerToForm from '@/Components/DatePickerToForm';
import FileInput from '@/Components/FileInput';
import InfoPopover from '@/Components/InfoPopover';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import RadioButton from '@/Components/RadioButton';
import TextInput from '@/Components/TextInput';
import SelectInput from '@/Components/SelectInput';

//Hooks:
import { useSweetAlert } from '@/Hooks/useSweetAlert';
import { useTranslation } from '@/Hooks/useTranslation';

export default function ProductData({ product, arr_production_status, arr_patterns }) {
    const __ = useTranslation();
    const props = usePage()?.props || {};
    const locale = props.locale || false;
    const languages = props.languages || [];
    const { showConfirm } = useSweetAlert();
    const permissions = props.permissions || {};

    // Set formulario:
    const { data, setData, put, processing, errors } = useForm({
        name: product.name || '',
        production_status: product.production_status || '',
        status: product.status || true
    });
    console.log(arr_patterns);
    const handleChange = (e) => {
        const { name, type, checked, value, files } = e.target;
        if (type === 'checkbox') {
            setData(name, checked);
        } else if (type === 'file') {
            setData(name, files.length ? files[0] : null);
        } else {
            setData(name, value);
        }
    };

    // Envío formulario:
    function handleSubmit(e){
        e.preventDefault();

        const formData = new FormData();
        formData.append('_method', 'PUT');

        Object.entries(data).forEach(([key, value]) => {
            if (key === 'signature' && value instanceof File) {
                formData.append(key, value);
            } else if (typeof value === 'object' && value !== null) {
                formData.append(key, JSON.stringify(value));
            } else if (value !== null && value !== undefined) {
                formData.append(key, value);
            }
        });

        router.post(route('products.update', product.id), formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => console.log('Producto actualizado'),
            onError: (errors) => console.error('Errores:', errors),
            onFinish: () => console.log('Petición finalizada'),
        });
    }

    return (
        <div className="col-12 gy-2">
            {/* Formulario */}
            <form onSubmit={handleSubmit}>
                <div className="row gy-3 mb-3"> 
                    {/* Nombre */}
                    <div className="col-md-6">
                        <div>
                            <label htmlFor="name" className="form-label">{ __('nombre') }*</label>
                            <TextInput 
                                className="" 
                                name="name"
                                type="text"
                                placeholder={__('nombre')} 
                                value={data.name} 
                                onChange={(e) => setData('name', e.target.value)}
                                maxLength={150}
                                required
                            />

                            <InputError message={errors.name} />
                        </div>
                    </div>

                    {/* Tipo de producto */}
                    <div className="col-md-4">
                        <div>
                            <label htmlFor="production_status" className="form-label">{__('producto_tipo')}</label>
                            <SelectInput
                                className="form-select"
                                name="production_status"
                                value={data.production_status}
                                onChange={e => setData('production_status', e.target.value)}
                            >
                                <option value="">{ __('opcion_selec') }</option>
                                {Array.isArray(arr_production_status) && arr_production_status.length > 0 &&
                                    arr_production_status.map(option => (
                                        <option key={option.value} value={option.value}>{option.label}</option>
                                    ))
                                }
                                {arr_production_status && typeof arr_production_status === 'object' && !Array.isArray(arr_production_status) &&
                                    Object.entries(arr_production_status).map(([value, label]) => (
                                        <option key={value} value={value}>{label}</option>
                                    ))
                                }
                            </SelectInput>
                            <InfoPopover code="" />
                            <InputError message={errors.production_status} />
                        </div>
                    </div>

                    {/* Estado */}
                    <div className="col-lg-2 text-center">
                        <div>
                            <label htmlFor="status" className="form-label">{ __('estado') }</label>
                            <div className='pt-1 position-relative'>
                                <Checkbox 
                                    className="xl"
                                    name="status"
                                    checked={data.status}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>    
                    </div>

                    {/* Referencia automática */}
                    <div className="col-md-4">
                        <div>
                            <label htmlFor="pattern_id" className="form-label">{__('ref_automatica')}</label>
                            {(
                                (Array.isArray(arr_patterns) && arr_patterns.length > 0) ||
                                (arr_patterns && typeof arr_patterns === 'object' && !Array.isArray(arr_patterns) && Object.keys(arr_patterns).length > 0)
                            ) ? (
                                <SelectInput
                                    className="form-select"
                                    name="pattern_id"
                                    value={data.pattern_id}
                                    onChange={e => setData('pattern_id', e.target.value)}
                                >
                                    <option value="">{ __('opcion_selec') }</option>
                                    {Array.isArray(arr_patterns) && arr_patterns.length > 0 &&
                                        arr_patterns.map(option => (
                                            <option key={option.id} value={option.id}>{option.name}</option>
                                        ))
                                    }
                                    {arr_patterns && typeof arr_patterns === 'object' && !Array.isArray(arr_patterns) &&
                                        Object.entries(arr_patterns).map(([value, label]) => (
                                            <option key={value} value={value}>{label}</option>
                                        ))
                                    }
                                </SelectInput>
                            ) : (
                                <label className="text-warning mt-1">{ __('patrones_no_hay') }</label>
                            )}
                            <InfoPopover code="" />
                            <InputError message={errors.pattern_id} />
                        </div>
                    </div>

                    {/* Referencia manual */}
                    <div className="col-md-4">
                        <div>
                            <label htmlFor="" className="form-label">{__('ref_manual')}</label>
                            <TextInput 
                                className="" 
                                name="name"
                                type="text"
                                placeholder={__('ref_manual')} 
                                value={data.name} 
                                onChange={(e) => setData('name', e.target.value)}
                                maxLength={150}
                                required
                            />

                            <InputError message={errors.name} />
                        </div>
                    </div>

                    {/* Centro de coste */}
                    <div className="col-md-4">
                        <div>
                            <label htmlFor="cost_center" className="form-label">{__('centro_coste')}</label>
                            <TextInput
                                className=""
                                name="cost_center"
                                type="text"
                                placeholder={__('centro_coste')}
                                value={data.cost_center}
                                onChange={(e) => setData('cost_center', e.target.value)}
                                maxLength={150}
                                required
                            />

                            <InputError message={errors.cost_center} />
                        </div>
                    </div>

                </div>

                <div className='mt-4 text-end'>
                    <PrimaryButton disabled={processing} className='btn btn-rdn'>
                        {processing ? __('procesando')+'...':__('guardar')}
                    </PrimaryButton>	
                </div>
            </form>   
        </div>
    );
}
