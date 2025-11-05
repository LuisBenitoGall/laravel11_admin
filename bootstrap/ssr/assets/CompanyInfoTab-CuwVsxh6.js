import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { useForm, router } from "@inertiajs/react";
import { F as FileInput } from "./FileInput-U7oe6ye3.js";
import { I as InfoPopover } from "./InfoPopover-CwWEvwXq.js";
import { I as InputError } from "./InputError-DME5vguS.js";
import { P as PrimaryButton } from "./PrimaryButton-B91ets3U.js";
import { T as TextInput } from "./TextInput-CzxrbIpp.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import { u as useSweetAlert } from "./useSweetAlert-D4PAsWYN.js";
import "react-bootstrap";
import "axios";
import "sweetalert2";
function CompanyFormEdit({ company = {}, side = false, updateRoute = "companies.update", updateParams = null }) {
  const __ = useTranslation();
  const { showConfirm } = useSweetAlert();
  updateParams ?? [company == null ? void 0 : company.id];
  const { data, setData, post, reset, errors, processing } = useForm({
    name: company.name ?? "",
    tradename: company.tradename ?? "",
    nif: company.nif ?? "",
    side: side || "",
    logo: null
  });
  useEffect(() => {
    setData("name", company.name ?? "");
    setData("tradename", company.tradename ?? "");
    setData("nif", company.nif ?? "");
  }, [company]);
  const [showFileInput, setShowFileInput] = useState(!company.logo && !company.logo_url);
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
  async function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append("_method", "PUT");
    Object.entries(data).forEach(([key, value]) => {
      if (key === "logo" && value instanceof File) {
        formData.append(key, value);
      } else if (typeof value === "object" && value !== null) {
        formData.append(key, JSON.stringify(value));
      } else if (value !== null && typeof value !== "undefined") {
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
            setShowFileInput(true);
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
  return /* @__PURE__ */ jsx("form", { onSubmit: handleSubmit, children: /* @__PURE__ */ jsxs("div", { className: "row gy-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "col-lg-6", children: [
      /* @__PURE__ */ jsxs("label", { className: "form-label", children: [
        __("razon_social"),
        "*"
      ] }),
      /* @__PURE__ */ jsx(
        TextInput,
        {
          type: "text",
          placeholder: __("empresa_nombre"),
          value: data.name,
          onChange: (e) => setData("name", e.target.value),
          maxLength: 100,
          required: true
        }
      ),
      /* @__PURE__ */ jsx(InputError, { message: errors.name })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "col-lg-6", children: [
      /* @__PURE__ */ jsxs("label", { className: "form-label", children: [
        __("nombre_comercial"),
        "*"
      ] }),
      /* @__PURE__ */ jsx(
        TextInput,
        {
          type: "text",
          placeholder: __("nombre_comercial"),
          value: data.tradename,
          onChange: (e) => setData("tradename", e.target.value),
          maxLength: 100,
          required: true
        }
      ),
      /* @__PURE__ */ jsx(InputError, { message: errors.tradename })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "col-lg-3", children: [
      /* @__PURE__ */ jsxs("label", { className: "form-label", children: [
        __("nif"),
        "*"
      ] }),
      /* @__PURE__ */ jsx(
        TextInput,
        {
          type: "text",
          placeholder: __("nif"),
          value: data.nif,
          onChange: (e) => setData("nif", e.target.value),
          maxLength: 15,
          required: true
        }
      ),
      /* @__PURE__ */ jsx(InfoPopover, { code: "company-nif" }),
      /* @__PURE__ */ jsx(InputError, { message: errors.nif })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "offset-lg-1 col-lg-8", children: [
      /* @__PURE__ */ jsx("label", { className: "form-label", children: __("logo") }),
      company.logo ? /* @__PURE__ */ jsxs("div", { className: "d-flex align-items-start", children: [
        /* @__PURE__ */ jsx(
          "img",
          {
            src: company.logo_url ?? computeLogoSrc(company.logo),
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
  ] }) });
}
function CompanyInfoTab({ company, side = false, updateRoute = "companies.update", updateParams = null }) {
  return /* @__PURE__ */ jsx(
    CompanyFormEdit,
    {
      company,
      side,
      updateRoute,
      updateParams
    }
  );
}
export {
  CompanyInfoTab as default
};
