import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-BIINMUez.js";
import { usePage, useForm, Head } from "@inertiajs/react";
import "@inertiajs/inertia";
import "react-tooltip";
import { useState } from "react";
import { C as CategoryAssigner } from "./CategoryAssigner-771-XyNo.js";
import "./FileInput-U7oe6ye3.js";
import { u as useSweetAlert } from "./useSweetAlert-D4PAsWYN.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import { T as Tabs } from "./Tabs-CZO-HKNH.js";
import "./TextInput-CzxrbIpp.js";
import { M as ModalUserCreate } from "./ModalUserCreate-DtpvnDWh.js";
import CompanyInfoTab from "./CompanyInfoTab-rHXYAxG1.js";
import CompanyUsersTab from "./CompanyUsersTab-DtJx-LMp.js";
import CrmAccountAddressTab from "./CrmAccountAddressTab-DmnSYp9v.js";
import "axios";
import "./Header-dr5I36ZE.js";
import "react-bootstrap";
import "./Sidebar-neUddedh.js";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
import "./InputError-DME5vguS.js";
import "sweetalert2";
import "./DatePickerToForm-HPj3On-3.js";
import "react-datepicker";
/* empty css                          */
import "date-fns/locale";
import "./ModalTemplate-CgiU7p0h.js";
import "./SelectInput-DrqFt-OA.js";
import "./InfoPopover-CwWEvwXq.js";
import "./ManagePhones-C_mhnW8c.js";
import "./PrimaryButton-B91ets3U.js";
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
import "./Checkbox-B7oBdKeZ.js";
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
  const isCrmAccount = crm_account !== false;
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
          )
        ] })
      ]
    }
  );
}
export {
  Index as default
};
