// resources/js/Pages/Admin/User/Edit.jsx
import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { useTranslation } from '@/Hooks/useTranslation';
import { useHandleDelete } from '@/Utils/useHandleDelete.jsx';

import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import RadioButton from '@/Components/RadioButton';
import Tabs from '@/Components/Tabs';
import Textarea from '@/Components/Textarea';
import TextInput from '@/Components/TextInput';
import Checkbox from '@/Components/Checkbox';

import UserPersonalData from './Partials/UserPersonalData';
import UserPassword from './Partials/UserPassword.jsx';
import UserImages from './Partials/UserImages.jsx';

export default function Index({
    auth, session, title, subtitle,
    user, roles, user_roles, images,
    salutations, contact_types, crm_contact, profile, company,
    company_context, pivot, user_company_id          // ← nuevos props del backend
}) {
    const __ = useTranslation();
    const props = usePage()?.props || {};
    const permissions = props.permissions || {};

    // Eliminar (sin cambios)
    const { handleDelete } = useHandleDelete('usuario', 'users.destroy', [user.id]);

    // -----------------------
    // ACCIONES (nueva lógica)
    // -----------------------
    const actions = [];
    const cc = company_context; 

    if (cc && cc.type === 'crm_account' && permissions['crm-accounts.edit']) {
        actions.push({
            text: __('volver_a') + ' ' + cc.name,
            icon: 'la-angle-left',
            url: 'crm-accounts.edit',
            params: [cc.crm_id, 'users'],
            modal: false
        });
    } else if (cc && cc.type === 'company' && (permissions['companies.edit'] || permissions['users.index'])) {
        // si tienes vista de edición de empresa propia, úsala; si no, cae al listado de usuarios
        if (permissions['companies.edit']) {
            actions.push({
                text: __('volver_a') + ' ' + cc.name,
                icon: 'la-angle-left',
                url: 'companies.edit',
                params: [cc.ref_id, 'users'],
                modal: false
            });
        } else {
            actions.push({
                text: __('usuarios_volver'),
                icon: 'la-angle-left',
                url: 'users.index',
                modal: false
            });
        }
    } else if (permissions['users.index']) {
        actions.push({
            text: __('usuarios_volver'),
            icon: 'la-angle-left',
            url: 'users.index',
            modal: false
        });
    }

    // Botones extra (sin cambiar tu lógica de permisos/condiciones)
    if (permissions['users.create'] && profile === false && user_company_id === false) {
        actions.push({ text: __('usuario_nuevo'), icon: 'la-plus', url: 'users.create', modal: false });
    }
    
    actions.push({ text: __('nota_nueva'), icon: 'la-plus', url: 'users.create', modal: true });
    
    if (permissions['users.destroy'] && profile === false) {
        actions.push({
            text: __('eliminar'), icon: 'la-trash', method: 'delete',
            url: 'users.destroy', params: [user.id],
            title: __('usuario_eliminar'), message: __('usuario_eliminar_confirm'), modal: false
        });
    }

    // -----------------------
    // TABS
    // -----------------------
    const tabs = [
        { key: 'user-personal-data', label: __('datos_personales') },
        ...(profile === true ? [{ key: 'user-password', label: __('contrasena') }] : []),
        { key: 'user-images', label: __('imagenes') },
    ];

    return (
        <AdminAuthenticatedLayout user={auth.user} title={title} subtitle={subtitle} actions={actions}>
            <Head title={title} />

            <div className="contents pb-4">
                <div className="row">
                    <div className="col-12">
                        <h2>{__('usuario')} <u>{user.name} {user.surname}</u></h2>
                    </div>
                    <div className="col-12 mt-2 mb-4">
                        <span className="text-muted me-5">{__('creado')}: <strong>{user.formatted_created_at}</strong></span>
                        <span className="text-muted me-5">{__('actualizado')}: <strong>{user.formatted_updated_at}</strong></span>
                    </div>
                </div>

                <Tabs defaultActive="user-personal-data" items={tabs}>
                    {(activeKey) => {
                        switch (activeKey) {
                            case 'user-personal-data':
                            return (
                              <UserPersonalData
                                user={user}
                                roles={roles}
                                user_roles={user_roles}
                                salutations={salutations}
                                contact_types={contact_types}
                                crm_contact={crm_contact}
                                user_company_id={user_company_id}   // ← prop correcto
                                pivot={pivot}                        // ← para position/department
                                company_context={company_context}    // ← por si lo usas en el tab
                              />
                            );
                            case 'user-password':
                                return <UserPassword user={user} />;
                            case 'user-images': {
                                const inferredImagePath = user?.image_path || user?.imagePath || 'users';
                                return (
                                    <UserImages
                                        images={images ?? []}
                                        uploadUrl={route('user-images.store')}
                                        deleteUrl={(img) => route('user-images.delete', { image: img.id ?? img.image })}
                                        setFeaturedUrl={route('user-images.set-featured')}
                                        entityId={user.id}
                                        imagePath={inferredImagePath}
                                    />
                                );
                            }
                            default:
                            return null;
                        }
                    }}
                </Tabs>
            </div>
        </AdminAuthenticatedLayout>
    );
}
