import { jsxs, jsx } from "react/jsx-runtime";
import "react";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import "@inertiajs/react";
function CrmListShowView({ record }) {
  var _a;
  const __ = useTranslation();
  const list = record;
  return /* @__PURE__ */ jsxs("div", { className: "contact-show-view", children: [
    /* @__PURE__ */ jsxs("div", { className: "d-flex justify-content-between align-items-start mb-3", children: [
      /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx("h4", { className: "mb-1", children: list.name || `${list.name}` }) }),
      /* @__PURE__ */ jsx("div", { className: "btn-group", children: /* @__PURE__ */ jsxs(
        "a",
        {
          href: route("crm-lists.edit", { list: list.id }),
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
            /* @__PURE__ */ jsx("strong", { children: "Email:" }),
            " ",
            list.email ?? "—"
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "col-3 text-end", children: ((_a = list.avatar) == null ? void 0 : _a.image) ? /* @__PURE__ */ jsx(
          "img",
          {
            src: `/storage/companies/${list.company.logo}`,
            alt: list.full_name || list.name,
            className: "img-fluid rounded-circle float-end",
            style: { maxWidth: "60px", maxHeight: "60px", objectFit: "cover" }
          }
        ) : /* @__PURE__ */ jsx(
          "div",
          {
            className: "rounded-circle bg-secondary d-flex align-items-center justify-content-center float-end",
            style: { width: "60px", height: "60px" },
            children: /* @__PURE__ */ jsx("i", { className: "la la-list text-white", style: { fontSize: "4rem" } })
          }
        ) })
      ] }),
      /* @__PURE__ */ jsx("hr", {}),
      /* @__PURE__ */ jsx("div", { className: "row my-4", children: /* @__PURE__ */ jsxs("div", { className: "col-12", children: [
        /* @__PURE__ */ jsx("h5", { className: "mb-3", children: __("campanya") }),
        Array.isArray(list.companies) && list.companies.length > 0 ? /* @__PURE__ */ jsx("div", { className: "list-group", children: list.companies.map((company) => /* @__PURE__ */ jsx(
          "div",
          {
            className: "list-group-item py-2",
            children: /* @__PURE__ */ jsxs("div", { className: "d-flex justify-content-between align-items-center", children: [
              /* @__PURE__ */ jsxs("div", { children: [
                /* @__PURE__ */ jsxs("div", { className: "fw-semibold", children: [
                  company.name,
                  company.tradename && company.tradename !== company.name && /* @__PURE__ */ jsxs("span", { className: "text-muted ms-2", children: [
                    "(",
                    company.tradename,
                    ")"
                  ] })
                ] }),
                /* @__PURE__ */ jsxs("div", { className: "small text-muted", children: [
                  company.nif && /* @__PURE__ */ jsxs("span", { children: [
                    /* @__PURE__ */ jsxs("strong", { children: [
                      __("nif"),
                      ":"
                    ] }),
                    " ",
                    company.nif
                  ] }),
                  company.pivot.position && /* @__PURE__ */ jsxs("span", { className: "ms-4", children: [
                    /* @__PURE__ */ jsxs("strong", { children: [
                      __("cargo"),
                      ":"
                    ] }),
                    " ",
                    company.pivot.position
                  ] })
                ] })
              ] }),
              company.status === 1 && /* @__PURE__ */ jsx("span", { className: "badge bg-success", children: __("activa") })
            ] })
          },
          company.id
        )) }) : /* @__PURE__ */ jsx("p", { className: "text-muted mb-0", children: __("empresa_no_asignada") })
      ] }) })
    ] })
  ] });
}
export {
  CrmListShowView as default
};
