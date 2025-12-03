import React from 'react';

//Hooks:
import { useTranslation } from '@/Hooks/useTranslation';

export default function MarketingListShowView({ 
    record,
    n_members
}){
    const __ = useTranslation();
    const list = record;
    const today = new Date();

    return (
        <div className="contact-show-view">
            <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                    <h4 className="mb-1">
                        {list.name || `${list.name}`}
                    </h4>
                </div>

                <div className="btn-group">
                    <a
                        href={route('marketing-lists.edit', { list: list.id })}
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
                            <strong>{ __('fecha_creacion') }:</strong> { list.formatted_created_at }
                        </p>
                        <p className="mb-1">
                            <strong>{ __('propietario') }:</strong> { (list.owner && (list.owner.name || list.owner.full_name)) ? `${list.owner.name ?? list.owner.full_name} ${list.owner.surname ?? ''}`.trim() : '—' }
                        </p>
                        <p className="mb-1">
                            <strong>{ __('ultimo_uso') }:</strong> { list.last_used }
                        </p>
                        <p className="mb-1">
                            <strong>{ __('miembros_num') }:</strong> { list.members_count }
                        </p>
                    </div>

                    {/* Avatar */}
                    <div className="col-3 text-end">
                        
                    </div>
                </div>
                <hr/>
            
                {/* Observaciones */}
                <div className="row my-4">
                    <div className="col-md-11">
                        <h5 className="mb-3">{ __('observaciones') }</h5>
                        <p className="mb-1">
                            { list.observations }
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
