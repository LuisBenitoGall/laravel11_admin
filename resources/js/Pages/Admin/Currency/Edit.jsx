import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

// Components
import Checkbox from '@/Components/Checkbox';
import InfoPopover from '@/Components/InfoPopover';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Textarea from '@/Components/Textarea';
import TextInput from '@/Components/TextInput';

// Hooks
import { useTranslation } from '@/Hooks/useTranslation';

export default function Index({ auth, session, title, subtitle, availableLocales, currency }) {
    const __ = useTranslation();
    const props = usePage()?.props || {};
    const locale = props.locale || false;
    const languages = props.languages || [];
    const permissions = props.permissions || {};

    // Set formulario
    const { data, setData, errors, processing, post } = useForm({
        name: currency.name || '',
        status: currency.status,
        code: currency.code || '',
        number: currency.number || '',
        symbol: currency.symbol || ''
    });

    const [localErrors, setLocalErrors] = useState({});

    function handleSubmit(e) {
        e.preventDefault();
        const formData = new FormData();
        formData.append('_method', 'PUT');

        Object.entries(data).forEach(([key, value]) => {
            if (key === 'logo' && value instanceof File) {
                formData.append(key, value);
            } else if (typeof value === 'object' && value !== null) {
                formData.append(key, JSON.stringify(value));
            } else if (value !== null && value !== undefined) {
                formData.append(key, value);
            }
        });

        router.post(route('currencies.update', currency.id), formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => console.log('Moneda actualizada'),
            onError: (errors) => setLocalErrors(errors),
            onFinish: () => console.log('Petición finalizada'),
        });
    }

    //Acciones:
    const actions = [];
    if (permissions?.['currencies.index']) {
        actions.push({
            text: __('monedas_volver'),
            icon: 'la-angle-left',
            url: 'currencies.index',
            modal: false
        });
    }

    if (permissions?.['currencies.create']) {
        actions.push({
            text: __('moneda_nueva'),
            icon: 'la-plus',
            url: 'currencies.create',
            modal: false
        });
    }

    if (permissions?.['currencies.destroy']) {
        actions.push({
            text: __('eliminar'),
            icon: 'la-trash',
            method: 'delete',
            url: 'currencies.destroy',
            params: [currency.id],
            title: __('moneda_eliminar'),
            message: __('moneda_eliminar_confirm'),
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
                            {__('moneda')} <u>{ currency.name }</u>
                        </h2>
                    </div>

                    {/* Info */}
                    <div className="col-12 mt-2 mb-4">
                        <span className="text-muted me-5">
                            {__('creado')}: <strong>{currency.formatted_created_at}</strong> 
                        </span>

                        <span className="text-muted me-5">
                            {__('actualizado')}: <strong>{currency.formatted_updated_at}</strong>
                        </span>
                    </div>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit}>
                    <div className="row gy-3 mb-3">
                        {/* Moneda */}
                        <div className="col-lg-6">
                            <div className="position-relative">
                                <label htmlFor="name" className="form-label">{ __('moneda') }*</label>
                                <TextInput 
                                    type="text"
                                    name="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    maxLength={100}
                                    required
                                />
                                <InputError message={localErrors.name} />
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
                    </div>
                    
                    <div className="row gy-3">
                        {/* Código */}
                        <div className="col-lg-2">
                            <div className="position-relative">
                                <label htmlFor="code" className="form-label">{ __('codigo') }</label>
                                <TextInput 
                                    className="" 
                                    type="text"
                                    name="code"
                                    placeholder={__('codigo')} 
                                    value={data.code} 
                                    onChange={(e) => setData('code', e.target.value)}
                                    maxLength={3}
                                />
                                <InfoPopover code="currency-code" />
                                <InputError message={localErrors.code} />
                            </div>
                        </div>

                        {/* Número */}
                        <div className="col-lg-2">
                            <div className="position-relative">
                                <label htmlFor="number" className="form-label">{ __('numero') } ISO</label>
                                <TextInput 
                                    className="" 
                                    type="text"
                                    name="number"
                                    placeholder={__('numero')} 
                                    value={data.number} 
                                    onChange={(e) => setData('number', e.target.value)}
                                    maxLength={4}
                                />
                                <InfoPopover code="currency-number" />
                                <InputError message={localErrors.number} />
                            </div>
                        </div>

                        {/* Símbolo */}
                        <div className="col-lg-2">
                            <div className="position-relative">
                                <label htmlFor="symbol" className="form-label">{ __('simbolo') }</label>
                                <TextInput 
                                    className="" 
                                    type="text"
                                    name="symbol"
                                    placeholder={__('simbolo')} 
                                    value={data.symbol} 
                                    onChange={(e) => setData('symbol', e.target.value)}
                                    maxLength={2}
                                />
                                <InfoPopover code="currency-symbol" />
                                <InputError message={localErrors.symbol} />
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
        </AdminAuthenticatedLayout>
    );
}