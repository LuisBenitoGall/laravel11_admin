import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useEffect } from 'react';

// Components:
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import SelectInput from '@/Components/SelectInput';
import TextInput from '@/Components/TextInput';
import InfoPopover from '@/Components/InfoPopover';

// Hooks:
import { useTranslation } from '@/Hooks/useTranslation';
import { useCompanySession } from '@/Hooks/useCompanySession';
import { useSweetAlert } from '@/Hooks/useSweetAlert';

export default function Create({
    auth,
    session,
    title,
    subtitle,
    owners = [],
    listTypes = [],
    statusOptions = [],
}) {
    const __ = useTranslation();
    const props = usePage()?.props || {};
    const locale = props.locale || false;
    const languages = props.languages || [];
    const permissions = props.permissions || {};


    const { currentCompany } = useCompanySession();
    const { showAlert } = useSweetAlert();

    const { data, setData, post, processing, errors, reset } = useForm({
        owner_id: '',
        name: '',
        slug: '',
        type: '',
        is_dynamic: false,
        status: 1,
        observations: '',
    });
    
    // Si el tipo es "dynamic", marcamos automáticamente is_dynamic
    useEffect(() => {
        if (data.type === 'dynamic' || data.type === 'dinamica') {
            if (!data.is_dynamic) {
                setData('is_dynamic', true);
            }
        }
        // No forzamos a false si cambia, por si quieres jugar con combinaciones
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.type]);

    const handleSubmit = (e) => {
        e.preventDefault();

        post(route('marketing-lists.store'), {
            preserveScroll: true,
            onSuccess: () => {
                showAlert(__('Éxito'), __('La lista de marketing se ha creado correctamente.'), 'success');
                reset('observations');
            },
            onError: () => {
                showAlert(__('Error'), __('Se ha producido un error al crear la lista de marketing.'), 'error');
            },
        });
    };

    const handleCancel = () => {
        window.history.back();
    };

    // Acciones:
    const actions = [];
    if (permissions?.['marketing-lists.index']) {
        actions.push({
            text: __('listas_volver'),
            icon: 'la-angle-left',
            url: 'marketing-lists.index',
            modal: false,
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

            <div className="contents pb-4">
                {/* Formulario */}
                <form onSubmit={handleSubmit}>
                    <div className="row gy-3">
                        {/* Nombre lista */}
                        <div className="col-lg-6">
                            <div>
                                <label htmlFor="name" className="form-label">
                                    {__('nombre')}*
                                </label>
                                <TextInput
                                    id="name"
                                    type="text"
                                    placeholder={__('nombre')}
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    maxLength={255}
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>
                        </div>

                        <div className="col-lg-2 text-center">
                            <div>
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

                        {/* Observaciones */}
                        <div className="col-12">
                            <div>
                                <label htmlFor="observations" className="form-label">
                                    {__('Observaciones')}
                                </label>
                                <textarea
                                    id="observations"
                                    name="observations"
                                    className="form-control"
                                    rows={4}
                                    value={data.observations || ''}
                                    onChange={(e) =>
                                        setData('observations', e.target.value)
                                    }
                                />
                                <InputError
                                    message={errors.observations}
                                    className="mt-1"
                                />
                            </div>
                        </div>


                        <div className='mt-4 text-end'>
                            <PrimaryButton disabled={processing} className='btn btn-rdn'>
                                {processing ? __('procesando')+'...':__('guardar')}
                            </PrimaryButton>    
                        </div>
                    </div>
                </form>
            </div>
        </AdminAuthenticatedLayout>
    );
}


