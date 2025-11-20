// resources/js/Components/UserNotes/UserNoteForm.jsx
import React, { useState, useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import DatePicker from 'react-datepicker';

//Components:
import DatePickerToForm from '@/Components/DatePickerToForm';
import RelevanceSelect from '@/Components/RelevanceSelect';
import TextInput from '@/Components/TextInput';
import Textarea from '@/Components/Textarea';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import { useTranslation } from '@/Hooks/useTranslation';

//Utils:
import { toLocalYmd } from '@/Utils/dateHelpers';

export default function UserNoteForm({
    contact,        // usuario objeto de la nota (requerido para crear)
    user_company,
    note = null,    // nota existente para edición (opcional)
    onProcessingChange,
    onSuccess,      // callback opcional para cerrar modal / refrescar lista
    className = '',
    formRef = null, // ref externo al <form> (para usar con ReusableModal)
    showSubmitButton = true,
    submitLabel = null,
}) {
    const __ = useTranslation();
    const datepickerFormat = 'dd/MM/yyyy';

    const isEdit = !!(note && note.id);

    const { data, setData, post, processing, errors, reset } = useForm({
        id: note?.id ?? null,
        contact_id: note?.contact_id ?? contact?.id ?? null,
        user_company: user_company ?? null,
        title: note?.title ?? '',
        body: note?.body ?? '',
        tags: Array.isArray(note?.tags) ? note.tags.join(', ') : (note?.tags ?? ''),
        relevance: note?.relevance ?? 3,
        remind_at: note?.remind_at ?? '',
        is_pinned: note?.is_pinned ?? false,
        is_archived: note?.is_archived ?? false,
    });

    const [submitting, setSubmitting] = useState(false);

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
            onStart: () => setSubmitting(true),
            onFinish: () => setSubmitting(false),
            onSuccess: () => {
                if (!isEdit) {
                    reset('title', 'body', 'tags', 'relevance', 'remind_at', 'is_pinned', 'is_archived');
                }

                if (typeof onSuccess === 'function') {
                    onSuccess();
                }
            },
        });
    };

    const submitText = submitLabel || (isEdit ? __('guardar_cambios') : __('guardar_nota'));
    const isBusy = processing || submitting;

    useEffect(() => {
        if (typeof onProcessingChange === 'function') {
            onProcessingChange(isBusy);
        }
    }, [isBusy, onProcessingChange]);

    return (
        <form onSubmit={handleSubmit} className={className} ref={formRef}>
            <div className="row">
                {/* Título */}
                <div className="col-md-8">
                    <div className="mb-3">
                        <label htmlFor="user-note-title" className="form-label">
                            {__('titulo')}*
                        </label>
                        <TextInput
                            id="user-note-title"
                            name="title"
                            value={data.title}
                            onChange={handleChange('title')}
                            autoComplete="off"
                            required
                        />
                        <InputError message={errors.title} className="mt-1" />
                    </div>
                </div>

                {/* Relevancia */}
                <div className="col-md-4">
                    <div className="mb-3">
                        <RelevanceSelect
                            id="user-note-relevance"
                            name="relevance"
                            value={data.relevance}
                            onChange={handleChange('relevance')}
                            error={errors.relevance}
                        />
                        <InputError message={errors.relevance} className="mt-1" />
                    </div>
                </div>
            </div>

            {/* Nota (WYSIWYG) */}
            <div className="mb-3">
                <label htmlFor="user-note-body" className="form-label">
                    {__('nota')}*
                </label>
                <Textarea
                    id="user-note-body"
                    name="body"
                    value={data.body}
                    onChange={handleChange('body')}
                    wysiwyg={true}
                    rows={6}
                    required
                />
                <InputError message={errors.body} className="mt-1" />
            </div>

            <div className="row">
                {/* Tags */}
                <div className="col-md-8">
                    <div className="mb-3">
                        <label htmlFor="user-note-tags" className="form-label">
                            {__('etiquetas')}
                        </label>
                        <TextInput
                            id="user-note-tags"
                            name="tags"
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
                </div>

                {/* Recordatorio */}
                <div className="col-md-4">
                    <div className="mb-3">
                        <label htmlFor="remind_at" className="form-label">
                            {__('recordar_en_fecha')}</label>
                        <DatePickerToForm
                            id="user-note-remind-at"
                            name="remind_at"
                            selected={data.remind_at}
                            onChange={(name, date) => {
                                setData(name, toLocalYmd(date));
                            }}
                            dateFormat={datepickerFormat}
                            minDate={new Date()}
                            maxDate={null}
                        />
                        <InputError message={errors.remind_at} className="mt-1" />
                    </div>
                </div>
            </div>

            <div className="row mb-3">
                <div className="col-md-4">
                    <div className="form-check form-switch">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id="user-note-pinned"
                            checked={!!data.is_pinned}
                            onChange={handleCheckboxChange('is_pinned')}
                        />
                        <label className="form-check-label" htmlFor="user-note-pinned">
                            {__('nota_fijar')}
                        </label>
                    </div>
                    <InputError message={errors.is_pinned} className="mt-1" />
                </div>

                {/* Ocultamos la opción de archivar para nuevas notas */}
                {/* <div className="col-md-4">
                    <div className="form-check form-switch">
                        <input
                            className="form-check-input"
                            type="checkbox"
                            id="user-note-archived"
                            checked={!!data.is_archived}
                            onChange={handleCheckboxChange('is_archived')}
                        />
                        <label className="form-check-label" htmlFor="user-note-archived">
                            {__('nota_archivar')}
                        </label>
                    </div>
                    <InputError message={errors.is_archived} className="mt-1" />
                </div> */}
            </div>

            {/* Hidden contact_id e id para upsert */}
            <input type="hidden" name="id" value={data.id || ''} />
            <input type="hidden" name="contact_id" value={data.contact_id || ''} />

            {showSubmitButton && (
                <div className="d-flex justify-content-end gap-2 mt-3">
                    <PrimaryButton
                        type="submit"
                        disabled={isBusy}
                        className="btn btn-rdn d-inline-flex align-items-center"
                    >
                        {isBusy && (
                            <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                            />
                        )}
                        {isBusy ? __('procesando') + '…' : submitText}
                    </PrimaryButton>
                </div>
            )}
        </form>
    );
}
