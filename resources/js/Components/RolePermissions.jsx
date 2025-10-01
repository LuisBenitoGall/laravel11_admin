import { useState, useEffect, useRef } from 'react';
import { router } from '@inertiajs/react';
import axios from 'axios';

// Hooks
import { useTranslation } from '@/Hooks/useTranslation';

export default function RolePermissions({
    modules = [],
    functionalities = [],
    role_permissions = [],
    permissions_all = [],
    roleId
}) {
    const __ = useTranslation();
    const [expanded, setExpanded] = useState({});
    const [expandAll, setExpandAll] = useState(false);
    const [localPermissions, setLocalPermissions] = useState(role_permissions || []);

    const toggleExpandAll = () => setExpandAll(prev => !prev);

    // Agrupar funcionalidades por módulo
    const functionalitiesByModule = modules.reduce((acc, module) => {
        acc[module.id] = functionalities.filter(f => f.module_id === module.id);
        return acc;
    }, {});

    // Agrupar permisos por funcionalidad (basado en slug)
    const permissionsByFunctionality = {};

    functionalities.forEach(func => {
        const normalizedSlug = func.slug.toLowerCase().replace(/_/g, '-');

        const matchingPerms = permissions_all.filter(p => {
            const [slug] = p.name.split('.');
            return slug === normalizedSlug;
        });

        permissionsByFunctionality[func.id] = matchingPerms;
    });

    //Activar / desactivar permiso:
    const handlePermissionToggle = (permId, isChecked) => {
        // Actualiza UI de inmediato
        setLocalPermissions(prev => {
            if (isChecked) {
                return [...prev, permId];
            } else {
                return prev.filter(id => id !== permId);
            }
        });

        // Guarda en backend
        router.post(route('roles.set-permission', roleId), {
            permission_id: permId,
            assigned: isChecked,
        }, {
            preserveScroll: true,
            preserveState: true,
            only: [],
        });
    };

    // Seleccionar/deseleccionar todos los permisos de una funcionalidad:
    const toggleAllPermissionsForFunctionality = async (funcId) => {
        const permissions = permissionsByFunctionality[funcId] || [];
        const permissionIds = permissions.map(p => p.id);
        const allSelected = permissionIds.every(id => localPermissions.includes(id));
        const newState = allSelected ? 'deselect' : 'select';

        const updated = new Set(localPermissions);

        if (newState === 'select') {
            permissionIds.forEach(id => updated.add(id));
        } else {
            permissionIds.forEach(id => updated.delete(id));
        }

        setLocalPermissions([...updated]);

        await axios.post(route('roles.set-multiple-permissions', roleId), {
            permissions: permissionIds,
            assigned: newState === 'select',
        });
    };

    const selectAllRefs = useRef({});

    useEffect(() => {
        functionalities.forEach(func => {
            const perms = permissionsByFunctionality[func.id] || [];
            const allSelected = perms.every(p => localPermissions.includes(p.id));
            const someSelected = perms.some(p => localPermissions.includes(p.id));

            const ref = selectAllRefs.current[func.id];
            if (ref) {
                ref.indeterminate = !allSelected && someSelected;
            }
        });
    }, [localPermissions]);

    return (
        <div className="mt-4">
            <div className="row align-items-center mb-3">
                {/* Anchors */}
                <div className="col-md-9 col-12 mb-2 mb-md-0">
                    <div className="d-flex flex-wrap">
                        {modules.map(module => (
                            <a
                                key={module.id}
                                href={`#module-${module.id}`}
                                className="badge rounded-pill bg-info text-white me-2 mb-2"
                            >
                                {module.label}
                            </a>
                        ))}
                    </div>
                </div>

                {/* Toggle */}
                <div className="col-md-3 col-12 text-md-end text-start">
                    <div className="d-inline-flex align-items-center">
                        <label className="form-label me-2 mb-0">{__('permisos_desplegar_todos')}</label>
                        <div className="form-check form-switch">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                id="toggleExpandAll"
                                checked={expandAll}
                                onChange={toggleExpandAll}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Módulos */}
            {modules.map(module => (
                <div key={module.id} id={`module-${module.id}`} className="mb-5">
                    {/* Título del módulo */}
                    <div
                        className="text-white px-3 py-2 mb-3"
                        style={{
                            backgroundColor: module.color || '#6f42c1',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            textTransform: 'uppercase',
                        }}
                    >
                        { __(module.label) }
                    </div>

                    {/* Funcionalidades en columnas */}
                    <div className="row">
                        {functionalitiesByModule[module.id]?.map(func => (
                            <div key={func.id} className="col-md-4 mb-4">
                                {/* Cabecera funcionalidad */}
                                <div className="card border">
                                    <div
                                        className="card-header d-flex justify-content-between align-items-center"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() =>
                                            setExpanded(prev => ({ ...prev, [func.id]: !prev[func.id] }))
                                        }
                                    >
                                        { __(func.label) }

                                        <i
                                            className={`la la-angle-down transition-arrow ${
                                                expandAll || expanded[func.id] ? 'rotate-180' : ''
                                            }`}
                                            style={{ transition: 'transform 0.2s ease-in-out' }}
                                        />
                                    </div>

                                    {/* Lista de permisos */}
                                    {(expandAll || expanded[func.id]) && (
                                        <ul className="list-group list-group-flush">
                                            {permissionsByFunctionality[func.id]?.map(perm => (
                                                <li key={perm.id} className="list-group-item d-flex align-items-center">
                                                    <input
                                                        type="checkbox"
                                                        className="form-check-input me-2"
                                                        checked={localPermissions.includes(perm.id)}
                                                        onChange={(e) => handlePermissionToggle(perm.id, e.target.checked)}
                                                    />
                                                    {perm.name}
                                                </li>
                                            ))}

                                            <li className="list-group-item perm-select-all text-muted small d-flex align-items-center" onClick={() => toggleAllPermissionsForFunctionality(func.id)}>
                                                <input
                                                    ref={(el) => selectAllRefs.current[func.id] = el}
                                                    type="checkbox"
                                                    className="form-check-input me-2"
                                                    checked={permissionsByFunctionality[func.id]?.every(p => localPermissions.includes(p.id))}
                                                    readOnly
                                                />
                                                {__('permisos_selec_todos')}
                                            </li>
                                        </ul>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
