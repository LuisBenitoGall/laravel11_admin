import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';

// Components
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import Textarea from '@/Components/Textarea';
import TextInput from '@/Components/TextInput';

// Hooks
import { useTranslation } from '@/Hooks/useTranslation';

export default function Create({ auth, title, subtitle, module, slug, availableLocales }) {
    const __ = useTranslation();
    const props = usePage()?.props || {};
    const permissions = props.permissions || {};

    // Set formulario
    const { data, setData, post, reset, errors, processing } = useForm({
        name: '',
        universal: true,
        description: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('roles.store'), {
            onSuccess: () => reset()
        });
    };

    // Acciones:
    const actions = [];
    if (permissions?.['roles.index']) {
        actions.push({
            text: __('roles_volver'),
            icon: 'la-angle-left',
            url: 'roles.index',
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
                    <div className="row gy-3">
                        {/* Nombre del role */}
                        <div className="col-lg-6">
                            <div className="position-relative">
                                <label htmlFor="name" className="form-label">{ __('role') }*</label>
                                <TextInput 
                                    type="text"
                                    name="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    maxLength={100}
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>
                        </div>

                        {/* Universal */}
                        <div className="col-lg-2 text-center">
                            <div className="position-relative">
                                <label htmlFor="universal" className="form-label">{ __('role_universal') }</label>
                                <div className='pt-1 position-relative'>
                                    <Checkbox 
                                        className="xl"
                                        name="universal"
                                        checked={data.universal}
                                        onChange={(e) => setData('universal', e.target.checked)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Descripción */}
                        <div className="col-12">
                            <div className="position-relative">
                                <label htmlFor="description" className="form-label">{ __('descripcion') }</label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    value={data.description ?? ''}
                                    onChange={(e) => {
                                        console.log('description value', e.target.value);
                                        setData('description', e.target.value);
                                    }}
                                    className="form-control"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-4 text-end">
                        <PrimaryButton disabled={processing} className="btn btn-rdn">
                            {processing ? __('procesando') + '...' : __('guardar')}
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </AdminAuthenticatedLayout>
    );
}
