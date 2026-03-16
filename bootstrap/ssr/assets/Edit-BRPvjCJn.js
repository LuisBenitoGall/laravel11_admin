import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-MrkbgmVx.js";
import { usePage, useForm, Head } from "@inertiajs/react";
import { I as InputError } from "./InputError-DME5vguS.js";
import { P as PrimaryButton } from "./PrimaryButton-CIbKPOjQ.js";
import { S as SelectSearch } from "./SelectSearch-x7o6yKJV.js";
import { T as Textarea } from "./Textarea-nvTyMSx8.js";
import { T as TextInput } from "./TextInput-CzxrbIpp.js";
import "react";
import { O as OpportunityStatusSelect } from "./OpportunityStatusSelect-DpuaHxuk.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import { u as useHandleDelete } from "./useHandleDelete-B2XtFf-J.js";
import "@inertiajs/inertia";
import "./Header-BVvoXjVe.js";
import "react-bootstrap";
import "./useSweetAlert-D4PAsWYN.js";
import "sweetalert2";
import "./Sidebar-ZJGYlWUm.js";
import "axios";
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
function Index({
  auth,
  session,
  title,
  subtitle,
  availableLocales,
  opportunity,
  contactName,
  crmAccounts = []
}) {
  var _a;
  const __ = useTranslation();
  const props = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  const permissions = props.permissions || {};
  const { data, setData, put, errors, processing } = useForm({
    name: (opportunity == null ? void 0 : opportunity.name) ?? "",
    observations: (opportunity == null ? void 0 : opportunity.observations) ?? "",
    crm_account_id: (opportunity == null ? void 0 : opportunity.crm_account_id) ?? null,
    status: (opportunity == null ? void 0 : opportunity.status) ?? 1
  });
  useHandleDelete("oportunidad", "crm-opportunities.destroy", [opportunity.id]);
  const crmAccountOptions = (crmAccounts || []).map((acc) => ({
    value: acc.id,
    label: acc.name,
    meta: acc
  }));
  function handleSubmit(e) {
    e.preventDefault();
    put(route("crm-opportunities.update", opportunity.id), {
      preserveScroll: true
    });
  }
  const actions = [];
  if (permissions == null ? void 0 : permissions["crm-opportunities.index"]) {
    actions.push({
      text: __("oportunidades_volver"),
      icon: "la-angle-left",
      url: "crm-opportunities.index",
      modal: false
    });
  }
  if (permissions == null ? void 0 : permissions["crm-opportunities.create"]) {
    actions.push({
      text: __("oportunidad_nueva"),
      icon: "la-plus",
      url: "crm-opportunities.create",
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
        /* @__PURE__ */ jsxs("div", { className: "contents pb-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "row", children: [
            /* @__PURE__ */ jsx("div", { className: "col-12", children: /* @__PURE__ */ jsxs("h2", { children: [
              __("oportunidad"),
              " ",
              /* @__PURE__ */ jsx("u", { children: opportunity.name })
            ] }) }),
            /* @__PURE__ */ jsxs("div", { className: "col-12 mt-2 mb-4", children: [
              contactName && /* @__PURE__ */ jsxs("span", { className: "text-muted me-5", children: [
                __("contacto"),
                ": ",
                /* @__PURE__ */ jsx("strong", { children: contactName })
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "text-muted me-5", children: [
                __("creado"),
                ": ",
                /* @__PURE__ */ jsx("strong", { children: opportunity.formatted_created_at })
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "text-muted", children: [
                __("actualizado"),
                ": ",
                /* @__PURE__ */ jsx("strong", { children: opportunity.formatted_updated_at })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx("form", { onSubmit: handleSubmit, children: /* @__PURE__ */ jsxs("div", { className: "row gy-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "col-md-6", children: [
              /* @__PURE__ */ jsxs("label", { className: "form-label", children: [
                __("titulo"),
                "*"
              ] }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  type: "text",
                  name: "name",
                  value: (data == null ? void 0 : data.name) ?? "",
                  onChange: (e) => {
                    var _a2;
                    return setData("name", ((_a2 = e == null ? void 0 : e.target) == null ? void 0 : _a2.value) ?? "");
                  },
                  maxLength: 255,
                  required: true
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.name })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "col-md-6", children: /* @__PURE__ */ jsx("div", { className: "mb-3", children: /* @__PURE__ */ jsx(
              OpportunityStatusSelect,
              {
                id: "opportunity_status",
                name: "status",
                value: (data == null ? void 0 : data.status) ?? 1,
                onChange: (e) => setData("status", e.target ? e.target.value : e),
                error: errors.status,
                label: __("estado")
              }
            ) }) }),
            /* @__PURE__ */ jsx("div", { className: "w-100 m-0" }),
            /* @__PURE__ */ jsxs("div", { className: "col-lg-6", children: [
              /* @__PURE__ */ jsx("label", { className: "form-label", children: __("cuenta_crm") }),
              /* @__PURE__ */ jsx(
                SelectSearch,
                {
                  name: "crm_account_id",
                  value: (data == null ? void 0 : data.crm_account_id) ?? null,
                  options: crmAccountOptions,
                  onChange: (opt) => setData("crm_account_id", opt ? opt.value : null),
                  placeholder: __("cuenta_crm_selec")
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.crm_account_id })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "col-12", children: [
              /* @__PURE__ */ jsx("label", { className: "form-label", children: __("observaciones") }),
              /* @__PURE__ */ jsx(
                Textarea,
                {
                  name: "observations",
                  value: (data == null ? void 0 : data.observations) ?? "",
                  onChange: (e) => setData("observations", e.target ? e.target.value : e),
                  className: "form-control",
                  rows: 4
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.observations })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "mt-4 text-end", children: /* @__PURE__ */ jsx(PrimaryButton, { disabled: processing, className: "btn btn-rdn", children: processing ? `${__("procesando")}...` : __("guardar") }) })
          ] }) })
        ] })
      ]
    }
  );
}
export {
  Index as default
};
