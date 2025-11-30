import React from 'react';

//Components:
import ManagePhones from '@/Components/ManagePhones';

//Hooks:
import { useTranslation } from '@/Hooks/useTranslation';

export default function CrmOpportunitiesShowView({ record }) {
    const __ = useTranslation();
    const account = record;
    const today = new Date();

    return (
        <div className="contact-show-view">
            <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                    <h4 className="mb-1">
                        {account.name || `${account.name}`}
                    </h4>
                    <div className="text-muted">
                        {account.company?.name}
                    </div>
                </div>

                <div className="btn-group">
                    <a
                        href={route('crm-accounts.edit', { account: account.id })}
                        className="btn btn-sm btn-primary"
                    >
                        <i className="la la-edit me-1" />
                        { __('editar') }
                    </a>
                    {/* Otros CTAs que quieras */}
                </div>
            </div>
            <hr />

            <div className="vertical-scroll">
                {/* Datos personales */}
                <div className="row mb-4">
                    <div className="col-md-9">
                        <h5 className="mb-3">{ __('datos_basicos') }</h5>
                        <p className="mb-1">
                            <strong>Email:</strong> {account.email ?? '—'}
                        </p>
                    </div>

                    {/* Avatar */}
                    <div className="col-3 text-end">
                        {account.avatar?.image ? (
                            <img 
                                src={`/storage/companies/${account.company.logo}`} 
                                alt={account.full_name || account.name}
                                className="img-fluid rounded-circle float-end"
                                style={{ maxWidth: '60px', maxHeight: '60px', objectFit: 'cover' }}
                            />
                        ) : (
                            <div 
                                className="rounded-circle bg-secondary d-flex align-items-center justify-content-center float-end"
                                style={{ width: '60px', height: '60px' }}
                            >
                                <i className="la la-account text-white" style={{ fontSize: '4rem' }}></i>
                            </div>
                        )}
                    </div>
                </div>
                <hr/>

                {/* Empresa */}
                <div className="row my-4">
                    <div className="col-12">
                        <h5 className="mb-3">{ __('empresa') }</h5>

                        {Array.isArray(account.companies) && account.companies.length > 0 ? (
                            <div className="list-group">
                                {account.companies.map(company => (
                                    <div
                                        key={company.id}
                                        className="list-group-item py-2"
                                    >
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <div className="fw-semibold">
                                                    {company.name}

                                                    {company.tradename &&
                                                        company.tradename !== company.name && (
                                                            <span className="text-muted ms-2">
                                                                ({company.tradename})
                                                            </span>
                                                    )}
                                                </div>

                                                <div className="small text-muted">
                                                    {company.nif && (
                                                        <span>
                                                            <strong>{__('nif')}:</strong> {company.nif}
                                                        </span>
                                                    )}

                                                    {company.pivot.position && (
                                                        <span className="ms-4">
                                                            <strong>{__('cargo')}:</strong> {company.pivot.position}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {company.status === 1 && (
                                                <span className="badge bg-success">
                                                    {__('activa')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted mb-0">
                                {__('empresa_no_asignada')}
                            </p>
                        )}
                    </div>
                </div>

                <div className="row mb-4">
                    <div className="col-12">
                        {/* Teléfonos */}
                        <ManagePhones 
                            phoneableType="account"
                            phoneableId={account.id}
                            defaultWaMessage={__('whatsapp_mensaje')}
                            addNewPhone={false}  // no mostrar botón "Nuevo teléfono"
                            rowXs={1}
                            rowMd={2}
                            rowLg={2} 
                        />
                    </div>
                </div>
                <hr/>

                {account.notes && (
                    <>
                        <h6 className="text-uppercase text-muted small mb-2">{ __(notas) }</h6>
                        <p>{account.notes}</p>
                    </>
                )}
            </div>
        </div>
    );
}
