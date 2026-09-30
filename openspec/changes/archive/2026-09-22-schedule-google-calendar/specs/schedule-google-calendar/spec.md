# Spec: Integración agenda con Google Calendar

## ADDED Requirements

### Requirement: Estado de la conexión Google

El sistema SHALL exponer un endpoint GET (bajo el grupo de rutas admin) que devuelva el estado de la integración Google Calendar del usuario autenticado para la empresa actual. La respuesta SHALL incluir al menos: si está conectado (booleano), email de la cuenta Google asociada (si existe), y fecha/hora de última sincronización (si existe). El nombre de la ruta SHALL permitir que el frontend resuelva `route('admin.integrations.google.status')`.

#### Scenario: Usuario conectado — devuelve estado

- **WHEN** el usuario está autenticado y tiene una integración Google Calendar activa para la empresa actual
- **THEN** el endpoint devuelve `connected: true`, el email de la cuenta Google y `last_synced_at` si ha habido al menos una sincronización
- **AND** el frontend puede mostrar en el modal que está conectado y la última sincronización

#### Scenario: Usuario no conectado — devuelve no conectado

- **WHEN** el usuario está autenticado pero no tiene integración Google activa (o no existe registro para user_id + company_id)
- **THEN** el endpoint devuelve `connected: false` y no requiere email ni last_synced_at
- **AND** el frontend muestra que no hay conexión y permite iniciar el flujo de conexión

---

### Requirement: Desconexión de Google Calendar

El sistema SHALL exponer un endpoint (POST o DELETE) bajo admin que permita al usuario autenticado desconectar su integración Google Calendar para la empresa actual. La acción SHALL desactivar o eliminar el registro de integración (p. ej. `is_enabled = false` o borrado lógico) de forma que el endpoint de estado pase a devolver `connected: false`. El nombre de la ruta SHALL permitir que el frontend resuelva `route('admin.integrations.google.disconnect')`.

#### Scenario: Desconectar — deja de estar conectado

- **WHEN** el usuario autenticado solicita desconectar y existe una integración activa para su user_id y company_id
- **THEN** el sistema desactiva o elimina la integración
- **AND** una siguiente llamada al endpoint de estado devuelve `connected: false`

#### Scenario: Desconectar sin integración — no falla

- **WHEN** el usuario solicita desconectar y no tiene integración activa
- **THEN** el sistema responde con éxito (idempotente) sin error
- **AND** el estado sigue siendo no conectado

---

### Requirement: Rutas de integración bajo admin

Las rutas de integración Google (status, connect, callback, disconnect) SHALL estar registradas dentro del grupo de rutas que tenga el prefijo `admin` y middleware de autenticación, de modo que solo usuarios registrados y logueados puedan acceder. Los nombres de ruta SHALL ser coherentes con lo que el frontend usa: `admin.integrations.google.status`, `admin.integrations.google.connect`, `admin.integrations.google.callback`, `admin.integrations.google.disconnect`.

#### Scenario: Usuario no autenticado — sin acceso

- **WHEN** un usuario no autenticado intenta acceder al endpoint de status o disconnect
- **THEN** el sistema responde con no autorizado (redirección a login o 401)
- **AND** no se expone estado ni se permite desconectar

#### Scenario: Frontend resuelve rutas por nombre

- **WHEN** el frontend llama a `route('admin.integrations.google.status')`, `route('admin.integrations.google.connect')`, `route('admin.integrations.google.disconnect')`
- **THEN** las URLs resueltas apuntan a los controladores correctos bajo el prefijo admin
- **AND** el modal de Google Calendar puede conectar, ver estado y desconectar sin URLs hardcodeadas

---

### Requirement: Mapeo Schedule a calendario Google

Cada agenda (Schedule) SHALL poder asociarse a un calendario de Google mediante un identificador de calendario (`google_calendar_id`). El sistema SHALL almacenar `google_calendar_id` en la agenda (p. ej. columna en la tabla `schedules`). Si una agenda no tiene `google_calendar_id`, esa agenda SHALL no participar en la sincronización con Google. Un usuario SHALL poder elegir, al configurar la agenda o en el flujo de Google, qué calendario de su cuenta Google usa para esa agenda.

#### Scenario: Agenda con calendar_id — participa en sincronización

- **WHEN** un Schedule tiene `google_calendar_id` definido y el usuario tiene integración Google activa
- **THEN** la sincronización manual (y futura automática) incluye ese calendario para leer y escribir eventos
- **AND** los eventos se asocian a ese Schedule y a ese calendar_id

#### Scenario: Agenda sin calendar_id — no sincroniza

- **WHEN** un Schedule tiene `google_calendar_id` vacío o null
- **THEN** no se leen ni escriben eventos en Google para esa agenda
- **AND** los eventos locales de esa agenda permanecen solo locales

---

### Requirement: Identificación de eventos sincronizados

El sistema SHALL almacenar en cada evento de agenda (`schedule_events`) que provenga o se envíe a Google al menos `google_event_id` (identificador del evento en Google Calendar API) y opcionalmente `google_calendar_id`. Esto SHALL permitir evitar duplicados al importar desde Google y permitir actualizar o borrar en Google al editar o eliminar el evento local. No SHALL existir dos registros en `schedule_events` con el mismo `google_event_id` (unicidad).

#### Scenario: Evento importado de Google — tiene google_event_id

- **WHEN** un evento se crea en `schedule_events` a partir de un evento leído de Google Calendar
- **THEN** se guarda el `google_event_id` (y si aplica `google_calendar_id`) del evento de Google
- **AND** en futuras sincronizaciones el sistema reconoce ese evento como el mismo y no lo duplica

#### Scenario: Evento creado en la app y enviado a Google — se guarda id de Google

