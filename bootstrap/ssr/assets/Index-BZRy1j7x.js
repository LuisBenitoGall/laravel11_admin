import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-BAKikn-7.js";
import { router, usePage, Head, Link } from "@inertiajs/react";
import { useState, useEffect, useRef } from "react";
import { Table, OverlayTrigger, Tooltip } from "react-bootstrap";
/* empty css                          */
import { u as useInertiaLoading, A as AdHocFiltersDropdown, a as ActiveFiltersLegend, S as SpinnerInline } from "./useInertiaLoading-0SrYlv0H.js";
import { C as Checkbox } from "./Checkbox-C9HPJULq.js";
import { u as useTableManagement, C as ColumnFilter, R as RecordsPerPage, S as SortControl, F as FilterRow, P as Pagination } from "./useTableManagement-_Ugox1d5.js";
import { S as ShowRegister } from "./ShowRegister-ChxyE8YT.js";
import { S as ShowRegisterButton } from "./ShowRegisterButton-CPwJtUP3.js";
import { S as StatusButton } from "./StatusButton-DfO41WfJ.js";
import { T as TableExporter } from "./TableExporter-RjBSwz2t.js";
import { u as useSweetAlert } from "./useSweetAlert-D4PAsWYN.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import { R as ReusableModal } from "./ModalTemplate-BjGqBJQi.js";
import { I as InputError } from "./InputError-DME5vguS.js";
import { M as ModalUserCreate } from "./ModalUserCreate-DdNCZ4xY.js";
import UserShowView from "./UserShowView-BriFAEee.js";
import { r as renderCellContent } from "./renderCellContent-DkxoXe9S.js";
import "@inertiajs/inertia";
import "./Header-BVvoXjVe.js";
import "sweetalert2";
import "./Sidebar-1g4CKLZI.js";
import "axios";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
import "./TextInput-CzxrbIpp.js";
import "./DatePickerToForm-DlY2BJGL.js";
import "react-datepicker";
import "date-fns/locale";
import "./LocationSelects-B4vI2QcJ.js";
import "./SelectSearch-x7o6yKJV.js";
import "react-select";
import "./UserSearch-Bn5gVs5d.js";
import "date-fns";
import "./SelectInput-DrqFt-OA.js";
import "prop-types";
import "./ManagePhones-LdkmCbcO.js";
function ModalMarketingListFromContacts({ show, onClose, filters = {}, getFiltersForRedirect }) {
  const __ = useTranslation();
  const [form, setForm] = useState({
    name: "",
    observations: ""
  });
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  useEffect(() => {
    if (!show) {
      setForm({
        name: "",
        observations: ""
      });
      setErrors({});
      setProcessing(false);
    }
  }, [show]);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleConfirm = () => {
    const newErrors = {};
    if (!form.name.trim()) {
      newErrors.name = __("campo_obligatorio");
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setProcessing(true);
    const filtersToSend = typeof getFiltersForRedirect === "function" ? getFiltersForRedirect() : filters || {};
    router.post(
      route("marketing-lists.store-from-contacts"),
      {
        name: form.name,
        observations: form.observations || null,
        redirect_filters: filtersToSend
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          setForm({ name: "", observations: "" });
          setErrors({});
          onClose && onClose();
        },
        onError: (err) => {
          setErrors(err || {});
        },
        onFinish: () => setProcessing(false)
      }
    );
  };
  return /* @__PURE__ */ jsxs(
    ReusableModal,
    {
      show,
      onClose,
      onConfirm: handleConfirm,
      title: __("marketing_lista_crear"),
      confirmText: processing ? __("guardando") : __("guardar"),
      cancelText: __("cancelar"),
      confirmDisabled: processing,
      children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-3", children: [
          /* @__PURE__ */ jsxs("label", { className: "form-label", children: [
            __("nombre"),
            "*"
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              name: "name",
              className: "form-control",
              value: form.name,
              onChange: handleChange,
              maxLength: 255,
              autoComplete: "off"
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors.name })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mb-3", children: [
          /* @__PURE__ */ jsx("label", { className: "form-label", children: __("observaciones") }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              name: "observations",
              className: "form-control",
              rows: 3,
              value: form.observations,
              onChange: handleChange,
              maxLength: 500
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors.observations })
        ] })
      ]
    }
  );
}
const EMPTY = Object.freeze([]);
const EMPTY_OBJ = Object.freeze({});
function Index({
  auth,
  session,
  title,
  subtitle,
  table = EMPTY_OBJ,
  contact_types,
  contact_types_combo,
  contact_subtypes,
  salutations,
  leads,
  slug,
  availableLocales,
  builderMode = false,
  builderList = null
}) {
  var _a, _b, _c, _d, _e;
  const __ = useTranslation();
  const t = table && typeof table === "object" ? table : EMPTY_OBJ;
  const { props } = usePage();
  const tableId = t.id ?? "tblContacts";
  const rows = t.rows ?? EMPTY_OBJ;
  const queryParams = t.queryParams ?? EMPTY_OBJ;
  const adhocFilters = t.adhocFilters ?? EMPTY;
  const legendItems = t.activeFiltersLegend ?? EMPTY;
  const { loading } = useInertiaLoading();
  const hasActiveFilters = legendItems.length > 0;
  const { showConfirm } = useSweetAlert();
  const indexRouteName = `${slug}.index`;
  const indexRouteParams = {};
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
  const isBuildingList = !!builderMode && !!builderList;
  const marketingListId = isBuildingList ? builderList.id : null;
  const [selectedContactIds, setSelectedContactIds] = useState([]);
  const totalContacts = ((_a = rows == null ? void 0 : rows.meta) == null ? void 0 : _a.total) ?? 0;
  const [showModalListFromContacts, setShowModalListFromContacts] = useState(false);
  const [selectingAll, setSelectingAll] = useState(false);
  const [savingMembers, setSavingMembers] = useState(false);
  const handleOpenModalListFromContacts = () => setShowModalListFromContacts(true);
  const handleCloseModalListFromContacts = () => setShowModalListFromContacts(false);
  const handleToggleContactInList = (contactId) => {
    setSelectedContactIds((prev) => {
      if (prev.includes(contactId)) {
        return prev.filter((id) => id !== contactId);
      }
      return [...prev, contactId];
    });
  };
  const handleToggleSelectAll = async () => {
    if (!isBuildingList || selectingAll) return;
    if (totalContacts > 0 && selectedContactIds.length >= totalContacts) {
      setSelectedContactIds([]);
      return;
    }
    const currentPageIds = ((rows == null ? void 0 : rows.data) || []).map((c) => c.id);
    setSelectedContactIds((prev) => {
      const set = new Set(prev);
      currentPageIds.forEach((id) => set.add(id));
      return Array.from(set);
    });
    try {
      setSelectingAll(true);
      const allRows = await filteredData(tableQueryParams);
      const allIds = allRows.map((r) => r.id).filter((id) => id !== null && id !== void 0);
      setSelectedContactIds((prev) => {
        if (prev.length === 0) return prev;
        const set = new Set(prev);
        allIds.forEach((id) => set.add(id));
        return Array.from(set);
      });
    } finally {
      setSelectingAll(false);
    }
  };
  useEffect(() => {
    if (!isBuildingList && selectedContactIds.length) {
      setSelectedContactIds([]);
    }
  }, [isBuildingList]);
  const handleSubmitSelectedToList = () => {
    if (!marketingListId || selectedContactIds.length === 0) return;
    showConfirm({
      title: __("miembros_guardar"),
      text: __("miembros_guardar_lista"),
      icon: "question",
      onConfirm: () => {
        setSavingMembers(true);
        router.post(
          route("marketing-list-users.store-from-contacts", marketingListId),
          { user_ids: selectedContactIds },
          {
            preserveScroll: true,
            onFinish: () => {
              setSavingMembers(false);
            }
          }
        );
      }
    });
  };
  const columns = [
    { key: "full_name", label: __("nombre"), sort: true, filter: "text", class_th: "", class_td: "", placeholder: __("nombre_filtrar") },
    // { key: 'created_at', label: __('fecha_alta'),  sort: true,  filter: 'date', class_th: 'text-center', class_td: 'text-end', placeholder: __('fecha_alta'), dateKeys: ['date_from', 'date_to'] },
    { key: "email", label: __("email"), sort: true, filter: "text", class_th: "", class_td: "", placeholder: __("email_filtrar") },
    { key: "phones", label: __("telefonos"), sort: false, filter: "text", class_th: "", class_td: "", placeholder: __("telefonos_filtrar") },
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
    filteredData,
    queryParams: tableQueryParams
  } = useTableManagement({
    table: tableId,
    allColumnKeys: columns.map((col) => col.key),
    entityName: "contacts",
    indexRoute: slug + ".index",
    destroyRoute: "users.destroy",
    filteredDataRoute: slug + ".filtered-data",
    labelName: "contactos",
    queryParams,
    preserveParams: isBuildingList && builderList ? { marketing_list_id: builderList.id, build_marketing_list: 1 } : {}
  });
  const queryParamsForNav = isBuildingList && builderList ? { ...tableQueryParams, marketing_list_id: builderList.id, build_marketing_list: 1 } : tableQueryParams;
  const tableQueryParamsRef = useRef(tableQueryParams);
  tableQueryParamsRef.current = tableQueryParams;
  const actions = [];
  if (permissions == null ? void 0 : permissions["crm-contacts.create"]) {
    actions.push({
      text: __("contacto_nuevo"),
      icon: "la-plus",
      url: "",
      modal: true,
      onClick: handleOpenModalUserCreate
    });
    actions.push({
      text: __("contactos_importar"),
      icon: "la-file-import",
      url: "crm-contacts.import",
      modal: false
    });
  }
  if ((permissions == null ? void 0 : permissions["marketing-lists.create"]) && !isBuildingList) {
    actions.push({
      text: __("marketing_lista_nueva"),
      icon: "la-newspaper",
      url: "",
      modal: true,
      onClick: handleOpenModalListFromContacts
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
          isBuildingList && /* @__PURE__ */ jsxs("div", { className: "alert alert-info d-flex justify-content-between align-items-center mb-3 mx-0", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              __("marketing_lista_construyendo"),
              ": ",
              /* @__PURE__ */ jsx("strong", { children: builderList.name }),
              " · ",
              __("contactos_seleccionados"),
              ": ",
              /* @__PURE__ */ jsx("strong", { children: selectedContactIds.length })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "d-flex align-items-center gap-2", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  className: "btn btn-sm btn-outline-secondary me-2",
                  disabled: totalContacts === 0 || selectingAll,
                  onClick: handleToggleSelectAll,
                  children: selectingAll ? /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx(
                      "span",
                      {
                        className: "spinner-border spinner-border-sm me-2",
                        role: "status",
                        "aria-hidden": "true"
                      }
                    ),
                    __("seleccionando_todos"),
                    " "
                  ] }) : selectedContactIds.length >= totalContacts && totalContacts > 0 ? __("deseleccionar_todos") : __("seleccionar_todos")
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  type: "button",
                  className: "btn btn-sm btn-primary",
                  disabled: selectedContactIds.length === 0 || savingMembers,
                  onClick: handleSubmitSelectedToList,
                  children: savingMembers ? /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx(
                      "span",
                      {
                        className: "spinner-border spinner-border-sm me-2",
                        role: "status",
                        "aria-hidden": "true"
                      }
                    ),
                    __("miembros_guardando")
                  ] }) : __("miembros_guardar")
                }
              )
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "row", children: /* @__PURE__ */ jsxs("div", { className: "controls d-flex align-items-center", children: [
            /* @__PURE__ */ jsx(ColumnFilter, { columns, visibleColumns, toggleColumn: toggleColumnVisibility }),
            /* @__PURE__ */ jsx(
              AdHocFiltersDropdown,
              {
                filters: adhocFilters,
                routeName: indexRouteName,
                routeParams: indexRouteParams,
                queryParams: queryParamsForNav
              }
            ),
            /* @__PURE__ */ jsx(RecordsPerPage, { perPage, setPerPage }),
            /* @__PURE__ */ jsx(TableExporter, { filename: __("contactos"), columns, fetchData: filteredData })
          ] }) }),
          /* @__PURE__ */ jsxs("div", { className: "d-flex justify-content-between align-items-center my-2", children: [
            /* @__PURE__ */ jsx(
              ActiveFiltersLegend,
              {
                items: legendItems,
                routeName: indexRouteName,
                routeParams: indexRouteParams,
                queryParams: queryParamsForNav
              }
            ),
            hasActiveFilters && loading ? /* @__PURE__ */ jsx(SpinnerInline, { text: __("cargando") ?? "Cargando…" }) : null
          ] }),
          /* @__PURE__ */ jsx("div", { className: "table-responsive", children: /* @__PURE__ */ jsxs(Table, { className: "table table-nowrap table-striped align-middle mb-0", id: tableId, children: [
            /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("th", { className: "text-center first-column", children: " " }),
              columns.map((col) => /* @__PURE__ */ jsxs("th", { className: `${col.class_th ?? ""} ${visibleColumns.includes(col.key) ? "" : "d-none"}`.trim(), children: [
                col.label,
                col.sort && /* @__PURE__ */ jsx(
                  SortControl,
                  {
                    name: col.key,
                    sortable: true,
                    sort_field: tableQueryParams.sort_field,
                    sort_direction: tableQueryParams.sort_direction,
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
                queryParams: queryParamsForNav,
                visibleColumns,
                SearchFieldChanged,
                PrependColumns: 1
              }
            ),
            /* @__PURE__ */ jsx("tbody", { children: ((rows == null ? void 0 : rows.data) || []).map((contact) => /* @__PURE__ */ jsxs("tr", { children: [
              /* @__PURE__ */ jsx("td", { className: "text-center", children: /* @__PURE__ */ jsx(ShowRegisterButton, { onClick: () => handleShowRegister(contact) }) }),
              columns.map((col) => /* @__PURE__ */ jsx("td", { className: `${col.class_td ?? ""} ${visibleColumns.includes(col.key) ? "" : "d-none"}`.trim(), children: renderCellContent(contact[col.key], col, contact) }, col.key)),
              /* @__PURE__ */ jsxs("td", { className: "text-end", children: [
                isBuildingList && /* @__PURE__ */ jsx(
                  Checkbox,
                  {
                    id: `mlist-${marketingListId}-user-${contact.id}`,
                    className: "me-2",
                    checked: selectedContactIds.includes(contact.id),
                    onChange: () => handleToggleContactInList(contact.id),
                    value: contact.id,
                    size: "lg"
                  }
                ),
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
            ] }, "contact-" + contact.id)) })
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
              links: (_b = rows == null ? void 0 : rows.meta) == null ? void 0 : _b.links,
              totalRecords: (_c = rows == null ? void 0 : rows.meta) == null ? void 0 : _c.total,
              currentPage: (_d = rows == null ? void 0 : rows.meta) == null ? void 0 : _d.current_page,
              perPage: (_e = rows == null ? void 0 : rows.meta) == null ? void 0 : _e.per_page,
              onPageChange: (page) => {
                const baseParams = {
                  ...queryParams,
                  page,
                  per_page: perPage,
                  sort_field: sortParams.sort_field,
                  sort_direction: sortParams.sort_direction
                };
                const params = isBuildingList && builderList ? { ...baseParams, marketing_list_id: builderList.id, build_marketing_list: 1 } : baseParams;
                router.get(route(indexRouteName, indexRouteParams), params, { preserveState: true });
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
          ),
          /* @__PURE__ */ jsx(
            ModalMarketingListFromContacts,
            {
              show: showModalListFromContacts,
              onClose: handleCloseModalListFromContacts,
              filters: tableQueryParams,
              getFiltersForRedirect: () => ({ ...tableQueryParamsRef.current })
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
