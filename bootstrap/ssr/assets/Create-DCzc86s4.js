import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-CSWCGMVO.js";
import { usePage, useForm, Head } from "@inertiajs/react";
import { useEffect } from "react";
import { C as Checkbox } from "./Checkbox-C9HPJULq.js";
import { I as InputError } from "./InputError-DME5vguS.js";
import { P as PrimaryButton } from "./PrimaryButton-CIbKPOjQ.js";
import "./SelectInput-DrqFt-OA.js";
import { T as TextInput } from "./TextInput-CzxrbIpp.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import { u as useCompanySession } from "./Sidebar-C6XdPTvA.js";
import "@inertiajs/inertia";
import "./Header-BVvoXjVe.js";
import "react-bootstrap";
import "./useSweetAlert-D4PAsWYN.js";
import "sweetalert2";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
import "axios";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
function Create({
  auth,
  session,
  title,
  subtitle,
  owners = [],
  listTypes = [],
  statusOptions = []
}) {
  var _a;
  const __ = useTranslation();
  const props = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  props.locale || false;
  props.languages || [];
  const permissions = props.permissions || {};
  useCompanySession();
  const { data, setData, post, processing, errors, reset } = useForm({
    owner_id: "",
    name: "",
    slug: "",
    type: "",
    is_dynamic: false,
    status: 1,
    observations: ""
  });
  useEffect(() => {
    if (data.type === "dynamic" || data.type === "dinamica") {
      if (!data.is_dynamic) {
        setData("is_dynamic", true);
      }
    }
  }, [data.type]);
  const handleSubmit = (e) => {
    e.preventDefault();
    post(route("marketing-lists.store"), {
      preserveScroll: true,
      onSuccess: () => {
        reset("observations");
      },
      onError: () => {
      }
    });
  };
  const actions = [];
  if (permissions == null ? void 0 : permissions["marketing-lists.index"]) {
    actions.push({
      text: __("listas_volver"),
      icon: "la-angle-left",
      url: "marketing-lists.index",
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
                maxLength: 255,
                required: true
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.name })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "col-lg-2 text-center", children: /* @__PURE__ */ jsxs("div", { children: [
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
          /* @__PURE__ */ jsx("div", { className: "col-12", children: /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "observations", className: "form-label", children: __("Observaciones") }),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                id: "observations",
                name: "observations",
                className: "form-control",
                rows: 4,
                value: data.observations || "",
                onChange: (e) => setData("observations", e.target.value)
              }
            ),
            /* @__PURE__ */ jsx(
              InputError,
              {
                message: errors.observations,
                className: "mt-1"
              }
            )
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "mt-4 text-end", children: /* @__PURE__ */ jsx(PrimaryButton, { disabled: processing, className: "btn btn-rdn", children: processing ? __("procesando") + "..." : __("guardar") }) })
        ] }) }) })
      ]
    }
  );
}
export {
  Create as default
};
