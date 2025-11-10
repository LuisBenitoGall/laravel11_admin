import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-DT2NIV1N.js";
import { usePage, useForm, Head } from "@inertiajs/react";
import "react";
import { C as Checkbox } from "./Checkbox-B7oBdKeZ.js";
import { I as InputError } from "./InputError-DME5vguS.js";
import { P as PrimaryButton } from "./PrimaryButton-B91ets3U.js";
import { S as SelectSearch } from "./SelectSearch-C7ksrTDE.js";
import { T as TextInput } from "./TextInput-CzxrbIpp.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import "axios";
import "@inertiajs/inertia";
import "./Header-kwxCeG5H.js";
import "react-bootstrap";
import "./useSweetAlert-D4PAsWYN.js";
import "sweetalert2";
import "./Sidebar-BV0-sS1Z.js";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
import "react-select";
function Index({ auth, session, title, subtitle, banks, accounting_accounts, availableLocales }) {
  var _a;
  const __ = useTranslation();
  const props = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  props.locale || false;
  props.languages || [];
  const permissions = props.permissions || {};
  const { data, setData, post, reset, errors, processing } = useForm({
    accounting_account_id: "",
    bank_id: "",
    country_code: "",
    entity: "",
    office: "",
    dc: "",
    digits: "",
    featured: false,
    status: true
  });
  function handleSubmit(e) {
    e.preventDefault();
    post(route("bank-accounts.store"), {
      onSuccess: () => reset()
    });
  }
  const actions = [];
  if (permissions == null ? void 0 : permissions["bank-accounts.index"]) {
    actions.push({
      text: __("cuentas_volver"),
      icon: "la-angle-left",
      url: "bank-accounts.index",
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
        /* @__PURE__ */ jsx("div", { className: "contents pb-4", children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
          /* @__PURE__ */ jsxs("div", { className: "row gy-3 mb-3", children: [
            /* @__PURE__ */ jsx("div", { className: "col-lg-6", children: /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("label", { htmlFor: "bank_id", className: "form-label", children: [
                __("banco"),
                "*"
              ] }),
              /* @__PURE__ */ jsx(
                SelectSearch,
                {
                  name: "bank_id",
                  options: banks ? Object.keys(banks).map((id) => ({ value: id, label: banks[id] })) : [],
                  onChange: (selectedOption) => setData("bank_id", selectedOption ? selectedOption.value : ""),
                  required: true,
                  placeholder: __("banco_selec")
                }
              )
            ] }) }),
            /* @__PURE__ */ jsx("div", { className: "col-lg-2 text-center", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "featured", className: "form-label", children: __("cuenta_principal") }),
              /* @__PURE__ */ jsx("div", { className: "pt-1 position-relative", children: /* @__PURE__ */ jsx(
                Checkbox,
                {
                  className: "xl",
                  name: "featured",
                  checked: data.featured,
                  onChange: (e) => setData("featured", e.target.checked)
                }
              ) })
            ] }) }),
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
            /* @__PURE__ */ jsx("div", { className: "col-lg-6", children: /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "accounting_account_id", className: "form-label", children: __("cuenta_contable") }),
              /* @__PURE__ */ jsx(
                SelectSearch,
                {
                  name: "accounting_account_id",
                  options: accounting_accounts ? Object.keys(accounting_accounts).map((id) => ({ value: id, label: accounting_accounts[id] })) : [],
                  onChange: (selectedOption) => setData("accounting_account_id", selectedOption ? selectedOption.value : ""),
                  placeholder: __("cuenta_contable_selec")
                }
              )
            ] }) }),
            /* @__PURE__ */ jsx("div", { className: "m-0" }),
            /* @__PURE__ */ jsx("div", { className: "col-lg-2", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
              /* @__PURE__ */ jsxs("label", { htmlFor: "country_code", className: "form-label", children: [
                __("pais"),
                "*"
              ] }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  name: "country_code",
                  className: "text-end",
                  type: "text",
                  value: data.country_code,
                  onChange: (e) => setData("country_code", e.target.value),
                  maxLength: 4,
                  placeholder: "- - - -",
                  required: true
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.country_code })
            ] }) }),
            /* @__PURE__ */ jsx("div", { className: "col-lg-2", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
              /* @__PURE__ */ jsxs("label", { htmlFor: "entity", className: "form-label", children: [
                __("entidad"),
                "*"
              ] }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  name: "entity",
                  className: "text-end",
                  type: "text",
                  value: data.entity,
                  onChange: (e) => setData("entity", e.target.value),
                  maxLength: 4,
                  placeholder: "- - - -",
                  required: true
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.entity })
            ] }) }),
            /* @__PURE__ */ jsx("div", { className: "col-lg-2", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
              /* @__PURE__ */ jsxs("label", { htmlFor: "office", className: "form-label", children: [
                __("oficina"),
                "*"
              ] }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  name: "office",
                  className: "text-end",
                  type: "text",
                  value: data.office,
                  onChange: (e) => setData("office", e.target.value),
                  maxLength: 4,
                  placeholder: "- - - -",
                  required: true
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.office })
            ] }) }),
            /* @__PURE__ */ jsx("div", { className: "col-lg-2", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
              /* @__PURE__ */ jsxs("label", { htmlFor: "dc", className: "form-label", children: [
                __("DC"),
                "*"
              ] }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  name: "dc",
                  className: "text-end",
                  type: "text",
                  value: data.dc,
                  onChange: (e) => setData("dc", e.target.value),
                  maxLength: 2,
                  placeholder: "- -",
                  required: true
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.dc })
            ] }) }),
            /* @__PURE__ */ jsx("div", { className: "col-lg-4", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
              /* @__PURE__ */ jsxs("label", { htmlFor: "digits", className: "form-label", children: [
                __("cuenta"),
                "*"
              ] }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  name: "digits",
                  className: "text-end",
                  type: "text",
                  value: data.digits,
                  onChange: (e) => setData("digits", e.target.value),
                  maxLength: 10,
                  placeholder: "- - - - - - - - - -",
                  required: true
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.digits })
            ] }) })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mt-4 text-end", children: /* @__PURE__ */ jsx(PrimaryButton, { disabled: processing, className: "btn btn-rdn", children: processing ? __("procesando") + "..." : __("guardar") }) })
        ] }) })
      ]
    }
  );
}
export {
  Index as default
};
