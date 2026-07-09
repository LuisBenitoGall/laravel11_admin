import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import "react";
import { M as ManagePhones } from "./ManagePhones-8V9K-iFw.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import "@inertiajs/react";
import "react-bootstrap";
import "./useSweetAlert-D4PAsWYN.js";
import "sweetalert2";
function CompanyShowView({ record }) {
  var _a, _b;
  const __ = useTranslation();
  const company = record;
  return /* @__PURE__ */ jsxs("div", { className: "contact-show-view", children: [
    /* @__PURE__ */ jsxs("div", { className: "d-flex justify-content-between align-items-start mb-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h4", { className: "mb-1", children: company.name || `${company.name}` }),
        /* @__PURE__ */ jsx("div", { className: "text-muted", children: (_a = company.company) == null ? void 0 : _a.name })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "btn-group", children: /* @__PURE__ */ jsxs(
        "a",
        {
          href: route("companies.edit", { company: company.id }),
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
            company.email ?? "—"
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "col-3 text-end", children: ((_b = company.avatar) == null ? void 0 : _b.image) ? /* @__PURE__ */ jsx(
          "img",
          {
            src: `/storage/companies/${company.logo}`,
            alt: company.name,
            className: "img-fluid rounded-circle float-end",
            style: { maxWidth: "60px", maxHeight: "60px", objectFit: "cover" }
          }
        ) : /* @__PURE__ */ jsx(
          "div",
          {
            className: "rounded-circle bg-secondary d-flex align-items-center justify-content-center float-end",
            style: { width: "60px", height: "60px" },
            children: /* @__PURE__ */ jsx("i", { className: "la la-company text-white", style: { fontSize: "4rem" } })
          }
        ) })
      ] }),
      /* @__PURE__ */ jsx("hr", {}),
      /* @__PURE__ */ jsx("div", { className: "row mb-4", children: /* @__PURE__ */ jsx("div", { className: "col-12", children: /* @__PURE__ */ jsx(
        ManagePhones,
        {
          phoneableType: "company",
          phoneableId: company.id,
          defaultWaMessage: __("whatsapp_mensaje"),
          addNewPhone: false,
          rowXs: 1,
          rowMd: 2,
          rowLg: 2
        }
      ) }) }),
      /* @__PURE__ */ jsx("hr", {}),
      company.notes && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("h6", { className: "text-uppercase text-muted small mb-2", children: __(notas) }),
        /* @__PURE__ */ jsx("p", { children: company.notes })
      ] })
    ] })
  ] });
}
export {
  CompanyShowView as default
};
