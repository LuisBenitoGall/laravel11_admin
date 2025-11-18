// resources/js/Components/UserNotes/UserNoteForm.jsx
import React from 'react';
import { useForm } from '@inertiajs/react';
import { Button, Row, Col, Form } from 'react-bootstrap';

import TextInput from '@/Components/TextInput';
import Textarea from '@/Components/Textarea';
import DatePicker from '@/Components/DatePicker';
import InputError from '@/Components/InputError';
import { useTranslation } from '@/Hooks/useTranslation';

export default function UserNoteForm({
    contact,     // usuario objeto de la nota (requerido para crear)
    note = null, // nota existente para edición (opcional)
    onSuccess,   // callback opcional para cerrar modal / refrescar lista
    className = '',
}) {
    const { __ } = useTranslation();

    const isEdit = !!(note && note.id);

    const { data, setData, post, processing, errors, reset } = useForm({
        id: note?.id ?? null,
        contact_id: note?.contact_id ?? contact?.id ?? null,
        title: note?.title ?? '',
        body: note?.body ?? '',
        // de momento tratamos tags como string; el controller ya se encargará
        tags: Array.isArray(note?.tags) ? note.tags.join(', ') : (note?.tags ?? ''),
        relevance: note?.relevance ?? 3,
        remind_at: note?.remind_at ?? '',
        is_pinned: note?.is_pinned ?? false,
        is_archived: note?.is_archived ?? false,
    });

    const handleChange = (field) => (e) => {
        const value = e?.target ? e.target.value : e;
        setData(field, value);
    };

    const handleCheckboxChange = (field) => (e) => {
        setData(field, e.target.checked);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        post(route('user-notes.store'), {
            preserveScroll: true,
            onSuccess: () => {
                // En creación reseteamos el formulario
                if (!isEdit) {
                    reset('title', 'body', 'tags', 'relevance', 'remind_at', 'is_pinned', 'is_archived');
                }

                if (typeof onSuccess === 'function') {
                    onSuccess();
                }
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className={className}>
            <Row>
                {/* Título */}
                <Col md={8}>
                    <div className="mb-3">
                        <TextInput
                            id="user-note-title"
                            name="title"
                            label={__('titulo')}
                            value={data.title}
                            onChange={handleChange('title')}
                            autoComplete="off"
                        />
                        <InputError message={errors.title} className="mt-1" />
                    </div>
                </Col>

                {/* Relevancia */}
                <Col md={4}>
                    <div className="mb-3">
                        <Form.Label htmlFor="user-note-relevance" className="form-label">
                            {__('relevancia')}
                        </Form.Label>
                        <Form.Select
                            id="user-note-relevance"
                            name="relevance"
                            value={data.relevance}
                            onChange={handleChange('relevance')}
                        >
                            <option value={1}>{__('relevancia_baja')}</option>
                            <option value={2}>{__('relevancia_media_baja')}</option>
                            <option value={3}>{__('relevancia_media')}</option>
                            <option value={4}>{__('relevancia_media_alta')}</option>
                            <option value={5}>{__('relevancia_alta')}</option>
                        </Form.Select>
                        <InputError message={errors.relevance} className="mt-1" />
                    </div>
                </Col>
            </Row>

            {/* Nota (WYSIWYG) */}
            <div className="mb-3">
                <Textarea
                    id="user-note-body"
                    name="body"
                    label={__('nota')}
                    value={data.body}
                    onChange={handleChange('body')}
                    wysiwyg={true}
                    rows={6}
                />
                <InputError message={errors.body} className="mt-1" />
            </div>

            <Row>
                {/* Tags */}
                <Col md={8}>
                    <div className="mb-3">
                        <TextInput
                            id="user-note-tags"
                            name="tags"
                            label={__('etiquetas')}
                            placeholder={__('etiquetas_placeholder_comas')}
                            value={data.tags}
                            onChange={handleChange('tags')}
                            autoComplete="off"
                        />
                        <small className="text-muted">
                            {__('etiquetas_ayuda_comas')}
                        </small>
                        <InputError message={errors.tags} className="mt-1" />
                    </div>
                </Col>

                {/* Recordatorio */}
                <Col md={4}>
                    <div className="mb-3">
                        <DatePicker
                            id="user-note-remind-at"
                            name="remind_at"
                            label={__('recordar_el')}
                            value={data.remind_at}
                            onChange={(value) => setData('remind_at', value)}
                            // ajusta estos props a tu DatePicker real si varían
                            isClearable={true}
                        />
                        <InputError message={errors.remind_at} className="mt-1" />
                    </div>
                </Col>
            </Row>

            <Row className="mb-3">
                <Col md={4}>
                    <Form.Check
                        type="switch"
                        id="user-note-pinned"
                        label={__('fijar_nota')}
                        checked={!!data.is_pinned}
                        onChange={handleCheckboxChange('is_pinned')}
                    />
                    <InputError message={errors.is_pinned} className="mt-1" />
                </Col>

                <Col md={4}>
                    <Form.Check
                        type="switch"
                        id="user-note-archived"
                        label={__('archivar_nota')}
                        checked={!!data.is_archived}
                        onChange={handleCheckboxChange('is_archived')}
                    />
                    <InputError message={errors.is_archived} className="mt-1" />
                </Col>
            </Row>

            {/* Hidden contact_id e id para upsert */}
            <input type="hidden" name="id" value={data.id || ''} />
            <input type="hidden" name="contact_id" value={data.contact_id || ''} />

            <div className="d-flex justify-content-end gap-2 mt-3">
                {/* El botón de cancelar lo gestionará el padre si hace falta */}
                <Button type="submit" disabled={processing}>
                    {isEdit ? __('guardar_cambios') : __('guardar_nota')}
                </Button>
            </div>
        </form>
    );
}
