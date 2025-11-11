import React, { useState, useEffect, useRef } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { Link, router, usePage } from '@inertiajs/react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

// Hooks:
import { useSweetAlert } from '@/Hooks/useSweetAlert';
import { useTranslation } from '@/Hooks/useTranslation';

export default function Header({ user, title, subtitle, actions, companies, current_company }) {
    const __ = useTranslation();
    const props = usePage()?.props || {};
    const locale = props.locale || false;
    const languages = props.languages || [];
console.log(user);
    // Config top menu
    const menuLocales = props.menuLocales;
    const menuChat = props.menuChat;
    const menuCustom = props.menuCustom;
    const menuNotifications = props.menuNotifications;

    // States
    const [isLangOpen, setLangOpen] = useState(false);
    const [isFavOpen, setFavOpen] = useState(false);
    const [favName, setFavName] = useState('');

    // Refs para click-outside
    const langRef = useRef(null);
    const favRef = useRef(null);
    const favInputRef = useRef(null);

    const { showConfirm } = useSweetAlert();

    // Cerrar uno al abrir el otro
    useEffect(() => { if (isLangOpen) setFavOpen(false); }, [isLangOpen]);
    useEffect(() => { if (isFavOpen) setLangOpen(false); }, [isFavOpen]);

    // Click fuera y Escape
    useEffect(() => {
        const onDocClick = (e) => {
        if (!langRef.current?.contains(e.target) && !favRef.current?.contains(e.target)) {
            setLangOpen(false);
            setFavOpen(false);
        }
        };
        const onEsc = (e) => {
        if (e.key === 'Escape') {
            setLangOpen(false);
            setFavOpen(false);
        }
        };
        document.addEventListener('click', onDocClick);
        document.addEventListener('keydown', onEsc);
        return () => {
        document.removeEventListener('click', onDocClick);
        document.removeEventListener('keydown', onEsc);
        };
    }, []);

    // Al abrir el dropdown de perfil (Bootstrap), cierra los otros
    useEffect(() => {
        const dd = document.getElementById('page-header-user-dropdown');
        if (!dd) return;
        const onShow = () => { setLangOpen(false); setFavOpen(false); };
        dd.addEventListener('show.bs.dropdown', onShow);
        return () => dd.removeEventListener('show.bs.dropdown', onShow);
    }, []);

    // Idioma
    const handleLanguageChange = (language) => {
        Inertia.get(route('language', language), { language });
        setLangOpen(false);
    };

    // Empresa
    const handleCompanyChange = (event) => {
        const companyId = event.target.value;
        router.post(route('companies.select'), { selectedCompany: companyId });
    };

    // Favoritos: guardar
    const saveFavorite = () => {
        const name = favName.trim();
        if (!name) return;

        const currentUrl = window.location.href;
        const module = props?.module ?? '';

        router.post(route('user-preferences.store'),
        { name, url: currentUrl, module },
        {
            preserveScroll: true,
            onSuccess: () => {
            setFavName('');
            setFavOpen(false);
            if (route().current('dashboard.index')) {
                router.reload({ only: ['favorites'] });
            }
            },
        }
        );
    };

    const onFavKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveFavorite();
        }
    };

    // Si prefieres no guardar en blur, comenta esta función
    const onFavBlur = () => {
        if (favName.trim()) saveFavorite();
    };

    return (
        <header id="page-topbar">
            {/* Top menu */}
            <div className="layout-width" id="top-menu">
                <div className="navbar-header">
                {/* Left column */}
                <div className="d-flex">
                    <div className="navbar-brand-box horizontal-logo" />
                    {/* Open-Close Left Aside */}
                    <button
                    type="button"
                    className="btn btn-sm px-3 fs-16 header-item vertical-menu-btn topnav-hamburger"
                    id="topnav-hamburger-icon"
                    >
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
                    {/* Selector de idiomas */}
                    {menuLocales && (
                    <div ref={langRef} className="language-selector position-relative">
                        <button
                        className="btn rounded-pill btn-locale d-flex align-items-center mx-1"
                        onClick={(e) => { e.stopPropagation(); setLangOpen((v) => !v); }}
                        >
                        <OverlayTrigger placement="left" overlay={<Tooltip className="ttp-top">{__('idiomas')}</Tooltip>}>
                            <div className="d-flex align-items-center">
                            <span className="me-2">{locale}</span>
                            <i className="la la-caret-down"></i>
                            </div>
                        </OverlayTrigger>
                        </button>

                        {isLangOpen && (
                        <ul className="dropdown-menu dropdown-menu-end show position-absolute mt-2 shadow" style={{ minWidth: 220 }}>
                            {Object.keys(languages).map((key) => {
                            const langData = languages[key];
                            return (
                                <li key={key}>
                                <button
                                    className={`dropdown-item ${locale === langData[0] ? 'active' : ''}`}
                                    onClick={() => handleLanguageChange(langData[0])}
                                >
                                    {langData[3]}
                                </button>
                                </li>
                            );
                            })}
                        </ul>
                        )}
                    </div>
                    )}

                    {/* Menú personalizado (favoritos) */}
                    {menuCustom && (
                    <div ref={favRef} className="custom-menu position-relative">
                        <button
                        className="btn btn-top-header rounded-pill d-flex align-items-center mx-1"
                        onClick={(e) => {
                            e.stopPropagation();
                            setFavOpen((v) => !v);
                            setTimeout(() => favInputRef.current?.focus(), 0);
                        }}
                        >
                        <OverlayTrigger placement="left" overlay={<Tooltip className="ttp-top">{__('menu_preferencias')}</Tooltip>}>
                            <div className="d-flex justify-content-center w-100">
                            <i className="la la-cog"></i>
                            </div>
                        </OverlayTrigger>
                        </button>

                        {isFavOpen && (
                        <div className="dropdown-menu dropdown-menu-end show position-absolute p-3 mt-2 shadow" style={{ minWidth: 320 }}>
                            <h6 className="dropdown-header ps-0">{__('menu_preferencias')}</h6>
                            <input
                            ref={favInputRef}
                            type="text"
                            className="form-control"
                            value={favName}
                            onChange={(e) => setFavName(e.target.value)}
                            onKeyDown={onFavKeyDown}
                            onBlur={onFavBlur}
                            placeholder={__('pantalla_guarda')}
                            />
                            <small className="text-warning">{__('pantalla_guarda_texto')}</small>
                        </div>
                        )}
                    </div>
                    )}

                    {/* Chat */}
                    {menuChat && (
                    <div className="chat-warning position-relative">
                        <button className="btn btn-top-header rounded-pill d-flex align-items-center mx-1">
                        <OverlayTrigger placement="left" overlay={<Tooltip className="ttp-top">{__('chat')}</Tooltip>}>
                            <div className="d-flex justify-content-center w-100">
                            <i className="la la-comment-alt"></i>
                            </div>
                        </OverlayTrigger>
                        </button>
                    </div>
                    )}

                    {/* Notificaciones */}
                    {menuNotifications && (
                    <div className="notifications-warning position-relative">
                        <button className="btn btn-top-header rounded-pill d-flex align-items-center mx-1">
                        <OverlayTrigger placement="left" overlay={<Tooltip className="ttp-top">{__('notificaciones')}</Tooltip>}>
                            <div className="d-flex justify-content-center w-100">
                            <i className="la la-bell"></i>
                            </div>
                        </OverlayTrigger>
                        </button>
                    </div>
                    )}

                    {/* Selector empresa */}
                    {companies.length === 1 ? (
                        <span className="mx-3">{companies[0].name}</span>
                    ) : companies.length > 1 ? (
                        <select
                        className="form-select input-rounded no-border mx-1"
                        value={current_company ? current_company : ''}
                        onChange={handleCompanyChange}
                        >
                            {current_company === false && (
                            <option value="">{__('empresa_selec')}</option>
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
                        <button
                            type="button"
                            className="btn p-0"
                            id="page-header-user-dropdown"
                            data-bs-toggle="dropdown"
                            aria-haspopup="true"
                            aria-expanded="false"
                        >
                            <span className="d-flex align-items-center">
                                {(user.avatar || user.profile_photo_path) ? (
                                    <img
                                        className="rounded-circle header-profile-user"
                                        src={user.avatar ? user.avatar : `/storage/${user.profile_photo_path}`}
                                        alt={`${user.name} ${user.surname}`}
                                        onError={(e) => { e.target.onerror = null; e.target.src = '/images/users/avatar-1.jpg'; }}
                                    />
                                ) : (
                                    <div
                                    className="rounded-circle header-profile-user d-flex justify-content-center align-items-center"
                                    style={{ width: '30px', height: '30px', backgroundColor: '#fff' }}
                                    >
                                    <i className="la la-user-tie text-muted"></i>
                                    </div>
                                )}

                                <span className="text-start ms-xl-1">
                                    <span className="d-none d-xl-inline-block ms-1 fs-13 fw-bold user-name-text">{user.name}</span>
                                    <span className="d-none d-xl-block ms-1 fs-12 text-muted user-name-sub-text">Founder</span>
                                </span>
                            </span>
                        </button>

                        <div className="dropdown-menu dropdown-menu-end">
                            <h6 className="dropdown-header">{__('hola')} {user.name}!</h6>
                            <Link className="dropdown-item" href={route('profile.edit')}>
                                <i className="mdi mdi-account-circle text-muted fs-16 align-middle me-1"></i>
                                <span className="align-middle">{__('perfil')}</span>
                            </Link>
                            <button onClick={() => Inertia.post(route('logout'))} className="dropdown-item">
                                <i className="mdi mdi-logout text-muted fs-16 align-middle me-1"></i>
                                <span className="align-middle">Logout</span>
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

                if (modal) {
                    return (
                    <button type="button" key={index} className="btn btn-primary btn-rdn ms-2" onClick={onClick}>
                        {icon && <i className={`la ${icon}`}></i>} {text}
                    </button>
                    );
                }

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
                            },
                        });
                        }}
                    >
                        {icon && <i className={`la ${icon}`}></i>} {text}
                    </button>
                    );
                }

                return (
                    <Link key={index} href={url ? route(url, action.params || []) : '#'} className="btn btn-primary btn-rdn ms-2">
                    {icon && <i className={`la ${icon}`}></i>} {text}
                    </Link>
                );
                })}
            </div>

            {/* Filters placeholder */}
            <div className="layout-width" id="top-filters"></div>
        </header>
    );
}