- **WHEN** el usuario crea un evento en la agenda y la agenda está vinculada a un calendario Google y se ejecuta la sincronización (o envío inmediato)
- **THEN** tras crear el evento en Google Calendar API el sistema guarda el `google_event_id` devuelto en el `schedule_event` correspondiente
- **AND** futuras actualizaciones o borrados en la app se reflejan en ese evento de Google

---

### Requirement: Sincronización bidireccional — lectura desde Google

El sistema SHALL poder leer eventos de Google Calendar (API v3) para los calendarios asociados a las agendas del usuario (por `google_calendar_id` en cada Schedule). Para cada evento leído, SHALL crear o actualizar un registro en `schedule_events` asociado al Schedule que tenga ese `google_calendar_id`, guardando `google_event_id` y datos relevantes (título, fechas, descripción, etc.). Si ya existe un `schedule_event` con ese `google_event_id`, SHALL actualizarlo según la regla de conflictos (última modificación gana).

#### Scenario: Sincronizar — eventos nuevos de Google se crean en la app

- **WHEN** el usuario dispara la sincronización manual y en Google existen eventos en el rango sincronizado que no tienen aún un `schedule_event` con ese `google_event_id`
- **THEN** se crean nuevos registros en `schedule_events` con los datos del evento de Google y el `google_event_id` correspondiente
- **AND** dichos eventos se muestran en la agenda (FullCalendar) junto con los locales

#### Scenario: Evento ya existe localmente — se actualiza si Google es más reciente

- **WHEN** existe un `schedule_event` con el mismo `google_event_id` y el evento en Google tiene una fecha de modificación posterior al `updated_at` local
- **THEN** el sistema actualiza el `schedule_event` con los datos de Google (última modificación gana)
- **AND** no se crea un duplicado

---

### Requirement: Sincronización bidireccional — escritura hacia Google

El sistema SHALL poder crear, actualizar y eliminar eventos en Google Calendar cuando el usuario crea, edita o elimina eventos en la agenda (en las agendas que tengan `google_calendar_id`). Para eventos locales que ya tengan `google_event_id`, SHALL actualizar o borrar el evento correspondiente en Google; para eventos locales sin `google_event_id`, SHALL crear el evento en Google y guardar el `google_event_id` devuelto en el `schedule_event`.

#### Scenario: Crear evento en la app — se crea en Google

- **WHEN** el usuario crea un evento en una agenda que tiene `google_calendar_id` y el usuario tiene integración Google activa, y se ejecuta la sincronización o el envío correspondiente
- **THEN** el sistema crea el evento en ese calendario de Google y guarda el `google_event_id` en el `schedule_event`
- **AND** el evento aparece en Google Calendar

#### Scenario: Editar evento en la app — se actualiza en Google

- **WHEN** el usuario edita un evento que tiene `google_event_id` y se ejecuta la sincronización o el envío
- **THEN** el sistema actualiza el evento correspondiente en Google Calendar (salvo que la regla de conflictos indique que gana Google)
- **AND** los cambios se reflejan en Google

#### Scenario: Eliminar evento en la app — se elimina en Google

- **WHEN** el usuario elimina un evento que tiene `google_event_id` y se ejecuta la sincronización o el envío
- **THEN** el sistema elimina (o mueve a papelera si la API lo permite) el evento en Google Calendar
- **AND** el evento deja de aparecer en Google

---

### Requirement: Resolución de conflictos — última modificación gana

Cuando el mismo evento exista en la app (`schedule_event` con `google_event_id`) y en Google, y ambos hayan sido modificados, el sistema SHALL considerar la fecha de última modificación de cada lado (p. ej. `updated_at` local y campo `updated` del evento en Google). El lado con la modificación más reciente SHALL ser la fuente de verdad; el otro lado SHALL actualizarse con esos datos en la siguiente sincronización.

#### Scenario: Google más reciente — actualiza local

- **WHEN** en una sincronización el evento en Google tiene `updated` posterior al `updated_at` del `schedule_event`
- **THEN** el sistema actualiza el `schedule_event` con los datos del evento de Google
- **AND** no se sobrescribe Google con los datos locales para ese evento

#### Scenario: Local más reciente — actualiza Google

- **WHEN** el `schedule_event` tiene `updated_at` posterior a la fecha `updated` del evento en Google
- **THEN** el sistema envía una actualización a Google Calendar API para ese evento
- **AND** Google refleja los datos locales

---

### Requirement: Sincronización manual

El sistema SHALL ofrecer una acción de sincronización manual (p. ej. botón "Sincronizar ahora") accesible desde la UI de la agenda. Al ejecutarla, SHALL ejecutarse el flujo de sincronización bidireccional para las agendas del usuario que tengan `google_calendar_id` y para las que el usuario tenga integración Google activa: primero lectura desde Google (crear/actualizar eventos locales), luego escritura hacia Google (eventos locales sin o con cambios que deban subirse). La UI SHALL poder indicar que la sincronización está en curso y, tras finalizar, actualizar la vista del calendario y el indicador de última sincronización.

#### Scenario: Usuario pulsa Sincronizar ahora

- **WHEN** el usuario está conectado a Google y pulsa el botón de sincronización manual
- **THEN** el sistema ejecuta la lectura de eventos desde los calendarios vinculados y la escritura de eventos locales hacia Google según las reglas anteriores
- **AND** al finalizar, el frontend actualiza los eventos mostrados y la fecha de última sincronización

#### Scenario: Usuario no conectado — sincronización no disponible

- **WHEN** el usuario no tiene integración Google activa
- **THEN** el botón de sincronización manual SHALL estar deshabilitado o no mostrarse, o al pulsarlo se indica que debe conectar primero
- **AND** no se realizan llamadas a la API de Google
