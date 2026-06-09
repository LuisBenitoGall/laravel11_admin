import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-CS0xV2Ze.js";
import { useForm, Head, router } from "@inertiajs/react";
import { useMemo, useState } from "react";
/* empty css                          */
import { C as Checkbox } from "./Checkbox-C9HPJULq.js";
import { C as ColorPicker } from "./ColorPicker-Q_PgaUn1.js";
import { I as InfoPopover } from "./InfoPopover-CwWEvwXq.js";
import { I as InputError } from "./InputError-DME5vguS.js";
import { P as PrimaryButton } from "./PrimaryButton-CIbKPOjQ.js";
import { S as SelectInput } from "./SelectInput-BpRRLwUE.js";
import "./StatusButton-DfO41WfJ.js";
import { T as TextInput } from "./TextInput-CzxrbIpp.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import "./Header-BVvoXjVe.js";
import "@inertiajs/inertia";
import "react-bootstrap";
import "./useSweetAlert-D4PAsWYN.js";
import "sweetalert2";
import "./Sidebar-DgixJBon.js";
import "axios";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
import "react-color";
function normalizeLocales(availableLocales) {
  if (!availableLocales) return [];
  if (Array.isArray(availableLocales)) {
    if (!availableLocales.length) return [];
    if (typeof availableLocales[0] === "string") {
      return availableLocales.map((code) => ({ value: code, label: code.toUpperCase() }));
    }
    return availableLocales.map((x) => ({
      value: String(x.code ?? x.locale ?? x.value ?? ""),
      label: String(x.name ?? x.label ?? x.title ?? (x.code ?? "")).trim()
    })).filter((x) => x.value);
  }
  if (typeof availableLocales === "object") {
    return Object.entries(availableLocales).map(([code, name]) => ({
      value: String(code),
      label: String(name)
    }));
  }
  return [];
}
function Index({
  auth,
  session,
  title,
  subtitle,
  company,
  setting,
  currencies,
  queryParams: rawQueryParams = {},
  availableLocales,
  languages
}) {
  const __ = useTranslation();
  const currencyOptions = useMemo(() => {
    if (!Array.isArray(currencies)) return [];
    return currencies.map((c) => ({
      value: String(c.id),
      label: c.name ?? c.code ?? c.symbol ?? `#${c.id}`
    }));
  }, [currencies]);
  const localeOptions = useMemo(() => normalizeLocales(availableLocales), [availableLocales]);
  const languageOptions = useMemo(() => {
    if (languages && !Array.isArray(languages) && typeof languages === "object") {
      return Object.entries(languages).map(([code, arr]) => ({
        value: String(code),
        label: String(arr && arr[3] ? arr[3] : code),
        secondary: arr && arr[0] ? String(arr[0]) : ""
      }));
    }
    if (Array.isArray(languages)) {
      return languages.map((opt) => {
        if (Array.isArray(opt)) {
          const code = opt[0];
          const label = opt[3] ?? opt[1] ?? code;
          const secondary = opt[0] ?? "";
          return { value: String(code), label: String(label), secondary: String(secondary) };
        }
        if (opt && typeof opt === "object") {
          return { value: String(opt.value ?? opt.code ?? ""), label: String(opt.label ?? opt.name ?? "") };
        }
        return { value: String(opt), label: String(opt) };
      }).filter((x) => x.value);
    }
    return localeOptions;
  }, [languages, localeOptions]);
  const initialPublicInfo = useMemo(() => {
    const pi = (setting == null ? void 0 : setting.public_info) || {};
    return {
      business_areas: !!pi.business_areas,
      work_centers: !!pi.work_centers,
      cost_centers: !!pi.cost_centers,
      orders_production_forecasts: !!pi.orders_production_forecasts,
      projects_required: !!pi.projects_required,
      accounting_method: pi.accounting_method ?? ""
    };
  }, [setting]);
  const { data, setData, processing, errors, setError } = useForm({
    currency_id: (setting == null ? void 0 : setting.currency_id) ? String(setting.currency_id) : "",
    language: (setting == null ? void 0 : setting.language) ?? "",
    customers_management: !!(setting == null ? void 0 : setting.customers_management),
    providers_management: !!(setting == null ? void 0 : setting.providers_management),
    validate_nif: !!(setting == null ? void 0 : setting.validate_nif),
    require_2fa: !!(setting == null ? void 0 : setting.require_2fa),
    primary_color: (setting == null ? void 0 : setting.primary_color) ?? "",
    secondary_color: (setting == null ? void 0 : setting.secondary_color) ?? "",
    base_color_budgets: (setting == null ? void 0 : setting.base_color_budgets) ?? "#10172c",
    base_color_orders: (setting == null ? void 0 : setting.base_color_orders) ?? "#10172c",
    base_color_invoices: (setting == null ? void 0 : setting.base_color_invoices) ?? "#f8b96e",
    iva: (setting == null ? void 0 : setting.iva) ?? "",
    ip: (setting == null ? void 0 : setting.ip) ?? "",
    emails: Array.isArray(setting == null ? void 0 : setting.emails) ? setting.emails : (setting == null ? void 0 : setting.emails) ? setting.emails : [],
    public_catalogue: !!(setting == null ? void 0 : setting.public_catalogue),
    accounting_account_digits: (setting == null ? void 0 : setting.accounting_account_digits) ?? 11,
    pattern_budgets: !!(setting == null ? void 0 : setting.pattern_budgets),
    pattern_sales: !!(setting == null ? void 0 : setting.pattern_sales),
    pattern_purchases: !!(setting == null ? void 0 : setting.pattern_purchases),
    pattern_deliveries: !!(setting == null ? void 0 : setting.pattern_deliveries),
    pattern_projects: !!(setting == null ? void 0 : setting.pattern_projects),
    pattern_invoices: !!(setting == null ? void 0 : setting.pattern_invoices),
    public_info: initialPublicInfo
  });
  const [submitting, setSubmitting] = useState(false);
  const actions = [];
  const addEmail = () => setData("emails", [...data.emails || [], ""]);
  const updateEmail = (idx, value) => {
    const next = [...data.emails || []];
    next[idx] = value;
    setData("emails", next);
  };
  const removeEmail = (idx) => {
    const next = [...data.emails || []];
    next.splice(idx, 1);
    setData("emails", next);
  };
  function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    const payload = {
      ...data,
      emails: (data.emails || []).map((e2) => String(e2 || "").trim()).filter(Boolean)
    };
    router.put(route("company-settings.update"), payload, {
      preserveScroll: true,
      onError: (errBag) => setError(errBag),
      onFinish: () => setSubmitting(false)
    });
  }
  return /* @__PURE__ */ jsxs(
    AdminAuthenticated,
    {
      user: auth.user,
      title,
      subtitle,
      actions,
      children: [
        /* @__PURE__ */ jsx(Head, { title }),
        /* @__PURE__ */ jsxs("div", { className: "contents pb-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "row", children: [
            /* @__PURE__ */ jsx("div", { className: "col-12", children: /* @__PURE__ */ jsxs("h2", { children: [
              __("configuracion"),
              " ",
              /* @__PURE__ */ jsx("u", { children: company.name })
            ] }) }),
            /* @__PURE__ */ jsxs("div", { className: "col-12 mt-2 mb-4", children: [
              /* @__PURE__ */ jsxs("span", { className: "text-muted me-5", children: [
                __("creado"),
                ": ",
                /* @__PURE__ */ jsx("strong", { children: setting.formatted_created_at })
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "text-muted me-5", children: [
                __("actualizado"),
                ": ",
                /* @__PURE__ */ jsx("strong", { children: setting.formatted_updated_at })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
            /* @__PURE__ */ jsx("div", { className: "col-12 text-warning", children: __("empresa_configuracion_texto") }),
            /* @__PURE__ */ jsxs("div", { className: "row gy-3 my-3", children: [
              /* @__PURE__ */ jsx("div", { className: "col-lg-6 col-xl-4", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "customers_management", className: "form-label", children: __("clientes_gestion") }),
                /* @__PURE__ */ jsxs("div", { className: "pt-1 position-relative", children: [
                  /* @__PURE__ */ jsx(
                    Checkbox,
                    {
                      className: "xl",
                      name: "customers_management",
                      checked: data.customers_management,
                      onChange: (e) => setData("customers_management", e.target.checked)
                    }
                  ),
                  /* @__PURE__ */ jsx("span", { className: "ms-3 pt-5 text-warning", children: __("clientes_gestion_texto") })
                ] }),
                /* @__PURE__ */ jsx(InputError, { message: errors.customers_management })
              ] }) }),
              /* @__PURE__ */ jsx("div", { className: "col-lg-6 col-xl-4", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "providers_management", className: "form-label", children: __("proveedores_gestion") }),
                /* @__PURE__ */ jsxs("div", { className: "pt-1 position-relative", children: [
                  /* @__PURE__ */ jsx(
                    Checkbox,
                    {
                      className: "xl",
                      name: "providers_management",
                      checked: data.providers_management,
                      onChange: (e) => setData("providers_management", e.target.checked)
                    }
                  ),
                  /* @__PURE__ */ jsx("span", { className: "ms-3 pt-5 text-warning", children: __("proveedores_gestion_texto") })
                ] }),
                /* @__PURE__ */ jsx(InputError, { message: errors.providers_management })
              ] }) })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "row gy-3 my-3", children: [
              /* @__PURE__ */ jsx("div", { className: "col-lg-6 col-xl-4", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "validate_nif", className: "form-label", children: __("nif_validacion") }),
                /* @__PURE__ */ jsxs("div", { className: "pt-1 position-relative", children: [
                  /* @__PURE__ */ jsx(
                    Checkbox,
                    {
                      className: "xl",
                      name: "validate_nif",
                      checked: data.validate_nif,
                      onChange: (e) => setData("validate_nif", e.target.checked)
                    }
                  ),
                  /* @__PURE__ */ jsx("span", { className: "ms-3 pt-5 text-warning", children: __("nif_validacion_texto") })
                ] }),
                /* @__PURE__ */ jsx(InputError, { message: errors.validate_nif })
              ] }) }),
              /* @__PURE__ */ jsx("div", { className: "col-lg-6 col-xl-4", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "require_2fa", className: "form-label", children: __("validacion_doble") }),
                /* @__PURE__ */ jsxs("div", { className: "pt-1 position-relative", children: [
                  /* @__PURE__ */ jsx(
                    Checkbox,
                    {
                      className: "xl",
                      name: "require_2fa",
                      checked: data.require_2fa,
                      onChange: (e) => setData("require_2fa", e.target.checked)
                    }
                  ),
                  /* @__PURE__ */ jsx("span", { className: "ms-3 pt-5 text-warning", children: __("validacion_doble_texto") })
                ] }),
                /* @__PURE__ */ jsx(InputError, { message: errors.require_2fa })
              ] }) })
            ] }),
            /* @__PURE__ */ jsx("hr", { className: "my-4" }),
            /* @__PURE__ */ jsxs("div", { className: "row gy-3 mb-3", children: [
              /* @__PURE__ */ jsx("div", { className: "col-md-4", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "currency_id", className: "form-label", children: __("moneda") }),
                /* @__PURE__ */ jsxs(
                  SelectInput,
                  {
                    className: "form-select",
                    name: "currency_id",
                    value: data.currency_id,
                    onChange: (e) => setData("currency_id", e.target.value),
                    children: [
                      /* @__PURE__ */ jsx("option", { value: "", children: __("opcion_selec") }),
                      currencyOptions.map((opt) => /* @__PURE__ */ jsx("option", { value: opt.value, children: opt.label }, opt.value))
                    ]
                  }
                ),
                /* @__PURE__ */ jsx(InputError, { message: errors.currency_id })
              ] }) }),
              /* @__PURE__ */ jsx("div", { className: "col-md-4", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "language", className: "form-label", children: __("idioma") }),
                /* @__PURE__ */ jsxs(
                  SelectInput,
                  {
                    className: "form-select",
                    name: "language",
                    value: data.language || "",
                    onChange: (e) => setData("language", e.target.value),
                    children: [
                      /* @__PURE__ */ jsx("option", { value: "", children: __("opcion_selec") }),
                      languageOptions.map((opt) => /* @__PURE__ */ jsxs("option", { value: opt.value, children: [
                        opt.label,
                        opt.secondary ? ` (${opt.secondary})` : null
                      ] }, opt.value))
                    ]
                  }
                ),
                /* @__PURE__ */ jsx(InputError, { message: errors.language })
              ] }) })
            ] }),
            /* @__PURE__ */ jsx("hr", { className: "my-4" }),
            /* @__PURE__ */ jsxs("div", { className: "row gy-3 mb-3", children: [
              /* @__PURE__ */ jsx("div", { className: "col-12 fw-semibold mt-4", children: __("emails_corporativos") }),
              /* @__PURE__ */ jsx("div", { className: "col-md-6 col-lg-6 col-xl-6", children: /* @__PURE__ */ jsx("div", { className: "position-relative", children: /* @__PURE__ */ jsxs("div", { className: "d-flex align-items-start gap-3", children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    className: "btn btn-warning rounded-circle d-flex align-items-center justify-content-center",
                    style: { width: 38, height: 38, fontWeight: 800, lineHeight: "38px" },
                    onClick: addEmail,
                    title: __("añadir"),
                    children: /* @__PURE__ */ jsx("i", { className: "la la-plus" })
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "flex-grow-1", children: [
                  (data.emails || []).length === 0 ? /* @__PURE__ */ jsx("div", { className: "text-muted small pt-2", children: __("emails_no_registrados") }) : null,
                  (data.emails || []).map((email, idx) => /* @__PURE__ */ jsxs("div", { className: "d-flex align-items-center gap-2 mb-2", children: [
                    /* @__PURE__ */ jsx("div", { className: "flex-grow-1", children: /* @__PURE__ */ jsx(
                      TextInput,
                      {
                        name: `email_${idx}`,
                        type: "email",
                        value: email ?? "",
                        onChange: (e) => updateEmail(idx, e.target.value),
                        placeholder: "mail@empresa.com",
                        maxLength: 255
                      }
                    ) }),
                    /* @__PURE__ */ jsx(
                      "button",
                      {
                        type: "button",
                        className: "btn btn-light rounded-circle",
                        style: { width: 38, height: 38, border: "1px solid #eee" },
                        onClick: () => removeEmail(idx),
                        title: __("Eliminar"),
                        children: /* @__PURE__ */ jsx("span", { style: { color: "#dc3545", fontWeight: 800 }, children: "×" })
                      }
                    )
                  ] }, idx)),
                  /* @__PURE__ */ jsx(InputError, { message: errors.emails })
                ] })
              ] }) }) })
            ] }),
            /* @__PURE__ */ jsx("hr", { className: "my-4" }),
            /* @__PURE__ */ jsxs("div", { className: "row gy-3 my-3", children: [
              /* @__PURE__ */ jsx("div", { className: "col-12 fw-semibold", children: __("colores") }),
              /* @__PURE__ */ jsx("div", { className: "col-md-4", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "primary_color", className: "form-label", children: __("color_principal") }),
                /* @__PURE__ */ jsx(
                  ColorPicker,
                  {
                    color: data.primary_color,
                    onChange: (e) => setData("primary_color", e.target.value),
                    name: "primary_color"
                  }
                ),
                /* @__PURE__ */ jsx(InfoPopover, { code: "company-color" }),
                /* @__PURE__ */ jsx(InputError, { message: errors.primary_color })
              ] }) }),
              /* @__PURE__ */ jsx("div", { className: "col-md-4", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "secondary_color", className: "form-label", children: __("color_secundario") }),
                /* @__PURE__ */ jsx(
                  ColorPicker,
                  {
                    color: data.secondary_color,
                    onChange: (e) => setData("secondary_color", e.target.value),
                    name: "secondary_color"
                  }
                )
              ] }) })
            ] }),
            /* @__PURE__ */ jsx("hr", { className: "my-4" }),
            /* @__PURE__ */ jsxs("div", { className: "row gy-3 my-3", children: [
              /* @__PURE__ */ jsx("div", { className: "col-12", children: /* @__PURE__ */ jsx("span", { className: "fw-semibold", children: __("catalogo") }) }),
              /* @__PURE__ */ jsx("div", { className: "col-lg-6 col-xl-4", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "public_catalogue", className: "form-label", children: __("catalogo_publico") }),
                /* @__PURE__ */ jsxs("div", { className: "pt-1 position-relative", children: [
                  /* @__PURE__ */ jsx(
                    Checkbox,
                    {
                      className: "xl",
                      name: "public_catalogue",
                      checked: data.public_catalogue,
                      onChange: (e) => setData("public_catalogue", e.target.checked)
                    }
                  ),
                  /* @__PURE__ */ jsx("span", { className: "ms-3 pt-5 text-warning", children: __("catalogo_publico_texto") })
                ] }),
                /* @__PURE__ */ jsx(InputError, { message: errors.public_catalogue })
              ] }) })
            ] }),
            /* @__PURE__ */ jsx("hr", { className: "my-4" }),
            /* @__PURE__ */ jsxs("div", { className: "row gy-3 my-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "col-12", children: [
                /* @__PURE__ */ jsxs("span", { className: "fw-semibold", children: [
                  __("patrones"),
                  "."
                ] }),
                " ",
                /* @__PURE__ */ jsx("span", { className: "text-warning", children: __("patrones_configuracion_texto") })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "col-lg-6 col-xl-4", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "pattern_budgets", className: "form-label", children: __("presupuestos") }),
                /* @__PURE__ */ jsx("div", { className: "pt-1 position-relative", children: /* @__PURE__ */ jsx(
                  Checkbox,
                  {
                    className: "xl",
                    id: "pattern_budgets",
                    name: "pattern_budgets",
                    checked: data.pattern_budgets,
                    onChange: (e) => setData("pattern_budgets", e.target.checked)
                  }
                ) })
              ] }) }),
              /* @__PURE__ */ jsx("div", { className: "col-lg-6 col-xl-4", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "pattern_sales", className: "form-label", children: __("Pedidos de venta") }),
                /* @__PURE__ */ jsx("div", { className: "pt-1 position-relative", children: /* @__PURE__ */ jsx(
                  Checkbox,
                  {
                    className: "xl",
                    id: "pattern_sales",
                    name: "pattern_sales",
                    checked: data.pattern_sales,
                    onChange: (e) => setData("pattern_sales", e.target.checked)
                  }
                ) })
              ] }) }),
              /* @__PURE__ */ jsx("div", { className: "col-lg-6 col-xl-4", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "pattern_purchases", className: "form-label", children: __("Pedidos de compra") }),
                /* @__PURE__ */ jsx("div", { className: "pt-1 position-relative", children: /* @__PURE__ */ jsx(
                  Checkbox,
                  {
                    className: "xl",
                    id: "pattern_purchases",
                    name: "pattern_purchases",
                    checked: data.pattern_purchases,
                    onChange: (e) => setData("pattern_purchases", e.target.checked)
                  }
                ) })
              ] }) }),
              /* @__PURE__ */ jsx("div", { className: "col-lg-6 col-xl-4", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "pattern_deliveries", className: "form-label", children: __("Albaranes") }),
                /* @__PURE__ */ jsx("div", { className: "pt-1 position-relative", children: /* @__PURE__ */ jsx(
                  Checkbox,
                  {
                    className: "xl",
                    id: "pattern_deliveries",
                    name: "pattern_deliveries",
                    checked: data.pattern_deliveries,
                    onChange: (e) => setData("pattern_deliveries", e.target.checked)
                  }
                ) })
              ] }) }),
              /* @__PURE__ */ jsx("div", { className: "col-lg-6 col-xl-4", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "pattern_projects", className: "form-label", children: __("Proyectos") }),
                /* @__PURE__ */ jsx("div", { className: "pt-1 position-relative", children: /* @__PURE__ */ jsx(
                  Checkbox,
                  {
                    className: "xl",
                    id: "pattern_projects",
                    name: "pattern_projects",
                    checked: data.pattern_projects,
                    onChange: (e) => setData("pattern_projects", e.target.checked)
                  }
                ) })
              ] }) }),
              /* @__PURE__ */ jsx("div", { className: "col-lg-6 col-xl-4", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "pattern_invoices", className: "form-label", children: __("Facturas") }),
                /* @__PURE__ */ jsx("div", { className: "pt-1 position-relative", children: /* @__PURE__ */ jsx(
                  Checkbox,
                  {
                    className: "xl",
                    id: "pattern_invoices",
                    name: "pattern_invoices",
                    checked: data.pattern_invoices,
                    onChange: (e) => setData("pattern_invoices", e.target.checked)
                  }
                ) })
              ] }) })
            ] }),
            /* @__PURE__ */ jsx("hr", { className: "my-4" }),
            /* @__PURE__ */ jsxs("div", { className: "row gy-3 my-3", children: [
              /* @__PURE__ */ jsxs("div", { className: "col-12 fw-semibold", children: [
                __("contabilidad"),
                " ",
                /* @__PURE__ */ jsx("span", { className: "text-warning" })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "col-md-4 col-lg-2", children: [
                /* @__PURE__ */ jsx("label", { className: "form-label text-muted small mb-1", children: __("cuentas_contables_digitos") }),
                /* @__PURE__ */ jsx(
                  TextInput,
                  {
                    name: "accounting_account_digits",
                    type: "number",
                    min: "1",
                    max: "30",
                    className: "text-end",
                    value: data.accounting_account_digits,
                    onChange: (e) => setData("accounting_account_digits", e.target.value)
                  }
                ),
                /* @__PURE__ */ jsx(InputError, { message: errors.accounting_account_digits })
              ] })
            ] }),
            /* @__PURE__ */ jsx("hr", { className: "my-4" }),
            /* @__PURE__ */ jsx("div", { className: "mt-0 text-end", children: /* @__PURE__ */ jsx(
              PrimaryButton,
              {
                loading: submitting || processing,
                loadingText: __("guardando"),
                className: "btn btn-rdn",
                children: __("guardar")
              }
            ) })
          ] })
        ] })
      ]
    }
  );
}
export {
  Index as default
};
