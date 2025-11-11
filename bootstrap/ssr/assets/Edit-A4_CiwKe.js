import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-CS968Wx3.js";
import { usePage, useForm, Head, router } from "@inertiajs/react";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import { C as Checkbox } from "./Checkbox-B7oBdKeZ.js";
import { I as InputError } from "./InputError-DME5vguS.js";
import { P as PrimaryButton } from "./PrimaryButton-B91ets3U.js";
import { T as TextInput } from "./TextInput-CzxrbIpp.js";
import { u as useSweetAlert } from "./useSweetAlert-D4PAsWYN.js";
import "react";
import "axios";
import "@inertiajs/inertia";
import "./Header-Px-6ZOXw.js";
import "react-bootstrap";
import "./Sidebar-CypaLfnr.js";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
import "sweetalert2";
function Edit({ auth, session, title, subtitle, businessArea }) {
  var _a;
  const __ = useTranslation();
  const props = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  const permissions = props.permissions || {};
  useSweetAlert();
  const { data, setData, errors, processing } = useForm({
    name: businessArea.name || "",
    status: businessArea.status === 1 ? 1 : 0
  });
  function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append("_method", "PUT");
    formData.append("name", data.name);
    formData.append("status", data.status);
    router.post(route("business-areas.update", businessArea.id), formData, { forceFormData: true, preserveScroll: true });
  }
  const actions = [];
  if (permissions == null ? void 0 : permissions["business-areas.index"]) {
    actions.push({ text: __("areas_negocio_volver"), icon: "la-angle-left", url: "business-areas.index", modal: false });
  }
  if (permissions == null ? void 0 : permissions["business-areas.destroy"]) {
    actions.push({ text: __("eliminar"), icon: "la-trash", method: "delete", url: "business-areas.destroy", params: [businessArea.id], title: __("area_negocio_eliminar"), message: __("area_negocio_eliminar_confirm"), modal: false });
  }
  return /* @__PURE__ */ jsxs(AdminAuthenticated, { user: auth.user, title, subtitle, actions, children: [
    /* @__PURE__ */ jsx(Head, { title }),
    /* @__PURE__ */ jsxs("div", { className: "contents pb-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "row", children: [
        /* @__PURE__ */ jsx("div", { className: "col-12", children: /* @__PURE__ */ jsxs("h2", { children: [
          __("area_negocio"),
          " ",
          /* @__PURE__ */ jsx("u", { children: businessArea.name })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "col-12 mt-2 mb-4", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-muted me-5", children: [
            __("creado"),
            ": ",
            /* @__PURE__ */ jsx("strong", { children: businessArea.formatted_created_at })
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "text-muted me-5", children: [
            __("actualizado"),
            ": ",
            /* @__PURE__ */ jsx("strong", { children: businessArea.formatted_updated_at })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("form", { onSubmit: handleSubmit, children: /* @__PURE__ */ jsxs("div", { className: "row gy-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "col-lg-6", children: [
          /* @__PURE__ */ jsxs("label", { className: "form-label", children: [
            __("nombre"),
            "*"
          ] }),
          /* @__PURE__ */ jsx(TextInput, { value: data.name, onChange: (e) => setData("name", e.target.value), maxLength: 150, required: true }),
          /* @__PURE__ */ jsx(InputError, { message: errors.name })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "col-lg-2 text-center", children: [
          /* @__PURE__ */ jsx("label", { className: "form-label", children: __("estado") }),
          /* @__PURE__ */ jsx("div", { className: "pt-1 position-relative", children: /* @__PURE__ */ jsx(Checkbox, { className: "xl", name: "status", checked: data.status === 1, onChange: (e) => setData("status", e.target.checked ? 1 : 0) }) }),
          /* @__PURE__ */ jsx(InputError, { message: errors.status })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-4 text-end", children: /* @__PURE__ */ jsx(PrimaryButton, { disabled: processing, className: "btn btn-rdn", children: processing ? __("procesando") + "..." : __("guardar") }) })
      ] }) })
    ] })
  ] });
}
export {
  Edit as default
};
