import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-CS968Wx3.js";
import { usePage, useForm, Head } from "@inertiajs/react";
import "@inertiajs/inertia";
import "react-tooltip";
import "react";
import { C as Checkbox } from "./Checkbox-B7oBdKeZ.js";
import { I as InputError } from "./InputError-DME5vguS.js";
import { P as PrimaryButton } from "./PrimaryButton-B91ets3U.js";
import { T as TabsLocale } from "./TabsLocale-PWDAW6Iq.js";
import { T as Textarea } from "./Textarea-nvTyMSx8.js";
import { T as TextInput } from "./TextInput-CzxrbIpp.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import { u as useHandleDelete } from "./useHandleDelete-B2XtFf-J.js";
import "axios";
import "./Header-Px-6ZOXw.js";
import "react-bootstrap";
import "./useSweetAlert-D4PAsWYN.js";
import "sweetalert2";
import "./Sidebar-CypaLfnr.js";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
import "./Tabs-Cd7Sj0t_.js";
import "react-draft-wysiwyg";
import "draft-js";
import "html-to-draftjs";
import "draftjs-to-html";
/* empty css                             */
function Index({ auth, session, title, subtitle, availableLocales, movement, explanations, sign }) {
  var _a;
  const __ = useTranslation();
  const props = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  props.locale || false;
  const languages = props.languages || [];
  const permissions = props.permissions || {};
  const { data, setData, put, reset, errors, processing } = useForm({
    name: movement.name || "",
    acronym: movement.acronym || "",
    status: movement.status,
    ...Object.fromEntries(
      availableLocales.map((code) => [
        `explanation_${code}`,
        explanations[code] || ""
      ])
    )
  });
  const handleChange = (e) => {
    const { name, type, checked, value, files } = e.target;
    if (type === "checkbox") {
      setData(name, checked);
    } else if (type === "file") {
      setData(name, files[0]);
    } else {
      setData(name, value);
    }
  };
  useHandleDelete("movimiento", "stock-movements.destroy", [movement.id]);
  function handleSubmit(e) {
    e.preventDefault();
    put(
      route("stock-movements.update", movement.id),
      {
        preserveScroll: true,
        onSuccess: () => console.log("Movimiento actualizado")
      }
    );
  }
  const actions = [];
  if (permissions == null ? void 0 : permissions["stock-movements.index"]) {
    actions.push({
      text: __("stock_movimientos_volver"),
      icon: "la-angle-left",
      url: "stock-movements.index",
      modal: false
    });
  }
  if (permissions == null ? void 0 : permissions["stock-movements.create"]) {
    actions.push({
      text: __("movimiento_nuevo"),
      icon: "la-plus",
      url: "stock-movements.create",
      modal: false
    });
  }
  if (permissions == null ? void 0 : permissions["stock-movements.destroy"]) {
    actions.push({
      text: __("eliminar"),
      icon: "la-trash",
      method: "delete",
      url: "stock-movements.destroy",
      params: [movement.id],
      title: __("movimiento_eliminar"),
      message: __("movimiento_eliminar_confirm"),
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
              __("stock_movimiento"),
              " ",
              /* @__PURE__ */ jsx("u", { children: movement.name })
            ] }) }),
            /* @__PURE__ */ jsxs("div", { className: "col-12 mt-2 mb-4", children: [
              /* @__PURE__ */ jsxs("span", { className: "text-muted me-5", children: [
                __("creado"),
                ": ",
                /* @__PURE__ */ jsx("strong", { children: movement.formatted_created_at })
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "text-muted me-5", children: [
                __("actualizado"),
                ": ",
                /* @__PURE__ */ jsx("strong", { children: movement.formatted_updated_at })
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "text-muted me-5", children: [
                __("signo"),
                ": ",
                /* @__PURE__ */ jsx("strong", { children: sign })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
            /* @__PURE__ */ jsxs("div", { className: "row gy-3", children: [
              /* @__PURE__ */ jsx("div", { className: "col-lg-6", children: /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("label", { htmlFor: "name", className: "form-label", children: [
                  __("movimiento"),
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
                    maxLength: 150,
                    required: true
                  }
                ),
                /* @__PURE__ */ jsx(InputError, { message: errors.name })
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
              /* @__PURE__ */ jsx("div", { className: "col-lg-2", children: /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("label", { htmlFor: "acronym", className: "form-label", children: [
                  __("siglas"),
                  "*"
                ] }),
                /* @__PURE__ */ jsx(
                  TextInput,
                  {
                    className: "",
                    type: "text",
                    placeholder: __("siglas"),
                    value: data.acronym,
                    onChange: (e) => setData("acronym", e.target.value),
                    maxLength: 3,
                    required: true
                  }
                ),
                /* @__PURE__ */ jsx(InputError, { message: errors.acronym })
              ] }) }),
              /* @__PURE__ */ jsx("div", { className: "col-12 mt-4", children: /* @__PURE__ */ jsx(TabsLocale, { availableLocales, languages, children: (locale2) => {
                const humanName = Array.isArray(languages[locale2]) ? languages[locale2][3] : locale2;
                const fieldName = `explanation_${locale2}`;
                return /* @__PURE__ */ jsxs("div", { className: "mb-3", children: [
                  /* @__PURE__ */ jsxs(
                    "label",
                    {
                      htmlFor: `explanation_[${locale2}]`,
                      className: "form-label",
                      children: [
                        __("observaciones"),
                        " ",
                        humanName
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    Textarea,
                    {
                      id: fieldName,
                      name: fieldName,
                      value: data[fieldName] || "",
                      onChange: handleChange,
                      className: "form-control"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    InputError,
                    {
                      message: errors[fieldName]
                    }
                  )
                ] });
              } }) })
            ] }),
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
