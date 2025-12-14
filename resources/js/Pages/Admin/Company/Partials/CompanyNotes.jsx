// resources/js/Pages/Admin/Company/Partials/CompanyNotes.jsx
import React, { useEffect, useRef, useState } from 'react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';

// Components:
import DatePickerToForm from '@/Components/DatePickerToForm';
import TextInput from '@/Components/TextInput';
import Textarea from '@/Components/Textarea';

// Hooks:
import { useSweetAlert } from '@/Hooks/useSweetAlert';
import { useTranslation } from '@/Hooks/useTranslation';

// Utils:
import { toLocalYmd } from '@/Utils/dateHelpers';

export default function CompanyNotes({
    companyId,
    refreshKey,   // opcional: para recargar cuando se cree/edite una nota
}) {
    const __ = useTranslation();
    const props = usePage()?.props || {};
    const { showConfirm } = useSweetAlert();

    const [notes, setNotes] = useState([]);
    const [page, setPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [initialized, setInitialized] = useState(false);
    const [error, setError] = useState(null);

    const [editingReminderId, setEditingReminderId] = useState(null);
    const [savingReminderId, setSavingReminderId] = useState(null);

    const [editingNoteId, setEditingNoteId] = useState(null);
    const [editForm, setEditForm] = useState({ title: '', body: '' });
    const [savingEditId, setSavingEditId] = useState(null);
    const [editingRelevanceId, setEditingRelevanceId] = useState(null);
    const [savingRelevanceId, setSavingRelevanceId] = useState(null);
    const [savingPinId, setSavingPinId] = useState(null);
    const [savingArchiveId, setSavingArchiveId] = useState(null);

    // Buscador contextual
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const loaderRef = useRef(null);
    const scrollContainerRef = useRef(null);

    const hasMore = page < lastPage;

    // Debounce del buscador
    useEffect(() => {
        const id = setTimeout(() => {
            setDebouncedSearch(search.trim());
        }, 400);

        return () => clearTimeout(id);
    }, [search]);

    const sortNotes = (items) => {
        return [...items].sort((a, b) => {
            // Primero fijadas
            const pinDiff = Number(b.is_pinned) - Number(a.is_pinned);
            if (pinDiff !== 0) return pinDiff;

            // Luego por fecha de creación (más recientes primero)
            const da = a.created_at || '';
            const db = b.created_at || '';
            if (da < db) return 1;
            if (da > db) return -1;
            return 0;
        });
    };

    const fetchNotes = async (pageToLoad = 1, replace = false) => {
        if (loading) return;

        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(
                route('company-notes.show', companyId),
                {
                    params: {
                        page: pageToLoad,
                        q: debouncedSearch || null,
                    },
                }
            );

            const payload = response.data || {};
            const data = payload.data || [];
            const meta = payload.meta || {};

            setNotes(prev =>
                replace ? sortNotes(data) : sortNotes([...prev, ...data])
            );

            const currentPage = meta.current_page || pageToLoad;
            const totalPages  = meta.last_page || currentPage;

            setPage(currentPage);
            setLastPage(totalPages);
        } catch (e) {
            console.error('Error cargando notas de empresa', e);
            setError(__('error_cargando_notas_empresa') || 'Error cargando notas de la empresa.');
        } finally {
            setLoading(false);
        }
    };

    // Carga inicial
    useEffect(() => {
        if (!initialized && companyId) {
            setInitialized(true);
            fetchNotes(1, true);
        }
    }, [initialized, companyId]);

    // Recarga al cambiar refreshKey (nueva nota, edición, etc.)
    useEffect(() => {
        if (!initialized) return;
        setNotes([]);
        setPage(1);
        setLastPage(1);
        fetchNotes(1, true);
    }, [refreshKey]);

    // Recarga al cambiar el término de búsqueda (debounced)
    useEffect(() => {
        if (!initialized) return;
        setNotes([]);
        setPage(1);
        setLastPage(1);
        fetchNotes(1, true);
    }, [debouncedSearch]);

    // Infinite scroll dentro del contenedor con scroll propio
    useEffect(() => {
        if (!hasMore || loading) return;

        const root = scrollContainerRef.current;
        if (!root) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const first = entries[0];
                if (first.isIntersecting) {
                    fetchNotes(page + 1);
                }
            },
            {
                root,
                threshold: 0.1,
            }
        );

        const currentLoader = loaderRef.current;
        if (currentLoader) {
            observer.observe(currentLoader);
        }

        return () => {
            if (currentLoader) {
                observer.unobserve(currentLoader);
            }
        };
    }, [hasMore, loading, page, debouncedSearch]);

    // Eliminar
    const [deletingId, setDeletingId] = useState(null);

    const handleDelete = (note) => {
        showConfirm({
            title: __('nota_eliminar') || 'Eliminar nota',
            text: __('nota_eliminar_confirm') || '¿Seguro que quieres eliminar esta nota?',
            icon: 'warning',
            onConfirm: async () => {
                setDeletingId(note.id);
                setError(null);

                try {
                    await axios.delete(route('company-notes.destroy', note.id));

                    setNotes((prev) => prev.filter((n) => n.id !== note.id));

                    if (editingNoteId === note.id) {
                        cancelEditing();
                    }
                    if (editingReminderId === note.id) {
                        setEditingReminderId(null);
                    }
                } catch (e) {
                    console.error('Error eliminando nota de empresa', e);
                    setError(
                        __('error_eliminando_nota_empresa') ||
                        'Error eliminando la nota de la empresa.'
                    );
                } finally {
                    setDeletingId(null);
                }
            },
        });
    };

    const relevanceColor = (relevance) => {
        switch (Number(relevance)) {
            case 1: return '#0d6efd'; // baja
            case 2: return '#0dcaf0';
            case 3: return '#ffc107';
            case 4: return '#fd7e14';
            case 5: return '#dc3545'; // alta
            default: return '#6c757d';
        }
    };

    // 🔹 Opciones de relevancia (las mismas 1..5)
    const relevanceOptions = [
        { value: 1, label: __('baja') },
        { value: 2, label: __('media_baja') },
        { value: 3, label: __('media') },
        { value: 4, label: __('media_alta') },
        { value: 5, label: __('alta') },
    ];

    const isInitialLoading = loading && notes.length === 0;

    //Fecha recordatorio:
    const handleReminderChange = async (note, date) => {
        const newDate = toLocalYmd(date); // 'YYYY-MM-DD' o null

        setSavingReminderId(note.id);
        setError(null);

        try {
            const response = await axios.put(
                route('company-notes.update-reminder', note.id),
                {
                    remind_at: newDate,
                }
            );

            const updated = response.data?.data || null;

            if (updated) {
                setNotes(prev =>
                    prev.map((n) =>
                        n.id === note.id
                            ? {
                                ...n,
                                remind_at: updated.remind_at,
                                remind_at_formatted: updated.remind_at_formatted,
                            }
                            : n
                    )
                );
            }

            setEditingReminderId(null);
        } catch (e) {
            console.error('Error actualizando recordatorio de empresa', e);
            setError(__('error_actualizando_recordatorio_empresa') || 'Error actualizando recordatorio.');
        } finally {
            setSavingReminderId(null);
        }
    };

    // 🔹 Cambio de relevancia
    const handleRelevanceChange = async (note, value) => {
        setSavingRelevanceId(note.id);
        setError(null);

        try {
            const response = await axios.put(
                route('company-notes.update-relevance', note.id),
                {
                    relevance: value,
                }
            );

            const updated = response.data?.data || null;

            if (updated) {
                setNotes((prev) =>
                    prev.map((n) =>
                        n.id === note.id
                            ? {
                                ...n,
                                relevance: updated.relevance,
                            }
                            : n
                    )
                );
            }
            setEditingRelevanceId(null);
        } catch (e) {
            console.error('Error actualizando relevancia nota empresa', e);
            setError(
                __('error_actualizando_relevancia_empresa') ||
                'Error actualizando la relevancia.'
            );
        } finally {
            setSavingRelevanceId(null);
        }
    };

    // Notas fijadas
    const handleTogglePin = async (note) => {
        setSavingPinId(note.id);
        setError(null);

        try {
            const response = await axios.put(
                route('company-notes.toggle-pin', note.id)
            );

            const updated = response.data?.data || null;

            if (updated) {
                setNotes((prev) =>
                    sortNotes(
                        prev.map((n) =>
                            n.id === note.id
                                ? { ...n, is_pinned: updated.is_pinned }
                                : n
                        )
                    )
                );
            }
        } catch (e) {
            console.error('Error fijando/desfijando nota empresa', e);
            setError(
                __('error_pin_nota_empresa') ||
                'Error al fijar o desfijar la nota.'
            );
        } finally {
            setSavingPinId(null);
        }
    };

    //Edición nota:
    const startEditing = (note) => {
        setEditingNoteId(note.id);
        setEditForm({
            title: note.title || '',
            body: note.body || '',
        });
    };

    const cancelEditing = () => {
        setEditingNoteId(null);
        setEditForm({ title: '', body: '' });
    };

    const handleEditChange = (field, value) => {
        setEditForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const saveEdit = async (note) => {
        if (savingEditId) return;

        setSavingEditId(note.id);
        setError(null);

        try {
            const response = await axios.put(
                route('company-notes.update', note.id),
                {
                    title: editForm.title,
                    body: editForm.body,
                }
            );

            const updated = response.data?.data || null;

            if (updated) {
                setNotes((prev) =>
                    prev.map((n) =>
                        n.id === note.id
                            ? {
                                ...n,
                                title: updated.title,
                                body: updated.body,
                                created_at: updated.created_at,
                                created_at_formatted: updated.created_at_formatted,
                            }
                            : n
                    )
                );
            }

            cancelEditing();
        } catch (e) {
            console.error('Error actualizando nota empresa', e);
            setError(
                __('error_actualizando_nota_empresa') ||
                'Error actualizando la nota.'
            );
        } finally {
            setSavingEditId(null);
        }
    };

    //Archivar nota:
    const handleArchive = (note) => {
        showConfirm({
            title: __('nota_archivar') || 'Archivar nota',
            text:
                __('nota_archivar_confirm') ||
                'La nota se archivará y dejará de mostrarse aquí, pero no se eliminará.',
            icon: 'warning',
            onConfirm: async () => {
                setSavingArchiveId(note.id);
                setError(null);

                try {
                    await axios.put(
                        route('company-notes.toggle-archive', note.id),
                        { archive: true }
                    );

                    // Como esta vista solo muestra activas, la quitamos del listado
                    setNotes((prev) => prev.filter((n) => n.id !== note.id));

                    if (editingNoteId === note.id) {
                        cancelEditing();
                    }
                    if (editingReminderId === note.id) {
                        setEditingReminderId(null);
                    }
                    if (editingRelevanceId === note.id) {
                        setEditingRelevanceId(null);
                    }
                } catch (e) {
                    console.error('Error archivando nota empresa', e);
                    setError(
                        __('error_archivando_nota_empresa') ||
                            'Error archivando la nota.'
                    );
                } finally {
                    setSavingArchiveId(null);
                }
            },
        });
    };

    return (
        <div className="col-12 gy-2">

            {/* Buscador contextual */}
            <div className="mb-3 d-flex align-items-center gap-2">
                <div className="flex-grow-1">
                    <div className="input-group">
                        <span className="input-group-text">
                            <i className="la la-search" aria-hidden="true" />
                        </span>
                        <input
                            type="text"
                            className="form-control"
                            placeholder={
                                __('notas_filtrar')
                                || 'Buscar en título, texto y etiquetas...'
                            }
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
                {search && (
                    <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => setSearch('')}
                    >
                        <i className="la la-times me-1" />
                        {__('limpiar') || 'Limpiar'}
                    </button>
                )}
            </div>

            {/* Contenedor con scroll vertical propio */}
            <div
                ref={scrollContainerRef}
                className="company-notes-scroll border rounded"
                style={{
                    maxHeight: '60vh',
                    overflowY: 'auto',
                    padding: '0.75rem',
                }}
            >
                {error && (
                    <div className="alert alert-danger mx-0">
                        {error}
                    </div>
                )}

                {/* Spinner de carga inicial */}
                {isInitialLoading && (
                    <div className="d-flex justify-content-center py-3">
                        <div className="spinner-border text-secondary" role="status">
                            <span className="visually-hidden">
                                {__('cargando') || 'Cargando...'}
                            </span>
                        </div>
                    </div>
                )}

                {notes.length === 0 && !loading && !error && (
                    <p className="text-center text-warning my-5">
                        {__('notas_no_mas') || 'No hay notas para esta empresa.'}
                    </p>
                )}

                {notes.map((note) => (
                    <div key={note.id} className="card mb-3 shadow-sm">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center flex-grow-1">
                                {/* 🔹 Flag clicable para cambiar relevancia */}
                                <span
                                    className="me-2"
                                    style={{
                                        fontSize: '1.1rem',
                                        color: relevanceColor(note.relevance),
                                        cursor: savingRelevanceId === note.id ? 'default' : 'pointer',
                                    }}
                                    title={__('cambiar_relevancia') || 'Cambiar relevancia'}
                                    onClick={() => {
                                        if (savingRelevanceId === note.id) return;
                                        setEditingRelevanceId(
                                            editingRelevanceId === note.id ? null : note.id
                                        );
                                    }}
                                >
                                    ⚑
                                </span>

                                {editingNoteId === note.id ? (
                                    <div className="flex-grow-1">
                                        <TextInput
                                            value={editForm.title}
                                            onChange={(e) =>
                                                handleEditChange('title', e.target.value)
                                            }
                                            placeholder={__('nota_titulo_placeholder') || 'Título de la nota'}
                                        />
                                    </div>
                                ) : (
                                    <strong>
                                        {note.title || __('nota_sin_titulo') || 'Nota'}
                                    </strong>
                                )}
                            </div>

                            <small className="text-muted ms-2 text-nowrap">
                                {note.created_at_formatted}
                            </small>

                            {note.is_pinned && (
                                <span className="badge bg-warning text-dark ms-2">
                                    {__('fijada') || 'Fijada'}
                                </span>
                            )}
                        </div>

                        {/* 🔹 Selector inline de relevancia */}
                        {editingRelevanceId === note.id && (
                            <div className="px-3 pt-2">
                                <div className="btn-group btn-group-sm" role="group">
                                    {relevanceOptions.map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            className={
                                                'btn btn-sm ' +
                                                (Number(note.relevance) === Number(opt.value)
                                                    ? 'btn-primary'
                                                    : 'btn-outline-secondary')
                                            }
                                            onClick={() =>
                                                handleRelevanceChange(note, opt.value)
                                            }
                                            disabled={savingRelevanceId === note.id}
                                        >
                                            <span
                                                className="me-1"
                                                style={{
                                                    color: relevanceColor(opt.value),
                                                    fontSize: '1rem',
                                                }}
                                            >
                                                ⚑
                                            </span>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="card-body">
                            {editingNoteId === note.id ? (
                                <div className="mb-2">
                                    <Textarea
                                        value={editForm.body}
                                        onChange={(e) =>
                                            handleEditChange('body', e.target.value)
                                        }
                                        wysiwyg={true}
                                        rows={6}
                                    />
                                </div>
                            ) : note.body ? (
                                <div
                                    className="mb-2"
                                    dangerouslySetInnerHTML={{ __html: note.body }}
                                />
                            ) : (
                                <p className="text-muted fst-italic mb-2">
                                    {__('nota_sin_contenido') || 'Nota sin contenido.'}
                                </p>
                            )}

                            {/* Autor / user_id */}
                            <div className="small text-muted">
                                <span>
                                    {__('autor') || 'Autor'}:{' '}
                                    <strong>
                                        {
                                            note.user?.name
                                            || note.owner?.name
                                            || note.user_name
                                            || (note.user_id ? `ID: ${note.user_id}` : __('desconocido') || 'Desconocido')
                                        }
                                    </strong>
                                </span>

                                {note.remind_at_formatted && (
                                    <>
                                        <span className="mx-2">·</span>
                                        <span>
                                            {__('recordar_en_fecha') || 'Recordar en'}:{' '}
                                            <strong>{note.remind_at_formatted}</strong>
                                        </span>
                                    </>
                                )}
                            </div>

                            {note.tags && note.tags.length > 0 && (
                                <div className="mt-2">
                                    {note.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="badge bg-light text-dark me-1"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="card-footer d-flex justify-content-end gap-2">
                            <div className="me-auto">
                                {editingReminderId === note.id && (
                                    <div style={{ maxWidth: '260px' }}>
                                        <DatePickerToForm
                                            name="remind_at"
                                            selected={note.remind_at}
                                            onChange={(_, date) => handleReminderChange(note, date)}
                                            dateFormat="dd/MM/yyyy"
                                            required={false}
                                            addon={true}
                                            minDate={new Date()}
                                            maxDate={null}
                                            disabled={savingReminderId === note.id}
                                        />
                                    </div>
                                )}
                            </div>

                            <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() =>
                                    setEditingReminderId(
                                        editingReminderId === note.id ? null : note.id
                                    )
                                }
                                disabled={savingReminderId === note.id || savingEditId === note.id}
                            >
                                <i className="la la-clock me-1" />
                                {note.remind_at_formatted
                                    ? note.remind_at_formatted
                                    : __('recordatorio') || 'Recordatorio'}
                            </button>

                            {editingNoteId === note.id ? (
                                <>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-secondary"
                                        onClick={cancelEditing}
                                        disabled={savingEditId === note.id}
                                    >
                                        {__('cancelar') || 'Cancelar'}
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-primary"
                                        onClick={() => saveEdit(note)}
                                        disabled={savingEditId === note.id}
                                    >
                                        {savingEditId === note.id && (
                                            <span
                                                className="spinner-border spinner-border-sm me-1"
                                                role="status"
                                            />
                                        )}
                                        {__('guardar') || 'Guardar'}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        type="button"
                                        className={
                                            'btn btn-sm ' +
                                            (note.is_pinned
                                                ? 'btn-warning'
                                                : 'btn-outline-warning')
                                        }
                                        onClick={() => handleTogglePin(note)}
                                        disabled={savingPinId === note.id}
                                    >
                                        {savingPinId === note.id && (
                                            <span
                                                className="spinner-border spinner-border-sm me-1"
                                                role="status"
                                            />
                                        )}
                                        <i className="la la-thumbtack me-1" />
                                        {note.is_pinned
                                            ? __('desfijar') || 'Desfijar'
                                            : __('fijar') || 'Fijar'}
                                    </button>

                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-primary"
                                        onClick={() => startEditing(note)}
                                    >
                                        <i className="la la-edit me-1" />
                                        {__('editar') || 'Editar'}
                                    </button>

                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-secondary"
                                        onClick={() => handleArchive(note)}
                                        disabled={
                                            savingArchiveId === note.id ||
                                            deletingId === note.id ||
                                            savingEditId === note.id
                                        }
                                    >
                                        {savingArchiveId === note.id && (
                                            <span
                                                className="spinner-border spinner-border-sm me-1"
                                                role="status"
                                            />
                                        )}
                                        <i className="la la-archive me-1" />
                                        {__('archivar') || 'Archivar'}
                                    </button>

                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-danger"
                                        onClick={() => handleDelete(note)}
                                        disabled={deletingId === note.id || savingEditId === note.id}
                                    >
                                        {deletingId === note.id && (
                                            <span
                                                className="spinner-border spinner-border-sm me-1"
                                                role="status"
                                            />
                                        )}
                                        <i className="la la-trash me-1" />
                                        {__('eliminar') || 'Eliminar'}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                ))}

                {/* Loader para el infinite scroll */}
                <div ref={loaderRef} className="text-center py-2">
                    {loading && notes.length > 0 && (
                        <div className="d-flex justify-content-center">
                            <div
                                className="spinner-border spinner-border-sm text-secondary"
                                role="status"
                            >
                                <span className="visually-hidden">
                                    {__('cargando') || 'Cargando...'}
                                </span>
                            </div>
                        </div>
                    )}
                    {!hasMore && notes.length > 0 && !loading && (
                        <span className="text-muted small">
                            {__('notas_no_mas') || 'No hay más notas.'}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
