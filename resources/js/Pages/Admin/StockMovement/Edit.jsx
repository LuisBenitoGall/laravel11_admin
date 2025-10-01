import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';
import { Tooltip } from 'react-tooltip';
import { useState } from 'react';

//Components:
import Checkbox from '@/Components/Checkbox';
import InfoPopover from '@/Components/InfoPopover';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import RadioButton from '@/Components/RadioButton';
import Tabs from '@/Components/Tabs';
import TabsLocale from '@/Components/TabsLocale';
import Textarea from '@/Components/Textarea';
import TextInput from '@/Components/TextInput';

//Hooks:
import { useTranslation } from '@/Hooks/useTranslation';

//Utils:
import { useHandleDelete } from '@/Utils/useHandleDelete.jsx';

export default function Index({ auth, session, title, subtitle, availableLocales, movement, explanations, sign }) {
    const __ = useTranslation();
    const props = usePage()?.props || {};
    const locale = props.locale || false;
    const languages = props.languages || [];
    const permissions = props.permissions || {};

    // Set formulario:
    const {data, setData, put, reset, errors, processing} = useForm({
        name: movement.name || '',
        acronym: movement.acronym || '',
        status: movement.status,
        ...Object.fromEntries(
            availableLocales.map(code => [
                `explanation_${code}`,
                explanations[code] || ''
            ])
        )
    })

    const handleChange = (e) => {
        const { name, type, checked, value, files } = e.target;
        if (type === 'checkbox') {
            setData(name, checked);
        } else if (type === 'file') {
            setData(name, files[0]);
        } else {
            setData(name, value);
        }
    };

    //Confirmación de eliminación:
    const { handleDelete } = useHandleDelete('movimiento', 'stock-movements.destroy', [movement.id]);

    //Envío formulario:
    function handleSubmit(e){
        e.preventDefault();
        put(route('stock-movements.update', movement.id),
        {
            preserveScroll: true,
            onSuccess: () => console.log('Movimiento actualizado'),
        });
    }

    //Acciones:
    const actions = [];
    if (permissions?.['stock-movements.index']) {
        actions.push({
            text: __('stock_movimientos_volver'),
            icon: 'la-angle-left',
            url: 'stock-movements.index',
            modal: false
        });
    }

    if (permissions?.['stock-movements.create']) {
        actions.push({
            text: __('movimiento_nuevo'),
            icon: 'la-plus',
            url: 'stock-movements.create',
            modal: false
        });
    }

    if (permissions?.['stock-movements.destroy']) {
        actions.push({
            text: __('eliminar'),
            icon: 'la-trash',
            method: 'delete',
            url: 'stock-movements.destroy',
            params: [movement.id],
            title: __('movimiento_eliminar'),
            message: __('movimiento_eliminar_confirm'),
            modal: false
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
                <div className="row">
                    <div className="col-12">
                        <h2>
                            {__('stock_movimiento')} <u>{ movement.name }</u>
                        </h2>
                    </div>

                    {/* Info */}
                    <div className="col-12 mt-2 mb-4">
                        <span className="text-muted me-5">
                            {__('creado')}: <strong>{movement.formatted_created_at}</strong> 
                        </span>

                        <span className="text-muted me-5">
                            {__('actualizado')}: <strong>{movement.formatted_updated_at}</strong>
                        </span>

                        <span className="text-muted me-5">
                            {__('signo')}: <strong>{sign}</strong>
                        </span>
                    </div>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit}>
                    <div className="row gy-3">
                        {/* Movimiento */}
                        <div className="col-lg-6">
                            <div>
                                <label htmlFor="name" className="form-label">{ __('movimiento') }*</label>
                                <TextInput 
                                    className="" 
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

                        {/* Siglas */}
                        <div className="col-lg-2">
                            <div>
                                <label htmlFor="acronym" className="form-label">{ __('siglas') }*</label>
                                <TextInput 
                                    className="" 
                                    type="text"
                                    placeholder={__('siglas')} 
                                    value={data.acronym} 
                                    onChange={(e) => setData('acronym', e.target.value)}
                                    maxLength={3}
                                    required
                                />

                                <InputError message={errors.acronym} />
                            </div>
                        </div>

                        {/* Observaciones */}
                        <div className="col-12 mt-4">
                            <TabsLocale availableLocales={availableLocales} languages={languages}>
                                {locale => {
                                    const humanName = Array.isArray(languages[locale])
                                        ? languages[locale][3]
                                        : locale;

                                    const fieldName = `explanation_${locale}`;
                                
                                return (
                                    <div className="mb-3">
                                        <label
                                        htmlFor={`explanation_[${locale}]`}
                                        className="form-label"
                                        >
                                        {__('observaciones')} {humanName}
                                        </label>
                                        <Textarea
                                        id={fieldName}
                                        name={fieldName}
                                        value={data[fieldName] || ''}
                                        onChange={handleChange}
                                        className="form-control"
                                        />
                                        <InputError
                                        message={errors[fieldName]}
                                        />
                                    </div>
                                )}}
                            </TabsLocale>
                        </div>
                    </div>

                    <div className='mt-4 text-end'>
                        <PrimaryButton disabled={processing} className='btn btn-rdn'>
                            {processing ? __('procesando')+'...':__('guardar')}
                        </PrimaryButton>	
                    </div>
                </form>
            </div>
        </AdminAuthenticatedLayout>
    );
}