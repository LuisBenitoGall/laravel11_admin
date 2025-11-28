import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-CXi9lJ8D.js";
import { usePage, useForm, Head, Link } from "@inertiajs/react";
import "react";
import { C as Checkbox } from "./Checkbox-B7oBdKeZ.js";
import { I as InfoPopover } from "./InfoPopover-CwWEvwXq.js";
import { I as InputError } from "./InputError-DME5vguS.js";
import { P as PrimaryButton } from "./PrimaryButton-B91ets3U.js";
import { T as TextInput } from "./TextInput-CzxrbIpp.js";
import { S as SelectInput } from "./SelectInput-DrqFt-OA.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import "@inertiajs/inertia";
import "./Header-dr5I36ZE.js";
import "react-bootstrap";
import "./useSweetAlert-D4PAsWYN.js";
import "sweetalert2";
import "./Sidebar-KWaSAYKU.js";
import "axios";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
function Create({ auth, session, title, subtitle, owners = [], currencies = [], costCenters = [] }) {
  var _a;
  const __ = useTranslation();
  const props = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  props.locale || false;
  props.languages || [];
  const permissions = props.permissions || {};
  const statusOptions = [
    { value: 0, label: __("campanya_borrador") },
    // draft
    { value: 1, label: __("campanya_activa") },
    // active
    { value: 2, label: __("campanya_finalizada") },
    // finished
    { value: 3, label: __("campanya_cancelada") }
    // cancelled
  ];
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
              __("campanya_nombre"),
              "*"
            ] }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "name",
                type: "text",
                placeholder: __("campanya_nombre"),
                value: data.name,
                onChange: (e) => setData("name", e.target.value),
                maxLength: 255
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.name })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "col-lg-3", children: /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "campaign_code", className: "form-label", children: __("campanya_codigo") }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "campaign_code",
                type: "text",
                placeholder: __("campanya_codigo"),
                value: data.campaign_code,
                onChange: (e) => setData("campaign_code", e.target.value),
                maxLength: 255
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.campaign_code })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "col-lg-3", children: /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "campaign_type", className: "form-label", children: __("campanya_tipo") }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "campaign_type",
                type: "text",
                placeholder: __("campanya_tipo"),
                value: data.campaign_type,
                onChange: (e) => setData("campaign_type", e.target.value),
                maxLength: 50
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.campaign_type })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "col-lg-4", children: /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "owner_id", className: "form-label", children: __("campanya_propietario") }),
            /* @__PURE__ */ jsxs(
              SelectInput,
              {
                id: "owner_id",
                value: data.owner_id,
                onChange: (e) => setData("owner_id", e.target.value),
                children: [
                  /* @__PURE__ */ jsx("option", { value: "", children: __("seleccionar_opcion") }),
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
                  /* @__PURE__ */ jsx("option", { value: "", children: __("seleccionar_opcion") }),
                  costCenters.map((cc) => /* @__PURE__ */ jsx("option", { value: cc.id, children: cc.name }, cc.id))
                ]
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.cost_center_id })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "col-lg-4", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "status", className: "form-label", children: __("campanya_estado") }),
            /* @__PURE__ */ jsx(
              SelectInput,
              {
                id: "status",
                value: data.status,
                onChange: (e) => setData("status", Number(e.target.value)),
                children: statusOptions.map((opt) => /* @__PURE__ */ jsx("option", { value: opt.value, children: opt.label }, opt.value))
              }
            ),
            /* @__PURE__ */ jsx(InfoPopover, { code: "campanya-status" }),
            /* @__PURE__ */ jsx(InputError, { message: errors.status })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "col-12", children: /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "description", className: "form-label", children: __("campanya_descripcion") }),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                id: "description",
                className: "form-control",
                rows: "4",
                placeholder: __("campanya_descripcion"),
                value: data.description || "",
                onChange: (e) => setData("description", e.target.value)
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.description })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "col-lg-3", children: /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "total_cost", className: "form-label", children: __("campanya_coste_total") }),
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
            /* @__PURE__ */ jsx("label", { htmlFor: "expected_cost", className: "form-label", children: __("campanya_coste_esperado") }),
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
                  /* @__PURE__ */ jsx("option", { value: "", children: __("seleccionar_opcion") }),
                  currencies.map((currency) => /* @__PURE__ */ jsxs("option", { value: currency.id, children: [
                    currency.code,
                    " ",
                    currency.symbol ? `(${currency.symbol})` : ""
                  ] }, currency.id))
                ]
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.currency_id })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "col-lg-3", children: /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "promote_code", className: "form-label", children: __("campanya_codigo_promocion") }),
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
            /* @__PURE__ */ jsx("label", { htmlFor: "start_at", className: "form-label", children: __("campanya_inicio") }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "start_at",
                type: "datetime-local",
                value: data.start_at || "",
                onChange: (e) => setData("start_at", e.target.value)
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.start_at })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "col-lg-3", children: /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "finish_at", className: "form-label", children: __("campanya_fin") }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "finish_at",
                type: "datetime-local",
                value: data.finish_at || "",
                onChange: (e) => setData("finish_at", e.target.value)
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.finish_at })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "col-lg-3", children: /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "action", className: "form-label", children: __("campanya_accion") }),
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
            /* @__PURE__ */ jsx("label", { htmlFor: "priority", className: "form-label", children: __("campanya_prioridad") }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "priority",
                type: "text",
                value: data.priority || "",
                onChange: (e) => setData("priority", e.target.value),
                maxLength: 255
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.priority })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "col-lg-3", children: /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "members_type", className: "form-label", children: __("campanya_tipo_miembros") }),
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
          /* @__PURE__ */ jsxs("div", { className: "col-12", children: [
            /* @__PURE__ */ jsx("hr", {}),
            /* @__PURE__ */ jsx("h6", { className: "mb-3", children: __("campanya_origen_datos") })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "col-lg-4", children: /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "external_id", className: "form-label", children: __("campanya_external_id") }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "external_id",
                type: "text",
                value: data.external_id || "",
                onChange: (e) => setData("external_id", e.target.value),
                maxLength: 255
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.external_id })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "col-lg-4", children: /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "source_system", className: "form-label", children: __("campanya_sistema_origen") }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "source_system",
                type: "text",
                value: data.source_system || "",
                onChange: (e) => setData("source_system", e.target.value),
                maxLength: 50
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.source_system })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "col-lg-4", children: /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "source_type", className: "form-label", children: __("campanya_tipo_origen") }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "source_type",
                type: "text",
                value: data.source_type || "",
                onChange: (e) => setData("source_type", e.target.value),
                maxLength: 50
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.source_type })
          ] }) }),
          /* @__PURE__ */ jsxs("div", { className: "col-12 mt-4 text-end", children: [
            (permissions == null ? void 0 : permissions["marketing-campaigns.index"]) && /* @__PURE__ */ jsx(
              Link,
              {
                href: route("marketing-campaigns.index"),
                className: "btn btn-outline-secondary me-2",
                children: __("cancelar")
              }
            ),
            /* @__PURE__ */ jsx(PrimaryButton, { disabled: processing, className: "btn btn-rdn", children: processing ? `${__("procesando")}...` : __("guardar") })
          ] })
        ] }) }) })
      ]
    }
  );
}
export {
  Create as default
};
