import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';

// Components:
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SelectSearch from '@/Components/SelectSearch';
import Textarea from '@/Components/Textarea';
import TextInput from '@/Components/TextInput';
import UserSearch from '@/Components/UserSearch';
import OpportunityStatusSelect from '@/Components/OpportunityStatusSelect';

// Hooks:
import { useTranslation } from '@/Hooks/useTranslation';
import { useHandleDelete } from '@/Utils/useHandleDelete.jsx';

export default function Index({ 
    auth, 
    session, 
    title, 
    subtitle, 
    availableLocales,
    opportunity,
    contactName,
    crmAccounts = []
}){
    const __ = useTranslation();
    const props = usePage()?.props || {};
    const permissions = props.permissions || {};

    // Set formulario (mismos campos que Create, pero inicializados con la oportunidad):
    const { data, setData, put, errors, processing } = useForm({
        name: opportunity?.name ?? '',
        observations: opportunity?.observations ?? '',
        crm_account_id: opportunity?.crm_account_id ?? null,
        status: opportunity?.status ?? 1,
    });

    //Confirmación de eliminación (por si se usa en acciones):
    const { handleDelete } = useHandleDelete('oportunidad', 'crm-opportunities.destroy', [opportunity.id]);

    const crmAccountOptions = (crmAccounts || []).map(acc => ({
        value: acc.id,
        label: acc.name,
        meta: acc,
    }));

    // Envío formulario:
    function handleSubmit(e) {
        e.preventDefault();
        put(route('crm-opportunities.update', opportunity.id), {
            preserveScroll: true,
        });
    }

    //Acciones:
    const actions = [];
    if (permissions?.['crm-opportunities.index']) {
        actions.push({
            text: __('oportunidades_volver'),
            icon: 'la-angle-left',
            url: 'crm-opportunities.index',
            modal: false
        });
    }

    if (permissions?.['crm-opportunities.create']) {
        actions.push({
            text: __('oportunidad_nueva'),
            icon: 'la-plus',
            url: 'crm-opportunities.create',
            modal: false
        });
    }

    return (
        <AdminAuthenticatedLayout
            user={auth.user}
            title={title}
            subtitle={subtitle}
            actions={actions}
        >
            <Head title={title} />

            {/* Contenido */}
            <div className="contents pb-4">
                <div className="row">
                    <div className="col-12">
                        <h2>
                            {__('oportunidad')} <u>{ opportunity.name }</u>
                        </h2>
                    </div>

                    {/* Info */}
                    <div className="col-12 mt-2 mb-4">
                        {contactName && (
                            <span className="text-muted me-5">
                                {__('contacto')}: <strong>{contactName}</strong>
                            </span>
                        )}

                        <span className="text-muted me-5">
                            {__('creado')}: <strong>{opportunity.formatted_created_at}</strong> 
                        </span>

                        <span className="text-muted">
                            {__('actualizado')}: <strong>{opportunity.formatted_updated_at}</strong>
                        </span>
                    </div>
                </div>

                {/* Formulario (basado en Create.jsx) */}
                <form onSubmit={handleSubmit}>
                    <div className="row gy-3">
                        {/* Nombre de la oportunidad */}
                        <div className="col-md-6">
                            <label className="form-label">
                                {__('titulo')}*
                            </label>
                            <TextInput
                                type="text"
                                name="name"
                                value={data?.name ?? ''}
                                onChange={(e) => setData('name', e?.target?.value ?? '')}
                                maxLength={255}
                                required
                            />
                            <InputError message={errors.name} />
                        </div>

                        {/* Estado (select con colores) */}
                        <div className="col-md-6">
                            <div className="mb-3">
                                <OpportunityStatusSelect
                                    id="opportunity_status"
                                    name="status"
                                    value={data?.status ?? 1}
                                    onChange={(e) => setData('status', e.target ? e.target.value : e)}
                                    error={errors.status}
                                    label={__('estado')}
                                />
                            </div>
                        </div>
                        <div className="w-100 m-0"></div>

                        {/* Cuenta / CRM Account */}
                        <div className="col-lg-6">
                            <label className="form-label">
                                {__('cuenta_crm')}
                            </label>
                            <SelectSearch
                                name="crm_account_id"
                                value={data?.crm_account_id ?? null}
                                options={crmAccountOptions}
                                onChange={(opt) => setData('crm_account_id', opt ? opt.value : null)}
                                placeholder={__('cuenta_crm_selec')}
                            />
                            <InputError message={errors.crm_account_id} />
                        </div>

                        {/* Observaciones */}
                        <div className="col-12">
                            <label className="form-label">
                                {__('observaciones')}
                            </label>
                            <Textarea
                                name="observations"
                                value={data?.observations ?? ''}
                                onChange={(e) => setData('observations', e.target ? e.target.value : e)}
                                className="form-control"
                                rows={4}
                            />
                            <InputError message={errors.observations} />
                        </div>

                        {/* Botones */}
                        <div className="mt-4 text-end">
                            <PrimaryButton disabled={processing} className="btn btn-rdn">
                                {processing ? `${__('procesando')}...` : __('guardar')}
                            </PrimaryButton>
                        </div>
                    </div>
                </form>
            </div>
        </AdminAuthenticatedLayout>
    );
}


