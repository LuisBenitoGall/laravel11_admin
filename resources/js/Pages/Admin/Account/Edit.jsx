import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, Link, router, useForm, usePage, useRemember } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';
import { Tooltip } from 'react-tooltip';
import { useEffect, useState } from 'react';

//Components:
import Checkbox from '@/Components/Checkbox';
import InfoPopover from '@/Components/InfoPopover';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import Textarea from '@/Components/Textarea';
import TextInput from '@/Components/TextInput';

//Hooks:
import { useSweetAlert } from '@/Hooks/useSweetAlert';
import { useTranslation } from '@/Hooks/useTranslation';

//Utils:
import { useHandleDelete } from '@/Utils/useHandleDelete.jsx';

export default function Index({ auth, session, title, subtitle, account, currency, availableLocales }){
    const __ = useTranslation();
    const props = usePage()?.props || {};
    const locale = props.locale || false;
    const languages = props.languages || [];
    const { showConfirm } = useSweetAlert();
    const permissions = props.permissions || {};

    // Set formulario:
	const {data, setData, errors, processing} = useForm({
        name: account.name || '',
        rate: account.rate || '',
        duration: account.duration || '',
        description: account.description || '',
        status: account.status
    })

    const [localErrors, setLocalErrors] = useState({});

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

    //Confirmación de eliminación:
    const { handleDelete } = useHandleDelete('cuenta', 'accounts.delete', [account.id]);

    //Envío formulario:
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

        router.post(route('accounts.update', account.id), formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => console.log('Cuenta actualizada'),
            onError: (errors) => setLocalErrors(errors),
            onFinish: () => console.log('Petición finalizada'),
        });
    }

    //Acciones:
    const actions = [];
    if (permissions?.['accounts.index']) {
        actions.push({
            text: __('cuentas_volver'),
            icon: 'la-angle-left',
            url: 'accounts.index',
            modal: false
        });
    }

    if (permissions?.['accounts.create']) {
        actions.push({
            text: __('cuenta_nueva'),
            icon: 'la-plus',
            url: 'accounts.create',
            modal: false
        });
    }

    if (permissions?.['accounts.destroy']) {
        actions.push({
            text: __('eliminar'),
            icon: 'la-trash',
            method: 'delete',
            url: 'accounts.destroy',
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
                            {__('cuenta')} <u>{ account.name }</u>
                        </h2>
                    </div>

                    {/* Info */}
                    <div className="col-12 mt-2 mb-4">
                        <span className="text-muted me-5">
                            {__('creado')}: <strong>{account.formatted_created_at}</strong> 
                        </span>

                        <span className="text-muted">
                            {__('actualizado')}: <strong>{account.formatted_updated_at}</strong>
                        </span>
                    </div>
                </div>

                {/* Formulario */}
                <form onSubmit={handleSubmit}>
                    <div className="row gy-3">
                        {/* Cuenta */}
                        <div className="col-lg-6">
                            <div>
                                <label htmlFor="name" className="form-label">{ __('cuenta') }*</label>
                                <TextInput 
                                    className="" 
                                    type="text"
                                    name="name"
                                    placeholder={__('nombre')} 
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

                        {/* Precio */}
                        <div className="col-lg-3">
                            <div>
                                <label htmlFor="rate" className="form-label">{ __('precio') }</label>
                                <TextInput 
                                    className="text-end" 
                                    type="text"
                                    name="rate"
                                    placeholder="" 
                                    value={data.rate} 
                                    onChange={(e) => setData('rate', e.target.value)}
                                    maxLength={7}
                                    addon={currency}
                                />

                                <InputError message={localErrors.rate} />
                            </div>
                        </div>

                        {/* Duración */}
                        <div className="col-lg-3">
                            <div>
                                <label htmlFor="duration" className="form-label">{ __('duracion') } <small className="text-warning">({ __('dias') })</small></label>
                                <TextInput 
                                    className="text-end" 
                                    type="text"
                                    name="duration"
                                    placeholder="" 
                                    value={data.duration} 
                                    onChange={(e) => setData('duration', e.target.value)}
                                    maxLength={7}
                                />

                                <InputError message={localErrors.duration} />
                            </div>
                        </div>

                        {/* Descripción */}
                        <div className="col-12">
                            <div>
                                <label htmlFor="description" className="form-label">{ __('descripcion') }</label>
                                <Textarea
                                    value={data.description}
                                    name="description"
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={4}
                                />
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