# Spec: Schedule

## Context

El módulo Schedule permite gestionar agendas (calendarios) y eventos (citas, reuniones, tareas con fecha/hora) para usuarios dentro de una plataforma multiempresa:
- Una agenda es una entidad “contenedor” de eventos.
- Por defecto una agenda es individual (propietario), pero puede compartirse con otros usuarios de la misma empresa con distintos niveles de acceso.
- El sistema trabaja siempre con la empresa en sesión (currentCompany / CompanyContext) y nunca debe mezclar datos entre empresas.
- En una fase posterior, el módulo podrá integrarse con proveedores externos (Google Calendar, etc.).


## Goals / Non-goals

### Goals:
- CRUD de agendas por empresa (crear, listar, ver, editar, desactivar, eliminar con restricciones).
- CRUD de eventos dentro de agendas (crear, listar por rango, ver, editar con restricciones, eliminar con directrices).
- Compartición de agendas con usuarios de la empresa (permisos tipo owner/editor/viewer o equivalente).
- Vista calendario (día/semana/mes/lista) con carga por rango temporal y filtrado por agendas visibles.
- Multiempresa estricta: company_id como scope innegociable.
- Preparar arquitectura para futura integración/sincronización con calendarios externos (sin implementarla en v1 salvo “hooks” y diseño).


### Non-goals:
- Recurrencias complejas (RRULE completa), excepciones y series avanzadas.
- Reservas de recursos (salas, vehículos, material) con conflictos y aprobación.
- Sistema completo de invitaciones externas (emails fuera del ERP), RSVP, etc.
- Sincronización bidireccional real con Google Calendar (se define el contrato, no la implementación).
- Motor de notificaciones/reminders sofisticado (se puede dejar un campo para recordatorios, pero sin job system completo si no es prioridad).


## Domain model

### Entidades
- Schedule:
  - Agenda/calendario dentro de una empresa.
  - Tiene un owner (usuario propietario).
  - Puede compartirse con otros usuarios (autorizados) con un nivel de acceso.
- ScheduleEvent:
  - Evento perteneciente a una agenda.
  - Tiene fecha/hora inicio y fin, y metadatos (título, descripción, ubicación, etc.).
  - Puede tener participantes (usuarios) opcionales.
- ScheduleShare / Authorized users (pivot)
  - Relación entre Schedule y User que define acceso compartido.
  - Idealmente incluye un role o permission_level: owner|editor|viewer.

Nota: “authorized_users” no debería ser un JSON en la tabla schedules salvo que quieras sufrir en consultas y políticas. Mejor pivot.

### Estados
- Schedule.status: booleano (activo/inactivo), default true.
- Los eventos pueden tener status opcional (ej: confirmed/cancelled) pero no es obligatorio en v1.


## Data model

