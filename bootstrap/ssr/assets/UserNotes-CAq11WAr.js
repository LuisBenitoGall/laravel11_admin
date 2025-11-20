import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useRef, useEffect } from "react";
import { usePage } from "@inertiajs/react";
import axios from "axios";
import { F as FormDatePickerInput, t as toLocalYmd } from "./DatePickerToForm-DlY2BJGL.js";
import { T as TextInput } from "./TextInput-CzxrbIpp.js";
import { T as Textarea } from "./Textarea-nvTyMSx8.js";
import { u as useSweetAlert } from "./useSweetAlert-D4PAsWYN.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import "react-datepicker";
/* empty css                          */
import "date-fns/locale";
import "react-draft-wysiwyg";
import "draft-js";
import "html-to-draftjs";
import "draftjs-to-html";
/* empty css                             */
import "sweetalert2";
function UserNotes({
  userId,
  refreshKey
  // opcional: para recargar cuando se cree/edite una nota
}) {
  var _a;
  const __ = useTranslation();
  ((_a = usePage()) == null ? void 0 : _a.props) || {};
  const { showConfirm } = useSweetAlert();
  const [notes, setNotes] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState(null);
  const [editingReminderId, setEditingReminderId] = useState(null);
  const [savingReminderId, setSavingReminderId] = useState(null);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", body: "" });
  const [savingEditId, setSavingEditId] = useState(null);
  const [editingRelevanceId, setEditingRelevanceId] = useState(null);
  const [savingRelevanceId, setSavingRelevanceId] = useState(null);
  const [savingPinId, setSavingPinId] = useState(null);
  const [savingArchiveId, setSavingArchiveId] = useState(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const loaderRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const hasMore = page < lastPage;
  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400);
    return () => clearTimeout(id);
  }, [search]);
  const fetchNotes = async (pageToLoad = 1, replace = false) => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        route("user-notes.show", userId),
        {
          params: {
            page: pageToLoad,
            q: debouncedSearch || null
          }
        }
      );
      const payload = response.data || {};
      const data = payload.data || [];
      const meta = payload.meta || {};
      setNotes(
        (prev) => replace ? sortNotes(data) : sortNotes([...prev, ...data])
      );
      const currentPage = meta.current_page || pageToLoad;
      const totalPages = meta.last_page || currentPage;
      setPage(currentPage);
      setLastPage(totalPages);
    } catch (e) {
      console.error("Error cargando notas", e);
      setError(__("error_cargando_notas") || "Error cargando notas");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!initialized) {
      setInitialized(true);
      fetchNotes(1, true);
    }
  }, [initialized]);
  useEffect(() => {
    if (!initialized) return;
    setNotes([]);
    setPage(1);
    setLastPage(1);
    fetchNotes(1, true);
  }, [refreshKey]);
  useEffect(() => {
    if (!initialized) return;
    setNotes([]);
    setPage(1);
    setLastPage(1);
    fetchNotes(1, true);
  }, [debouncedSearch]);
  useEffect(() => {
    if (!hasMore || loading) return;
    const root = scrollContainerRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting) {
          fetchNotes(page + 1);
        }
      },
      {
        root,
        threshold: 0.1
      }
    );
    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }
    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [hasMore, loading, page, debouncedSearch]);
  const [deletingId, setDeletingId] = useState(null);
  const handleDelete = (note) => {
    showConfirm({
      title: __("nota_eliminar") || "Eliminar nota",
      text: __("nota_eliminar_confirm") || "¿Seguro que quieres eliminar esta nota?",
      icon: "warning",
      onConfirm: async () => {
        setDeletingId(note.id);
        setError(null);
        try {
          await axios.delete(route("user-notes.destroy", note.id));
          setNotes((prev) => prev.filter((n) => n.id !== note.id));
          if (editingNoteId === note.id) {
            cancelEditing();
          }
          if (editingReminderId === note.id) {
            setEditingReminderId(null);
          }
        } catch (e) {
          console.error("Error eliminando nota", e);
          setError(
            __("error_eliminando_nota") || "Error eliminando la nota."
          );
        } finally {
          setDeletingId(null);
        }
      }
    });
  };
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
  const relevanceOptions = [
    { value: 1, label: __("baja") },
    { value: 2, label: __("media_baja") },
    { value: 3, label: __("media") },
    { value: 4, label: __("media_alta") },
    { value: 5, label: __("alta") }
  ];
  const isInitialLoading = loading && notes.length === 0;
  const handleReminderChange = async (note, date) => {
    var _a2;
    const newDate = toLocalYmd(date);
    setSavingReminderId(note.id);
    setError(null);
    try {
      const response = await axios.put(
        route("user-notes.update-reminder", note.id),
        {
          remind_at: newDate
        }
      );
      const updated = ((_a2 = response.data) == null ? void 0 : _a2.data) || null;
      if (updated) {
        setNotes(
          (prev) => prev.map(
            (n) => n.id === note.id ? {
              ...n,
              remind_at: updated.remind_at,
              remind_at_formatted: updated.remind_at_formatted
            } : n
          )
        );
      }
      setEditingReminderId(null);
    } catch (e) {
      console.error("Error actualizando recordatorio", e);
      setError(__("error_actualizando_recordatorio") || "Error actualizando recordatorio");
    } finally {
      setSavingReminderId(null);
    }
  };
  const handleRelevanceChange = async (note, value) => {
    var _a2;
    setSavingRelevanceId(note.id);
    setError(null);
    try {
      const response = await axios.put(
        route("user-notes.update-relevance", note.id),
        {
          relevance: value
        }
      );
      const updated = ((_a2 = response.data) == null ? void 0 : _a2.data) || null;
      if (updated) {
        setNotes(
          (prev) => prev.map(
            (n) => n.id === note.id ? {
              ...n,
              relevance: updated.relevance
            } : n
          )
        );
      }
      setEditingRelevanceId(null);
    } catch (e) {
      console.error("Error actualizando relevancia", e);
      setError(
        __("error_actualizando_relevancia") || "Error actualizando la relevancia."
      );
    } finally {
      setSavingRelevanceId(null);
    }
  };
  const handleTogglePin = async (note) => {
    var _a2;
    setSavingPinId(note.id);
    setError(null);
    try {
      const response = await axios.put(
        route("user-notes.toggle-pin", note.id)
      );
      const updated = ((_a2 = response.data) == null ? void 0 : _a2.data) || null;
      if (updated) {
        setNotes(
          (prev) => sortNotes(
            prev.map(
              (n) => n.id === note.id ? { ...n, is_pinned: updated.is_pinned } : n
            )
          )
        );
      }
    } catch (e) {
      console.error("Error fijando/desfijando nota", e);
      setError(
        __("error_pin_nota") || "Error al fijar o desfijar la nota."
      );
    } finally {
      setSavingPinId(null);
    }
  };
  const startEditing = (note) => {
    setEditingNoteId(note.id);
    setEditForm({
      title: note.title || "",
      body: note.body || ""
    });
  };
  const cancelEditing = () => {
    setEditingNoteId(null);
    setEditForm({ title: "", body: "" });
  };
  const handleEditChange = (field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };
  const saveEdit = async (note) => {
    var _a2;
    if (savingEditId) return;
    setSavingEditId(note.id);
    setError(null);
    try {
      const response = await axios.put(
        route("user-notes.update", note.id),
        {
          title: editForm.title,
          body: editForm.body
        }
      );
      const updated = ((_a2 = response.data) == null ? void 0 : _a2.data) || null;
      if (updated) {
        setNotes(
          (prev) => prev.map(
            (n) => n.id === note.id ? {
              ...n,
              title: updated.title,
              body: updated.body,
              created_at: updated.created_at,
              created_at_formatted: updated.created_at_formatted
            } : n
          )
        );
      }
      cancelEditing();
    } catch (e) {
      console.error("Error actualizando nota", e);
      setError(
        __("error_actualizando_nota") || "Error actualizando la nota."
      );
    } finally {
      setSavingEditId(null);
    }
  };
  const sortNotes = (items) => {
    return [...items].sort((a, b) => {
      const pinDiff = Number(b.is_pinned) - Number(a.is_pinned);
      if (pinDiff !== 0) return pinDiff;
      const da = a.created_at || "";
      const db = b.created_at || "";
      if (da < db) return 1;
      if (da > db) return -1;
      return 0;
    });
  };
  const handleArchive = (note) => {
    showConfirm({
      title: __("nota_archivar") || "Archivar nota",
      text: __("nota_archivar_confirm") || "La nota se archivará y dejará de mostrarse aquí, pero no se eliminará.",
      icon: "warning",
      onConfirm: async () => {
        setSavingArchiveId(note.id);
        setError(null);
        try {
          await axios.put(
            route("user-notes.toggle-archive", note.id),
            { archive: true }
            // ⬅ dejamos preparado para futuros "false"
          );
          setNotes((prev) => prev.filter((n) => n.id !== note.id));
          if (editingNoteId === note.id) {
            cancelEditing();
          }
          if (editingReminderId === note.id) {
            setEditingReminderId(null);
          }
          if (editingRelevanceId === note.id) {
            setEditingRelevanceId(null);
          }
        } catch (e) {
          console.error("Error archivando nota", e);
          setError(
            __("error_archivando_nota") || "Error archivando la nota."
          );
        } finally {
          setSavingArchiveId(null);
        }
      }
    });
  };
  return /* @__PURE__ */ jsxs("div", { className: "col-12 gy-2", children: [
    /* @__PURE__ */ jsxs("div", { className: "mb-3 d-flex align-items-center gap-2", children: [
      /* @__PURE__ */ jsx("div", { className: "flex-grow-1", children: /* @__PURE__ */ jsxs("div", { className: "input-group", children: [
        /* @__PURE__ */ jsx("span", { className: "input-group-text", children: /* @__PURE__ */ jsx("i", { className: "la la-search", "aria-hidden": "true" }) }),
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            className: "form-control",
            placeholder: __("notas_filtrar") || "Buscar en título, texto y etiquetas...",
            value: search,
            onChange: (e) => setSearch(e.target.value)
          }
        )
      ] }) }),
      search && /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          className: "btn btn-outline-secondary btn-sm",
          onClick: () => setSearch(""),
          children: [
            /* @__PURE__ */ jsx("i", { className: "la la-times me-1" }),
            __("limpiar") || "Limpiar"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxs(
      "div",
      {
        ref: scrollContainerRef,
        className: "user-notes-scroll border rounded",
        style: {
          maxHeight: "60vh",
          overflowY: "auto",
          padding: "0.75rem"
        },
        children: [
          error && /* @__PURE__ */ jsx("div", { className: "alert alert-danger mx-0", children: error }),
          isInitialLoading && /* @__PURE__ */ jsx("div", { className: "d-flex justify-content-center py-3", children: /* @__PURE__ */ jsx("div", { className: "spinner-border text-secondary", role: "status", children: /* @__PURE__ */ jsx("span", { className: "visually-hidden", children: __("cargando") || "Cargando..." }) }) }),
          notes.length === 0 && !loading && !error && /* @__PURE__ */ jsx("p", { className: "text-muted mb-0", children: __("sin_notas_para_usuario") || "No hay notas para este usuario." }),
          notes.map((note) => {
            var _a2;
            return /* @__PURE__ */ jsxs("div", { className: "card mb-3 shadow-sm", children: [
              /* @__PURE__ */ jsxs("div", { className: "card-header d-flex justify-content-between align-items-center", children: [
                /* @__PURE__ */ jsxs("div", { className: "d-flex align-items-center flex-grow-1", children: [
                  /* @__PURE__ */ jsx(
                    "span",
                    {
                      className: "me-2",
                      style: {
                        fontSize: "1.1rem",
                        color: relevanceColor(note.relevance),
                        cursor: savingRelevanceId === note.id ? "default" : "pointer"
                      },
                      title: __("cambiar_relevancia") || "Cambiar relevancia",
                      onClick: () => {
                        if (savingRelevanceId === note.id) return;
                        setEditingRelevanceId(
                          editingRelevanceId === note.id ? null : note.id
                        );
                      },
                      children: "⚑"
                    }
                  ),
                  editingNoteId === note.id ? /* @__PURE__ */ jsx("div", { className: "flex-grow-1", children: /* @__PURE__ */ jsx(
                    TextInput,
                    {
                      value: editForm.title,
                      onChange: (e) => handleEditChange("title", e.target.value),
                      placeholder: __("nota_titulo_placeholder") || "Título de la nota"
                    }
                  ) }) : /* @__PURE__ */ jsx("strong", { children: note.title || __("nota_sin_titulo") || "Nota" })
                ] }),
                /* @__PURE__ */ jsx("small", { className: "text-muted ms-2 text-nowrap", children: note.created_at_formatted }),
                note.is_pinned && /* @__PURE__ */ jsx("span", { className: "badge bg-warning text-dark ms-2", children: __("fijada") || "Fijada" })
              ] }),
              editingRelevanceId === note.id && /* @__PURE__ */ jsx("div", { className: "px-3 pt-2", children: /* @__PURE__ */ jsx("div", { className: "btn-group btn-group-sm", role: "group", children: relevanceOptions.map((opt) => /* @__PURE__ */ jsxs(
                "button",
                {
                  type: "button",
                  className: "btn btn-sm " + (Number(note.relevance) === Number(opt.value) ? "btn-primary" : "btn-outline-secondary"),
                  onClick: () => handleRelevanceChange(note, opt.value),
                  disabled: savingRelevanceId === note.id,
                  children: [
                    /* @__PURE__ */ jsx(
                      "span",
                      {
                        className: "me-1",
                        style: {
                          color: relevanceColor(opt.value),
                          fontSize: "1rem"
                        },
                        children: "⚑"
                      }
                    ),
                    opt.label
                  ]
                },
                opt.value
              )) }) }),
              /* @__PURE__ */ jsxs("div", { className: "card-body", children: [
                editingNoteId === note.id ? /* @__PURE__ */ jsx("div", { className: "mb-2", children: /* @__PURE__ */ jsx(
                  Textarea,
                  {
                    value: editForm.body,
                    onChange: (e) => handleEditChange("body", e.target.value),
                    wysiwyg: true,
                    rows: 6
                  }
                ) }) : note.body ? /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: "mb-2",
                    dangerouslySetInnerHTML: { __html: note.body }
                  }
                ) : /* @__PURE__ */ jsx("p", { className: "text-muted fst-italic mb-2", children: __("nota_sin_contenido") || "Nota sin contenido." }),
                /* @__PURE__ */ jsxs("div", { className: "small text-muted", children: [
                  /* @__PURE__ */ jsxs("span", { children: [
                    __("autor") || "autor",
                    ":",
                    " ",
                    /* @__PURE__ */ jsx("strong", { children: (_a2 = note.owner) == null ? void 0 : _a2.name })
                  ] }),
                  note.remind_at_formatted && /* @__PURE__ */ jsxs(Fragment, { children: [
                    /* @__PURE__ */ jsx("span", { className: "mx-2", children: "·" }),
                    /* @__PURE__ */ jsxs("span", { children: [
                      __("recordar_en_fecha") || "Recordar en",
                      ":",
                      " ",
                      /* @__PURE__ */ jsx("strong", { children: note.remind_at_formatted })
                    ] })
                  ] })
                ] }),
                note.tags && note.tags.length > 0 && /* @__PURE__ */ jsx("div", { className: "mt-2", children: note.tags.map((tag) => /* @__PURE__ */ jsx(
                  "span",
                  {
                    className: "badge bg-light text-dark me-1",
                    children: tag
                  },
                  tag
                )) })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "card-footer d-flex justify-content-end gap-2", children: [
                /* @__PURE__ */ jsx("div", { className: "me-auto", children: editingReminderId === note.id && /* @__PURE__ */ jsx("div", { style: { maxWidth: "260px" }, children: /* @__PURE__ */ jsx(
                  FormDatePickerInput,
                  {
                    name: "remind_at",
                    selected: note.remind_at,
                    onChange: (_, date) => handleReminderChange(note, date),
                    dateFormat: "dd/MM/yyyy",
                    required: false,
                    addon: true,
                    minDate: /* @__PURE__ */ new Date(),
                    maxDate: null,
                    disabled: savingReminderId === note.id
                  }
                ) }) }),
                /* @__PURE__ */ jsxs(
                  "button",
                  {
                    type: "button",
                    className: "btn btn-sm btn-outline-secondary",
                    onClick: () => setEditingReminderId(
                      editingReminderId === note.id ? null : note.id
                    ),
                    disabled: savingReminderId === note.id || savingEditId === note.id,
                    children: [
                      /* @__PURE__ */ jsx("i", { className: "la la-clock me-1" }),
                      note.remind_at_formatted ? note.remind_at_formatted : __("recordatorio") || "Recordatorio"
                    ]
                  }
                ),
                editingNoteId === note.id ? /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      type: "button",
                      className: "btn btn-sm btn-outline-secondary",
                      onClick: cancelEditing,
                      disabled: savingEditId === note.id,
                      children: __("cancelar") || "Cancelar"
                    }
                  ),
                  /* @__PURE__ */ jsxs(
                    "button",
                    {
                      type: "button",
                      className: "btn btn-sm btn-primary",
                      onClick: () => saveEdit(note),
                      disabled: savingEditId === note.id,
                      children: [
                        savingEditId === note.id && /* @__PURE__ */ jsx(
                          "span",
                          {
                            className: "spinner-border spinner-border-sm me-1",
                            role: "status"
                          }
                        ),
                        __("guardar") || "Guardar"
                      ]
                    }
                  )
                ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsxs(
                    "button",
                    {
                      type: "button",
                      className: "btn btn-sm " + (note.is_pinned ? "btn-warning" : "btn-outline-warning"),
                      onClick: () => handleTogglePin(note),
                      disabled: savingPinId === note.id,
                      children: [
                        savingPinId === note.id && /* @__PURE__ */ jsx(
                          "span",
                          {
                            className: "spinner-border spinner-border-sm me-1",
                            role: "status"
                          }
                        ),
                        /* @__PURE__ */ jsx("i", { className: "la la-thumbtack me-1" }),
                        note.is_pinned ? __("desfijar") || "Desfijar" : __("fijar") || "Fijar"
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxs(
                    "button",
                    {
                      type: "button",
                      className: "btn btn-sm btn-outline-primary",
                      onClick: () => startEditing(note),
                      children: [
                        /* @__PURE__ */ jsx("i", { className: "la la-edit me-1" }),
                        __("editar") || "Editar"
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxs(
                    "button",
                    {
                      type: "button",
                      className: "btn btn-sm btn-outline-secondary",
                      onClick: () => handleArchive(note),
                      disabled: savingArchiveId === note.id || deletingId === note.id || savingEditId === note.id,
                      children: [
                        savingArchiveId === note.id && /* @__PURE__ */ jsx(
                          "span",
                          {
                            className: "spinner-border spinner-border-sm me-1",
                            role: "status"
                          }
                        ),
                        /* @__PURE__ */ jsx("i", { className: "la la-archive me-1" }),
                        __("archivar") || "Archivar"
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxs(
                    "button",
                    {
                      type: "button",
                      className: "btn btn-sm btn-outline-danger",
                      onClick: () => handleDelete(note),
                      disabled: deletingId === note.id || savingEditId === note.id,
                      children: [
                        deletingId === note.id && /* @__PURE__ */ jsx(
                          "span",
                          {
                            className: "spinner-border spinner-border-sm me-1",
                            role: "status"
                          }
                        ),
                        /* @__PURE__ */ jsx("i", { className: "la la-trash me-1" }),
                        __("eliminar") || "Eliminar"
                      ]
                    }
                  )
                ] })
              ] })
            ] }, note.id);
          }),
          /* @__PURE__ */ jsxs("div", { ref: loaderRef, className: "text-center py-2", children: [
            loading && notes.length > 0 && /* @__PURE__ */ jsx("div", { className: "d-flex justify-content-center", children: /* @__PURE__ */ jsx(
              "div",
              {
                className: "spinner-border spinner-border-sm text-secondary",
                role: "status",
                children: /* @__PURE__ */ jsx("span", { className: "visually-hidden", children: __("cargando") || "Cargando..." })
              }
            ) }),
            !hasMore && notes.length > 0 && !loading && /* @__PURE__ */ jsx("span", { className: "text-muted small", children: __("notas_no_mas") || "No hay más notas." })
          ] })
        ]
      }
    )
  ] });
}
export {
  UserNotes as default
};
