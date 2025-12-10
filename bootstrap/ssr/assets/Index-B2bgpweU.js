import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-DJ-XuaP9.js";
import { Head, Link, router } from "@inertiajs/react";
import { useState } from "react";
import { Table, OverlayTrigger, Tooltip } from "react-bootstrap";
/* empty css                          */
import { u as useTableManagement, C as ColumnFilter, R as RecordsPerPage, S as SortControl, F as FilterRow, P as Pagination } from "./useTableManagement-B_xJoIyK.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import "./SelectInput-DrqFt-OA.js";
import { S as ShowRegister } from "./ShowRegister-ChxyE8YT.js";
import { S as ShowRegisterButton } from "./ShowRegisterButton-CPwJtUP3.js";
import { S as StatusButton } from "./StatusButton-DfO41WfJ.js";
import { T as TableExporter } from "./TableExporter-RjBSwz2t.js";
import "./TextInput-CzxrbIpp.js";
import "sweetalert2";
import { M as ModalUserCreate } from "./ModalUserCreate-D8rrMBLa.js";
import UserShowView from "./UserShowView-BriFAEee.js";
import { r as renderCellContent } from "./renderCellContent-wSYduAQV.js";
import "@inertiajs/inertia";
import "./Header-DbWsFjJj.js";
import "./useSweetAlert-D4PAsWYN.js";
import "./Sidebar-BQqKXp-L.js";
import "axios";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
import "react-datepicker";
import "date-fns";
import "date-fns/locale";
import "prop-types";
import "./DatePickerToForm-DlY2BJGL.js";
import "./InputError-DME5vguS.js";
import "./ModalTemplate-BcyfW0_g.js";
import "./ManagePhones-LdkmCbcO.js";
function Index({
  auth,
  session,
  title,
  subtitle,
  contacts,
  contact_types,
  contact_types_combo,
  contact_subtypes,
  salutations,
  leads,
  slug,
  queryParams: rawQueryParams = {},
  availableLocales
}) {
  const queryParams = typeof rawQueryParams === "object" && rawQueryParams !== null ? rawQueryParams : {};
  const __ = useTranslation();
  const [showId, setShowId] = useState(null);
  const [showPanelOpen, setShowPanelOpen] = useState(false);
  const handleShowRegister = (user) => {
    setShowId(user.id);
    setShowPanelOpen(true);
  };
  const handleCloseShowPanel = () => {
    setShowPanelOpen(false);
    setShowId(null);
  };
  const contactTypesArray = Array.isArray(contact_types) ? contact_types.map((opt) => ({ value: (opt == null ? void 0 : opt.value) ?? (opt == null ? void 0 : opt.id) ?? (opt == null ? void 0 : opt.slug) ?? opt, label: (opt == null ? void 0 : opt.label) ?? (opt == null ? void 0 : opt.name) ?? (opt == null ? void 0 : opt.title) ?? String(opt) })) : Object.entries(contact_types || {}).map(([key, value]) => ({ value: key, label: value }));
  const contactSubtypesArray = Array.isArray(contact_subtypes) ? contact_subtypes.map((opt) => ({ value: (opt == null ? void 0 : opt.value) ?? (opt == null ? void 0 : opt.id) ?? (opt == null ? void 0 : opt.slug) ?? opt, label: (opt == null ? void 0 : opt.label) ?? (opt == null ? void 0 : opt.name) ?? (opt == null ? void 0 : opt.title) ?? String(opt) })) : Object.entries(contact_subtypes || {}).map(([key, value]) => ({ value: key, label: value }));
  const contactTypeColumn = {
    key: "contact_type",
    label: __("contacto_tipo"),
    sort: false,
    filter: leads === true ? "" : "select",
    class_th: "",
    class_td: "",
    placeholder: leads === true ? "" : __("contacto_tipo_filtrar"),
    ...leads === true ? {} : { options: contactTypesArray }
  };
  const contactSubTypeColumn = {
    key: "contact_subtype",
    label: __("contacto_subtipo"),
    sort: false,
    filter: leads === true ? "" : "select",
    class_th: "",
    class_td: "",
    placeholder: leads === true ? "" : __("contacto_subtipo_filtrar"),
    ...leads === true ? {} : { options: contactSubtypesArray }
  };
  const [showModalUserCreate, setShowModalUserCreate] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const handleOpenModalUserCreate = () => setShowModalUserCreate(true);
  const handleCloseModalUserCreate = () => setShowModalUserCreate(false);
  const refreshUsersTable = () => setRefreshKey((prev) => prev + 1);
  const columns = [
    { key: "full_name", label: __("nombre"), sort: true, filter: "text", class_th: "", class_td: "", placeholder: __("nombre_filtrar") },
    // { key: 'created_at', label: __('fecha_alta'),  sort: true,  filter: 'date', class_th: 'text-center', class_td: 'text-end', placeholder: __('fecha_alta'), dateKeys: ['date_from', 'date_to'] },
    { key: "email", label: __("email"), sort: true, filter: "text", class_th: "", class_td: "", placeholder: __("email_filtrar") },
    { key: "phones", label: __("telefonos"), sort: false, filter: "", class_th: "", class_td: "", placeholder: __("telefonos_filtrar") },
    { key: "position", label: __("cargo"), sort: false, filter: "text", class_th: "", class_td: "", placeholder: __("cargo_filtrar") },
    contactTypeColumn,
    contactSubTypeColumn,
    { key: "companies", label: __("empresa"), sort: false, filter: "text", class_th: "", class_td: "", placeholder: __("empresa_filtrar") },
    { key: "avatar", label: __("imagen"), sort: false, filter: "", type: "image", icon: "user-tie", class_th: "text-center", class_td: "text-center", placeholder: "" }
  ];
  const {
    permissions,
    sortParams,
    perPage,
    setPerPage,
    visibleColumns,
    toggleColumnVisibility,
    SearchFieldChanged,
    sortChanged,
    filteredData
  } = useTableManagement({
    table: "tblContacts",
    allColumnKeys: columns.map((col) => col.key),
    entityName: "contacts",
    indexRoute: slug + ".index",
    destroyRoute: "users.destroy",
    filteredDataRoute: slug + ".filtered-data",
    labelName: "contactos",
    queryParams
  });
  const actions = [];
  if (permissions == null ? void 0 : permissions["crm-contacts.create"]) {
    actions.push({
      text: __("contacto_nuevo"),
      icon: "la-plus",
      url: "",
      modal: true,
      onClick: handleOpenModalUserCreate
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
        /* @__PURE__ */ jsxs("div", { className: "contents", children: [
          /* @__PURE__ */ jsx("div", { className: "row", children: /* @__PURE__ */ jsxs("div", { className: "controls d-flex align-items-center", children: [
            /* @__PURE__ */ jsx(ColumnFilter, { columns, visibleColumns, toggleColumn: toggleColumnVisibility }),
            /* @__PURE__ */ jsx(RecordsPerPage, { perPage, setPerPage }),
            /* @__PURE__ */ jsx(TableExporter, { filename: __("contactos"), columns, fetchData: filteredData })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "table-responsive", children: /* @__PURE__ */ jsxs(Table, { className: "table table-nowrap table-striped align-middle mb-0", id: "tblContacts", children: [
            /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("th", { className: "text-center first-column", children: " " }),
              columns.map((col) => /* @__PURE__ */ jsxs("th", { className: `${col.class_th ?? ""} ${visibleColumns.includes(col.key) ? "" : "d-none"}`.trim(), children: [
                col.label,
                col.sort && /* @__PURE__ */ jsx(
                  SortControl,
                  {
                    name: col.key,
                    sortable: true,
                    sort_field: queryParams.sort_field,
                    sort_direction: queryParams.sort_direction,
                    sortChanged
                  }
                )
              ] }, col.key)),
              /* @__PURE__ */ jsx("th", { className: "text-center", children: __("acciones") })
            ] }) }),
            /* @__PURE__ */ jsx(
              FilterRow,
              {
                columns,
                queryParams,
                visibleColumns,
                SearchFieldChanged,
                PrependColumns: 1
              }
            ),
            /* @__PURE__ */ jsx("tbody", { children: contacts.data.map((contact) => /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { className: "text-center", children: /* @__PURE__ */ jsx(ShowRegisterButton, { onClick: () => handleShowRegister(contact) }) }),
              columns.map((col) => /* @__PURE__ */ jsx("td", { className: `${col.class_td ?? ""} ${visibleColumns.includes(col.key) ? "" : "d-none"}`.trim(), children: renderCellContent(contact[col.key], col, contact) }, col.key)),
              /* @__PURE__ */ jsxs("td", { className: "text-end", children: [
                typeof contact.status !== "undefined" && /* @__PURE__ */ jsx(
                  OverlayTrigger,
                  {
                    placement: "top",
                    overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", children: contact.status == 1 ? __("contacto_activo") : __("contacto_inactivo") }),
                    children: /* @__PURE__ */ jsx(
                      StatusButton,
                      {
                        status: contact.status,
                        id: contact.id,
                        updateRoute: "users.status",
                        reloadUrl: route("users.contacts"),
                        reloadResource: "contacts"
                      }
                    )
                  },
                  "status-" + contact.id
                ),
                /* @__PURE__ */ jsx(
                  OverlayTrigger,
                  {
                    placement: "top",
                    overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", children: __("editar") }),
                    children: /* @__PURE__ */ jsx(
                      Link,
                      {
                        href: route(
                          "users.edit",
                          contact.edit_company_id ? [contact.id, contact.edit_company_id] : [contact.id]
                        ),
                        className: "btn btn-sm btn-info ms-1",
                        children: /* @__PURE__ */ jsx("i", { className: "la la-edit" })
                      }
                    )
                  },
                  "edit-" + contact.id
                ),
                /* @__PURE__ */ jsx(
                  OverlayTrigger,
                  {
                    placement: "top",
                    overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", children: __("eliminar") }),
                    children: /* @__PURE__ */ jsx(
                      Link,
                      {
                        href: route("users.destroy", contact.id),
                        className: "btn btn-sm btn-danger ms-1",
                        title: __("eliminar"),
                        children: /* @__PURE__ */ jsx("i", { className: "la la-trash" })
                      }
                    )
                  },
                  "delete-" + contact.id
                )
              ] })
            ] }, contact.id)) })
          ] }) }),
          /* @__PURE__ */ jsx(
            ShowRegister,
            {
              id: showId,
              open: showPanelOpen,
              onClose: handleCloseShowPanel,
              routeName: "users.show",
              title: __("usuario"),
              ViewComponent: UserShowView
            }
          ),
          /* @__PURE__ */ jsx(
            Pagination,
            {
              links: contacts.meta.links,
              totalRecords: contacts.meta.total,
              currentPage: contacts.meta.current_page,
              perPage: contacts.meta.per_page,
              onPageChange: (page) => {
                router.get(route(slug + ".index"), {
                  ...queryParams,
                  page,
                  per_page: perPage,
                  sort_field: sortParams.sort_field,
                  sort_direction: sortParams.sort_direction
                }, { preserveState: true });
              }
            }
          ),
          /* @__PURE__ */ jsx(
            ModalUserCreate,
            {
              show: showModalUserCreate,
              onClose: handleCloseModalUserCreate,
              onCreate: refreshUsersTable,
              side: "crm-accounts",
              salutations,
              contact_types: contact_types_combo,
              contact_subtypes,
              linkCompany: false
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
