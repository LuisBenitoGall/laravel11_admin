import React, { useState, useEffect } from 'react';
import { router, useForm } from '@inertiajs/react';
import ReusableModal from '@/Components/modals/ModalTemplate';
import TextInput from '@/Components/TextInput';
import Textarea from '@/Components/Textarea';
import SelectInput from '@/Components/SelectInput';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useTranslation } from '@/Hooks/useTranslation';
import axios from 'axios';

export default function EventFormModal({ show, onClose, event, scheduleId, schedules, onSaved }) {
    const __ = useTranslation();
    const isEditing = !!event;

    const [selectedScheduleId, setSelectedScheduleId] = useState(scheduleId || null);
    const [startsAt, setStartsAt] = useState(event?.starts_at ? new Date(event.starts_at) : new Date());
    const [endsAt, setEndsAt] = useState(event?.ends_at ? new Date(event.ends_at) : new Date());
    const [allDay, setAllDay] = useState(event?.all_day || false);
    const [localErrors, setLocalErrors] = useState({});

    const { data, setData, post, put, processing, errors, reset } = useForm({
        title: event?.title || '',
        description: event?.description || '',
        location: event?.location || '',
        starts_at: '',
        ends_at: '',
        all_day: false,
        schedule_id: selectedScheduleId,
    });

    useEffect(() => {
        if (event) {
            setStartsAt(new Date(event.starts_at));
            setEndsAt(new Date(event.ends_at));
            setAllDay(event.all_day || false);
            setSelectedScheduleId(event.schedule_id);
            setData({
                title: event.title || '',
                description: event.description || '',
                location: event.location || '',
                schedule_id: event.schedule_id,
            });
        } else {
            setStartsAt(new Date());
            setEndsAt(new Date(Date.now() + 60 * 60 * 1000));
            setAllDay(false);
            setSelectedScheduleId(scheduleId || null);
            reset();
        }
    }, [event, scheduleId]);

    useEffect(() => {
        setData('schedule_id', selectedScheduleId);
    }, [selectedScheduleId]);

    useEffect(() => {
        setData('starts_at', startsAt.toISOString());
    }, [startsAt]);

    useEffect(() => {
        setData('ends_at', endsAt.toISOString());
    }, [endsAt]);

    useEffect(() => {
        setData('all_day', allDay);
    }, [allDay]);

    const handleSubmit = (e) => {
        e.preventDefault();

        setLocalErrors({});

        if (!selectedScheduleId) {
            alert(__('agenda_selec'));
            return;
        }

        // Validación frontend de coherencia fecha/hora e intervalo mínimo de 15 minutos
        if (startsAt && endsAt) {
            const startTime = startsAt.getTime();
            const endTime = endsAt.getTime();

            if (endTime < startTime) {
                setLocalErrors({
                    ends_at: __('fecha_fin_debe_ser_posterior') || 'La fecha/hora de fin no puede ser anterior a la de inicio.',
                });
                return;
            }

            if (!allDay) {
                const minMs = 15 * 60 * 1000;
                if ((endTime - startTime) < minMs) {
                    setLocalErrors({
                        ends_at: __('evento_duracion_minima_15') || 'La hora de fin debe ser al menos 15 minutos posterior a la de inicio.',
                    });
                    return;
                }
            }
        }

        // Los eventos se guardan vía axios porque el backend devuelve JSON
        const url = isEditing
            ? `/admin/schedule-events/${event.id}`
            : `/admin/schedules/${selectedScheduleId}/events`;

        const method = isEditing ? 'put' : 'post';

        axios[method](url, data)
            .then(() => {
                onSaved();
            })
            .catch((error) => {
                console.error('Error saving event:', error);
                // Los errores de validación se mostrarán vía FlashMessage del backend
            });
    };

    return (
        <ReusableModal
            show={show}
            onClose={onClose}
            title={isEditing ? __('evento_editar') : __('evento_nuevo')}
            onConfirm={handleSubmit}
            confirmText={processing ? __('guardando') : __('guardar')}
            cancelText={__('cancelar')}
            confirmDisabled={processing || !selectedScheduleId}
            confirmLoading={processing}
            dialogClassName="modal-lg"
        >
            <form onSubmit={handleSubmit}>
                {!isEditing && (
                    <div className="mb-3">
                        <label className="form-label">{__('agenda')} *</label>
                        <SelectInput
                            value={selectedScheduleId || ''}
                            onChange={(e) => setSelectedScheduleId(parseInt(e.target.value))}
                            required
                        >
                            <option value="">{__('agenda_selec')}</option>
                            {schedules.map((schedule) => (
                                <option key={schedule.id} value={schedule.id}>
                                    {schedule.name}
                                </option>
                            ))}
                        </SelectInput>
                        <InputError message={errors.schedule_id} />
                    </div>
                )}

                <div className="mb-3">
                    <label className="form-label">{__('titulo')} *</label>
                    <TextInput
                        name="title"
                        value={data.title}
                        onChange={(e) => setData('title', e.target.value)}
                        required
                        isFocused
                    />
                    <InputError message={errors.title} />
                </div>

                <div className="mb-3">
                    <label className="form-label">{__('descripcion')}</label>
                    <Textarea
                        name="description"
                        value={data.description}
                        onChange={(e) => setData('description', e.target.value)}
                    />
                    <InputError message={errors.description} />
                </div>

                <div className="mb-3">
                    <label className="form-label">{__('ubicacion')}</label>
                    <TextInput
                        name="location"
                        value={data.location}
                        onChange={(e) => setData('location', e.target.value)}
                    />
                    <InputError message={errors.location} />
                </div>

                <div className="mb-3">
                    <div className="form-check">
                        <Checkbox
                            checked={allDay}
                            onChange={(e) => setAllDay(e.target.checked)}
                        />
                        <label className="form-check-label ms-2">
                            {__('todo_dia')}
                        </label>
                    </div>
                </div>

                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label">{__('inicio')} *</label>
                        <DatePicker
                            selected={startsAt}
                            onChange={(date) => setStartsAt(date)}
                            showTimeSelect={!allDay}
                            timeFormat="HH:mm"
                            timeIntervals={15}
                            dateFormat={allDay ? 'yyyy-MM-dd' : 'yyyy-MM-dd HH:mm'}
                            className="form-control"
                            required
                        />
                        <InputError message={errors.starts_at} />
                    </div>

                    <div className="col-md-6 mb-3">
                        <label className="form-label">{__('fin')} *</label>
                        <DatePicker
                            selected={endsAt}
                            onChange={(date) => setEndsAt(date)}
                            showTimeSelect={!allDay}
                            timeFormat="HH:mm"
                            timeIntervals={15}
                            dateFormat={allDay ? 'yyyy-MM-dd' : 'yyyy-MM-dd HH:mm'}
                            minDate={startsAt}
                            className="form-control"
                            required
                        />
                        <InputError message={localErrors.ends_at || errors.ends_at} />
                    </div>
                </div>
            </form>
        </ReusableModal>
    );
}
