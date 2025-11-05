import { jsx, jsxs } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-Be6zbhrA.js";
import { usePage, useForm, Head } from "@inertiajs/react";
import "@inertiajs/inertia";
import "react-tooltip";
import { useEffect, useRef, useState } from "react";
import { T as Tabs } from "./Tabs-Cd7Sj0t_.js";
import { T as TextInput } from "./TextInput-CzxrbIpp.js";
import { u as useSweetAlert } from "./useSweetAlert-D4PAsWYN.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import { R as ReusableModal } from "./ModalTemplate-CgiU7p0h.js";
import { I as InputError } from "./InputError-DME5vguS.js";
import { F as FormDatePickerInput } from "./DatePickerToForm-HPj3On-3.js";
import CompanyInfoTab from "./CompanyInfoTab-CuwVsxh6.js";
import CompanyUsersTab from "./CompanyUsersTab-BasOkBy1.js";
import "axios";
import "./Header-DmTv-HRw.js";
import "react-bootstrap";
import "sweetalert2";
import "./Sidebar-j3CEPiJG.js";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
import "react-datepicker";
/* empty css                          */
import "date-fns/locale";
import "./FileInput-U7oe6ye3.js";
import "./InfoPopover-CwWEvwXq.js";
import "./PrimaryButton-B91ets3U.js";
import "./useTableManagement-B3k5rfcT.js";
import "date-fns";
import "./SelectInput-DrqFt-OA.js";
import "./TableExporter-BjSebGA-.js";
import "jspdf";
import "jspdf-autotable";
import "exceljs";
import "file-saver";
import "./StatusButton-DPQw0QHC.js";
import "./renderCellContent-Dpxbw8rL.js";
function ModalUserCreate({ show, onClose, onCreate, companyId, side }) {
  var _a;
  const __ = useTranslation();
  const pageProps = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  const roles = pageProps.roles || {};
  Object.entries(roles).map(([key, label]) => ({ value: key, label }));
  const { data, setData, post, processing, reset, errors, clearErrors } = useForm({
    role: "",
    name: "",
    surname: "",
    email: "",
    status: true,
    link_company: true,
    send_pwd: false,
    birthday: null,
    position: "",
    phones: [""],
    company_id: companyId || null,
    side: side || ""
  });
  useEffect(() => {
    setData("company_id", companyId || null);
    clearErrors();
  }, [show, companyId]);
  const handleAddPhone = () => {
    setData("phones", [...data.phones || [], ""]);
  };
  const handlePhoneChange = (index, value) => {
    const next = [...data.phones || []];
    next[index] = value;
    setData("phones", next);
  };
  const handleRemovePhone = (index) => {
    const next = [...data.phones || []];
    next.splice(index, 1);
    setData("phones", next.length ? next : [""]);
  };
  const formRef = useRef(null);
  const handleConfirm = () => {
    if (formRef.current && typeof formRef.current.reportValidity === "function") {
      const valid = formRef.current.reportValidity();
      if (!valid) return;
    }
    post(route("users.store"), {
      preserveScroll: true,
      onSuccess: (resp) => {
        reset();
        onClose == null ? void 0 : onClose();
        if (typeof onCreate === "function") onCreate(resp);
      }
    });
  };
  return /* @__PURE__ */ jsx(
    ReusableModal,
    {
      show,
      onClose,
      onConfirm: handleConfirm,
      title: __("usuario_nuevo"),
      confirmText: processing ? __("guardando") : __("guardar"),
      cancelText: __("cancelar"),
      children: /* @__PURE__ */ jsxs("form", { ref: formRef, onSubmit: (e) => {
        e.preventDefault();
        handleConfirm();
      }, children: [
        /* @__PURE__ */ jsx("div", { className: "mb-3", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
          /* @__PURE__ */ jsxs("label", { className: "form-label", children: [
            __("nombre"),
            "*"
          ] }),
          /* @__PURE__ */ jsx(TextInput, { value: data.name, onChange: (e) => setData("name", e.target.value), required: true }),
          /* @__PURE__ */ jsx(InputError, { message: errors.name })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "mb-3", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
          /* @__PURE__ */ jsxs("label", { className: "form-label", children: [
            __("apellidos"),
            "*"
          ] }),
          /* @__PURE__ */ jsx(TextInput, { value: data.surname, onChange: (e) => setData("surname", e.target.value), required: true }),
          /* @__PURE__ */ jsx(InputError, { message: errors.surname })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "mb-3", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
          /* @__PURE__ */ jsxs("label", { className: "form-label", children: [
            __("email"),
            "*"
          ] }),
          /* @__PURE__ */ jsx(TextInput, { type: "email", value: data.email, onChange: (e) => setData("email", e.target.value), required: true }),
          /* @__PURE__ */ jsx(InputError, { message: errors.email })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "mb-3", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
          /* @__PURE__ */ jsx("label", { className: "form-label", children: __("cargo") }),
          /* @__PURE__ */ jsx(TextInput, { value: data.position, onChange: (e) => setData("position", e.target.value) }),
          /* @__PURE__ */ jsx(InputError, { message: errors.position })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "mb-3", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
          /* @__PURE__ */ jsx(
            FormDatePickerInput,
            {
              name: "birthday",
              selected: data.birthday ? new Date(data.birthday) : null,
              onChange: (name, date) => setData(name, date ? date.toISOString().split("T")[0] : null),
              dateFormat: "dd/MM/yyyy",
              label: "fecha_nacimiento",
              required: false
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors.birthday })
        ] }) }),
        /* @__PURE__ */ jsx("div", { className: "mb-3", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
          /* @__PURE__ */ jsx("label", { className: "form-label", children: __("telefonos") }),
          /* @__PURE__ */ jsxs("div", { className: "row", children: [
            /* @__PURE__ */ jsxs("div", { className: "col-md-9", children: [
              (data.phones || []).map((ph, idx) => /* @__PURE__ */ jsxs("div", { className: "input-group mb-3", children: [
                /* @__PURE__ */ jsx("input", { type: "text", className: "form-control", value: ph, onChange: (e) => handlePhoneChange(idx, e.target.value), maxLength: 14 }),
                /* @__PURE__ */ jsx("button", { type: "button", className: "btn btn-outline-danger", onClick: () => handleRemovePhone(idx), children: /* @__PURE__ */ jsx("i", { className: "la la-trash" }) })
              ] }, `phone-${idx}`)),
              /* @__PURE__ */ jsx(InputError, { message: errors.phones })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "col-md-3", children: /* @__PURE__ */ jsxs("button", { type: "button", className: "btn btn-sm btn-secondary mt-2", onClick: handleAddPhone, children: [
              /* @__PURE__ */ jsx("i", { className: "la la-plus" }),
              " ",
              __("telefono") || "Añadir teléfono"
            ] }) })
          ] })
        ] }) })
      ] })
    }
  );
}
function Index({ auth, session, title, subtitle, customer, relation, users, rows, tab, availableLocales }) {
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
              side: "customers"
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
