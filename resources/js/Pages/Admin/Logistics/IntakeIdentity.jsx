import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, router, useForm, usePage } from '@inertiajs/react';

import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import RadioButton from '@/Components/RadioButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';

import { useTranslation } from '@/Hooks/useTranslation';

const EMPTY_FORM = Object.freeze({ type: 'company', email: '', nif: '', name: '' });

export default function IntakeIdentity({
    auth,
    title,
    subtitle,
    form: initialForm = EMPTY_FORM,
    result = null,
}) {
    const __ = useTranslation();
    const props = usePage()?.props || {};
    const permissions = props.permissions || {};

    const searchForm = useForm({
        type: initialForm?.type || 'company',
        email: initialForm?.email || '',
        nif: initialForm?.nif || '',
    });

    const createForm = useForm({
        type: initialForm?.type || 'company',
        name: '',
        email: initialForm?.email || '',
        nif: initialForm?.nif || '',
    });

    const typeOptions = [
        { value: 'company', label: __('intake_identity_tipo_empresa') },
        { value: 'user', label: __('intake_identity_tipo_particular') },
    ];

    const handleSearchChange = (e) => {
        const { name, value } = e.target;
        searchForm.setData(name, value);
        if (name === 'type') {
            createForm.setData('type', value);
        }
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        searchForm.post(route('logistics.intake-identity.search'), {
            preserveScroll: true,
        });
    };

    const handleEnsure = (type, id) => {
        router.post(route('logistics.intake-identity.ensure'), { type, id }, {
            preserveScroll: true,
        });
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        createForm.transform((data) => ({
            ...data,
            type: searchForm.data.type,
            email: searchForm.data.email,
            nif: searchForm.data.nif,
        })).post(route('logistics.intake-identity.store'), {
            preserveScroll: true,
            onSuccess: () => createForm.reset('name'),
        });
    };

    const canCreateCompany = !!permissions?.['customers.create'];
    const canCreateUser = !!(permissions?.['users.create'] || permissions?.['customers.create']);
    const canCreate =
        (searchForm.data.type === 'company' && canCreateCompany) ||
        (searchForm.data.type === 'user' && canCreateUser);

    const companies = result?.companies || [];
    const users = result?.users || [];
    const status = result?.status || null;

    return (
        <AdminAuthenticatedLayout user={auth.user} title={title} subtitle={subtitle} actions={[]}>
            <Head title={title} />

            <div className="contents pb-4">
                <p className="text-muted mb-3">{__('intake_identity_ayuda')}</p>

                <form onSubmit={handleSearchSubmit} className="mb-4">
                    <div className="mb-3">
                        <label className="form-label">{__('intake_identity_tipo')}</label>
                        <RadioButton
                            name="type"
                            value={searchForm.data.type}
                            onChange={handleSearchChange}
                            options={typeOptions}
                            required
                        />
                        <InputError message={searchForm.errors.type} />
                    </div>

                    <div className="row g-3">
                        <div className="col-md-6">
                            <label className="form-label" htmlFor="intake-email">{__('email')}</label>
                            <TextInput
                                id="intake-email"
                                name="email"
                                type="email"
                                className="form-control"
                                value={searchForm.data.email}
                                onChange={handleSearchChange}
                            />
                            <InputError message={searchForm.errors.email} />
                        </div>
                        <div className="col-md-6">
                            <label className="form-label" htmlFor="intake-nif">{__('nif')}</label>
                            <TextInput
                                id="intake-nif"
                                name="nif"
                                type="text"
                                className="form-control"
                                value={searchForm.data.nif}
                                onChange={handleSearchChange}
                            />
                            <InputError message={searchForm.errors.nif} />
                        </div>
                    </div>

                    <div className="mt-3">
                        <PrimaryButton type="submit" disabled={searchForm.processing}>
                            {__('buscar')}
                        </PrimaryButton>
                    </div>
                </form>

                {status === 'conflict' && (
                    <div className="alert alert-warning">
                        <p className="mb-2 fw-semibold">{__('intake_identity_conflicto')}</p>
                        <p className="mb-3">{__('intake_identity_conflicto_texto')}</p>
                        <CandidateList
                            title={__('empresas')}
                            items={companies}
                            type="company"
                            onSelect={handleEnsure}
                            canSelect={canCreateCompany}
                            __={__}
                        />
                        <CandidateList
                            title={__('usuarios')}
                            items={users}
                            type="user"
                            onSelect={handleEnsure}
                            canSelect={canCreateUser}
                            __={__}
                        />
                    </div>
                )}

                {status === 'match' && (
                    <div className="alert alert-info">
                        <p className="mb-2 fw-semibold">{__('intake_identity_match')}</p>
                        {searchForm.data.type === 'company' ? (
                            <CandidateList
                                title={__('empresas')}
                                items={companies}
                                type="company"
                                onSelect={handleEnsure}
                                canSelect={canCreateCompany}
                                __={__}
                            />
                        ) : (
                            <CandidateList
                                title={__('usuarios')}
                                items={users}
                                type="user"
                                onSelect={handleEnsure}
                                canSelect={canCreateUser}
                                __={__}
                            />
                        )}
                    </div>
                )}

                {status === 'none' && canCreate && (
                    <div className="border rounded p-3 bg-light">
                        <p className="fw-semibold mb-2">{__('intake_identity_alta')}</p>
                        <p className="text-muted small mb-3">{__('intake_identity_alta_texto')}</p>
                        <form onSubmit={handleCreateSubmit}>
                            {searchForm.data.type === 'user' && (
                                <div className="mb-3">
                                    <label className="form-label" htmlFor="intake-name">{__('nombre')}</label>
                                    <TextInput
                                        id="intake-name"
                                        name="name"
                                        type="text"
                                        className="form-control"
                                        value={createForm.data.name}
                                        onChange={(e) => createForm.setData('name', e.target.value)}
                                    />
                                    <InputError message={createForm.errors.name} />
                                </div>
                            )}
                            <SecondaryButton type="submit" disabled={createForm.processing}>
                                {searchForm.data.type === 'company'
                                    ? __('intake_identity_crear_empresa')
                                    : __('intake_identity_crear_particular')}
                            </SecondaryButton>
                            <InputError message={createForm.errors.type} className="mt-2" />
                        </form>
                    </div>
                )}
            </div>
        </AdminAuthenticatedLayout>
    );
}

function CandidateList({ title, items, type, onSelect, canSelect, __ }) {
    if (!items?.length) {
        return null;
    }

    return (
        <div className="mb-3">
            <div className="fw-semibold mb-1">{title}</div>
            <ul className="list-group">
                {items.map((item) => (
                    <li
                        key={`${type}-${item.id}`}
                        className="list-group-item d-flex justify-content-between align-items-center"
                    >
                        <div>
                            <div>{item.label}</div>
                            <small className="text-muted">
                                {item.nif ? `${__('nif')}: ${item.nif}` : ''}
                                {item.email ? ` ${__('email')}: ${item.email}` : ''}
                            </small>
                        </div>
                        {canSelect && (
                            <PrimaryButton
                                type="button"
                                className="btn-sm"
                                onClick={() => onSelect(type, item.id)}
                            >
                                {__('intake_identity_usar')}
                            </PrimaryButton>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}
