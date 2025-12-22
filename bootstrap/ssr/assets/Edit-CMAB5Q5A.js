import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-C651LzvL.js";
import { usePage, useForm, Head } from "@inertiajs/react";
import "react-tooltip";
import "react";
import "./FileInput-U7oe6ye3.js";
import { P as PrimaryButton } from "./PrimaryButton-CIbKPOjQ.js";
import "react-draft-wysiwyg";
import "draft-js";
import "html-to-draftjs";
import "draftjs-to-html";
/* empty css                             */
import "./TextInput-CzxrbIpp.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import "@inertiajs/inertia";
import "./Header-DbWsFjJj.js";
import "react-bootstrap";
import "./useSweetAlert-D4PAsWYN.js";
import "sweetalert2";
import "./Sidebar-BsJktKN8.js";
import "axios";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
function Index({
  auth,
  session,
  title,
  subtitle,
  availableLocales,
  opportunity,
  crmAccounts = []
}) {
  var _a;
  const __ = useTranslation();
  const props = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  props.locale || false;
  props.languages || [];
  const permissions = props.permissions || {};
  const { data, setData, errors, processing } = useForm({
    name: opportunity.name || "",
    status: opportunity.status
  });
  const { handleDelete } = useHandleDelete("iva_tipo", "iva-types.destroy", [opportunity.id]);
  function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append("_method", "PUT");
    Object.entries(data).forEach(([key, value]) => {
      if (key === "logo" && value instanceof File) {
        formData.append(key, value);
      } else if (typeof value === "object" && value !== null) {
        formData.append(key, JSON.stringify(value));
      } else if (value !== null && value !== void 0) {
        formData.append(key, value);
      }
    });
    router.post(route("crm-opportunities.update", opportunity.id), formData, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => console.log("Tipo IVA actualizado"),
      onError: (errors2) => console.error("Errores:", errors2),
      onFinish: () => console.log("Petición finalizada")
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
          /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
            /* @__PURE__ */ jsx("div", { className: "row gy-3" }),
            /* @__PURE__ */ jsx("div", { className: "mt-4 text-end", children: /* @__PURE__ */ jsx(PrimaryButton, { disabled: processing, className: "btn btn-rdn", children: processing ? __("procesando") + "..." : __("guardar") }) })
          ] })
        ] })
      ]
    }
  );
}
export {
  Index as default
};
