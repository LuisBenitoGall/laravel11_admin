# Design: Conectar agenda con Google Calendar

## Context

- La agenda usa `Schedule` (agendas) y `ScheduleEvent` (eventos). Existe `GoogleCalendarIntegration` por usuario/empresa con tokens OAuth; el flujo connect/callback ya está implementado. El frontend tiene modal de Google Calendar que llama a `admin.integrations.google.status`, `.connect` y `.disconnect`; los dos últimos no existen o no tienen el nombre esperado, y la sincronización de eventos no está implementada.

## Reglas de sincronización (acordadas)

1. **Granularidad**: Una conexión por usuario (Opción A). Un OAuth por usuario; el usuario puede elegir uno o varios calendarios de su cuenta para sincronizar.
2. **Mapeo agenda ↔ Google**: Un calendario Google por Schedule (Opción B). Cada Schedule puede tener un `google_calendar_id` (o "primary"); lectura/escritura por agenda.
3. **Conflictos**: Última modificación gana (comparar `updated_at` local con fecha de modificación del evento en Google).
4. **Identificación**: En `schedule_events` se guardan `google_event_id` y `google_calendar_id` (migración y modelo ya actualizados) para no duplicar y poder actualizar/borrar en Google.
5. **Frecuencia**: Sincronización manual (botón "Sincronizar ahora"); opcional cron más adelante.

## Goals / Non-Goals

**Goals:**

- Endpoints status y disconnect bajo admin con nombres que coincidan con el frontend.
- Mapeo Schedule → google_calendar_id (campo en `schedules` o en integración; decidir si cada Schedule tiene un calendar_id o se elige un calendario por defecto para el usuario).
- Sincronización bidireccional: leer eventos de Google (por calendar_id) y mostrarlos/persistirlos en `schedule_events`; al crear/editar/borrar evento en la app, crear/actualizar/borrar en Google.
- Resolución de conflictos por última modificación.
- Botón de sincronización manual en la UI.

**Non-Goals (por ahora):**

- Webhooks/push de Google para tiempo real.
- Múltiples conexiones OAuth por usuario (una por Schedule).

## Decisions

### D1: Rutas admin

- Todas las rutas de integración Google (status, connect, callback, disconnect) dentro del grupo que tenga `prefix('admin')` y con nombres `admin.integrations.google.*` para que `route('admin.integrations.google.status')` etc. resuelvan en el frontend. Revisar si hace falta un subgrupo con `->name('admin.')` para prefijar los nombres.

### D2: Tabla schedule_events

- Migración añade `google_event_id` (nullable, unique) y `google_calendar_id` (nullable). Índice único en `google_event_id` para evitar duplicados y búsquedas por id de Google. Modelo `ScheduleEvent` con estos campos en `$fillable`.

### D3: Mapeo Schedule → calendar_id

- Cada Schedule puede tener un `google_calendar_id` (nullable). Opciones: (a) columna en `schedules`; (b) tabla de mapeo schedule_id ↔ calendar_id por usuario. Decisión de implementación: columna `google_calendar_id` en `schedules` (nullable). El usuario, al configurar la agenda o en el modal de Google, asigna qué calendario de su cuenta Google usa para esa agenda. Si está vacío, esa agenda no sincroniza con Google.

### D4: Sincronización manual

- Acción "Sincronizar ahora": (1) Para cada Schedule con `google_calendar_id` y con usuario conectado a Google, traer eventos del rango visible (o último mes/futuro); (2) Por cada evento local sin `google_event_id` que corresponda a un Schedule con calendar_id, enviar a Google. Conflictos: comparar `updated_at` con `updated` de Google; el más reciente gana y se actualiza el otro lado.

### D5: Tokens y Calendar API

- Usar tokens de `GoogleCalendarIntegration` (refrescar si expirados). Cliente HTTP para Google Calendar API v3 (o paquete PHP) para listar eventos, crear, actualizar, borrar. Scopes ya incluyen `https://www.googleapis.com/auth/calendar`.

## Migration entregada

- Archivo: `database/migrations/2026_02_09_120000_add_google_calendar_fields_to_schedule_events_table.php`
- Añade: `google_event_id` (VARCHAR 255, nullable, unique), `google_calendar_id` (VARCHAR 255, nullable), índices correspondientes.
- El usuario ejecutará `php artisan migrate` en su entorno.

## Open Questions

- Ninguna pendiente; reglas 1–5 y migración de schedule_events cerradas.
