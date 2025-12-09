import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-Cj41h6a3.js";
import { usePage, useForm, Head } from "@inertiajs/react";
import "@inertiajs/inertia";
import "react-tooltip";
import { useState } from "react";
import { C as CategoryAssigner } from "./CategoryAssigner-771-XyNo.js";
import { T as Tabs } from "./Tabs-CZO-HKNH.js";
import "./TextInput-CzxrbIpp.js";
import { u as useSweetAlert } from "./useSweetAlert-D4PAsWYN.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import { M as ModalUserCreate } from "./ModalUserCreate-D8rrMBLa.js";
import CompanyInfoTab from "./CompanyInfoTab-C2U13tl3.js";
import CompanyUsersTab from "./CompanyUsersTab-Vse7oD35.js";
import "./Header-dr5I36ZE.js";
import "react-bootstrap";
import "sweetalert2";
import "./Sidebar-DQeTCSUq.js";
import "axios";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
import "./InputError-DME5vguS.js";
import "./DatePickerToForm-DlY2BJGL.js";
import "react-datepicker";
/* empty css                          */
import "date-fns/locale";
import "./ModalTemplate-BcyfW0_g.js";
import "./SelectInput-DrqFt-OA.js";
import "./FileInput-U7oe6ye3.js";
import "./InfoPopover-CwWEvwXq.js";
import "./ManagePhones-C_mhnW8c.js";
import "./PrimaryButton-CIbKPOjQ.js";
import "./TableUsers-BX2bkUuu.js";
import "./useTableManagement-B_xJoIyK.js";
import "date-fns";
import "./ShowRegister-ChxyE8YT.js";
import "prop-types";
import "./ShowRegisterButton-CPwJtUP3.js";
import "./TableExporter-RjBSwz2t.js";
import "./StatusButton-DfO41WfJ.js";
import "./UserShowView-UJIJBM45.js";
import "./renderCellContent-wSYduAQV.js";
function Index({
  auth,
  session,
  title,
  subtitle,
  customer,
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
    name: customer.name || "",
    status: relation.status
  });
  const [showModalUserCreate, setShowModalUserCreate] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const handleOpenModalUserCreate = () => setShowModalUserCreate(true);
  const handleCloseModalUserCreate = () => setShowModalUserCreate(false);
  const refreshUsersTable = () => setRefreshKey((prev) => prev + 1);
  const actions = [];
  if (permissions == null ? void 0 : permissions["customers.index"]) {
    actions.push({
      text: __("clientes_volver"),
      icon: "la-angle-left",
      url: "customers.index",
      modal: false
    });
  }
  if (permissions == null ? void 0 : permissions["customers.create"]) {
    actions.push({
      text: __("cliente_nuevo"),
      icon: "la-plus",
      url: "customers.create",
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
      params: [customer.id],
      modal: false
    });
  }
  if (permissions == null ? void 0 : permissions["cost-centers.index"]) {
    actions.push({
      text: __("centros_coste"),
      icon: "la-comment-dollar",
      url: "cost-centers.index",
      params: [customer.id],
      modal: false
    });
  }
  if (permissions == null ? void 0 : permissions["customers.destroy"]) {
    actions.push({
      text: __("eliminar"),
      icon: "la-trash",
      method: "delete",
      url: "customers.destroy",
      params: [relation.id],
      title: __("cliente_eliminar"),
      message: __("cliente_eliminar_confirm"),
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
              __("cliente"),
              " ",
              /* @__PURE__ */ jsx("u", { children: customer.name })
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
                      company: customer,
                      side: "customers",
                      updateRoute: "companies.update",
                      updateParams: [customer.id]
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
                      indexRoute: "customers.edit",
                      indexParams: customer.id,
                      tableId: "tblCompanyUsers"
                    }
                  )
                },
                {
                  key: "categories",
                  label: __("categorias"),
                  content: /* @__PURE__ */ jsx("div", { className: "mt-3", children: /* @__PURE__ */ jsx(
                    CategoryAssigner,
                    {
                      environment: envForCategories,
                      categorizable: { type: "App\\Models\\Company", id: customer.id },
                      endpoints: categoryEndpoints,
                      title: __("sectores"),
                      allowCreate: true,
                      readOnly: false
                    }
                  ) })
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
              companyId: customer.id,
              side: "customers",
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
