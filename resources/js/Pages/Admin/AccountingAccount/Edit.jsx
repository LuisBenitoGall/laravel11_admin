import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, Link, router, useForm, usePage, useRemember } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';
import { Tooltip } from 'react-tooltip';
import { useEffect, useState } from 'react';

// Components
import Checkbox from '@/Components/Checkbox';
import InfoPopover from '@/Components/InfoPopover';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
// import RadioButton from '@/Components/RadioButton'; // FLEX OFF: radios de "Saldo esperado" deshabilitados por ortodoxia
import SelectSearch from '@/Components/SelectSearch';
import Textarea from '@/Components/Textarea';
import TextInput from '@/Components/TextInput';

//Hooks:
import { useSweetAlert } from '@/Hooks/useSweetAlert';
import { useTranslation } from '@/Hooks/useTranslation';

//Utils:
import { useHandleDelete } from '@/Utils/useHandleDelete.jsx';

export default function Index({ auth, session, title, subtitle, account, availableLocales }){
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

        router.post(route('accounting-accounts.update', account.id), formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => console.log('Cuenta actualizada'),
            onError: (errors) => setLocalErrors(errors),
            onFinish: () => console.log('Petición finalizada'),
        });
    }

    //Acciones:
    const actions = [];
    if (permissions?.['accounting-accounts.index']) {
        actions.push({
            text: __('cuentas_volver'),
            icon: 'la-angle-left',
            url: 'accounting-accounts.index',
            modal: false
        });
    }

    if (permissions?.['accounting-accounts.create']) {
        actions.push({
            text: __('cuenta_nueva'),
            icon: 'la-plus',
            url: 'accounting-accounts.create',
            modal: false
        });
    }

    // if (permissions?.['accounting-accounts.destroy']) {
    //     actions.push({
    //         text: __('eliminar'),
    //         icon: 'la-trash',
    //         method: 'delete',
    //         url: 'accounting-accounts.destroy',
    //         params: [account.id],
    //         title: __('cuenta_eliminar'),
    //         message: __('cuenta_eliminar_confirm'),
    //         modal: false
    //     });
    // }

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
                            {__('cuenta')} <u>{ account.name } - { account.code }</u>
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
                    <div className="row gy-3">

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