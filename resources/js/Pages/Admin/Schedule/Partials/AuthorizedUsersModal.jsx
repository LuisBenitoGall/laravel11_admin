import React, { useState, useEffect } from 'react';
import { router, useForm } from '@inertiajs/react';
import ReusableModal from '@/Components/modals/ModalTemplate';
import UserSearch from '@/Components/UserSearch';
import SelectInput from '@/Components/SelectInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { useTranslation } from '@/Hooks/useTranslation';

export default function AuthorizedUsersModal({ show, onClose, schedule, onSaved }) {
    const __ = useTranslation();

    const [authorizedUsers, setAuthorizedUsers] = useState([]);

    useEffect(() => {
        if (schedule?.authorizedUsers) {
            setAuthorizedUsers(
                schedule.authorizedUsers.map(user => ({
                    user_id: user.id,
                    role: user.pivot?.role || 'viewer',
                }))
            );
        } else {
            setAuthorizedUsers([]);
        }
    }, [schedule]);

    const { data, setData, put, processing, errors } = useForm({
        authorized_users: [],
    });

    const handleAddUser = (user) => {
        if (!authorizedUsers.find(au => au.user_id === user.id)) {
            setAuthorizedUsers([...authorizedUsers, { user_id: user.id, role: 'viewer' }]);
        }
    };

    const handleRemoveUser = (userId) => {
        setAuthorizedUsers(authorizedUsers.filter(au => au.user_id !== userId));
    };

    const handleRoleChange = (userId, role) => {
        setAuthorizedUsers(authorizedUsers.map(au =>
            au.user_id === userId ? { ...au, role } : au
        ));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setData('authorized_users', authorizedUsers);

        put(route('schedules.authorized-users.update', schedule.id), {
            preserveScroll: true,
            onSuccess: () => {
                onSaved();
            },
        });
    };

    return (
        <ReusableModal
            show={show}
            onClose={onClose}
            title={__('usuarios_autorizados')}
            onConfirm={handleSubmit}
            confirmText={processing ? __('guardando') : __('guardar')}
            cancelText={__('cancelar')}
            confirmDisabled={processing}
            confirmLoading={processing}
            dialogClassName="modal-lg"
        >
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">{__('usuario_agregar')}</label>
                    <UserSearch
                        searchUrl="/admin/users/search"
                        placeholder={__('usuario_buscar')}
                        onChange={(user) => {
                            if (user) {
                                handleAddUser(user);
                            }
                        }}
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">{__('usuarios_autorizados')}</label>
                    {authorizedUsers.length === 0 ? (
                        <p className="text-muted">{__('usuarios_autorizados_0')}</p>
                    ) : (
                        <div className="list-group">
                            {authorizedUsers.map((au) => {
                                const user = schedule?.authorizedUsers?.find(u => u.id === au.user_id);
                                return (
                                    <div key={au.user_id} className="list-group-item d-flex justify-content-between align-items-center">
                                        <div className="flex-grow-1">
                                            <div>{user?.name} {user?.surname}</div>
                                            <small className="text-muted">{user?.email}</small>
                                        </div>
                                        <div className="d-flex align-items-center gap-2">
                                            <SelectInput
                                                value={au.role}
                                                onChange={(e) => handleRoleChange(au.user_id, e.target.value)}
                                                className="form-select-sm"
                                            >
                                                <option value="viewer">{__('viewer')}</option>
                                                <option value="editor">{__('editor')}</option>
                                            </SelectInput>
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => handleRemoveUser(au.user_id)}
                                            >
                                                <i className="la la-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                    <InputError message={errors.authorized_users} />
                </div>
            </form>
        </ReusableModal>
    );
}
