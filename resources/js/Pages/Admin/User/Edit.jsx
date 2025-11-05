import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { Inertia } from '@inertiajs/inertia';
import { Tooltip } from 'react-tooltip';
import { useState } from 'react';

//Components:
import Checkbox from '@/Components/Checkbox';
import InfoPopover from '@/Components/InfoPopover';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import RadioButton from '@/Components/RadioButton';
import Tabs from '@/Components/Tabs';
import Textarea from '@/Components/Textarea';
import TextInput from '@/Components/TextInput';

//Hooks:
import { useTranslation } from '@/Hooks/useTranslation';

//Tabs:
import UserPersonalData from './Partials/UserPersonalData';
import UserPassword from './Partials/UserPassword.jsx';
import UserImages from './Partials/UserImages.jsx';
// import UserContactData from './Partials/UserContactData.jsx';
// import UserCompaniesData from './Partials/UserCompaniesData.jsx';

//Utils:
import { useHandleDelete } from '@/Utils/useHandleDelete.jsx';

export default function Index({ auth, session, title, subtitle, availableLocales, user, roles, user_roles, images, profile }) {
    const __ = useTranslation();
    const props = usePage()?.props || {};
    const locale = props.locale || false;
    const languages = props.languages || [];
    const permissions = props.permissions || {};

    // Set formulario:
    const {data, setData, put, reset, errors, processing} = useForm({
        role: user.role || '',
        name: user.name || '',
        surname: user.surname || '',
        email: user.email || '',       
        status: user.status
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

    const handleImageChange = () => {
        // Forzar recarga de la página para actualizar las imágenes
        //Inertia.reload({ only: ['user'] });
    }

    //Confirmación de eliminación:
    const { handleDelete } = useHandleDelete('usuario', 'users.destroy', [user.id]);

    //Envío formulario:
    function handleSubmit(e) {
        e.preventDefault();
        put(route('users.update', user.id),
        {
            preserveScroll: true,
            onSuccess: () => console.log('usuario actualizado'),
        });
    }

    //Acciones:
    const actions = [];
    if (permissions?.['users.index']) {
        actions.push({
            text: __('usuarios_volver'),
            icon: 'la-angle-left',
            url: 'users.index',
            modal: false
        });
    }

    if (permissions?.['users.create'] && profile === false) {
        actions.push({
            text: __('usuario_nuevo'),
            icon: 'la-plus',
            url: 'users.create',
            modal: false
        });
    }

    if (permissions?.['users.destroy'] && profile === false) {
        actions.push({
            text: __('eliminar'),
            icon: 'la-trash',
             method: 'delete',
            url: 'users.destroy',
            params: [user.id],
            title: __('usuario_eliminar'),
            message: __('usuario_eliminar_confirm'),
            modal: false
        });
    }

    //Tabs:
    const tabs = [
        { key: 'user-personal-data', label: __('datos_personales') },
        // sólo añadimos la pestaña de contraseña si profile es true
        ...(profile === true
            ? [{ key: 'user-password', label: __('contrasena') }]
            : []),
        { key: 'user-images', label: __('imagenes') },
    ];

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
                            {__('usuario')} <u>{ user.name } { user.surname }</u>
                        </h2>
                    </div>

                    {/* Info */}
                    <div className="col-12 mt-2 mb-4">
                        <span className="text-muted me-5">
                            {__('creado')}: <strong>{user.formatted_created_at}</strong> 
                        </span>

                        <span className="text-muted me-5">
                            {__('actualizado')}: <strong>{user.formatted_updated_at}</strong>
                        </span>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs
                    defaultActive="user-personal-data"
                    items={tabs}
                >

                    {/* Panels */}
                    {(activeKey) => {
                        switch (activeKey) {
                            case 'user-personal-data':
                                return <UserPersonalData user={user} roles={roles} user_roles={user_roles} />;
                            case 'user-password':
                                return <UserPassword user={user} />;
                            case 'user-images':
                                // imagePath: try common fields on the `user` object, fallback to 'users'
                                const inferredImagePath = user?.image_path || user?.imagePath || 'users';
                                return <UserImages
                                    images={images ?? []}
                                    uploadUrl={route('user-images.store')}
                                    // pass an explicit function so DropzoneGallery can resolve the correct delete URL with the image id
                                    deleteUrl={(img) => route('user-images.delete', img.id)}
                                    entityId={user.id}
                                    imagePath={inferredImagePath}
                                    onChange={handleImageChange}
                                />;
                            default:
                            return null;
                        }   
                    }}
                </Tabs>              
            </div>
        </AdminAuthenticatedLayout>
    );
}