import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';

//Components:
import Checkbox from '@/Components/Checkbox';
import InfoPopover from '@/Components/InfoPopover';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
//import SecondaryButton from '@/Components/SecondaryButton';
import SelectSearch from '@/Components/SelectSearch';
import TextInput from '@/Components/TextInput';

//Hooks:
import { useTranslation } from '@/Hooks/useTranslation';

export default function Index({ auth, session, title, subtitle, account, banks, accounting_accounts, availableLocales }){
    const __ = useTranslation();
    const props = usePage()?.props || {};
    const locale = props.locale || false;
    const languages = props.languages || [];
    const permissions = props.permissions || {};

    // Set formulario:
    const {data, setData, post, reset, errors, processing} = useForm({
        accounting_account_id: account.accounting_account_id || '',
        bank_id: account.bank_id || '',
        country_code: account.country_code || '',
        entity: account.entity || '',
        office: account.office || '',
        dc: account.dc || '',
        digits: account.digits || '',
        featured: account.featured,
        status: account.status
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

        router.post(route('bank-accounts.update', account.id), formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => console.log('Cuenta actualizada'),
            onError: (errors) => setLocalErrors(errors),
            onFinish: () => console.log('Petición finalizada'),
        });
    }

    //Acciones:
    const actions = [];
    if (permissions?.['bank-accounts.index']) {
        actions.push({
            text: __('bancos_cuentas_volver'),
            icon: 'la-angle-left',
            url: 'bank-accounts.index',
            modal: false
        });
    }

    if (permissions?.['bank-accounts.create']) {
        actions.push({
            text: __('cuenta_nueva'),
            icon: 'la-plus',
            url: 'bank-accounts.create',
            modal: false
        });
    }

    if (permissions?.['bank-accounts.destroy']) {
        actions.push({
            text: __('eliminar'),
            icon: 'la-trash',
            method: 'delete',
            url: 'bank-accounts.destroy',
            params: [account.id],
            title: __('cuenta_eliminar'),
            message: __('cuenta_eliminar_confirm'),
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
                            {__('cuenta')} <u>{ account.iban }</u>
                        </h2>
                    </div>

                    {/* Info */}
                    <div className="col-12 mt-2 mb-4">
                        <span className="text-muted me-5">
                            {__('creado')}: <strong>{account.formatted_created_at}</strong> 
                        </span>

                        {account.created_by_name && (
                            <span className="text-muted me-5">
                                {__('creado_por')}: <strong>{account.created_by_name}</strong>
                            </span>
                        )}

                        <span className="text-muted me-5">
                            {__('actualizado')}: <strong>{account.formatted_updated_at}</strong>
                        </span>

                        {account.updated_by_name && (
                            <span className="text-muted me-5">
                                {__('actualizado_por')}: <strong>{account.updated_by_name}</strong>
                            </span>
                        )}
                    </div>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit}>
                    <div className="row gy-3 mb-3">
                        {/* Bancos */}
                        <div className="col-lg-6">
                            <div>
                                <label htmlFor="bank_id" className="form-label">{__('banco')}*</label>
                                <SelectSearch 
                                    name="bank_id"
                                    options={banks ? Object.entries(banks).map(([id, name]) => ({ value: id, label: name })) : []} 
                                    onChange={(selectedOption) => setData('bank_id', selectedOption ? selectedOption.value : '')} 
                                    value={banks[data.bank_id] ? { value: data.bank_id, label: banks[data.bank_id] } : null}
                                    required
                                    placeholder={__('banco_selec')} 
                                />
                            </div>
                        </div>

                        {/* Cuenta principal */}
                        <div className="col-lg-2 text-center">
                            <div className="position-relative">
                                <label htmlFor="featured" className="form-label">{ __('cuenta_principal') }</label>
                                <div className='pt-1 position-relative'>
                                    <Checkbox 
                                        className="xl"
                                        name="featured"
                                        checked={data.featured}
                                        onChange={(e) => setData('featured', e.target.checked)}
                                    />
                                </div>
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

                        {/* Cuentas contables */}
                        <div className="col-lg-6">
                            <div>
                                <label htmlFor="accounting_account_id" className="form-label">{__('cuenta_contable')}</label>
                                <SelectSearch
                                    name="accounting_account_id"
                                    options={accounting_accounts ? Object.keys(accounting_accounts).map(id => ({ value: id, label: accounting_accounts[id] })) : []}
                                    onChange={(selectedOption) => setData('accounting_account_id', selectedOption ? selectedOption.value : '')}
                                    value={data.accounting_account_id}
                                    placeholder={__('cuenta_contable_selec')}
                                />
                            </div>
                        </div>
                        <div className="m-0"></div>

                        {/* Código país */}
                        <div className="col-lg-2">
                            <div className="position-relative">
                                <label htmlFor="country_code" className="form-label">{ __('pais') }*</label>
                                <TextInput 
                                    name="country_code"
                                    className="text-end" 
                                    type="text"
                                    value={data.country_code} 
                                    onChange={(e) => setData('country_code', e.target.value)}
                                    maxLength={4}
                                    placeholder="- - - -"
                                    
                                />

                                <InputError message={errors.country_code} />
                            </div>    
                        </div>

                        {/* Entidad */}
                        <div className="col-lg-2">
                            <div className="position-relative">
                                <label htmlFor="entity" className="form-label">{ __('entidad') }*</label>
                                <TextInput 
                                    name="entity"
                                    className="text-end" 
                                    type="text"
                                    value={data.entity} 
                                    onChange={(e) => setData('entity', e.target.value)}
                                    maxLength={4}
                                    placeholder="- - - -"
                                    required
                                />

                                <InputError message={errors.entity} />
                            </div>    
                        </div>

                        {/* Oficina */}
                        <div className="col-lg-2">
                            <div className="position-relative">
                                <label htmlFor="office" className="form-label">{ __('oficina') }*</label>
                                <TextInput 
                                    name="office"
                                    className="text-end" 
                                    type="text"
                                    value={data.office} 
                                    onChange={(e) => setData('office', e.target.value)}
                                    maxLength={4}
                                    placeholder="- - - -"
                                    required
                                />

                                <InputError message={errors.office} />
                            </div>    
                        </div>

                        {/* Dígito control */}
                        <div className="col-lg-2">
                            <div className="position-relative">
                                <label htmlFor="dc" className="form-label">{ __('DC') }*</label>
                                <TextInput 
                                    name="dc"
                                    className="text-end" 
                                    type="text"
                                    value={data.dc} 
                                    onChange={(e) => setData('dc', e.target.value)}
                                    maxLength={2}placeholder="- -"
                                    required
                                />

                                <InputError message={errors.dc} />
                            </div>    
                        </div>

                        {/* Cuenta */}
                        <div className="col-lg-4">
                            <div className="position-relative">
                                <label htmlFor="digits" className="form-label">{ __('cuenta') }*</label>
                                <TextInput 
                                    name="digits"
                                    className="text-end" 
                                    type="text"
                                    value={data.digits} 
                                    onChange={(e) => setData('digits', e.target.value)}
                                    maxLength={10}
                                    placeholder="- - - - - - - - - -"
                                    required
                                />

                                <InputError message={errors.digits} />
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