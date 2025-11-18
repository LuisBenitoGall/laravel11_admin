import React from 'react';

//Components:
import ManagePhones from '@/Components/ManagePhones';

//Hooks:
import { useTranslation } from '@/Hooks/useTranslation';

export default function CompanyShowView({ record }) {
    const __ = useTranslation();
    const company = record;
    const today = new Date();

    return (
        <div className="contact-show-view">
            <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                    <h4 className="mb-1">
                        {company.name || `${company.name}`}
                    </h4>
                    <div className="text-muted">
                        {company.company?.name}
                    </div>
                </div>

                <div className="btn-group">
                    <a
                        href={route('companies.edit', { company: company.id })}
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
                            <strong>Email:</strong> {company.email ?? '—'}
                        </p>
                    </div>

                    {/* Avatar */}
                    <div className="col-3 text-end">
                        {company.avatar?.image ? (
                            <img 
                                src={`/storage/companies/${company.logo}`} 
                                alt={company.name}
                                className="img-fluid rounded-circle float-end"
                                style={{ maxWidth: '60px', maxHeight: '60px', objectFit: 'cover' }}
                            />
                        ) : (
                            <div 
                                className="rounded-circle bg-secondary d-flex align-items-center justify-content-center float-end"
                                style={{ width: '60px', height: '60px' }}
                            >
                                <i className="la la-company text-white" style={{ fontSize: '4rem' }}></i>
                            </div>
                        )}
                    </div>
                </div>
                <hr/>

                <div className="row mb-4">
                    <div className="col-12">
                        {/* Teléfonos */}
                        <ManagePhones 
                            phoneableType="company"
                            phoneableId={company.id}
                            defaultWaMessage={__('whatsapp_mensaje')}
                            addNewPhone={false}  // no mostrar botón "Nuevo teléfono"
                            rowXs={1}
                            rowMd={2}
                            rowLg={2} 
                        />
                    </div>
                </div>
                <hr/>

                {company.notes && (
                    <>
                        <h6 className="text-uppercase text-muted small mb-2">{ __(notas) }</h6>
                        <p>{company.notes}</p>
                    </>
                )}
            </div>
        </div>
    );
}
