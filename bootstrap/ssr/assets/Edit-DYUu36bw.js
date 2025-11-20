import { jsx, jsxs } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-C61SrhEp.js";
import { useForm, usePage, Head } from "@inertiajs/react";
import "@inertiajs/inertia";
import "react-tooltip";
import { useState } from "react";
import { C as CategoryAssigner } from "./CategoryAssigner-771-XyNo.js";
import "./FileInput-U7oe6ye3.js";
import { u as useSweetAlert } from "./useSweetAlert-D4PAsWYN.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import { T as Tabs } from "./Tabs-CZO-HKNH.js";
import "./TextInput-CzxrbIpp.js";
import { M as ModalUserCreate } from "./ModalUserCreate-BDh7CCp1.js";
import { M as Modal } from "./Modal-Vm18LNJq.js";
import { C as Checkbox } from "./Checkbox-B7oBdKeZ.js";
import { P as PrimaryButton } from "./PrimaryButton-B91ets3U.js";
import { S as SecondaryButton } from "./SecondaryButton-CXDrSeVp.js";
import { I as InputError } from "./InputError-DME5vguS.js";
import CompanyInfoTab from "./CompanyInfoTab-rHXYAxG1.js";
import CompanyUsersTab from "./CompanyUsersTab-DtJx-LMp.js";
import CrmAccountAddressTab from "./CrmAccountAddressTab-DmnSYp9v.js";
import "axios";
import "./Header-dr5I36ZE.js";
import "react-bootstrap";
import "sweetalert2";
import "./Sidebar-KWaSAYKU.js";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
import "./DatePickerToForm-DlY2BJGL.js";
import "react-datepicker";
/* empty css                          */
import "date-fns/locale";
import "./ModalTemplate-BcyfW0_g.js";
import "./SelectInput-DrqFt-OA.js";
import "./InfoPopover-CwWEvwXq.js";
import "./ManagePhones-C_mhnW8c.js";
import "./TableUsers-BbHR_MjB.js";
import "./useTableManagement-BYbZ3SAG.js";
import "date-fns";
import "./TableExporter-DatfQStH.js";
import "jspdf";
import "jspdf-autotable";
import "exceljs";
import "file-saver";
import "./StatusButton-DfO41WfJ.js";
import "./renderCellContent-uXg9jeR2.js";
function ModalConvertCrmAccount({
  show,
  onClose,
  crmAccount,
  canCreateCustomer = false,
  canCreateProvider = false
}) {
  const __ = useTranslation();
  const { data, setData, post, processing, errors, reset } = useForm({
    as_customer: false,
    as_provider: false
  });
  const [localError, setLocalError] = useState("");
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setData(name, checked);
    if (localError) {
      setLocalError("");
    }
  };
  const handleClose = () => {
    reset();
    setLocalError("");
    onClose && onClose();
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!data.as_customer && !data.as_provider) {
      setLocalError(__("debes_seleccionar_cliente_proveedor"));
      return;
    }
    const url = route("crm-accounts.convert", crmAccount.id);
    post(url, {
      preserveScroll: true,
      onSuccess: () => {
        handleClose();
      }
    });
  };
  if (!show) {
    return null;
  }
  return /* @__PURE__ */ jsx(Modal, { show, onClose: handleClose, maxWidth: "md", children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
    /* @__PURE__ */ jsxs("div", { className: "modal-header", children: [
      /* @__PURE__ */ jsx("h5", { className: "modal-title", children: __("convertir_cliente_proveedor") }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: "btn-close",
          "aria-label": "Close",
          onClick: handleClose
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "modal-body", children: [
      /* @__PURE__ */ jsx("p", { className: "mb-3", children: __("convertir_cliente_proveedor_texto", {
        name: (crmAccount == null ? void 0 : crmAccount.name) || ""
      }) }),
      /* @__PURE__ */ jsxs("div", { className: "mb-2", children: [
        canCreateCustomer && /* @__PURE__ */ jsxs("label", { className: "d-flex align-items-center mb-2", children: [
          /* @__PURE__ */ jsx(
            Checkbox,
            {
              name: "as_customer",
              checked: data.as_customer,
              onChange: handleCheckboxChange
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "ms-2", children: __("crear_como_cliente") })
        ] }),
        canCreateProvider && /* @__PURE__ */ jsxs("label", { className: "d-flex align-items-center mb-2", children: [
          /* @__PURE__ */ jsx(
            Checkbox,
            {
              name: "as_provider",
              checked: data.as_provider,
              onChange: handleCheckboxChange
            }
          ),
          /* @__PURE__ */ jsx("span", { className: "ms-2", children: __("crear_como_proveedor") })
        ] })
      ] }),
      (localError || errors.as_customer || errors.as_provider) && /* @__PURE__ */ jsx(
        InputError,
        {
          message: localError || errors.as_customer || errors.as_provider,
          className: "mt-2"
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "modal-footer", children: [
      /* @__PURE__ */ jsx(SecondaryButton, { type: "button", onClick: handleClose, children: __("cancelar") }),
      /* @__PURE__ */ jsx(PrimaryButton, { type: "submit", disabled: processing, children: __("aceptar") })
    ] })
  ] }) });
}
function Index({ auth, session, title, subtitle, availableLocales, company, crm_account, users, rows, salutations, contact_types, countries, currencies, tab }) {
  var _a;
  const __ = useTranslation();
  const props = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  props.locale || false;
  props.languages || [];
  useSweetAlert();
  const permissions = props.permissions || {};
  const rawQueryParams = props.queryParams || {};
  const queryParams = typeof rawQueryParams === "object" && rawQueryParams !== null ? rawQueryParams : {};
  const isCrmAccount = crm_account && typeof crm_account === "object";
  const validTab = !isCrmAccount && (tab === "users" || tab === "categories") ? "info" : tab || "info";
  const [activeTab, setActiveTab] = useState(validTab);
  const { data, setData, errors, processing } = useForm({
    name: company.name || "",
    tradename: company.tradename || "",
    nif: company.nif || "",
    logo: null
  });
  const [showModalUserCreate, setShowModalUserCreate] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const handleOpenModalUserCreate = () => setShowModalUserCreate(true);
  const handleCloseModalUserCreate = () => setShowModalUserCreate(false);
  const refreshUsersTable = () => setRefreshKey((prev) => prev + 1);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const handleOpenConvertModal = () => setShowConvertModal(true);
  const handleCloseConvertModal = () => setShowConvertModal(false);
  const actions = [];
  if (permissions == null ? void 0 : permissions["companies.index"]) {
    actions.push({
      text: __("empresas_volver"),
      icon: "la-angle-left",
      url: "companies.index",
      modal: false
    });
  }
  if (permissions == null ? void 0 : permissions["crm-accounts.index"]) {
    actions.push({
      text: __("cuentas_volver"),
      icon: "la-angle-left",
      url: "crm-accounts.index",
      modal: false
    });
  }
  if (permissions == null ? void 0 : permissions["companies.create"]) {
    actions.push({
      text: __("empresa_nueva"),
      icon: "la-plus",
      url: "companies.create",
      modal: false
    });
  }
  if (isCrmAccount && ((permissions == null ? void 0 : permissions["customers.create"]) || (permissions == null ? void 0 : permissions["providers.create"]))) {
    actions.push({
      text: __("convertir_cliente_proveedor"),
      icon: "la-plus",
      //url: '', 
      //modal: true,
      onClick: handleOpenConvertModal
    });
  }
  if (permissions == null ? void 0 : permissions["workplaces.index"]) {
    actions.push({
      text: __("centros_trabajo"),
      icon: "la-map-marker-alt",
      url: "workplaces.index",
      modal: false
    });
  }
  if ((permissions == null ? void 0 : permissions["crm-accounts.edit"]) && isCrmAccount) {
    actions.push({
      text: __("contacto_nuevo"),
      icon: "la-plus",
      url: "",
      modal: true,
      onClick: handleOpenModalUserCreate
    });
  }
  if ((permissions == null ? void 0 : permissions["crm-accounts.destroy"]) && isCrmAccount) {
    actions.push({
      text: __("eliminar"),
      icon: "la-trash",
      method: "delete",
      url: "crm-accounts.destroy",
      params: [crm_account.id],
      title: __("cuenta_eliminar"),
      message: __("cuenta_eliminar_confirm"),
      modal: false
    });
  }
  const envForCategories = "sectors";
  const categoryEndpoints = {
    list: route("categorizables.list"),
    // GET  ?environment=&type=&id=
    assign: route("categorizables.assign"),
    // POST body {environment,type,id,category_ids}
    unassign: route("categorizables.unassign"),
    // POST body {environment,type,id,category_ids}
    tree: route("categories.tree", { environment: envForCategories }),
    // GET  ?environment=
    create: route("categories.store", { environment: envForCategories })
    // POST body {environment,name,parent_id?}
  };
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
          /* @__PURE__ */ jsx(
            Tabs,
            {
              tabs: [
                {
                  key: "info",
                  label: __("informacion_general"),
                  content: /* @__PURE__ */ jsx(
                    CompanyInfoTab,
                    {
                      company,
                      side: "companies",
                      updateRoute: "companies.update",
                      updateParams: [company.id]
                    }
                  )
                },
                ...isCrmAccount ? [{
                  key: "address",
                  label: __("informacion_fiscal"),
                  content: /* @__PURE__ */ jsx(
                    CrmAccountAddressTab,
                    {
                      account: crm_account,
                      countries: countries ?? [],
                      currencies: currencies ?? []
                    }
                  )
                }] : [],
                ...isCrmAccount ? [{
                  key: "users",
                  label: __("usuarios"),
                  content: /* @__PURE__ */ jsx(
                    CompanyUsersTab,
                    {
                      users: users ?? null,
                      rows: rows ?? [],
                      indexRoute: "crm-accounts.edit",
                      indexParams: [crm_account.id, "users"],
                      tableId: "tblCompanyUsers",
                      filteredDataRoute: "crm-accounts.users.filtered-data",
                      queryParams,
                      userEditCompanyId: (crm_account == null ? void 0 : crm_account.linked_company_id) ?? company.id
                    }
                  )
                }] : [],
                ...isCrmAccount ? [{
                  key: "categories",
                  label: __("categorias"),
                  content: /* @__PURE__ */ jsx("div", { className: "mt-3", children: /* @__PURE__ */ jsx(
                    CategoryAssigner,
                    {
                      environment: envForCategories,
                      categorizable: { type: "App\\Models\\Company", id: company.id },
                      endpoints: categoryEndpoints,
                      title: __("sectores"),
                      allowCreate: true,
                      readOnly: false
                    }
                  ) })
                }] : []
              ],
              defaultActive: validTab
            }
          ),
          isCrmAccount && /* @__PURE__ */ jsx(
            ModalUserCreate,
            {
              show: showModalUserCreate,
              onClose: handleCloseModalUserCreate,
              onCreate: refreshUsersTable,
              companyId: company.id,
              side: "crm-accounts",
              salutations,
              contact_types,
              crm_account
            }
          ),
          isCrmAccount && /* @__PURE__ */ jsx(
            ModalConvertCrmAccount,
            {
              show: showConvertModal,
              onClose: handleCloseConvertModal,
              crmAccount: crm_account,
              canCreateCustomer: !!(permissions == null ? void 0 : permissions["customers.create"]),
              canCreateProvider: !!(permissions == null ? void 0 : permissions["providers.create"])
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