### Tabla: schedules
Campos sugeridos:
- id
- company_id (required, index)
- owner_id (required, index, from users)
- name (required, max 255)
- description (nullable)
- color (nullable, string; formato recomendado: hex #RRGGBB)
- status (boolean, default true)
- soft deletes
- timestamps

Constraints / reglas:
- company_id obligatorio
- owner_id obligatorio
- name obligatorio
- (opcional) Unicidad por empresa+owner: unique(company_id, owner_id, name) si quieres evitar duplicados obvios.

Relaciones:
- Schedule belongsTo Company
- Schedule belongsTo User (owner)
- Schedule hasMany ScheduleEvent
- Schedule belongsToMany User (authorized) mediante pivot (ScheduleShare)

### Pivot: schedule_user (o schedule_shares)
Campos sugeridos:
- schedule_id (index)
- user_id (index)
- role trait: owner|editor|viewer (required)
- timestamps

Constraints:
- unique(schedule_id, user_id)
- Sólo usuarios vinculados a la empresa (según tu modelo de pertenencia multiempresa).

### Tabla: schedule_events
Campos sugeridos:
- id
- company_id (required, index) denormalizado a propósito para scoping rápido
- schedule_id (required, index)
- created_by (required, index)
- title (required, max 255)
- description (nullable)
- location (nullable)
- starts_at (required, datetime, index)
- ends_at (required, datetime, index)
- all_day (boolean, default false)
- status (nullable string) [opcional v1]
- soft deletes
- timestamps

Constraints:
- ends_at debe ser >= starts_at
- company_id debe coincidir con el company_id del Schedule
- No se valida conflicto de solapamiento (permitido explícitamente)

Relaciones:
- ScheduleEvent belongsTo Schedule
- ScheduleEvent belongsTo Company
- ScheduleEvent belongsTo User (created_by)

### (Opcional v1) Pivot participantes: schedule_event_user
Si necesitas “invitados/participantes” internos:
- schedule_event_id
- user_id
- role (optional: attendee/organizer)
- timestamps


## Permissions & authorization

### Precondiciones globales
- El módulo debe estar activado para la empresa en sesión: module_schedule.
- El scope SIEMPRE es company_id = currentCompany.
- Nunca permitir operar sobre datos de otra empresa aunque el usuario tenga permisos en otra.

### Permisos
- Permiso de módulo: module_schedule
- Permisos CRUD de agendas:
schedules.[index|show|create|store|edit|update|destroy|search]
- Permisos CRUD de eventos (recomendado separarlos):
schedule_events.[index|show|create|store|edit|update|destroy|search]
- Si quieres mantenerlo minimalista, puedes empezar sin separar eventos, pero te vas a arrepentir cuando lleguen reglas finas (y llegarán).

### Reglas de acceso por compartición
Una agenda es accesible si:
- owner_id == auth()->id() o
- existe registro en pivot schedule_user con ese usuario.
Niveles de acceso propuestos:
- owner: todo (incluye compartir, editar agenda, borrar con restricciones).
- editor: ver agenda, ver/crear/editar/borrar eventos (según permisos), pero no cambiar owner ni borrar agenda (salvo que lo decidas).
- viewer: solo lectura (agenda y eventos).
Fuente de verdad:
- Preferir Policies como fuente de verdad.
- Middleware solo para guardas generales (auth, company context, module enabled).


## UX / Screens
Definición de pantallas del CRUD.

### Index (Calendario principal)
- Top CTAs:
  - Nueva agenda
  - (Opcional) Tipos de eventos (si existe catálogo)
- Panel lateral (siempre visible):
  - Listado de agendas accesibles por el usuario (owner + compartidas)
  - Checkboxes/toggles para incluir/excluir agendas de la vista actual
- Vista principal:
  - Calendario con selector de vista: día / semana / mes / agenda(list)
  - Navegación temporal (prev/next/today)
  - Carga asíncrona de eventos por rango visible

### Create Schedule
- Campos mínimos: name, description, color, status
- Selección de usuarios autorizados + rol (si se comparte desde creación)
- Al guardar: redirige a Edit

### Edit Schedule
- Editar: name, description, color, status
- Gestión de compartición:
  - añadir/quitar usuarios autorizados
  - cambiar role (viewer/editor)
- Acciones:
  - desactivar/activar
  - eliminar (si cumple condiciones)

### Create/Edit Event (modal o pantalla)
- Campos: title, description, location, starts_at, ends_at, all_day
- (Opcional) participantes internos
- Restricciones de edición para eventos pasados (ver requirements)


## Requirements

### Requirement: calendario
- El sistema DEBE mostrar eventos solo de agendas a las que el usuario tenga acceso (owner o compartidas).
- El sistema DEBE ocultar cualquier evento ajeno a la empresa en sesión.
- El sistema DEBE permitir que varias agendas convivan en la misma vista (filtrables).
- El sistema DEBE cargar eventos por rango temporal visible (lazy loading por intervalo).

### Requirement: menú de agendas
- El sistema DEBE mantener visible el menú de agendas accesibles al usuario.
- Cambiar selección de agendas NO DEBE cambiar la vista (día/semana/mes/lista); solo recargar eventos del rango actual.
- La transición entre agendas DEBE ser asíncrona.

### Requerimiento: crear agenda
- El sistema DEBE permitir crear agendas si:
  - la empresa tiene module_schedule activo
  - el usuario tiene schedules.create
- La agenda creada DEBE pertenecer a la empresa en sesión.
- El usuario creador DEBE quedar como owner_id.

### Requerimiento: editar agenda
- El sistema DEBE permitir editar: name, description, authorized_users, color, status
- Solo usuarios con acceso suficiente (owner y, si lo decides, editor) y permisos correspondientes.

### Requerimiento: eliminar agenda
- El sistema DEBE impedir eliminar una agenda que contenga eventos futuros.
  - “Futuro” = event.ends_at > now()
- El sistema DEBE impedir eliminar si el usuario no tiene schedules.destroy en la empresa en sesión.
- El sistema DEBE bloquear esta acción fuera de la empresa en sesión aunque el usuario tenga permisos en otra.
- (Recomendado) El sistema DEBERÍA permitir “desactivar” como alternativa.

### Requerimiento: crear evento
- El sistema DEBE permitir crear eventos aunque se solapen en fecha/hora.
- El sistema DEBE validar ends_at >= starts_at.
- El evento DEBE quedar scopeado a la empresa en sesión y a una agenda accesible.

### Requerimiento: editar evento
- El sistema DEBE permitir editar eventos futuros en campos editables: fechas/horas, lugar, participantes, descripción, etc.
- El sistema NO DEBE permitir editar eventos pasados.
  - “Pasado” = event.ends_at < now() en el momento de edición.

### Requerimiento: eliminar evento.
- El sistema DEBE permitir eliminar eventos pasados/presentes/futuros solo si:
  - el usuario tiene schedule_events.destroy (o equivalente)
  - una directriz de empresa no lo prohíbe
- La directriz de empresa DEBE poder modelarse vía CompanySetting (ej.: schedule_events_allow_delete = true/false o una regla más granular).


## Integrations (futuro)

- Preparar el diseño para proveedores externos:
  - external_provider (google, microsoft, etc.)
  - external_calendar_id
  - external_event_id
  - last_synced_at

- Definir estrategia (no implementar en v1):
  - importación unidireccional vs sync bidireccional
  - resolución de conflictos
  - jobs/colas


## Decisions

- Compartición mediante pivot con role (no JSON).
- company_id también en schedule_events para scoping y queries eficientes.
- Policies como fuente de verdad para autorización multiempresa y por rol de compartición.
