import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect } from "react";
import { useForm } from "@inertiajs/react";
import { C as Checkbox } from "./Checkbox-C9HPJULq.js";
import { I as InputError } from "./InputError-DME5vguS.js";
import { P as PrimaryButton } from "./PrimaryButton-CIbKPOjQ.js";
import { S as SelectInput } from "./SelectInput-BpRRLwUE.js";
import { T as TextInput } from "./TextInput-CzxrbIpp.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import { u as useSweetAlert } from "./useSweetAlert-D4PAsWYN.js";
import "sweetalert2";
const toDateValue = (val) => val ? String(val).substring(0, 10) : "";
const normalizeOptions = (raw) => {
  if (Array.isArray(raw)) {
    if (raw.length && typeof raw[0] === "object") return raw;
    return raw.map((name, idx) => ({ id: idx + 1, name }));
  }
  if (raw && typeof raw === "object") {
    return Object.entries(raw).map(([key, value]) => {
      if (value && typeof value === "object") {
        return { id: value.id ?? key, name: value.name ?? value.title ?? String(value) };
      }
      return { id: key, name: value };
    });
  }
  return [];
};
function MarketingCampaignInfoTab({
  campaign,
  costCenters = [],
  owners = [],
  currencies = [],
  campaignStatus = {},
  priorities = {},
  updateRoute = "marketing-campaigns.update",
  updateParams = null
}) {
  const __ = useTranslation();
  const { showAlert } = useSweetAlert();
  const params = updateParams ?? [campaign == null ? void 0 : campaign.id];
  const campaignStatusArray = normalizeOptions(campaignStatus);
  const prioritiesArray = normalizeOptions(priorities);
  const buildData = (c) => ({
    owner_id: (c == null ? void 0 : c.owner_id) ?? "",
    name: (c == null ? void 0 : c.name) ?? "",
    campaign_code: (c == null ? void 0 : c.campaign_code) ?? "",
    campaign_type: (c == null ? void 0 : c.campaign_type) ?? "",
    description: (c == null ? void 0 : c.description) ?? "",
    total_cost: (c == null ? void 0 : c.total_cost) ?? "",
    expected_cost: (c == null ? void 0 : c.expected_cost) ?? "",
    currency_id: (c == null ? void 0 : c.currency_id) ?? "",
    promote_code: (c == null ? void 0 : c.promote_code) ?? "",
    start_at: toDateValue(c == null ? void 0 : c.start_at),
    finish_at: toDateValue(c == null ? void 0 : c.finish_at),
    cost_center_id: (c == null ? void 0 : c.cost_center_id) ?? "",
    status: (c == null ? void 0 : c.status) ? String(c.status) : "",
    is_quick: (c == null ? void 0 : c.is_quick) ?? false,
    action: (c == null ? void 0 : c.action) ?? "",
    priority: (c == null ? void 0 : c.priority) ?? "",
    members_type: (c == null ? void 0 : c.members_type) ?? ""
  });
  const { data, setData, put, processing, errors } = useForm(buildData(campaign));
  useEffect(() => {
    setData(buildData(campaign));
  }, [campaign == null ? void 0 : campaign.id]);
  const handleSubmit = (e) => {
    e.preventDefault();
    put(route(updateRoute, params), {
      preserveScroll: true,
      onError: () => showAlert(__("error"), __("error_guardando"), "error")
    });
  };
  return /* @__PURE__ */ jsx("form", { onSubmit: handleSubmit, children: /* @__PURE__ */ jsxs("div", { className: "row gy-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "col-lg-6", children: [
      /* @__PURE__ */ jsxs("label", { htmlFor: "name", className: "form-label", children: [
        __("nombre"),
        "*"
      ] }),
      /* @__PURE__ */ jsx(
        TextInput,
        {
          id: "name",
          type: "text",
          value: data.name,
          onChange: (e) => setData("name", e.target.value),
          maxLength: 255
        }
      ),
      /* @__PURE__ */ jsx(InputError, { message: errors.name })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "col-lg-3", children: [
      /* @__PURE__ */ jsx("label", { htmlFor: "campaign_code", className: "form-label", children: __("codigo") }),
      /* @__PURE__ */ jsx(
        TextInput,
        {
          id: "campaign_code",
          type: "text",
          value: data.campaign_code,
          onChange: (e) => setData("campaign_code", e.target.value),
          maxLength: 255
        }
      ),
      /* @__PURE__ */ jsx(InputError, { message: errors.campaign_code })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "col-lg-3", children: [
      /* @__PURE__ */ jsx("label", { htmlFor: "campaign_type", className: "form-label", children: __("tipo") }),
      /* @__PURE__ */ jsx(
        TextInput,
        {
          id: "campaign_type",
          type: "text",
          value: data.campaign_type,
          onChange: (e) => setData("campaign_type", e.target.value),
          maxLength: 50
        }
      ),
      /* @__PURE__ */ jsx(InputError, { message: errors.campaign_type })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "col-lg-4", children: [
      /* @__PURE__ */ jsx("label", { htmlFor: "owner_id", className: "form-label", children: __("propietario") }),
      /* @__PURE__ */ jsxs(
        SelectInput,
        {
          id: "owner_id",
          value: data.owner_id,
          onChange: (e) => setData("owner_id", e.target.value),
          children: [
            /* @__PURE__ */ jsx("option", { value: "", children: __("opcion_selec") }),
            owners.map((u) => /* @__PURE__ */ jsx("option", { value: u.id, children: u.full_name || [u.name, u.surname].filter(Boolean).join(" ") }, u.id))
          ]
        }
      ),
      /* @__PURE__ */ jsx(InputError, { message: errors.owner_id })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "col-lg-4", children: [
      /* @__PURE__ */ jsx("label", { htmlFor: "cost_center_id", className: "form-label", children: __("centro_coste") }),
      /* @__PURE__ */ jsxs(
        SelectInput,
        {
          id: "cost_center_id",
          value: data.cost_center_id,
          onChange: (e) => setData("cost_center_id", e.target.value),
          children: [
            /* @__PURE__ */ jsx("option", { value: "", children: __("opcion_selec") }),
            costCenters.map((cc) => /* @__PURE__ */ jsx("option", { value: cc.id, children: cc.name }, cc.id))
          ]
        }
      ),
      /* @__PURE__ */ jsx(InputError, { message: errors.cost_center_id })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "col-lg-4", children: [
      /* @__PURE__ */ jsx("label", { htmlFor: "campaign_status", className: "form-label", children: __("estado") }),
      /* @__PURE__ */ jsxs(
        SelectInput,
        {
          id: "campaign_status",
          value: data.status,
          onChange: (e) => setData("status", e.target.value),
          children: [
            /* @__PURE__ */ jsx("option", { value: "", children: __("opcion_selec") }),
            campaignStatusArray.map((cs) => /* @__PURE__ */ jsx("option", { value: cs.id, children: cs.name }, cs.id))
          ]
        }
      ),
      /* @__PURE__ */ jsx(InputError, { message: errors.status })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "col-12", children: [
      /* @__PURE__ */ jsx("label", { htmlFor: "description", className: "form-label", children: __("descripcion") }),
      /* @__PURE__ */ jsx(
        "textarea",
        {
          id: "description",
          className: "form-control",
          rows: "4",
          value: data.description || "",
          onChange: (e) => setData("description", e.target.value)
        }
      ),
      /* @__PURE__ */ jsx(InputError, { message: errors.description })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "col-lg-3", children: [
      /* @__PURE__ */ jsx("label", { htmlFor: "total_cost", className: "form-label", children: __("coste_total") }),
      /* @__PURE__ */ jsx(
        TextInput,
        {
          id: "total_cost",
          type: "number",
          step: "0.01",
          min: "0",
          value: data.total_cost,
          onChange: (e) => setData("total_cost", e.target.value)
        }
      ),
      /* @__PURE__ */ jsx(InputError, { message: errors.total_cost })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "col-lg-3", children: [
      /* @__PURE__ */ jsx("label", { htmlFor: "expected_cost", className: "form-label", children: __("coste_previsto") }),
      /* @__PURE__ */ jsx(
        TextInput,
        {
          id: "expected_cost",
          type: "number",
          step: "0.01",
          min: "0",
          value: data.expected_cost || "",
          onChange: (e) => setData("expected_cost", e.target.value)
        }
      ),
      /* @__PURE__ */ jsx(InputError, { message: errors.expected_cost })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "col-lg-3", children: [
      /* @__PURE__ */ jsx("label", { htmlFor: "currency_id", className: "form-label", children: __("moneda") }),
      /* @__PURE__ */ jsxs(
        SelectInput,
        {
          id: "currency_id",
          value: data.currency_id,
          onChange: (e) => setData("currency_id", e.target.value),
          children: [
            /* @__PURE__ */ jsx("option", { value: "", children: __("opcion_selec") }),
            currencies.map((c) => /* @__PURE__ */ jsxs("option", { value: c.id, children: [
              c.name,
              c.symbol ? ` (${c.symbol})` : ""
            ] }, c.id))
          ]
        }
      ),
      /* @__PURE__ */ jsx(InputError, { message: errors.currency_id })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "col-lg-3", children: [
      /* @__PURE__ */ jsx("label", { htmlFor: "promote_code", className: "form-label", children: __("codigo_promocion") }),
      /* @__PURE__ */ jsx(
        TextInput,
        {
          id: "promote_code",
          type: "text",
          value: data.promote_code || "",
          onChange: (e) => setData("promote_code", e.target.value),
          maxLength: 255
        }
      ),
      /* @__PURE__ */ jsx(InputError, { message: errors.promote_code })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "col-lg-3", children: [
      /* @__PURE__ */ jsx("label", { htmlFor: "start_at", className: "form-label", children: __("inicio") }),
      /* @__PURE__ */ jsx(
        TextInput,
        {
          id: "start_at",
          type: "date",
          value: data.start_at || "",
          onChange: (e) => setData("start_at", e.target.value)
        }
      ),
      /* @__PURE__ */ jsx(InputError, { message: errors.start_at })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "col-lg-3", children: [
      /* @__PURE__ */ jsx("label", { htmlFor: "finish_at", className: "form-label", children: __("fin") }),
      /* @__PURE__ */ jsx(
        TextInput,
        {
          id: "finish_at",
          type: "date",
          value: data.finish_at || "",
          onChange: (e) => setData("finish_at", e.target.value)
        }
      ),
      /* @__PURE__ */ jsx(InputError, { message: errors.finish_at })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "col-lg-3", children: [
      /* @__PURE__ */ jsx("label", { htmlFor: "action", className: "form-label", children: __("accion") }),
      /* @__PURE__ */ jsx(
        TextInput,
        {
          id: "action",
          type: "text",
          value: data.action || "",
          onChange: (e) => setData("action", e.target.value),
          maxLength: 255
        }
      ),
      /* @__PURE__ */ jsx(InputError, { message: errors.action })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "col-lg-3", children: [
      /* @__PURE__ */ jsx("label", { htmlFor: "priority", className: "form-label", children: __("prioridad") }),
      /* @__PURE__ */ jsxs(
        SelectInput,
        {
          id: "priority",
          value: data.priority,
          onChange: (e) => setData("priority", e.target.value),
          children: [
            /* @__PURE__ */ jsx("option", { value: "", children: __("opcion_selec") }),
            prioritiesArray.map((p) => /* @__PURE__ */ jsx("option", { value: p.id, children: p.name }, p.id))
          ]
        }
      ),
      /* @__PURE__ */ jsx(InputError, { message: errors.priority })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "col-lg-3", children: [
      /* @__PURE__ */ jsx("label", { htmlFor: "members_type", className: "form-label", children: __("miembros_tipo") }),
      /* @__PURE__ */ jsx(
        TextInput,
        {
          id: "members_type",
          type: "text",
          value: data.members_type || "",
          onChange: (e) => setData("members_type", e.target.value),
          maxLength: 255
        }
      ),
      /* @__PURE__ */ jsx(InputError, { message: errors.members_type })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "col-lg-3 d-flex align-items-end", children: /* @__PURE__ */ jsxs("div", { className: "form-check", children: [
      /* @__PURE__ */ jsx(
        Checkbox,
        {
          id: "is_quick",
          checked: data.is_quick,
          onChange: (e) => setData("is_quick", e.target.checked)
        }
      ),
      /* @__PURE__ */ jsx("label", { htmlFor: "is_quick", className: "form-check-label ms-2", children: __("campanya_express") }),
      /* @__PURE__ */ jsx(InputError, { message: errors.is_quick })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "col-12 mt-4 text-end", children: /* @__PURE__ */ jsx(PrimaryButton, { disabled: processing, className: "btn btn-rdn", children: processing ? `${__("procesando")}...` : __("guardar") }) })
  ] }) });
}
export {
  MarketingCampaignInfoTab as default
};
