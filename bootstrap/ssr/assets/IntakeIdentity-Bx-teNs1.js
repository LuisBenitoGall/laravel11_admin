import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-C5syfI8B.js";
import { usePage, useForm, Head, router } from "@inertiajs/react";
import { I as InputError } from "./InputError-DME5vguS.js";
import { P as PrimaryButton } from "./PrimaryButton-CIbKPOjQ.js";
import { R as RadioButton } from "./RadioButton-BQ8Yvx79.js";
import { S as SecondaryButton } from "./SecondaryButton-CXDrSeVp.js";
import { T as TextInput } from "./TextInput-CzxrbIpp.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import "react";
import "./Header-BFeBcT5X.js";
import "@inertiajs/inertia";
import "react-bootstrap";
import "./useSweetAlert-D4PAsWYN.js";
import "sweetalert2";
import "./Sidebar-DgixJBon.js";
import "axios";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
const EMPTY_FORM = Object.freeze({ type: "company", email: "", nif: "", name: "" });
function IntakeIdentity({
  auth,
  title,
  subtitle,
  form: initialForm = EMPTY_FORM,
  result = null
}) {
  var _a;
  const __ = useTranslation();
  const props = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  const permissions = props.permissions || {};
  const searchForm = useForm({
    type: (initialForm == null ? void 0 : initialForm.type) || "company",
    email: (initialForm == null ? void 0 : initialForm.email) || "",
    nif: (initialForm == null ? void 0 : initialForm.nif) || ""
  });
  const createForm = useForm({
    type: (initialForm == null ? void 0 : initialForm.type) || "company",
    name: "",
    email: (initialForm == null ? void 0 : initialForm.email) || "",
    nif: (initialForm == null ? void 0 : initialForm.nif) || ""
  });
  const typeOptions = [
    { value: "company", label: __("intake_identity_tipo_empresa") },
    { value: "user", label: __("intake_identity_tipo_particular") }
  ];
  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    searchForm.setData(name, value);
    if (name === "type") {
      createForm.setData("type", value);
    }
  };
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    searchForm.post(route("logistics.intake-identity.search"), {
      preserveScroll: true
    });
  };
  const handleEnsure = (type, id) => {
    router.post(route("logistics.intake-identity.ensure"), { type, id }, {
      preserveScroll: true
    });
  };
  const handleCreateSubmit = (e) => {
    e.preventDefault();
    createForm.transform((data) => ({
      ...data,
      type: searchForm.data.type,
      email: searchForm.data.email,
      nif: searchForm.data.nif
    })).post(route("logistics.intake-identity.store"), {
      preserveScroll: true,
      onSuccess: () => createForm.reset("name")
    });
  };
  const canCreateCompany = !!(permissions == null ? void 0 : permissions["customers.create"]);
  const canCreateUser = !!((permissions == null ? void 0 : permissions["users.create"]) || (permissions == null ? void 0 : permissions["customers.create"]));
  const canCreate = searchForm.data.type === "company" && canCreateCompany || searchForm.data.type === "user" && canCreateUser;
  const companies = (result == null ? void 0 : result.companies) || [];
  const users = (result == null ? void 0 : result.users) || [];
  const status = (result == null ? void 0 : result.status) || null;
  return /* @__PURE__ */ jsxs(AdminAuthenticated, { user: auth.user, title, subtitle, actions: [], children: [
    /* @__PURE__ */ jsx(Head, { title }),
    /* @__PURE__ */ jsxs("div", { className: "contents pb-4", children: [
      /* @__PURE__ */ jsx("p", { className: "text-muted mb-3", children: __("intake_identity_ayuda") }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSearchSubmit, className: "mb-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-3", children: [
          /* @__PURE__ */ jsx("label", { className: "form-label", children: __("intake_identity_tipo") }),
          /* @__PURE__ */ jsx(
            RadioButton,
            {
              name: "type",
              value: searchForm.data.type,
              onChange: handleSearchChange,
              options: typeOptions,
              required: true
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: searchForm.errors.type })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "row g-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "col-md-6", children: [
            /* @__PURE__ */ jsx("label", { className: "form-label", htmlFor: "intake-email", children: __("email") }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "intake-email",
                name: "email",
                type: "email",
                className: "form-control",
                value: searchForm.data.email,
                onChange: handleSearchChange
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: searchForm.errors.email })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "col-md-6", children: [
            /* @__PURE__ */ jsx("label", { className: "form-label", htmlFor: "intake-nif", children: __("nif") }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "intake-nif",
                name: "nif",
                type: "text",
                className: "form-control",
                value: searchForm.data.nif,
                onChange: handleSearchChange
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: searchForm.errors.nif })
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mt-3", children: /* @__PURE__ */ jsx(PrimaryButton, { type: "submit", disabled: searchForm.processing, children: __("buscar") }) })
      ] }),
      status === "conflict" && /* @__PURE__ */ jsxs("div", { className: "alert alert-warning", children: [
        /* @__PURE__ */ jsx("p", { className: "mb-2 fw-semibold", children: __("intake_identity_conflicto") }),
        /* @__PURE__ */ jsx("p", { className: "mb-3", children: __("intake_identity_conflicto_texto") }),
        /* @__PURE__ */ jsx(
          CandidateList,
          {
            title: __("empresas"),
            items: companies,
            type: "company",
            onSelect: handleEnsure,
            canSelect: canCreateCompany,
            __
          }
        ),
        /* @__PURE__ */ jsx(
          CandidateList,
          {
            title: __("usuarios"),
            items: users,
            type: "user",
            onSelect: handleEnsure,
            canSelect: canCreateUser,
            __
          }
        )
      ] }),
      status === "match" && /* @__PURE__ */ jsxs("div", { className: "alert alert-info", children: [
        /* @__PURE__ */ jsx("p", { className: "mb-2 fw-semibold", children: __("intake_identity_match") }),
        searchForm.data.type === "company" ? /* @__PURE__ */ jsx(
          CandidateList,
          {
            title: __("empresas"),
            items: companies,
            type: "company",
            onSelect: handleEnsure,
            canSelect: canCreateCompany,
            __
          }
        ) : /* @__PURE__ */ jsx(
          CandidateList,
          {
            title: __("usuarios"),
            items: users,
            type: "user",
            onSelect: handleEnsure,
            canSelect: canCreateUser,
            __
          }
        )
      ] }),
      status === "none" && canCreate && /* @__PURE__ */ jsxs("div", { className: "border rounded p-3 bg-light", children: [
        /* @__PURE__ */ jsx("p", { className: "fw-semibold mb-2", children: __("intake_identity_alta") }),
        /* @__PURE__ */ jsx("p", { className: "text-muted small mb-3", children: __("intake_identity_alta_texto") }),
        /* @__PURE__ */ jsxs("form", { onSubmit: handleCreateSubmit, children: [
          searchForm.data.type === "user" && /* @__PURE__ */ jsxs("div", { className: "mb-3", children: [
            /* @__PURE__ */ jsx("label", { className: "form-label", htmlFor: "intake-name", children: __("nombre") }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "intake-name",
                name: "name",
                type: "text",
                className: "form-control",
                value: createForm.data.name,
                onChange: (e) => createForm.setData("name", e.target.value)
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: createForm.errors.name })
          ] }),
          /* @__PURE__ */ jsx(SecondaryButton, { type: "submit", disabled: createForm.processing, children: searchForm.data.type === "company" ? __("intake_identity_crear_empresa") : __("intake_identity_crear_particular") }),
          /* @__PURE__ */ jsx(InputError, { message: createForm.errors.type, className: "mt-2" })
        ] })
      ] })
    ] })
  ] });
}
function CandidateList({ title, items, type, onSelect, canSelect, __ }) {
  if (!(items == null ? void 0 : items.length)) {
    return null;
  }
  return /* @__PURE__ */ jsxs("div", { className: "mb-3", children: [
    /* @__PURE__ */ jsx("div", { className: "fw-semibold mb-1", children: title }),
    /* @__PURE__ */ jsx("ul", { className: "list-group", children: items.map((item) => /* @__PURE__ */ jsxs(
      "li",
      {
        className: "list-group-item d-flex justify-content-between align-items-center",
        children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { children: item.label }),
            /* @__PURE__ */ jsxs("small", { className: "text-muted", children: [
              item.nif ? `${__("nif")}: ${item.nif}` : "",
              item.email ? ` ${__("email")}: ${item.email}` : ""
            ] })
          ] }),
          canSelect && /* @__PURE__ */ jsx(
            PrimaryButton,
            {
              type: "button",
              className: "btn-sm",
              onClick: () => onSelect(type, item.id),
              children: __("intake_identity_usar")
            }
          )
        ]
      },
      `${type}-${item.id}`
    )) })
  ] });
}
export {
  IntakeIdentity as default
};
