import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-D8RSvDxD.js";
import { useForm, usePage, Head, router } from "@inertiajs/react";
import "@inertiajs/inertia";
import "react-tooltip";
import { useState, useRef } from "react";
import { C as Checkbox } from "./Checkbox-B7oBdKeZ.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import { F as FormDatePickerInput } from "./DatePickerToForm-7KZUnzNv.js";
import { I as InputError } from "./InputError-DME5vguS.js";
import { P as PrimaryButton } from "./PrimaryButton-B91ets3U.js";
import { T as TabsLocale } from "./TabsLocale-PWDAW6Iq.js";
import CreatableSelect from "react-select/creatable";
import { T as Textarea } from "./Textarea-nvTyMSx8.js";
import { T as TextInput } from "./TextInput-p9mIVJQL.js";
import "sweetalert2";
import { u as useHandleDelete } from "./useHandleDelete-B2XtFf-J.js";
import "axios";
import "./Header-BDD-uIND.js";
import "react-bootstrap";
import "./useSweetAlert-D4PAsWYN.js";
import "./Sidebar-BgmCyghN.js";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
import "react-datepicker";
/* empty css                          */
import "date-fns/locale";
import "./Tabs-Cd7Sj0t_.js";
import "react-draft-wysiwyg";
import "draft-js";
import "html-to-draftjs";
import "draftjs-to-html";
/* empty css                             */
function Copyable({ code }) {
  const __ = useTranslation();
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef();
  const fallbackCopy = (text) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
    } catch (err) {
      console.error("Fallback: copia fallida", err);
    }
    document.body.removeChild(textarea);
  };
  const handleClick = () => {
    const doCopy = () => {
      setCopied(true);
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), 1500);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(doCopy).catch(() => {
        fallbackCopy(code);
        doCopy();
      });
    } else {
      fallbackCopy(code);
      doCopy();
    }
  };
  return /* @__PURE__ */ jsxs("div", { className: "wrap-copy", onClick: handleClick, children: [
    code,
    copied && /* @__PURE__ */ jsx("div", { className: "copy-tooltip", children: __("texto_copiado") })
  ] });
}
function TagSelect({ value = [], onChange, placeholder = "" }) {
  const currentTags = Array.isArray(value) ? value : [];
  const options = currentTags.map((v) => ({ label: v, value: v }));
  return /* @__PURE__ */ jsx(
    CreatableSelect,
    {
      isMulti: true,
      placeholder,
      options,
      value: options,
      onChange: (selected) => {
        const tags = selected ? selected.map((o) => o.value) : [];
        onChange(tags);
      },
      className: "react-select-container",
      classNamePrefix: "react-select"
    }
  );
}
function Index({ auth, session, title, subtitle, availableLocales, content_, titles, tags, excerpts, contents }) {
  var _a, _b, _c;
  const localizedDefaults = Object.fromEntries(
    availableLocales.flatMap((code) => {
      const t0 = (titles == null ? void 0 : titles[code]) ?? "";
      const e0 = (excerpts == null ? void 0 : excerpts[code]) ?? "";
      const c0 = (contents == null ? void 0 : contents[code]) ?? "";
      let parsedTags = [];
      const raw = tags == null ? void 0 : tags[code];
      if (Array.isArray(raw)) {
        parsedTags = raw;
      } else if (typeof raw === "string") {
        try {
          parsedTags = JSON.parse(raw);
        } catch (err) {
          parsedTags = [];
          console.warn(`No pude parsear tags_${code} =`, raw);
        }
      }
      return [
        [`title_${code}`, t0],
        [`tags_${code}`, parsedTags],
        [`excerpt_${code}`, e0],
        [`content_${code}`, c0]
      ];
    })
  );
  const { data, setData, errors, processing, post } = useForm({
    name: content_.name || "",
    status: content_.status,
    published_at: content_.published_at || null,
    published_end: content_.published_end || null,
    observations: content_.observations || "",
    ...localizedDefaults
  });
  const publishedAt = data.published_at ? new Date(data.published_at) : null;
  const publishedEnd = data.published_end ? new Date(data.published_end) : null;
  const __ = useTranslation();
  const props = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  const locale = props.locale || false;
  const languages = props.languages || [];
  const permissions = props.permissions || {};
  const datepickerFormat = ((_c = (_b = props.languages) == null ? void 0 : _b[locale]) == null ? void 0 : _c[6]) || "dd/MM/yyyy";
  const localErrors = {};
  if (publishedAt) {
    if (!publishedEnd) localErrors.published_end = "Fecha fin obligatoria";
    else if (publishedEnd < publishedAt)
      localErrors.published_end = "Fecha fin anterior a inicio";
  }
  const handleChange = (e) => {
    const { name, type, checked, value, files } = e.target;
    if (type === "checkbox") {
      setData(name, checked);
    } else if (type === "file") {
      setData(name, files.length ? files[0] : null);
    } else {
      setData(name, value);
    }
  };
  useHandleDelete("contenido", "contents.destroy", [content_.id]);
  function handleSubmit(e) {
    e.preventDefault();
    if (localErrors.published_end) {
      return;
    }
    const formData = new FormData();
    formData.append("_method", "PUT");
    Object.entries(data).forEach(([key, value]) => {
      if (key === "logo" && value instanceof File) {
        formData.append(key, value);
      } else if (value instanceof Date) {
        formData.append(key, value.toISOString());
      } else if (value === null) {
        formData.append(key, "");
      } else if (typeof value === "object") {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value);
      }
    });
    router.post(route("contents.update", content_.id), formData, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => console.log("Contenido actualizado"),
      onError: (errors2) => console.error("Errores:", errors2),
      onFinish: () => console.log("Petición finalizada")
    });
  }
  const actions = [];
  if (permissions == null ? void 0 : permissions["contents.index"]) {
    actions.push({
      text: __("contenidos_volver"),
      icon: "la-angle-left",
      url: "contents.index",
      modal: false
    });
  }
  if (permissions == null ? void 0 : permissions["contents.create"]) {
    actions.push({
      text: __("contenido_nuevo"),
      icon: "la-plus",
      url: "contents.create",
      modal: false
    });
  }
  if (permissions == null ? void 0 : permissions["contents.destroy"]) {
    actions.push({
      text: __("eliminar"),
      icon: "la-trash",
      method: "delete",
      url: "contents.destroy",
      params: [content_.id],
      title: __("contenido_eliminar"),
      message: __("contenido_eliminar_confirm"),
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
              __("contenido"),
              " ",
              /* @__PURE__ */ jsx("u", { children: content_.name })
            ] }) }),
            /* @__PURE__ */ jsxs("div", { className: "col-12 mt-2 mb-4", children: [
              /* @__PURE__ */ jsxs("span", { className: "text-muted me-5", children: [
                __("creado"),
                ": ",
                /* @__PURE__ */ jsx("strong", { children: content_.formatted_created_at })
              ] }),
              content_.created_by_name && /* @__PURE__ */ jsxs("span", { className: "text-muted me-5", children: [
                __("creado_por"),
                ": ",
                /* @__PURE__ */ jsx("strong", { children: content_.created_by_name })
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "text-muted me-5", children: [
                __("actualizado"),
                ": ",
                /* @__PURE__ */ jsx("strong", { children: content_.formatted_updated_at })
              ] }),
              content_.updated_by_name && /* @__PURE__ */ jsxs("span", { className: "text-muted me-5", children: [
                __("actualizado_por"),
                ": ",
                /* @__PURE__ */ jsx("strong", { children: content_.updated_by_name })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
            /* @__PURE__ */ jsxs("div", { className: "row gy-3", children: [
              /* @__PURE__ */ jsx("div", { className: "col-lg-4", children: /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "code", className: "form-label", children: __("codigo") }),
                /* @__PURE__ */ jsx(Copyable, { code: content_.code })
              ] }) }),
              /* @__PURE__ */ jsx("div", { className: "col-lg-8", children: /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("label", { htmlFor: "name", className: "form-label", children: [
                  __("nombre"),
                  "*"
                ] }),
                /* @__PURE__ */ jsx(
                  TextInput,
                  {
                    className: "",
                    type: "text",
                    placeholder: __("contenido_nombre"),
                    value: data.name,
                    onChange: (e) => setData("name", e.target.value),
                    maxLength: 100
                  }
                ),
                /* @__PURE__ */ jsx(InputError, { message: errors.name })
              ] }) }),
              /* @__PURE__ */ jsx("div", { className: "col-lg-4", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "published_at", className: "form-label", children: __("fecha_publicacion") }),
                /* @__PURE__ */ jsx(
                  FormDatePickerInput,
                  {
                    id: "published_at",
                    name: "published_at",
                    selected: data.published_at ? new Date(data.published_at) : null,
                    onChange: (name, date) => {
                      setData(name, date);
                      if (!date) {
                        setData("published_end", null);
                      }
                    },
                    dateFormat: datepickerFormat
                  }
                ),
                /* @__PURE__ */ jsx(InputError, { message: errors.published_at })
              ] }) }),
              /* @__PURE__ */ jsx("div", { className: "col-lg-4", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "published_end", className: "form-label", children: __("publicacion_fin") }),
                /* @__PURE__ */ jsx(
                  FormDatePickerInput,
                  {
                    id: "published_end",
                    name: "published_end",
                    selected: data.published_end ? new Date(data.published_end) : null,
                    onChange: setData,
                    minDate: data.published_at ? new Date(data.published_at) : null,
                    dateFormat: datepickerFormat
                  }
                ),
                /* @__PURE__ */ jsx(InputError, { message: localErrors.published_end || errors.published_end })
              ] }) }),
              /* @__PURE__ */ jsx("div", { className: "col-lg-2 text-center", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "status", className: "form-label", children: __("contenido_activo") }),
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
              /* @__PURE__ */ jsx("div", { className: "col-12 mt-4", children: /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "observations", className: "form-label", children: __("observaciones") }),
                /* @__PURE__ */ jsx(
                  Textarea,
                  {
                    id: "observations",
                    name: "observations",
                    value: data.observations,
                    onChange: handleChange,
                    className: "form-control"
                  }
                ),
                /* @__PURE__ */ jsx(InputError, { message: errors.observations })
              ] }) }),
              /* @__PURE__ */ jsx("div", { className: "col-12 mt-4", children: /* @__PURE__ */ jsx(TabsLocale, { availableLocales, languages, children: (locale2) => {
                const humanName = Array.isArray(languages[locale2]) ? languages[locale2][3] : locale2;
                const fieldTitle = `title_${locale2}`;
                const fieldTags = `tags_${locale2}`;
                const fieldExcerpt = `excerpt_${locale2}`;
                const fieldContent = `content_${locale2}`;
                return /* @__PURE__ */ jsxs("div", { className: "row", children: [
                  /* @__PURE__ */ jsxs("div", { className: "col-12 mb-3", children: [
                    /* @__PURE__ */ jsxs(
                      "label",
                      {
                        htmlFor: fieldTitle,
                        className: "form-label",
                        children: [
                          __("titulo"),
                          " ",
                          humanName
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      TextInput,
                      {
                        id: fieldTitle,
                        name: fieldTitle,
                        className: "",
                        type: "text",
                        value: data[fieldTitle] || "",
                        onChange: (e) => setData(fieldTitle, e.target.value),
                        onKeyDown: (e) => e.key === "Enter" && e.preventDefault(),
                        maxLength: 150
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "col-12 mb-3", children: [
                    /* @__PURE__ */ jsxs(
                      "label",
                      {
                        htmlFor: fieldTags,
                        className: "form-label",
                        children: [
                          __("tags"),
                          " ",
                          humanName
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      TagSelect,
                      {
                        value: Array.isArray(data[fieldTags]) ? data[fieldTags] : [],
                        onChange: (tags2) => setData(fieldTags, tags2)
                      }
                    ),
                    /* @__PURE__ */ jsx(InputError, { message: errors.tags_es })
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "col-12 mb-3", children: [
                    /* @__PURE__ */ jsxs(
                      "label",
                      {
                        htmlFor: fieldExcerpt,
                        className: "form-label",
                        children: [
                          __("destacado"),
                          " ",
                          humanName
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      Textarea,
                      {
                        id: fieldExcerpt,
                        name: fieldExcerpt,
                        value: data[fieldExcerpt] || "",
                        onChange: handleChange,
                        className: "form-control"
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs("div", { className: "col-12 mb-3", children: [
                    /* @__PURE__ */ jsxs(
                      "label",
                      {
                        htmlFor: fieldContent,
                        className: "form-label",
                        children: [
                          __("contenido"),
                          " ",
                          humanName
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      Textarea,
                      {
                        id: fieldContent,
                        name: fieldContent,
                        value: data[fieldContent] ?? "",
                        wysiwyg: true,
                        onChange: (e) => setData(fieldContent, e.target.value),
                        className: ""
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      InputError,
                      {
                        message: errors[fieldContent]
                      }
                    )
                  ] })
                ] }, locale2);
              } }) })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "mt-4 text-end", children: /* @__PURE__ */ jsx(
              PrimaryButton,
              {
                disabled: processing || Boolean(localErrors.published_end),
                className: "btn btn-rdn",
                children: processing ? __("procesando") + "..." : __("guardar")
              }
            ) })
          ] })
        ] })
      ]
    }
  );
}
export {
  Index as default
};
