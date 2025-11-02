import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-D8RSvDxD.js";
import { usePage, useForm, Head } from "@inertiajs/react";
import "@inertiajs/inertia";
import "react-tooltip";
import "react";
import { T as Tabs } from "./Tabs-Cd7Sj0t_.js";
import "react-draft-wysiwyg";
import "draft-js";
import "html-to-draftjs";
import "draftjs-to-html";
/* empty css                             */
import "./TextInput-p9mIVJQL.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import UserPersonalData from "./UserPersonalData-cLJG_3Ms.js";
import UserPassword from "./UserPassword-eVUcEUKj.js";
import { u as useHandleDelete } from "./useHandleDelete-B2XtFf-J.js";
import "axios";
import "./Header-BDD-uIND.js";
import "react-bootstrap";
import "./useSweetAlert-D4PAsWYN.js";
import "sweetalert2";
import "./Sidebar-BgmCyghN.js";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
import "./DatePickerToForm-7KZUnzNv.js";
import "react-datepicker";
/* empty css                          */
import "date-fns/locale";
import "./FileInput-U7oe6ye3.js";
import "./InputError-DME5vguS.js";
import "./PrimaryButton-B91ets3U.js";
import "./RadioButton-BQ8Yvx79.js";
function Index({ auth, session, title, subtitle, availableLocales, user, roles, user_roles, profile }) {
  var _a;
  const __ = useTranslation();
  const props = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  props.locale || false;
  props.languages || [];
  const permissions = props.permissions || {};
  const { data, setData, put, reset, errors, processing } = useForm({
    role: user.role || "",
    name: user.name || "",
    surname: user.surname || "",
    email: user.email || "",
    status: user.status
  });
  useHandleDelete("usuario", "users.destroy", [user.id]);
  const actions = [];
  if (permissions == null ? void 0 : permissions["users.index"]) {
    actions.push({
      text: __("usuarios_volver"),
      icon: "la-angle-left",
      url: "users.index",
      modal: false
    });
  }
  if ((permissions == null ? void 0 : permissions["users.create"]) && profile === false) {
    actions.push({
      text: __("usuario_nuevo"),
      icon: "la-plus",
      url: "users.create",
      modal: false
    });
  }
  if ((permissions == null ? void 0 : permissions["users.destroy"]) && profile === false) {
    actions.push({
      text: __("eliminar"),
      icon: "la-trash",
      method: "delete",
      url: "users.destroy",
      params: [user.id],
      title: __("usuario_eliminar"),
      message: __("usuario_eliminar_confirm"),
      modal: false
    });
  }
  const tabs = [
    { key: "user-personal-data", label: __("datos_personales") },
    // sólo añadimos la pestaña de contraseña si profile es true
    ...profile === true ? [{ key: "user-password", label: __("contrasena") }] : [],
    { key: "user-images", label: __("imagenes") }
  ];
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
              __("usuario"),
              " ",
              /* @__PURE__ */ jsxs("u", { children: [
                user.name,
                " ",
                user.surname
              ] })
            ] }) }),
            /* @__PURE__ */ jsxs("div", { className: "col-12 mt-2 mb-4", children: [
              /* @__PURE__ */ jsxs("span", { className: "text-muted me-5", children: [
                __("creado"),
                ": ",
                /* @__PURE__ */ jsx("strong", { children: user.formatted_created_at })
              ] }),
              /* @__PURE__ */ jsxs("span", { className: "text-muted me-5", children: [
                __("actualizado"),
                ": ",
                /* @__PURE__ */ jsx("strong", { children: user.formatted_updated_at })
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsx(
            Tabs,
            {
              defaultActive: "user-personal-data",
              items: tabs,
              children: (activeKey) => {
                switch (activeKey) {
                  case "user-personal-data":
                    return /* @__PURE__ */ jsx(UserPersonalData, { user, roles, user_roles });
                  case "user-password":
                    return /* @__PURE__ */ jsx(UserPassword, { user });
                  default:
                    return null;
                }
              }
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
