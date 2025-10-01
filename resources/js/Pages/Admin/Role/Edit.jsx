import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';

// Components
import BackToTop from '@/Components/BackToTop';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import RolePermissions from '@/Components/RolePermissions'; 
import SecondaryButton from '@/Components/SecondaryButton';
import Textarea from '@/Components/Textarea';
import TextInput from '@/Components/TextInput';

// Hooks
import { useTranslation } from '@/Hooks/useTranslation';

export default function Index({ auth, session, title, subtitle, availableLocales, role, functionalities, modules, permissions_all, module_permissions, role_permissions }) {
    const __ = useTranslation();
    const props = usePage()?.props || {};
    const locale = props.locale || false;
    const languages = props.languages || [];
    const permissions = props.permissions || {};

    // Set formulario
    const { data, setData, errors, processing } = useForm({
        name: role.name || '',
        description: role.description || ''
    });

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

        router.post(route('roles.update', role.id), formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => console.log('Role actualizada'),
            onError: (errors) => console.error('Errores:', errors),
            onFinish: () => console.log('Petición finalizada'),
        });
    }

    //Acciones:
    const actions = [];
    if (permissions?.['roles.index']) {
        actions.push({
            text: __('roles_volver'),
            icon: 'la-angle-left',
            url: 'roles.index',
            modal: false
        });
    }

    if (permissions?.['roles.create']) {
        actions.push({
            text: __('role_nuevo'), 
            icon: 'la-plus', 
            url: 'roles.create', 
            modal: false
        });
    }

    if (permissions?.['roles.destroy']) {
        actions.push({
            text: __('eliminar'),
            icon: 'la-trash',
            method: 'delete',
            url: 'roles.destroy',
            params: [role.id],
            title: __('role_eliminar'),
            message: __('role_eliminar_confirm'),
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
                            {__('role')} <u>{ role.name }</u>
                        </h2>
                    </div>

                    {/* Info */}
                    <div className="col-12 mt-2 mb-4">
                        <span className="text-muted me-5">
                            {__('creado')}: <strong>{role.formatted_created_at}</strong> 
                        </span>

                        <span className="text-muted me-5">
                            {__('actualizado')}: <strong>{role.formatted_updated_at}</strong>
                        </span>

                        <span className="text-muted me-5">
                            {__('role_universal')}: <strong>
                                <i className={`la ${role.universal ? 'la-check text-success' : 'la-ban text-danger'}`}></i>
                            </strong>
                        </span>
                    </div>
                </div>

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
                                    disabled
                                />
                                <InputError message={errors.name} />
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
                    
                    <div className='mt-4 text-end'>
                        <PrimaryButton disabled={processing} className='btn btn-rdn'>
                            {processing ? __('procesando')+'...':__('guardar')}
                        </PrimaryButton>	
                    </div>
                </form>

                {role.name !== 'Super Admin' && (
                    <RolePermissions
                        modules={modules}
                        functionalities={functionalities}
                        role_permissions={role_permissions}
                        permissions_all={permissions_all}
                        roleId={role.id}
                    />
                )}
            </div>

            <BackToTop offset={300} />
        </AdminAuthenticatedLayout>
    );
}