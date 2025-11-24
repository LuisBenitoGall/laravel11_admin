import React from 'react';

//Hooks:
import { useTranslation } from '@/Hooks/useTranslation';

export default function CrmCampaignShowView({ record }) {
    const __ = useTranslation();
    const campaign = record;
    const today = new Date();

    return (
        <div className="contact-show-view">
            <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                    <h4 className="mb-1">
                        {campaign.name || `${campaign.name}`}
                    </h4>
                </div>

                <div className="btn-group">
                    <a
                        href={route('crm-campaigns.edit', { campaign: campaign.id })}
                        className="btn btn-sm btn-primary"
                    >
                        <i className="la la-edit me-1" />
                        { __('editar') }
                    </a>
                </div>
            </div>
            <hr />

            <div className="vertical-scroll">
                {/* Datos genéricos */}
                <div className="row mb-4">
                    <div className="col-md-9">
                        <h5 className="mb-3">{ __('datos_basicos') }</h5>
                        <p className="mb-1">
                            <strong>Email:</strong> {campaign.email ?? '—'}
                        </p>
                    </div>

                    {/* Avatar */}
                    <div className="col-3 text-end">
                        {campaign.avatar?.image ? (
                            <img 
                                src={`/storage/companies/${campaign.company.logo}`} 
                                alt={campaign.full_name || campaign.name}
                                className="img-fluid rounded-circle float-end"
                                style={{ maxWidth: '60px', maxHeight: '60px', objectFit: 'cover' }}
                            />
                        ) : (
                            <div 
                                className="rounded-circle bg-secondary d-flex align-items-center justify-content-center float-end"
                                style={{ width: '60px', height: '60px' }}
                            >
                                <i className="la la-campaign text-white" style={{ fontSize: '4rem' }}></i>
                            </div>
                        )}
                    </div>
                </div>
                <hr/>

                {/* Campaña */}
                <div className="row my-4">
                    <div className="col-12">
                        <h5 className="mb-3">{ __('campanya') }</h5>

                        {Array.isArray(campaign.companies) && campaign.companies.length > 0 ? (
                            <div className="list-group">
                                {campaign.companies.map(company => (
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
            </div>
        </div>
    );
}
