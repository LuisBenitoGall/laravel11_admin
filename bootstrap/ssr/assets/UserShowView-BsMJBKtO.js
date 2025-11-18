import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import "react";
import { M as ManagePhones } from "./ManagePhones-C_mhnW8c.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import "@inertiajs/react";
import "react-bootstrap";
import "./useSweetAlert-D4PAsWYN.js";
import "sweetalert2";
function UserShowView({ record }) {
  var _a, _b;
  const __ = useTranslation();
  const user = record;
  const today = /* @__PURE__ */ new Date();
  let birthdayNotice = null;
  if (user.birthday) {
    const birth = new Date(user.birthday);
    const currentYear = today.getFullYear();
    let nextBirthday = new Date(currentYear, birth.getMonth(), birth.getDate());
    const todayMidnight = new Date(currentYear, today.getMonth(), today.getDate());
    if (nextBirthday < todayMidnight) {
      nextBirthday = new Date(currentYear + 1, birth.getMonth(), birth.getDate());
    }
    const diffMs = nextBirthday - todayMidnight;
    const diffDays = Math.round(diffMs / (1e3 * 60 * 60 * 24));
    if (diffDays >= 0 && diffDays <= 15) {
      birthdayNotice = /* @__PURE__ */ jsxs("p", { className: "mb-1 text-success fw-bold", children: [
        diffDays,
        " ",
        __("dias_su_aniversario")
      ] });
    }
  }
  const sexLabel = (() => {
    const s = String((user == null ? void 0 : user.sex) ?? "").trim().toLowerCase();
    if (s === "m") return __("mujer");
    if (s === "h") return __("hombre");
    return "";
  })();
  return /* @__PURE__ */ jsxs("div", { className: "contact-show-view", children: [
    /* @__PURE__ */ jsxs("div", { className: "d-flex justify-content-between align-items-start mb-3", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h4", { className: "mb-1", children: user.full_name || `${user.name} ${user.surname}` }),
        /* @__PURE__ */ jsx("div", { className: "text-muted", children: (_a = user.company) == null ? void 0 : _a.name })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "btn-group", children: /* @__PURE__ */ jsxs(
        "a",
        {
          href: route("users.edit", { user: user.id }),
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
            user.email ?? "—"
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "mb-1", children: [
            /* @__PURE__ */ jsxs("strong", { children: [
              __("fecha_nacimiento"),
              ":"
            ] }),
            " ",
            user.birthday_formatted ?? ""
          ] }),
          birthdayNotice,
          sexLabel && /* @__PURE__ */ jsxs("p", { className: "mb-1", children: [
            /* @__PURE__ */ jsxs("strong", { children: [
              __("sexo"),
              ":"
            ] }),
            " ",
            sexLabel
          ] })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "col-3 text-end", children: ((_b = user.avatar) == null ? void 0 : _b.image) ? /* @__PURE__ */ jsx(
          "img",
          {
            src: `/storage/users/${user.avatar.image}`,
            alt: user.full_name || user.name,
            className: "img-fluid rounded-circle float-end",
            style: { maxWidth: "60px", maxHeight: "60px", objectFit: "cover" }
          }
        ) : /* @__PURE__ */ jsx(
          "div",
          {
            className: "rounded-circle bg-secondary d-flex align-items-center justify-content-center float-end",
            style: { width: "60px", height: "60px" },
            children: /* @__PURE__ */ jsx("i", { className: "la la-user text-white", style: { fontSize: "4rem" } })
          }
        ) })
      ] }),
      /* @__PURE__ */ jsx("hr", {}),
      /* @__PURE__ */ jsx("div", { className: "row my-4", children: /* @__PURE__ */ jsxs("div", { className: "col-12", children: [
        /* @__PURE__ */ jsx("h5", { className: "mb-3", children: __("empresa") }),
        Array.isArray(user.companies) && user.companies.length > 0 ? /* @__PURE__ */ jsx("div", { className: "list-group", children: user.companies.map((company) => /* @__PURE__ */ jsx(
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
          phoneableType: "User",
          phoneableId: user.id,
          defaultWaMessage: __("whatsapp_mensaje"),
          addNewPhone: false,
          rowXs: 1,
          rowMd: 2,
          rowLg: 2
        }
      ) }) }),
      /* @__PURE__ */ jsx("hr", {}),
      user.notes && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("h6", { className: "text-uppercase text-muted small mb-2", children: __(notas) }),
        /* @__PURE__ */ jsx("p", { children: user.notes })
      ] })
    ] })
  ] });
}
export {
  UserShowView as default
};
