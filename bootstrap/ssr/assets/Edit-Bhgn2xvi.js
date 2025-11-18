import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-BIINMUez.js";
import { usePage, Head } from "@inertiajs/react";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import { u as useHandleDelete } from "./useHandleDelete-B2XtFf-J.js";
import "react";
import { T as Tabs } from "./Tabs-CZO-HKNH.js";
import "react-draft-wysiwyg";
import "draft-js";
import "html-to-draftjs";
import "draftjs-to-html";
/* empty css                             */
import "./TextInput-CzxrbIpp.js";
import UserPersonalData from "./UserPersonalData-BlKRr_2l.js";
import UserPassword from "./UserPassword-a1uG8SKf.js";
import UserImages from "./UserImages-CZESt1jq.js";
import "axios";
import "@inertiajs/inertia";
import "./Header-dr5I36ZE.js";
import "react-bootstrap";
import "./useSweetAlert-D4PAsWYN.js";
import "sweetalert2";
import "./Sidebar-neUddedh.js";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
import "./DatePickerToForm-HPj3On-3.js";
import "react-datepicker";
/* empty css                          */
import "date-fns/locale";
import "./FileInput-U7oe6ye3.js";
import "./InputError-DME5vguS.js";
import "./ManagePhones-C_mhnW8c.js";
import "./PrimaryButton-B91ets3U.js";
import "./RadioButton-BQ8Yvx79.js";
import "./SelectInput-DrqFt-OA.js";
import "./SetSex-BUKGr851.js";
function Index({
  auth,
  session,
  title,
  subtitle,
  user,
  roles,
  user_roles,
  images,
  salutations,
  contact_types,
  crm_contact,
  profile,
  company,
  company_context,
  pivot,
  user_company_id
  // ← nuevos props del backend
}) {
  var _a;
  const __ = useTranslation();
  const props = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  const permissions = props.permissions || {};
  useHandleDelete("usuario", "users.destroy", [user.id]);
  const actions = [];
  const cc = company_context;
  if (cc && cc.type === "crm_account" && permissions["crm-accounts.edit"]) {
    actions.push({
      text: __("volver_a") + " " + cc.name,
      icon: "la-angle-left",
      url: "crm-accounts.edit",
      params: [cc.crm_id, "users"],
      modal: false
    });
  } else if (cc && cc.type === "company" && (permissions["companies.edit"] || permissions["users.index"])) {
    if (permissions["companies.edit"]) {
      actions.push({
        text: __("volver_a") + " " + cc.name,
        icon: "la-angle-left",
        url: "companies.edit",
        params: [cc.ref_id, "users"],
        modal: false
      });
    } else {
      actions.push({
        text: __("usuarios_volver"),
        icon: "la-angle-left",
        url: "users.index",
        modal: false
      });
    }
  } else if (permissions["users.index"]) {
    actions.push({
      text: __("usuarios_volver"),
      icon: "la-angle-left",
      url: "users.index",
      modal: false
    });
  }
  if (permissions["users.create"] && profile === false && user_company_id === false) {
    actions.push({ text: __("usuario_nuevo"), icon: "la-plus", url: "users.create", modal: false });
  }
  actions.push({ text: __("nota_nueva"), icon: "la-plus", url: "users.create", modal: true });
  if (permissions["users.destroy"] && profile === false) {
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
    ...profile === true ? [{ key: "user-password", label: __("contrasena") }] : [],
    { key: "user-images", label: __("imagenes") }
  ];
  return /* @__PURE__ */ jsxs(AdminAuthenticated, { user: auth.user, title, subtitle, actions, children: [
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
      /* @__PURE__ */ jsx(Tabs, { defaultActive: "user-personal-data", items: tabs, children: (activeKey) => {
        switch (activeKey) {
          case "user-personal-data":
            return /* @__PURE__ */ jsx(
              UserPersonalData,
              {
                user,
                roles,
                user_roles,
                salutations,
                contact_types,
                crm_contact,
                user_company_id,
                pivot,
                company_context
              }
            );
          case "user-password":
            return /* @__PURE__ */ jsx(UserPassword, { user });
          case "user-images": {
            const inferredImagePath = (user == null ? void 0 : user.image_path) || (user == null ? void 0 : user.imagePath) || "users";
            return /* @__PURE__ */ jsx(
              UserImages,
              {
                images: images ?? [],
                uploadUrl: route("user-images.store"),
                deleteUrl: (img) => route("user-images.delete", { image: img.id ?? img.image }),
                setFeaturedUrl: route("user-images.set-featured"),
                entityId: user.id,
                imagePath: inferredImagePath
              }
            );
          }
          default:
            return null;
        }
      } })
    ] })
  ] });
}
export {
  Index as default
};
