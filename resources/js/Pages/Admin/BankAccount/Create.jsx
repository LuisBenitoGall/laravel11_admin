import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
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

export default function Index({ auth, session, title, subtitle, banks, accounting_accounts, availableLocales }){
    const __ = useTranslation();
    const props = usePage()?.props || {};
    const locale = props.locale || false;
    const languages = props.languages || [];
    const permissions = props.permissions || {};

    // Set formulario:
    const {data, setData, post, reset, errors, processing} = useForm({
        accounting_account_id: '',
        bank_id: '',
        country_code: '',
        entity: '',
        office: '',
        dc: '',
        digits: '',
        featured: false,
        status: true
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

    // Envío formulario:
    function handleSubmit(e){
        e.preventDefault()
        post(route('bank-accounts.store'), {
            onSuccess: () => reset()
        })
    }

    //Acciones:
    const actions = [];
    if (permissions?.['bank-accounts.index']) {
        actions.push({
            text: __('cuentas_volver'),
            icon: 'la-angle-left',
            url: 'bank-accounts.index',
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
                {/* Formulario */}
                <form onSubmit={handleSubmit}>
                    <div className="row gy-3 mb-3">
                        {/* Bancos */}
                        <div className="col-lg-6">
                            <div>
                                <label htmlFor="bank_id" className="form-label">{__('banco')}*</label>
                                <SelectSearch 
                                    name="bank_id"
                                    options={banks ? Object.keys(banks).map(id => ({ value: id, label: banks[id] })) : []} 
                                    onChange={(selectedOption) => setData('bank_id', selectedOption ? selectedOption.value : '')} 
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
                                    required
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