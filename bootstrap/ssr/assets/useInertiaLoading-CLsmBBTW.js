import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useMemo, useState, useEffect } from "react";
import { usePage, router } from "@inertiajs/react";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import { F as FormDatePickerInput, t as toLocalYmd } from "./DatePickerToForm-BNatYC8y.js";
import { C as Checkbox } from "./Checkbox-C9HPJULq.js";
import { L as LocationSelects } from "./LocationSelects-B4vI2QcJ.js";
import { R as ReusableModal } from "./ModalTemplate-BiHkGcpB.js";
import { S as SelectSearch } from "./SelectSearch-x7o6yKJV.js";
import { T as TextInput } from "./TextInput-CzxrbIpp.js";
import { U as UserSearch } from "./UserSearch-Bn5gVs5d.js";
import { Y as YearSelect } from "./YearSelect-CdvirGha.js";
const cleanParams$1 = (obj) => {
  const out = {};
  Object.entries(obj || {}).forEach(([k, v]) => {
    if (v === null || v === void 0) return;
    if (typeof v === "string" && v.trim() === "") return;
    if (Array.isArray(v)) {
      const arr = v.filter((x) => !(x === null || x === void 0 || typeof x === "string" && x.trim() === ""));
      if (arr.length === 0) return;
      out[k] = arr;
      return;
    }
    if (typeof v === "object") {
      const nested = cleanParams$1(v);
      if (Object.keys(nested).length === 0) return;
      out[k] = nested;
      return;
    }
    out[k] = v;
  });
  return out;
};
function ActiveFiltersLegend({
  items = [],
  routeName,
  routeParams = {},
  queryParams: queryParamsProp
}) {
  const __ = useTranslation();
  const { props } = usePage();
  const queryParams = typeof queryParamsProp === "object" && queryParamsProp !== null ? queryParamsProp : props.queryParams || {};
  if (!Array.isArray(items) || items.length === 0) return null;
  const removeFilter = (item) => {
    if (!item || typeof item !== "object") return;
    const next = { ...queryParams, page: 1 };
    if (item.scope === "adhoc") {
      const adhoc = { ...next.adhoc || {} };
      const paths = Array.isArray(item.clearPaths) && item.clearPaths.length ? item.clearPaths : [item.path];
      paths.forEach((p) => {
        delete adhoc[p];
      });
      if (Object.keys(cleanParams$1(adhoc)).length === 0) delete next.adhoc;
      else next.adhoc = adhoc;
    } else {
      delete next[item.path];
    }
    router.get(route(routeName, routeParams), cleanParams$1(next), {
      preserveState: true,
      replace: true
    });
  };
  return /* @__PURE__ */ jsxs("div", { className: "d-flex flex-wrap gap-2 align-items-center", children: [
    /* @__PURE__ */ jsxs("span", { children: [
      __("filtrado_por"),
      ":"
    ] }),
    items.map((it) => /* @__PURE__ */ jsxs(
      "span",
      {
        className: "badge text-bg-light border d-inline-flex align-items-center gap-2",
        children: [
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsxs("strong", { className: "me-1", children: [
              it.label,
              ":"
            ] }),
            it.value
          ] }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "btn btn-sm p-0 border-0 bg-transparent",
              onClick: () => removeFilter(it),
              "aria-label": __("filtro_eliminar") ?? "Eliminar filtro",
              title: __("filtro_eliminar") ?? "Eliminar filtro",
              style: { lineHeight: 1 },
              children: /* @__PURE__ */ jsx("span", { "aria-hidden": "true", children: "×" })
            }
          )
        ]
      },
      it.key
    ))
  ] });
}
const EMPTY_ARR = Object.freeze([]);
const EMPTY_OBJ = Object.freeze({});
const cleanParams = (obj) => {
  const out = {};
  Object.entries(obj || {}).forEach(([k, v]) => {
    if (v === null || v === void 0) return;
    if (typeof v === "string" && v.trim() === "") return;
    if (Array.isArray(v)) {
      const arr = v.filter(
        (x) => !(x === null || x === void 0 || typeof x === "string" && x.trim() === "")
      );
      if (arr.length === 0) return;
      out[k] = arr;
      return;
    }
    if (typeof v === "object") {
      const nested = cleanParams(v);
      if (Object.keys(nested).length === 0) return;
      out[k] = nested;
      return;
    }
    out[k] = v;
  });
  return out;
};
function AdHocFiltersDropdown({
  filters = [],
  routeName,
  routeParams = {},
  queryParams = EMPTY_OBJ
}) {
  var _a, _b;
  const __ = useTranslation();
  const { props } = usePage();
  const locale = props.locale || false;
  const datepickerFormat = ((_b = (_a = props.languages) == null ? void 0 : _a[locale]) == null ? void 0 : _b[6]) || "dd/MM/yyyy";
  const enabled = Array.isArray(filters) && filters.length > 0;
  const stableQueryParams = queryParams && typeof queryParams === "object" ? queryParams : EMPTY_OBJ;
  const initialAdhoc = useMemo(() => {
    const adh = stableQueryParams.adhoc;
    return adh && typeof adh === "object" ? adh : EMPTY_OBJ;
  }, [stableQueryParams]);
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(initialAdhoc);
  const [processing, setProcessing] = useState(false);
  useEffect(() => {
    if (open) setValues(initialAdhoc);
  }, [open, initialAdhoc]);
  const activeCount = useMemo(() => {
    const source = open ? values : initialAdhoc;
    const v = cleanParams(source);
    return Object.keys(v).length;
  }, [open, values, initialAdhoc]);
  if (!enabled) return null;
  const qp = useMemo(() => {
    const candidate = queryParams ?? props.queryParams ?? EMPTY_OBJ;
    return candidate && typeof candidate === "object" ? candidate : EMPTY_OBJ;
  }, [queryParams, props.queryParams]);
  useEffect(() => {
    if (!open) return;
    setValues((prev) => {
      if (prev === initialAdhoc) return prev;
      return initialAdhoc;
    });
  }, [open, initialAdhoc]);
  const setValue = (key, v) => {
    setValues((prev) => ({ ...prev, [key]: v }));
  };
  const adhocPayload = { ...values };
  Object.keys(adhocPayload).forEach((k) => {
    const v = adhocPayload[k];
    if (v && typeof v === "object" && Object.prototype.hasOwnProperty.call(v, "id")) {
      adhocPayload[k] = v.id;
    }
  });
  const apply = () => {
    const merged = {
      ...qp,
      page: 1,
      adhoc: cleanParams(adhocPayload)
    };
    if (Object.keys(merged.adhoc || {}).length === 0) {
      delete merged.adhoc;
    }
    router.get(route(routeName, routeParams), cleanParams(merged), {
      preserveState: true,
      replace: true,
      onStart: () => setProcessing(true),
      onFinish: () => setProcessing(false)
    });
    setOpen(false);
  };
  const clearAll = () => {
    const merged = { ...qp, page: 1 };
    delete merged.adhoc;
    setValues(EMPTY_OBJ);
    router.get(route(routeName, routeParams), cleanParams(merged), {
      preserveState: true,
      replace: true,
      onStart: () => setProcessing(true),
      onFinish: () => setProcessing(false)
    });
    setOpen(false);
  };
  const renderField = (f) => {
    const key = f.key;
    const type = f.type;
    if (type === "checkbox") {
      return /* @__PURE__ */ jsxs("div", { className: "form-check mt-2", children: [
        /* @__PURE__ */ jsx(
          Checkbox,
          {
            checked: !!values[key],
            onChange: (e) => setValue(key, e.target.checked ? 1 : 0)
          }
        ),
        /* @__PURE__ */ jsx("label", { className: "form-check-label ms-2", children: f.label })
      ] });
    }
    if (type === "text") {
      return /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("label", { className: "form-label", children: f.label }),
        /* @__PURE__ */ jsx(
          TextInput,
          {
            className: "form-control",
            value: values[key] ?? "",
            onChange: (e) => setValue(key, e.target.value),
            placeholder: f.placeholder || ""
          }
        )
      ] });
    }
    if (type === "select") {
      const multiple = !!f.multiple;
      const options = f.options || [];
      const raw = values[key];
      const computeSelected = () => {
        if (multiple) {
          const arr = Array.isArray(raw) ? raw.map(String) : [];
          return options.filter((o) => arr.includes(String(o.value)));
        }
        const val = raw && typeof raw === "object" ? raw.value : raw;
        return options.find((o) => String(o.value) === String(val)) || null;
      };
      const selected = computeSelected();
      const onChange = (v) => {
        if (multiple) {
          const ids = Array.isArray(v) ? v.map((x) => x == null ? void 0 : x.value).filter((x) => x !== null && x !== void 0 && String(x).trim() !== "") : [];
          setValue(key, ids);
        } else {
          setValue(key, (v == null ? void 0 : v.value) ?? "");
        }
      };
      return /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("label", { className: "form-label", children: f.label }),
        /* @__PURE__ */ jsx(
          SelectSearch,
          {
            options,
            value: selected,
            onChange,
            isMulti: multiple,
            placeholder: ""
          }
        )
      ] });
    }
    if (type === "daterange") {
      const current = values[key] && typeof values[key] === "object" ? values[key] : {};
      const onDateChange = (field, date) => {
        setValue(key, {
          ...current,
          [field]: date ? toLocalYmd(date) : null
        });
      };
      return /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("label", { className: "form-label", children: f.label }),
        /* @__PURE__ */ jsxs("div", { className: "row g-2", children: [
          /* @__PURE__ */ jsx("div", { className: "col-12 col-md-6", children: /* @__PURE__ */ jsx(
            FormDatePickerInput,
            {
              name: "from",
              selected: current.from ?? null,
              dateFormat: datepickerFormat,
              onChange: onDateChange,
              placeholder: __("desde")
            }
          ) }),
          /* @__PURE__ */ jsx("div", { className: "col-12 col-md-6", children: /* @__PURE__ */ jsx(
            FormDatePickerInput,
            {
              name: "to",
              selected: current.to ?? null,
              dateFormat: datepickerFormat,
              onChange: onDateChange,
              placeholder: __("hasta"),
              maxDate: null
            }
          ) })
        ] })
      ] });
    }
    if (type === "location_selects") {
      const countryKey = f.countryKey || "country_id";
      const provinceKey = f.provinceKey || "province_id";
      const townKey = f.townKey || "town_id";
      const cpKey = f.cpKey || "cp";
      const setData = (field, value) => setValue(field, value);
      const countries = f.countries || props.countries || EMPTY_ARR;
      return /* @__PURE__ */ jsx("div", { className: "row g-0", children: /* @__PURE__ */ jsxs("div", { className: "col-12", children: [
        /* @__PURE__ */ jsx("label", { className: "form-label", children: f.label }),
        /* @__PURE__ */ jsx("div", { className: "adhoc-location-wrap", children: /* @__PURE__ */ jsx(
          LocationSelects,
          {
            countries,
            formData: values,
            setData,
            countryField: countryKey,
            provinceField: provinceKey,
            townField: townKey,
            layout: "split2x2",
            labels: {
              country: __("pais") ?? "País",
              province: __("provincia") ?? "Provincia",
              town: __("poblacion") ?? "Población"
            },
            extraRight: /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { className: "form-label", children: __("cp") ?? "Código Postal" }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  className: "form-control",
                  value: values[cpKey] ?? "",
                  onChange: (e) => setValue(cpKey, e.target.value),
                  placeholder: "",
                  maxLength: 5
                }
              )
            ] })
          }
        ) })
      ] }) });
    }
    if (type === "year_select") {
      const minYear = f.minYear ?? 2e3;
      const maxYear = f.maxYear ?? (/* @__PURE__ */ new Date()).getFullYear();
      const raw = values[key];
      const value = raw !== null && raw !== void 0 && raw !== "" ? String(raw) : "";
      return /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("label", { className: "form-label", children: f.label }),
        /* @__PURE__ */ jsx(
          YearSelect,
          {
            minYear,
            maxYear,
            value,
            onChange: (e) => setValue(key, e.target.value ? parseInt(e.target.value, 10) : ""),
            placeholder: f.placeholder ?? __("opcion_selec"),
            className: "form-select"
          }
        )
      ] });
    }
    if (type === "user_search") {
      const raw = values[key] ?? null;
      return /* @__PURE__ */ jsx(Fragment, { children: /* @__PURE__ */ jsx(
        UserSearch,
        {
          label: f.label,
          name: null,
          value: raw && typeof raw === "object" ? raw : null,
          onChange: (u) => {
            setValue(key, u ? u.id : null);
          },
          searchUrl: f.searchUrl,
          placeholder: f.placeholder || "",
          disabled: !!f.disabled,
          minLength: f.minLength ?? 2,
          limit: f.limit ?? 10,
          extraParams: f.extraParams ?? null,
          allowClear: true
        }
      ) });
    }
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("label", { className: "form-label", children: f.label }),
      /* @__PURE__ */ jsx(
        TextInput,
        {
          className: "form-control",
          value: values[key] ?? "",
          onChange: (u) => {
            setValue(key, u ? { id: u.id, name: u.name, email: u.email } : null);
          }
        }
      )
    ] });
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        className: "btn btn-light ms-2",
        onClick: () => setOpen(true),
        children: [
          __("filtros_avanzados"),
          activeCount > 0 ? /* @__PURE__ */ jsx("span", { className: "badge text-bg-secondary ms-2", children: activeCount }) : null
        ]
      }
    ),
    /* @__PURE__ */ jsx(
      ReusableModal,
      {
        show: open,
        onClose: () => setOpen(false),
        onConfirm: apply,
        title: __("filtros_avanzados") ?? __("Filtros avanzados"),
        confirmText: __("aplicar") ?? __("Aplicar"),
        cancelText: __("cancelar") ?? __("Cancelar"),
        dialogClassName: "modal-dialog-centered modal-xl modal-dialog-scrollable modal-superwide",
        confirmDisabled: processing,
        confirmLoading: processing,
        footerLeft: /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            className: "btn btn-outline-danger",
            onClick: clearAll,
            children: __("limpiar") ?? __("Limpiar")
          }
        ),
        children: /* @__PURE__ */ jsx("div", { className: "container-fluid adhoc-filters-modal", children: /* @__PURE__ */ jsx("div", { className: "row g-4", children: filters.map((f) => {
          const colClass = f.colClass || "col-12 col-md-6 col-xl-4";
          return /* @__PURE__ */ jsx("div", { className: colClass, children: renderField(f) }, f.key);
        }) }) })
      }
    )
  ] });
}
function SpinnerInline({ text = null }) {
  return /* @__PURE__ */ jsxs("span", { className: "d-inline-flex align-items-center gap-2", children: [
    /* @__PURE__ */ jsx("span", { className: "spinner-border spinner-border-sm", role: "status", "aria-hidden": "true" }),
    text ? /* @__PURE__ */ jsx("span", { children: text }) : null
  ] });
}
function useInertiaLoading({ initial = false } = {}) {
  const [loading, setLoading] = useState(!!initial);
  useEffect(() => {
    const removeStart = router.on("start", () => setLoading(true));
    const removeFinish = router.on("finish", () => setLoading(false));
    return () => {
      if (typeof removeStart === "function") removeStart();
      if (typeof removeFinish === "function") removeFinish();
    };
  }, []);
  return { loading };
}
export {
  AdHocFiltersDropdown as A,
  SpinnerInline as S,
  ActiveFiltersLegend as a,
  useInertiaLoading as u
};
