## Context

La agenda (`Schedule` + `ScheduleEvent`) ya permite crear y gestionar eventos desde el frontend (vista de calendario con FullCalendar y formularios de evento) y desde el backend mediante controladores y form requests. Actualmente:
- se pueden abrir formularios de evento incluso cuando no hay ninguna agenda creada para el usuario/empresa
- las validaciones de fechas/horas permiten casos incoherentes (fin antes de inicio o sin duración mínima clara)

La integración con Google Calendar y otros flujos hace más visible la necesidad de reglas de negocio claras para la creación de eventos.

## Goals / Non-Goals

**Goals:**
- Evitar que se creen eventos si no existe al menos una agenda para el usuario/empresa actual, mostrando un aviso amigable.
- Validar en backend (y reflejar en frontend) que:
  - la fecha de fin no puede ser anterior a la fecha de inicio
  - la hora de fin debe ser posterior a la de inicio con un mínimo de 15 minutos de diferencia para eventos con hora.
- Reutilizar patrones existentes de SweetAlert y validaciones para mantener coherencia de UX.

**Non-Goals:**
- No se van a modificar otros comportamientos de la agenda (permisos, colores, roles de acceso, etc.).
- No se va a cambiar el modelo de datos de `Schedule` o `ScheduleEvent` más allá de validaciones.
- No se van a introducir reglas específicas para integración con Google (se aplican las mismas validaciones a todos los eventos).

## Decisions

### D1: Bloquear creación de eventos sin agendas usando SweetAlert
- **Decisión:** Antes de permitir abrir/guardar un evento, el frontend comprobará si existen agendas seleccionables para el usuario. Si no existen, se mostrará un SweetAlert con el mensaje `debes crear una agenda antes de guardar eventos` y no se abrirá/guardará el evento.
- **Alternativas:** Devolver un 4xx desde backend y dejar que el formulario falle silenciosamente; permitir crear eventos “huérfanos”. Se descartan por peor UX y riesgo de datos inconsistentes.

### D2: Validación de fechas/hora en backend
- **Decisión:** Añadir reglas de validación en el `FormRequest` de creación/edición de eventos (`ScheduleEventStoreRequest`/`ScheduleEventUpdateRequest`) para:
  - impedir que `ends_at` sea anterior a `starts_at`
  - para eventos con hora (no `all_day`), exigir que la diferencia entre `starts_at` y `ends_at` sea al menos de 15 minutos.
- **Alternativas:** Validar solo en frontend. Se descarta para evitar bypasses por API o errores de cliente.

### D3: Reflejo de errores en frontend
- **Decisión:** Reutilizar el patrón existente de manejo de errores de validación en los formularios de evento: mostrar mensajes bajo los campos correspondientes y/o notificaciones genéricas, manteniendo consistencia con el resto del módulo.

## Risks / Trade-offs

- **Risk:** Usuarios que antes guardaban eventos “rápidos” con fin igual a inicio verán ahora errores.
  - **Mitigación:** Mensajes claros indicando la regla de 15 minutos y posibilidad de ajustar por defecto el fin automáticamente en el frontend.
- **Risk:** Lógica duplicada entre frontend (para UX inmediata) y backend (validación fuerte).
  - **Mitigación:** Mantener las reglas de negocio canónicas en backend y usar el frontend solo como ayuda al usuario.


