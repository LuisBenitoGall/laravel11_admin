import { jsx, Fragment, jsxs } from "react/jsx-runtime";
import "react";
const ReusableModal = ({
  show,
  onClose,
  title,
  children,
  onConfirm,
  confirmText = "Confirmar",
  confirmIcon = null,
  confirmClassName = "btn-primary",
  cancelText = "Cancelar",
  dialogClassName = "",
  confirmDisabled = false,
  confirmLoading = false,
  footerLeft = null,
  /** Si se pasa, el botón confirm será type="submit" form={submitFormId} para enviar ese formulario */
  submitFormId = null
}) => {
  return /* @__PURE__ */ jsx(Fragment, { children: show && /* @__PURE__ */ jsx(
    "div",
    {
      className: "modal fade show",
      style: { display: "block" },
      tabIndex: "-1",
      role: "dialog",
      "aria-labelledby": "modalTitle",
      "aria-hidden": "true",
      children: /* @__PURE__ */ jsx("div", { className: `modal-dialog ${dialogClassName}`, role: "document", children: /* @__PURE__ */ jsxs("div", { className: "modal-content", children: [
        /* @__PURE__ */ jsxs("div", { className: "modal-header", children: [
          /* @__PURE__ */ jsx("h5", { className: "modal-title", id: "modalTitle", children: title }),
          /* @__PURE__ */ jsx(
            "button",
            {
              type: "button",
              className: "close ms-auto",
              onClick: onClose,
              "aria-label": "Close",
              disabled: confirmLoading,
              children: /* @__PURE__ */ jsx("span", { "aria-hidden": "true", children: "×" })
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "modal-body", children }),
        /* @__PURE__ */ jsxs("div", { className: "modal-footer d-flex justify-content-between", children: [
          /* @__PURE__ */ jsx("div", { className: "d-flex align-items-center", children: footerLeft }),
          /* @__PURE__ */ jsxs("div", { className: "d-flex gap-2", children: [
            /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                className: "btn btn-secondary",
                onClick: onClose,
                disabled: confirmLoading,
                children: cancelText
              }
            ),
            /* @__PURE__ */ jsxs(
              "button",
              {
                type: submitFormId ? "submit" : "button",
                form: submitFormId || void 0,
                className: `btn ${confirmClassName} d-inline-flex align-items-center`,
                onClick: submitFormId ? void 0 : onConfirm,
                disabled: confirmDisabled || confirmLoading,
                children: [
                  confirmLoading && /* @__PURE__ */ jsx(
                    "span",
                    {
                      className: "spinner-border spinner-border-sm me-2",
                      role: "status",
                      "aria-hidden": "true"
                    }
                  ),
                  !confirmLoading && confirmIcon && /* @__PURE__ */ jsx("i", { className: `la ${confirmIcon} me-1`, "aria-hidden": "true" }),
                  confirmText
                ]
              }
            )
          ] })
        ] })
      ] }) })
    }
  ) });
};
export {
  ReusableModal as R
};
