import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-Be6zbhrA.js";
import { usePage, useForm, Head } from "@inertiajs/react";
import "react-tooltip";
import "react";
import { C as Checkbox } from "./Checkbox-B7oBdKeZ.js";
import { I as InputError } from "./InputError-DME5vguS.js";
import { P as PrimaryButton } from "./PrimaryButton-B91ets3U.js";
import { T as TextInput } from "./TextInput-CzxrbIpp.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import "axios";
import "@inertiajs/inertia";
import "./Header-DmTv-HRw.js";
import "react-bootstrap";
import "./useSweetAlert-D4PAsWYN.js";
import "sweetalert2";
import "./Sidebar-j3CEPiJG.js";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
function Index({ auth, session, title, subtitle, availableLocales }) {
  var _a;
  const __ = useTranslation();
  const props = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  props.locale || false;
  props.languages || [];
  const permissions = props.permissions || {};
  const { data, setData, post, reset, errors, processing } = useForm({
    name: "",
    tradename: "",
    lei: "",
    swift: "",
    eu_code: "",
    supervisor_code: "",
    status: true
  });
  function handleSubmit(e) {
    e.preventDefault();
    post(route("banks.store"), {
      onSuccess: () => reset()
    });
  }
  const actions = [];
  if (permissions == null ? void 0 : permissions["banks.index"]) {
    actions.push({
      text: __("bancos_volver"),
      icon: "la-angle-left",
      url: "banks.index",
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
              /* @__PURE__ */ jsxs("label", { htmlFor: "name", className: "form-label", children: [
                __("banco"),
                "*"
              ] }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  name: "name",
                  className: "",
                  type: "text",
                  placeholder: __("nombre"),
                  value: data.name,
                  onChange: (e) => setData("name", e.target.value),
                  maxLength: 100,
                  required: true
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.name })
            ] }) }),
            /* @__PURE__ */ jsx("div", { className: "col-lg-6", children: /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("label", { htmlFor: "tradename", className: "form-label", children: [
                __("nombre_comercial"),
                "*"
              ] }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  name: "tradename",
                  className: "",
                  type: "text",
                  placeholder: __("nombre_comercial"),
                  value: data.tradename,
                  onChange: (e) => setData("tradename", e.target.value),
                  maxLength: 100,
                  required: true
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.tradename })
            ] }) }),
            /* @__PURE__ */ jsx("div", { className: "col-lg-6", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "lei", className: "form-label", children: __("lei") }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  name: "lei",
                  className: "",
                  type: "text",
                  placeholder: __("lei"),
                  value: data.lei,
                  onChange: (e) => setData("lei", e.target.value),
                  maxLength: 25
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.lei })
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
            /* @__PURE__ */ jsx("div", { className: "w-100 m-0" }),
            /* @__PURE__ */ jsx("div", { className: "col-lg-4", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "swift", className: "form-label", children: __("swift_bic") }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  name: "swift",
                  className: "",
                  type: "text",
                  placeholder: __("swift_bic"),
                  value: data.swift,
                  onChange: (e) => setData("swift", e.target.value),
                  maxLength: 11
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.swift })
            ] }) }),
            /* @__PURE__ */ jsx("div", { className: "col-lg-4", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "eu_code", className: "form-label", children: __("codigo_europeo") }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  name: "eu_code",
                  className: "",
                  type: "text",
                  placeholder: __("codigo_europeo"),
                  value: data.eu_code,
                  onChange: (e) => setData("eu_code", e.target.value),
                  maxLength: 10
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.eu_code })
            ] }) }),
            /* @__PURE__ */ jsx("div", { className: "col-lg-4", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "supervisor_code", className: "form-label", children: __("codigo_supervisor") }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  name: "supervisor_code",
                  className: "",
                  type: "text",
                  placeholder: __("codigo_supervisor"),
                  value: data.supervisor_code,
                  onChange: (e) => setData("supervisor_code", e.target.value),
                  maxLength: 10
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.supervisor_code })
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
