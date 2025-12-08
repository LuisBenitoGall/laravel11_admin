import { jsx } from "react/jsx-runtime";
import "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
function ShowRegisterButton({ onClick }) {
  const __ = useTranslation();
  return /* @__PURE__ */ jsx(
    OverlayTrigger,
    {
      placement: "top",
      overlay: /* @__PURE__ */ jsx(Tooltip, { className: "ttp-top", children: __("ver_detalle") }),
      children: /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          className: "btn btn-sm btn-outline-secondary",
          onClick,
          children: /* @__PURE__ */ jsx("i", { className: "la la-eye" })
        }
      )
    }
  );
}
export {
  ShowRegisterButton as S
};
