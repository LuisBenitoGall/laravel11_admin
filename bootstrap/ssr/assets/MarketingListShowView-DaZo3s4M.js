import { jsxs, jsx } from "react/jsx-runtime";
import "react";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import "@inertiajs/react";
function MarketingListShowView({
  record,
  n_members
}) {
  const __ = useTranslation();
  const list = record;
  return /* @__PURE__ */ jsxs("div", { className: "contact-show-view", children: [
    /* @__PURE__ */ jsxs("div", { className: "d-flex justify-content-between align-items-start mb-3", children: [
      /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("h4", { className: "mb-1", children: list.name || `${list.name}` }) }),
      /* @__PURE__ */ jsx("div", { className: "btn-group", children: /* @__PURE__ */ jsxs(
        "a",
        {
          href: route("marketing-lists.edit", { list: list.id }),
          className: "btn btn-sm btn-primary",
          children: [
            /* @__PURE__ */ jsx("i", { className: "la la-edit me-1" }),
            __("editar")
          ]
        }
      ) })
    ] }),
    /* @__PURE__ */ jsx("hr", {}),
    /* @__PURE__ */ jsxs("div", { className: "vertical-scroll", children: [
      /* @__PURE__ */ jsxs("div", { className: "row mb-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "col-md-9", children: [
          /* @__PURE__ */ jsx("h5", { className: "mb-3", children: __("datos_basicos") }),
          /* @__PURE__ */ jsxs("p", { className: "mb-1", children: [
            /* @__PURE__ */ jsxs("strong", { children: [
              __("fecha_creacion"),
              ":"
            ] }),
            " ",
            list.formatted_created_at
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "mb-1", children: [
            /* @__PURE__ */ jsxs("strong", { children: [
              __("propietario"),
              ":"
            ] }),
            " ",
            list.owner && (list.owner.name || list.owner.full_name) ? `${list.owner.name ?? list.owner.full_name} ${list.owner.surname ?? ""}`.trim() : "—"
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "mb-1", children: [
            /* @__PURE__ */ jsxs("strong", { children: [
              __("ultimo_uso"),
              ":"
            ] }),
            " ",
            list.last_used
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "mb-1", children: [
            /* @__PURE__ */ jsxs("strong", { children: [
              __("miembros_num"),
              ":"
            ] }),
            " ",
            list.members_count
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "col-3 text-end" })
      ] }),
      /* @__PURE__ */ jsx("hr", {}),
      /* @__PURE__ */ jsx("div", { className: "row my-4", children: /* @__PURE__ */ jsxs("div", { className: "col-md-11", children: [
        /* @__PURE__ */ jsx("h5", { className: "mb-3", children: __("observaciones") }),
        /* @__PURE__ */ jsx("p", { className: "mb-1", children: list.observations })
      ] }) })
    ] })
  ] });
}
export {
  MarketingListShowView as default
};
