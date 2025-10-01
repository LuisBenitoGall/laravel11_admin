import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';

// Components
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import SelectInput from '@/Components/SelectInput';

// Hooks
import { useTranslation } from '@/Hooks/useTranslation';

export default function Create({ auth, title, subtitle, module, slug, functionalities, availableLocales }) {
    const __ = useTranslation();
    const props = usePage()?.props || {};
    const permissions = props.permissions || {};

    const functionalitiesArray = Object.entries(functionalities || {}).map(([key, value]) => ({
		value: key,
		label: value
	}));

    // Set formulario
    const { data, setData, post, reset, errors, processing } = useForm({
        name: '',
        functionality: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('permissions.store'), {
            onSuccess: () => reset()
        });
    };

    // Acciones:
    const actions = [];
    if (permissions?.['permissions.index']) {
        actions.push({
            text: __('permisos_volver'),
            icon: 'la-angle-left',
            url: 'permissions.index',
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
                        {/* Selector de funcionalidad */}
                        <div className="col-lg-6">
                            <div className="position-relative">
                                <label htmlFor="functionality" className="form-label">{ __('funcionalidad') }*</label>
                                <SelectInput
                                    className="form-select"
                                    name="functionality"
                                    value={data.functionality}
                                    onChange={(e) => setData('functionality', e.target.value)}
                                    required
                                >
                                    <option value="">{ __('opcion_selec') }</option>
                                    {functionalitiesArray.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </SelectInput>
                                <InputError message={errors.functionality} />
                            </div>
                        </div>

                        {/* Nombre del permiso */}
                        <div className="col-lg-6">
                            <div className="position-relative">
                                <label htmlFor="name" className="form-label">{ __('permiso') }*</label>
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
