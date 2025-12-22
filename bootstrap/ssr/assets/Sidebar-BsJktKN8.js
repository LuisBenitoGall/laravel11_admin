import { jsxs, jsx } from "react/jsx-runtime";
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
function Sidebar(auth) {
  const __ = useTranslation();
  __("areas_negocio");
  __("bancos");
  const txt_categorias_por = __("categorias_por");
  const txt_centros_coste = __("centros_coste");
  const txt_centros_trabajo = __("centros_trabajo");
  const txt_clientes = __("clientes");
  const txt_cli_pro = __("clientes_proveedores");
  const txt_configuracion = __("configuracion");
  __("contables_grupos");
  __("contactos");
  __("contenidos");
  __("cuenta");
  __("cuenta_mi");
  __("cuentas");
  const txt_empresas = __("empresas");
  const txt_empresas_mis = __("empresas_mis");
  __("iva_tipos");
  __("modulos");
  __("monedas");
  __("paises");
  __("permisos");
  const txt_proveedores = __("proveedores");
  __("roles");
  const txt_sectores = __("sectores");
  const txt_sectores_directorio = __("sectores_directorio");
  __("stock_movimientos");
  __("unidades");
  const txt_usuarios = __("usuarios");
  const txt_usuarios_listados = __("usuarios_listados");
  const [isOpen, setIsOpen] = useState(true);
  const [modules, setModules] = useState([]);
  const props = useSafePage();
  const { currentCompany, companyModules } = useCompanySession();
  const { module: currentModule, slug: currentSlug } = props;
  const default_modules = ["crm", "marketing"];
  const module_my_account = false;
  const module_settings = false;
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
    }).catch((error) => console.error("Error fetching secondary menu:", error));
  }, [JSON.stringify(companyModules), currentCompany == null ? void 0 : currentCompany.id]);
  return /* @__PURE__ */ jsxs("div", { className: `app-menu navbar-menu ${isOpen ? "show" : "hide"}`, children: [
    /* @__PURE__ */ jsx("div", { className: "navbar-brand-box", children: /* @__PURE__ */ jsxs(Link, { href: route("dashboard.index"), className: "logo", children: [
      /* @__PURE__ */ jsx("span", { className: "logo-sm", children: /* @__PURE__ */ jsx("img", { src: "/img/logo/logo-rft-portrait.jpg", alt: "RFT", className: "img-fluid p-3" }) }),
      /* @__PURE__ */ jsx("span", { className: "logo-lg", children: /* @__PURE__ */ jsx("img", { src: "/img/logo/logo-rft-landscape.png", alt: "RFT", className: "img-fluid p-3" }) })
    ] }) }),
    /* @__PURE__ */ jsx("div", { id: "scrollbar", children: /* @__PURE__ */ jsx("div", { id: "sidebar-menu", children: /* @__PURE__ */ jsxs("ul", { className: "navbar-nav mt-3", id: "navbar-nav", children: [
      (() => {
        const isActive = currentModule === "dashboard";
        return /* @__PURE__ */ jsx("li", { className: `nav-item ${isActive ? "active text-white" : ""}`, children: /* @__PURE__ */ jsxs(Link, { href: route("dashboard.index"), className: `nav-link menu-link ${isActive ? "active text-white" : ""}`, active: route().current("dashboard.index").toString(), children: [
          /* @__PURE__ */ jsx("i", { className: "la la-home" }),
          /* @__PURE__ */ jsx("span", { children: "Dashboard" })
        ] }) });
      })(),
      module_my_account,
      module_settings,
      (() => {
        const isActive = currentModule === "users";
        return /* @__PURE__ */ jsxs("li", { className: `nav-item ${isActive ? "active text-white" : ""}`, children: [
          /* @__PURE__ */ jsxs(Link, { href: "#", className: `nav-link menu-link ${isActive ? "active text-white" : ""}`, "data-bs-toggle": "collapse", "data-bs-target": "#menuUsers", role: "button", "aria-expanded": isActive, "aria-controls": "menuUsers", children: [
            /* @__PURE__ */ jsx("i", { className: "la la-users" }),
            /* @__PURE__ */ jsx("span", { children: txt_usuarios })
          ] }),
          /* @__PURE__ */ jsx("div", { className: `collapse menu-dropdown ${isActive ? "show" : ""}`, id: "menuUsers", children: /* @__PURE__ */ jsxs("ul", { className: "nav nav-sm flex-column", children: [
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(NavLink, { href: route("users.index"), className: `nav-link menu-link ${currentSlug === "users" ? "active text-white" : ""}`, children: /* @__PURE__ */ jsx("span", { children: txt_usuarios_listados }) }) }),
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(NavLink, { href: route("users.contacts"), className: `nav-link menu-link ${currentSlug === "contacts" ? "active text-white" : ""}`, children: /* @__PURE__ */ jsx("span", { children: txt_cli_pro }) }) }),
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(NavLink, { href: route("users.categories"), className: `nav-link menu-link ${currentSlug === "categories" ? "active text-white" : ""}`, children: /* @__PURE__ */ jsx("span", { children: txt_categorias_por }) }) })
          ] }) })
        ] });
      })(),
      (() => {
        const isActive = currentModule === "companies";
        return /* @__PURE__ */ jsxs("li", { className: `nav-item ${isActive ? "active text-white" : ""}`, children: [
          /* @__PURE__ */ jsxs(Link, { href: "#", className: `nav-link menu-link ${isActive ? "active text-white" : ""}`, "data-bs-toggle": "collapse", "data-bs-target": "#menuCompanies", role: "button", "aria-expanded": isActive, "aria-controls": "menuCompanies", children: [
            /* @__PURE__ */ jsx("i", { className: "la la-building" }),
            /* @__PURE__ */ jsx("span", { children: txt_empresas })
          ] }),
          /* @__PURE__ */ jsx("div", { className: `collapse menu-dropdown ${isActive ? "show" : ""}`, id: "menuCompanies", children: /* @__PURE__ */ jsxs("ul", { className: "nav nav-sm flex-column", children: [
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(NavLink, { href: route("companies.index"), className: `nav-link menu-link ${currentSlug === "companies" ? "active text-white" : ""}`, children: /* @__PURE__ */ jsx("span", { children: txt_empresas_mis }) }) }),
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(NavLink, { href: route("companies.sectors"), className: `nav-link menu-link ${currentSlug === "sectors" ? "active text-white" : ""}`, children: /* @__PURE__ */ jsx("span", { children: txt_sectores_directorio }) }) }),
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(NavLink, { href: route("cost-centers.index"), className: `nav-link menu-link ${currentSlug === "cost-centers" ? "active text-white" : ""}`, children: /* @__PURE__ */ jsx("span", { children: txt_centros_coste }) }) }),
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(NavLink, { href: route("workplaces.index"), className: `nav-link menu-link ${currentSlug === "workplaces" ? "active text-white" : ""}`, children: /* @__PURE__ */ jsx("span", { children: txt_centros_trabajo }) }) }),
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(NavLink, { href: route("company-settings.index"), className: `nav-link menu-link ${currentSlug === "company-settings" ? "active text-white" : ""}`, children: /* @__PURE__ */ jsx("span", { children: txt_configuracion }) }) }),
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(NavLink, { href: route("customers.index"), className: `nav-link menu-link ${currentSlug === "customers" ? "active text-white" : ""}`, children: /* @__PURE__ */ jsx("span", { children: txt_clientes }) }) }),
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(NavLink, { href: route("providers.index"), className: `nav-link menu-link ${currentSlug === "providers" ? "active text-white" : ""}`, children: /* @__PURE__ */ jsx("span", { children: txt_proveedores }) }) }),
            /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(NavLink, { href: route("company-sectors.index"), className: `nav-link menu-link ${currentSlug === "company-sectors" ? "active text-white" : ""}`, children: /* @__PURE__ */ jsx("span", { children: txt_sectores }) }) })
          ] }) })
        ] });
      })(),
      Array.isArray(modules) && modules.length > 0 ? modules.filter((module) => Array.isArray(module.functionalities) && module.functionalities.length > 0 || default_modules.includes(module.slug)).map((module) => {
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
          Array.isArray(module.functionalities) && module.functionalities.length > 0 && /* @__PURE__ */ jsx("div", { className: `collapse menu-dropdown ${isModuleActive ? "show" : ""}`, id: menuId, children: /* @__PURE__ */ jsx("ul", { className: "nav nav-sm flex-column", children: module.functionalities.map((subModule) => {
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
