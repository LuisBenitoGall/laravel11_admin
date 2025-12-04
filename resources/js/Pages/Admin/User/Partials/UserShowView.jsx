import React from 'react';

//Components:
import ManagePhones from '@/Components/ManagePhones';

//Hooks:
import { useTranslation } from '@/Hooks/useTranslation';

export default function UserShowView({ record }) {
    const __ = useTranslation();
    const user = record;
    const today = new Date();
    let birthdayNotice = null;

    if (user.birthday) {
        const birth = new Date(user.birthday); // viene tipo "YYYY-MM-DD"
        const currentYear = today.getFullYear();

        // Próximo cumpleaños en el año actual
        let nextBirthday = new Date(currentYear, birth.getMonth(), birth.getDate());

        // Normalizamos "hoy" a medianoche
        const todayMidnight = new Date(currentYear, today.getMonth(), today.getDate());

        // Si ya pasó este año, usamos el año siguiente
        if (nextBirthday < todayMidnight) {
            nextBirthday = new Date(currentYear + 1, birth.getMonth(), birth.getDate());
        }

        const diffMs = nextBirthday - todayMidnight;
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays >= 0 && diffDays <= 15) {
            birthdayNotice = (
                <p className="mb-1 text-success fw-bold">
                    {diffDays} {__('dias_su_aniversario')}
                </p>
            );
        }
    }

    const sexLabel = (() => {
        const s = String(user?.sex ?? '').trim().toLowerCase();
        if (s === 'm') return __('mujer');
        if (s === 'h') return __('hombre');
        return '';
    })();

    return (
        <div className="contact-show-view">
            <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                    <h4 className="mb-1">
                        {user.full_name || `${user.name} ${user.surname}`}
                    </h4>
                    <div className="text-muted">
                        {user.company?.name}
                    </div>
                </div>

                <div className="btn-group">
                    <a
                        href={route('users.edit', { user: user.id })}
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
                            <strong>Email:</strong> {user.email ?? '—'}
                        </p>
                        <p className="mb-1">
                            <strong>{ __('fecha_nacimiento') }:</strong> {user.birthday_formatted ?? ''}
                        </p>
                        {birthdayNotice}
                        
                        {sexLabel && (
                            <p className="mb-1">
                                <strong>{ __('sexo') }:</strong> {sexLabel}
                            </p>
                        )}

                        {user.contact_type_label && (
                            <p className="mb-1">
                                <strong>{ __('contacto_tipo') }:</strong> {user.contact_type_label}
                            </p>
                        )}

                        {user.contact_subtype_name && (
                            <p className="mb-1">
                                <strong>{ __('contacto_subtipo') }:</strong> {user.contact_subtype_name}
                            </p>
                        )}
                    </div>

                    {/* Avatar */}
                    <div className="col-3 text-end">
                        {user.avatar?.image ? (
                            <img 
                                src={`/storage/users/${user.avatar.image}`} 
                                alt={user.full_name || user.name}
                                className="img-fluid rounded-circle float-end"
                                style={{ maxWidth: '60px', maxHeight: '60px', objectFit: 'cover' }}
                            />
                        ) : (
                            <div 
                                className="rounded-circle bg-secondary d-flex align-items-center justify-content-center float-end"
                                style={{ width: '60px', height: '60px' }}
                            >
                                <i className="la la-user text-white" style={{ fontSize: '4rem' }}></i>
                            </div>
                        )}
                    </div>
                </div>
                <hr/>

                {/* Empresa */}
                <div className="row my-4">
                    <div className="col-12">
                        <h5 className="mb-3">{ __('empresa') }</h5>

                        {Array.isArray(user.companies) && user.companies.length > 0 ? (
                            <div className="list-group">
                                {user.companies.map(company => (
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
                            phoneableType="User"
                            phoneableId={user.id}
                            defaultWaMessage={__('whatsapp_mensaje')}
                            addNewPhone={false}  // no mostrar botón "Nuevo teléfono"
                            rowXs={1}
                            rowMd={2}
                            rowLg={2} 
                        />
                    </div>
                </div>
                <hr/>

                {user.notes && (
                    <>
                        <h6 className="text-uppercase text-muted small mb-2">{ __(notas) }</h6>
                        <p>{user.notes}</p>
                    </>
                )}
            </div>
        </div>
    );
}
