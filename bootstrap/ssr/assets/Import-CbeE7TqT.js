import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-BAKikn-7.js";
import { usePage, Head, router } from "@inertiajs/react";
import { useState } from "react";
import { I as InputError } from "./InputError-DME5vguS.js";
import { P as PrimaryButton } from "./PrimaryButton-CIbKPOjQ.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import "@inertiajs/inertia";
import "./Header-BVvoXjVe.js";
import "react-bootstrap";
import "./useSweetAlert-D4PAsWYN.js";
import "sweetalert2";
import "./Sidebar-1g4CKLZI.js";
import "axios";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
import "./TextInput-CzxrbIpp.js";
const MAX_SIZE_BYTES = 2 * 1024 * 1024;
const ALLOWED_EXTENSIONS = [".xls", ".xlsx"];
function Import({ auth, title, permissions = {}, templateUrl, import_result }) {
  var _a;
  const __ = useTranslation();
  const { props } = usePage();
  const serverErrors = (props == null ? void 0 : props.errors) || {};
  const [file, setFile] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [validationError, setValidationError] = useState("");
  const actions = [
    { text: __("contactos_volver"), icon: "la-angle-left", url: "crm-contacts.index", modal: false }
  ];
  const validateFile = (f) => {
    if (!f) {
      setValidationError(__("import_archivo_requerido"));
      return false;
    }
    const name = (f.name || "").toLowerCase();
    const ok = ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext));
    if (!ok) {
      setValidationError(__("import_formato_invalido"));
      return false;
    }
    if (f.size > MAX_SIZE_BYTES) {
      setValidationError(__("import_tamano_maximo"));
      return false;
    }
    setValidationError("");
    return true;
  };
  const handleFileChange = (e) => {
    var _a2;
    const f = (_a2 = e.target.files) == null ? void 0 : _a2[0];
    setFile(f || null);
    setValidationError("");
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateFile(file)) return;
    setProcessing(true);
    router.post(route("crm-contacts.import.store"), { file }, {
      forceFormData: true,
      onFinish: () => setProcessing(false)
    });
  };
  return /* @__PURE__ */ jsxs(AdminAuthenticated, { user: auth == null ? void 0 : auth.user, title, subtitle: __("contactos_importar"), actions, children: [
    /* @__PURE__ */ jsx(Head, { title }),
    /* @__PURE__ */ jsxs("div", { className: "contents", children: [
      /* @__PURE__ */ jsx("p", { className: "text-muted mb-4", children: __("import_condiciones_texto") }),
      /* @__PURE__ */ jsx("div", { className: "mb-4 d-flex flex-wrap gap-2", children: /* @__PURE__ */ jsxs("a", { href: templateUrl, className: "btn btn-outline-primary", download: true, children: [
        /* @__PURE__ */ jsx("i", { className: "la la-download me-1" }),
        __("import_descargar_plantilla")
      ] }) }),
      /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, className: "card card-body mb-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-3", children: [
          /* @__PURE__ */ jsx("label", { className: "form-label", children: __("import_seleccionar_archivo") }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "file",
              className: "form-control",
              accept: ".xls,.xlsx",
              onChange: handleFileChange,
              disabled: processing
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: validationError || (serverErrors == null ? void 0 : serverErrors.file) })
        ] }),
        /* @__PURE__ */ jsx(PrimaryButton, { type: "submit", disabled: processing || !file, children: processing ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx("span", { className: "spinner-border spinner-border-sm me-2", role: "status", "aria-hidden": "true" }),
          __("import_procesando")
        ] }) : __("import_subir") })
      ] }),
      import_result && /* @__PURE__ */ jsxs("div", { className: `alert ${import_result.success ? "alert-success" : "alert-warning"}`, children: [
        /* @__PURE__ */ jsx("h6", { className: "alert-heading", children: import_result.success ? __("import_resultado_exito") : __("import_resultado_parcial") }),
        /* @__PURE__ */ jsxs("p", { className: "mb-0", children: [
          __("import_total_procesados"),
          ": ",
          /* @__PURE__ */ jsx("strong", { children: import_result.total_processed }),
          import_result.total_failed > 0 && /* @__PURE__ */ jsxs(Fragment, { children: [
            " · ",
            __("import_total_no_procesados"),
            ": ",
            /* @__PURE__ */ jsx("strong", { children: import_result.total_failed })
          ] })
        ] })
      ] }),
      ((_a = import_result == null ? void 0 : import_result.failed_rows) == null ? void 0 : _a.length) > 0 && /* @__PURE__ */ jsxs("div", { className: "card", children: [
        /* @__PURE__ */ jsx("div", { className: "card-header", children: __("import_filas_no_procesadas") }),
        /* @__PURE__ */ jsx("div", { className: "card-body p-0", children: /* @__PURE__ */ jsx("div", { className: "table-responsive", children: /* @__PURE__ */ jsxs("table", { className: "table table-sm table-striped mb-0", children: [
          /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("th", { children: __("import_fila") }),
            /* @__PURE__ */ jsx("th", { children: __("import_motivo") }),
            /* @__PURE__ */ jsx("th", { children: __("import_datos") })
          ] }) }),
          /* @__PURE__ */ jsx("tbody", { children: import_result.failed_rows.map((fr, idx) => /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("td", { children: fr.row }),
            /* @__PURE__ */ jsx("td", { children: fr.reason }),
            /* @__PURE__ */ jsx("td", { children: /* @__PURE__ */ jsx("small", { className: "text-muted", children: typeof fr.data === "object" ? JSON.stringify(fr.data) : String(fr.data) }) })
          ] }, idx)) })
        ] }) }) })
      ] })
    ] })
  ] });
}
export {
  Import as default
};
