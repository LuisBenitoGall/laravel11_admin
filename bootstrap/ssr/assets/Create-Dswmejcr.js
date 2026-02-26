import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-CSWCGMVO.js";
import { usePage, useForm, Head } from "@inertiajs/react";
import "react";
import { C as Checkbox } from "./Checkbox-C9HPJULq.js";
import { I as InfoPopover } from "./InfoPopover-CwWEvwXq.js";
import { I as InputError } from "./InputError-DME5vguS.js";
import { P as PrimaryButton } from "./PrimaryButton-CIbKPOjQ.js";
import { T as TextInput } from "./TextInput-CzxrbIpp.js";
import { S as SelectInput } from "./SelectInput-DrqFt-OA.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import "@inertiajs/inertia";
import "./Header-BVvoXjVe.js";
import "react-bootstrap";
import "./useSweetAlert-D4PAsWYN.js";
import "sweetalert2";
import "./Sidebar-C6XdPTvA.js";
import "axios";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
function Create({
  auth,
  session,
  title,
  subtitle,
  owners = [],
  currencies = [],
  costCenters = [],
  campaignStatus = [],
  priorities = []
}) {
  var _a;
  const __ = useTranslation();
  const props = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  props.locale || false;
  props.languages || [];
  const permissions = props.permissions || {};
  let campaignStatusArray = [];
  if (Array.isArray(campaignStatus)) {
    if (campaignStatus.length && typeof campaignStatus[0] === "object") {
      campaignStatusArray = campaignStatus;
    } else {
      campaignStatusArray = campaignStatus.map((name, idx) => ({ id: idx + 1, name }));
    }
  } else if (campaignStatus && typeof campaignStatus === "object") {
    campaignStatusArray = Object.entries(campaignStatus).map(([key, value]) => {
      if (value && typeof value === "object") {
        return { id: value.id ?? key, name: value.name ?? value.title ?? String(value) };
      }
      return { id: key, name: value };
    });
  }
  let prioritiesArray = [];
  if (Array.isArray(priorities)) {
    if (priorities.length && typeof priorities[0] === "object") {
      prioritiesArray = priorities;
    } else {
      prioritiesArray = priorities.map((name, idx) => ({ id: idx + 1, name }));
    }
  } else if (priorities && typeof priorities === "object") {
    prioritiesArray = Object.entries(priorities).map(([key, value]) => {
      if (value && typeof value === "object") {
        return { id: value.id ?? key, name: value.name ?? value.title ?? String(value) };
      }
      return { id: key, name: value };
    });
  }
  const { data, setData, post, reset, errors, processing } = useForm({
    owner_id: "",
    name: "",
    campaign_code: "",
    campaign_type: "",
    description: "",
    total_cost: "",
    expected_cost: "",
    currency_id: "",
    promote_code: "",
    start_at: "",
    finish_at: "",
    cost_center_id: "",
    status: 0,
    is_quick: false,
    action: "",
    priority: "",
    members_type: "",
    external_id: "",
    source_system: "",
    source_type: ""
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    post(route("marketing-campaigns.store"), {
      onSuccess: () => reset()
    });
  };
  const actions = [];
  if (permissions == null ? void 0 : permissions["marketing-campaigns.index"]) {
    actions.push({
      text: __("campanyas_volver"),
      icon: "la-angle-left",
      url: "marketing-campaigns.index",
      modal: false
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
        /* @__PURE__ */ jsx("div", { className: "contents pb-4", children: /* @__PURE__ */ jsx("form", { onSubmit: handleSubmit, children: /* @__PURE__ */ jsxs("div", { className: "row gy-3", children: [
          /* @__PURE__ */ jsx("div", { className: "col-lg-6", children: /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("label", { htmlFor: "name", className: "form-label", children: [
              __("nombre"),
              "*"
            ] }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "name",
                type: "text",
                placeholder: __("nombre"),
                value: data.name,
                onChange: (e) => setData("name", e.target.value),
                maxLength: 255
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.name })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "col-lg-3", children: /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "campaign_code", className: "form-label", children: __("codigo") }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "campaign_code",
                type: "text",
                placeholder: __("codigo"),
                value: data.campaign_code,
                onChange: (e) => setData("campaign_code", e.target.value),
                maxLength: 255
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.campaign_code })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "col-lg-3", children: /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "campaign_type", className: "form-label", children: __("tipo") }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "campaign_type",
                type: "text",
                placeholder: __("tipo"),
                value: data.campaign_type,
                onChange: (e) => setData("campaign_type", e.target.value),
                maxLength: 50
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.campaign_type })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "col-lg-4", children: /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "owner_id", className: "form-label", children: __("propietario") }),
            /* @__PURE__ */ jsxs(
              SelectInput,
              {
                id: "owner_id",
                value: data.owner_id,
                onChange: (e) => setData("owner_id", e.target.value),
                children: [
                  /* @__PURE__ */ jsx("option", { value: "", children: __("opcion_selec") }),
                  owners.map((user) => /* @__PURE__ */ jsx("option", { value: user.id, children: user.full_name || user.name }, user.id))
                ]
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.owner_id })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "col-lg-4", children: /* @__PURE__ */ jsxs("div", { children: [
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
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "col-lg-4", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "status", className: "form-label", children: __("estado") }),
            /* @__PURE__ */ jsxs(
              SelectInput,
              {
                value: data.status,
                onChange: (e) => setData("status", Number(e.target.value)),
                children: [
                  /* @__PURE__ */ jsx("option", { value: "", children: __("opcion_selec") }),
                  campaignStatusArray.map((cs) => /* @__PURE__ */ jsx("option", { value: cs.id, children: cs.name }, cs.id))
                ]
              }
            ),
            /* @__PURE__ */ jsx(InfoPopover, { code: "campanya-status" }),
            /* @__PURE__ */ jsx(InputError, { message: errors.status })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "col-12", children: /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "description", className: "form-label", children: __("descripcion") }),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                id: "description",
                className: "form-control",
                rows: "4",
                placeholder: __("descripcion"),
                value: data.description || "",
                onChange: (e) => setData("description", e.target.value)
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.description })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "col-lg-3", children: /* @__PURE__ */ jsxs("div", { children: [
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
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "col-lg-3", children: /* @__PURE__ */ jsxs("div", { children: [
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
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "col-lg-3", children: /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "currency_id", className: "form-label", children: __("moneda") }),
            /* @__PURE__ */ jsxs(
              SelectInput,
              {
                id: "currency_id",
                value: data.currency_id,
                onChange: (e) => setData("currency_id", e.target.value),
                children: [
                  /* @__PURE__ */ jsx("option", { value: "", children: __("opcion_selec") }),
                  currencies.map((currency) => /* @__PURE__ */ jsxs("option", { value: currency.id, children: [
                    currency.name,
                    " ",
                    currency.symbol ? `(${currency.symbol})` : ""
                  ] }, currency.id))
                ]
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.currency_id })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "col-lg-3", children: /* @__PURE__ */ jsxs("div", { children: [
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
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "col-lg-3", children: /* @__PURE__ */ jsxs("div", { children: [
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
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "col-lg-3", children: /* @__PURE__ */ jsxs("div", { children: [
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
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "col-lg-3", children: /* @__PURE__ */ jsxs("div", { children: [
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
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "col-lg-3", children: /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "priority", className: "form-label", children: __("prioridad") }),
            /* @__PURE__ */ jsxs(
              SelectInput,
              {
                value: data.priority,
                onChange: (e) => setData("priority", Number(e.target.value)),
                children: [
                  /* @__PURE__ */ jsx("option", { value: "", children: __("opcion_selec") }),
                  prioritiesArray.map((p) => /* @__PURE__ */ jsx("option", { value: p.id, children: p.name }, p.id))
                ]
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.priority })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "col-lg-3", children: /* @__PURE__ */ jsxs("div", { children: [
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
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "col-lg-3 d-flex align-items-end", children: /* @__PURE__ */ jsxs("div", { className: "form-check", children: [
            /* @__PURE__ */ jsx(
              Checkbox,
              {
                id: "is_quick",
                name: "is_quick",
                checked: data.is_quick,
                onChange: (e) => setData("is_quick", e.target.checked)
              }
            ),
            /* @__PURE__ */ jsx("label", { htmlFor: "is_quick", className: "form-check-label ms-2", children: __("campanya_express") }),
            /* @__PURE__ */ jsx(InputError, { message: errors.is_quick })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "col-12 mt-4 text-end", children: /* @__PURE__ */ jsx(PrimaryButton, { disabled: processing, className: "btn btn-rdn", children: processing ? `${__("procesando")}...` : __("guardar") }) })
        ] }) }) })
      ]
    }
  );
}
export {
  Create as default
};
