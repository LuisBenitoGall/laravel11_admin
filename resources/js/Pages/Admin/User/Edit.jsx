// resources/js/Pages/Admin/User/Edit.jsx
import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import { useHandleDelete } from '@/Utils/useHandleDelete.jsx';
import { useEffect, useState } from 'react';

//Components:
import CategoryAssigner from '@/Components/CategoryAssigner';
import InputError from '@/Components/InputError';
import ManageUserAddresses from '@/Components/ManageUserAddresses';
import PrimaryButton from '@/Components/PrimaryButton';
import RadioButton from '@/Components/RadioButton';
import Tabs from '@/Components/Tabs';
import Textarea from '@/Components/Textarea';
import TextInput from '@/Components/TextInput';

//Hooks:
import { useTranslation } from '@/Hooks/useTranslation';

//Modals:
import ModalUserNoteCreate from '@/Components/modals/ModalUserNoteCreate';

//Partials:
import UserImages from './Partials/UserImages.jsx';
import UserNotes from './Partials/UserNotes.jsx';
import UserPersonalData from './Partials/UserPersonalData';
import UserPassword from './Partials/UserPassword.jsx';

export default function Index({
    auth, session, title, subtitle,
    user, roles, user_roles, images,
    salutations, contact_types, contact_subtypes, contact_subtype_id, cost_centers, user_cost_centers,
    crm_contact, addresses, countries, profile, company,
    company_context, pivot, user_companies        
}) {
    const __ = useTranslation();
    const props = usePage()?.props || {};
    const permissions = props.permissions || {};

    // Eliminar (sin cambios)
    const { handleDelete } = useHandleDelete('usuario', 'users.destroy', [user.id]);

    // -----------------------
    // MODALS
    // -----------------------
    const [showModalUserNoteCreate, setShowModalUserNoteCreate] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleOpenModalUserNoteCreate = () => setShowModalUserNoteCreate(true);
    const handleCloseModalUserNoteCreate = () => setShowModalUserNoteCreate(false);

    const handleUserNoteSaved = () => {
        // Aquí podrás usar refreshKey para forzar recarga de un listado de notas
        setRefreshKey((prev) => prev + 1);
        setShowModalUserNoteCreate(false);
    };

    const handleNoteCreated = () => {
        setRefreshKey((prev) => prev + 1);
    };

    // -----------------------
    // ACCIONES
    // -----------------------
    const actions = [];
    const cc = company_context; 

    // Acción regreso: si `crm_contact` es `null` -> `users.index`, si no es `null` -> `crm-contacts.index`.
    try {
        const backRoute = crm_contact != null ? 'crm-contacts.index' : 'users.index';
        const backTextKey = crm_contact != null ? 'contactos_volver' : 'usuarios_volver';
        actions.push({
            text: __(backTextKey),
            icon: 'la-angle-left',
            url: backRoute,
            modal: false
        });
    } catch (e) {
        // Fallback sencillo en caso de problemas: volver a users.index
        actions.push({ text: __('usuarios_volver'), icon: 'la-angle-left', url: 'users.index', modal: false });
    }

    // Nuevo usuario
    if (permissions['users.create'] && crm_contact === false) {
        actions.push({ 
            text: __('usuario_nuevo'), 
            icon: 'la-plus', 
            url: 'users.create', 
            modal: false 
        });
    }

    // Nueva nota (no perfil propio)
    if (profile === false) {
        actions.push({ 
            text: __('nota_nueva'), 
            icon: 'la-plus', 
            url: '', 
            modal: true,
            onClick: handleOpenModalUserNoteCreate
        });
    }
    
    // Eliminar usuario
    if (permissions['users.destroy'] && profile === false) {
        actions.push({
            text: __('eliminar'), icon: 'la-trash', method: 'delete',
            url: 'users.destroy', params: [user.id],
            title: __('usuario_eliminar'), message: __('usuario_eliminar_confirm'), modal: false
        });
    }

    // Environment para categorías de clientes: usamos 'sectors' para mapear a module 'companies'
    const envForCategories = 'users';

    // Endpoints que consume CategoryAssigner
    const categoryEndpoints = {
        list: route('categorizables.list'),                               // GET  ?environment=&type=&id=
        assign: route('categorizables.assign'),                           // POST body {environment,type,id,category_ids}
        unassign: route('categorizables.unassign'),                       // POST body {environment,type,id,category_ids}
        tree: route('categories.tree', { environment: envForCategories }),// GET  ?environment=
        create: route('categories.store', { environment: envForCategories }) // POST body {environment,name,parent_id?}
    };

    // -----------------------
    // TABS
    // -----------------------
    const tabs = [
        { key: 'user-personal-data', label: __('datos_personales') },
        ...(profile === true ? [{ key: 'user-password', label: __('contrasena') }] : []),
        { key: 'user-addresses', label: __('direcciones') },
        // { key: 'user-categories', label: __('categorias') },
        { key: 'user-images', label: __('imagenes') },
        { key: 'user-notes', label: __('notas') },
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
                                        contact_subtypes={contact_subtypes}
                                        contact_subtype_id={contact_subtype_id}
                                        cost_centers={cost_centers}
                                        user_cost_centers={user_cost_centers}
                                        crm_contact={crm_contact}
                                        pivot={pivot}
                                        company_context={company_context}
                                        user_companies={user_companies}
                                        // En el futuro, podrías pasar refreshKey aquí
                                        // para recargar un listado de notas si lo añades en este tab
                                        // notesRefreshKey={refreshKey}
                                    />
                                );
                            
                            case 'user-password':
                                return <UserPassword user={user} />;

                            case 'user-addresses':
                                return <ManageUserAddresses 
                                    userId={user.id} 
                                    addresses={addresses} 
                                    countries={countries} 
                                    />;

                            case 'user-categories':
                                return <CategoryAssigner
                                    environment={envForCategories}
                                    categorizable={{ type: 'App\\Models\\User', id: user.id }}
                                    endpoints={categoryEndpoints}
                                    title={__('categorias')}
                                    allowCreate={true}
                                    readOnly={false}
                                />

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

                            case 'user-notes': {
                                return (
                                    <UserNotes 
                                        userId={user.id}
                                        refreshKey={refreshKey}
                                    />
                                );
                            }

                            default:
                                return null;
                        }
                    }}
                </Tabs>

                {/* Modals */}
                <ModalUserNoteCreate
                    show={showModalUserNoteCreate}
                    onClose={handleCloseModalUserNoteCreate}
                    contact={user}
                    onSaved={handleUserNoteSaved}
                    onCreated={handleNoteCreated}
                />
            </div>
        </AdminAuthenticatedLayout>
    );
}
