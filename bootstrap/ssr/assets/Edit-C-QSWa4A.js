import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-BoNOupJF.js";
import { usePage, useForm, Head } from "@inertiajs/react";
import "@inertiajs/inertia";
import "react-tooltip";
import { useState } from "react";
import { T as Tabs } from "./Tabs-CZO-HKNH.js";
import "./TextInput-CzxrbIpp.js";
import { u as useSweetAlert } from "./useSweetAlert-D4PAsWYN.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import { M as ModalUserCreate } from "./ModalUserCreate-D8rrMBLa.js";
import CompanyInfoTab from "./CompanyInfoTab-DvaOxVfS.js";
import CompanyUsersTab from "./CompanyUsersTab-hJvjmmVr.js";
import "./Header-dr5I36ZE.js";
import "react-bootstrap";
import "sweetalert2";
import "./Sidebar-Cu_xRMOw.js";
import "axios";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
import "./DatePickerToForm-DlY2BJGL.js";
import "react-datepicker";
/* empty css                          */
import "date-fns/locale";
import "./InputError-DME5vguS.js";
import "./ModalTemplate-BcyfW0_g.js";
import "./SelectInput-DrqFt-OA.js";
import "./FileInput-U7oe6ye3.js";
import "./InfoPopover-CwWEvwXq.js";
import "./ManagePhones-C_mhnW8c.js";
import "./PrimaryButton-B91ets3U.js";
import "./TableUsers-BvvRPY9u.js";
import "./useTableManagement-BYbZ3SAG.js";
import "date-fns";
import "./ShowRegisterButton-DPAZE_RX.js";
import "prop-types";
import "./TableExporter-DatfQStH.js";
import "jspdf";
import "jspdf-autotable";
import "exceljs";
import "file-saver";
import "./StatusButton-DfO41WfJ.js";
import "./UserShowView-UJIJBM45.js";
import "./renderCellContent-wSYduAQV.js";
function Index({
  auth,
  session,
  title,
  subtitle,
  provider,
  relation,
  users,
  rows,
  salutations,
  contact_subtypes,
  tab,
  availableLocales
}) {
  var _a;
  const __ = useTranslation();
  const props = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  props.locale || false;
  props.languages || [];
  useSweetAlert();
  const permissions = props.permissions || {};
  const [activeTab, setActiveTab] = useState(tab || "info");
  const { data, setData, errors, processing } = useForm({
    name: provider.name || "",
    status: relation.status
  });
  const [showModalUserCreate, setShowModalUserCreate] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const handleOpenModalUserCreate = () => setShowModalUserCreate(true);
  const handleCloseModalUserCreate = () => setShowModalUserCreate(false);
  const refreshUsersTable = () => setRefreshKey((prev) => prev + 1);
  const actions = [];
  if (permissions == null ? void 0 : permissions["providers.index"]) {
    actions.push({
      text: __("proveedores_volver"),
      icon: "la-angle-left",
      url: "providers.index",
      modal: false
    });
  }
  if (permissions == null ? void 0 : permissions["providers.create"]) {
    actions.push({
      text: __("proveedor_nuevo"),
      icon: "la-plus",
      url: "providers.create",
      modal: false
    });
  }
  if (permissions == null ? void 0 : permissions["users.create"]) {
    actions.push({
      text: __("usuario_nuevo"),
      icon: "la-plus",
      url: "",
      modal: true,
      onClick: handleOpenModalUserCreate
    });
  }
  if (permissions == null ? void 0 : permissions["workplaces.index"]) {
    actions.push({
      text: __("centros_trabajo"),
      icon: "la-map-marker-alt",
      url: "workplaces.index",
      params: [provider.id],
      modal: false
    });
  }
  if (permissions == null ? void 0 : permissions["cost-centers.index"]) {
    actions.push({
      text: __("centros_coste"),
      icon: "la-comment-dollar",
      url: "cost-centers.index",
      params: [provider.id],
      modal: false
    });
  }
  if (permissions == null ? void 0 : permissions["providers.destroy"]) {
    actions.push({
      text: __("eliminar"),
      icon: "la-trash",
      method: "delete",
      url: "providers.destroy",
      params: [relation.id],
      title: __("proveedor_eliminar"),
      message: __("proveedor_eliminar_confirm"),
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
              __("proveedor"),
              " ",
              /* @__PURE__ */ jsx("u", { children: provider.name })
            ] }) }),
            /* @__PURE__ */ jsxs("div", { className: "col-12 mt-2 mb-4", children: [
              /* @__PURE__ */ jsxs("span", { className: "text-muted me-5", children: [
                __("creado"),
                ": ",
                /* @__PURE__ */ jsx("strong", { children: relation.formatted_created_at })
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "text-muted", children: [
                __("actualizado"),
                ": ",
                /* @__PURE__ */ jsx("strong", { children: relation.formatted_updated_at })
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
                      company: provider,
                      side: "providers",
                      updateRoute: "companies.update",
                      updateParams: [provider.id]
                    }
                  )
                },
                {
                  key: "users",
                  label: __("usuarios"),
                  content: /* @__PURE__ */ jsx(
                    CompanyUsersTab,
                    {
                      users: users ?? null,
                      rows: rows ?? [],
                      indexRoute: "providers.edit",
                      indexParams: provider.id,
                      tableId: "tblCompanyUsers"
                    }
                  )
                }
              ],
              defaultActive: tab
            }
          ),
          /* @__PURE__ */ jsx(
            ModalUserCreate,
            {
              show: showModalUserCreate,
              onClose: handleCloseModalUserCreate,
              onCreate: refreshUsersTable,
              companyId: provider.id,
              side: "providers",
              salutations,
              contact_subtypes,
              contact_types: []
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
