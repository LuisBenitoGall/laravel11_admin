import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Hooks:
import { useTranslation } from '@/Hooks/useTranslation';
import { useSweetAlert } from '@/Hooks/useSweetAlert';
import { router } from '@inertiajs/react';

export default function NewContactsWidget() {
    const __ = useTranslation();
    const { showConfirm } = useSweetAlert();

    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [deletingId, setDeletingId] = useState(null);

    const fetch = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(route('crm-contacts.new'));
            const raw = res.data || {};
            const list = Array.isArray(raw.contacts) ? raw.contacts : (raw.data || []);
            setItems(list);
        } catch (e) {
            console.error('Error loading new contacts', e);
            setError(__('error_cargando') || 'Error cargando contactos');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetch(); }, []);

    const handleEdit = (user) => {
        if (!user) return;
        router.visit(route('users.edit', user.id));
    };

    const handleDelete = (contactId) => {
        if (!contactId) return;

        showConfirm({
            title: __('confirmar_eliminar') || '¿Eliminar?',
            text: __('confirmar_eliminar_contacto') || 'Se eliminará el contacto CRM.',
            icon: 'warning',
            onConfirm: async () => {
                setDeletingId(contactId);
                try {
                    await axios.delete(route('crm-contacts.destroy', contactId));
                    fetch();
                } catch (e) {
                    console.error('Error deleting contact', e);
                } finally {
                    setDeletingId(null);
                }
            }
        });
    };

    const hasItems = items && items.length > 0;

    return (
        <div className="card shadow-sm h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                    <i className="la la-address-book me-2" aria-hidden="true" />
                    <span className="fw-semibold">
                        {__('contactos_ultimos') || 'Últimos contactos'}
                    </span>
                </div>

                {hasItems && (
                    <span className="badge bg-secondary">{items.length}</span>
                )}
            </div>

            <div className="card-body p-2" style={{ maxHeight: '320px', overflowY: 'auto' }}>
                {loading && (
                    <div className="d-flex justify-content-center py-3">
                        <div className="spinner-border spinner-border-sm text-secondary" role="status">
                            <span className="visually-hidden">{__('cargando') || 'Cargando...'}</span>
                        </div>
                    </div>
                )}

                {error && !loading && (
                    <div className="alert alert-danger mb-2">{error}</div>
                )}

                {!loading && !error && !hasItems && (
                    <p className="text-muted small mb-0">{__('no_hay_contactos_nuevos') || 'No hay nuevos contactos.'}</p>
                )}

                {!loading && !error && hasItems && (
                    <ul className="list-unstyled mb-0">
                        {items.map((c) => (
                            <li key={c.id} className="border-bottom py-2">
                                <div className="d-flex align-items-start">
                                    <div className="flex-grow-1 ms-2">
                                        <div className="d-flex justify-content-between">
                                            <div>
                                                <strong className="d-block">{(c.user && c.user.name) || ('#' + c.id)}</strong>
                                                {c.user && c.user.email && (
                                                    <small className="text-muted d-block"><i className="la la-envelope me-1" />{c.user.email}</small>
                                                )}
                                            </div>
                                            <div className="text-end">
                                                <small className="text-muted text-nowrap d-block">{c.created_at}</small>
                                            </div>
                                        </div>

                                        {c.last_message && (
                                            <div className="mt-1 small text-truncate" style={{ maxWidth: '100%' }}>
                                                <em>{c.last_message}</em>
                                            </div>
                                        )}

                                        <div className="mt-2">
                                            <button className="btn btn-sm btn-info me-2 text-white" onClick={() => handleEdit(c.user)}>
                                                <i className="la la-edit me-1" />{__('editar') || 'Editar'}
                                            </button>

                                            <button className="btn btn-sm btn-danger" onClick={() => handleDelete(c.id)} disabled={deletingId === c.id}>
                                                {deletingId === c.id ? (
                                                    <span className="spinner-border spinner-border-sm" />
                                                ) : (
                                                    <i className="la la-trash" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}