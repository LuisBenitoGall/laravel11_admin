import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { usePage, Link } from "@inertiajs/react";
import axios from "axios";
import bootstrap from "bootstrap/dist/js/bootstrap.bundle.min.js";
import { N as NavLink } from "./NavLink-k73-0cwm.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
function useSafePage() {
  let pageProps = {};
  try {
    pageProps = usePage().props;
  } catch (error) {
    console.error("Error en usePage():", error);
  }
  return pageProps || {};
}
const useCompanySession = () => {
  var _a;
  const sessionData = ((_a = useSafePage()) == null ? void 0 : _a.sessionData) ?? {};
  return {
    currentCompany: sessionData.currentCompany ?? null,
    companyModules: Array.isArray(sessionData.companyModules) ? sessionData.companyModules : [],
    companySettings: sessionData.companySettings ?? null
  };
};
function Sidebar() {
  var _a;
  const __ = useTranslation();
  __("archivos");
  const txt_documentos = __("documentos");
  __("areas_negocio");
  const txt_bancos = __("bancos");
  const txt_categorias_por = __("categorias_por");
  const txt_centros_coste = __("centros_coste");
  const txt_centros_trabajo = __("centros_trabajo");
  const txt_clientes = __("clientes");
  const txt_cli_pro = __("clientes_proveedores");
  const txt_configuracion = __("configuracion");
  const txt_contables_grupos = __("contables_grupos");
  __("contactos");
  const txt_contenidos = __("contenidos");
  const txt_cuenta = __("cuenta");
  const txt_cuenta_mi = __("cuenta_mi");
  const txt_cuentas = __("cuentas");
  const txt_empresas = __("empresas");
  const txt_empresas_mis = __("empresas_mis");
  const txt_iva_tipos = __("iva_tipos");
  const txt_modulos = __("modulos");
  const txt_monedas = __("monedas");
  const txt_paises = __("paises");
  const txt_permisos = __("permisos");
  const txt_proveedores = __("proveedores");
  const txt_roles = __("roles");
  const txt_sectores = __("sectores");
  const txt_sectores_directorio = __("sectores_directorio");
  const txt_stock_movimientos = __("stock_movimientos");
  const txt_unidades = __("unidades");
  const txt_usuarios = __("usuarios");
  const txt_usuarios_listados = __("usuarios_listados");
  const STORAGE_KEY = "admin_sidebar_collapsed";
  const MD_BREAKPOINT = 768;
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  });
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    return !window.matchMedia(`(min-width: ${MD_BREAKPOINT}px)`).matches;
  });
  const [modules, setModules] = useState([]);
  const props = useSafePage();
  const { currentCompany, companyModules } = useCompanySession();
  const { module: currentModule, slug: currentSlug } = props;
  const page = usePage();
  const auth = ((_a = page == null ? void 0 : page.props) == null ? void 0 : _a.auth) || {};
  const permissions = Array.isArray(auth.permissions) ? auth.permissions : [];
  const isSuperAdmin = !!auth.is_super_admin;
  const can = (routeName) => permissions.includes(routeName) || isSuperAdmin;
  const myAccountItems = [
    { route: "company-accounts.index", activeSlug: "company-accounts", label: txt_cuenta },
    { route: "company-modules.index", activeSlug: "company-modules", label: txt_modulos },
    { route: "documents.index", activeSlug: "documents", label: txt_documentos, permission: "documents.viewAny" }
  ];
  const visibleMyAccountItems = myAccountItems.filter((i) => can(i.permission || i.route));
  const showMyAccountModule = visibleMyAccountItems.length > 0;
  const usersItems = [
    { route: "users.index", activeSlug: "users", label: txt_usuarios_listados },
    { route: "users.contacts", activeSlug: "contacts", label: txt_cli_pro },
    { route: "users.categories", activeSlug: "categories", label: txt_categorias_por }
  ];
  const visibleUsersItems = usersItems.filter((i) => can(i.route));
  const showUsersModule = visibleUsersItems.length > 0;
  const companiesItems = [
    { route: "companies.index", activeSlug: "companies", label: txt_empresas_mis },
    { route: "companies.sectors", activeSlug: "sectors", label: txt_sectores_directorio },
    { route: "cost-centers.index", activeSlug: "cost-centers", label: txt_centros_coste },
    { route: "workplaces.index", activeSlug: "workplaces", label: txt_centros_trabajo },
    { route: "company-settings.index", activeSlug: "company-settings", label: txt_configuracion },
    { route: "customers.index", activeSlug: "customers", label: txt_clientes },
    { route: "providers.index", activeSlug: "providers", label: txt_proveedores },
    { route: "company-sectors.index", activeSlug: "company-sectors", label: txt_sectores }
  ];
  const visibleCompaniesItems = companiesItems.filter((i) => can(i.route));
  const showCompaniesModule = visibleCompaniesItems.length > 0;
  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${MD_BREAKPOINT}px)`);
    const handleChange = (e) => {
      const desktop = e.matches;
      setIsMobile(!desktop);
      if (!desktop) setIsMobileOpen(false);
    };
    handleChange(mql);
    mql.addEventListener("change", handleChange);
    return () => mql.removeEventListener("change", handleChange);
  }, []);
  useEffect(() => {
    const handleToggle = () => {
      if (isMobile) {
        setIsMobileOpen((prev) => !prev);
      } else {
        setIsCollapsed((prev) => {
          const next = !prev;
          try {
            window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
          } catch (_) {
          }
          return next;
        });
      }
    };
    window.addEventListener("admin-sidebar-toggle", handleToggle);
    return () => window.removeEventListener("admin-sidebar-toggle", handleToggle);
  }, [isMobile]);
  useEffect(() => {
    if (isMobile || !isCollapsed) return;
    const sidebar = document.querySelector(".navbar-menu.sidebar--collapsed");
    if (!sidebar) return;
    const navItems = Array.from(sidebar.querySelectorAll(".nav-item")).filter(
      (el) => el.querySelector(".menu-dropdown")
    );
    const HIDE_DELAY_MS = 150;
    let hideTimer = null;
    const show = (dd) => {
      if (!dd) return;
      if (hideTimer) clearTimeout(hideTimer);
      hideTimer = null;
      dd.style.setProperty("display", "block", "important");
      dd.style.setProperty("height", "auto", "important");
      dd.style.setProperty("max-height", "80vh", "important");
    };
    const hide = (dd) => {
      if (!dd) return;
      if (hideTimer) clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        hideTimer = null;
        dd.style.removeProperty("display");
        dd.style.removeProperty("height");
        dd.style.removeProperty("max-height");
      }, HIDE_DELAY_MS);
    };
    const teardown = [];
    navItems.forEach((el) => {
      const dd = el.querySelector(".menu-dropdown");
      if (!dd) return;
      const link = el.querySelector('.nav-link[data-bs-toggle="collapse"]');
      const onNavEnter = () => show(dd);
      const onNavLeave = () => hide(dd);
      const onDdEnter = () => show(dd);
      const onDdLeave = () => hide(dd);
      const onLinkClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
      };
      el.addEventListener("mouseenter", onNavEnter);
      el.addEventListener("mouseleave", onNavLeave);
      dd.addEventListener("mouseenter", onDdEnter);
      dd.addEventListener("mouseleave", onDdLeave);
      if (link) {
        link.addEventListener("click", onLinkClick);
        teardown.push(() => link.removeEventListener("click", onLinkClick));
      }
      teardown.push(() => {
        el.removeEventListener("mouseenter", onNavEnter);
        el.removeEventListener("mouseleave", onNavLeave);
        dd.removeEventListener("mouseenter", onDdEnter);
        dd.removeEventListener("mouseleave", onDdLeave);
      });
    });
    return () => {
      if (hideTimer) clearTimeout(hideTimer);
      teardown.forEach((fn) => fn());
    };
  }, [isCollapsed, isMobile]);
  useEffect(() => {
    document.querySelectorAll('.menu-link[data-bs-toggle="collapse"]').forEach((el) => {
      new bootstrap.Collapse(el, { toggle: false });
    });
    if (!currentCompany) {
      setModules([]);
      return;
    }
    axios.get("/secondary-menu").then(({ data }) => {
      setModules(Array.isArray(data) ? data : []);
    }).catch((error) => {
      console.error("Error fetching secondary menu:", error);
      setModules([]);
    });
  }, [JSON.stringify(companyModules), currentCompany == null ? void 0 : currentCompany.id]);
  const renderSubMenu = (items) => /* @__PURE__ */ jsx("ul", { className: "nav nav-sm flex-column", children: items.map((item) => /* @__PURE__ */ jsx("li", { className: "nav-item", children: /* @__PURE__ */ jsx(
    NavLink,
    {
      href: route(item.route),
      className: `nav-link menu-link ${currentSlug === item.activeSlug ? "active text-white" : ""}`,
      children: /* @__PURE__ */ jsx("span", { children: item.label })
    }
  ) }, item.route)) });
  const rootClasses = [
    "app-menu",
    "navbar-menu",
    "sidebar--scrollable",
    isMobile ? isMobileOpen ? "sidebar--mobile-open" : "" : isCollapsed ? "hide sidebar--collapsed" : "show"
  ].filter(Boolean).join(" ");
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    isMobile && isMobileOpen && /* @__PURE__ */ jsx(
      "div",
      {
        className: "sidebar-overlay",
        onClick: () => setIsMobileOpen(false),
        onKeyDown: (e) => e.key === "Escape" && setIsMobileOpen(false),
        role: "button",
        tabIndex: 0,
        "aria-label": "Cerrar menú"
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: rootClasses, children: [
      /* @__PURE__ */ jsx("div", { className: "navbar-brand-box", children: /* @__PURE__ */ jsxs(Link, { href: route("dashboard.index"), className: "logo", children: [
        /* @__PURE__ */ jsx("span", { className: "logo-sm", children: /* @__PURE__ */ jsx("img", { src: "/img/logo/logo-rft-portrait.jpg", alt: "RFT", className: "img-fluid p-3" }) }),
        /* @__PURE__ */ jsx("span", { className: "logo-lg", children: /* @__PURE__ */ jsx("img", { src: "/img/logo/logo-rft-landscape.png", alt: "RFT", className: "img-fluid p-3" }) })
      ] }) }),
      /* @__PURE__ */ jsx("div", { id: "scrollbar", className: "sidebar-scroll-area", children: /* @__PURE__ */ jsx("div", { id: "sidebar-menu", children: /* @__PURE__ */ jsxs("ul", { className: "navbar-nav mt-3", id: "navbar-nav", children: [
        (() => {
          const isActive = currentModule === "dashboard";
          return /* @__PURE__ */ jsx("li", { className: `nav-item ${isActive ? "active text-white" : ""}`, children: /* @__PURE__ */ jsxs(Link, { href: route("dashboard.index"), className: `nav-link menu-link ${isActive ? "active text-white" : ""}`, active: route().current("dashboard.index").toString(), children: [
            /* @__PURE__ */ jsx("i", { className: "la la-home" }),
            /* @__PURE__ */ jsx("span", { children: "Dashboard" })
          ] }) });
        })(),
        showMyAccountModule && (() => {
          const isActive = currentModule === "company-accounts";
          return /* @__PURE__ */ jsxs("li", { className: `nav-item ${isActive ? "active text-white" : ""}`, children: [
            /* @__PURE__ */ jsxs(
              Link,
              {
                href: "#",
                className: `nav-link menu-link ${isActive ? "active text-white" : ""}`,
                "data-bs-toggle": "collapse",
                "data-bs-target": "#menuMyAccount",
                role: "button",
                "aria-expanded": isActive,
                "aria-controls": "menuMyAccount",
                children: [
                  /* @__PURE__ */ jsx("i", { className: "la la-user-circle" }),
                  /* @__PURE__ */ jsx("span", { children: txt_cuenta_mi })
                ]
              }
            ),
            /* @__PURE__ */ jsx("div", { className: `collapse menu-dropdown ${isActive ? "show" : ""}`, id: "menuMyAccount", children: renderSubMenu(visibleMyAccountItems) })
          ] });
        })(),
        isSuperAdmin && (() => {
          const isActive = currentModule === "settings";
          const settingsItems = [
            { route: "accounts.index", activeSlug: "accounts", label: txt_cuentas },
            { route: "modules.index", activeSlug: "modules", label: txt_modulos },
            { route: "roles.index", activeSlug: "roles", label: txt_roles },
            { route: "permissions.index", activeSlug: "permissions", label: txt_permisos },
            { route: "currencies.index", activeSlug: "currencies", label: txt_monedas },
            { route: "banks.index", activeSlug: "banks", label: txt_bancos },
            { route: "countries.index", activeSlug: "countries", label: txt_paises },
            { route: "contents.index", activeSlug: "contents", label: txt_contenidos },
            { route: "stock-movements.index", activeSlug: "stock-movements", label: txt_stock_movimientos },
            { route: "units.index", activeSlug: "units", label: txt_unidades },
            { route: "iva-types.index", activeSlug: "iva-types", label: txt_iva_tipos },
            { route: "accounting-account-types.index", activeSlug: "accounting-account-types", label: txt_contables_grupos }
          ];
          const visibleSettingsItems = settingsItems.filter((i) => can(i.route));
          return /* @__PURE__ */ jsxs("li", { className: `nav-item ${isActive ? "active text-white" : ""}`, children: [
            /* @__PURE__ */ jsxs(Link, { href: "#", className: `nav-link menu-link ${isActive ? "active text-white" : ""}`, "data-bs-toggle": "collapse", "data-bs-target": "#menuSettings", role: "button", "aria-expanded": isActive, "aria-controls": "menuSettings", children: [
              /* @__PURE__ */ jsx("i", { className: "la la-cog" }),
              /* @__PURE__ */ jsx("span", { children: txt_configuracion })
            ] }),
            visibleSettingsItems.length > 0 && /* @__PURE__ */ jsx("div", { className: `collapse menu-dropdown ${isActive ? "show" : ""}`, id: "menuSettings", children: renderSubMenu(visibleSettingsItems) })
          ] });
        })(),
        showUsersModule && (() => {
          const isActive = currentModule === "users";
          return /* @__PURE__ */ jsxs("li", { className: `nav-item ${isActive ? "active text-white" : ""}`, children: [
            /* @__PURE__ */ jsxs(
              Link,
              {
                href: "#",
                className: `nav-link menu-link ${isActive ? "active text-white" : ""}`,
                "data-bs-toggle": "collapse",
                "data-bs-target": "#menuUsers",
                role: "button",
                "aria-expanded": isActive,
                "aria-controls": "menuUsers",
                children: [
                  /* @__PURE__ */ jsx("i", { className: "la la-users" }),
                  /* @__PURE__ */ jsx("span", { children: txt_usuarios })
                ]
              }
            ),
            /* @__PURE__ */ jsx("div", { className: `collapse menu-dropdown ${isActive ? "show" : ""}`, id: "menuUsers", children: renderSubMenu(visibleUsersItems) })
          ] });
        })(),
        showCompaniesModule && (() => {
          const isActive = currentModule === "companies";
          return /* @__PURE__ */ jsxs("li", { className: `nav-item ${isActive ? "active text-white" : ""}`, children: [
            /* @__PURE__ */ jsxs(
              Link,
              {
                href: "#",
                className: `nav-link menu-link ${isActive ? "active text-white" : ""}`,
                "data-bs-toggle": "collapse",
                "data-bs-target": "#menuCompanies",
                role: "button",
                "aria-expanded": isActive,
                "aria-controls": "menuCompanies",
                children: [
                  /* @__PURE__ */ jsx("i", { className: "la la-building" }),
                  /* @__PURE__ */ jsx("span", { children: txt_empresas })
                ]
              }
            ),
            /* @__PURE__ */ jsx("div", { className: `collapse menu-dropdown ${isActive ? "show" : ""}`, id: "menuCompanies", children: renderSubMenu(visibleCompaniesItems) })
          ] });
        })(),
        Array.isArray(modules) && modules.length > 0 ? modules.map((module) => {
          const functionalities = Array.isArray(module.functionalities) ? module.functionalities.filter((f) => Number(f.status) === 1).slice().sort((a, b) => {
            const sa = Number(a.sort ?? 0);
            const sb = Number(b.sort ?? 0);
            return sa - sb;
          }) : [];
          return { ...module, functionalities };
        }).filter((module) => module.functionalities.length > 0).map((module) => {
          const menuId = `menu${module.slug.charAt(0).toUpperCase() + module.slug.slice(1)}`;
          const isModuleActive = currentModule === module.slug;
          return /* @__PURE__ */ jsxs("li", { className: `nav-item ${isModuleActive ? "active text-white" : ""}`, children: [
            /* @__PURE__ */ jsxs(
              Link,
              {
                href: "#",
                className: `nav-link menu-link ${isModuleActive ? "active text-white" : ""}`,
                "data-bs-toggle": "collapse",
                "data-bs-target": `#${menuId}`,
                role: "button",
                "aria-expanded": isModuleActive,
                "aria-controls": menuId,
                children: [
                  /* @__PURE__ */ jsx("i", { className: `la la-${module.icon}` }),
                  /* @__PURE__ */ jsx("span", { children: module.label })
                ]
              }
            ),
            /* @__PURE__ */ jsx("div", { className: `collapse menu-dropdown ${isModuleActive ? "show" : ""}`, id: menuId, children: /* @__PURE__ */ jsx("ul", { className: "nav nav-sm flex-column", children: module.functionalities.map((subModule) => {
              const isActiveSub = currentSlug === subModule.slug;
              return /* @__PURE__ */ jsx("li", { className: "nav-item", children: /* @__PURE__ */ jsx(
                NavLink,
                {
                  href: route(`${subModule.slug}.index`).toString(),
                  className: `nav-link ${isActiveSub ? "active text-white" : ""}`,
                  children: /* @__PURE__ */ jsx("span", { children: subModule.label })
                }
              ) }, subModule.id);
            }) }) })
          ] }, module.id);
        }) : /* @__PURE__ */ jsx("li", { className: "nav-item", children: /* @__PURE__ */ jsx("span", { className: "text-white" }) })
      ] }) }) })
    ] })
  ] });
}
const Sidebar$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: Sidebar
}, Symbol.toStringTag, { value: "Module" }));
export {
  Sidebar as S,
  Sidebar$1 as a,
  useCompanySession as u
};
