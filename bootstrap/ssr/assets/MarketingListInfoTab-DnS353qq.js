import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect } from "react";
import { useForm } from "@inertiajs/react";
import { C as Checkbox } from "./Checkbox-C9HPJULq.js";
import { I as InputError } from "./InputError-DME5vguS.js";
import { P as PrimaryButton } from "./PrimaryButton-CIbKPOjQ.js";
import { T as TextInput } from "./TextInput-CzxrbIpp.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import { u as useSweetAlert } from "./useSweetAlert-D4PAsWYN.js";
import "sweetalert2";
function MarketingListInfoTab({
  list,
  updateRoute = "marketing-lists.update",
  updateParams = null
}) {
  const __ = useTranslation();
  const { showAlert } = useSweetAlert();
  const params = updateParams ?? [list == null ? void 0 : list.id];
  const { data, setData, post, processing, errors } = useForm({
    owner_id: (list == null ? void 0 : list.owner_id) ?? "",
    name: (list == null ? void 0 : list.name) ?? "",
    slug: (list == null ? void 0 : list.slug) ?? "",
    type: (list == null ? void 0 : list.type) ?? "",
    is_dynamic: (list == null ? void 0 : list.is_dynamic) ?? false,
    status: (list == null ? void 0 : list.status) ?? 1,
    observations: (list == null ? void 0 : list.observations) ?? "",
    _method: "PUT"
  });
  useEffect(() => {
    setData({
      owner_id: (list == null ? void 0 : list.owner_id) ?? "",
      name: (list == null ? void 0 : list.name) ?? "",
      slug: (list == null ? void 0 : list.slug) ?? "",
      type: (list == null ? void 0 : list.type) ?? "",
      is_dynamic: (list == null ? void 0 : list.is_dynamic) ?? false,
      status: (list == null ? void 0 : list.status) ?? 1,
      observations: (list == null ? void 0 : list.observations) ?? "",
      _method: "PUT"
    });
  }, [list]);
  useEffect(() => {
    if (data.type === "dynamic" || data.type === "dinamica") {
      if (!data.is_dynamic) {
        setData("is_dynamic", true);
      }
    }
  }, [data.type]);
  const handleSubmit = (e) => {
    e.preventDefault();
    post(route(updateRoute, params), {
      preserveScroll: true,
      onSuccess: () => {
        showAlert(__("Éxito"), __("La lista de marketing se ha actualizado correctamente."), "success");
      },
      onError: () => {
        showAlert(__("Error"), __("Se ha producido un error al actualizar la lista de marketing."), "error");
      }
    });
  };
  return /* @__PURE__ */ jsx("form", { onSubmit: handleSubmit, children: /* @__PURE__ */ jsxs("div", { className: "row gy-3", children: [
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
      /* @__PURE__ */ jsx(InputError, { message: errors.observations, className: "mt-1" })
    ] }) }),
    /* @__PURE__ */ jsx("div", { className: "mt-4 text-end", children: /* @__PURE__ */ jsx(PrimaryButton, { disabled: processing, className: "btn btn-rdn", children: processing ? __("procesando") + "..." : __("guardar") }) })
  ] }) });
}
export {
  MarketingListInfoTab as default
};
