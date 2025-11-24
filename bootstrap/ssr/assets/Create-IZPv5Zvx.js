import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-C61SrhEp.js";
import { usePage, useForm, Head } from "@inertiajs/react";
import { useEffect } from "react";
import { C as Checkbox } from "./Checkbox-B7oBdKeZ.js";
import { I as InputError } from "./InputError-DME5vguS.js";
import { P as PrimaryButton } from "./PrimaryButton-B91ets3U.js";
import { S as SecondaryButton } from "./SecondaryButton-CXDrSeVp.js";
import { S as SelectInput } from "./SelectInput-DrqFt-OA.js";
import { T as TextInput } from "./TextInput-CzxrbIpp.js";
import { I as InfoPopover } from "./InfoPopover-CwWEvwXq.js";
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
  const { currentCompany } = useCompanySession();
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
  const handleCancel = () => {
    window.history.back();
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
      subtitle: subtitle || __("Nueva lista de marketing"),
      actions,
      children: [
        /* @__PURE__ */ jsx(Head, { title }),
        /* @__PURE__ */ jsx("div", { className: "contents pb-4", children: /* @__PURE__ */ jsxs("div", { className: "row", children: [
          /* @__PURE__ */ jsx("div", { className: "col-lg-9", children: /* @__PURE__ */ jsxs("div", { className: "card", children: [
            /* @__PURE__ */ jsxs("div", { className: "card-header d-flex justify-content-between align-items-center", children: [
              /* @__PURE__ */ jsx("h5", { className: "mb-0", children: __("Datos principales") }),
              currentCompany && /* @__PURE__ */ jsxs("span", { className: "badge bg-light text-muted", children: [
                __("Empresa"),
                ": ",
                currentCompany.name
              ] })
            ] }),
            /* @__PURE__ */ jsx("div", { className: "card-body", children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, noValidate: true, children: [
              /* @__PURE__ */ jsxs("div", { className: "row mb-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "col-md-6", children: [
                  /* @__PURE__ */ jsx("label", { htmlFor: "owner_id", className: "form-label", children: __("Propietario") }),
                  /* @__PURE__ */ jsxs(
                    SelectInput,
                    {
                      id: "owner_id",
                      name: "owner_id",
                      className: "form-select",
                      value: data.owner_id || "",
                      onChange: (e) => setData("owner_id", e.target.value || ""),
                      children: [
                        /* @__PURE__ */ jsx("option", { value: "", children: __("Selecciona un usuario responsable") }),
                        owners.map((user) => /* @__PURE__ */ jsx("option", { value: user.id, children: user.full_name || user.name }, user.id))
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsx(InputError, { message: errors.owner_id, className: "mt-1" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "col-md-3", children: [
                  /* @__PURE__ */ jsxs("label", { htmlFor: "status", className: "form-label d-flex", children: [
                    /* @__PURE__ */ jsx("span", { children: __("Estado") }),
                    /* @__PURE__ */ jsx(
                      InfoPopover,
                      {
                        id: "status_help",
                        content: __("Determina si la lista está activa o inactiva.")
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsx(
                    SelectInput,
                    {
                      id: "status",
                      name: "status",
                      className: "form-select",
                      value: data.status,
                      onChange: (e) => setData("status", Number(e.target.value)),
                      children: (statusOptions.length ? statusOptions : [
                        { value: 1, label: __("Activa") },
                        { value: 0, label: __("Inactiva") }
                      ]).map((status) => /* @__PURE__ */ jsx(
                        "option",
                        {
                          value: status.value,
                          children: status.label
                        },
                        status.value
                      ))
                    }
                  ),
                  /* @__PURE__ */ jsx(InputError, { message: errors.status, className: "mt-1" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "col-md-3", children: [
                  /* @__PURE__ */ jsxs("label", { htmlFor: "type", className: "form-label d-flex", children: [
                    /* @__PURE__ */ jsx("span", { children: __("Tipo") }),
                    /* @__PURE__ */ jsx(
                      InfoPopover,
                      {
                        id: "type_help",
                        content: __(
                          "Puedes usarlo para clasificar listas (estática, dinámica, importar, etc.)."
                        )
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxs(
                    SelectInput,
                    {
                      id: "type",
                      name: "type",
                      className: "form-select",
                      value: data.type || "",
                      onChange: (e) => setData("type", e.target.value),
                      children: [
                        /* @__PURE__ */ jsx("option", { value: "", children: __("Sin especificar") }),
                        (listTypes.length ? listTypes : [
                          { value: "static", label: __("Estática") },
                          { value: "dynamic", label: __("Dinámica") }
                        ]).map((item) => /* @__PURE__ */ jsx("option", { value: item.value, children: item.label }, item.value))
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsx(InputError, { message: errors.type, className: "mt-1" })
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "row mb-3", children: [
                /* @__PURE__ */ jsxs("div", { className: "col-md-8", children: [
                  /* @__PURE__ */ jsx("label", { htmlFor: "name", className: "form-label", children: __("Nombre de la lista") }),
                  /* @__PURE__ */ jsx(
                    TextInput,
                    {
                      id: "name",
                      name: "name",
                      type: "text",
                      className: "form-control",
                      value: data.name,
                      onChange: (e) => setData("name", e.target.value),
                      required: true,
                      autoFocus: true
                    }
                  ),
                  /* @__PURE__ */ jsx(InputError, { message: errors.name, className: "mt-1" })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "col-md-4", children: [
                  /* @__PURE__ */ jsxs("label", { htmlFor: "slug", className: "form-label d-flex", children: [
                    /* @__PURE__ */ jsx("span", { children: __("Slug") }),
                    /* @__PURE__ */ jsx(
                      InfoPopover,
                      {
                        id: "slug_help",
                        content: __(
                          "Identificador interno único por empresa. Se genera a partir del nombre, pero puedes editarlo."
                        )
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsx(
                    TextInput,
                    {
                      id: "slug",
                      name: "slug",
                      type: "text",
                      className: "form-control",
                      value: data.slug,
                      onChange: (e) => setData("slug", e.target.value),
                      required: true
                    }
                  ),
                  /* @__PURE__ */ jsx(InputError, { message: errors.slug, className: "mt-1" })
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { className: "row mb-3", children: /* @__PURE__ */ jsxs("div", { className: "col-md-6 d-flex align-items-center", children: [
                /* @__PURE__ */ jsx(
                  Checkbox,
                  {
                    id: "is_dynamic",
                    name: "is_dynamic",
                    checked: Boolean(data.is_dynamic),
                    onChange: (e) => setData("is_dynamic", e.target.checked)
                  }
                ),
                /* @__PURE__ */ jsx(
                  "label",
                  {
                    htmlFor: "is_dynamic",
                    className: "ms-2 mb-0",
                    children: __("Lista dinámica (basada en reglas)")
                  }
                ),
                /* @__PURE__ */ jsx(
                  InfoPopover,
                  {
                    id: "dynamic_help",
                    content: __(
                      "Marca esta opción si la lista se genera o actualiza automáticamente mediante reglas o filtros."
                    )
                  }
                ),
                /* @__PURE__ */ jsx(
                  InputError,
                  {
                    message: errors.is_dynamic,
                    className: "ms-2"
                  }
                )
              ] }) }),
              /* @__PURE__ */ jsxs("div", { className: "mb-3", children: [
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
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "d-flex justify-content-end gap-2 mt-4", children: [
                /* @__PURE__ */ jsx(
                  SecondaryButton,
                  {
                    type: "button",
                    className: "btn btn-outline-secondary",
                    onClick: handleCancel,
                    disabled: processing,
                    children: __("Cancelar")
                  }
                ),
                /* @__PURE__ */ jsx(
                  PrimaryButton,
                  {
                    type: "submit",
                    className: "btn btn-primary",
                    disabled: processing,
                    children: processing ? __("Guardando...") : __("Crear lista")
                  }
                )
              ] })
            ] }) })
          ] }) }),
          /* @__PURE__ */ jsx("div", { className: "col-lg-3 mt-3 mt-lg-0", children: /* @__PURE__ */ jsxs("div", { className: "card", children: [
            /* @__PURE__ */ jsx("div", { className: "card-header", children: /* @__PURE__ */ jsx("h6", { className: "mb-0", children: __("Información") }) }),
            /* @__PURE__ */ jsxs("div", { className: "card-body small text-muted", children: [
              /* @__PURE__ */ jsx("p", { className: "mb-2", children: __(
                "Una lista de marketing agrupa contactos o cuentas que comparten algún criterio de segmentación."
              ) }),
              /* @__PURE__ */ jsx("p", { className: "mb-0", children: __(
                'Puedes reutilizar las listas en múltiples campañas, y controlar su uso mediante el campo "Estado" y el tipo.'
              ) })
            ] })
          ] }) })
        ] }) })
      ]
    }
  );
}
function slugify(value) {
  return (value || "").toString().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
export {
  Create as default
};
