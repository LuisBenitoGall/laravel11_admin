import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect } from "react";
import { useForm } from "@inertiajs/react";
import { P as PrimaryButton } from "./PrimaryButton-CIbKPOjQ.js";
import "./TextInput-CzxrbIpp.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import { u as useSweetAlert } from "./useSweetAlert-D4PAsWYN.js";
import "sweetalert2";
function MarketingCampaignInfoTab({
  campaign,
  updateRoute = "marketing-campaigns.update",
  updateParams = null
}) {
  const __ = useTranslation();
  const { showAlert } = useSweetAlert();
  const params = updateParams ?? [campaign == null ? void 0 : campaign.id];
  const { data, setData, post, processing, errors } = useForm({
    owner_id: (campaign == null ? void 0 : campaign.owner_id) ?? "",
    name: (campaign == null ? void 0 : campaign.name) ?? "",
    slug: (campaign == null ? void 0 : campaign.slug) ?? "",
    type: (campaign == null ? void 0 : campaign.type) ?? "",
    is_dynamic: (campaign == null ? void 0 : campaign.is_dynamic) ?? false,
    status: (campaign == null ? void 0 : campaign.status) ?? 1,
    observations: (campaign == null ? void 0 : campaign.observations) ?? "",
    _method: "PUT"
  });
  useEffect(() => {
    setData({
      owner_id: (campaign == null ? void 0 : campaign.owner_id) ?? "",
      name: (campaign == null ? void 0 : campaign.name) ?? "",
      slug: (campaign == null ? void 0 : campaign.slug) ?? "",
      type: (campaign == null ? void 0 : campaign.type) ?? "",
      is_dynamic: (campaign == null ? void 0 : campaign.is_dynamic) ?? false,
      status: (campaign == null ? void 0 : campaign.status) ?? 1,
      observations: (campaign == null ? void 0 : campaign.observations) ?? "",
      _method: "PUT"
    });
  }, [campaign]);
  const handleSubmit = (e) => {
    e.preventDefault();
    post(route(updateRoute, params), {
      preserveScroll: true,
      onSuccess: () => {
        showAlert(__("Éxito"), __("La campaña se ha actualizado correctamente."), "success");
      },
      onError: () => {
        showAlert(__("Error"), __("Se ha producido un error al actualizar la campaña."), "error");
      }
    });
  };
  return /* @__PURE__ */ jsx("form", { onSubmit: handleSubmit, children: /* @__PURE__ */ jsxs("div", { className: "row gy-3", children: [
    /* @__PURE__ */ jsx("div", { className: "col-lg-6" }),
    /* @__PURE__ */ jsx("div", { className: "mt-4 text-end", children: /* @__PURE__ */ jsx(PrimaryButton, { disabled: processing, className: "btn btn-rdn", children: processing ? __("procesando") + "..." : __("guardar") }) })
  ] }) });
}
export {
  MarketingCampaignInfoTab as default
};
