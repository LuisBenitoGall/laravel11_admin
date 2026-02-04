import { jsxs, jsx } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-BAKikn-7.js";
import { router, Head } from "@inertiajs/react";
import { u as useCompanySession } from "./Sidebar-1g4CKLZI.js";
import "sweetalert2";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import FavoritesGrid from "./FavoritesGrid-1AK2Mn6S.js";
import { useState, useEffect } from "react";
import axios from "axios";
import { u as useSweetAlert } from "./useSweetAlert-D4PAsWYN.js";
import "@inertiajs/inertia";
import "./Header-BVvoXjVe.js";
import "react-bootstrap";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
import "./TextInput-CzxrbIpp.js";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
function CompanyNotesRemindersWidget() {
  const __ = useTranslation();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedIds, setExpandedIds] = useState([]);
  const relevanceColor = (relevance) => {
    switch (Number(relevance)) {
      case 1:
        return "#0d6efd";
      case 2:
        return "#0dcaf0";
      case 3:
        return "#ffc107";
      case 4:
        return "#fd7e14";
      case 5:
        return "#dc3545";
      default:
        return "#6c757d";
    }
  };
  const fetchReminders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        route("company-notes.owner-reminders")
      );
      const raw = response.data || [];
      const items = Array.isArray(raw) ? raw : Array.isArray(raw.data) ? raw.data : [];
      setReminders(items);
    } catch (e) {
      console.error("Error cargando recordatorios de notas de empresa", e);
      setError(
        __("error_cargando_recordatorios_empresas") || "Error cargando los recordatorios de tus notas de empresa."
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchReminders();
  }, []);
  const hasReminders = reminders && reminders.length > 0;
  const isExpanded = (id) => expandedIds.includes(id);
  const toggleExpanded = (id) => {
    setExpandedIds(
      (prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  const getCompanyLabel = (note) => {
    if (note.subject_company) {
      const c = note.subject_company;
      if (c.name) return c.name;
    }
    if (note.subject_company_name) return note.subject_company_name;
    return "";
  };
  return /* @__PURE__ */ jsxs("div", { className: "card shadow-sm h-100", children: [
    /* @__PURE__ */ jsxs("div", { className: "card-header d-flex justify-content-between align-items-center", children: [
      /* @__PURE__ */ jsxs("div", { className: "d-flex align-items-center", children: [
        /* @__PURE__ */ jsx("i", { className: "la la-building me-2", "aria-hidden": "true" }),
        /* @__PURE__ */ jsx("span", { className: "fw-semibold", children: __("recordatorios_cuentas") || "Recordatorios (empresas)" })
      ] }),
      hasReminders && /* @__PURE__ */ jsx("span", { className: "badge bg-secondary", children: reminders.length })
    ] }),
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: "card-body p-2",
        style: {
          maxHeight: "320px",
          overflowY: "auto"
        },
        children: [
          loading && /* @__PURE__ */ jsx("div", { className: "d-flex justify-content-center py-3", children: /* @__PURE__ */ jsx(
            "div",
            {
              className: "spinner-border spinner-border-sm text-secondary",
              role: "status",
              children: /* @__PURE__ */ jsx("span", { className: "visually-hidden", children: __("cargando") || "Cargando..." })
            }
          ) }),
          error && !loading && /* @__PURE__ */ jsx("div", { className: "alert alert-danger mb-2", children: error }),
          !loading && !error && !hasReminders && /* @__PURE__ */ jsx("p", { className: "text-muted small mb-0", children: __("notas_no_mas") || "No tienes recordatorios de notas de empresa pendientes." }),
          !loading && !error && hasReminders && /* @__PURE__ */ jsx("ul", { className: "list-unstyled mb-0", children: reminders.map((note) => {
            const expanded = isExpanded(note.id);
            const companyLabel = getCompanyLabel(note);
            return /* @__PURE__ */ jsx(
              "li",
              {
                className: "border-bottom py-2",
                children: /* @__PURE__ */ jsxs("div", { className: "d-flex align-items-start", children: [
                  /* @__PURE__ */ jsx(
                    "span",
                    {
                      style: {
                        fontSize: "1.1rem",
                        color: relevanceColor(note.relevance)
                      },
                      children: "⚑"
                    }
                  ),
                  /* @__PURE__ */ jsxs("div", { className: "flex-grow-1 ms-2", children: [
                    /* @__PURE__ */ jsxs(
                      "div",
                      {
                        className: "d-flex justify-content-between align-items-start",
                        style: { cursor: "pointer" },
                        onClick: () => toggleExpanded(note.id),
                        children: [
                          /* @__PURE__ */ jsxs("div", { className: "me-2", children: [
                            /* @__PURE__ */ jsx("strong", { className: "d-block", children: note.title || __("nota_sin_titulo") || "Nota" }),
                            companyLabel && /* @__PURE__ */ jsxs("small", { className: "text-muted d-block", children: [
                              /* @__PURE__ */ jsx("i", { className: "la la-building me-1" }),
                              companyLabel
                            ] })
                          ] }),
                          /* @__PURE__ */ jsxs("div", { className: "text-end", children: [
                            /* @__PURE__ */ jsx("small", { className: "text-muted text-nowrap d-block", children: note.remind_at_formatted || note.remind_at || "" }),
                            /* @__PURE__ */ jsx("small", { className: "text-muted", children: /* @__PURE__ */ jsx(
                              "i",
                              {
                                className: "la " + (expanded ? "la-angle-up" : "la-angle-down")
                              }
                            ) })
                          ] })
                        ]
                      }
                    ),
                    Array.isArray(note.tags) && note.tags.length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-1", children: note.tags.map((tag) => /* @__PURE__ */ jsx(
                      "span",
                      {
                        className: "badge bg-light text-dark me-1",
                        children: tag
                      },
                      tag
                    )) }),
                    expanded && note.body && /* @__PURE__ */ jsx("div", { className: "mt-2 small", children: /* @__PURE__ */ jsx(
                      "div",
                      {
                        className: "border rounded p-2 bg-light",
                        dangerouslySetInnerHTML: {
                          __html: note.body
                        }
                      }
                    ) })
                  ] })
                ] })
              },
              note.id
            );
          }) })
        ]
      }
    ),
    !loading && hasReminders && /* @__PURE__ */ jsx("div", { className: "card-footer text-end py-2", children: /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        className: "btn btn-sm btn-outline-secondary",
        onClick: fetchReminders,
        children: [
          /* @__PURE__ */ jsx("i", { className: "la la-refresh me-1" }),
          __("actualizar") || "Actualizar"
        ]
      }
    ) })
  ] });
}
function NewContactsWidget() {
  const __ = useTranslation();
  const { showConfirm } = useSweetAlert();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const fetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(route("crm-contacts.new"));
      const raw = res.data || {};
      const list = Array.isArray(raw.contacts) ? raw.contacts : raw.data || [];
      setItems(list);
    } catch (e) {
      console.error("Error loading new contacts", e);
      setError(__("error_cargando") || "Error cargando contactos");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetch();
  }, []);
  const handleEdit = (user) => {
    if (!user) return;
    router.visit(route("users.edit", user.id));
  };
  const handleDelete = (contactId) => {
    if (!contactId) return;
    showConfirm({
      title: __("contacto_eliminar") || "¿Eliminar?",
      text: __("contacto_eliminar_confirm") || "Se eliminará el contacto CRM.",
      icon: "warning",
      onConfirm: async () => {
        setDeletingId(contactId);
        try {
          await axios.delete(route("crm-contacts.destroy", contactId));
          fetch();
        } catch (e) {
          console.error("Error deleting contact", e);
        } finally {
          setDeletingId(null);
        }
      }
    });
  };
  const hasItems = items && items.length > 0;
  return /* @__PURE__ */ jsxs("div", { className: "card shadow-sm h-100", children: [
    /* @__PURE__ */ jsxs("div", { className: "card-header d-flex justify-content-between align-items-center", children: [
      /* @__PURE__ */ jsxs("div", { className: "d-flex align-items-center", children: [
        /* @__PURE__ */ jsx("i", { className: "la la-address-book me-2", "aria-hidden": "true" }),
        /* @__PURE__ */ jsxs("span", { className: "fw-semibold", children: [
          __("contactos_ultimos") || "Últimos contactos",
          " Web"
        ] })
      ] }),
      hasItems && /* @__PURE__ */ jsx("span", { className: "badge bg-secondary", children: items.length })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "card-body p-2", style: { maxHeight: "320px", overflowY: "auto", overflowX: "hidden" }, children: [
      loading && /* @__PURE__ */ jsx("div", { className: "d-flex justify-content-center py-3", children: /* @__PURE__ */ jsx("div", { className: "spinner-border spinner-border-sm text-secondary", role: "status", children: /* @__PURE__ */ jsx("span", { className: "visually-hidden", children: __("cargando") || "Cargando..." }) }) }),
      error && !loading && /* @__PURE__ */ jsx("div", { className: "alert alert-danger mb-2", children: error }),
      !loading && !error && !hasItems && /* @__PURE__ */ jsx("p", { className: "text-muted small mb-0", children: __("contactos_nuevos_no_hallados") || "No hay nuevos contactos." }),
      !loading && !error && hasItems && /* @__PURE__ */ jsx("ul", { className: "list-unstyled mb-0", children: items.map((c) => /* @__PURE__ */ jsx("li", { className: "border-bottom py-2", children: /* @__PURE__ */ jsx("div", { className: "d-flex align-items-start", children: /* @__PURE__ */ jsxs("div", { className: "flex-grow-1 ms-2", style: { minWidth: 0 }, children: [
        /* @__PURE__ */ jsxs("div", { className: "d-flex justify-content-between", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("strong", { className: "d-block", children: c.user && c.user.name || "#" + c.id }),
            c.user && c.user.email && /* @__PURE__ */ jsxs("small", { className: "text-muted d-block", children: [
              /* @__PURE__ */ jsx("i", { className: "la la-envelope me-1" }),
              c.user.email
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "text-end", children: /* @__PURE__ */ jsx("small", { className: "text-muted text-nowrap d-block", children: c.created_at }) })
        ] }),
        c.last_message && /* @__PURE__ */ jsx("div", { className: "mt-1 small", style: { whiteSpace: "normal", overflowWrap: "anywhere" }, children: /* @__PURE__ */ jsx("em", { children: c.last_message }) }),
        /* @__PURE__ */ jsxs("div", { className: "mt-2", children: [
          /* @__PURE__ */ jsxs("button", { className: "btn btn-sm btn-info me-2 text-white", onClick: () => handleEdit(c.user), children: [
            /* @__PURE__ */ jsx("i", { className: "la la-edit me-1" }),
            __("editar") || "Editar"
          ] }),
          /* @__PURE__ */ jsx("button", { className: "btn btn-sm btn-danger", onClick: () => handleDelete(c.id), disabled: deletingId === c.id, children: deletingId === c.id ? /* @__PURE__ */ jsx("span", { className: "spinner-border spinner-border-sm" }) : /* @__PURE__ */ jsx("i", { className: "la la-trash" }) })
        ] })
      ] }) }) }, c.id)) })
    ] })
  ] });
}
function UserNotesRemindersWidget() {
  const __ = useTranslation();
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedIds, setExpandedIds] = useState([]);
  const relevanceColor = (relevance) => {
    switch (Number(relevance)) {
      case 1:
        return "#0d6efd";
      case 2:
        return "#0dcaf0";
      case 3:
        return "#ffc107";
      case 4:
        return "#fd7e14";
      case 5:
        return "#dc3545";
      default:
        return "#6c757d";
    }
  };
  const fetchReminders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        route("user-notes.owner-reminders")
      );
      const raw = response.data || [];
      const items = Array.isArray(raw) ? raw : Array.isArray(raw.data) ? raw.data : [];
      setReminders(items);
    } catch (e) {
      console.error("Error cargando recordatorios de notas", e);
      setError(
        __("error_cargando_recordatorios") || "Error cargando los recordatorios de tus notas."
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchReminders();
  }, []);
  const hasReminders = reminders && reminders.length > 0;
  const isExpanded = (id) => expandedIds.includes(id);
  const toggleExpanded = (id) => {
    setExpandedIds(
      (prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  const getContactLabel = (note) => {
    if (note.contact) {
      const c = note.contact;
      if (c.full_name) return c.full_name;
      return `${c.name ?? ""} ${c.surname ?? ""}`.trim();
    }
    if (note.contact_full_name) return note.contact_full_name;
    if (note.contact_name || note.contact_surname) {
      return `${note.contact_name ?? ""} ${note.contact_surname ?? ""}`.trim();
    }
    return "";
  };
  return /* @__PURE__ */ jsxs("div", { className: "card shadow-sm h-100", children: [
    /* @__PURE__ */ jsxs("div", { className: "card-header d-flex justify-content-between align-items-center", children: [
      /* @__PURE__ */ jsxs("div", { className: "d-flex align-items-center", children: [
        /* @__PURE__ */ jsx("i", { className: "la la-clock me-2", "aria-hidden": "true" }),
        /* @__PURE__ */ jsx("span", { className: "fw-semibold", children: __("recordatorios_contactos") || "Recordatorios" })
      ] }),
      hasReminders && /* @__PURE__ */ jsx("span", { className: "badge bg-secondary", children: reminders.length })
    ] }),
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: "card-body p-2",
        style: {
          maxHeight: "320px",
          overflowY: "auto"
        },
        children: [
          loading && /* @__PURE__ */ jsx("div", { className: "d-flex justify-content-center py-3", children: /* @__PURE__ */ jsx(
            "div",
            {
              className: "spinner-border spinner-border-sm text-secondary",
              role: "status",
              children: /* @__PURE__ */ jsx("span", { className: "visually-hidden", children: __("cargando") || "Cargando..." })
            }
          ) }),
          error && !loading && /* @__PURE__ */ jsx("div", { className: "alert alert-danger mb-2", children: error }),
          !loading && !error && !hasReminders && /* @__PURE__ */ jsx("p", { className: "text-muted small mb-0", children: __("notas_no_mas") || "No tienes recordatorios de notas pendientes." }),
          !loading && !error && hasReminders && /* @__PURE__ */ jsx("ul", { className: "list-unstyled mb-0", children: reminders.map((note) => {
            const expanded = isExpanded(note.id);
            const contactLabel = getContactLabel(note);
            return /* @__PURE__ */ jsx(
              "li",
              {
                className: "border-bottom py-2",
                children: /* @__PURE__ */ jsxs("div", { className: "d-flex align-items-start", children: [
                  /* @__PURE__ */ jsx(
                    "span",
                    {
                      style: {
                        fontSize: "1.1rem",
                        color: relevanceColor(note.relevance)
                      },
                      children: "⚑"
                    }
                  ),
                  /* @__PURE__ */ jsxs("div", { className: "flex-grow-1 ms-2", children: [
                    /* @__PURE__ */ jsxs(
                      "div",
                      {
                        className: "d-flex justify-content-between align-items-start",
                        style: { cursor: "pointer" },
                        onClick: () => toggleExpanded(note.id),
                        children: [
                          /* @__PURE__ */ jsxs("div", { className: "me-2", children: [
                            /* @__PURE__ */ jsx("strong", { className: "d-block", children: note.title || __("nota_sin_titulo") || "Nota" }),
                            contactLabel && /* @__PURE__ */ jsxs("small", { className: "text-muted d-block", children: [
                              /* @__PURE__ */ jsx("i", { className: "la la-user me-1" }),
                              contactLabel
                            ] })
                          ] }),
                          /* @__PURE__ */ jsxs("div", { className: "text-end", children: [
                            /* @__PURE__ */ jsx("small", { className: "text-muted text-nowrap d-block", children: note.remind_at_formatted || note.remind_at || "" }),
                            /* @__PURE__ */ jsx("small", { className: "text-muted", children: /* @__PURE__ */ jsx(
                              "i",
                              {
                                className: "la " + (expanded ? "la-angle-up" : "la-angle-down")
                              }
                            ) })
                          ] })
                        ]
                      }
                    ),
                    Array.isArray(note.tags) && note.tags.length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-1", children: note.tags.map((tag) => /* @__PURE__ */ jsx(
                      "span",
                      {
                        className: "badge bg-light text-dark me-1",
                        children: tag
                      },
                      tag
                    )) }),
                    expanded && note.body && /* @__PURE__ */ jsx("div", { className: "mt-2 small", children: /* @__PURE__ */ jsx(
                      "div",
                      {
                        className: "border rounded p-2 bg-light",
                        dangerouslySetInnerHTML: {
                          __html: note.body
                        }
                      }
                    ) })
                  ] })
                ] })
              },
              note.id
            );
          }) })
        ]
      }
    ),
    !loading && hasReminders && /* @__PURE__ */ jsx("div", { className: "card-footer text-end py-2", children: /* @__PURE__ */ jsxs(
      "button",
      {
        type: "button",
        className: "btn btn-sm btn-outline-secondary",
        onClick: fetchReminders,
        children: [
          /* @__PURE__ */ jsx("i", { className: "la la-refresh me-1" }),
          __("actualizar") || "Actualizar"
        ]
      }
    ) })
  ] });
}
function Index({ auth, session, title, subtitle, favorites = [] }) {
  const __ = useTranslation();
  useCompanySession();
  const actions = [];
  return /* @__PURE__ */ jsxs(
    AdminAuthenticated,
    {
      user: auth.user,
      title,
      subtitle,
      actions,
      children: [
        /* @__PURE__ */ jsx(Head, { title }),
        /* @__PURE__ */ jsx("div", { className: "contents pb-4", children: /* @__PURE__ */ jsxs("div", { className: "row", children: [
          /* @__PURE__ */ jsxs("div", { className: "col-12 my-3", children: [
            /* @__PURE__ */ jsx("h2", { className: "mb-3", children: __("favoritos_mis") }),
            /* @__PURE__ */ jsx(FavoritesGrid, { favorites })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "col-md-6 col-lg-4 my-5", children: /* @__PURE__ */ jsx(UserNotesRemindersWidget, {}) }),
          /* @__PURE__ */ jsx("div", { className: "col-md-6 col-lg-4 my-5", children: /* @__PURE__ */ jsx(CompanyNotesRemindersWidget, {}) }),
          /* @__PURE__ */ jsx("div", { className: "col-md-6 col-lg-4 my-5", children: /* @__PURE__ */ jsx(NewContactsWidget, {}) })
        ] }) })
      ]
    }
  );
}
export {
  Index as default
};
