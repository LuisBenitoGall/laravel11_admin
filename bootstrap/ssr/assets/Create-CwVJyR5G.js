import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-C61SrhEp.js";
import { usePage, useForm, Head } from "@inertiajs/react";
import { useEffect } from "react";
import { I as InputError } from "./InputError-DME5vguS.js";
import { P as PrimaryButton } from "./PrimaryButton-B91ets3U.js";
import "./SelectInput-DrqFt-OA.js";
import { T as TextInput } from "./TextInput-CzxrbIpp.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import { u as useCompanySession } from "./Sidebar-KWaSAYKU.js";
import { u as useSweetAlert } from "./useSweetAlert-D4PAsWYN.js";
import "axios";
import "@inertiajs/inertia";
import "./Header-dr5I36ZE.js";
import "react-bootstrap";
import "sweetalert2";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
function Create({
  auth,
  session,
  title,
  subtitle,
  owners = [],
  listTypes = [],
  statusOptions = []
}) {
  var _a;
  const __ = useTranslation();
  const props = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  props.locale || false;
  props.languages || [];
  const permissions = props.permissions || {};
  useCompanySession();
  const { successAlert, errorAlert } = useSweetAlert();
  const { data, setData, post, processing, errors, reset } = useForm({
    owner_id: "",
    name: "",
    slug: "",
    type: "",
    is_dynamic: false,
    status: 1,
    observations: ""
  });
  useEffect(() => {
    if (!data.name) {
      return;
    }
    setData((prev) => {
      const currentSlug = prev.slug || "";
      const autoFromName = slugify(data.name);
      if (!currentSlug || currentSlug === autoFromName) {
        return {
          ...prev,
          slug: autoFromName
        };
      }
      return prev;
    });
  }, [data.name]);
  useEffect(() => {
    if (data.type === "dynamic" || data.type === "dinamica") {
      if (!data.is_dynamic) {
        setData("is_dynamic", true);
      }
    }
  }, [data.type]);
  const handleSubmit = (e) => {
    e.preventDefault();
    post(route("marketing-lists.store"), {
      preserveScroll: true,
      onSuccess: () => {
        successAlert(__("La lista de marketing se ha creado correctamente."));
        reset("observations");
      },
      onError: () => {
        errorAlert(__("Se ha producido un error al crear la lista de marketing."));
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
  return /* @__PURE__ */ jsxs(
    AdminAuthenticated,
    {
      user: auth.user,
      title,
      subtitle,
      actions,
      children: [
        /* @__PURE__ */ jsx(Head, { title }),
        /* @__PURE__ */ jsx("div", { className: "contents pb-4", children: /* @__PURE__ */ jsx("form", { onSubmit: handleSubmit, children: /* @__PURE__ */ jsxs("div", { className: "row gy-3", children: [
          /* @__PURE__ */ jsx("div", { className: "col-lg-6", children: /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsxs("label", { htmlFor: "name", className: "form-label", children: [
              __("nombre"),
              "*"
            ] }),
            /* @__PURE__ */ jsx(
              TextInput,
              {
                id: "name",
                type: "text",
                placeholder: __("nombre"),
                value: data.name,
                onChange: (e) => setData("name", e.target.value),
                maxLength: 255,
                required: true
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.name })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "col-12", children: /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("label", { htmlFor: "observations", className: "form-label", children: __("Observaciones") }),
            /* @__PURE__ */ jsx(
              "textarea",
              {
                id: "observations",
                name: "observations",
                className: "form-control",
                rows: 4,
                value: data.observations || "",
                onChange: (e) => setData("observations", e.target.value)
              }
            ),
            /* @__PURE__ */ jsx(
              InputError,
              {
                message: errors.observations,
                className: "mt-1"
              }
            )
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "mt-4 text-end", children: /* @__PURE__ */ jsx(PrimaryButton, { disabled: processing, className: "btn btn-rdn", children: processing ? __("procesando") + "..." : __("guardar") }) })
        ] }) }) })
      ]
    }
  );
}
export {
  Create as default
};
