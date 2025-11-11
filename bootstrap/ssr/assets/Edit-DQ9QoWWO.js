import { jsx, jsxs } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-CS968Wx3.js";
import { router, usePage, useForm, Head } from "@inertiajs/react";
import { useState, useEffect, useRef } from "react";
import { I as InputError } from "./InputError-DME5vguS.js";
import { P as PrimaryButton } from "./PrimaryButton-B91ets3U.js";
import axios from "axios";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import { T as Textarea } from "./Textarea-nvTyMSx8.js";
import { T as TextInput } from "./TextInput-CzxrbIpp.js";
import "@inertiajs/inertia";
import "./Header-Px-6ZOXw.js";
import "react-bootstrap";
import "./useSweetAlert-D4PAsWYN.js";
import "sweetalert2";
import "./Sidebar-CypaLfnr.js";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
import "react-draft-wysiwyg";
import "draft-js";
import "html-to-draftjs";
import "draftjs-to-html";
/* empty css                             */
function BackToTop({ offset = 300 }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > offset);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [offset]);
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  if (!visible) return null;
  return /* @__PURE__ */ jsx(
    "button",
    {
      type: "button",
      onClick: scrollToTop,
      className: "btn btn-primary position-fixed",
      style: {
        bottom: "30px",
        right: "30px",
        zIndex: 1050,
        borderRadius: "50%",
        width: "45px",
        height: "45px",
        boxShadow: "0 0 10px rgba(0,0,0,0.2)"
      },
      title: "Volver arriba",
      children: /* @__PURE__ */ jsx("i", { className: "la la-arrow-up" })
    }
  );
}
function RolePermissions({
  modules = [],
  functionalities = [],
  role_permissions = [],
  permissions_all = [],
  roleId
}) {
  const __ = useTranslation();
  const [expanded, setExpanded] = useState({});
  const [expandAll, setExpandAll] = useState(false);
  const [localPermissions, setLocalPermissions] = useState(role_permissions || []);
  const toggleExpandAll = () => setExpandAll((prev) => !prev);
  const functionalitiesByModule = modules.reduce((acc, module) => {
    acc[module.id] = functionalities.filter((f) => f.module_id === module.id);
    return acc;
  }, {});
  const permissionsByFunctionality = {};
  functionalities.forEach((func) => {
    const normalizedSlug = func.slug.toLowerCase().replace(/_/g, "-");
    const matchingPerms = permissions_all.filter((p) => {
      const [slug] = p.name.split(".");
      return slug === normalizedSlug;
    });
    permissionsByFunctionality[func.id] = matchingPerms;
  });
  const handlePermissionToggle = (permId, isChecked) => {
    setLocalPermissions((prev) => {
      if (isChecked) {
        return [...prev, permId];
      } else {
        return prev.filter((id) => id !== permId);
      }
    });
    router.post(route("roles.set-permission", roleId), {
      permission_id: permId,
      assigned: isChecked
    }, {
      preserveScroll: true,
      preserveState: true,
      only: []
    });
  };
  const toggleAllPermissionsForFunctionality = async (funcId) => {
    const permissions = permissionsByFunctionality[funcId] || [];
    const permissionIds = permissions.map((p) => p.id);
    const allSelected = permissionIds.every((id) => localPermissions.includes(id));
    const newState = allSelected ? "deselect" : "select";
    const updated = new Set(localPermissions);
    if (newState === "select") {
      permissionIds.forEach((id) => updated.add(id));
    } else {
      permissionIds.forEach((id) => updated.delete(id));
    }
    setLocalPermissions([...updated]);
    await axios.post(route("roles.set-multiple-permissions", roleId), {
      permissions: permissionIds,
      assigned: newState === "select"
    });
  };
  const selectAllRefs = useRef({});
  useEffect(() => {
    functionalities.forEach((func) => {
      const perms = permissionsByFunctionality[func.id] || [];
      const allSelected = perms.every((p) => localPermissions.includes(p.id));
      const someSelected = perms.some((p) => localPermissions.includes(p.id));
      const ref = selectAllRefs.current[func.id];
      if (ref) {
        ref.indeterminate = !allSelected && someSelected;
      }
    });
  }, [localPermissions]);
  return /* @__PURE__ */ jsxs("div", { className: "mt-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "row align-items-center mb-3", children: [
      /* @__PURE__ */ jsx("div", { className: "col-md-9 col-12 mb-2 mb-md-0", children: /* @__PURE__ */ jsx("div", { className: "d-flex flex-wrap", children: modules.map((module) => /* @__PURE__ */ jsx(
        "a",
        {
          href: `#module-${module.id}`,
          className: "badge rounded-pill bg-info text-white me-2 mb-2",
          children: module.label
        },
        module.id
      )) }) }),
      /* @__PURE__ */ jsx("div", { className: "col-md-3 col-12 text-md-end text-start", children: /* @__PURE__ */ jsxs("div", { className: "d-inline-flex align-items-center", children: [
        /* @__PURE__ */ jsx("label", { className: "form-label me-2 mb-0", children: __("permisos_desplegar_todos") }),
        /* @__PURE__ */ jsx("div", { className: "form-check form-switch", children: /* @__PURE__ */ jsx(
          "input",
          {
            className: "form-check-input",
            type: "checkbox",
            id: "toggleExpandAll",
            checked: expandAll,
            onChange: toggleExpandAll
          }
        ) })
      ] }) })
    ] }),
    modules.map((module) => {
      var _a;
      return /* @__PURE__ */ jsxs("div", { id: `module-${module.id}`, className: "mb-5", children: [
        /* @__PURE__ */ jsx(
          "div",
          {
            className: "text-white px-3 py-2 mb-3",
            style: {
              backgroundColor: module.color || "#6f42c1",
              borderRadius: "4px",
              fontWeight: "bold",
              textTransform: "uppercase"
            },
            children: __(module.label)
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "row", children: (_a = functionalitiesByModule[module.id]) == null ? void 0 : _a.map((func) => {
          var _a2, _b;
          return /* @__PURE__ */ jsx("div", { className: "col-md-4 mb-4", children: /* @__PURE__ */ jsxs("div", { className: "card border", children: [
            /* @__PURE__ */ jsxs(
              "div",
              {
                className: "card-header d-flex justify-content-between align-items-center",
                style: { cursor: "pointer" },
                onClick: () => setExpanded((prev) => ({ ...prev, [func.id]: !prev[func.id] })),
                children: [
                  __(func.label),
                  /* @__PURE__ */ jsx(
                    "i",
                    {
                      className: `la la-angle-down transition-arrow ${expandAll || expanded[func.id] ? "rotate-180" : ""}`,
                      style: { transition: "transform 0.2s ease-in-out" }
                    }
                  )
                ]
              }
            ),
            (expandAll || expanded[func.id]) && /* @__PURE__ */ jsxs("ul", { className: "list-group list-group-flush", children: [
              (_a2 = permissionsByFunctionality[func.id]) == null ? void 0 : _a2.map((perm) => /* @__PURE__ */ jsxs("li", { className: "list-group-item d-flex align-items-center", children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "checkbox",
                    className: "form-check-input me-2",
                    checked: localPermissions.includes(perm.id),
                    onChange: (e) => handlePermissionToggle(perm.id, e.target.checked)
                  }
                ),
                perm.name
              ] }, perm.id)),
              /* @__PURE__ */ jsxs("li", { className: "list-group-item perm-select-all text-muted small d-flex align-items-center", onClick: () => toggleAllPermissionsForFunctionality(func.id), children: [
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    ref: (el) => selectAllRefs.current[func.id] = el,
                    type: "checkbox",
                    className: "form-check-input me-2",
                    checked: (_b = permissionsByFunctionality[func.id]) == null ? void 0 : _b.every((p) => localPermissions.includes(p.id)),
                    readOnly: true
                  }
                ),
                __("permisos_selec_todos")
              ] })
            ] })
          ] }) }, func.id);
        }) })
      ] }, module.id);
    })
  ] });
}
function Index({ auth, session, title, subtitle, availableLocales, role, functionalities, modules, permissions_all, module_permissions, role_permissions }) {
  var _a;
  const __ = useTranslation();
  const props = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  props.locale || false;
  props.languages || [];
  const permissions = props.permissions || {};
  const { data, setData, errors, processing } = useForm({
    name: role.name || "",
    description: role.description || ""
  });
  function handleSubmit(e) {
    e.preventDefault();
    const formData = new FormData();
    formData.append("_method", "PUT");
    Object.entries(data).forEach(([key, value]) => {
      if (key === "logo" && value instanceof File) {
        formData.append(key, value);
      } else if (typeof value === "object" && value !== null) {
        formData.append(key, JSON.stringify(value));
      } else if (value !== null && value !== void 0) {
        formData.append(key, value);
      }
    });
    router.post(route("roles.update", role.id), formData, {
      forceFormData: true,
      preserveScroll: true,
      onSuccess: () => console.log("Role actualizada"),
      onError: (errors2) => console.error("Errores:", errors2),
      onFinish: () => console.log("Petición finalizada")
    });
  }
  const actions = [];
  if (permissions == null ? void 0 : permissions["roles.index"]) {
    actions.push({
      text: __("roles_volver"),
      icon: "la-angle-left",
      url: "roles.index",
      modal: false
    });
  }
  if (permissions == null ? void 0 : permissions["roles.create"]) {
    actions.push({
      text: __("role_nuevo"),
      icon: "la-plus",
      url: "roles.create",
      modal: false
    });
  }
  if (permissions == null ? void 0 : permissions["roles.destroy"]) {
    actions.push({
      text: __("eliminar"),
      icon: "la-trash",
      method: "delete",
      url: "roles.destroy",
      params: [role.id],
      title: __("role_eliminar"),
      message: __("role_eliminar_confirm"),
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
              __("role"),
              " ",
              /* @__PURE__ */ jsx("u", { children: role.name })
            ] }) }),
            /* @__PURE__ */ jsxs("div", { className: "col-12 mt-2 mb-4", children: [
              /* @__PURE__ */ jsxs("span", { className: "text-muted me-5", children: [
                __("creado"),
                ": ",
                /* @__PURE__ */ jsx("strong", { children: role.formatted_created_at })
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "text-muted me-5", children: [
                __("actualizado"),
                ": ",
                /* @__PURE__ */ jsx("strong", { children: role.formatted_updated_at })
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "text-muted me-5", children: [
                __("role_universal"),
                ": ",
                /* @__PURE__ */ jsx("strong", { children: /* @__PURE__ */ jsx("i", { className: `la ${role.universal ? "la-check text-success" : "la-ban text-danger"}` }) })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
            /* @__PURE__ */ jsxs("div", { className: "row gy-3", children: [
              /* @__PURE__ */ jsx("div", { className: "col-lg-6", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
                /* @__PURE__ */ jsxs("label", { htmlFor: "name", className: "form-label", children: [
                  __("role"),
                  "*"
                ] }),
                /* @__PURE__ */ jsx(
                  TextInput,
                  {
                    type: "text",
                    name: "name",
                    value: data.name,
                    onChange: (e) => setData("name", e.target.value),
                    maxLength: 100,
                    required: true,
                    disabled: true
                  }
                ),
                /* @__PURE__ */ jsx(InputError, { message: errors.name })
              ] }) }),
              /* @__PURE__ */ jsx("div", { className: "col-12", children: /* @__PURE__ */ jsxs("div", { className: "position-relative", children: [
                /* @__PURE__ */ jsx("label", { htmlFor: "description", className: "form-label", children: __("descripcion") }),
                /* @__PURE__ */ jsx(
                  Textarea,
                  {
                    id: "description",
                    name: "description",
                    value: data.description ?? "",
                    onChange: (e) => {
                      console.log("description value", e.target.value);
                      setData("description", e.target.value);
                    },
                    className: "form-control"
                  }
                )
              ] }) })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "mt-4 text-end", children: /* @__PURE__ */ jsx(PrimaryButton, { disabled: processing, className: "btn btn-rdn", children: processing ? __("procesando") + "..." : __("guardar") }) })
          ] }),
          role.name !== "Super Admin" && /* @__PURE__ */ jsx(
            RolePermissions,
            {
              modules,
              functionalities,
              role_permissions,
              permissions_all,
              roleId: role.id
            }
          )
        ] }),
        /* @__PURE__ */ jsx(BackToTop, { offset: 300 })
      ]
    }
  );
}
export {
  Index as default
};
