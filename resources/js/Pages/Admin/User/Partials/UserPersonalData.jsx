import React, { useState } from 'react';
import { router, useForm, usePage } from '@inertiajs/react';

// Components:
import Checkbox from '@/Components/Checkbox';
import DatePickerToForm from '@/Components/DatePickerToForm';
import FileInput from '@/Components/FileInput';
import InputError from '@/Components/InputError';
import ManageExtraEmails from '@/Components/ManageExtraEmails';
import ManagePhones from '@/Components/ManagePhones';
import PrimaryButton from '@/Components/PrimaryButton';
import RadioButton from '@/Components/RadioButton';
import SelectInput from '@/Components/SelectInput';
import SetSex from '@/Components/SetSex';
import TextInput from '@/Components/TextInput';

// Hooks:
import { useSweetAlert } from '@/Hooks/useSweetAlert';
import { useTranslation } from '@/Hooks/useTranslation';

// Utils:
import { toLocalYmd } from '@/Utils/dateHelpers';

export default function UserPersonalData({
    user,
    roles = {},
    user_roles = {},
    salutations = [],
    contact_types = [],
    contact_subtypes = [],
    contact_subtype_id = null,
    cost_centers = [],
    user_cost_centers = [],
    crm_contact,
    pivot,                   // ya no lo usamos aquí, pero lo dejo en la firma por si otros tabs lo necesitan
    company_context = null,
    user_companies = [],     // TODAS las relaciones user <-> companies
}) {
    const __ = useTranslation();
    const props = usePage()?.props || {};
    const locale = props.locale || false;
    const { showConfirm } = useSweetAlert();
    const datepickerFormat = props.languages?.[locale]?.[6] || 'dd/MM/yyyy';

    const normalizeOptions = (input) => {
        const out = [];
        if (!input) return out;

        if (Array.isArray(input)) {
            if (input.length && typeof input[0] === 'object') {
                return input.map((item, idx) => {
                    const value = item.value ?? item.id ?? item.key ?? item.name ?? item.label ?? idx;
                    const label = item.label ?? item.name ?? item.title ?? String(item);
                    return { value: String(value), label };
                });
            }
            return input.map((item) => ({ value: String(item), label: String(item) }));
        }

        if (typeof input === 'object') {
            return Object.entries(input).map(([key, value]) => {
                if (value && typeof value === 'object') {
                    const v = value.id ?? value.value ?? key;
                    const l = value.name ?? value.label ?? value.title ?? String(value);
                    return { value: String(v), label: l };
                }
                return { value: String(key), label: String(value) };
            });
        }

        return out;
    };

    const contactTypeOptions = normalizeOptions(contact_types);
    const contactSubtypeOptions = normalizeOptions(contact_subtypes);
    const costCenters = normalizeOptions(cost_centers);

    const normalizeSelected = (input) => {
        if (!input) return [];
        if (Array.isArray(input)) {
            if (input.length && typeof input[0] === 'object') {
                return input.map((item) => String(item.id ?? item.value ?? item.key ?? item.name ?? item));
            }
            return input.map((item) => String(item));
        }

        if (typeof input === 'object') {
            return Object.entries(input).map(([, value]) => String(value?.id ?? value?.value ?? value));
        }

        return [];
    };

    const initialCostCenters = normalizeSelected(user_cost_centers);

    const arrRoles = Object.entries(roles).map(([key, label]) => ({
        value: key,
        label,
    }));

    const currentRole = user_roles?.[0]?.id?.toString() || '';

    const parseYMD = (s) => {
        if (!s) return null;
        const [y, m, d] = String(s).split('-').map(Number);
        if (!y || !m || !d) return null;
        return new Date(y, m - 1, d);
    };

    const toYMD = (d) => {
        if (!d) return null;
        // If already a string in YYYY-MM-DD format, return as-is
        if (typeof d === 'string') {
            const match = d.match(/^\d{4}-\d{2}-\d{2}$/);
            return match ? d : null;
        }

        // Otherwise expect a Date object
        if (d instanceof Date && !isNaN(d.getTime())) {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
        }

        return null;
    };

    const normalizeSex = (v) =>
        v == null ? '' : String(v).trim().toLowerCase().charAt(0);

    const currentCompanyId = company_context?.company_id_real || null;

    // Construimos campos dinámicos para TODOS los user_companies (incluida empresa en sesión si existe)
    const dynamicCompanyFields = {};
    const companiesArray = Array.isArray(user_companies) ? user_companies : [];
    companiesArray.forEach((uc) => {
        const posKey = `position_company_${uc.company_id}`;
        const deptKey = `department_company_${uc.company_id}`;
        dynamicCompanyFields[posKey] = uc.position || '';
        dynamicCompanyFields[deptKey] = uc.department || '';
    });

    const { data, setData, processing, errors, setError } = useForm({
        role: currentRole || (user?.isAdmin == 1 ? '' : 'Invitados'),
        name: user.name || '',
        surname: user.surname || '',
        salutation: user.salutation || '',
        email: user.email || '',
        nif: user.nif || '',
        sex: normalizeSex(user.sex),
        accept_emails: !!user.accept_emails,
        birthday: user.birthday ? parseYMD(user.birthday) : null,
        signature: null,

        contact_type: contactTypeOptions.length
            ? crm_contact?.contact_type ?? ''
            : '',
        contact_subtype: contactSubtypeOptions.length
            ? (
                (contact_subtype_id &&
                    typeof contact_subtype_id === 'object' &&
                    contact_subtype_id.category_id)
                    ? String(contact_subtype_id.category_id)
                    : (contact_subtype_id
                        ? String(contact_subtype_id)
                        : (crm_contact?.contact_subtype_id
                            ? String(crm_contact.contact_subtype_id)
                            : (crm_contact?.contact_subtype
                                ? String(crm_contact.contact_subtype)
                                : '')))
            )
            : '',

        // campos dinámicos para empresas
        ...dynamicCompanyFields,
        cost_centers: initialCostCenters,
    });

    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, type, checked, value, files } = e.target;
        if (type === 'checkbox') {
            setData(name, checked);
        } else if (type === 'file') {
            setData(name, files.length ? files[0] : null);
        } else {
            setData(name, value);
        }
    };

    function handleSubmit(e) {
        e.preventDefault();
        if (submitting) return;

        const formData = new FormData();
        formData.append('_method', 'PUT'); // importante para la ruta users.update

        Object.entries(data).forEach(([key, value]) => {
            if (key === 'signature') {
                if (value instanceof File) {
                    formData.append(key, value);
                }
                return;
            }

            if (key === 'birthday') {
                const ymd = toYMD(value); // 'YYYY-MM-DD' o null
                if (ymd) {
                    formData.append(key, ymd);
                }
                return;
            }

            // Arrays (ej. cost_centers) -> append cada elemento con key[] para Laravel
            if (Array.isArray(value)) {
                value.forEach((v) => {
                    if (v !== null && v !== undefined) {
                        formData.append(`${key}[]`, v);
                    }
                });
                return;
            }

            if (value !== null && value !== undefined) {
                formData.append(key, value);
            }
        });

        setSubmitting(true);

        router.post(route('users.update', user.id), formData, {
            forceFormData: true,
            preserveScroll: true,
            onError: (errBag) => {
                // errBag = { name: '...', surname: '...', nif: '...' }
                setError(errBag);    // esto rellena errors.* en useForm
            },
            onFinish: () => setSubmitting(false),
        });
    }

    const handleDeleteSignature = () => {
        showConfirm({
            title: __('firma_eliminar'),
            text: __('firma_eliminar_confirm'),
            icon: 'warning',
            onConfirm: () => {
                router.delete(route('users.signature.delete', user.id), {
                    preserveScroll: true,
                    onSuccess: () => {
                        location.reload();
                    },
                });
            },
        });
    };

    const companyName = company_context?.name || '';

    return (
        <div className="col-12 gy-2">
            {/* TODO ESTO VA EN EL MISMO <form> PARA QUE SE ENVÍE CON "Guardar" */}
            <form onSubmit={handleSubmit}>
                {/* DATOS PERSONALES */}
                <div className="row gy-3 mb-3">
                    <div className="col-12">
                        <h6 className="mb-3">{__('datos_personales')}</h6>
                    </div>

                    {user?.isAdmin == 1 ? (
                        <div className="col-12">
                            <label htmlFor="role" className="form-label">
                                {__('role')}*
                            </label>
                            <RadioButton
                                name="role"
                                value={data.role}
                                onChange={(e) => setData('role', e.target.value)}
                                options={arrRoles}
                                required
                            />
                            <InputError message={errors.role} />
                        </div>
                    ) : (
                        <input type="hidden" name="role" value={data.role} />
                    )}

                    <div className="col-md-2">
                        <label htmlFor="salutation" className="form-label">
                            {__('tratamiento')}
                        </label>
                        <SelectInput
                            className="form-select"
                            name="salutation"
                            value={data.salutation}
                            onChange={(e) => setData('salutation', e.target.value)}
                        >
                            <option value="">{__('opcion_selec')}</option>
                            {salutations.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </SelectInput>
                        <InputError message={errors.salutation} />
                    </div>

                    <div className="col-md-5">
                        <label htmlFor="name" className="form-label">
                            {__('nombre')}*
                        </label>
                        <TextInput
                            name="name"
                            type="text"
                            placeholder={__('nombre')}
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            maxLength={100}
                            required
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="col-md-5">
                        <label htmlFor="surname" className="form-label">
                            {__('apellidos')}*
                        </label>
                        <TextInput
                            name="surname"
                            type="text"
                            placeholder={__('apellidos')}
                            value={data.surname}
                            onChange={(e) => setData('surname', e.target.value)}
                            maxLength={100}
                            required
                        />
                        <InputError message={errors.surname} />
                    </div>

                    <div className="col-md-6">
                        <label htmlFor="email" className="form-label">
                            {__('email')}
                        </label>
                        <TextInput
                            name="email"
                            type="email"
                            placeholder={__('email')}
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            maxLength={100}
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="col-md-3">
                        <label htmlFor="nif" className="form-label">
                            {__('nif')}
                        </label>
                        <TextInput
                            name="nif"
                            type="text"
                            placeholder={__('nif')}
                            value={data.nif}
                            onChange={(e) => setData('nif', e.target.value)}
                            maxLength={15}
                        />
                        <InputError message={errors.nif} />
                    </div>

                    <div className="col-md-3">
                        <DatePickerToForm
                            id="birthday"
                            name="birthday"
                            selected={data.birthday}
                            onChange={(name, date) => setData(name, toLocalYmd(date))}
                            dateFormat={datepickerFormat}
                            label={'fecha_nacimiento'}
                            required={false}
                        />
                        <InputError message={errors.birthday} />
                    </div>

                    <div className="w-100 m-0" />

                    <SetSex
                        value={data.sex}
                        onChange={(e) => setData('sex', e.target.value)}
                        error={errors.sex}
                    />

                    {/* Acepta emails */}
                    <div className="col-md-4">
                        <label htmlFor="accept_emails" className="form-label">
                            {__('emails_acepta')}
                        </label>

                        <div className="d-flex align-items-start gap-2">
                            <Checkbox
                            className="xl"
                            id="accept_emails"
                            name="accept_emails"
                            checked={!!data.accept_emails}
                            onChange={(e) => setData('accept_emails', e.target.checked)}
                            />

                            {/* Importante: label con htmlFor, multi-línea, clicable */}
                            <label
                            htmlFor="accept_emails"
                            className="mb-0 text-warning user-select-none"
                            style={{ cursor: 'pointer', lineHeight: 1.25 }}
                            >
                            {__('emails_acepta_texto')}
                            </label>
                        </div>

                        <InputError message={errors.accept_emails} />
                    </div>
                </div>

                {/* RELACIÓN CRM CON EMPRESA EN SESIÓN */}
                {crm_contact && (
                    <div className="row gy-3 mb-3">
                        <div className="col-md-4">
                            <label
                                htmlFor="contact_type"
                                className="form-label"
                            >
                                {__('contacto_tipo')}
                            </label>
                            <SelectInput
                                className="form-select"
                                name="contact_type"
                                value={data.contact_type}
                                onChange={(e) =>
                                    setData('contact_type', e.target.value)
                                }
                            >
                                <option value="">{__('opcion_selec')}</option>
                                {contactTypeOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </SelectInput>
                            <InputError message={errors.contact_type} />
                        </div>

                        <div className="col-md-4">
                            <label
                                htmlFor="contact_subtype"
                                className="form-label"
                            >
                                {__('contacto_subtipo')}
                            </label>
                            <SelectInput
                                className="form-select"
                                name="contact_subtype"
                                value={data.contact_subtype}
                                onChange={(e) =>
                                    setData('contact_subtype', e.target.value)
                                }
                            >
                                <option value="">{__('opcion_selec')}</option>
                                {contactSubtypeOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </SelectInput>
                            <InputError message={errors.contact_subtype} />
                        </div>

                        <div className="col-md-4">
                            <label
                                htmlFor="cost_centers"
                                className="form-label"
                            >
                                {__('centro_coste')}
                            </label>
                            <SelectInput
                                className="form-select"
                                name="cost_centers"
                                multiple={false}
                                value={data.cost_centers}
                                onChange={(e) => {
                                    const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
                                    setData('cost_centers', selected);
                                }}
                            >
                                <option value="">{__('opcion_selec')}</option>
                                {costCenters.map((option) => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </SelectInput>
                            <InputError message={errors.cost_centers} />
                        </div>
                    </div>
                )}

                {/* FIRMA */}
                {user?.isAdmin == 1 && (
                    <div className="row gy-3 mb-3">
                        <div className="col-md-6">
                            <label htmlFor="signature" className="form-label">
                                {__('firma')}
                            </label>
                            {user.signature ? (
                                <div className="d-flex align-items-start">
                                    <img
                                        src={`/storage/signatures/${user.signature}`}
                                        alt={user.name}
                                        className="img-thumbnail me-3"
                                        style={{
                                            maxWidth: '300px',
                                            objectFit: 'contain',
                                        }}
                                    />
                                    <button
                                        type="button"
                                        className="ms-2 btn btn-sm btn-danger"
                                        onClick={handleDeleteSignature}
                                    >
                                        <i className="la la-trash"></i>
                                    </button>
                                </div>
                            ) : (
                                <FileInput
                                    name="signature"
                                    accept="image/*"
                                    onChange={handleChange}
                                    error={errors.signature}
                                />
                            )}
                        </div>
                    </div>
                )}

                {/* EMPRESAS VINCULADAS: EDICIÓN POR FILA (MISMO FORM) */}
                {companiesArray.length > 0 && (
                    <div className="my-4">
                        <h6 className="mb-2">{__('empresas')}</h6>
                        <div className="table-responsive" style={{ minHeight: '0px' }}>
                            <table className="table table-sm table-striped mb-0">
                                <thead>
                                    <tr>
                                        <th>{__('empresa')}</th>
                                        <th>{__('cargo')}</th>
                                        <th>{__('departamento')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {companiesArray.map((uc) => {
                                        const posKey = `position_company_${uc.company_id}`;
                                        const deptKey = `department_company_${uc.company_id}`;

                                        return (
                                            <tr key={uc.id}>
                                                <td className="ps-2 align-middle">
                                                    {uc.company?.tradename ||
                                                        uc.company?.name ||
                                                        '-'}
                                                </td>
                                                <td>
                                                    <TextInput
                                                        name={posKey}
                                                        type="text"
                                                        value={data[posKey] ?? ''}
                                                        onChange={(e) =>
                                                            setData(
                                                                posKey,
                                                                e.target.value
                                                            )
                                                        }
                                                        maxLength={150}
                                                    />
                                                </td>
                                                <td>
                                                    <TextInput
                                                        name={deptKey}
                                                        type="text"
                                                        value={data[deptKey] ?? ''}
                                                        onChange={(e) =>
                                                            setData(
                                                                deptKey,
                                                                e.target.value
                                                            )
                                                        }
                                                        maxLength={150}
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                <div className="mt-0 text-end">
                    <PrimaryButton
                        loading={submitting}
                        loadingText={__('guardando')}
                        className="btn btn-rdn"
                    >
                        {__('guardar')}
                    </PrimaryButton>
                </div>
            </form>

            {/* Teléfonos fuera del form, como ya tenías */}
            <ManagePhones
                phoneableType="User"
                phoneableId={user.id}
                defaultWaMessage={__('whatsapp_mensaje')}
            />

            {/* Emails extra */}
            <ManageExtraEmails userId={user.id} addNewEmail={true} />
        </div>
    );
}
