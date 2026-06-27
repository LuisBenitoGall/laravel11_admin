import { jsx, jsxs } from "react/jsx-runtime";
import { useEffect } from "react";
import { useForm } from "@inertiajs/react";
import { R as ReusableModal } from "./ModalTemplate-BiHkGcpB.js";
import { T as TextInput } from "./TextInput-CzxrbIpp.js";
import { T as Textarea } from "./Textarea-DTcfyFQ1.js";
import { C as ColorPicker } from "./ColorPicker-Q_PgaUn1.js";
import { C as Checkbox } from "./Checkbox-C9HPJULq.js";
import { I as InputError } from "./InputError-DME5vguS.js";
import { u as useTranslation } from "./useTranslation-Nsy_Cpi1.js";
import "react-draft-wysiwyg";
import "draft-js";
import "html-to-draftjs";
import "draftjs-to-html";
/* empty css                             */
import "react-color";
function ScheduleFormModal({ show, onClose, schedule, onSaved }) {
  const __ = useTranslation();
  const isEditing = !!schedule;
  const { data, setData, post, put, processing, errors, reset } = useForm({
    name: (schedule == null ? void 0 : schedule.name) || "",
    description: (schedule == null ? void 0 : schedule.description) || "",
    color: (schedule == null ? void 0 : schedule.color) || "#3788d8",
    status: (schedule == null ? void 0 : schedule.status) !== void 0 ? schedule.status : true,
    google_calendar_id: (schedule == null ? void 0 : schedule.google_calendar_id) || ""
  });
  useEffect(() => {
    if (schedule) {
      setData({
        name: schedule.name || "",
        description: schedule.description || "",
        color: schedule.color || "#3788d8",
        status: schedule.status !== void 0 ? schedule.status : true,
        google_calendar_id: schedule.google_calendar_id || ""
      });
    } else {
      reset();
    }
  }, [schedule]);
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      put(route("schedules.update", schedule.id), {
        preserveScroll: true,
        onSuccess: () => {
          onSaved();
        }
      });
    } else {
      post(route("schedules.store"), {
        preserveScroll: true,
        onSuccess: () => {
          onSaved();
        }
      });
    }
  };
  return /* @__PURE__ */ jsx(
    ReusableModal,
    {
      show,
      onClose,
      title: isEditing ? __("agenda_editar") : __("agenda_nueva"),
      onConfirm: handleSubmit,
      confirmText: processing ? __("guardando") : __("guardar"),
      cancelText: __("cancelar"),
      confirmDisabled: processing,
      confirmLoading: processing,
      children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit, children: [
        /* @__PURE__ */ jsxs("div", { className: "mb-3", children: [
          /* @__PURE__ */ jsxs("label", { className: "form-label", children: [
            __("nombre"),
            " *"
          ] }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              name: "name",
              value: data.name,
              onChange: (e) => setData("name", e.target.value),
              required: true,
              isFocused: true
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors.name })
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
          /* @__PURE__ */ jsx("label", { className: "form-label", children: __("color") }),
          /* @__PURE__ */ jsx(
            ColorPicker,
            {
              name: "color",
              value: data.color,
              onChange: (e) => setData("color", e.target.value)
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors.color })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mb-3", children: [
          /* @__PURE__ */ jsx("label", { className: "form-label", children: __("google_calendar_id") || "ID calendario Google" }),
          /* @__PURE__ */ jsx(
            TextInput,
            {
              name: "google_calendar_id",
              value: data.google_calendar_id,
              onChange: (e) => setData("google_calendar_id", e.target.value),
              placeholder: "primary o email@group.calendar.google.com"
            }
          ),
          /* @__PURE__ */ jsx(InputError, { message: errors.google_calendar_id })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mb-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "form-check", children: [
            /* @__PURE__ */ jsx(
              Checkbox,
              {
                name: "status",
                checked: data.status,
                onChange: (e) => setData("status", e.target.checked)
              }
            ),
            /* @__PURE__ */ jsx("label", { className: "form-check-label ms-2", children: __("activo") })
          ] }),
          /* @__PURE__ */ jsx(InputError, { message: errors.status })
        ] })
      ] })
    }
  );
}
export {
  ScheduleFormModal as default
};
