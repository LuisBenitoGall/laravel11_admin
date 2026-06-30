import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-C5syfI8B.js";
import { usePage, useForm, Head } from "@inertiajs/react";
import "@inertiajs/inertia";
import "react-tooltip";
import { useState } from "react";
import { T as Tabs } from "./Tabs-CZO-HKNH.js";
import "./TextInput-CzxrbIpp.js";
import { u as useSweetAlert } from "./useSweetAlert-D4PAsWYN.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import { M as ModalUserCreate } from "./ModalUserCreate-BeQPp-U2.js";
import CompanyInfoTab from "./CompanyInfoTab-DPuXbufB.js";
import CompanyUsersTab from "./CompanyUsersTab-BHE6uVis.js";
import "./Header-BFeBcT5X.js";
import "react-bootstrap";
import "sweetalert2";
import "./Sidebar-DgixJBon.js";
import "axios";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
import "./DatePickerToForm-BNatYC8y.js";
import "react-datepicker";
/* empty css                          */
import "date-fns/locale";
import "./InputError-DME5vguS.js";
import "./ModalTemplate-BiHkGcpB.js";
import "./SelectInput-BpRRLwUE.js";
import "./UserSearch-Bn5gVs5d.js";
import "./FileInput-U7oe6ye3.js";
import "./InfoPopover-CwWEvwXq.js";
import "./ManagePhones-LdkmCbcO.js";
import "./PrimaryButton-CIbKPOjQ.js";
import "./TableUsers-DnSnGial.js";
import "./SortControl-B-edZX2D.js";
import "date-fns";
import "./ShowRegisterButton-DPAZE_RX.js";
import "prop-types";
import "./TableExporter-CrDOX5NX.js";
import "./StatusButton-DfO41WfJ.js";
import "./useTableManagement-UWRr8jtd.js";
import "./UserShowView-CJCAJiz0.js";
import "./renderCellContent-DJWyVzIY.js";
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
