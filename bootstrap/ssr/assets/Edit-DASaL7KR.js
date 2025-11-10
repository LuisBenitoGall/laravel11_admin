import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-DT2NIV1N.js";
import { usePage, useForm, Head } from "@inertiajs/react";
import "react-tooltip";
import { useState, useEffect } from "react";
import { I as InputError } from "./InputError-DME5vguS.js";
import { P as PrimaryButton } from "./PrimaryButton-B91ets3U.js";
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
const __variableDynamicImportRuntimeHelper = (glob, path, segs) => {
  const v = glob[path];
  if (v) {
    return typeof v === "function" ? v() : Promise.resolve(v);
  }
  return new Promise((_, reject) => {
    (typeof queueMicrotask === "function" ? queueMicrotask : setTimeout)(
      reject.bind(
        null,
        new Error(
          "Unknown variable dynamic import: " + path + (path.split("/").length !== segs ? ". Note that variables only represent file names one level deep." : "")
        )
      )
    );
  });
};
function useFiscalTranslation() {
  const { props } = usePage();
  const locale = props.locale || "en";
  const [translations, setTranslations] = useState({});
  useEffect(() => {
    __variableDynamicImportRuntimeHelper(/* @__PURE__ */ Object.assign({}), `../../lang/${locale}_fiscal.json`, 4).then((module) => {
      setTranslations(module.default);
    });
  }, [locale]);
  return (key) => {
    return translations[key] || key;
  };
}
function Index({ auth, session, title, subtitle, type, mode_name, availableLocales }) {
  var _a;
  const __ = useTranslation();
  const ft = useFiscalTranslation();
  const props = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  props.locale || false;
  props.languages || [];
  const permissions = props.permissions || {};
  const { data, setData, put, reset, errors, processing } = useForm({
    name: type.name || ""
  });
  function handleSubmit(e) {
    e.preventDefault();
    put(
      route("accounting-account-types.update", type.id),
      {
        preserveScroll: true,
        onSuccess: () => console.log("Movimiento actualizado")
      }
    );
  }
  const actions = [];
  if (permissions == null ? void 0 : permissions["accounting-account-types.index"]) {
    actions.push({
      text: __("grupos_contables_volver"),
      icon: "la-angle-left",
      url: "accounting-account-types.index",
      modal: false
    });
  }
  if (permissions == null ? void 0 : permissions["accounting-account-types.create"]) {
    actions.push({
      text: __("grupo_nuevo"),
      icon: "la-plus",
      url: "accounting-account-types.create",
      modal: false
    });
  }
  if (permissions == null ? void 0 : permissions["accounting-account-types.destroy"]) {
    actions.push({
      text: __("eliminar"),
      icon: "la-trash",
      method: "delete",
      url: "accounting-account-types.destroy",
      params: [type.id],
      title: __("grupo_contable_eliminar"),
      message: __("grupo_contable_eliminar_confirm"),
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
              __("grupo_contable"),
              " ",
              /* @__PURE__ */ jsx("u", { children: ft(type.name) })
            ] }) }),
            /* @__PURE__ */ jsxs("div", { className: "col-12 mt-2 mb-4", children: [
              /* @__PURE__ */ jsxs("span", { className: "text-muted me-5", children: [
                __("creado"),
                ": ",
                /* @__PURE__ */ jsx("strong", { children: type.formatted_created_at })
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "text-muted me-5", children: [
                __("actualizado"),
                ": ",
                /* @__PURE__ */ jsx("strong", { children: type.formatted_updated_at })
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "text-muted me-5", children: [
                __("codigo"),
                ": ",
                /* @__PURE__ */ jsx("strong", { children: type.code })
              ] }),
              mode_name !== false && /* @__PURE__ */ jsxs("span", { className: "text-muted me-5", children: [
                __("modo"),
                ": ",
                /* @__PURE__ */ jsx("strong", { children: mode_name })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
            /* @__PURE__ */ jsx("div", { className: "row gy-3 mb-3", children: /* @__PURE__ */ jsx("div", { className: "col-lg-6", children: /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("label", { htmlFor: "name", className: "form-label", children: [
                __("nombre"),
                "*"
              ] }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
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
            ] }) }) }),
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
