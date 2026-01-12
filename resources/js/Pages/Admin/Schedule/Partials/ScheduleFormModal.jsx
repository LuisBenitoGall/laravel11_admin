import React, { useState, useEffect } from 'react';
import { router, useForm } from '@inertiajs/react';
import ReusableModal from '@/Components/modals/ModalTemplate';
import TextInput from '@/Components/TextInput';
import Textarea from '@/Components/Textarea';
import ColorPicker from '@/Components/ColorPicker';
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import { useTranslation } from '@/Hooks/useTranslation';

export default function ScheduleFormModal({ show, onClose, schedule, onSaved }) {
    const __ = useTranslation();
    const isEditing = !!schedule;

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: schedule?.name || '',
        description: schedule?.description || '',
        color: schedule?.color || '#3788d8',
        status: schedule?.status !== undefined ? schedule.status : true,
    });

    useEffect(() => {
        if (schedule) {
            setData({
                name: schedule.name || '',
                description: schedule.description || '',
                color: schedule.color || '#3788d8',
                status: schedule.status !== undefined ? schedule.status : true,
            });
        } else {
            reset();
        }
    }, [schedule]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (isEditing) {
            put(route('schedules.update', schedule.id), {
                preserveScroll: true,
                onSuccess: () => {
                    onSaved();
                },
            });
        } else {
            post(route('schedules.store'), {
                preserveScroll: true,
                onSuccess: () => {
                    onSaved();
                },
            });
        }
    };

    return (
        <ReusableModal
            show={show}
            onClose={onClose}
            title={isEditing ? __('agenda_editar') : __('agenda_nueva')}
            onConfirm={handleSubmit}
            confirmText={processing ? __('guardando') : __('guardar')}
            cancelText={__('cancelar')}
            confirmDisabled={processing}
            confirmLoading={processing}
        >
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label className="form-label">{__('nombre')} *</label>
                    <TextInput
                        name="name"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        isFocused
                    />
                    <InputError message={errors.name} />
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
                    <label className="form-label">{__('color')}</label>
                    <ColorPicker
                        name="color"
                        value={data.color}
                        onChange={(e) => setData('color', e.target.value)}
                    />
                    <InputError message={errors.color} />
                </div>

                <div className="mb-3">
                    <div className="form-check">
                        <Checkbox
                            name="status"
                            checked={data.status}
                            onChange={(e) => setData('status', e.target.checked)}
                        />
                        <label className="form-check-label ms-2">
                            {__('activo')}
                        </label>
                    </div>
                    <InputError message={errors.status} />
                </div>
            </form>
        </ReusableModal>
    );
}
