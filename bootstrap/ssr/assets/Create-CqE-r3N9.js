import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-CS968Wx3.js";
import { usePage, useForm, Head } from "@inertiajs/react";
import "react-tooltip";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { C as Checkbox } from "./Checkbox-B7oBdKeZ.js";
import { I as InputError } from "./InputError-DME5vguS.js";
import { P as PrimaryButton } from "./PrimaryButton-B91ets3U.js";
import { S as SelectSearch } from "./SelectSearch-C7ksrTDE.js";
import { T as Textarea } from "./Textarea-nvTyMSx8.js";
import { T as TextInput } from "./TextInput-CzxrbIpp.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import "@inertiajs/inertia";
import "./Header-Px-6ZOXw.js";
import "react-bootstrap";
import "./useSweetAlert-D4PAsWYN.js";
import "sweetalert2";
import "./Sidebar-CypaLfnr.js";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
import "react-select";
import "react-draft-wysiwyg";
import "draft-js";
import "html-to-draftjs";
import "draftjs-to-html";
/* empty css                             */
function Index({ auth, session, title, subtitle, types, natureOptions, parentOptions, currencies, availableLocales }) {
  var _a;
  const __ = useTranslation();
  const props = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  const permissions = props.permissions || {};
  const { data, setData, post, reset, errors, processing } = useForm({
    name: "",
    nature: null,
    status: true,
    manual_code: "",
    level1: null,
    level2: null,
    level3: null,
    level4: null,
    reconcile: false,
    currency_id: null,
    normal_side: null,
    // 'debit' | 'credit' (calculado, no editable)
    opening_balance: "",
    is_group: false,
    parent_id: null,
    level: null,
    // preview (backend recalcula)
    digits: "",
    notes: ""
  });
  const [level2Options, setLevel2Options] = useState([]);
  const [level3Options, setLevel3Options] = useState([]);
  const [level4Options, setLevel4Options] = useState([]);
  const [parentOpts, setParentOpts] = useState(
    (parentOptions || []).map((p) => ({
      value: p.id,
      label: `${p.code} — ${p.name}`,
      meta: p
      // level, is_group, etc.
    }))
  );
  const [parentLoading, setParentLoading] = useState(false);
  const parentDebounceRef = useRef(null);
  const fetchParentOptions = async (q = "") => {
    try {
      setParentLoading(true);
      const { data: opts } = await axios.get(route("accounting-accounts.parent-options"), { params: { q, limit: 20 } });
      setParentOpts((opts || []).map((o) => ({
        value: o.value ?? o.id,
        label: o.label ?? `${o.code} — ${o.name}`,
        meta: o.meta ?? { level: o.level ?? 0, is_group: true, code: o.code, name: o.name }
      })));
    } catch (e) {
      console.error("Error fetching parent options:", e);
      setParentOpts([]);
    } finally {
      setParentLoading(false);
    }
  };
  const handleParentSearchChange = (q) => {
    if (parentDebounceRef.current) clearTimeout(parentDebounceRef.current);
    parentDebounceRef.current = setTimeout(() => fetchParentOptions(q || ""), 300);
  };
  const manualFilled = (data.manual_code || "").trim() !== "";
  const anyLevelSelected = !!data.level1 || !!data.level2 || !!data.level3 || !!data.level4;
  useEffect(() => {
    if (manualFilled) {
      setData((current) => {
        const next = { ...current, level1: null, level2: null, level3: null, level4: null };
        setLevel2Options([]);
        setLevel3Options([]);
        setLevel4Options([]);
        return next;
      });
    }
  }, [manualFilled]);
  const manualDisabled = anyLevelSelected;
  const computeNormalSide = (nature) => {
    if (!nature) return null;
    return ["asset", "expense"].includes(nature) ? "debit" : "credit";
  };
  useEffect(() => {
    setData("normal_side", computeNormalSide(data.nature));
  }, [data.nature]);
  const canReconcileByNature = ["asset", "liability"].includes(data.nature);
  useEffect(() => {
    if (!canReconcileByNature || data.is_group) {
      if (data.reconcile) setData("reconcile", false);
      if (data.currency_id) setData("currency_id", null);
    }
  }, [data.nature, data.is_group]);
  useEffect(() => {
    if (!data.reconcile) setData("currency_id", null);
  }, [data.reconcile]);
  useEffect(() => {
    var _a2;
    const opt = parentOpts.find((o) => o.value === data.parent_id);
    const parentLevel = (_a2 = opt == null ? void 0 : opt.meta) == null ? void 0 : _a2.level;
    setData("level", typeof parentLevel === "number" ? parentLevel + 1 : null);
  }, [data.parent_id, parentOpts]);
  const handleLevelChange = async (level, selectedId) => {
    if (level === 1) {
      setData("level1", selectedId || null);
      setData((current) => ({ ...current, level2: null, level3: null, level4: null }));
      setLevel2Options([]);
      setLevel3Options([]);
      setLevel4Options([]);
      if (!selectedId) return;
      try {
        const { data: items } = await axios.get(route("accounting-account-types.select", { type: selectedId }));
        setLevel2Options(items || []);
      } catch {
        setLevel2Options([]);
      }
    }
    if (level === 2) {
      setData("level2", selectedId || null);
      setData((current) => ({ ...current, level3: null, level4: null }));
      setLevel3Options([]);
      setLevel4Options([]);
      if (!selectedId) return;
      try {
        const { data: items } = await axios.get(route("accounting-account-types.select", { type: selectedId }));
        setLevel3Options(items || []);
      } catch {
        setLevel3Options([]);
      }
    }
    if (level === 3) {
      setData("level3", selectedId || null);
      setData((current) => ({ ...current, level4: null }));
      setLevel4Options([]);
      if (!selectedId) return;
      try {
        const { data: items } = await axios.get(route("accounting-account-types.select", { type: selectedId }));
        setLevel4Options(items || []);
      } catch {
        setLevel4Options([]);
      }
    }
  };
  const isLevel2Disabled = !data.level1 || level2Options.length === 0;
  const isLevel3Disabled = !data.level2 || level3Options.length === 0;
  const isLevel4Disabled = !data.level3 || level4Options.length === 0;
  const sanitizeMoney = (v) => v.replace(",", ".").replace(/[^\d.]/g, "");
  const handleOpeningChange = (e) => setData("opening_balance", sanitizeMoney(e.target.value));
  function handleSubmit(e) {
    e.preventDefault();
    post(route("accounting-accounts.store"), { onSuccess: () => reset() });
  }
  const actions = [];
  if (permissions == null ? void 0 : permissions["accounting-accounts.index"]) {
    actions.push({ text: __("cuentas_volver"), icon: "la-angle-left", url: "accounting-accounts.index", modal: false });
  }
  return /* @__PURE__ */ jsxs(AdminAuthenticated, { user: auth.user, title, subtitle, actions, children: [
    /* @__PURE__ */ jsx(Head, { title }),
    /* @__PURE__ */ jsx("div", { className: "contents pb-4", children: /* @__PURE__ */ jsx("form", { onSubmit: handleSubmit, children: /* @__PURE__ */ jsxs("div", { className: "row gy-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "col-lg-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "form-label", children: [
          __("cuenta_nombre"),
          "*"
        ] }),
        /* @__PURE__ */ jsx(
          TextInput,
          {
            type: "text",
            placeholder: __("cuenta_nombre"),
            value: data.name ?? "",
            onChange: (e) => setData("name", e.target.value),
            maxLength: 100
          }
        ),
        /* @__PURE__ */ jsx(InputError, { message: errors.name })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "col-lg-1 text-center", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "status", className: "form-label", children: __("estado") }),
        /* @__PURE__ */ jsx("div", { className: "pt-1 position-relative", children: /* @__PURE__ */ jsx(
          Checkbox,
          {
            className: "xl",
            name: "status",
            checked: data.status,
            onChange: (e) => setData("status", e.target.checked)
          }
        ) })
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "w-100 m-0" }),
      /* @__PURE__ */ jsxs("div", { className: "col-lg-3", children: [
        /* @__PURE__ */ jsxs("label", { className: "form-label", children: [
          __("tipo_contable"),
          "*"
        ] }),
        /* @__PURE__ */ jsx(
          SelectSearch,
          {
            name: "nature",
            options: natureOptions,
            value: data.nature,
            onChange: (opt) => setData("nature", opt ? opt.value : null),
            placeholder: __("opcion_selec"),
            required: true
          }
        ),
        /* @__PURE__ */ jsx(InputError, { message: errors.nature })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "col-md-3", children: [
        /* @__PURE__ */ jsxs("label", { className: "form-label d-flex align-items-center gap-2", children: [
          __("saldo_esperado"),
          /* @__PURE__ */ jsxs("small", { className: "text-muted", children: [
            "(",
            __("sugerido_por_tipo"),
            ": ",
            ["asset", "expense"].includes(data.nature) ? __("debe") : __("haber"),
            ")"
          ] }),
          data.normal_side && /* @__PURE__ */ jsx("span", { className: `mt-2 badge ${data.normal_side === "debit" ? "bg-primary" : "bg-success"}`, children: data.normal_side === "debit" ? __("debe") : __("haber") })
        ] }),
        /* @__PURE__ */ jsx(InputError, { message: errors.normal_side })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "col-md-2", children: [
        /* @__PURE__ */ jsx("label", { className: "form-label d-block", children: __("conciliable") }),
        /* @__PURE__ */ jsxs("div", { className: "form-check form-switch pt-2", children: [
          /* @__PURE__ */ jsx(
            Checkbox,
            {
              id: "reconcile",
              name: "reconcile",
              checked: !!data.reconcile,
              onChange: (e) => setData("reconcile", e.target.checked),
              disabled: data.is_group || !canReconcileByNature
            }
          ),
          /* @__PURE__ */ jsx("label", { htmlFor: "reconcile", className: "ms-2", children: data.reconcile ? __("si") : __("no") })
        ] }),
        /* @__PURE__ */ jsx("small", { className: "text-muted", children: !canReconcileByNature ? __("solo_activo_pasivo") : "" }),
        /* @__PURE__ */ jsx(InputError, { message: errors.reconcile })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "col-md-3", children: [
        /* @__PURE__ */ jsx("label", { className: "form-label", children: __("divisa") }),
        /* @__PURE__ */ jsx(
          SelectSearch,
          {
            name: "currency_id",
            value: data.currency_id,
            options: (currencies || props.currencies || []).map((c) => ({
              value: c.id,
              label: `${c.name}`
            })),
            onChange: (opt) => setData("currency_id", opt ? opt.value : null),
            placeholder: __("divisa_selec"),
            isDisabled: data.is_group || !data.reconcile
          }
        ),
        /* @__PURE__ */ jsx(InputError, { message: errors.currency_id })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "col-md-2", children: [
        /* @__PURE__ */ jsx("label", { className: "form-label d-block", children: __("agrupadora") }),
        /* @__PURE__ */ jsxs("div", { className: "form-check form-switch pt-2", children: [
          /* @__PURE__ */ jsx(
            Checkbox,
            {
              id: "is_group",
              name: "is_group",
              checked: !!data.is_group,
              onChange: (e) => setData("is_group", e.target.checked)
            }
          ),
          /* @__PURE__ */ jsx("label", { htmlFor: "is_group", className: "ms-2", children: data.is_group ? __("si") : __("no") })
        ] }),
        /* @__PURE__ */ jsx(InputError, { message: errors.is_group })
      ] }),
      !data.is_group && /* @__PURE__ */ jsxs("div", { className: "col-md-3", children: [
        /* @__PURE__ */ jsx("label", { className: "form-label", children: __("saldo_apertura") }),
        /* @__PURE__ */ jsx(
          TextInput,
          {
            type: "number",
            inputMode: "decimal",
            step: "0.01",
            min: "0",
            placeholder: "0.00",
            value: data.opening_balance ?? "",
            onChange: handleOpeningChange,
            disabled: data.is_group
          }
        ),
        /* @__PURE__ */ jsxs("small", { className: "text-muted d-block mt-1", children: [
          __("moneda_base_empresa"),
          ". ",
          __("se_aplica_en"),
          " ",
          data.normal_side === "debit" ? __("debe") : __("haber")
        ] }),
        /* @__PURE__ */ jsx(InputError, { message: errors.opening_balance })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "col-lg-3", children: [
        /* @__PURE__ */ jsx("label", { className: "form-label", children: __("cuenta_padre") }),
        /* @__PURE__ */ jsx(
          SelectSearch,
          {
            name: "parent_id",
            value: data.parent_id,
            options: parentOpts.filter((o) => {
              var _a2;
              return (_a2 = o == null ? void 0 : o.meta) == null ? void 0 : _a2.is_group;
            }),
            onChange: (opt) => setData("parent_id", opt ? opt.value : null),
            placeholder: __("cuenta_padre_selec"),
            onMenuOpen: () => {
              if (parentOpts.length === 0) fetchParentOptions("");
            },
            onSearchChange: handleParentSearchChange,
            isLoading: parentLoading
          }
        ),
        /* @__PURE__ */ jsx(InputError, { message: errors.parent_id })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "col-md-2", children: [
        /* @__PURE__ */ jsx("label", { className: "form-label", children: __("nivel") }),
        /* @__PURE__ */ jsx("div", { className: "form-control bg-light", children: typeof data.level === "number" ? data.level : "—" }),
        /* @__PURE__ */ jsx("small", { className: "text-muted", children: __("nivel_autocalculado_aviso") })
      ] }),
      /* @__PURE__ */ jsx("h5", { className: "text-warning mb-0 mt-4", children: __("cuenta_contable_manual_texto") }),
      /* @__PURE__ */ jsxs("div", { className: "col-lg-6", children: [
        /* @__PURE__ */ jsx("label", { className: "form-label", children: __("numeracion_manual") }),
        /* @__PURE__ */ jsx(
          TextInput,
          {
            type: "text",
            placeholder: __("numeracion_manual"),
            value: data.manual_code ?? "",
            onChange: (e) => setData("manual_code", e.target.value),
            maxLength: 100,
            disabled: manualDisabled
          }
        ),
        /* @__PURE__ */ jsx(InputError, { message: errors.manual_code })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "py-3", children: /* @__PURE__ */ jsx("hr", {}) }),
      /* @__PURE__ */ jsx("h5", { className: "text-warning", children: __("cuenta_contable_asistente_texto") }),
      /* @__PURE__ */ jsxs("div", { className: "col-md-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "form-label", children: [
          __("nivel"),
          " 1"
        ] }),
        /* @__PURE__ */ jsx(
          SelectSearch,
          {
            name: "level1",
            value: data.level1,
            options: (types || []).map((t) => ({ value: t.id, label: t.type })),
            onChange: (opt) => handleLevelChange(1, opt ? opt.value : null),
            required: !manualFilled,
            placeholder: __("nivel_selec"),
            isDisabled: manualFilled
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "col-md-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "form-label", children: [
          __("nivel"),
          " 2"
        ] }),
        /* @__PURE__ */ jsx(
          SelectSearch,
          {
            name: "level2",
            value: data.level2,
            options: level2Options.map((o) => ({ value: o.id, label: `${o.code} - ${o.name.charAt(0).toUpperCase() + o.name.slice(1)}` })),
            onChange: (opt) => handleLevelChange(2, opt ? opt.value : null),
            isDisabled: manualFilled || isLevel2Disabled,
            placeholder: __("nivel_selec")
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "col-md-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "form-label", children: [
          __("nivel"),
          " 3"
        ] }),
        /* @__PURE__ */ jsx(
          SelectSearch,
          {
            name: "level3",
            value: data.level3,
            options: level3Options.map((o) => ({ value: o.id, label: `${o.code} - ${o.name.charAt(0).toUpperCase() + o.name.slice(1)}` })),
            onChange: (opt) => handleLevelChange(3, opt ? opt.value : null),
            isDisabled: manualFilled || isLevel3Disabled,
            placeholder: __("nivel_selec")
          }
        )
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "col-md-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "form-label", children: [
          __("nivel"),
          " 4"
        ] }),
        /* @__PURE__ */ jsx(
          SelectSearch,
          {
            name: "level4",
            value: data.level4,
            options: level4Options.map((o) => ({ value: o.id, label: `${o.code} - ${o.name.charAt(0).toUpperCase() + o.name.slice(1)}` })),
            onChange: (opt) => setData("level4", opt ? opt.value : null),
            isDisabled: manualFilled || isLevel4Disabled,
            placeholder: __("nivel_selec")
          }
        )
      ] }),
      /* @__PURE__ */ jsx("h5", { className: "text-warning mb-0 mt-4", children: __("cuenta_contable_asistente_texto_2") }),
      /* @__PURE__ */ jsxs("div", { className: "col-md-6", children: [
        /* @__PURE__ */ jsxs("label", { className: "form-label", children: [
          __("completar_numeracion"),
          " "
        ] }),
        /* @__PURE__ */ jsx(
          TextInput,
          {
            type: "text",
            value: data.digits,
            onChange: (e) => setData("digits", e.target.value),
            maxLength: 30
          }
        ),
        /* @__PURE__ */ jsx(InputError, { message: errors.digits })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "col-12 mb-3", children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "notes", className: "form-label", children: __("notas") }),
        /* @__PURE__ */ jsx(
          Textarea,
          {
            name: "notes",
            value: data.notes || "",
            onChange: (e) => setData("notes", e.target.value),
            className: "form-control"
          }
        ),
        /* @__PURE__ */ jsx(InputError, { message: errors.notes })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "mt-4 text-end", children: /* @__PURE__ */ jsx(PrimaryButton, { disabled: processing, className: "btn btn-rdn", children: processing ? `${__("procesando")}...` : __("guardar") }) })
    ] }) }) })
  ] });
}
export {
  Index as default
};
