import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import "react";
import { M as ManagePhones } from "./ManagePhones-C_mhnW8c.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import "@inertiajs/react";
import "react-bootstrap";
import "./useSweetAlert-D4PAsWYN.js";
import "sweetalert2";
function CrmOpportunitiesShowView({ record }) {
  var _a, _b;
  const __ = useTranslation();
  const account = record;
  return /* @__PURE__ */ jsxs("div", { className: "contact-show-view", children: [
    /* @__PURE__ */ jsxs("div", { className: "d-flex justify-content-between align-items-start mb-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h4", { className: "mb-1", children: account.name || `${account.name}` }),
        /* @__PURE__ */ jsx("div", { className: "text-muted", children: (_a = account.company) == null ? void 0 : _a.name })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "btn-group", children: /* @__PURE__ */ jsxs(
        "a",
        {
          href: route("crm-accounts.edit", { account: account.id }),
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
            account.email ?? "—"
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "col-3 text-end", children: ((_b = account.avatar) == null ? void 0 : _b.image) ? /* @__PURE__ */ jsx(
          "img",
          {
            src: `/storage/companies/${account.company.logo}`,
            alt: account.full_name || account.name,
            className: "img-fluid rounded-circle float-end",
            style: { maxWidth: "60px", maxHeight: "60px", objectFit: "cover" }
          }
        ) : /* @__PURE__ */ jsx(
          "div",
          {
            className: "rounded-circle bg-secondary d-flex align-items-center justify-content-center float-end",
            style: { width: "60px", height: "60px" },
            children: /* @__PURE__ */ jsx("i", { className: "la la-account text-white", style: { fontSize: "4rem" } })
          }
        ) })
      ] }),
      /* @__PURE__ */ jsx("hr", {}),
      /* @__PURE__ */ jsx("div", { className: "row my-4", children: /* @__PURE__ */ jsxs("div", { className: "col-12", children: [
        /* @__PURE__ */ jsx("h5", { className: "mb-3", children: __("empresa") }),
        Array.isArray(account.companies) && account.companies.length > 0 ? /* @__PURE__ */ jsx("div", { className: "list-group", children: account.companies.map((company) => /* @__PURE__ */ jsx(
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
      ] }) }),
      /* @__PURE__ */ jsx("div", { className: "row mb-4", children: /* @__PURE__ */ jsx("div", { className: "col-12", children: /* @__PURE__ */ jsx(
        ManagePhones,
        {
          phoneableType: "account",
          phoneableId: account.id,
          defaultWaMessage: __("whatsapp_mensaje"),
          addNewPhone: false,
          rowXs: 1,
          rowMd: 2,
          rowLg: 2
        }
      ) }) }),
      /* @__PURE__ */ jsx("hr", {}),
      account.notes && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("h6", { className: "text-uppercase text-muted small mb-2", children: __(notas) }),
        /* @__PURE__ */ jsx("p", { children: account.notes })
      ] })
    ] })
  ] });
}
export {
  CrmOpportunitiesShowView as default
};
