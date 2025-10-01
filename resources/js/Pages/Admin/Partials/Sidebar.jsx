import React, { useEffect, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import axios from 'axios';
import bootstrap from "bootstrap/dist/js/bootstrap.bundle.min.js";

//Components:
import NavLink from '@/Components/NavLink';

//Hooks:
import { useCompanySession } from '@/Hooks/useCompanySession';
import { useSafePage } from '@/Hooks/useSafePage.js';
import { useTranslation } from '@/Hooks/useTranslation';

export default function Sidebar(auth) {
    const __ = useTranslation();
    const txt_areas_negocio = __('areas_negocio');
    const txt_bancos = __('bancos');
    const txt_centros_coste = __('centros_coste');
    const txt_centros_trabajo = __('centros_trabajo');
    const txt_clientes = __('clientes');
    const txt_configuracion = __('configuracion');
    const txt_contables_grupos = __('contables_grupos');
    const txt_contenidos = __('contenidos');
    const txt_cuenta = __('cuenta');
    const txt_cuenta_mi = __('cuenta_mi');
    const txt_cuentas = __('cuentas');
    const txt_empresas = __('empresas');
    const txt_empresas_mis = __('empresas_mis');
    const txt_iva_tipos = __('iva_tipos');
    const txt_modulos = __('modulos');
    const txt_monedas = __('monedas');
    const txt_paises = __('paises');
    const txt_permisos = __('permisos');
    const txt_proveedores = __('proveedores');
    const txt_roles = __('roles');
    const txt_stock_movimientos = __('stock_movimientos');
    const txt_unidades = __('unidades');
    const txt_usuarios = __('usuarios');
    const txt_usuarios_listados = __('usuarios_listados');

    const [isOpen, setIsOpen] = useState(true);
    const [modules, setModules] = useState([]);

    const props = useSafePage();
    const { currentCompany, companyModules, companySettings } = useCompanySession();
    const { module: currentModule, slug: currentSlug } = props;

    useEffect(() => {
        document.querySelectorAll('.menu-link[data-bs-toggle="collapse"]').forEach((el) => {
            new bootstrap.Collapse(el, { toggle: false });
        });

        if (!Array.isArray(companyModules) || companyModules.length === 0 || !currentCompany) {
            setModules([]);
            return;
        }

        axios.get('/secondary-menu')
            .then(response => {
                const filteredModules = response.data.filter(module => companyModules.includes(module.id));
                setModules(filteredModules);
            })
            .catch(error => console.error('Error fetching secondary menu:', error));
    }, [companyModules.length, currentCompany]);

    return (
        <div className={`app-menu navbar-menu ${isOpen ? 'show' : 'hide'}`}>
            <div className="navbar-brand-box">
                <Link href={route('dashboard.index')} className="logo">
                    <span className="logo-sm">
                        <img src={'/img/logo-amdt.png'} alt="Radnify" className="img-fluid p-3" />
                    </span>
                    <span className="logo-lg">
                        <img src={'/img/logo-amdt.png'} alt="Radnify" className="img-fluid p-3" />
                    </span>
                </Link>
            </div>

            <div className="company-logo text-center">
                {companySettings?.company?.logo && (() => {
                    const raw = companySettings.company.logo;
                    let logoSrc = '';
                    if (typeof raw === 'string') {
                        const r = raw.trim();
                        if (r === '') {
                            logoSrc = '';
                        } else if (r.startsWith('http') || r.startsWith('//')) {
                            // Absolute URL
                            logoSrc = r;
                        } else if (r.startsWith('/')) {
                            // Already an absolute path
                            logoSrc = r;
                        } else if (r.includes('storage/')) {
                            // Already contains storage path (e.g. "storage/companies/...")
                            logoSrc = '/' + r.replace(/^\/+/, '');
                        } else if (r.includes('companies/')) {
                            // Already includes companies/... but missing storage/ prefix
                            logoSrc = '/storage/' + r.replace(/^\/+/, '');
                        } else {
                            // Plain filename, use default storage/companies/ prefix
                            logoSrc = `/storage/companies/${r.replace(/^\/+/, '')}`;
                        }
                    }

                    return logoSrc ? <img src={logoSrc} alt={companySettings.company?.name || ''} className="img-fluid" /> : null;
                })()}
            </div>

            <div id="scrollbar">
                <div id="sidebar-menu">
                    <ul className="navbar-nav mt-3" id="navbar-nav">
                        {/* Dashboard */}
                        {(() => {
                            const isActive = currentModule === 'dashboard';
                            return (
                                <li className={`nav-item ${isActive ? 'active text-white' : ''}`}>
                                    <Link href={route('dashboard.index')} className={`nav-link menu-link ${isActive ? 'active text-white' : ''}`} active={route().current("dashboard.index").toString()}>
                                        <i className="la la-home"></i>
                                        <span>Dashboard</span>
                                    </Link>
                                </li>
                            );
                        })()}

                        {/* Mi cuenta */}
                        {(() => {
                            const isActive = currentModule === 'company-accounts';
                            return (
                                <li className={`nav-item ${isActive ? 'active text-white' : ''}`}>
                                    <Link href="#" className={`nav-link menu-link ${isActive ? 'active text-white' : ''}`} data-bs-toggle="collapse" data-bs-target="#menuMyAccount" role="button" aria-expanded={isActive} aria-controls="menuMyAccount">
                                        <i className="la la-user-circle"></i>
                                        <span>{txt_cuenta_mi}</span>
                                    </Link>
                                    <div className={`collapse menu-dropdown ${isActive ? 'show' : ''}`} id="menuMyAccount">
                                        <ul className="nav nav-sm flex-column">
                                            <li>
                                                <NavLink href={route('company-accounts.index')} className={`nav-link menu-link ${currentSlug === 'company-accounts' ? 'active text-white' : ''}`}>
                                                    <span>{txt_cuenta}</span>
                                                </NavLink>
                                            </li>
                                            <li>
                                                <NavLink href={route('company-modules.index')} className={`nav-link menu-link ${currentSlug === 'company-modules' ? 'active text-white' : ''}`}>
                                                    <span>{txt_modulos}</span>
                                                </NavLink>
                                            </li>
                                        </ul>
                                    </div>
                                </li>
                            );
                        })()}

                        {/* Configuración */}
                        {(() => {
                            const isActive = currentModule === 'settings';
                            return (
                                <li className={`nav-item ${isActive ? 'active text-white' : ''}`}>
                                    <Link href="#" className={`nav-link menu-link ${isActive ? 'active text-white' : ''}`} data-bs-toggle="collapse" data-bs-target="#menuSettings" role="button" aria-expanded={isActive} aria-controls="menuSettings">
                                        <i className="la la-cog"></i>
                                        <span>{txt_configuracion}</span>
                                    </Link>
                                    <div className={`collapse menu-dropdown ${isActive ? 'show' : ''}`} id="menuSettings">
                                        <ul className="nav nav-sm flex-column">
                                            <li>
                                                <NavLink href={route('accounts.index')} className={`nav-link menu-link ${currentSlug === 'accounts' ? 'active text-white' : ''}`}>
                                                    <span>{txt_cuentas}</span>
                                                </NavLink>
                                            </li>
                                            <li>
                                                <NavLink href={route('modules.index')} className={`nav-link menu-link ${currentSlug === 'modules' ? 'active text-white' : ''}`}>
                                                    <span>{txt_modulos}</span>
                                                </NavLink>
                                            </li>
                                            <li>
                                                <NavLink href={route('roles.index')} className={`nav-link menu-link ${currentSlug === 'roles' ? 'active text-white' : ''}`}>
                                                    <span>{txt_roles}</span>
                                                </NavLink>
                                            </li>
                                            <li>
                                                <NavLink href={route('permissions.index')} className={`nav-link menu-link ${currentSlug === 'permissions' ? 'active text-white' : ''}`}>
                                                    <span>{txt_permisos}</span>
                                                </NavLink>
                                            </li>
                                            <li>
                                                <NavLink href={route('currencies.index')} className={`nav-link menu-link ${currentSlug === 'currencies' ? 'active text-white' : ''}`}>
                                                    <span>{txt_monedas}</span>
                                                </NavLink>
                                            </li>
                                            <li>
                                                <NavLink href={route('banks.index')} className={`nav-link menu-link ${currentSlug === 'banks' ? 'active text-white' : ''}`}>
                                                    <span>{txt_bancos}</span>
                                                </NavLink>
                                            </li>
                                            <li>
                                                <NavLink href={route('countries.index')} className={`nav-link menu-link ${currentSlug === 'countries' ? 'active text-white' : ''}`}>
                                                    <span>{txt_paises}</span>
                                                </NavLink>
                                            </li>
                                            <li>
                                                <NavLink href={route('contents.index')} className={`nav-link menu-link ${currentSlug === 'contents' ? 'active text-white' : ''}`}>
                                                    <span>{txt_contenidos}</span>
                                                </NavLink>
                                            </li>
                                            <li>
                                                <NavLink href={route('stock-movements.index')} className={`nav-link menu-link ${currentSlug === 'stock-movements' ? 'active text-white' : ''}`}>
                                                    <span>{txt_stock_movimientos}</span>
                                                </NavLink>
                                            </li>
                                            <li>
                                                <NavLink href={route('units.index')} className={`nav-link menu-link ${currentSlug === 'units' ? 'active text-white' : ''}`}>
                                                    <span>{txt_unidades}</span>
                                                </NavLink>
                                            </li>
                                            <li>
                                                <NavLink href={route('iva-types.index')} className={`nav-link menu-link ${currentSlug === 'iva-types' ? 'active text-white' : ''}`}>
                                                    <span>{txt_iva_tipos}</span>
                                                </NavLink>
                                            </li>
                                            <li>
                                                <NavLink href={route('accounting-account-types.index')} className={`nav-link menu-link ${currentSlug === 'accounting-account-types' ? 'active text-white' : ''}`}>
                                                    <span>{txt_contables_grupos}</span>
                                                </NavLink>
                                            </li>
                                        </ul>
                                    </div>
                                </li>
                            );
                        })()}

                        {/* Usuarios */}
                        {(() => {
                            const isActive = currentModule === 'users';
                            return (
                                <li className={`nav-item ${isActive ? 'active text-white' : ''}`}>
                                    <Link href="#" className={`nav-link menu-link ${isActive ? 'active text-white' : ''}`} data-bs-toggle="collapse" data-bs-target="#menuUsers" role="button" aria-expanded={isActive} aria-controls="menuUsers">
                                        <i className="la la-users"></i>
                                        <span>{txt_usuarios}</span>
                                    </Link>
                                    <div className={`collapse menu-dropdown ${isActive ? 'show' : ''}`} id="menuUsers">
                                        <ul className="nav nav-sm flex-column">
                                            <li>
                                                <NavLink href={route('users.index')} className={`nav-link menu-link ${currentSlug === 'users' ? 'active text-white' : ''}`}>
                                                    <span>{txt_usuarios_listados}</span>
                                                </NavLink>
                                            </li>
                                        </ul>
                                    </div>
                                </li>
                            );
                        })()}

                        {/* Empresas */}
                        {(() => {
                            const isActive = currentModule === 'companies';
                            return (
                                <li className={`nav-item ${isActive ? 'active text-white' : ''}`}>
                                    <Link href="#" className={`nav-link menu-link ${isActive ? 'active text-white' : ''}`} data-bs-toggle="collapse" data-bs-target="#menuCompanies" role="button" aria-expanded={isActive} aria-controls="menuCompanies">
                                        <i className="la la-building"></i>
                                        <span>{txt_empresas}</span>
                                    </Link>
                                    <div className={`collapse menu-dropdown ${isActive ? 'show' : ''}`} id="menuCompanies">
                                        <ul className="nav nav-sm flex-column">
                                            <li>
                                                <NavLink href={route('companies.index')} className={`nav-link menu-link ${currentSlug === 'companies' ? 'active text-white' : ''}`}>
                                                    <span>{txt_empresas_mis}</span>
                                                </NavLink>
                                            </li>
                                            <li>
                                                <NavLink href={route('business-areas.index')} className={`nav-link menu-link ${currentSlug === 'business-areas' ? 'active text-white' : ''}`}>
                                                    <span>{txt_areas_negocio}</span>
                                                </NavLink>
                                            </li>
                                            <li>
                                                <NavLink href={route('cost-centers.index')} className={`nav-link menu-link ${currentSlug === 'cost-centers' ? 'active text-white' : ''}`}>
                                                    <span>{txt_centros_coste}</span>
                                                </NavLink>
                                            </li>
                                            <li>
                                                <NavLink href={route('workplaces.index')} className={`nav-link menu-link ${currentSlug === 'workplaces' ? 'active text-white' : ''}`}>
                                                    <span>{txt_centros_trabajo}</span>
                                                </NavLink>
                                            </li>
                                            <li>
                                                <NavLink href={route('company-settings.index')} className={`nav-link menu-link ${currentSlug === 'company-settings' ? 'active text-white' : ''}`}>
                                                    <span>{txt_configuracion}</span>
                                                </NavLink>
                                            </li>
                                            <li>
                                                <NavLink href={route('customers.index')} className={`nav-link menu-link ${currentSlug === 'customers' ? 'active text-white' : ''}`}>
                                                    <span>{txt_clientes}</span>
                                                </NavLink>
                                            </li>
                                            <li>
                                                <NavLink href={route('providers.index')} className={`nav-link menu-link ${currentSlug === 'providers' ? 'active text-white' : ''}`}>
                                                    <span>{txt_proveedores}</span>
                                                </NavLink>
                                            </li>
                                        </ul>
                                    </div>
                                </li>
                            );
                        })()}

                        {/* Módulos dinámicos */}
                        {Array.isArray(modules) && modules.length > 0 ? (
                            modules.map(module => {
                                const menuId = `menu${module.slug.charAt(0).toUpperCase() + module.slug.slice(1)}`;
                                const isModuleActive = currentModule === module.slug;

                                return (
                                    <li key={module.id} className={`nav-item ${isModuleActive ? 'active text-white' : ''}`}>
                                        <Link
                                            href="#"
                                            className={`nav-link menu-link ${isModuleActive ? 'active text-white' : ''}`}
                                            data-bs-toggle="collapse"
                                            data-bs-target={`#${menuId}`}
                                            role="button"
                                            aria-expanded={isModuleActive}
                                            aria-controls={menuId}
                                        >
                                            <i className={`la la-${module.icon}`}></i>
                                            <span>{module.label}</span>
                                        </Link>

                                        {Array.isArray(module.functionalities) && module.functionalities.length > 0 && (
                                            <div className={`collapse menu-dropdown ${isModuleActive ? 'show' : ''}`} id={menuId}>
                                                <ul className="nav nav-sm flex-column">
                                                    {module.functionalities.map(subModule => {
                                                        const isActiveSub = currentSlug === subModule.slug;
                                                        return (
                                                            <li key={subModule.id} className="nav-item">
                                                                <NavLink
                                                                    href={route(`${subModule.slug}.index`).toString()}
                                                                    className={`nav-link ${isActiveSub ? 'active text-white' : ''}`}
                                                                >
                                                                    <span>{subModule.label}</span>
                                                                </NavLink>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            </div>
                                        )}
                                    </li>
                                );
                            })
                        ) : (
                            <li className='nav-item'>
                                <span className="text-white"></span>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
}
