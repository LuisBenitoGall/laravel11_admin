import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-BRTzhI3c.js";
import { usePage, useForm, Head, router } from "@inertiajs/react";
import "@inertiajs/inertia";
import "react";
import { F as FileInput } from "./FileInput-U7oe6ye3.js";
import { I as InputError } from "./InputError-DME5vguS.js";
import { P as PrimaryButton } from "./PrimaryButton-CIbKPOjQ.js";
import { T as TextInput } from "./TextInput-CzxrbIpp.js";
import { L as LocationSelects } from "./LocationSelects-B4vI2QcJ.js";
import { u as useSweetAlert } from "./useSweetAlert-D4PAsWYN.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import "./Header-DbWsFjJj.js";
import "react-bootstrap";
import "sweetalert2";
import "./Sidebar-BsJktKN8.js";
import "axios";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
function Edit({ auth, session, title, subtitle, workplace, company, countries }) {
  var _a;
  const __ = useTranslation();
  const props = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  const { showConfirm } = useSweetAlert();
  props.locale || false;
  props.languages || [];
  const permissions = props.permissions || {};
  const { data, setData, errors, processing } = useForm({
    name: workplace.name || "",
    description: workplace.description || "",
    country_id: workplace.country_id || "",
    province_id: workplace.province_id || "",
    town_id: workplace.town_id || "",
    cp: workplace.cp || "",
    address: workplace.address || "",
    website: workplace.website || "",
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
    router.post(route("workplaces.update", workplace.id), formData, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => console.log("Centro actualizado"),
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
        router.delete(route("workplaces.logo.delete", workplace.id), {
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
    if (r.includes("workplaces/") || r.includes("companies/")) return "/storage/" + r.replace(/^\/+/, "");
    return `/storage/workplaces/${r.replace(/^\/+/, "")}`;
  };
  const actions = [];
  if (permissions == null ? void 0 : permissions["workplaces.index"]) {
    actions.push({
      text: __("centros_volver"),
      icon: "la-angle-left",
      url: "workplaces.index",
      params: workplace.company_id,
      modal: false
    });
  }
  if (permissions == null ? void 0 : permissions["workplaces.create"]) {
    actions.push({
      text: __("centro_nuevo"),
      icon: "la-plus",
      url: "workplaces.create",
      params: workplace.company_id,
      modal: false
    });
  }
  if (permissions == null ? void 0 : permissions["workplaces.destroy"]) {
    actions.push({
      text: __("eliminar"),
      icon: "la-trash",
      method: "delete",
      url: "workplaces.destroy",
      params: [workplace.id],
      title: __("centro_trabajo_eliminar"),
      message: __("centro_trabajo_eliminar_confirm"),
      modal: false
    });
  }
  return /* @__PURE__ */ jsxs(AdminAuthenticated, { user: auth.user, title, subtitle, actions, children: [
    /* @__PURE__ */ jsx(Head, { title }),
    /* @__PURE__ */ jsxs("div", { className: "contents pb-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "row", children: [
        /* @__PURE__ */ jsx("div", { className: "col-12", children: /* @__PURE__ */ jsxs("h2", { children: [
          __("centro_trabajo"),
          " ",
          /* @__PURE__ */ jsx("u", { children: workplace.name })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "col-12 mt-2 mb-4", children: [
          /* @__PURE__ */ jsxs("span", { className: "text-muted me-5", children: [
            __("empresa"),
            ": ",
            /* @__PURE__ */ jsx("strong", { children: company.name })
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "text-muted me-5", children: [
            __("creado"),
            ": ",
            /* @__PURE__ */ jsx("strong", { children: workplace.formatted_created_at })
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "text-muted me-5", children: [
            __("actualizado"),
            ": ",
            /* @__PURE__ */ jsx("strong", { children: workplace.formatted_updated_at })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsx("form", { onSubmit: handleSubmit, children: /* @__PURE__ */ jsxs("div", { className: "row gy-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "col-lg-6", children: [
          /* @__PURE__ */ jsxs("label", { className: "form-label", children: [
            __("centro_trabajo"),
            "*"
          ] }),
          /* @__PURE__ */ jsx(TextInput, { value: data.name, onChange: (e) => setData("name", e.target.value), maxLength: 150, required: true }),
          /* @__PURE__ */ jsx(InputError, { message: errors.name })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "col-12", children: [
          /* @__PURE__ */ jsx("label", { className: "form-label", children: __("descripcion") }),
          /* @__PURE__ */ jsx("textarea", { className: "form-control", rows: "3", value: data.description, onChange: (e) => setData("description", e.target.value) }),
          /* @__PURE__ */ jsx(InputError, { message: errors.description })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "col-12", children: /* @__PURE__ */ jsx(LocationSelects, { countries, formData: data, setData, provincesUrl: "/api/provinces", townsUrl: "/api/towns", labels: { country: __("pais"), province: __("provincia"), town: __("poblacion") } }) }),
        /* @__PURE__ */ jsxs("div", { className: "col-md-4", children: [
          /* @__PURE__ */ jsx("label", { className: "form-label", children: __("cp") }),
          /* @__PURE__ */ jsx(TextInput, { value: data.cp, onChange: (e) => setData("cp", e.target.value), maxLength: 6 }),
          /* @__PURE__ */ jsx(InputError, { message: errors.cp })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "col-md-8", children: [
          /* @__PURE__ */ jsx("label", { className: "form-label", children: __("direccion") }),
          /* @__PURE__ */ jsx(TextInput, { value: data.address, onChange: (e) => setData("address", e.target.value), maxLength: 150 }),
          /* @__PURE__ */ jsx(InputError, { message: errors.address })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "col-md-6", children: [
          /* @__PURE__ */ jsx("label", { className: "form-label", children: __("website") }),
          /* @__PURE__ */ jsx(TextInput, { value: data.website, onChange: (e) => setData("website", e.target.value), maxLength: 150 }),
          /* @__PURE__ */ jsx(InputError, { message: errors.website })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "col-md-6", children: [
          /* @__PURE__ */ jsx("label", { className: "form-label", children: __("logo") }),
          workplace.logo ? /* @__PURE__ */ jsxs("div", { className: "d-flex align-items-start", children: [
            /* @__PURE__ */ jsx("img", { src: computeLogoSrc(workplace.logo), alt: workplace.name, className: "img-thumbnail me-3", style: { maxWidth: "300px", objectFit: "contain" } }),
            /* @__PURE__ */ jsx("button", { type: "button", className: "ms-2 btn btn-sm btn-danger", onClick: handleDeleteLogo, children: /* @__PURE__ */ jsx("i", { className: "la la-trash" }) })
          ] }) : /* @__PURE__ */ jsx(FileInput, { name: "logo", accept: "image/*", onChange: handleChange, error: errors.logo }),
          /* @__PURE__ */ jsxs("p", { className: "pt-1 text-warning small", children: [
            /* @__PURE__ */ jsx("span", { className: "me-5", children: __("imagen_formato") }),
            /* @__PURE__ */ jsxs("span", { className: "me-5", children: [
              __("imagen_peso_max"),
              ": 1MB"
            ] }),
            __("imagen_medidas_recomendadas"),
            ": 400x400px"
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-4 text-end", children: /* @__PURE__ */ jsx(PrimaryButton, { disabled: processing, className: "btn btn-rdn", children: processing ? __("procesando") + "..." : __("guardar") }) })
      ] }) })
    ] })
  ] });
}
export {
  Edit as default
};
