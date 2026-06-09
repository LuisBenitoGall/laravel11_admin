import { jsxs, jsx } from "react/jsx-runtime";
import { F as FlashMessage, A as AdminAuthenticated } from "./AdminAuthenticatedLayout-CS0xV2Ze.js";
import { usePage, Head } from "@inertiajs/react";
import { useState, useEffect } from "react";
import axios from "axios";
import { R as ReusableModal } from "./ModalTemplate-BiHkGcpB.js";
import { I as InputError } from "./InputError-DME5vguS.js";
import { U as UserSearch } from "./UserSearch-Bn5gVs5d.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import { T as Tabs } from "./Tabs-CZO-HKNH.js";
import MarketingCampaignInfoTab from "./MarketingCampaignInfoTab-L7yKOKcn.js";
import MarketingCampaignListsTab from "./MarketingCampaignListsTab-BmqYl075.js";
import "./Header-BVvoXjVe.js";
import "@inertiajs/inertia";
import "react-bootstrap";
import "./useSweetAlert-D4PAsWYN.js";
import "sweetalert2";
import "./Sidebar-DgixJBon.js";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
import "./TextInput-CzxrbIpp.js";
import "./Checkbox-C9HPJULq.js";
import "./PrimaryButton-CIbKPOjQ.js";
import "./SelectInput-BpRRLwUE.js";
import "./SortControl-B-edZX2D.js";
import "react-datepicker";
import "date-fns";
import "date-fns/locale";
function ModalCampaignAttachList({
  show,
  onClose,
  onAdded,
  campaign
}) {
  const __ = useTranslation();
  const [selectedList, setSelectedList] = useState(null);
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  const [flash, setFlash] = useState({ type: null, message: "" });
  useEffect(() => {
    if (!show) {
      setSelectedList(null);
      setErrors({});
      setProcessing(false);
      setFlash({ type: null, message: "" });
    }
  }, [show]);
  const handleConfirm = async () => {
    var _a, _b;
    if (!selectedList) {
      setErrors({ list_id: __("campo_obligatorio") });
      return;
    }
    setProcessing(true);
    setErrors({});
    setFlash({ type: null, message: "" });
    try {
      const response = await axios.post(
        route("marketing-campaigns.lists.attach", {
          campaign: campaign.id,
          list: selectedList.id
        }),
        {},
        { headers: { Accept: "application/json" } }
      );
      onClose == null ? void 0 : onClose();
      onAdded == null ? void 0 : onAdded(response.data);
    } catch (error) {
      const status = (_a = error.response) == null ? void 0 : _a.status;
      const data = ((_b = error.response) == null ? void 0 : _b.data) ?? {};
      if (status === 422) {
        setFlash({ type: "danger", message: data.message ?? __("error_validacion") });
      } else if (status === 403) {
        setFlash({ type: "danger", message: data.message ?? __("acceso_denegado") });
      } else {
        setFlash({ type: "danger", message: __("error_interno_intentelo_mas_tarde") });
      }
    } finally {
      setProcessing(false);
    }
  };
  return /* @__PURE__ */ jsxs(
    ReusableModal,
    {
      show,
      onClose,
      onConfirm: handleConfirm,
      title: __("lista_agregar"),
      confirmText: processing ? `${__("guardando")}...` : __("vincular"),
      cancelText: __("cancelar"),
      confirmDisabled: processing,
      confirmLoading: processing,
      confirmClassName: "btn-primary",
      children: [
        /* @__PURE__ */ jsx(FlashMessage, { type: flash.type || "danger", message: flash.message }),
        /* @__PURE__ */ jsxs("div", { className: "mb-3", children: [
          /* @__PURE__ */ jsxs("label", { className: "form-label", children: [
            __("lista_marketing"),
            "*"
          ] }),
          /* @__PURE__ */ jsx(
            UserSearch,
            {
              id: "campaign-list-search",
              name: "list_id",
              placeholder: __("lista_buscar"),
              searchUrl: route("marketing-campaigns.lists.search", { campaign: campaign == null ? void 0 : campaign.id }),
              onChange: (item) => {
                setSelectedList(item);
                setErrors((prev) => ({ ...prev, list_id: null }));
              },
              minLength: 1
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors.list_id })
        ] })
      ]
    }
  );
}
function Index({
  auth,
  session,
  title,
  subtitle,
  campaign,
  tab,
  costCenters = [],
  owners = [],
  currencies = [],
  campaignStatus = {},
  priorities = {},
  availableLocales
}) {
  var _a;
  const __ = useTranslation();
  const props = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  props.locale || false;
  props.languages || [];
  const permissions = props.permissions || {};
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [listRefreshKey, setListRefreshKey] = useState(0);
  const actions = [];
  if (permissions == null ? void 0 : permissions["marketing-campaigns.index"]) {
    actions.push({
      text: __("campanyas_volver"),
      icon: "la-angle-left",
      url: "marketing-campaigns.index",
      modal: false
    });
  }
  if (permissions == null ? void 0 : permissions["marketing-campaigns.create"]) {
    actions.push({
      text: __("campanya_nueva"),
      icon: "la-plus",
      url: "marketing-campaigns.create",
      modal: false
    });
  }
  if (permissions == null ? void 0 : permissions["marketing-campaigns.edit"]) {
    actions.push({
      text: __("lista_agregar"),
      icon: "la-plus",
      modal: true,
      onClick: () => setShowAttachModal(true)
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
        /* @__PURE__ */ jsx(
          ModalCampaignAttachList,
          {
            show: showAttachModal,
            onClose: () => setShowAttachModal(false),
            onAdded: () => {
              setShowAttachModal(false);
              setListRefreshKey((k) => k + 1);
            },
            campaign
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "contents pb-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "row", children: [
            /* @__PURE__ */ jsx("div", { className: "col-12", children: /* @__PURE__ */ jsxs("h2", { children: [
              __("campanya"),
              " ",
              /* @__PURE__ */ jsx("u", { children: campaign.name })
            ] }) }),
            /* @__PURE__ */ jsxs("div", { className: "col-12 mt-2 mb-4", children: [
              /* @__PURE__ */ jsxs("span", { className: "text-muted me-5", children: [
                __("creado"),
                ": ",
                /* @__PURE__ */ jsx("strong", { children: campaign.formatted_created_at })
              ] }),
              campaign.created_by_name && /* @__PURE__ */ jsxs("span", { className: "text-muted me-5", children: [
                __("creado_por"),
                ": ",
                /* @__PURE__ */ jsx("strong", { children: campaign.created_by_name })
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "text-muted", children: [
                __("actualizado"),
                ": ",
                /* @__PURE__ */ jsx("strong", { children: campaign.formatted_updated_at })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            Tabs,
            {
              tabs: [
                {
                  key: "info",
                  label: __("informacion_general"),
                  content: /* @__PURE__ */ jsx(
                    MarketingCampaignInfoTab,
                    {
                      campaign,
                      costCenters,
                      owners,
                      currencies,
                      campaignStatus,
                      priorities,
                      updateRoute: "marketing-campaigns.update",
                      updateParams: [campaign.id]
                    }
                  )
                },
                {
                  key: "lists",
                  label: __("listas"),
                  content: /* @__PURE__ */ jsx(
                    MarketingCampaignListsTab,
                    {
                      campaign,
                      queryParams: props.queryParams ?? {},
                      refreshKey: listRefreshKey
                    }
                  )
                }
              ],
              defaultActive: tab
            }
          )
        ] })
      ]
    }
  );
}
export {
  Index as default
};
