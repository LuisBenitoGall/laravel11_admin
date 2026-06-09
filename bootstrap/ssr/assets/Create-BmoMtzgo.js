import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-CS0xV2Ze.js";
import { usePage, useForm, Head } from "@inertiajs/react";
import "react-tooltip";
import "react";
import "./FileInput-U7oe6ye3.js";
import { I as InputError } from "./InputError-DME5vguS.js";
import { P as PrimaryButton } from "./PrimaryButton-CIbKPOjQ.js";
import { S as SelectSearch } from "./SelectSearch-x7o6yKJV.js";
import { T as Textarea } from "./Textarea-nvTyMSx8.js";
import { T as TextInput } from "./TextInput-CzxrbIpp.js";
import { U as UserSearch } from "./UserSearch-Bn5gVs5d.js";
import { O as OpportunityStatusSelect } from "./OpportunityStatusSelect-DpuaHxuk.js";
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
  crmAccounts = []
}) {
  var _a;
  const __ = useTranslation();
  const props = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  props.locale || false;
  props.languages || [];
  const permissions = props.permissions || {};
  const { data, setData, post, reset, errors, processing } = useForm({
    name: "",
    user_id: null,
    observations: "",
    crm_account_id: null,
    status: 1
    // 1 = "oportunidad_nueva" (fallback)
  });
  function handleSubmit(e) {
    e.preventDefault();
    post(route("crm-opportunities.store"), {
      onSuccess: () => reset()
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
  const crmAccountOptions = (crmAccounts || []).map((acc) => ({
    value: acc.id,
    label: acc.name,
    meta: acc
  }));
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
          /* @__PURE__ */ jsx("div", { className: "col-lg-6", children: /* @__PURE__ */ jsx(
            UserSearch,
            {
              label: __("contacto") + "*",
              name: "user_id",
              searchUrl: route("users.search"),
              value: null,
              onChange: (user) => setData("user_id", user ? user.id : null),
              placeholder: __("usuario_buscar"),
              error: errors.user_id,
              extraParams: { for_crm_link: 1 },
              required: true
            }
          ) }),
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
        ] }) }) })
      ]
    }
  );
}
export {
  Index as default
};
