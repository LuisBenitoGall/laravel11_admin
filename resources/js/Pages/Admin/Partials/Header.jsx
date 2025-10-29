import React, { useState, useEffect } from 'react';
import { Inertia } from '@inertiajs/inertia'; 
import { Link, router, usePage } from '@inertiajs/react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

//Components:
import NavLink from '@/Components/NavLink';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

//Hooks:
import { useSweetAlert } from '@/Hooks/useSweetAlert';
import { useTranslation } from '@/Hooks/useTranslation';

export default function Header({ user, title, subtitle, actions, companies, current_company }) {
    const __ = useTranslation();
    const props = usePage()?.props || {};
    const locale = props.locale || false;
    const languages = props.languages || [];
    
    //Las opciones del menú superior se configuran desde el archivo config/constants.php:
    const menuLocales = props.menuLocales;
    const menuChat = props.menuChat;
    const menuCustom = props.menuCustom;
    const menuNotifications = props.menuNotifications;
    
    const { showConfirm } = useSweetAlert();

    //Selección de empresa:
    const handleCompanyChange = (event) => {
        const companyId = event.target.value;
        router.post(route('companies.select'), {
            selectedCompany: companyId
        });
    };

    //Selección de idioma:
    const [isDropdownOpen, setDropdownOpen] = useState(false);
    const handleLanguageChange = (language) => {
        Inertia.get(route('language', language), { language: language });
        setDropdownOpen(false);
    };

    return (
        <header id="page-topbar">
            {/* Top menu */}
            <div className="layout-width" id="top-menu">
                <div className="navbar-header">
                    {/* Left column */}
                    <div className="d-flex">
                        <div className="navbar-brand-box horizontal-logo">
                            


                            {/* <Link href="/" className="logo logo-dark">
                                <span className="logo-sm">
                                    <img src="/images/logo-sm.png" alt="" height="22" />
                                </span>
                                <span className="logo-lg">
                                    <img src="/images/logo-dark.png" alt="" height="17" />
                                </span>
                            </Link>

                            <Link href="/" className="logo logo-light">
                                <span className="logo-sm">
                                    <img src="/images/logo-sm.png" alt="" height="22" />
                                </span>
                                <span className="logo-lg">
                                    <img src="/images/logo-light.png" alt="" height="17" />
                                </span>
                            </Link> */}
                            
                        </div>

                        {/* Open-Close Left Aside */}
                        <button type="button" className="btn btn-sm px-3 fs-16 header-item vertical-menu-btn topnav-hamburger" id="topnav-hamburger-icon">
                            <span className="hamburger-icon">
                                <span></span>
                                <span></span>
                                <span></span>
                            </span>
                        </button>

                        {/* Título sección */}
                        <div className="d-flex align-items-center">
                            <h1 className="mb-0">{title}</h1>
                            {subtitle !== '' && <h3 className="ms-4">{subtitle}</h3>}
                        </div>
                    </div>

                    {/* Right column */}
                    <div className="d-flex align-items-center">
                        {/* Control horario */}
                        {/* PENDIENTE TODA LA LÓGICA */}


                        {/* Condicional para mostrar el selector de idioma */}
                        {menuLocales && (
                            <div className="language-selector position-relative">
                                <button 
                                    className="btn rounded-pill btn-locale d-flex align-items-center mx-1" 
                                    onClick={() => setDropdownOpen(!isDropdownOpen)}
                                >
                                    <OverlayTrigger
                                        key="locale1"
                                        placement="left"
                                        overlay={
                                            <Tooltip className="ttp-top">
                                               { __('idiomas') }
                                            </Tooltip>
                                        }
                                    >
                                        <div className="d-flex align-items-center">
                                            <span className='me-2'>{locale}</span>
                                            <i className="la la-caret-down"></i> 
                                        </div>   
                                    </OverlayTrigger>
                                </button>

                                {isDropdownOpen && (
                                    <ul className="dropdown-menu show position-absolute">
                                        {Object.keys(languages).map((key) => {
                                            const langData = languages[key]; // Extrae los datos del idioma
                                            return (
                                                <li key={key}>
                                                    <button 
                                                        className={`dropdown-item ${locale === langData[0] ? 'active' : ''}`}
                                                        onClick={() => handleLanguageChange(langData[0])}
                                                    >
                                                        {langData[3]} {/* Nombre del idioma */}
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </div>
                        )}

                        {/* Condicional para mostrar el menú personalizado */}
                        {menuCustom && (
                            <div className="custom-menu position-relative">
                                <button 
                                    className="btn btn-top-header rounded-pill d-flex align-items-center mx-1" 
                                    onClick={() => setDropdownOpen(!isDropdownOpen)}
                                >
                                    <OverlayTrigger
                                        key="custom1"
                                        placement="left"
                                        overlay={
                                            <Tooltip className="ttp-top">
                                               { __('menu_preferencias') }
                                            </Tooltip>
                                        }
                                    >
                                        <div className="d-flex justify-content-center w-100">
                                            <i className="la la-cog"></i> 
                                        </div>   
                                    </OverlayTrigger>
                                </button>
                            </div>
                        )}

                        {/* Condicional para mostrar el chat */}
                        {menuChat && (
                            <div className="chat-warning position-relative">
                                <button 
                                    className="btn btn-top-header rounded-pill d-flex align-items-center mx-1" 
                                >
                                    <OverlayTrigger
                                        key="chat1"
                                        placement="left"
                                        overlay={
                                            <Tooltip className="ttp-top">
                                               { __('chat') }
                                            </Tooltip>
                                        }
                                    >
                                        <div className="d-flex justify-content-center w-100">
                                            <i className="la la-comment-alt"></i> 
                                        </div>   
                                    </OverlayTrigger>
                                </button>
                            </div>
                        )}

                        {/* Condicional para mostrar las notificaciones */}
                        {menuNotifications && (
                            <div className="notifications-warning position-relative">
                                <button 
                                    className="btn btn-top-header rounded-pill d-flex align-items-center mx-1" 
                                >
                                    <OverlayTrigger
                                        key="notification1"
                                        placement="left"
                                        overlay={
                                            <Tooltip className="ttp-top">
                                               { __('notificaciones') }
                                            </Tooltip>
                                        }
                                    >
                                        <div className="d-flex justify-content-center w-100">
                                            <i className="la la-bell"></i> 
                                        </div>   
                                    </OverlayTrigger>
                                </button>
                            </div>
                        )}

                        {/* Selector empresa */}
                        {companies.length === 1 ? (
                            <span className='mx-3'>{companies[0].name}</span>
                        ) : companies.length > 1 ? (
                            <select 
                                className="form-select input-rounded no-border mx-1" 
                                value={current_company ? current_company : ""} 
                                onChange={handleCompanyChange}
                            >
                                {current_company === false && (
                                    <option value="">
                                        {__('empresa_selec')}
                                    </option>
                                )}
                                {companies.map((company) => (
                                    <option key={company.id} value={company.id}>
                                        {company.name}
                                    </option>
                                ))}
                            </select>
                        ) : null}

                        {/* Perfil usuario */}
                        <div className="dropdown ms-sm-1 header-item topbar-user">
                            <button type="button" className="btn p-0" id="page-header-user-dropdown" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <span className="d-flex align-items-center">
                                    {/* Avatar */}
                                    {user.profile_photo_path ? (
                                        <img 
                                            className="rounded-circle header-profile-user" 
                                            src={`/storage/${user.profile_photo_path}`} 
                                            alt={`${user.name} ${user.surname}`} 
                                            onError={(e) => { e.target.onerror = null; e.target.src = '/images/users/avatar-1.jpg'; }} 
                                        />
                                    ) : (
                                        <div className="rounded-circle header-profile-user d-flex justify-content-center align-items-center" style={{ width: "30px", height: "30px", backgroundColor: "#fff" }}>
                                            <i className="la la-user-tie text-muted"></i>
                                        </div>
                                    )}
                                    
                                    {/* Usuario */}                             
                                    <span className="text-start ms-xl-1">
                                        <span className="d-none d-xl-inline-block ms-1 fs-13 fw-bold user-name-text">{user.name}</span>
                                        <span className="d-none d-xl-block ms-1 fs-12 text-muted user-name-sub-text">Founder</span>
                                    </span>
                                </span>
                            </button>
                            
                            <div className="dropdown-menu dropdown-menu-end">
                                <h6 className="dropdown-header">{ __('hola') } {user.name}!</h6>
                                {/* Acceso a perfil */}
                                <Link className="dropdown-item" href={route('profile.edit')}>
                                    <i className="mdi mdi-account-circle text-muted fs-16 align-middle me-1"></i> 
                                    <span className="align-middle">{ __('perfil') }</span>
                                </Link>
                                
                                {/* Logout */}
                                <button
                                    onClick={() => Inertia.post(route('logout'))}
                                    className="dropdown-item"
                                >
                                    <i className="mdi mdi-logout text-muted fs-16 align-middle me-1"></i>
                                    <span className="align-middle" data-key="t-logout">Logout</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="layout-width ps-2" id="top-actions">
                {actions.map((action, index) => {    
                    const text = action.text;
                    const icon = action.icon;
                    const url = action.url;
                    const modal = action.modal || false;
                    const method = action.method || null;
                    const onClick = action.onClick || null;

                    // Opción con modal:
                    if (modal) {
                        return (
                            <button
                                type="button"
                                key={index}
                                className="btn btn-primary btn-rdn ms-2"
                                onClick={onClick} 
                            >
                                {icon && <i className={`la ${icon}`}></i>} {text}
                            </button>
                        );
                    }

                    // Opción delete con confirmación:
                    if (method === 'delete') {
                        return (
                            <button
                                key={index}
                                className="btn btn-danger btn-rdn ms-2"
                                onClick={(e) => {
                                    e.preventDefault();
                                    showConfirm({
                                        title: action.title,
                                        text: action.message,
                                        icon: 'warning',
                                        onConfirm: () => {
                                            router.delete(route(url, action.params || []));
                                        }
                                    });
                                }}
                            >
                                {icon && <i className={`la ${icon}`}></i>} {text}
                            </button>
                        );
                    }

                    // Opción link:
                    return (
                        <Link
                            key={index}
                            href={url ? route(url, action.params || []) : '#'}
                            className="btn btn-primary btn-rdn ms-2"
                        >
                            {icon && <i className={`la ${icon}`}></i>} {text}
                        </Link>
                    );
                })}
            </div>

            {/* Filters */}
            <div className="layout-width" id="top-filters">
                {/* <TextInput
                    id="email"
                    type="email"
                    name="email"
                    value=""
                    className="mt-1 block w-full"
                    onChange=""
                    autoComplete="username"
                    isFocused={true}
                    
                /> */}
            </div>
        </header>
    );
}