import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-CS968Wx3.js";
import { usePage, useForm, Head } from "@inertiajs/react";
import "@inertiajs/inertia";
import "react-tooltip";
import { useState } from "react";
import { T as Tabs } from "./Tabs-Cd7Sj0t_.js";
import "./TextInput-CzxrbIpp.js";
import { u as useSweetAlert } from "./useSweetAlert-D4PAsWYN.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import { M as ModalUserCreate } from "./ModalUserCreate-BVziupJy.js";
import CompanyInfoTab from "./CompanyInfoTab-CuwVsxh6.js";
import CompanyUsersTab from "./CompanyUsersTab-B2ipg67G.js";
import "axios";
import "./Header-Px-6ZOXw.js";
import "react-bootstrap";
import "sweetalert2";
import "./Sidebar-CypaLfnr.js";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
import "./DatePickerToForm-HPj3On-3.js";
import "react-datepicker";
/* empty css                          */
import "date-fns/locale";
import "./InputError-DME5vguS.js";
import "./ModalTemplate-CgiU7p0h.js";
import "./SelectInput-DrqFt-OA.js";
import "./FileInput-U7oe6ye3.js";
import "./InfoPopover-CwWEvwXq.js";
import "./PrimaryButton-B91ets3U.js";
import "./useTableManagement-CA-wp9Fk.js";
import "date-fns";
import "./TableExporter-BjSebGA-.js";
import "jspdf";
import "jspdf-autotable";
import "exceljs";
import "file-saver";
import "./StatusButton-DPQw0QHC.js";
import "./renderCellContent-Dpxbw8rL.js";
function Index({ auth, session, title, subtitle, customer, relation, users, rows, salutations, tab, availableLocales }) {
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
              salutations
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
