// resources/js/Components/ManageUserAddresses.jsx

import React, { useState, useRef } from 'react';
import { router } from '@inertiajs/react';
import { Table, OverlayTrigger, Tooltip, Badge } from 'react-bootstrap';

// Components
import ReusableModal from '@/Components/modals/ModalTemplate';
import TextInput from '@/Components/TextInput';
import Textarea from '@/Components/Textarea';
import InputError from '@/Components/InputError';
import Checkbox from '@/Components/Checkbox';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import InfoPopover from '@/Components/InfoPopover';
import LocationSelects from '@/Components/LocationSelects';

// Hooks
import { useTranslation } from '@/Hooks/useTranslation';

export default function ManageUserAddresses({ userId, addresses = [], countries = [] }) {
    const __ = useTranslation();

    const [showModal, setShowModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState({});
    const formRef = useRef(null);

    const emptyForm = {
        country_id: '',
        province_id: '',
        town_id: '',
        cp: '',
        address: '',
        address_extra: '',
        label: '',
        observations: '',
        is_main: false,
    };

    const [form, setForm] = useState(emptyForm);

    const openCreateModal = () => {
        setEditingAddress(null);
        setForm(emptyForm);
        setErrors({});
        setShowModal(true);
    };

    const openEditModal = (address) => {
        setEditingAddress(address);
        setErrors({});
        setForm({
            country_id: address.country_id || '',
            province_id: address.province_id || '',
            town_id: address.town_id || '',
            cp: address.cp || '',
            address: address.address || '',
            address_extra: address.address_extra || '',
            label: address.label || '',
            observations: address.observations || '',
            is_main: !!address.is_main,
        });
        setShowModal(true);
    };

    const closeModal = () => {
        if (processing) return;
        setShowModal(false);
        setEditingAddress(null);
        setErrors({});
        setForm(emptyForm);
    };

    const handleChange = (field, value) => {
        setForm((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // Adaptador para LocationSelects
    const setData = (field, value) => {
        handleChange(field, value);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (processing) return;

        setProcessing(true);
        setErrors({});

        const payload = {
            ...form,
            user_id: userId,
        };

        const url = editingAddress
            ? route('user-addresses.update', editingAddress.id)
            : route('user-addresses.store');

        const method = editingAddress ? 'put' : 'post';

        router[method](url, payload, {
            preserveScroll: true,
            onError: (errors) => {
                setErrors(errors || {});
                setProcessing(false);
            },
            onSuccess: () => {
                setProcessing(false);
                setShowModal(false);
                setEditingAddress(null);
                setForm(emptyForm);
            },
        });
    };

    const handleConfirm = () => {
        // Validación HTML5
        if (formRef.current && typeof formRef.current.reportValidity === 'function') {
            const valid = formRef.current.reportValidity();
            if (!valid) return;
        }

        if (formRef.current && typeof formRef.current.requestSubmit === 'function') {
            formRef.current.requestSubmit();
        } else if (formRef.current) {
            formRef.current.dispatchEvent(
                new Event('submit', { cancelable: true, bubbles: true })
            );
        }
    };

    const handleDelete = (address) => {
        if (!confirm(__('¿Seguro que quieres eliminar esta dirección?'))) {
            return;
        }

        router.delete(route('user-addresses.destroy', address.id), {
            preserveScroll: true,
        });
    };

    const handleSetMain = (address) => {
        if (address.is_main) {
            return;
        }

        router.put(
            route('user-addresses.update', address.id),
            { is_main: true, user_id: userId },
            { preserveScroll: true }
        );
    };

    const renderTown = (address) => {
        const townName =
            address.town_name ||
            address.town?.name ||
            address.town?.label ||
            address.town?.town ||
            '';

        if (!townName && !address.cp) {
            return '';
        }

        if (address.cp && townName) return `${address.cp} - ${townName}`;
        if (address.cp) return address.cp;
        return townName;
    };

    const modalTitle = editingAddress
        ? __('Editar dirección')
        : __('Añadir dirección');

    return (
        <div className="card mb-3">
            <div className="card-header d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                    <h6 className="mb-0">{__('Direcciones')}</h6>
                    <InfoPopover
                        content={__(
                            'Puedes añadir varias direcciones para el usuario y marcar una como principal.'
                        )}
                    />
                </div>
                <PrimaryButton type="button" size="sm" onClick={openCreateModal}>
                    <i className="la la-plus me-1" />
                    {__('Añadir dirección')}
                </PrimaryButton>
            </div>

            <div className="card-body p-0">
                {addresses.length === 0 ? (
                    <p className="mb-0 p-3 text-muted small">
                        {__('No hay direcciones definidas para este usuario.')}
                    </p>
                ) : (
                    <Table striped hover responsive size="sm" className="mb-0">
                        <thead>
                            <tr>
                                <th>{__('Etiqueta')}</th>
                                <th>{__('Dirección')}</th>
                                <th>{__('CP / Población')}</th>
                                <th>{__('Observaciones')}</th>
                                <th className="text-center">{__('Principal')}</th>
                                <th className="text-end">{__('Acciones')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {addresses.map((address) => (
                                <tr key={address.id}>
                                    <td>{address.label || '—'}</td>
                                    <td>
                                        {address.address}
                                        {address.address_extra && (
                                            <div className="text-muted small">
                                                {address.address_extra}
                                            </div>
                                        )}
                                    </td>
                                    <td>{renderTown(address) || '—'}</td>
                                    <td className="small text-muted">
                                        {address.observations || '—'}
                                    </td>
                                    <td className="text-center">
                                        {address.is_main ? (
                                            <Badge bg="success">
                                                <i className="la la-star me-1" />
                                                {__('Principal')}
                                            </Badge>
                                        ) : (
                                            <OverlayTrigger
                                                placement="top"
                                                overlay={
                                                    <Tooltip id={`tt-main-${address.id}`}>
                                                        {__('Marcar como principal')}
                                                    </Tooltip>
                                                }
                                            >
                                                <button
                                                    type="button"
                                                    className="btn btn-link btn-sm text-muted p-0"
                                                    onClick={() => handleSetMain(address)}
                                                >
                                                    <i className="la la-star-o" />
                                                </button>
                                            </OverlayTrigger>
                                        )}
                                    </td>
                                    <td className="text-end">
                                        <div className="btn-group btn-group-sm">
                                            <OverlayTrigger
                                                placement="top"
                                                overlay={
                                                    <Tooltip id={`tt-edit-${address.id}`}>
                                                        {__('Editar')}
                                                    </Tooltip>
                                                }
                                            >
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-secondary"
                                                    onClick={() => openEditModal(address)}
                                                >
                                                    <i className="la la-edit" />
                                                </button>
                                            </OverlayTrigger>

                                            <OverlayTrigger
                                                placement="top"
                                                overlay={
                                                    <Tooltip id={`tt-delete-${address.id}`}>
                                                        {__('Eliminar')}
                                                    </Tooltip>
                                                }
                                            >
                                                <button
                                                    type="button"
                                                    className="btn btn-outline-danger"
                                                    onClick={() => handleDelete(address)}
                                                >
                                                    <i className="la la-trash" />
                                                </button>
                                            </OverlayTrigger>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </div>

            <ReusableModal
                show={showModal}
                onClose={closeModal}
                onConfirm={handleConfirm}
                title={modalTitle}
                confirmText={processing ? __('Guardando...') : __('Guardar')}
                cancelText={__('Cancelar')}
                dialogClassName="modal-dialog-centered modal-xl"
                confirmDisabled={processing}
                confirmLoading={processing}
            >
                <form ref={formRef} onSubmit={handleSubmit}>
                    <div className="row g-3">
                        <div className="col-12">
                            <LocationSelects
                                countries={countries}
                                formData={form}
                                setData={setData}
                                provincesUrl="/api/provinces"
                                townsUrl="/api/towns"
                                labels={{
                                    country: __('pais'),
                                    province: __('provincia'),
                                    town: __('poblacion'),
                                }}
                                layout="split2x2"
                                extraRight={
                                    <>
                                        <label className="form-label">{__('cp')}</label>
                                        <TextInput
                                            name="cp"
                                            value={form.cp}
                                            onChange={(e) => handleChange('cp', e.target.value)}
                                            maxLength={10}
                                        />
                                        <InputError message={errors.cp} className="mt-1" />
                                    </>
                                }
                            />
                        </div>

                        <div className="col-12">
                            <label className="form-label">
                                {__('direccion')} <span className="text-danger">*</span>
                            </label>
                            <TextInput
                                name="address"
                                value={form.address}
                                onChange={(e) => handleChange('address', e.target.value)}
                                required
                                maxLength={255}
                            />
                            <InputError message={errors.address} className="mt-1" />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">
                                {__('Etiqueta')}
                                <span className="text-muted small ms-1">
                                    ({__('ej: Casa, Oficina...')})
                                </span>
                            </label>
                            <TextInput
                                name="label"
                                value={form.label}
                                onChange={(e) => handleChange('label', e.target.value)}
                                maxLength={100}
                            />
                            <InputError message={errors.label} className="mt-1" />
                        </div>

                        <div className="col-md-6">
                            <label className="form-label">{__('Complemento dirección')}</label>
                            <TextInput
                                name="address_extra"
                                value={form.address_extra}
                                onChange={(e) =>
                                    handleChange('address_extra', e.target.value)
                                }
                                maxLength={255}
                            />
                            <InputError message={errors.address_extra} className="mt-1" />
                        </div>

                        <div className="col-12">
                            <label className="form-label">{__('observaciones')}</label>
                            <Textarea
                                name="observations"
                                value={form.observations}
                                onChange={(e) =>
                                    handleChange('observations', e.target.value)
                                }
                                rows={3}
                            />
                            <InputError message={errors.observations} className="mt-1" />
                        </div>

                        <div className="col-12">
                            <div className="form-check">
                                <Checkbox
                                    id="is_main"
                                    name="is_main"
                                    checked={form.is_main}
                                    onChange={(e) =>
                                        handleChange('is_main', e.target.checked)
                                    }
                                />
                                <label htmlFor="is_main" className="form-check-label ms-2">
                                    {__('Marcar como dirección principal')}
                                </label>
                            </div>
                            <InputError message={errors.is_main} className="mt-1" />
                        </div>
                    </div>
                </form>
            </ReusableModal>
        </div>
    );
}
