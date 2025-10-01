import AdminAuthenticatedLayout from '@/Layouts/Admin/AdminAuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { OverlayTrigger, Table, Tooltip } from 'react-bootstrap';
import axios from 'axios';

//Hooks:
import { useSweetAlert } from '@/Hooks/useSweetAlert';
import { useTranslation } from '@/Hooks/useTranslation';

export default function Index({ auth, session, title, subtitle, modules, company_modules, queryParams = {}, availableLocales }) {
	const __ = useTranslation();
    const props = usePage()?.props || {};
    const locale = props.locale || false;
    const languages = props.languages || [];
    const { showConfirm } = useSweetAlert();
    const permissions = props.permissions || {};

    const [infoModalVisible, setInfoModalVisible] = useState(false);
    const [selectedModuleInfo, setSelectedModuleInfo] = useState(null);

    //Activar - desactivar módulos:
    const handleToggleModule = (module) => {
        const isLinked = company_modules.includes(module.id);
        const action = isLinked ? __('desactivar') : __('activar');
    
        showConfirm({
            title: action,
            text: `${__('confirma_deseas')} ${action.toLowerCase()} ${module.label}`,
            icon: 'warning',
            onConfirm: async () => {
                try {
                    await axios.post(route('company-modules.toggle', module.id));
                    await axios.get(route('companies.refresh-session')); // 🔁 recargar la sesión
                    window.location.reload();   // 🔃 recargar todo y actualizar el sidebar
                } catch (error) {
                    console.error('Error al cambiar el estado del módulo', error);
                }
            }
        });
    };

    //Modal info:
    const showModuleInfo = (module) => {
        console.log('Módulo seleccionado:', module);
        setSelectedModuleInfo(module);
        setInfoModalVisible(true);
    };

    //Acciones:
    const actions = [];

    return (
        <AdminAuthenticatedLayout
            user={auth.user}
            title={title}
            subtitle={subtitle}
            actions={actions}
        >
            <Head title={title} />

            <div className="contents pb-5">
                <div className="row">
                    <div className="col-12 pt-3">
                        <p>{ __('modulos_selecciona_para_empresa') }</p>
                    </div>
                </div>

                <div className="row g-3 mt-2" id="company-modules">
                    {modules.map((module) => (
                        <div key={module.id} className="col-12 col-sm-6 col-md-4 col-lg-2">
                            <div className={`card position-relative shadow-sm h-100 ${company_modules.includes(module.id) ? 'active' : ''}`} style={{ backgroundColor: module.color }}>
                                <div className="card-module card-body d-flex flex-column justify-content-between">
                                    <div className="text-center">
                                        <i className={`main-icon la la-${module.icon} mb-2`}></i>
                                        <h5 className="card-title text-capitalize">{module.label}</h5>
                                    </div>

                                    <div className="d-flex justify-content-between align-items-end mt-2">
                                        {/* Info */}
                                        <button 
                                            onClick={() => showModuleInfo(module)}
                                            className="btn btn-sm btn-light p-1 border rounded-circle"
                                            title={__('informacion')}
                                        >
                                            <i className="la la-info"></i>
                                        </button>

                                        {/* Activar -desactivar */}
                                        <OverlayTrigger
                                            key={"status-"+module.id}
                                            placement="top"
                                            overlay={<Tooltip className="ttp-top">{ company_modules.includes(module.id) ? __('desactivar') : __('activar') }</Tooltip>}
                                        >
                                            {company_modules.includes(module.id) ? (
                                                <button
                                                    onClick={() => handleToggleModule(module)}
                                                    className="btn btn-sm btn-danger rounded-circle"
                                                    title="{__('desactivar')}"
                                                >
                                                    <i className="la la-ban"></i>
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleToggleModule(module)}
                                                    className="btn btn-sm btn-success rounded-circle"
                                                >
                                                    <i className="la la-check"></i>
                                                </button>
                                            )}
                                        </OverlayTrigger>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        
            {/* Modal: */}
            {infoModalVisible && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">{selectedModuleInfo?.label}</h5>
                                <button type="button" className="btn-close" onClick={() => setInfoModalVisible(false)}></button>
                            </div>
                            <div className="modal-body text-center">
                                <p className="mb-0">
                                    {(typeof selectedModuleInfo?.explanation === 'string' && selectedModuleInfo.explanation.trim()) || __('modulo_sin_info')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminAuthenticatedLayout>
    );
}