import { jsx } from "react/jsx-runtime";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { useState, useRef, useCallback, useEffect } from "react";
import { router } from "@inertiajs/react";
function getBrevoStatusConfig(list, __, { isSubmitting = false } = {}) {
  if (isSubmitting || (list == null ? void 0 : list.brevo_sync_status) === "pending") {
    return {
      type: "spinner",
      color: "text-info",
      tooltip: __("lista_export_brevo_en_proceso")
    };
  }
  if (!(list == null ? void 0 : list.brevo_synced_at) && !(list == null ? void 0 : list.brevo_sync_status)) {
    return { type: "icon", icon: "la-cloud", color: "text-muted", tooltip: __("brevo_nunca_sincronizado") };
  }
  if (list.brevo_sync_status === "ok") {
    return {
      type: "icon",
      icon: "la-cloud-upload-alt",
      color: "text-success",
      tooltip: `${__("brevo_sincronizado_el")} ${list.brevo_synced_at}`
    };
  }
  if (list.brevo_sync_status === "error") {
    return { type: "icon", icon: "la-cloud", color: "text-danger", tooltip: __("brevo_sync_error") };
  }
  if (list.brevo_sync_status === "partial") {
    return { type: "icon", icon: "la-cloud-upload-alt", color: "text-warning", tooltip: __("brevo_sync_partial") };
  }
  return { type: "icon", icon: "la-cloud", color: "text-muted", tooltip: __("brevo_nunca_sincronizado") };
}
function useMarketingListBrevoExport({
  showConfirm,
  __,
  onExportSuccess,
  reloadWhilePending,
  isPending = false
}) {
  const [exportingListId, setExportingListId] = useState(null);
  const pollRef = useRef(null);
  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);
  const startPolling = useCallback(() => {
    if (!reloadWhilePending || pollRef.current) {
      return;
    }
    pollRef.current = setInterval(() => {
      reloadWhilePending();
    }, 1e4);
  }, [reloadWhilePending]);
  useEffect(() => () => stopPolling(), [stopPolling]);
  useEffect(() => {
    if (isPending) {
      startPolling();
      return;
    }
    stopPolling();
  }, [isPending, startPolling, stopPolling]);
  const handleExportToBrevo = useCallback((list) => {
    if (!(list == null ? void 0 : list.id) || list.brevo_sync_status === "pending" || exportingListId === list.id) {
      return;
    }
    showConfirm({
      title: __("exportacion_listado"),
      text: __("exportacion_listado_confirm"),
      icon: "warning",
      onConfirm: () => {
        setExportingListId(list.id);
        router.post(
          route("marketing-lists.export-brevo", [list.id]),
          {},
          {
            preserveScroll: true,
            onSuccess: () => {
              if (typeof onExportSuccess === "function") {
                onExportSuccess(list);
              }
            },
            onFinish: () => {
              setExportingListId((current) => current === list.id ? null : current);
            }
          }
        );
      }
    });
  }, [__, exportingListId, onExportSuccess, showConfirm]);
  const isExporting = useCallback(
    (list) => exportingListId === (list == null ? void 0 : list.id) || (list == null ? void 0 : list.brevo_sync_status) === "pending",
    [exportingListId]
  );
  return {
    exportingListId,
    handleExportToBrevo,
    isExporting,
    stopPolling
  };
}
function BrevoSyncStatus({ list, __, isSubmitting = false, className = "ms-1" }) {
  const config = getBrevoStatusConfig(list, __, { isSubmitting });
  return /* @__PURE__ */ jsx(
    OverlayTrigger,
    {
      placement: "top",
      overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", children: config.tooltip }),
      children: /* @__PURE__ */ jsx(
        "span",
        {
          className: `${className} ${config.color}`,
          style: { fontSize: "1.1rem", verticalAlign: "middle" },
          children: config.type === "spinner" ? /* @__PURE__ */ jsx(
            "span",
            {
              className: "spinner-border spinner-border-sm",
              role: "status",
              "aria-hidden": "true"
            }
          ) : /* @__PURE__ */ jsx("i", { className: `la ${config.icon}` })
        }
      )
    }
  );
}
export {
  BrevoSyncStatus as B,
  useMarketingListBrevoExport as u
};
