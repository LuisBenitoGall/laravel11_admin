import { jsxs, jsx } from "react/jsx-runtime";
import { useMemo, useEffect } from "react";
import { usePage, useForm } from "@inertiajs/react";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import { T as TextInput } from "./TextInput-CzxrbIpp.js";
import { I as InputError } from "./InputError-DME5vguS.js";
import { P as PrimaryButton } from "./PrimaryButton-CIbKPOjQ.js";
import { C as Checkbox } from "./Checkbox-B7oBdKeZ.js";
function CrmAccountAddressTab({
  account,
  countries = [],
  currencies = []
}) {
  const __ = useTranslation();
  const { url } = usePage();
  const countryOptions = useMemo(() => {
    return countries.map((c) => ({
      code: c.code || c.id,
      name: c.name
    })).filter((c) => c.code && c.name);
  }, [countries]);
  const currencyOptions = useMemo(() => {
    return currencies.map((c) => ({
      id: c.id,
      label: c.code ? `${c.code}${c.symbol ? ` (${c.symbol})` : ""}` : c.name || c.id
    }));
  }, [currencies]);
  const { data, setData, put, processing, errors } = useForm({
    website: account.website || "",
    currency_id: account.currency_id || "",
    // Billing
    billing_street: account.billing_street || "",
    billing_city: account.billing_city || "",
    billing_state: account.billing_state || "",
    billing_postal_code: account.billing_postal_code || "",
    billing_country_code: account.billing_country_code || "",
    // Shipping
    shipping_street: account.shipping_street || "",
    shipping_city: account.shipping_city || "",
    shipping_state: account.shipping_state || "",
    shipping_postal_code: account.shipping_postal_code || "",
    shipping_country_code: account.shipping_country_code || "",
    // UI only
    copy_billing_to_shipping: false
  });
  useEffect(() => {
    if (data.copy_billing_to_shipping) {
      setData("shipping_street", data.billing_street || "");
      setData("shipping_city", data.billing_city || "");
      setData("shipping_state", data.billing_state || "");
      setData("shipping_postal_code", data.billing_postal_code || "");
      setData("shipping_country_code", data.billing_country_code || "");
    } else {
      setData("shipping_street", "");
      setData("shipping_city", "");
      setData("shipping_state", "");
      setData("shipping_postal_code", "");
      setData("shipping_country_code", "");
    }
  }, [data.copy_billing_to_shipping, data.billing_street, data.billing_city, data.billing_state, data.billing_postal_code, data.billing_country_code]);
  const onSubmit = (e) => {
    e.preventDefault();
    let payload = { ...data };
    if (payload.copy_billing_to_shipping) {
      payload.shipping_street = payload.billing_street;
      payload.shipping_city = payload.billing_city;
      payload.shipping_state = payload.billing_state;
      payload.shipping_postal_code = payload.billing_postal_code;
      payload.shipping_country_code = payload.billing_country_code;
    }
    delete payload.copy_billing_to_shipping;
    put(route("crm-accounts.update", account.id), {
      preserveScroll: true,
      data: payload
    });
  };
  return /* @__PURE__ */ jsxs("form", { onSubmit, className: "mt-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "row g-3 mb-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "col-md-8", children: [
        /* @__PURE__ */ jsx("label", { className: "form-label", children: __("website") }),
        /* @__PURE__ */ jsx(
          TextInput,
          {
            value: data.website,
            onChange: (e) => setData("website", e.target.value),
            placeholder: "https://example.com"
          }
        ),
        /* @__PURE__ */ jsx(InputError, { message: errors.website, className: "mt-1" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "col-md-4", children: [
        /* @__PURE__ */ jsx("label", { className: "form-label", children: __("divisa") }),
        /* @__PURE__ */ jsxs(
          "select",
          {
            value: data.currency_id ?? "",
            onChange: (e) => setData("currency_id", e.target.value),
            className: "form-select",
            children: [
              /* @__PURE__ */ jsx("option", { value: "", children: __("moneda_selec") }),
              currencyOptions.map((opt) => /* @__PURE__ */ jsx("option", { value: opt.id, children: opt.label }, opt.id))
            ]
          }
        ),
        /* @__PURE__ */ jsx(InputError, { message: errors.currency_id, className: "mt-1" })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "card mb-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "card-header fw-semibold", children: [
        __("direccion"),
        " · ",
        __("factura")
      ] }),
      /* @__PURE__ */ jsx("div", { className: "card-body", children: /* @__PURE__ */ jsxs("div", { className: "row g-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "col-12", children: [
          /* @__PURE__ */ jsx("label", { className: "form-label", children: __("direccion") || "Calle" }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              value: data.billing_street,
              onChange: (e) => setData("billing_street", e.target.value),
              maxLength: 150
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors.billing_street, className: "mt-1" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "col-md-6", children: [
          /* @__PURE__ */ jsx("label", { className: "form-label", children: __("poblacion") || "Ciudad" }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              value: data.billing_city,
              onChange: (e) => setData("billing_city", e.target.value),
              maxLength: 100
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors.billing_city, className: "mt-1" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "col-md-3", children: [
          /* @__PURE__ */ jsx("label", { className: "form-label", children: __("provincia") || "Provincia/Estado" }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              value: data.billing_state,
              onChange: (e) => setData("billing_state", e.target.value),
              maxLength: 100
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors.billing_state, className: "mt-1" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "col-md-3", children: [
          /* @__PURE__ */ jsx("label", { className: "form-label", children: __("cp") || "CP" }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              value: data.billing_postal_code,
              onChange: (e) => setData("billing_postal_code", e.target.value),
              maxLength: 5
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors.billing_postal_code, className: "mt-1" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "col-md-4", children: [
          /* @__PURE__ */ jsx("label", { className: "form-label", children: __("pais") || "País" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: data.billing_country_code ?? "",
              onChange: (e) => setData("billing_country_code", e.target.value),
              className: "form-select",
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: __("pais_selec") }),
                countryOptions.map((opt) => /* @__PURE__ */ jsx("option", { value: opt.code, children: opt.name }, opt.code))
              ]
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors.billing_country_code, className: "mt-1" })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "card mb-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "card-header d-flex align-items-center justify-content-between", children: [
        /* @__PURE__ */ jsxs("span", { className: "fw-semibold", children: [
          __("direccion"),
          " · ",
          __("envios") || "Envío"
        ] }),
        /* @__PURE__ */ jsxs("label", { className: "d-flex align-items-center gap-2 m-0", children: [
          /* @__PURE__ */ jsx(
            Checkbox,
            {
              checked: data.copy_billing_to_shipping,
              onChange: (e) => setData("copy_billing_to_shipping", e.target.checked)
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "small text-muted", children: __("copiar") || "Copiar facturación a envío" })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "card-body", children: /* @__PURE__ */ jsxs("div", { className: "row g-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "col-12", children: [
          /* @__PURE__ */ jsx("label", { className: "form-label", children: __("direccion_envio") || "Calle" }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              value: data.shipping_street,
              onChange: (e) => setData("shipping_street", e.target.value),
              maxLength: 255
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors.shipping_street, className: "mt-1" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "col-md-6", children: [
          /* @__PURE__ */ jsx("label", { className: "form-label", children: __("poblacion") || "Ciudad" }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              value: data.shipping_city,
              onChange: (e) => setData("shipping_city", e.target.value),
              maxLength: 100
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors.shipping_city, className: "mt-1" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "col-md-3", children: [
          /* @__PURE__ */ jsx("label", { className: "form-label", children: __("provincia") || "Provincia/Estado" }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              value: data.shipping_state,
              onChange: (e) => setData("shipping_state", e.target.value),
              maxLength: 100
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors.shipping_state, className: "mt-1" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "col-md-3", children: [
          /* @__PURE__ */ jsx("label", { className: "form-label", children: __("cp") || "CP" }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              value: data.shipping_postal_code,
              onChange: (e) => setData("shipping_postal_code", e.target.value),
              maxLength: 5
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors.shipping_postal_code, className: "mt-1" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "col-md-4", children: [
          /* @__PURE__ */ jsx("label", { className: "form-label", children: __("pais") || "País" }),
          /* @__PURE__ */ jsxs(
            "select",
            {
              value: data.shipping_country_code ?? "",
              onChange: (e) => setData("shipping_country_code", e.target.value),
              className: "form-select",
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: __("pais_selec") }),
                countryOptions.map((opt) => /* @__PURE__ */ jsx("option", { value: opt.code, children: opt.name }, opt.code))
              ]
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors.shipping_country_code, className: "mt-1" })
        ] })
      ] }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "d-flex justify-content-end gap-2", children: /* @__PURE__ */ jsx(PrimaryButton, { type: "submit", disabled: processing, children: processing ? __("guardando") : __("guardar") }) })
  ] });
}
export {
  CrmAccountAddressTab as default
};
