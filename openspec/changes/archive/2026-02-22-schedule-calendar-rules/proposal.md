## Why

La agenda actual permite crear eventos sin validar correctamente algunos casos de uso clave:
- usuarios que intentan crear eventos sin tener ninguna agenda configurada
- eventos con rangos de fecha/hora incoherentes (fin antes que inicio o sin duración mínima)

Esto provoca errores de uso, datos inconsistentes y confusión en la interfaz, especialmente cuando se integran flujos externos como Google Calendar.

## What Changes

- Añadir una regla de negocio que impida crear eventos si el usuario no tiene al menos una agenda visible/creable, mostrando un aviso claro mediante SweetAlert.
- Validar en backend y frontend que:
  - la fecha/hora de finalización de un evento nunca puede ser anterior a la de inicio
  - debe existir al menos un intervalo mínimo de 15 minutos entre inicio y fin.
- Unificar los mensajes de error/alerta en la UI para estos casos de validación.

## Capabilities

### New Capabilities
- `schedule-calendar-rules`: Reglas de negocio y validaciones para la creación de eventos de agenda (existencia de agenda, coherencia de fechas/horas e intervalo mínimo).

### Modified Capabilities
- `schedule`: Ajustes en el flujo de creación/edición de eventos para aplicar las nuevas reglas de negocio de calendario (sin cambiar otros comportamientos funcionales existentes).

## Impact

- Controladores y requests relacionados con `ScheduleEvent` (validaciones de fechas y horarios).
- Componentes de frontend de la agenda (vista de calendario y formularios de creación/edición de eventos) para mostrar mensajes de error y SweetAlert cuando no existan agendas.
- Posible ajuste en tests existentes de la agenda y nuevos tests de validación para eventos.

