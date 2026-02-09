# Change: Conectar agenda con Google Calendar

## Why

Completar la integración de la agenda (Schedule) con Google Calendar para que los usuarios autenticados puedan conectar su cuenta de Google y sincronizar eventos en ambos sentidos: ver en la agenda los eventos del calendario de Google y que los eventos creados o editados en la agenda se reflejen en Google. El modal para introducir el email y conectar ya existe en la UI pero no es funcional (faltan endpoints de estado y desconexión, y la sincronización bidireccional de eventos).

## What Changes

- **Conexión por usuario**: La conexión OAuth con Google es por usuario (no por empresa). El usuario puede utilizar calendarios de su cuenta en el contexto de la empresa actual. Una sola conexión por usuario es más eficiente (un solo flujo OAuth, un conjunto de tokens por usuario/empresa).
- **Endpoints bajo admin**: Añadir endpoints de estado y desconexión de la integración Google, integrados en el grupo de rutas `admin` (middleware auth, etc.), con nombres de ruta que coincidan con el frontend (`admin.integrations.google.status`, `admin.integrations.google.disconnect`). Mantener `connect` y `callback` en el mismo grupo admin.
- **Estado y desconexión**: GET `admin/integrations/google/status` (devuelve si está conectado, email, última sincronización); POST o DELETE para desconectar (limpiar o desactivar la integración del usuario/empresa).
- **Sincronización bidireccional**: Definir reglas (en design/specs) para: qué calendario(es) de Google se usan; mapeo agenda local (Schedule) ↔ calendario Google; resolución de conflictos; identificación de eventos ya sincronizados (p. ej. `google_event_id` en `schedule_events`). Implementar lectura de eventos desde Google (mostrar en la agenda y opcionalmente persistir en `schedule_events`) y escritura hacia Google al crear/editar/eliminar eventos en la agenda.
- **Frontend**: El modal existente en `Schedule/Index.jsx` debe quedar funcional: consumo de status, redirección a connect, y disconnect; y soporte para disparar sincronización manual si se define.

## Capabilities

### New Capabilities

- **schedule-google-calendar**: Conexión OAuth por usuario con Google Calendar (estado, conectar, desconectar) y sincronización bidireccional de eventos entre la agenda (Schedule/ScheduleEvent) y el calendario de Google, con reglas de mapeo y conflicto definidas en design.

### Modified Capabilities

- (Ninguno por ahora; si se tocan requisitos de una spec existente de agenda, se añadirá aquí.)

## Impact

- **Rutas**: Nuevas rutas bajo el grupo admin: status, disconnect; revisar nombres para que el frontend (`route('admin.integrations.google.*')`) resuelva correctamente.
- **Controladores**: `GoogleCalendarController`: añadir métodos `status` y `disconnect`; posible servicio o job para sincronización (lectura/escritura con Google Calendar API).
- **Modelos**: `GoogleCalendarIntegration` ya existe; `ScheduleEvent` podría ampliarse con `google_event_id` (y opcionalmente `google_calendar_id`) para identificación unívoca en sincronización bidireccional.
- **Frontend**: Ajustes mínimos en `Schedule/Index.jsx` si las URLs de las rutas cambian; el modal ya está preparado para estado, conectar y desconectar.
- **Config / Dependencias**: Ya existe `config/services.php` (google client_id, client_secret, redirect); Laravel Socialite para OAuth. Para leer/escribir eventos se usará Google Calendar API (vía cliente HTTP o paquete PHP).
- **Seguridad**: Solo usuarios autenticados; rutas bajo middleware admin; tokens de Google ya almacenados cifrados en `GoogleCalendarIntegration`.
