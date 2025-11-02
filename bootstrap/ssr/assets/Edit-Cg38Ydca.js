import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-D8RSvDxD.js";
import { usePage, useForm, Head, router } from "@inertiajs/react";
import "@inertiajs/inertia";
import "react-tooltip";
import "react";
import { F as FileInput } from "./FileInput-U7oe6ye3.js";
import { I as InfoPopover } from "./InfoPopover-CwWEvwXq.js";
import { I as InputError } from "./InputError-DME5vguS.js";
import { P as PrimaryButton } from "./PrimaryButton-B91ets3U.js";
import { T as TextInput } from "./TextInput-p9mIVJQL.js";
import { u as useSweetAlert } from "./useSweetAlert-D4PAsWYN.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import "axios";
import "./Header-BDD-uIND.js";
import "react-bootstrap";
import "./Sidebar-BgmCyghN.js";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
import "sweetalert2";
function Index({ auth, session, title, subtitle, availableLocales, company }) {
  var _a;
  const __ = useTranslation();
  const props = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  props.locale || false;
  props.languages || [];
  const { showConfirm } = useSweetAlert();
  props.permissions || {};
  const { data, setData, errors, processing } = useForm({
    name: company.name || "",
    tradename: company.tradename || "",
    nif: company.nif || "",
    logo: null
  });
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
    router.post(route("companies.update", company.id), formData, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => console.log("Empresa actualizada"),
      onError: (errors2) => console.error("Errores:", errors2),
      onFinish: () => console.log("Petición finalizada")
    });
  }
  const handleDeleteLogo = () => {
    showConfirm({
      title: __("logo_eliminar"),
      text: __("logo_eliminar_confirm"),
      icon: "warning",
      onConfirm: () => {
        router.delete(route("companies.logo.delete", company.id), {
          preserveScroll: true,
          onSuccess: () => {
            location.reload();
          }
        });
      }
    });
  };
  const computeLogoSrc = (raw) => {
    if (typeof raw !== "string") return "";
    const r = raw.trim();
    if (!r) return "";
    if (r.startsWith("http") || r.startsWith("//")) return r;
    if (r.startsWith("/")) return r;
    if (r.includes("storage/")) return "/" + r.replace(/^\/+/, "");
    if (r.includes("companies/")) return "/storage/" + r.replace(/^\/+/, "");
    return `/storage/companies/${r.replace(/^\/+/, "")}`;
  };
  const actions = [
    { text: __("empresas_volver"), icon: "la-angle-left", url: "companies.index", modal: false },
    { text: __("empresa_nueva"), icon: "la-plus", url: "companies.create", modal: false }
  ];
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
              __("empresa"),
              " ",
              /* @__PURE__ */ jsx("u", { children: company.name }),
              company.is_ute ? /* @__PURE__ */ jsx("span", { className: "ms-2", children: "(UTE)" }) : ""
            ] }) }),
            /* @__PURE__ */ jsxs("div", { className: "col-12 mt-2 mb-4", children: [
              /* @__PURE__ */ jsxs("span", { className: "text-muted me-5", children: [
                __("creado"),
                ": ",
                /* @__PURE__ */ jsx("strong", { children: company.formatted_created_at })
              ] }),
              company.created_by_name && /* @__PURE__ */ jsxs("span", { className: "text-muted me-5", children: [
                __("creado_por"),
                ": ",
                /* @__PURE__ */ jsx("strong", { children: company.created_by_name })
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "text-muted me-5", children: [
                __("actualizado"),
                ": ",
                /* @__PURE__ */ jsx("strong", { children: company.formatted_updated_at })
              ] }),
              company.updated_by_name && /* @__PURE__ */ jsxs("span", { className: "text-muted me-5", children: [
                __("actualizado_por"),
                ": ",
                /* @__PURE__ */ jsx("strong", { children: company.updated_by_name })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx("form", { onSubmit: handleSubmit, children: /* @__PURE__ */ jsxs("div", { className: "row gy-3", children: [
            /* @__PURE__ */ jsx("div", { className: "col-lg-6", children: /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsxs("label", { htmlFor: "name", className: "form-label", children: [
                __("razon_social"),
                "*"
              ] }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  className: "",
                  type: "text",
                  placeholder: __("empresa_nombre"),
                  value: data.name,
                  onChange: (e) => setData("name", e.target.value),
                  maxLength: 100
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
                  className: "",
                  type: "text",
                  placeholder: __("nombre_comercial"),
                  value: data.tradename,
                  onChange: (e) => setData("tradename", e.target.value),
                  maxLength: 100
                }
              ),
              /* @__PURE__ */ jsx(InputError, { message: errors.tradename })
            ] }) }),
            /* @__PURE__ */ jsx("div", { className: "col-lg-3", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
              /* @__PURE__ */ jsxs("label", { htmlFor: "nif", className: "form-label", children: [
                __("nif"),
                "*"
              ] }),
              /* @__PURE__ */ jsx(
                TextInput,
                {
                  className: "",
                  type: "text",
                  placeholder: __("nif"),
                  value: data.nif,
                  onChange: (e) => setData("nif", e.target.value),
                  maxLength: 15
                }
              ),
              /* @__PURE__ */ jsx(InfoPopover, { code: "company-nif" }),
              /* @__PURE__ */ jsx(InputError, { message: errors.nif })
            ] }) }),
            /* @__PURE__ */ jsx("div", { className: "offset-lg-1 col-lg-8", children: /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("label", { htmlFor: "logo", className: "form-label", children: __("logo") }),
              company.logo ? /* @__PURE__ */ jsxs("div", { className: "d-flex align-items-start", children: [
                /* @__PURE__ */ jsx(
                  "img",
                  {
                    src: computeLogoSrc(company.logo),
                    alt: company.name,
                    className: "img-thumbnail me-3",
                    style: { maxWidth: "300px", objectFit: "contain" }
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    className: "ms-2 btn btn-sm btn-danger",
                    onClick: handleDeleteLogo,
                    children: /* @__PURE__ */ jsx("i", { className: "la la-trash" })
                  }
                )
              ] }) : /* @__PURE__ */ jsx(
                FileInput,
                {
                  name: "logo",
                  accept: "image/*",
                  onChange: handleChange,
                  error: errors.logo
                }
              ),
              /* @__PURE__ */ jsxs("p", { className: "pt-1 text-warning small", children: [
                /* @__PURE__ */ jsx("span", { className: "me-5", children: __("imagen_formato") }),
                /* @__PURE__ */ jsxs("span", { className: "me-5", children: [
                  __("imagen_peso_max"),
                  ": 1MB"
                ] }),
                __("imagen_medidas_recomendadas"),
                ": 400x400px"
              ] })
            ] }) }),
            /* @__PURE__ */ jsx("div", { className: "mt-4 text-end", children: /* @__PURE__ */ jsx(PrimaryButton, { disabled: processing, className: "btn btn-rdn", children: processing ? __("procesando") + "..." : __("guardar") }) })
          ] }) })
        ] })
      ]
    }
  );
}
export {
  Index as default
};
