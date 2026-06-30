import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { A as AdminAuthenticated } from "./AdminAuthenticatedLayout-C5syfI8B.js";
import { usePage, Head, router } from "@inertiajs/react";
import { useState, useEffect, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";
import interactionPlugin from "@fullcalendar/interaction";
import axios from "axios";
import esLocale from "@fullcalendar/core/locales/es";
import caLocale from "@fullcalendar/core/locales/ca";
import enLocale from "@fullcalendar/core/locales/en-gb";
import { C as Checkbox } from "./Checkbox-C9HPJULq.js";
import { R as ReusableModal } from "./ModalTemplate-BiHkGcpB.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import { u as useCompanySession } from "./Sidebar-DgixJBon.js";
import { u as useSweetAlert } from "./useSweetAlert-D4PAsWYN.js";
import ScheduleFormModal from "./ScheduleFormModal-9_xHMOXK.js";
import AuthorizedUsersModal from "./AuthorizedUsersModal-CfhW5fhj.js";
import EventFormModal from "./EventFormModal-Dg2KLJOW.js";
import "./Header-BFeBcT5X.js";
import "@inertiajs/inertia";
import "react-bootstrap";
import "sweetalert2";
import "./Dropdown-DLZR1XDp.js";
import "@headlessui/react";
import "./TextInput-CzxrbIpp.js";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import "./NavLink-k73-0cwm.js";
import "./Textarea-DTcfyFQ1.js";
import "react-draft-wysiwyg";
import "draft-js";
import "html-to-draftjs";
import "draftjs-to-html";
/* empty css                             */
import "./ColorPicker-Q_PgaUn1.js";
import "react-color";
import "./InputError-DME5vguS.js";
import "./UserSearch-Bn5gVs5d.js";
import "./SelectInput-BpRRLwUE.js";
import "react-datepicker";
/* empty css                          */
function Index({
  title,
  subtitle,
  module,
  slug,
  schedules = [],
  permissions = []
}) {
  var _a, _b, _c, _d, _e, _f;
  const __ = useTranslation();
  const { currentCompany } = useCompanySession();
  const { showConfirm } = useSweetAlert();
  const page = usePage();
  const auth = ((_a = page == null ? void 0 : page.props) == null ? void 0 : _a.auth) || {};
  const userId = (_b = auth == null ? void 0 : auth.user) == null ? void 0 : _b.id;
  const locale = ((_c = page == null ? void 0 : page.props) == null ? void 0 : _c.locale) || "es";
  const calendarLocales = {
    "es": esLocale,
    "ca": caLocale,
    "en": enLocale
  };
  const calendarLocale = calendarLocales[locale] || esLocale;
  const [selectedScheduleIds, setSelectedScheduleIds] = useState([]);
  const [events, setEvents] = useState([]);
  const [calendarApi, setCalendarApi] = useState(null);
  const [currentView, setCurrentView] = useState("dayGridMonth");
  const [loading, setLoading] = useState(false);
  const [currentDateRange, setCurrentDateRange] = useState({ start: null, end: null });
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showAuthorizedUsersModal, setShowAuthorizedUsersModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [selectedScheduleForEvent, setSelectedScheduleForEvent] = useState(null);
  useEffect(() => {
    if ((currentCompany == null ? void 0 : currentCompany.id) && userId) {
      const storageKey = `schedule_selection_${currentCompany.id}_${userId}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setSelectedScheduleIds(parsed);
          }
        } catch (e) {
          console.error("Error parsing saved schedule selection:", e);
        }
      }
    }
  }, [currentCompany == null ? void 0 : currentCompany.id, userId]);
  useEffect(() => {
    if ((currentCompany == null ? void 0 : currentCompany.id) && userId && selectedScheduleIds.length >= 0) {
      const storageKey = `schedule_selection_${currentCompany.id}_${userId}`;
      localStorage.setItem(storageKey, JSON.stringify(selectedScheduleIds));
    }
  }, [selectedScheduleIds, currentCompany == null ? void 0 : currentCompany.id, userId]);
  const fetchEvents = useCallback(async (start, end) => {
    if (selectedScheduleIds.length === 0) {
      setEvents([]);
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get("/admin/schedule-events", {
        params: {
          start: start.toISOString(),
          end: end.toISOString(),
          schedule_ids: selectedScheduleIds
        }
      });
      setEvents(response.data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [selectedScheduleIds]);
  const handleDatesSet = useCallback((arg) => {
    setCurrentDateRange({ start: arg.start, end: arg.end });
    fetchEvents(arg.start, arg.end);
  }, [fetchEvents]);
  useEffect(() => {
    if (calendarApi) {
      const view = calendarApi.view;
      fetchEvents(view.activeStart, view.activeEnd);
    }
  }, [selectedScheduleIds, calendarApi, fetchEvents]);
  const toggleSchedule = (scheduleId) => {
    setSelectedScheduleIds((prev) => {
      if (prev.includes(scheduleId)) {
        return prev.filter((id) => id !== scheduleId);
      } else {
        return [...prev, scheduleId];
      }
    });
  };
  const [showGoogleCalendarModal, setShowGoogleCalendarModal] = useState(false);
  const [googleCalendarLoading, setGoogleCalendarLoading] = useState(false);
  const [googleCalendarSyncLoading, setGoogleCalendarSyncLoading] = useState(false);
  const [googleCalendarConnected, setGoogleCalendarConnected] = useState(false);
  const [googleCalendarEmail, setGoogleCalendarEmail] = useState("");
  const [googleCalendarLastSync, setGoogleCalendarLastSync] = useState(null);
  const isGmailAddress = (email) => {
    if (!email) return false;
    const e = String(email).toLowerCase().trim();
    return e.endsWith("@gmail.com") || e.endsWith("@googlemail.com");
  };
  const getDefaultGoogleEmail = () => {
    var _a2;
    const userEmail = ((_a2 = auth == null ? void 0 : auth.user) == null ? void 0 : _a2.email) || "";
    return isGmailAddress(userEmail) ? userEmail : "";
  };
  const fetchGoogleCalendarStatus = useCallback(async () => {
    setGoogleCalendarLoading(true);
    try {
      const url = typeof route === "function" ? route("admin.integrations.google.status") : "/admin/integrations/google/status";
      const res = await axios.get(url);
      const data = (res == null ? void 0 : res.data) || {};
      setGoogleCalendarConnected(!!data.connected);
      setGoogleCalendarEmail(data.email || getDefaultGoogleEmail());
      setGoogleCalendarLastSync(data.last_synced_at || null);
    } catch (e) {
      setGoogleCalendarConnected(false);
      setGoogleCalendarEmail(getDefaultGoogleEmail());
      setGoogleCalendarLastSync(null);
    } finally {
      setGoogleCalendarLoading(false);
    }
  }, [(_d = auth == null ? void 0 : auth.user) == null ? void 0 : _d.email]);
  useEffect(() => {
    fetchGoogleCalendarStatus();
  }, [fetchGoogleCalendarStatus, currentCompany == null ? void 0 : currentCompany.id]);
  const handleNewSchedule = () => {
    setEditingSchedule(null);
    setShowScheduleModal(true);
  };
  const handleEditSchedule = (schedule) => {
    setEditingSchedule(schedule);
    setShowScheduleModal(true);
  };
  const handleManageUsers = (schedule) => {
    setEditingSchedule(schedule);
    setShowAuthorizedUsersModal(true);
  };
  const handleNewEvent = (arg) => {
    if (!schedules || schedules.length === 0) {
      showConfirm({
        title: __("error"),
        text: __("debes_crear_agenda_antes_eventos") || "Debes crear una agenda antes de guardar eventos.",
        icon: "warning",
        onConfirm: () => {
        }
      });
      return;
    }
    const start = arg == null ? void 0 : arg.start;
    if (start) {
      const now = /* @__PURE__ */ new Date();
      now.setHours(0, 0, 0, 0);
      const startDate = new Date(start);
      startDate.setHours(0, 0, 0, 0);
      if (startDate < now) {
        showConfirm({
          title: __("error"),
          text: __("evento_prohibido_fecha_pasada") || __("No se pueden crear eventos en fechas pasadas"),
          icon: "error",
          onConfirm: () => {
          }
        });
        return;
      }
    }
    (arg == null ? void 0 : arg.end) || (start ? new Date(start.getTime() + 60 * 60 * 1e3) : null);
    if (selectedScheduleIds.length === 1) {
      setSelectedScheduleForEvent(selectedScheduleIds[0]);
    } else {
      setSelectedScheduleForEvent(null);
    }
    setEditingEvent(null);
    setShowEventModal(true);
  };
  const handleEditEvent = (eventInfo) => {
    var _a2, _b2, _c2;
    const event = eventInfo.event;
    setEditingEvent({
      id: event.id,
      title: event.title,
      description: ((_a2 = event.extendedProps) == null ? void 0 : _a2.description) || "",
      location: ((_b2 = event.extendedProps) == null ? void 0 : _b2.location) || "",
      starts_at: event.start,
      ends_at: event.end,
      all_day: event.allDay,
      schedule_id: (_c2 = event.extendedProps) == null ? void 0 : _c2.schedule_id
    });
    setShowEventModal(true);
  };
  const handleConnectGoogleCalendar = async () => {
    setShowGoogleCalendarModal(true);
    await fetchGoogleCalendarStatus();
  };
  const closeGoogleCalendarModal = () => {
    setShowGoogleCalendarModal(false);
  };
  const doGoogleConnect = () => {
    const url = typeof route === "function" ? route("admin.integrations.google.connect") : "/admin/integrations/google/connect";
    window.location.href = url;
  };
  const doGoogleDisconnect = () => {
    showConfirm({
      title: __("google_desconectar") || "Desconectar Google Calendar",
      text: __("google_desconectar_confirm") || "Se desactivará la conexión de tu usuario con Google Calendar.",
      icon: "warning",
      onConfirm: async () => {
        setGoogleCalendarLoading(true);
        try {
          const url = typeof route === "function" ? route("admin.integrations.google.disconnect") : "/admin/integrations/google/disconnect";
          await axios.post(url);
          setGoogleCalendarConnected(false);
          setGoogleCalendarLastSync(null);
        } catch (e) {
          console.error(e);
        } finally {
          setGoogleCalendarLoading(false);
        }
      }
    });
  };
  const toggleGoogleCalendarConnection = () => {
    if (googleCalendarConnected) {
      doGoogleDisconnect();
    } else {
      doGoogleConnect();
    }
  };
  const doGoogleSync = useCallback(async () => {
    var _a2, _b2;
    if (!googleCalendarConnected) return;
    const url = typeof route === "function" ? route("admin.integrations.google.sync") : "/admin/integrations/google/sync";
    setGoogleCalendarSyncLoading(true);
    try {
      await axios.post(url);
      await fetchGoogleCalendarStatus();
      if (((_a2 = calendarApi == null ? void 0 : calendarApi.view) == null ? void 0 : _a2.activeStart) && ((_b2 = calendarApi == null ? void 0 : calendarApi.view) == null ? void 0 : _b2.activeEnd)) {
        fetchEvents(calendarApi.view.activeStart, calendarApi.view.activeEnd);
      }
    } catch (e) {
      console.error("Error sincronizando con Google Calendar:", e);
    } finally {
      setGoogleCalendarSyncLoading(false);
    }
  }, [googleCalendarConnected, calendarApi, fetchGoogleCalendarStatus, fetchEvents]);
  const closeScheduleModal = () => {
    setShowScheduleModal(false);
    setEditingSchedule(null);
  };
  const closeAuthorizedUsersModal = () => {
    setShowAuthorizedUsersModal(false);
    setEditingSchedule(null);
  };
  const closeEventModal = () => {
    setShowEventModal(false);
    setEditingEvent(null);
    setSelectedScheduleForEvent(null);
  };
  const handleScheduleSaved = () => {
    closeScheduleModal();
    router.reload({ only: ["schedules"] });
  };
  const handleDeleteSchedule = (schedule) => {
    showConfirm({
      title: __("agenda_eliminar") || __("agenda_eliminar"),
      text: __("agenda_eliminar_confirm") ? __("agenda_eliminar_confirm", { name: schedule.name }) : __("seguro_eliminar_agenda", { name: schedule.name }) || __("seguro_eliminar_agenda") || `${__("seguro_eliminar")} "${schedule.name}"?`,
      icon: "warning",
      onConfirm: () => {
        router.delete(route("schedules.destroy", schedule.id), {
          preserveScroll: true,
          onSuccess: () => {
            router.reload({ only: ["schedules"] });
          }
        });
      }
    });
  };
  const handleEventSaved = () => {
    closeEventModal();
    if (calendarApi) {
      const view = calendarApi.view;
      setCurrentDateRange({ start: view.activeStart, end: view.activeEnd });
      fetchEvents(view.activeStart, view.activeEnd);
    }
  };
  const capitalizeFirst = (str) => {
    if (!str || typeof str !== "string") return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  const formatCurrentDate = () => {
    if (!currentDateRange.start || !currentDateRange.end) {
      return (/* @__PURE__ */ new Date()).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });
    }
    const { start, end } = currentDateRange;
    const localeMap = {
      "es": "es-ES",
      "ca": "ca-ES",
      "en": "en-GB"
    };
    const dateLocale = localeMap[locale] || "es-ES";
    if (currentView === "dayGridMonth") {
      const midTime = (start.getTime() + end.getTime()) / 2;
      const midDate = new Date(midTime);
      const formatted = midDate.toLocaleDateString(dateLocale, {
        month: "long",
        year: "numeric"
      });
      return capitalizeFirst(formatted);
    }
    if (currentView === "timeGridDay") {
      return start.toLocaleDateString(dateLocale, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });
    }
    if (currentView === "timeGridWeek" || currentView === "listWeek") {
      const startFormatted = start.toLocaleDateString(dateLocale, {
        day: "2-digit",
        month: "2-digit"
      });
      const endFormatted = end.toLocaleDateString(dateLocale, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      });
      return `${startFormatted} - ${endFormatted}`;
    }
    return (/* @__PURE__ */ new Date()).toLocaleDateString(dateLocale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  };
  const actions = [];
  if (permissions == null ? void 0 : permissions["schedules.create"]) {
    actions.push({
      text: __("agenda_nueva"),
      icon: "la-plus",
      url: "",
      modal: true,
      onClick: handleNewSchedule
    });
  }
  actions.push({
    text: googleCalendarConnected ? __("google_desconectar") || "Google: desconectar" : __("google_conectar") || "Google: conectar",
    icon: googleCalendarConnected ? "la-unlink" : "la-google",
    url: "",
    modal: true,
    onClick: handleConnectGoogleCalendar
  });
  return /* @__PURE__ */ jsxs(
    AdminAuthenticated,
    {
      user: auth == null ? void 0 : auth.user,
      title,
      subtitle,
      actions,
      children: [
        /* @__PURE__ */ jsx(Head, { title }),
        /* @__PURE__ */ jsx("div", { className: "contents", children: /* @__PURE__ */ jsxs("div", { className: "row pt-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "col-md-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "card", children: [
              /* @__PURE__ */ jsx("div", { className: "card-header d-flex justify-content-between align-items-center", style: { height: "41.85px" }, children: /* @__PURE__ */ jsx("h5", { className: "mb-0", children: __("agendas") }) }),
              /* @__PURE__ */ jsx("div", { className: "card-body", children: schedules.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-muted", children: __("agendas_0") }) : /* @__PURE__ */ jsx("div", { className: "list-group", children: schedules.map((schedule) => {
                var _a2, _b2, _c2, _d2;
                return /* @__PURE__ */ jsxs("div", { className: "list-group-item", children: [
                  /* @__PURE__ */ jsxs("div", { className: "d-flex align-items-center mb-2", children: [
                    /* @__PURE__ */ jsx(
                      Checkbox,
                      {
                        checked: selectedScheduleIds.includes(schedule.id),
                        onChange: () => toggleSchedule(schedule.id),
                        className: "me-2",
                        size: "lg"
                      }
                    ),
                    /* @__PURE__ */ jsx(
                      "div",
                      {
                        className: "me-2 mt-1",
                        style: {
                          width: "16px",
                          height: "16px",
                          backgroundColor: schedule.color || "#3788d8",
                          borderRadius: "50%"
                        }
                      }
                    ),
                    /* @__PURE__ */ jsx("span", { className: "flex-grow-1", children: schedule.name })
                  ] }),
                  (((_a2 = schedule.can) == null ? void 0 : _a2.update) || ((_b2 = schedule.can) == null ? void 0 : _b2.manageAuthorizedUsers) || (permissions == null ? void 0 : permissions["schedules.destroy"]) && schedule.owner_id === userId) && /* @__PURE__ */ jsxs("div", { className: "d-flex gap-1 mt-2", children: [
                    ((_c2 = schedule.can) == null ? void 0 : _c2.update) && /* @__PURE__ */ jsx(
                      "button",
                      {
                        className: "btn btn-sm btn-outline-primary",
                        onClick: () => handleEditSchedule(schedule),
                        title: __("editar"),
                        children: /* @__PURE__ */ jsx("i", { className: "la la-edit" })
                      }
                    ),
                    ((_d2 = schedule.can) == null ? void 0 : _d2.manageAuthorizedUsers) && /* @__PURE__ */ jsx(
                      "button",
                      {
                        className: "btn btn-sm btn-outline-secondary",
                        onClick: () => handleManageUsers(schedule),
                        title: __("usuarios_autorizados"),
                        children: /* @__PURE__ */ jsx("i", { className: "la la-users" })
                      }
                    ),
                    (permissions == null ? void 0 : permissions["schedules.destroy"]) && schedule.owner_id === userId && /* @__PURE__ */ jsx(
                      "button",
                      {
                        className: "btn btn-sm btn-outline-danger",
                        onClick: () => handleDeleteSchedule(schedule),
                        title: __("eliminar"),
                        children: /* @__PURE__ */ jsx("i", { className: "la la-trash" })
                      }
                    )
                  ] })
                ] }, schedule.id);
              }) }) })
            ] }),
            selectedScheduleIds.length === 0 && /* @__PURE__ */ jsxs("div", { className: "alert alert-info mt-3 mx-0", children: [
              /* @__PURE__ */ jsx("i", { className: "la la-info-circle" }),
              " ",
              __("agenda_selec_texto")
            ] })
          ] }),
          /* @__PURE__ */ jsx("div", { className: "col-md-9", children: /* @__PURE__ */ jsxs("div", { className: "card", children: [
            /* @__PURE__ */ jsxs("div", { className: "card-header d-flex justify-content-between align-items-center", children: [
              /* @__PURE__ */ jsxs("div", { className: "btn-group", role: "group", children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    className: `btn btn-sm ${currentView === "dayGridMonth" ? "btn-primary" : "btn-outline-primary"}`,
                    onClick: () => {
                      calendarApi == null ? void 0 : calendarApi.changeView("dayGridMonth");
                      setCurrentView("dayGridMonth");
                    },
                    children: __("mes")
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    className: `btn btn-sm ${currentView === "timeGridWeek" ? "btn-primary" : "btn-outline-primary"}`,
                    onClick: () => {
                      calendarApi == null ? void 0 : calendarApi.changeView("timeGridWeek");
                      setCurrentView("timeGridWeek");
                    },
                    children: __("semana")
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    className: `btn btn-sm ${currentView === "timeGridDay" ? "btn-primary" : "btn-outline-primary"}`,
                    onClick: () => {
                      calendarApi == null ? void 0 : calendarApi.changeView("timeGridDay");
                      setCurrentView("timeGridDay");
                    },
                    children: __("dia")
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    className: `btn btn-sm ${currentView === "listWeek" ? "btn-primary" : "btn-outline-primary"}`,
                    onClick: () => {
                      calendarApi == null ? void 0 : calendarApi.changeView("listWeek");
                      setCurrentView("listWeek");
                    },
                    children: __("lista")
                  }
                )
              ] }),
              /* @__PURE__ */ jsx("div", { className: "flex-grow-1 text-center", children: /* @__PURE__ */ jsx("span", { className: "fw-semibold", children: formatCurrentDate() }) }),
              /* @__PURE__ */ jsxs("div", { className: "d-flex gap-1", children: [
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    className: "btn btn-sm btn-outline-secondary",
                    onClick: () => {
                      calendarApi == null ? void 0 : calendarApi.prev();
                      setTimeout(() => {
                        if (calendarApi) {
                          const view = calendarApi.view;
                          setCurrentDateRange({ start: view.activeStart, end: view.activeEnd });
                        }
                      }, 100);
                    },
                    title: __("anterior"),
                    children: /* @__PURE__ */ jsx("i", { className: "la la-chevron-left" })
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    className: "btn btn-sm btn-outline-secondary mx-2",
                    onClick: () => {
                      calendarApi == null ? void 0 : calendarApi.today();
                      setTimeout(() => {
                        if (calendarApi) {
                          const view = calendarApi.view;
                          setCurrentDateRange({ start: view.activeStart, end: view.activeEnd });
                        }
                      }, 100);
                    },
                    children: __("hoy")
                  }
                ),
                /* @__PURE__ */ jsx(
                  "button",
                  {
                    className: "btn btn-sm btn-outline-secondary",
                    onClick: () => {
                      calendarApi == null ? void 0 : calendarApi.next();
                      setTimeout(() => {
                        if (calendarApi) {
                          const view = calendarApi.view;
                          setCurrentDateRange({ start: view.activeStart, end: view.activeEnd });
                        }
                      }, 100);
                    },
                    title: __("siguiente") || __("siguiente"),
                    children: /* @__PURE__ */ jsx("i", { className: "la la-chevron-right" })
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "card-body", children: [
              loading && /* @__PURE__ */ jsx("div", { className: "text-center py-3", children: /* @__PURE__ */ jsx("div", { className: "spinner-border", role: "status", children: /* @__PURE__ */ jsx("span", { className: "visually-hidden", children: __("cargando") }) }) }),
              /* @__PURE__ */ jsx(
                FullCalendar,
                {
                  plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
                  initialView: "dayGridMonth",
                  headerToolbar: false,
                  height: "auto",
                  events,
                  editable: false,
                  selectable: true,
                  selectMirror: true,
                  dayMaxEvents: true,
                  weekends: true,
                  locale: calendarLocale,
                  buttonText: {
                    today: __("hoy"),
                    month: __("mes"),
                    week: __("semana"),
                    day: __("dia"),
                    list: __("lista")
                  },
                  select: handleNewEvent,
                  eventClick: handleEditEvent,
                  datesSet: handleDatesSet,
                  ref: (ref) => {
                    if (ref) {
                      setCalendarApi(ref.getApi());
                    }
                  },
                  eventContent: (eventInfo) => {
                    var _a2;
                    const color = ((_a2 = eventInfo.event.extendedProps) == null ? void 0 : _a2.schedule_color) || "#3788d8";
                    return /* @__PURE__ */ jsx("div", { style: { backgroundColor: color, color: "white", padding: "2px 4px", borderRadius: "3px" }, children: eventInfo.event.title });
                  }
                }
              )
            ] })
          ] }) })
        ] }) }),
        /* @__PURE__ */ jsx(
          ScheduleFormModal,
          {
            show: showScheduleModal,
            onClose: closeScheduleModal,
            schedule: editingSchedule,
            onSaved: handleScheduleSaved
          }
        ),
        /* @__PURE__ */ jsx(
          AuthorizedUsersModal,
          {
            show: showAuthorizedUsersModal,
            onClose: closeAuthorizedUsersModal,
            schedule: editingSchedule,
            onSaved: handleScheduleSaved
          }
        ),
        /* @__PURE__ */ jsx(
          EventFormModal,
          {
            show: showEventModal,
            onClose: closeEventModal,
            event: editingEvent,
            scheduleId: selectedScheduleForEvent || (editingEvent == null ? void 0 : editingEvent.schedule_id),
            schedules,
            onSaved: handleEventSaved
          }
        ),
        /* @__PURE__ */ jsxs(
          ReusableModal,
          {
            show: showGoogleCalendarModal,
            onClose: closeGoogleCalendarModal,
            title: __("google_calendar") || "Google Calendar",
            cancelText: __("cancelar") || "Cancelar",
            onConfirm: toggleGoogleCalendarConnection,
            confirmText: googleCalendarConnected ? __("google_desconectar") || "Desconectar" : __("google_conectar") || "Conectar a Google",
            confirmIcon: googleCalendarConnected ? "la-unlink" : "la-google",
            confirmClassName: googleCalendarConnected ? "btn-danger" : "btn-primary",
            confirmLoading: googleCalendarLoading,
            confirmDisabled: googleCalendarSyncLoading,
            footerLeft: googleCalendarConnected ? /* @__PURE__ */ jsx(
              "button",
              {
                type: "button",
                className: "btn btn-outline-primary btn-sm",
                onClick: doGoogleSync,
                disabled: googleCalendarLoading || googleCalendarSyncLoading,
                children: googleCalendarSyncLoading ? /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx("span", { className: "spinner-border spinner-border-sm me-1", role: "status", "aria-hidden": "true" }),
                  __("procesando") || "Procesando"
                ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
                  /* @__PURE__ */ jsx("i", { className: "la la-sync me-1" }),
                  __("sincronizar_ahora") || "Sincronizar ahora"
                ] })
              }
            ) : null,
            children: [
              /* @__PURE__ */ jsxs("div", { className: "mb-3", children: [
                /* @__PURE__ */ jsxs("div", { className: `alert ${googleCalendarConnected ? "alert-success" : "alert-secondary"} mb-2 mx-0`, children: [
                  /* @__PURE__ */ jsx("i", { className: `la ${googleCalendarConnected ? "la-check-circle" : "la-info-circle"}` }),
                  " ",
                  googleCalendarConnected ? __("google_conectado") || "Conectado con Google Calendar" : __("google_no_conectado") || "No hay conexión activa con Google Calendar"
                ] }),
                googleCalendarLastSync && /* @__PURE__ */ jsxs("div", { className: "text-muted small", children: [
                  __("ultima_sync") || "Última sincronización",
                  ": ",
                  googleCalendarLastSync
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "mb-3", children: [
                /* @__PURE__ */ jsx("label", { className: "form-label", children: __("email") || "Email" }),
                /* @__PURE__ */ jsx(
                  "input",
                  {
                    type: "email",
                    className: "form-control",
                    value: googleCalendarEmail,
                    onChange: (e) => setGoogleCalendarEmail(e.target.value),
                    placeholder: __("email_google_placeholder") || "tuemail@gmail.com",
                    disabled: isGmailAddress((_e = auth == null ? void 0 : auth.user) == null ? void 0 : _e.email)
                  }
                ),
                /* @__PURE__ */ jsx("div", { className: "form-text", children: isGmailAddress((_f = auth == null ? void 0 : auth.user) == null ? void 0 : _f.email) ? __("email_autocompletado_gmail") || "Se usa el email Gmail de tu usuario." : __("email_google_info") || "Este campo es informativo: Google te pedirá iniciar sesión para autorizar la conexión." })
              ] })
            ]
          }
        )
      ]
    }
  );
}
export {
  Index as default
};
