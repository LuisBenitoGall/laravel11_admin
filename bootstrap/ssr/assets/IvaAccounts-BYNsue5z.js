import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-Be6zbhrA.js";
import { useForm, usePage, Head, router, Link } from "@inertiajs/react";
import { Tooltip } from "react-tooltip";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { u as useSweetAlert } from "./useSweetAlert-D4PAsWYN.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import { R as ReusableModal } from "./ModalTemplate-CgiU7p0h.js";
import { I as InputError } from "./InputError-DME5vguS.js";
import "axios";
import "@inertiajs/inertia";
import "./Header-DmTv-HRw.js";
import "react-bootstrap";
import "./TextInput-CzxrbIpp.js";
import "sweetalert2";
import "./Sidebar-j3CEPiJG.js";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
function Portal({ children, targetId = "modal-root" }) {
  const el = document.getElementById(targetId) || document.body;
  return createPortal(children, el);
}
function ModalIvaAccountCreate({ show, onClose, ivaType, side }) {
  const __ = useTranslation();
  const { data, setData, post, processing, reset, errors, clearErrors } = useForm({
    code: "",
    name: "",
    profile: "iva",
    iva_type_id: null,
    side: null
  });
  useEffect(() => {
    if (show && ivaType && side) {
      const rate = safeRate(ivaType);
      const sideLabel = side === "output" ? __("repercutido") : __("soportado");
      setData((prev) => ({
        ...prev,
        code: "",
        name: `IVA ${rate}% ${sideLabel}`,
        profile: "iva",
        iva_type_id: Number(ivaType.id),
        // cast a número
        side
      }));
      clearErrors();
    }
  }, [show, ivaType, side]);
  const handleConfirm = () => {
    post(`/admin/accounting-accounts/store-auto-account`, {
      preserveScroll: true,
      onSuccess: () => {
        reset();
        onClose == null ? void 0 : onClose();
      }
    });
  };
  return /* @__PURE__ */ jsx(
    ReusableModal,
    {
      show,
      onClose,
      onConfirm: handleConfirm,
      title: `${__("cuenta_nueva")} — ${(ivaType == null ? void 0 : ivaType.name) ?? ""} ${safeRate(ivaType)}% (${side === "output" ? __("repercutido") : __("soportado")})`,
      confirmText: processing ? __("guardando") : __("guardar"),
      cancelText: __("cancelar"),
      confirmDisabled: processing,
      children: /* @__PURE__ */ jsxs("div", { className: "row g-3", children: [
        /* @__PURE__ */ jsx("p", { className: "text-warning", children: __("cuenta_iva_nueva_texto") }),
        /* @__PURE__ */ jsxs("div", { className: "col-12", children: [
          /* @__PURE__ */ jsx("label", { className: "form-label", children: __("codigo_manual") }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              name: "code",
              className: `form-control ${errors.code ? "is-invalid" : ""}`,
              value: data.code,
              onChange: (e) => setData("code", e.target.value),
              autoComplete: "off",
              maxLength: 30,
              autoFocus: true
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors.code })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "col-12", children: [
          /* @__PURE__ */ jsxs("label", { className: "form-label", children: [
            __("nombre"),
            "*"
          ] }),
          /* @__PURE__ */ jsx(
            "input",
            {
              type: "text",
              name: "name",
              className: `form-control ${errors.name ? "is-invalid" : ""}`,
              value: data.name,
              onChange: (e) => setData("name", e.target.value),
              autoComplete: "off",
              maxLength: 191,
              required: true
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors.name })
        ] })
      ] })
    }
  );
}
function safeRate(ivaType) {
  const raw = (ivaType == null ? void 0 : ivaType.iva) ?? (ivaType == null ? void 0 : ivaType.rate) ?? 0;
  const num = Number.parseFloat(String(raw).replace(",", "."));
  return Number.isFinite(num) ? num.toLocaleString(void 0, { maximumFractionDigits: 2 }) : 0;
}
function IvaAccountsIndex({ auth, session, title, subtitle, ivaTypes = [], ivaAccounts = [], usages = [], availableLocales }) {
  var _a;
  const __ = useTranslation();
  const props = ((_a = usePage()) == null ? void 0 : _a.props) || {};
  const permissions = props.permissions || {};
  const natureLabels = props.natureLabels || {};
  const { showConfirm } = useSweetAlert();
  const handleBulkGenerate = () => {
    showConfirm({
      title: __("generacion_masiva"),
      text: __("generacion_masiva_iva_confirm"),
      icon: "warning",
      // confirmText: __('si_generar'),
      // cancelText: __('cancelar'),
      onConfirm: () => {
        router.post(route("accounting-accounts.iva-bulk-generate"), {}, {
          preserveScroll: true
        });
      }
    });
  };
  const actions = [];
  if (permissions == null ? void 0 : permissions["accounting-accounts.index"]) {
    actions.push({ key: "back", text: __("cuentas_volver"), icon: "la-angle-left", url: "accounting-accounts.index" });
  }
  if (permissions == null ? void 0 : permissions["accounting-accounts.create"]) {
    actions.push({ key: "bulk", text: __("generacion_masiva"), icon: "la-plus", modal: true, onClick: handleBulkGenerate });
  }
  const accountsById = useMemo(() => {
    const map = {};
    (ivaAccounts || []).forEach((a) => {
      map[a.id] = a;
    });
    return map;
  }, [ivaAccounts]);
  const usageByIvaAndSide = useMemo(() => {
    const map = {};
    (usages || []).forEach((u) => {
      if (!map[u.iva_type_id]) map[u.iva_type_id] = {};
      map[u.iva_type_id][u.side] = u;
    });
    return map;
  }, [usages]);
  const [intent, setIntent] = useState(null);
  const openIntent = (type, ivaType, side, usage = null) => setIntent({ type, ivaType, side, usage });
  const closeIntent = () => setIntent(null);
  function safeRate2(t) {
    const raw = (t == null ? void 0 : t.iva) ?? (t == null ? void 0 : t.rate) ?? 0;
    const num = Number.parseFloat(String(raw).replace(",", "."));
    return Number.isFinite(num) ? num.toLocaleString(void 0, { maximumFractionDigits: 2 }) : 0;
  }
  const SideCell = ({ ivaType, side }) => {
    var _a2;
    const usage = (_a2 = usageByIvaAndSide == null ? void 0 : usageByIvaAndSide[ivaType.id]) == null ? void 0 : _a2[side];
    const account = usage ? accountsById[usage.account_id] : null;
    return /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("td", { className: "align-middle", children: usage && account ? /* @__PURE__ */ jsx("div", { className: "d-flex flex-column", children: /* @__PURE__ */ jsxs("span", { className: "fw-semibold", children: [
        account.name,
        account.code ? ` - ${account.code}` : ""
      ] }) }) : /* @__PURE__ */ jsx("span", { className: "text-muted", children: __("sin_cuenta_asignada") }) }),
      /* @__PURE__ */ jsx("td", { className: "align-middle", children: account ? /* @__PURE__ */ jsx("span", { className: "badge bg-secondary", children: natureLabels[account.nature] ?? "—" }) : /* @__PURE__ */ jsx("span", { className: "text-muted", children: "—" }) }),
      /* @__PURE__ */ jsx("td", { className: "align-middle", children: /* @__PURE__ */ jsxs("div", { className: "btn-group btn-group-sm text-end", role: "group", children: [
        !usage && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "btn btn-info text-white",
              "data-tooltip-id": "tips",
              "data-tooltip-content": __("cuenta_nueva"),
              onClick: () => openIntent("create", ivaType, side),
              children: /* @__PURE__ */ jsx("i", { className: "la la-plus" })
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "btn btn-secondary text-white",
              "data-tooltip-id": "tips",
              "data-tooltip-content": __("cuenta_selec"),
              onClick: () => openIntent("assign", ivaType, side),
              children: /* @__PURE__ */ jsx("i", { className: "la la-gear" })
            }
          )
        ] }),
        usage && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(
            Link,
            {
              href: route("accounting-accounts.edit", account.id),
              className: "btn btn-info text-white",
              "data-tooltip-id": "tips",
              "data-tooltip-content": __("cuenta_editar"),
              children: /* @__PURE__ */ jsx("i", { className: "la la-edit" })
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "btn btn-danger",
              "data-tooltip-id": "tips",
              "data-tooltip-content": __("vinculacion_eliminar"),
              onClick: () => openIntent("delete", ivaType, side, usage),
              children: /* @__PURE__ */ jsx("i", { className: "la la-trash" })
            }
          )
        ] })
      ] }) })
    ] });
  };
  return /* @__PURE__ */ jsxs(AdminAuthenticated, { user: auth.user, title, subtitle, actions, children: [
    /* @__PURE__ */ jsx(Head, { title }),
    /* @__PURE__ */ jsxs("div", { className: "contents pb-4", children: [
      /* @__PURE__ */ jsx("div", { className: "d-flex justify-content-between align-items-center mb-3", children: /* @__PURE__ */ jsx("div", { className: "text-muted", children: __("cuentas_iva_texto") }) }),
      /* @__PURE__ */ jsx("div", { className: "table-responsive", children: /* @__PURE__ */ jsxs("table", { className: "table table-striped align-middle", children: [
        /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { style: { width: "20%" }, children: "IVA" }),
          /* @__PURE__ */ jsx("th", { style: { width: "22%" }, children: __("ventas_repercutido") }),
          /* @__PURE__ */ jsx("th", { style: { width: "8%" }, children: __("tipo") }),
          /* @__PURE__ */ jsx("th", { style: { width: "10%" }, className: "text-center", children: __("acciones") }),
          /* @__PURE__ */ jsx("th", { style: { width: "22%" }, children: __("compras_soportado") }),
          /* @__PURE__ */ jsx("th", { style: { width: "8%" }, children: __("tipo") }),
          /* @__PURE__ */ jsx("th", { style: { width: "10%" }, className: "text-center", children: __("acciones") })
        ] }) }),
        /* @__PURE__ */ jsxs("tbody", { children: [
          ivaTypes.map((t, idx) => /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx("td", { className: "fw-semibold", children: `${(t == null ? void 0 : t.name) ?? ""} - ${safeRate2(t)}%` }),
            /* @__PURE__ */ jsx(SideCell, { ivaType: t, side: "output" }),
            /* @__PURE__ */ jsx(SideCell, { ivaType: t, side: "input" })
          ] }, (t == null ? void 0 : t.id) ?? `iva-${(t == null ? void 0 : t.iva) ?? "x"}-${idx}`)),
          ivaTypes.length === 0 && /* @__PURE__ */ jsx("tr", { children: /* @__PURE__ */ jsx("td", { colSpan: 7, className: "text-center text-muted py-4", children: __("sin_registros") }) })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx(Tooltip, { id: "tips", place: "top" }),
      /* @__PURE__ */ jsx(Portal, { children: /* @__PURE__ */ jsx(
        ModalIvaAccountCreate,
        {
          show: (intent == null ? void 0 : intent.type) === "create",
          onClose: closeIntent,
          ivaType: intent == null ? void 0 : intent.ivaType,
          side: intent == null ? void 0 : intent.side
        }
      ) })
    ] })
  ] });
}
export {
  IvaAccountsIndex as default
};
