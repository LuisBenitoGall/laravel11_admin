import { jsxs, Fragment, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { Spinner, OverlayTrigger, Tooltip } from "react-bootstrap";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
function ShowRegisterPanel({
  open,
  title = "",
  loading = false,
  onClose,
  children
}) {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      "div",
      {
        className: `show-register-backdrop ${open ? "show" : ""}`
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: `show-register-panel ${open ? "show" : ""}`, children: [
      /* @__PURE__ */ jsxs("div", { className: "show-register-header d-flex align-items-center justify-content-between", children: [
        /* @__PURE__ */ jsx("h5", { className: "mb-0", children: title }),
        /* @__PURE__ */ jsx(
          "button",
          {
            type: "button",
            className: "btn btn-sm btn-outline-secondary",
            onClick: onClose,
            children: /* @__PURE__ */ jsx("i", { className: "la la-times" })
          }
        )
      ] }),
      /* @__PURE__ */ jsx("div", { className: "show-register-body", children: loading ? /* @__PURE__ */ jsx("div", { className: "show-register-spinner", children: /* @__PURE__ */ jsx(Spinner, { animation: "border", role: "status", children: /* @__PURE__ */ jsx("span", { className: "visually-hidden", children: "Cargando..." }) }) }) : children })
    ] })
  ] });
}
ShowRegisterPanel.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.string,
  loading: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node
};
function ShowRegister({
  id = null,
  routeName,
  title = "",
  ViewComponent,
  open = false,
  onClose
}) {
  const [loading, setLoading] = useState(false);
  const [record, setRecord] = useState(null);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!open || !id) {
      setRecord(null);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    axios.get(route(routeName, id), {
      headers: {
        Accept: "application/json"
      }
    }).then((response) => {
      var _a;
      const data = ((_a = response.data) == null ? void 0 : _a.data) ?? response.data;
      if (typeof data === "string" && data.trim().startsWith("<!DOCTYPE")) {
        console.error("Respuesta HTML inesperada en ShowRegister:", data);
        setError("Error al cargar el registro.");
        setRecord(null);
      } else {
        setRecord(data);
      }
    }).catch((e) => {
      console.error(e);
      setError("Error al cargar el registro.");
    }).finally(() => {
      setLoading(false);
    });
  }, [id, open, routeName]);
  return /* @__PURE__ */ jsxs(
    ShowRegisterPanel,
    {
      open,
      title,
      loading,
      onClose,
      children: [
        error && /* @__PURE__ */ jsx("div", { className: "alert alert-danger mb-3", children: error }),
        record && !error && /* @__PURE__ */ jsx(ViewComponent, { record })
      ]
    }
  );
}
ShowRegister.propTypes = {
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  routeName: PropTypes.string.isRequired,
  title: PropTypes.string,
  ViewComponent: PropTypes.elementType.isRequired,
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired
};
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
  ShowRegisterButton as S,
  ShowRegister as a
};
