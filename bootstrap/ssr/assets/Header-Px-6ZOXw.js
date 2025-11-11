import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { Inertia } from "@inertiajs/inertia";
import { usePage, Link, router } from "@inertiajs/react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { u as useSweetAlert } from "./useSweetAlert-D4PAsWYN.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import "sweetalert2";
function Header({ user, title, subtitle, actions, companies, current_company }) {
  var _a;
  const __ = useTranslation();
  const props = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  const locale = props.locale || false;
  const languages = props.languages || [];
  console.log(user);
  const menuLocales = props.menuLocales;
  const menuChat = props.menuChat;
  const menuCustom = props.menuCustom;
  const menuNotifications = props.menuNotifications;
  const [isLangOpen, setLangOpen] = useState(false);
  const [isFavOpen, setFavOpen] = useState(false);
  const [favName, setFavName] = useState("");
  const langRef = useRef(null);
  const favRef = useRef(null);
  const favInputRef = useRef(null);
  const { showConfirm } = useSweetAlert();
  useEffect(() => {
    if (isLangOpen) setFavOpen(false);
  }, [isLangOpen]);
  useEffect(() => {
    if (isFavOpen) setLangOpen(false);
  }, [isFavOpen]);
  useEffect(() => {
    const onDocClick = (e) => {
      var _a2, _b;
      if (!((_a2 = langRef.current) == null ? void 0 : _a2.contains(e.target)) && !((_b = favRef.current) == null ? void 0 : _b.contains(e.target))) {
        setLangOpen(false);
        setFavOpen(false);
      }
    };
    const onEsc = (e) => {
      if (e.key === "Escape") {
        setLangOpen(false);
        setFavOpen(false);
      }
    };
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);
  useEffect(() => {
    const dd = document.getElementById("page-header-user-dropdown");
    if (!dd) return;
    const onShow = () => {
      setLangOpen(false);
      setFavOpen(false);
    };
    dd.addEventListener("show.bs.dropdown", onShow);
    return () => dd.removeEventListener("show.bs.dropdown", onShow);
  }, []);
  const handleLanguageChange = (language) => {
    Inertia.get(route("language", language), { language });
    setLangOpen(false);
  };
  const handleCompanyChange = (event) => {
    const companyId = event.target.value;
    router.post(route("companies.select"), { selectedCompany: companyId });
  };
  const saveFavorite = () => {
    const name = favName.trim();
    if (!name) return;
    const currentUrl = window.location.href;
    const module = (props == null ? void 0 : props.module) ?? "";
    router.post(
      route("user-preferences.store"),
      { name, url: currentUrl, module },
      {
        preserveScroll: true,
        onSuccess: () => {
          setFavName("");
          setFavOpen(false);
          if (route().current("dashboard.index")) {
            router.reload({ only: ["favorites"] });
          }
        }
      }
    );
  };
  const onFavKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveFavorite();
    }
  };
  const onFavBlur = () => {
    if (favName.trim()) saveFavorite();
  };
  return /* @__PURE__ */ jsxs("header", { id: "page-topbar", children: [
    /* @__PURE__ */ jsx("div", { className: "layout-width", id: "top-menu", children: /* @__PURE__ */ jsxs("div", { className: "navbar-header", children: [
      /* @__PURE__ */ jsxs("div", { className: "d-flex", children: [
        /* @__PURE__ */ jsx("div", { className: "navbar-brand-box horizontal-logo" }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            className: "btn btn-sm px-3 fs-16 header-item vertical-menu-btn topnav-hamburger",
            id: "topnav-hamburger-icon",
            children: /* @__PURE__ */ jsxs("span", { className: "hamburger-icon", children: [
              /* @__PURE__ */ jsx("span", {}),
              /* @__PURE__ */ jsx("span", {}),
              /* @__PURE__ */ jsx("span", {})
            ] })
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "d-flex align-items-center", children: [
          /* @__PURE__ */ jsx("h1", { className: "mb-0", children: title }),
          subtitle !== "" && /* @__PURE__ */ jsx("h3", { className: "ms-4", children: subtitle })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "d-flex align-items-center", children: [
        menuLocales && /* @__PURE__ */ jsxs("div", { ref: langRef, className: "language-selector position-relative", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              className: "btn rounded-pill btn-locale d-flex align-items-center mx-1",
              onClick: (e) => {
                e.stopPropagation();
                setLangOpen((v) => !v);
              },
              children: /* @__PURE__ */ jsx(OverlayTrigger, { placement: "left", overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", children: __("idiomas") }), children: /* @__PURE__ */ jsxs("div", { className: "d-flex align-items-center", children: [
                /* @__PURE__ */ jsx("span", { className: "me-2", children: locale }),
                /* @__PURE__ */ jsx("i", { className: "la la-caret-down" })
              ] }) })
            }
          ),
          isLangOpen && /* @__PURE__ */ jsx("ul", { className: "dropdown-menu dropdown-menu-end show position-absolute mt-2 shadow", style: { minWidth: 220 }, children: Object.keys(languages).map((key) => {
            const langData = languages[key];
            return /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
              "button",
              {
                className: `dropdown-item ${locale === langData[0] ? "active" : ""}`,
                onClick: () => handleLanguageChange(langData[0]),
                children: langData[3]
              }
            ) }, key);
          }) })
        ] }),
        menuCustom && /* @__PURE__ */ jsxs("div", { ref: favRef, className: "custom-menu position-relative", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              className: "btn btn-top-header rounded-pill d-flex align-items-center mx-1",
              onClick: (e) => {
                e.stopPropagation();
                setFavOpen((v) => !v);
                setTimeout(() => {
                  var _a2;
                  return (_a2 = favInputRef.current) == null ? void 0 : _a2.focus();
                }, 0);
              },
              children: /* @__PURE__ */ jsx(OverlayTrigger, { placement: "left", overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", children: __("menu_preferencias") }), children: /* @__PURE__ */ jsx("div", { className: "d-flex justify-content-center w-100", children: /* @__PURE__ */ jsx("i", { className: "la la-cog" }) }) })
            }
          ),
          isFavOpen && /* @__PURE__ */ jsxs("div", { className: "dropdown-menu dropdown-menu-end show position-absolute p-3 mt-2 shadow", style: { minWidth: 320 }, children: [
            /* @__PURE__ */ jsx("h6", { className: "dropdown-header ps-0", children: __("menu_preferencias") }),
            /* @__PURE__ */ jsx(
              "input",
              {
                ref: favInputRef,
                type: "text",
                className: "form-control",
                value: favName,
                onChange: (e) => setFavName(e.target.value),
                onKeyDown: onFavKeyDown,
                onBlur: onFavBlur,
                placeholder: __("pantalla_guarda")
              }
            ),
            /* @__PURE__ */ jsx("small", { className: "text-warning", children: __("pantalla_guarda_texto") })
          ] })
        ] }),
        menuChat && /* @__PURE__ */ jsx("div", { className: "chat-warning position-relative", children: /* @__PURE__ */ jsx("button", { className: "btn btn-top-header rounded-pill d-flex align-items-center mx-1", children: /* @__PURE__ */ jsx(OverlayTrigger, { placement: "left", overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", children: __("chat") }), children: /* @__PURE__ */ jsx("div", { className: "d-flex justify-content-center w-100", children: /* @__PURE__ */ jsx("i", { className: "la la-comment-alt" }) }) }) }) }),
        menuNotifications && /* @__PURE__ */ jsx("div", { className: "notifications-warning position-relative", children: /* @__PURE__ */ jsx("button", { className: "btn btn-top-header rounded-pill d-flex align-items-center mx-1", children: /* @__PURE__ */ jsx(OverlayTrigger, { placement: "left", overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", children: __("notificaciones") }), children: /* @__PURE__ */ jsx("div", { className: "d-flex justify-content-center w-100", children: /* @__PURE__ */ jsx("i", { className: "la la-bell" }) }) }) }) }),
        companies.length === 1 ? /* @__PURE__ */ jsx("span", { className: "mx-3", children: companies[0].name }) : companies.length > 1 ? /* @__PURE__ */ jsxs(
          "select",
          {
            className: "form-select input-rounded no-border mx-1",
            value: current_company ? current_company : "",
            onChange: handleCompanyChange,
            children: [
              current_company === false && /* @__PURE__ */ jsx("option", { value: "", children: __("empresa_selec") }),
              companies.map((company) => /* @__PURE__ */ jsx("option", { value: company.id, children: company.name }, company.id))
            ]
          }
        ) : null,
        /* @__PURE__ */ jsxs("div", { className: "dropdown ms-sm-1 header-item topbar-user", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "btn p-0",
              id: "page-header-user-dropdown",
              "data-bs-toggle": "dropdown",
              "aria-haspopup": "true",
              "aria-expanded": "false",
              children: /* @__PURE__ */ jsxs("span", { className: "d-flex align-items-center", children: [
                user.avatar || user.profile_photo_path ? /* @__PURE__ */ jsx(
                  "img",
                  {
                    className: "rounded-circle header-profile-user",
                    src: user.avatar ? user.avatar : `/storage/${user.profile_photo_path}`,
                    alt: `${user.name} ${user.surname}`,
                    onError: (e) => {
                      e.target.onerror = null;
                      e.target.src = "/images/users/avatar-1.jpg";
                    }
                  }
                ) : /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: "rounded-circle header-profile-user d-flex justify-content-center align-items-center",
                    style: { width: "30px", height: "30px", backgroundColor: "#fff" },
                    children: /* @__PURE__ */ jsx("i", { className: "la la-user-tie text-muted" })
                  }
                ),
                /* @__PURE__ */ jsxs("span", { className: "text-start ms-xl-1", children: [
                  /* @__PURE__ */ jsx("span", { className: "d-none d-xl-inline-block ms-1 fs-13 fw-bold user-name-text", children: user.name }),
                  /* @__PURE__ */ jsx("span", { className: "d-none d-xl-block ms-1 fs-12 text-muted user-name-sub-text", children: "Founder" })
                ] })
              ] })
            }
          ),
          /* @__PURE__ */ jsxs("div", { className: "dropdown-menu dropdown-menu-end", children: [
            /* @__PURE__ */ jsxs("h6", { className: "dropdown-header", children: [
              __("hola"),
              " ",
              user.name,
              "!"
            ] }),
            /* @__PURE__ */ jsxs(Link, { className: "dropdown-item", href: route("profile.edit"), children: [
              /* @__PURE__ */ jsx("i", { className: "mdi mdi-account-circle text-muted fs-16 align-middle me-1" }),
              /* @__PURE__ */ jsx("span", { className: "align-middle", children: __("perfil") })
            ] }),
            /* @__PURE__ */ jsxs("button", { onClick: () => Inertia.post(route("logout")), className: "dropdown-item", children: [
              /* @__PURE__ */ jsx("i", { className: "mdi mdi-logout text-muted fs-16 align-middle me-1" }),
              /* @__PURE__ */ jsx("span", { className: "align-middle", children: "Logout" })
            ] })
          ] })
        ] })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "layout-width ps-2", id: "top-actions", children: actions.map((action, index) => {
      const text = action.text;
      const icon = action.icon;
      const url = action.url;
      const modal = action.modal || false;
      const method = action.method || null;
      const onClick = action.onClick || null;
      if (modal) {
        return /* @__PURE__ */ jsxs("button", { type: "button", className: "btn btn-primary btn-rdn ms-2", onClick, children: [
          icon && /* @__PURE__ */ jsx("i", { className: `la ${icon}` }),
          " ",
          text
        ] }, index);
      }
      if (method === "delete") {
        return /* @__PURE__ */ jsxs(
          "button",
          {
            className: "btn btn-danger btn-rdn ms-2",
            onClick: (e) => {
              e.preventDefault();
              showConfirm({
                title: action.title,
                text: action.message,
                icon: "warning",
                onConfirm: () => {
                  router.delete(route(url, action.params || []));
                }
              });
            },
            children: [
              icon && /* @__PURE__ */ jsx("i", { className: `la ${icon}` }),
              " ",
              text
            ]
          },
          index
        );
      }
      return /* @__PURE__ */ jsxs(Link, { href: url ? route(url, action.params || []) : "#", className: "btn btn-primary btn-rdn ms-2", children: [
        icon && /* @__PURE__ */ jsx("i", { className: `la ${icon}` }),
        " ",
        text
      ] }, index);
    }) }),
    /* @__PURE__ */ jsx("div", { className: "layout-width", id: "top-filters" })
  ] });
}
export {
  Header as default
};
