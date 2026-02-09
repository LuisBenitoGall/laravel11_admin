import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useForm } from "@inertiajs/react";
import { R as ReusableModal } from "./ModalTemplate-BnjBXi9G.js";
import { T as TextInput } from "./TextInput-CzxrbIpp.js";
import { T as Textarea } from "./Textarea-nvTyMSx8.js";
import { S as SelectInput } from "./SelectInput-DrqFt-OA.js";
import { C as Checkbox } from "./Checkbox-C9HPJULq.js";
import { I as InputError } from "./InputError-DME5vguS.js";
import DatePicker from "react-datepicker";
/* empty css                          */
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import axios from "axios";
import "react-draft-wysiwyg";
import "draft-js";
import "html-to-draftjs";
import "draftjs-to-html";
/* empty css                             */
function EventFormModal({ show, onClose, event, scheduleId, schedules, onSaved }) {
  const __ = useTranslation();
  const isEditing = !!event;
  const [selectedScheduleId, setSelectedScheduleId] = useState(scheduleId || null);
  const [startsAt, setStartsAt] = useState((event == null ? void 0 : event.starts_at) ? new Date(event.starts_at) : /* @__PURE__ */ new Date());
  const [endsAt, setEndsAt] = useState((event == null ? void 0 : event.ends_at) ? new Date(event.ends_at) : /* @__PURE__ */ new Date());
  const [allDay, setAllDay] = useState((event == null ? void 0 : event.all_day) || false);
  const [localErrors, setLocalErrors] = useState({});
  const { data, setData, post, put, processing, errors, reset } = useForm({
    title: (event == null ? void 0 : event.title) || "",
    description: (event == null ? void 0 : event.description) || "",
    location: (event == null ? void 0 : event.location) || "",
    starts_at: "",
    ends_at: "",
    all_day: false,
    schedule_id: selectedScheduleId
  });
  useEffect(() => {
    if (event) {
      setStartsAt(new Date(event.starts_at));
      setEndsAt(new Date(event.ends_at));
      setAllDay(event.all_day || false);
      setSelectedScheduleId(event.schedule_id);
      setData({
        title: event.title || "",
        description: event.description || "",
        location: event.location || "",
        schedule_id: event.schedule_id
      });
    } else {
      setStartsAt(/* @__PURE__ */ new Date());
      setEndsAt(new Date(Date.now() + 60 * 60 * 1e3));
      setAllDay(false);
      setSelectedScheduleId(scheduleId || null);
      reset();
    }
  }, [event, scheduleId]);
  useEffect(() => {
    setData("schedule_id", selectedScheduleId);
  }, [selectedScheduleId]);
  useEffect(() => {
    setData("starts_at", startsAt.toISOString());
  }, [startsAt]);
  useEffect(() => {
    setData("ends_at", endsAt.toISOString());
  }, [endsAt]);
  useEffect(() => {
    setData("all_day", allDay);
  }, [allDay]);
  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalErrors({});
    if (!selectedScheduleId) {
      alert(__("agenda_selec"));
      return;
    }
    if (startsAt && endsAt) {
      const startTime = startsAt.getTime();
      const endTime = endsAt.getTime();
      if (endTime < startTime) {
        setLocalErrors({
          ends_at: __("fecha_fin_debe_ser_posterior") || "La fecha/hora de fin no puede ser anterior a la de inicio."
        });
        return;
      }
      if (!allDay) {
        const minMs = 15 * 60 * 1e3;
        if (endTime - startTime < minMs) {
          setLocalErrors({
            ends_at: __("evento_duracion_minima_15") || "La hora de fin debe ser al menos 15 minutos posterior a la de inicio."
          });
          return;
        }
      }
    }
    const url = isEditing ? `/admin/schedule-events/${event.id}` : `/admin/schedules/${selectedScheduleId}/events`;
    const method = isEditing ? "put" : "post";
    axios[method](url, data).then(() => {
      onSaved();
    }).catch((error) => {
      console.error("Error saving event:", error);
    });
  };
  return /* @__PURE__ */ jsx(
    ReusableModal,
    {
      show,
      onClose,
      title: isEditing ? __("evento_editar") : __("evento_nuevo"),
      onConfirm: handleSubmit,
      confirmText: processing ? __("guardando") : __("guardar"),
      cancelText: __("cancelar"),
      confirmDisabled: processing || !selectedScheduleId,
      confirmLoading: processing,
      dialogClassName: "modal-lg",
      children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
        !isEditing && /* @__PURE__ */ jsxs("div", { className: "mb-3", children: [
          /* @__PURE__ */ jsxs("label", { className: "form-label", children: [
            __("agenda"),
            " *"
          ] }),
          /* @__PURE__ */ jsxs(
            SelectInput,
            {
              value: selectedScheduleId || "",
              onChange: (e) => setSelectedScheduleId(parseInt(e.target.value)),
              required: true,
              children: [
                /* @__PURE__ */ jsx("option", { value: "", children: __("agenda_selec") }),
                schedules.map((schedule) => /* @__PURE__ */ jsx("option", { value: schedule.id, children: schedule.name }, schedule.id))
              ]
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors.schedule_id })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mb-3", children: [
          /* @__PURE__ */ jsxs("label", { className: "form-label", children: [
            __("titulo"),
            " *"
          ] }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              name: "title",
              value: data.title,
              onChange: (e) => setData("title", e.target.value),
              required: true,
              isFocused: true
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors.title })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mb-3", children: [
          /* @__PURE__ */ jsx("label", { className: "form-label", children: __("descripcion") }),
          /* @__PURE__ */ jsx(
            Textarea,
            {
              name: "description",
              value: data.description,
              onChange: (e) => setData("description", e.target.value)
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors.description })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mb-3", children: [
          /* @__PURE__ */ jsx("label", { className: "form-label", children: __("ubicacion") }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              name: "location",
              value: data.location,
              onChange: (e) => setData("location", e.target.value)
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors.location })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "mb-3", children: /* @__PURE__ */ jsxs("div", { className: "form-check", children: [
          /* @__PURE__ */ jsx(
            Checkbox,
            {
              checked: allDay,
              onChange: (e) => setAllDay(e.target.checked)
            }
          ),
          /* @__PURE__ */ jsx("label", { className: "form-check-label ms-2", children: __("todo_dia") })
        ] }) }),
        /* @__PURE__ */ jsxs("div", { className: "row", children: [
          /* @__PURE__ */ jsxs("div", { className: "col-md-6 mb-3", children: [
            /* @__PURE__ */ jsxs("label", { className: "form-label", children: [
              __("inicio"),
              " *"
            ] }),
            /* @__PURE__ */ jsx(
              DatePicker,
              {
                selected: startsAt,
                onChange: (date) => setStartsAt(date),
                showTimeSelect: !allDay,
                timeFormat: "HH:mm",
                timeIntervals: 15,
                dateFormat: allDay ? "yyyy-MM-dd" : "yyyy-MM-dd HH:mm",
                className: "form-control",
                required: true
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: errors.starts_at })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "col-md-6 mb-3", children: [
            /* @__PURE__ */ jsxs("label", { className: "form-label", children: [
              __("fin"),
              " *"
            ] }),
            /* @__PURE__ */ jsx(
              DatePicker,
              {
                selected: endsAt,
                onChange: (date) => setEndsAt(date),
                showTimeSelect: !allDay,
                timeFormat: "HH:mm",
                timeIntervals: 15,
                dateFormat: allDay ? "yyyy-MM-dd" : "yyyy-MM-dd HH:mm",
                minDate: startsAt,
                className: "form-control",
                required: true
              }
            ),
            /* @__PURE__ */ jsx(InputError, { message: localErrors.ends_at || errors.ends_at })
          ] })
        ] })
      ] })
    }
  );
}
export {
  EventFormModal as default
};
