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

export default function Sidebar() {
    const __ = useTranslation();
    const txt_areas_negocio = __('areas_negocio');
    const txt_bancos = __('bancos');
    const txt_categorias_por = __('categorias_por');
    const txt_centros_coste = __('centros_coste');
    const txt_centros_trabajo = __('centros_trabajo');
    const txt_clientes = __('clientes');
    const txt_cli_pro = __('clientes_proveedores');
    const txt_configuracion = __('configuracion');
    const txt_contables_grupos = __('contables_grupos');
    const txt_contactos = __('contactos');
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
    const txt_sectores = __('sectores');
    const txt_sectores_directorio = __('sectores_directorio');
    const txt_stock_movimientos = __('stock_movimientos');
    const txt_unidades = __('unidades');
    const txt_usuarios = __('usuarios');
    const txt_usuarios_listados = __('usuarios_listados');

    const [isOpen, setIsOpen] = useState(true);
    const [modules, setModules] = useState([]);

    const props = useSafePage();
    const { currentCompany, companyModules, companySettings } = useCompanySession();
    const { module: currentModule, slug: currentSlug } = props;

    // Leer auth desde usePage().props.auth y normalizar
    const page = usePage();
    const auth = page?.props?.auth || {};
    const permissions = Array.isArray(auth.permissions) ? auth.permissions : [];
    const isSuperAdmin = !!auth.is_super_admin;

    // Helper para verificar permisos por nombre de ruta
    const can = (routeName) => permissions.includes(routeName) || isSuperAdmin;

    //Permisos para módulos obligatorios:
    const myAccountItems = [
        { route: 'company-accounts.index',  activeSlug: 'company-accounts', label: txt_cuenta },
        { route: 'company-modules.index',   activeSlug: 'company-modules',  label: txt_modulos },
    ];
    const visibleMyAccountItems = myAccountItems.filter(i => can(i.route));
    const showMyAccountModule = visibleMyAccountItems.length > 0;

    const usersItems = [
        { route: 'users.index',             activeSlug: 'users',            label: txt_usuarios_listados },
        { route: 'users.contacts',          activeSlug: 'contacts',         label: txt_cli_pro },
        { route: 'users.categories',        activeSlug: 'categories',       label: txt_categorias_por },
    ];
    const visibleUsersItems = usersItems.filter(i => can(i.route));
    const showUsersModule = visibleUsersItems.length > 0;

    const companiesItems = [
        { route: 'companies.index',         activeSlug: 'companies',        label: txt_empresas_mis },
        { route: 'companies.sectors',       activeSlug: 'sectors',          label: txt_sectores_directorio },
        { route: 'cost-centers.index',      activeSlug: 'cost-centers',     label: txt_centros_coste },
        { route: 'workplaces.index',        activeSlug: 'workplaces',       label: txt_centros_trabajo },
        { route: 'company-settings.index',  activeSlug: 'company-settings', label: txt_configuracion },
        { route: 'customers.index',         activeSlug: 'customers',        label: txt_clientes },
        { route: 'providers.index',         activeSlug: 'providers',        label: txt_proveedores },
        { route: 'company-sectors.index',   activeSlug: 'company-sectors',  label: txt_sectores },
    ];
    const visibleCompaniesItems = companiesItems.filter(i => can(i.route));
    const showCompaniesModule = visibleCompaniesItems.length > 0;

    useEffect(() => {
        document.querySelectorAll('.menu-link[data-bs-toggle="collapse"]').forEach((el) => {
            new bootstrap.Collapse(el, { toggle: false });
        });

        if (!currentCompany) {
            setModules([]);
            return;
        }

        // Obtener módulos dinámicos desde el backend
        // El backend ya filtra por módulos activos de empresa y permisos del usuario
        axios.get('/secondary-menu')
            .then(({ data }) => {
                // Backend ya filtra por slug. No vuelvas a filtrar por id.
                setModules(Array.isArray(data) ? data : []);
            })
            .catch(error => {
                // Resiliencia ante error: si falla, establecer array vacío
                console.error('Error fetching secondary menu:', error);
                setModules([]);
            });
        // No uses solo .length; si cambian los slugs con igual longitud no se re-renderiza
    }, [JSON.stringify(companyModules), currentCompany?.id]);

    //Helper de renderizado de módulo obligatorio:
    const renderSubMenu = (items) => (
        <ul className="nav nav-sm flex-column">
            {items.map(item => (
                <li key={item.route} className="nav-item">
                    <NavLink
                        href={route(item.route)}
                        className={`nav-link menu-link ${currentSlug === item.activeSlug ? 'active text-white' : ''}`}
                    >
                        <span>{item.label}</span>
                    </NavLink>
                </li>
            ))}
        </ul>
    );

    return (
        <div className={`app-menu navbar-menu ${isOpen ? 'show' : 'hide'}`}>
            <div className="navbar-brand-box">
                <Link href={route('dashboard.index')} className="logo">
                    <span className="logo-sm">
                        <img src={'/img/logo/logo-rft-portrait.jpg'} alt="RFT" className="img-fluid p-3" />
                    </span>
                    <span className="logo-lg">
                        <img src={'/img/logo/logo-rft-landscape.png'} alt="RFT" className="img-fluid p-3" />
                    </span>
                </Link>
            </div>

            {/* 23/10/2025: Para el proyecto RFT se oculta esta sección. */}
            {/* <div className="company-logo text-center">
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
            </div> */}

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
                        {showMyAccountModule && (() => {
                          const isActive = currentModule === 'company-accounts';
                          return (
                                <li className={`nav-item ${isActive ? 'active text-white' : ''}`}>
                                    <Link href="#" className={`nav-link menu-link ${isActive ? 'active text-white' : ''}`}
                                    data-bs-toggle="collapse" data-bs-target="#menuMyAccount" role="button"
                                    aria-expanded={isActive} aria-controls="menuMyAccount">
                                        <i className="la la-user-circle"></i>
                                        <span>{txt_cuenta_mi}</span>
                                    </Link>
                                    <div className={`collapse menu-dropdown ${isActive ? 'show' : ''}`} id="menuMyAccount">
                                        {renderSubMenu(visibleMyAccountItems)}
                                    </div>
                                </li>
                            );
                        })()}

                        {/* Configuración - Solo visible para Super Admin */}
                        {isSuperAdmin && (() => {
                            const isActive = currentModule === 'settings';
                            
                            // Opcional: filtrar links internos por can() para granularidad incluso para Super Admin
                            const settingsItems = [
                                { route: 'accounts.index', activeSlug: 'accounts', label: txt_cuentas },
                                { route: 'modules.index', activeSlug: 'modules', label: txt_modulos },
                                { route: 'roles.index', activeSlug: 'roles', label: txt_roles },
                                { route: 'permissions.index', activeSlug: 'permissions', label: txt_permisos },
                                { route: 'currencies.index', activeSlug: 'currencies', label: txt_monedas },
                                { route: 'banks.index', activeSlug: 'banks', label: txt_bancos },
                                { route: 'countries.index', activeSlug: 'countries', label: txt_paises },
                                { route: 'contents.index', activeSlug: 'contents', label: txt_contenidos },
                                { route: 'stock-movements.index', activeSlug: 'stock-movements', label: txt_stock_movimientos },
                                { route: 'units.index', activeSlug: 'units', label: txt_unidades },
                                { route: 'iva-types.index', activeSlug: 'iva-types', label: txt_iva_tipos },
                                { route: 'accounting-account-types.index', activeSlug: 'accounting-account-types', label: txt_contables_grupos },
                            ];
                            const visibleSettingsItems = settingsItems.filter(i => can(i.route));
                            
                            return (
                                <li className={`nav-item ${isActive ? 'active text-white' : ''}`}>
                                    <Link href="#" className={`nav-link menu-link ${isActive ? 'active text-white' : ''}`} data-bs-toggle="collapse" data-bs-target="#menuSettings" role="button" aria-expanded={isActive} aria-controls="menuSettings">
                                        <i className="la la-cog"></i>
                                        <span>{txt_configuracion}</span>
                                    </Link>
                                    {visibleSettingsItems.length > 0 && (
                                        <div className={`collapse menu-dropdown ${isActive ? 'show' : ''}`} id="menuSettings">
                                            {renderSubMenu(visibleSettingsItems)}
                                        </div>
                                    )}
                                </li>
                            );
                        })()}

                        {/* Usuarios */}
                        {showUsersModule && (() => {
                          const isActive = currentModule === 'users';
                          return (
                                <li className={`nav-item ${isActive ? 'active text-white' : ''}`}>
                                    <Link href="#" className={`nav-link menu-link ${isActive ? 'active text-white' : ''}`}
                                    data-bs-toggle="collapse" data-bs-target="#menuUsers" role="button"
                                    aria-expanded={isActive} aria-controls="menuUsers">
                                        <i className="la la-users"></i>
                                        <span>{txt_usuarios}</span>
                                    </Link>
                                    <div className={`collapse menu-dropdown ${isActive ? 'show' : ''}`} id="menuUsers">
                                        {renderSubMenu(visibleUsersItems)}
                                    </div>
                                </li>
                            );
                        })()}

                        {/* Empresas */}
                        {showCompaniesModule && (() => {
                            const isActive = currentModule === 'companies';
                            return (
                                <li className={`nav-item ${isActive ? 'active text-white' : ''}`}>
                                    <Link href="#" className={`nav-link menu-link ${isActive ? 'active text-white' : ''}`}
                                    data-bs-toggle="collapse" data-bs-target="#menuCompanies" role="button"
                                    aria-expanded={isActive} aria-controls="menuCompanies">
                                        <i className="la la-building"></i>
                                        <span>{txt_empresas}</span>
                                    </Link>
                                    <div className={`collapse menu-dropdown ${isActive ? 'show' : ''}`} id="menuCompanies">
                                        {renderSubMenu(visibleCompaniesItems)}
                                    </div>
                                </li>
                            );
                        })()}

                        {/* Módulos dinámicos */}
                        {Array.isArray(modules) && modules.length > 0 ? (
                            modules
                                .map(module => {
                                    const functionalities = Array.isArray(module.functionalities)
                                        ? module.functionalities
                                            .filter(f => Number(f.status) === 1)
                                            .slice() // evitar mutar el array original antes de sort
                                            .sort((a, b) => {
                                                const sa = Number(a.sort ?? 0);
                                                const sb = Number(b.sort ?? 0);
                                                return sa - sb;
                                            })
                                        : [];

                                    return { ...module, functionalities };
                                })
                                .filter(module => module.functionalities.length > 0)
                                .map(module => {
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
