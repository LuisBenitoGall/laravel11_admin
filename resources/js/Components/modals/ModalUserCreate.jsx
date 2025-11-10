import { useEffect, useRef } from 'react';
import { useForm, usePage } from '@inertiajs/react';

// Components:
import Checkbox from '@/Components/Checkbox';
import DatePickerToForm from '@/Components/DatePickerToForm';
import InputError from '@/Components/InputError';
import ReusableModal from '@/Components/modals/ModalTemplate';
import SelectInput from '@/Components/SelectInput';
import TextInput from '@/Components/TextInput';

// Hooks
import { useTranslation } from '@/Hooks/useTranslation';

export default function ModalUserCreate({ show, onClose, onCreate, companyId, side, salutations }) {
    const __ = useTranslation();
    const pageProps = usePage()?.props || {};

    const roles = pageProps.roles || {};
    const arrRoles = Object.entries(roles).map(([key, label]) => ({ value: key, label }));

    const { data, setData, post, processing, reset, errors, clearErrors } = useForm({
        role: '',
        name: '',
        surname: '',
        email: '',
        status: true,
        link_company: true,
        send_pwd: false,
        birthday: null,
        position: '',
        salutation: null,
        phones: [''],
        company_id: companyId || null,
        side: side || ''
    });

    useEffect(() => {
        // keep company id in sync if prop changes
        setData('company_id', companyId || null);
        clearErrors();
    }, [show, companyId]);

    const handleAddPhone = () => {
        setData('phones', [...(data.phones || []), '']);
    };

    const handlePhoneChange = (index, value) => {
        const next = [...(data.phones || [])];
        next[index] = value;
        setData('phones', next);
    };

    const handleRemovePhone = (index) => {
        const next = [...(data.phones || [])];
        next.splice(index, 1);
        setData('phones', next.length ? next : ['']);
    };

    const formRef = useRef(null);

    const handleConfirm = () => {
        // If form exists, use HTML5 validation before submitting
        if (formRef.current && typeof formRef.current.reportValidity === 'function') {
            const valid = formRef.current.reportValidity();
            if (!valid) return;
        }

        // Prepare payload: ensure phones as array
        post(route('users.store'), {
            preserveScroll: true,
            onSuccess: (resp) => {
                reset();
                onClose?.();
                if (typeof onCreate === 'function') onCreate(resp);
            }
        });
    };

    return (
        <ReusableModal
            show={show}
            onClose={onClose}
            onConfirm={handleConfirm}
            title={__('usuario_nuevo')}
            confirmText={processing ? __('guardando') : __('guardar')}
            cancelText={__('cancelar')}
        >
            <form ref={formRef} onSubmit={(e) => { e.preventDefault(); handleConfirm(); }}>
                {/* Nombre */}
                <div className="mb-3">
                    <div className="position-relative">
                        <label className="form-label">{__('nombre')}*</label>
                        <TextInput value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                        <InputError message={errors.name} />
                    </div>
                </div>

                {/* Apellidos */}
                <div className="mb-3">
                    <div className="position-relative">
                        <label className="form-label">{__('apellidos')}*</label>
                        <TextInput value={data.surname} onChange={(e) => setData('surname', e.target.value)} required />
                        <InputError message={errors.surname} />
                    </div>
                </div>

                {/* Email */}
                <div className="mb-3">
                    <div className="position-relative">
                        <label className="form-label">{__('email')}*</label>
                        <TextInput type="email" value={data.email} onChange={(e) => setData('email', e.target.value)} required />
                        <InputError message={errors.email} />
                    </div>
                </div>

                {/* Cargo */}
                <div className="mb-3">
                    <div className="position-relative">
                        <label className="form-label">{__('cargo')}</label>
                        <TextInput value={data.position} onChange={(e) => setData('position', e.target.value)} />
                        <InputError message={errors.position} />
                    </div>
                </div>

                
                <div className="mb-3">
                    <div className="position-relative">
                        <div className="row">
                            {/* Fecha de nacimiento */}
                            <div className="col-lg-6">
                                <DatePickerToForm
                                    name="birthday"
                                    selected={data.birthday ? new Date(data.birthday) : null}
                                    onChange={(name, date) => setData(name, date ? date.toISOString().split('T')[0] : null)}
                                    dateFormat="dd/MM/yyyy"
                                    label={'fecha_nacimiento'}
                                    required={false}
                                />
                                <InputError message={errors.birthday} />
                            </div>

                            {/* Tratamiento */}
                            <div className="col-lg-6">
                                <label htmlFor="salutation" className="form-label">{ __('tratamiento') }</label>
                                <SelectInput
                                    className="form-select"
                                    name="salutation"
                                    value={data.salutation}
                                    onChange={(e) => setData('salutation', e.target.value)}
                                >
                                    <option value="">{ __('opcion_selec') }</option>
                                    {salutations.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </SelectInput>
                                <InputError message={errors.salutation} />                                
    
                            </div>
                        </div>
                    </div>
                </div>
            
                {/* Rol */}
                {/* <div className="mb-3">
                    <div className="position-relative">
                        <label className="form-label">{__('role')}</label>
                        <select className={`form-control ${errors.role ? 'is-invalid' : ''}`} value={data.role} onChange={(e) => setData('role', e.target.value)}>
                            <option value="">{__('seleccionar')}</option>
                            {arrRoles.map(r => (
                                <option key={r.value} value={r.value}>{r.label}</option>
                            ))}
                        </select>
                        <InputError message={errors.role} />
                    </div>
                </div> */}

                {/* Telefono */}
                <div className="mb-3">
                    <div className="position-relative">
                        <label className="form-label">{__('telefonos')}</label>
                        <div className="row">
                            <div className="col-md-9">
                        
                                { (data.phones || []).map((ph, idx) => (
                                    <div key={`phone-${idx}`} className="input-group mb-3">
                                        <input type="text" className="form-control" value={ph} onChange={(e) => handlePhoneChange(idx, e.target.value)} maxLength={14} />
                                        <button type="button" className="btn btn-outline-danger" onClick={() => handleRemovePhone(idx)}>
                                            <i className="la la-trash"></i>
                                        </button>
                                    </div>
                                ))}
                                
                                <InputError message={errors.phones} />
                            </div>
                            <div className="col-md-3">
                                <button type="button" className="btn btn-sm btn-secondary mt-2" onClick={handleAddPhone}><i className="la la-plus"></i> {__('telefono') || 'Añadir teléfono'}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
        </ReusableModal>
    );
}
