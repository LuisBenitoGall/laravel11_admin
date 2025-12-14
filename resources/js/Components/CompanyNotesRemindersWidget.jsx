// resources/js/Components/widgets/CompanyNotesRemindersWidget.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Hooks:
import { useTranslation } from '@/Hooks/useTranslation';

export default function CompanyNotesRemindersWidget() {
    const __ = useTranslation();

    const [reminders, setReminders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [expandedIds, setExpandedIds] = useState([]);

    const relevanceColor = (relevance) => {
        switch (Number(relevance)) {
            case 1: return '#0d6efd';
            case 2: return '#0dcaf0';
            case 3: return '#ffc107';
            case 4: return '#fd7e14';
            case 5: return '#dc3545';
            default: return '#6c757d';
        }
    };

    const fetchReminders = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(
                route('company-notes.owner-reminders')
            );

            const raw = response.data || [];
            const items = Array.isArray(raw)
                ? raw
                : Array.isArray(raw.data)
                    ? raw.data
                    : [];

            setReminders(items);
        } catch (e) {
            console.error('Error cargando recordatorios de notas de empresa', e);
            setError(
                __('error_cargando_recordatorios_empresas') ||
                'Error cargando los recordatorios de tus notas de empresa.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReminders();
    }, []);

    const hasReminders = reminders && reminders.length > 0;

    const isExpanded = (id) => expandedIds.includes(id);

    const toggleExpanded = (id) => {
        setExpandedIds((prev) =>
            prev.includes(id)
                ? prev.filter((x) => x !== id)
                : [...prev, id]
        );
    };

    const getCompanyLabel = (note) => {
        // 1) Si viene anidado
        if (note.subject_company) {
            const c = note.subject_company;
            if (c.name) return c.name;
        }

        // 2) Si el resource lo expone plano
        if (note.subject_company_name) return note.subject_company_name;

        return '';
    };

    return (
        <div className="card shadow-sm h-100">
            <div className="card-header d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center">
                    <i className="la la-building me-2" aria-hidden="true" />
                    <span className="fw-semibold">
                        {__('recordatorios_cuentas') || 'Recordatorios (empresas)'}
                    </span>
                </div>

                {hasReminders && (
                    <span className="badge bg-secondary">
                        {reminders.length}
                    </span>
                )}
            </div>

            <div
                className="card-body p-2"
                style={{
                    maxHeight: '320px',
                    overflowY: 'auto',
                }}
            >
                {loading && (
                    <div className="d-flex justify-content-center py-3">
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

                {error && !loading && (
                    <div className="alert alert-danger mb-2">
                        {error}
                    </div>
                )}

                {!loading && !error && !hasReminders && (
                    <p className="text-muted small mb-0">
                        {__('notas_no_mas') ||
                            'No tienes recordatorios de notas de empresa pendientes.'}
                    </p>
                )}

                {!loading && !error && hasReminders && (
                    <ul className="list-unstyled mb-0">
                        {reminders.map((note) => {
                            const expanded = isExpanded(note.id);
                            const companyLabel = getCompanyLabel(note);

                            return (
                                <li
                                    key={note.id}
                                    className="border-bottom py-2"
                                >
                                    <div className="d-flex align-items-start">
                                        {/* Flag relevancia */}
                                        <span
                                            style={{
                                                fontSize: '1.1rem',
                                                color: relevanceColor(note.relevance),
                                            }}
                                        >
                                            ⚑
                                        </span>

                                        <div className="flex-grow-1 ms-2">
                                            {/* Cabecera clickable */}
                                            <div
                                                className="d-flex justify-content-between align-items-start"
                                                style={{ cursor: 'pointer' }}
                                                onClick={() => toggleExpanded(note.id)}
                                            >
                                                <div className="me-2">
                                                    <strong className="d-block">
                                                        {note.title ||
                                                            __('nota_sin_titulo') ||
                                                            'Nota'}
                                                    </strong>

                                                    {companyLabel && (
                                                        <small className="text-muted d-block">
                                                            <i className="la la-building me-1" />
                                                            {companyLabel}
                                                        </small>
                                                    )}
                                                </div>

                                                <div className="text-end">
                                                    <small className="text-muted text-nowrap d-block">
                                                        {note.remind_at_formatted ||
                                                            note.remind_at ||
                                                            ''}
                                                    </small>
                                                    <small className="text-muted">
                                                        <i
                                                            className={
                                                                'la ' +
                                                                (expanded
                                                                    ? 'la-angle-up'
                                                                    : 'la-angle-down')
                                                            }
                                                        />
                                                    </small>
                                                </div>
                                            </div>

                                            {/* Tags */}
                                            {Array.isArray(note.tags) &&
                                                note.tags.length > 0 && (
                                                    <div className="mt-1">
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

                                            {/* Cuerpo desplegable */}
                                            {expanded && note.body && (
                                                <div className="mt-2 small">
                                                    <div
                                                        className="border rounded p-2 bg-light"
                                                        dangerouslySetInnerHTML={{
                                                            __html: note.body,
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            {!loading && hasReminders && (
                <div className="card-footer text-end py-2">
                    <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={fetchReminders}
                    >
                        <i className="la la-refresh me-1" />
                        {__('actualizar') || 'Actualizar'}
                    </button>
                </div>
            )}
        </div>
    );
}
