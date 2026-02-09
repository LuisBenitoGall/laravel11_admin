import { jsxs, jsx } from "react/jsx-runtime";
import { F as FlashMessage, A as AdminAuthenticated } from "./AdminAuthenticatedLayout-BAKikn-7.js";
import { router, usePage, useForm, Head } from "@inertiajs/react";
import "@inertiajs/inertia";
import "react-tooltip";
import { useState, useEffect } from "react";
import "./TextInput-CzxrbIpp.js";
import { u as useSweetAlert } from "./useSweetAlert-D4PAsWYN.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import { T as Tabs } from "./Tabs-CZO-HKNH.js";
import axios from "axios";
import { R as ReusableModal } from "./ModalTemplate-BnjBXi9G.js";
import { I as InfoPopover } from "./InfoPopover-CwWEvwXq.js";
import { I as InputError } from "./InputError-DME5vguS.js";
import { U as UserSearch } from "./UserSearch-Bn5gVs5d.js";
import { S as SelectSearch } from "./SelectSearch-x7o6yKJV.js";
import MarketingListInfoTab from "./MarketingListInfoTab-DnS353qq.js";
import MarketingListMembersTab from "./MarketingListMembersTab-8NiyApdp.js";
import "./Header-BVvoXjVe.js";
import "react-bootstrap";
import "sweetalert2";
import "./Sidebar-1g4CKLZI.js";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
import "react-select";
import "./Checkbox-C9HPJULq.js";
import "./PrimaryButton-CIbKPOjQ.js";
import "./TableUsers-BrZQQO9D.js";
import "./useTableManagement-_Ugox1d5.js";
import "react-datepicker";
import "date-fns";
import "date-fns/locale";
import "./SelectInput-DrqFt-OA.js";
import "./ShowRegister-ChxyE8YT.js";
import "prop-types";
import "./ShowRegisterButton-CPwJtUP3.js";
import "./TableExporter-RjBSwz2t.js";
import "./StatusButton-DfO41WfJ.js";
import "./UserShowView-BriFAEee.js";
import "./ManagePhones-LdkmCbcO.js";
import "./renderCellContent-DkxoXe9S.js";
function ModalMarketingListAddUser({
  show,
  onClose,
  onAdded,
  // callback opcional para que el padre recargue (router.reload, etc.)
  marketingListId
  // id de la lista de marketing
}) {
  const __ = useTranslation();
  const [form, setForm] = useState({
    user_id: null,
    observations: ""
  });
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  const [flash, setFlash] = useState({
    type: null,
    message: ""
  });
  useEffect(() => {
    if (!show) {
      setForm({
        user_id: null,
        observations: ""
      });
      setErrors({});
      setProcessing(false);
      setFlash({
        type: null,
        message: ""
      });
    }
  }, [show]);
  const handleSelectUser = (user) => {
    setForm((prev) => ({
      ...prev,
      user_id: user ? user.id : null
    }));
    setErrors((prev) => ({ ...prev, user_id: null }));
  };
  const handleChangeObservations = (e) => {
    const { value } = e.target;
    setForm((prev) => ({
      ...prev,
      observations: value
    }));
  };
  const handleConfirm = async () => {
    var _a, _b, _c, _d, _e, _f;
    const newErrors = {};
    if (!form.user_id) {
      newErrors.user_id = __("campo_obligatorio");
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setProcessing(true);
    setErrors({});
    setFlash({ type: null, message: "" });
    try {
      const response = await axios.post(
        route("marketing-list-users.store"),
        {
          marketing_list_id: marketingListId,
          user_id: form.user_id,
          observations: form.observations || null
        },
        {
          headers: {
            Accept: "application/json"
          }
        }
      );
      const msg = ((_a = response.data) == null ? void 0 : _a.message) ?? __("usuario_anadido_ok");
      onClose == null ? void 0 : onClose();
      if (typeof onAdded === "function") {
        onAdded((_b = response.data) == null ? void 0 : _b.data);
      }
    } catch (error) {
      const status = (_c = error.response) == null ? void 0 : _c.status;
      const data = ((_d = error.response) == null ? void 0 : _d.data) ?? {};
      if (status === 422) {
        const backendErrors = data.errors || {};
        if (Object.keys(backendErrors).length > 0) {
          const flatErrors = {};
          Object.entries(backendErrors).forEach(([field, msgs]) => {
            if (Array.isArray(msgs) && msgs.length) {
              flatErrors[field] = msgs[0];
            }
          });
          setErrors(flatErrors);
        }
        const firstError = data.message || ((_f = (_e = Object.values(data.errors ?? {})) == null ? void 0 : _e[0]) == null ? void 0 : _f[0]) || __("error_validacion");
        setFlash({
          type: "danger",
          message: firstError
        });
      } else if (status === 403) {
        setFlash({
          type: "danger",
          message: data.message ?? __("empresa_no_activa")
        });
      } else {
        setFlash({
          type: "danger",
          message: __("error_interno_intentelo_mas_tarde")
        });
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
      title: __("usuario_agregar"),
      confirmText: processing ? __("guardando") : __("guardar"),
      cancelText: __("cancelar"),
      confirmDisabled: processing,
      children: [
        /* @__PURE__ */ jsx(
          FlashMessage,
          {
            type: flash.type || "danger",
            message: flash.message
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "mb-3", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
          /* @__PURE__ */ jsxs("label", { className: "form-label", children: [
            __("usuario"),
            "*"
          ] }),
          /* @__PURE__ */ jsx(
            UserSearch,
            {
              id: "ml-user-search",
              name: "user_id",
              placeholder: __("usuario_buscar"),
              searchUrl: route("marketing-list-users.search", marketingListId),
              onChange: handleSelectUser
            }
          ),
          /* @__PURE__ */ jsx(InfoPopover, { code: "marketing-list-user" }),
          /* @__PURE__ */ jsx(InputError, { message: errors.user_id })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "mb-3", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
          /* @__PURE__ */ jsx("label", { className: "form-label", children: __("observaciones") }),
          /* @__PURE__ */ jsx(
            "textarea",
            {
              name: "observations",
              className: "form-control",
              rows: 3,
              value: form.observations,
              onChange: handleChangeObservations,
              maxLength: 500
            }
          ),
          /* @__PURE__ */ jsx(InfoPopover, { code: "marketing-list-user-observations" }),
          /* @__PURE__ */ jsx(InputError, { message: errors.observations })
        ] }) })
      ]
    }
  );
}
function ModalMarketingListCloneMembers({
  show,
  onClose,
  onCloned,
  // callback para recargar miembros
  marketingListId,
  sourceLists = []
  // [{ id, name }]
}) {
  const __ = useTranslation();
  const [selectedIds, setSelectedIds] = useState([]);
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);
  useEffect(() => {
    if (!show) {
      setSelectedIds([]);
      setErrors({});
      setProcessing(false);
    }
  }, [show]);
  const options = sourceLists.map((list) => ({
    value: list.id,
    label: list.name
  }));
  const handleListsChange = (value) => {
    let ids = [];
    if (Array.isArray(value)) {
      if (value.length && typeof value[0] === "object") {
        ids = value.map((v) => Number(v.value ?? v.id)).filter((v) => !Number.isNaN(v));
      } else {
        ids = value.map((v) => Number(v)).filter((v) => !Number.isNaN(v));
      }
    } else if (value !== null && value !== void 0) {
      if (typeof value === "object") {
        const v = Number(value.value ?? value.id);
        if (!Number.isNaN(v)) ids = [v];
      } else {
        const v = Number(value);
        if (!Number.isNaN(v)) ids = [v];
      }
    }
    setSelectedIds(ids);
    if (ids.length > 0) {
      setErrors((prev) => ({ ...prev, source_list_ids: null }));
    }
  };
  const handleConfirm = () => {
    const newErrors = {};
    if (!selectedIds.length) {
      newErrors.source_list_ids = __("campo_obligatorio");
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setProcessing(true);
    router.post(
      route("marketing-list-users.clone", marketingListId),
      {
        source_list_ids: selectedIds
      },
      {
        preserveScroll: true,
        onSuccess: () => {
          setSelectedIds([]);
          setErrors({});
          onClose && onClose();
          if (typeof onCloned === "function") {
            onCloned();
          }
        },
        onError: (err) => {
          setErrors(err || {});
        },
        onFinish: () => setProcessing(false)
      }
    );
  };
  return /* @__PURE__ */ jsx(
    ReusableModal,
    {
      show,
      onClose,
      onConfirm: handleConfirm,
      title: __("listas_copiar"),
      confirmText: processing ? __("copiando") : __("copiar"),
      cancelText: __("cancelar"),
      confirmDisabled: processing,
      children: /* @__PURE__ */ jsxs("div", { className: "mb-3", children: [
        /* @__PURE__ */ jsx("p", { className: "mb-3", children: __("listas_copiar_texto") }),
        /* @__PURE__ */ jsxs("label", { className: "form-label", children: [
          __("listas"),
          "*"
        ] }),
        /* @__PURE__ */ jsx(
          SelectSearch,
          {
            name: "source_list_ids",
            isMulti: true,
            options,
            value: options.filter((opt) => selectedIds.includes(opt.value)),
            onChange: handleListsChange,
            placeholder: __("listas_selec")
          }
        ),
        /* @__PURE__ */ jsx(InputError, { message: errors.source_list_ids })
      ] })
    }
  );
}
function Index({
  auth,
  session,
  title,
  subtitle,
  list,
  tab,
  members,
  rows,
  availableLocales
}) {
  var _a, _b;
  const __ = useTranslation();
  const props = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  props.locale || false;
  props.languages || [];
  const permissions = props.permissions || {};
  const cloneSourceLists = props.cloneSourceLists || [];
  const { showConfirm } = useSweetAlert();
  const rawQueryParams = props.queryParams || {};
  const queryParams = typeof rawQueryParams === "object" && rawQueryParams !== null ? rawQueryParams : {};
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const handleOpenAddUserModal = () => setShowAddUserModal(true);
  const handleCloseAddUserModal = () => setShowAddUserModal(false);
  const handleUserAdded = () => {
    router.reload({
      data: {
        ...queryParams || {},
        page: 1
      },
      only: ["users", "rows"],
      preserveState: true,
      preserveScroll: true
    });
  };
  const [showCloneModal, setShowCloneModal] = useState(false);
  const handleOpenCloneModal = () => setShowCloneModal(true);
  const handleCloseCloneModal = () => setShowCloneModal(false);
  const handleMembersChanged = () => {
    router.reload({
      data: {
        ...queryParams || {},
        page: 1
      },
      only: ["users", "rows"],
      preserveState: true,
      preserveScroll: true
    });
  };
  const { data, setData, errors, processing } = useForm({
    name: list.name || "",
    status: list.status
  });
  const { confirm } = ((_b = useSweetAlert) == null ? void 0 : _b()) || { confirm: null };
  const handleExportToBrevo = (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    showConfirm({
      title: __("exportacion_listado"),
      text: __("exportacion_listado_confirm"),
      icon: "warning",
      onConfirm: () => {
        router.post(
          route("marketing-lists.export-brevo", [list.id]),
          {},
          {
            preserveScroll: true,
            onSuccess: () => {
              router.reload({
                data: {
                  ...queryParams || {},
                  page: queryParams.page || 1
                },
                only: ["list", "users", "rows"],
                preserveState: true,
                preserveScroll: true
              });
            }
          }
        );
      }
    });
  };
  const actions = [];
  if (permissions == null ? void 0 : permissions["marketing-lists.index"]) {
    actions.push({
      text: __("listas_volver"),
      icon: "la-angle-left",
      url: "marketing-lists.index",
      modal: false
    });
  }
  if (permissions == null ? void 0 : permissions["marketing-lists.create"]) {
    actions.push({
      text: __("lista_nueva"),
      icon: "la-plus",
      url: "marketing-lists.create",
      modal: false
    });
  }
  if (permissions == null ? void 0 : permissions["marketing-lists.edit"]) {
    actions.push({
      text: __("usuario_agregar"),
      icon: "la-plus",
      url: "",
      modal: true,
      onClick: handleOpenAddUserModal
    });
  }
  if (permissions == null ? void 0 : permissions["marketing-lists.edit"]) {
    actions.push({
      text: __("listas_copiar"),
      icon: "la-copy",
      url: "",
      modal: true,
      onClick: handleOpenCloneModal
    });
  }
  if (permissions == null ? void 0 : permissions["marketing-lists.edit"]) {
    actions.push({
      text: __("brevo_exportar"),
      icon: "la-file-export",
      url: "",
      modal: true,
      onClick: handleExportToBrevo
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
              __("lista"),
              " ",
              /* @__PURE__ */ jsx("u", { children: list.name })
            ] }) }),
            /* @__PURE__ */ jsxs("div", { className: "col-12 mt-2 mb-4", children: [
              /* @__PURE__ */ jsxs("span", { className: "text-muted me-5", children: [
                __("creado"),
                ": ",
                /* @__PURE__ */ jsx("strong", { children: list.formatted_created_at })
              ] }),
              list.created_by_name && /* @__PURE__ */ jsxs("span", { className: "text-muted me-5", children: [
                __("creado_por"),
                ": ",
                /* @__PURE__ */ jsx("strong", { children: list.created_by_name })
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "text-muted", children: [
                __("actualizado"),
                ": ",
                /* @__PURE__ */ jsx("strong", { children: list.formatted_updated_at })
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
                    MarketingListInfoTab,
                    {
                      list,
                      side: "marketing-lists",
                      updateRoute: "marketing-lists.update",
                      updateParams: [list.id]
                    }
                  )
                },
                {
                  key: "members",
                  label: __("miembros"),
                  content: /* @__PURE__ */ jsx(
                    MarketingListMembersTab,
                    {
                      users: members ?? null,
                      rows: rows ?? [],
                      indexRoute: "marketing-lists.edit",
                      indexParams: [list.id, "members"],
                      tableId: "tblMarketingListMembers",
                      filteredDataRoute: "marketing-lists.members.filtered-data",
                      queryParams
                    }
                  )
                }
              ],
              defaultActive: tab
            }
          ),
          /* @__PURE__ */ jsx(
            ModalMarketingListAddUser,
            {
              show: showAddUserModal,
              onClose: handleCloseAddUserModal,
              onAdded: handleUserAdded,
              marketingListId: list.id
            }
          ),
          /* @__PURE__ */ jsx(
            ModalMarketingListCloneMembers,
            {
              show: showCloneModal,
              onClose: handleCloseCloneModal,
              onCloned: handleMembersChanged,
              marketingListId: list.id,
              sourceLists: cloneSourceLists
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
