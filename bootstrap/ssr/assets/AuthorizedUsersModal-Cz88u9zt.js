import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useForm } from "@inertiajs/react";
import { R as ReusableModal } from "./ModalTemplate-BiHkGcpB.js";
import { U as UserSearch } from "./UserSearch-Bn5gVs5d.js";
import { S as SelectInput } from "./SelectInput-DrqFt-OA.js";
import { I as InputError } from "./InputError-DME5vguS.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import "axios";
import "react-bootstrap";
function AuthorizedUsersModal({ show, onClose, schedule, onSaved }) {
  const __ = useTranslation();
  const [authorizedUsers, setAuthorizedUsers] = useState([]);
  useEffect(() => {
    if (schedule == null ? void 0 : schedule.authorizedUsers) {
      setAuthorizedUsers(
        schedule.authorizedUsers.map((user) => {
          var _a;
          return {
            user_id: user.id,
            role: ((_a = user.pivot) == null ? void 0 : _a.role) || "viewer"
          };
        })
      );
    } else {
      setAuthorizedUsers([]);
    }
  }, [schedule]);
  const { data, setData, put, processing, errors } = useForm({
    authorized_users: []
  });
  const handleAddUser = (user) => {
    if (!authorizedUsers.find((au) => au.user_id === user.id)) {
      setAuthorizedUsers([...authorizedUsers, { user_id: user.id, role: "viewer" }]);
    }
  };
  const handleRemoveUser = (userId) => {
    setAuthorizedUsers(authorizedUsers.filter((au) => au.user_id !== userId));
  };
  const handleRoleChange = (userId, role) => {
    setAuthorizedUsers(authorizedUsers.map(
      (au) => au.user_id === userId ? { ...au, role } : au
    ));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    setData("authorized_users", authorizedUsers);
    put(route("schedules.authorized-users.update", schedule.id), {
      preserveScroll: true,
      onSuccess: () => {
        onSaved();
      }
    });
  };
  return /* @__PURE__ */ jsx(
    ReusableModal,
    {
      show,
      onClose,
      title: __("usuarios_autorizados"),
      onConfirm: handleSubmit,
      confirmText: processing ? __("guardando") : __("guardar"),
      cancelText: __("cancelar"),
      confirmDisabled: processing,
      confirmLoading: processing,
      dialogClassName: "modal-lg",
      children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-3", children: [
          /* @__PURE__ */ jsx("label", { className: "form-label", children: __("usuario_agregar") }),
          /* @__PURE__ */ jsx(
            UserSearch,
            {
              searchUrl: "/admin/users/search",
              placeholder: __("usuario_buscar"),
              onChange: (user) => {
                if (user) {
                  handleAddUser(user);
                }
              }
            }
          )
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mb-3", children: [
          /* @__PURE__ */ jsx("label", { className: "form-label", children: __("usuarios_autorizados") }),
          authorizedUsers.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-muted", children: __("usuarios_autorizados_0") }) : /* @__PURE__ */ jsx("div", { className: "list-group", children: authorizedUsers.map((au) => {
            var _a;
            const user = (_a = schedule == null ? void 0 : schedule.authorizedUsers) == null ? void 0 : _a.find((u) => u.id === au.user_id);
            return /* @__PURE__ */ jsxs("div", { className: "list-group-item d-flex justify-content-between align-items-center", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex-grow-1", children: [
                /* @__PURE__ */ jsxs("div", { children: [
                  user == null ? void 0 : user.name,
                  " ",
                  user == null ? void 0 : user.surname
                ] }),
                /* @__PURE__ */ jsx("small", { className: "text-muted", children: user == null ? void 0 : user.email })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "d-flex align-items-center gap-2", children: [
                /* @__PURE__ */ jsxs(
                  SelectInput,
                  {
                    value: au.role,
                    onChange: (e) => handleRoleChange(au.user_id, e.target.value),
                    className: "form-select-sm",
                    children: [
                      /* @__PURE__ */ jsx("option", { value: "viewer", children: __("viewer") }),
                      /* @__PURE__ */ jsx("option", { value: "editor", children: __("editor") })
                    ]
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    type: "button",
                    className: "btn btn-sm btn-outline-danger",
                    onClick: () => handleRemoveUser(au.user_id),
                    children: /* @__PURE__ */ jsx("i", { className: "la la-trash" })
                  }
                )
              ] })
            ] }, au.user_id);
          }) }),
          /* @__PURE__ */ jsx(InputError, { message: errors.authorized_users })
        ] })
      ] })
    }
  );
}
export {
  AuthorizedUsersModal as default
};
