import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useEffect } from 'react';

// Components:
import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import SelectInput from '@/Components/SelectInput';
import TextInput from '@/Components/TextInput';
import InfoPopover from '@/Components/InfoPopover';

// Hooks:
import { useTranslation } from '@/Hooks/useTranslation';
import { useCompanySession } from '@/Hooks/useCompanySession';
import { useSweetAlert } from '@/Hooks/useSweetAlert';

export default function Create({
    auth,
    session,
    title,
    subtitle,
    owners = [],
    listTypes = [],
    statusOptions = [],
}) {
    const __ = useTranslation();
    const props = usePage()?.props || {};
    const locale = props.locale || false;
    const languages = props.languages || [];
    const permissions = props.permissions || {};


    const { currentCompany } = useCompanySession();
    const { successAlert, errorAlert } = useSweetAlert();

    const { data, setData, post, processing, errors, reset } = useForm({
        owner_id: '',
        name: '',
        slug: '',
        type: '',
        is_dynamic: false,
        status: 1,
        observations: '',
    });

    // Autogenerar slug a partir del nombre (si el usuario no lo ha tocado "a mano")
    useEffect(() => {
        if (!data.name) {
            return;
        }

        // Solo autogeneramos si slug está vacío o coincide con el anterior patrón
        setData((prev) => {
            const currentSlug = prev.slug || '';
            const autoFromName = slugify(data.name);

            // Si el slug está vacío o parece auto generado, lo reemplazamos
            if (!currentSlug || currentSlug === autoFromName) {
                return {
                    ...prev,
                    slug: autoFromName,
                };
            }

            return prev;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.name]);

    // Si el tipo es "dynamic", marcamos automáticamente is_dynamic
    useEffect(() => {
        if (data.type === 'dynamic' || data.type === 'dinamica') {
            if (!data.is_dynamic) {
                setData('is_dynamic', true);
            }
        }
        // No forzamos a false si cambia, por si quieres jugar con combinaciones
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.type]);

    const handleSubmit = (e) => {
        e.preventDefault();

        post(route('marketing-lists.store'), {
            preserveScroll: true,
            onSuccess: () => {
                successAlert(__('La lista de marketing se ha creado correctamente.'));
                reset('observations');
            },
            onError: () => {
                errorAlert(__('Se ha producido un error al crear la lista de marketing.'));
            },
        });
    };

    const handleCancel = () => {
        window.history.back();
    };

    // Acciones:
    const actions = [];
    if (permissions?.['marketing-lists.index']) {
        actions.push({
            text: __('listas_volver'),
            icon: 'la-angle-left',
            url: 'marketing-lists.index',
            modal: false,
        });
    }

    return (
        <AdminAuthenticatedLayout
            user={auth.user}
            title={title}
            subtitle={subtitle || __('Nueva lista de marketing')}
            actions={actions}
        >
            <Head title={title} />

            <div className="contents pb-4">
                <div className="row">
                    <div className="col-lg-9">
                        <div className="card">
                            <div className="card-header d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">{__('Datos principales')}</h5>
                                {currentCompany && (
                                    <span className="badge bg-light text-muted">
                                        {__('Empresa')}: {currentCompany.name}
                                    </span>
                                )}
                            </div>
                            <div className="card-body">
                                <form onSubmit={handleSubmit} noValidate>
                                    <div className="row mb-3">
                                        {/* Propietario */}
                                        <div className="col-md-6">
                                            <label htmlFor="owner_id" className="form-label">
                                                {__('Propietario')}
                                            </label>
                                            <SelectInput
                                                id="owner_id"
                                                name="owner_id"
                                                className="form-select"
                                                value={data.owner_id || ''}
                                                onChange={(e) =>
                                                    setData('owner_id', e.target.value || '')
                                                }
                                            >
                                                <option value="">
                                                    {__('Selecciona un usuario responsable')}
                                                </option>
                                                {owners.map((user) => (
                                                    <option key={user.id} value={user.id}>
                                                        {user.full_name || user.name}
                                                    </option>
                                                ))}
                                            </SelectInput>
                                            <InputError message={errors.owner_id} className="mt-1" />
                                        </div>

                                        {/* Estado */}
                                        <div className="col-md-3">
                                            <label htmlFor="status" className="form-label d-flex">
                                                <span>{__('Estado')}</span>
                                                <InfoPopover
                                                    id="status_help"
                                                    content={__('Determina si la lista está activa o inactiva.')}
                                                />
                                            </label>
                                            <SelectInput
                                                id="status"
                                                name="status"
                                                className="form-select"
                                                value={data.status}
                                                onChange={(e) =>
                                                    setData('status', Number(e.target.value))
                                                }
                                            >
                                                {(statusOptions.length
                                                    ? statusOptions
                                                    : [
                                                        { value: 1, label: __('Activa') },
                                                        { value: 0, label: __('Inactiva') },
                                                    ]
                                                ).map((status) => (
                                                    <option
                                                        key={status.value}
                                                        value={status.value}
                                                    >
                                                        {status.label}
                                                    </option>
                                                ))}
                                            </SelectInput>
                                            <InputError message={errors.status} className="mt-1" />
                                        </div>

                                        {/* Tipo */}
                                        <div className="col-md-3">
                                            <label htmlFor="type" className="form-label d-flex">
                                                <span>{__('Tipo')}</span>
                                                <InfoPopover
                                                    id="type_help"
                                                    content={__(
                                                        'Puedes usarlo para clasificar listas (estática, dinámica, importar, etc.).'
                                                    )}
                                                />
                                            </label>
                                            <SelectInput
                                                id="type"
                                                name="type"
                                                className="form-select"
                                                value={data.type || ''}
                                                onChange={(e) => setData('type', e.target.value)}
                                            >
                                                <option value="">{__('Sin especificar')}</option>
                                                {(listTypes.length
                                                    ? listTypes
                                                    : [
                                                        { value: 'static', label: __('Estática') },
                                                        { value: 'dynamic', label: __('Dinámica') },
                                                    ]
                                                ).map((item) => (
                                                    <option key={item.value} value={item.value}>
                                                        {item.label}
                                                    </option>
                                                ))}
                                            </SelectInput>
                                            <InputError message={errors.type} className="mt-1" />
                                        </div>
                                    </div>

                                    <div className="row mb-3">
                                        {/* Nombre */}
                                        <div className="col-md-8">
                                            <label htmlFor="name" className="form-label">
                                                {__('Nombre de la lista')}
                                            </label>
                                            <TextInput
                                                id="name"
                                                name="name"
                                                type="text"
                                                className="form-control"
                                                value={data.name}
                                                onChange={(e) =>
                                                    setData('name', e.target.value)
                                                }
                                                required
                                                autoFocus
                                            />
                                            <InputError message={errors.name} className="mt-1" />
                                        </div>

                                        {/* Slug */}
                                        <div className="col-md-4">
                                            <label htmlFor="slug" className="form-label d-flex">
                                                <span>{__('Slug')}</span>
                                                <InfoPopover
                                                    id="slug_help"
                                                    content={__(
                                                        'Identificador interno único por empresa. Se genera a partir del nombre, pero puedes editarlo.'
                                                    )}
                                                />
                                            </label>
                                            <TextInput
                                                id="slug"
                                                name="slug"
                                                type="text"
                                                className="form-control"
                                                value={data.slug}
                                                onChange={(e) =>
                                                    setData('slug', e.target.value)
                                                }
                                                required
                                            />
                                            <InputError message={errors.slug} className="mt-1" />
                                        </div>
                                    </div>

                                    {/* Dinámica / reglas */}
                                    <div className="row mb-3">
                                        <div className="col-md-6 d-flex align-items-center">
                                            <Checkbox
                                                id="is_dynamic"
                                                name="is_dynamic"
                                                checked={Boolean(data.is_dynamic)}
                                                onChange={(e) =>
                                                    setData('is_dynamic', e.target.checked)
                                                }
                                            />
                                            <label
                                                htmlFor="is_dynamic"
                                                className="ms-2 mb-0"
                                            >
                                                {__('Lista dinámica (basada en reglas)')}
                                            </label>
                                            <InfoPopover
                                                id="dynamic_help"
                                                content={__(
                                                    'Marca esta opción si la lista se genera o actualiza automáticamente mediante reglas o filtros.'
                                                )}
                                            />
                                            <InputError
                                                message={errors.is_dynamic}
                                                className="ms-2"
                                            />
                                        </div>
                                    </div>

                                    {/* Observaciones */}
                                    <div className="mb-3">
                                        <label htmlFor="observations" className="form-label">
                                            {__('Observaciones')}
                                        </label>
                                        <textarea
                                            id="observations"
                                            name="observations"
                                            className="form-control"
                                            rows={4}
                                            value={data.observations || ''}
                                            onChange={(e) =>
                                                setData('observations', e.target.value)
                                            }
                                        />
                                        <InputError
                                            message={errors.observations}
                                            className="mt-1"
                                        />
                                    </div>

                                    <div className="d-flex justify-content-end gap-2 mt-4">
                                        <SecondaryButton
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={handleCancel}
                                            disabled={processing}
                                        >
                                            {__('Cancelar')}
                                        </SecondaryButton>
                                        <PrimaryButton
                                            type="submit"
                                            className="btn btn-primary"
                                            disabled={processing}
                                        >
                                            {processing
                                                ? __('Guardando...')
                                                : __('Crear lista')}
                                        </PrimaryButton>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Panel lateral de info / ayuda si quieres rellenarlo luego */}
                    <div className="col-lg-3 mt-3 mt-lg-0">
                        <div className="card">
                            <div className="card-header">
                                <h6 className="mb-0">{__('Información')}</h6>
                            </div>
                            <div className="card-body small text-muted">
                                <p className="mb-2">
                                    {__(
                                        'Una lista de marketing agrupa contactos o cuentas que comparten algún criterio de segmentación.'
                                    )}
                                </p>
                                <p className="mb-0">
                                    {__(
                                        'Puedes reutilizar las listas en múltiples campañas, y controlar su uso mediante el campo "Estado" y el tipo.'
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminAuthenticatedLayout>
    );
}

/**
 * Pequeño helper local para generar slugs
 */
function slugify(value) {
    return (value || '')
        .toString()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
