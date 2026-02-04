# Proposal: Schedule module (Laravel 11 + Inertia + React + Bootstrap)

## Overview

Implementar un módulo Schedule (agendas/calendarios) multiempresa con:
- Gestión de agendas por empresa (schedules)
- Gestión de eventos por agenda (schedule_events)
- Compartición de agendas con usuarios internos mediante pivot con roles (owner|editor|viewer)
- Vista calendario (día/semana/mes/lista) con carga por rango visible y filtrado por agendas seleccionadas
- Arquitectura preparada para futura integración con proveedores externos (Google Calendar, etc.)

Nota clave: Las policies ya están creadas y son la fuente de verdad:
- app/Policies/SchedulePolicy.php
- app/Policies/ScheduleEventPolicy.php


## Scope (v1)

### Incluido
- CRUD de agendas:
  - index/listado y selector lateral
  - create/edit
  - activar/desactivar
  - delete con restricción: no permitir si hay eventos futuros
  - gestión de usuarios autorizados + role
- CRUD de eventos:
  - carga por rango temporal (API)
  - create/edit (solo eventos futuros; pasado bloqueado)
  - delete condicionado por CompanySetting (si existe)
- Permisos Spatie:
  - module_schedule
  - schedules.*
  - schedule_events.*
- Multiempresa estricto: company_id == currentCompany

### Excluido (v1)
- Recurrencias avanzadas (RRULE real)
- Sync real con Google Calendar
- Invitados externos y RSVP
- Recursos (salas, material) y conflictos automáticos
- Motor de notificaciones avanzado


## Data model

### Tablas
- schedules
  - id
  - company_id (index)
  - owner_id (index)
  - name (string 255)
  - description (text nullable)
  - color (string nullable, ej #RRGGBB)
  - status (boolean default true)
  - timestamps
  - soft deletes (recomendado)
- Índices sugeridos:
  - company_id
  - owner_id
  - opcional unique: (company_id, owner_id, name)
- schedule_user (pivot de compartición)
  - schedule_id
  - user_id
  - role (owner|editor|viewer)
  - timestamps
    - Unique: (schedule_id, user_id)
- schedule_events
  - idf
  - company_id (index) denormalizado
  - schedule_id (index)
  - created_by (index)
  - title
  - description nullable
  - location nullable
  - starts_at (datetime index)
  - ends_at (datetime index)
  - all_day (boolean default false)
  - status nullable (opcional)
  - timestamps
  - soft deletes
- Constraints:
  - ends_at >= starts_at
  - schedule_events.company_id == schedules.company_id

### Model relationships
- Schedule:
  - belongsTo Company
  - belongsTo User (owner)
  - hasMany ScheduleEvent
  - belongsToMany User (authorizedUsers) con pivot role
- ScheduleEvent:
  - belongsTo Schedule
  - belongsTo Company
  - belongsTo User (createdBy)


## Authorization & access control

### Guardas obligatorias (policy-driven)
- Empresa en sesión (currentCompany) debe existir
- company_id del recurso debe coincidir con currentCompany
- Usuario debe tener module_schedule
- Permisos de acción:
  - Schedules: schedules.index|show|create|update|destroy
  - Events: schedule_events.index|show|create|update|destroy
- Acceso por rol de compartición:
  - owner: todo (incl. borrar agenda con reglas)
  - editor: ver + operar eventos (según policy), no borrar agenda
  - viewer: solo lectura
- Implementación: controllers llaman a $this->authorize(...) en cada acción.
- Nunca confiar en “filtrar en frontend”.


## Backend design

### Controllers propuestos
- ScheduleController
  - index() (Inertia): carga agendas accesibles + defaults UI
  - store() create agenda
  - show($schedule) (opcional si necesitas ruta dedicada)
  - update($schedule)
  - destroy($schedule) (aplica restricción “no eventos futuros” en policy + guardas)
  - updateAuthorizedUsers($schedule) (gestión pivot: add/remove/role)

- ScheduleEventController
  - index() (JSON): eventos por rango y agendas seleccionadas
    - query params: start, end, schedule_ids[] (opcionales)
    - filtra por company_id y accesibilidad del usuario
  - store($schedule) (creación contextual): agenda accesible + role >= editor
  - update($event) (bloquea pasados via policy)
  - destroy($event) (CompanySetting + policy)

  Nota: store($schedule) se recomienda como ruta anidada schedules/{schedule}/events para autorizar en contexto.

### Requests (FormRequest)
- ScheduleStoreRequest, ScheduleUpdateRequest
- SyncScheduleAuthorizedUsersRequest (para pivot)
- ScheduleStoreEventRequest, ScheduleUpdateEventRequest

Validaciones clave:
- name requerido
- color hex opcional (regex)
- starts_at, ends_at coherentes
- schedule_id siempre en empresa actual

### Query scoping (obligatorio)
- Todos los listados hacen:
  - where company_id = currentCompany
  - join/pivot check: owner o pivot user
- Preferible crear un scope en Schedule:
  - scopeVisibleTo($query, User $user) (owner o pivot)
- Y en ScheduleEvent filtrar vía relación schedule o por schedule_ids visibles.

### Routes (bajo admin + middleware auth/verified/company/module)
- Ejemplo de rutas (nombres orientativos):
  - GET admin/schedules → schedules.index
  - POST admin/schedules → schedules.store
  - PUT admin/schedules/{schedule} → schedules.update
  - DELETE admin/schedules/{schedule} → schedules.destroy
  - PUT admin/schedules/{schedule}/authorized-users → schedules.authorized-users.update
- Eventos:
  - GET admin/schedule-events → schedule_events.index (JSON por rango)
  - POST admin/schedules/{schedule}/events → schedule_events.store
  - PUT admin/schedule-events/{event} → schedule_events.update
  - DELETE admin/schedule-events/{event} → schedule_events.destroy


## Frontend design (Inertia + React + Bootstrap)

### Página principal
resources/js/Pages/Schedule/Index.jsx

- Layout:
  - Sidebar:
    - lista de agendas accesibles
    - toggles/checkbox para incluir/excluir de la vista
    - botón “Nueva agenda”
  - Main:
    - calendario con vista día/semana/mes/lista
    - navegación (prev/next/today)
    - carga asíncrona de eventos por rango visible

### Librería de calendario:
Propuesta pragmática:
- FullCalendar React (ecosistema estable, vistas múltiples, callbacks de rango)
  - Paquetes: @fullcalendar/react, @fullcalendar/daygrid, @fullcalendar/timegrid, @fullcalendar/list, @fullcalendar/interaction
- Alternativa: React Big Calendar (menos vistas “listas” pulidas)

FullCalendar encaja muy bien con:
- datesSet → pedir eventos para el rango
- eventClick → abrir modal de edición
- select → crear evento

### Modales
- ScheduleFormModal (crear/editar agenda)
- EventFormModal (crear/editar evento)
- AuthorizedUsersModal (gestionar pivot roles)

### API fetching
- GET admin/schedule-events?start=...&end=...&schedule_ids[]=...
- Respuesta normalizada (por FullCalendar):
  - { id, title, start, end, allDay, extendedProps: {...} }

### UI gating por permisos
- La UI puede ocultar botones según permisos, pero la seguridad real va en policy.
- El backend devuelve flags útiles:
  - canCreateSchedule, canUpdateSchedule, etc. (opcional)
  - o por entidad: schedule.can.update, schedule.can.delete (ideal)


## Company settings (directrices)

En v1, solo se usa si existe:
- schedule_events_allow_delete (default true)

Si CompanySetting aún no está implementado, la policy hace “best-effort” y no rompe. Cuando exista, se ajusta para leerlo con API real (valueFor o esquema key/value).


## Testing strategy

- Feature tests:
  - multiempresa: no acceso cross-company
  - compartición: viewer/editor/owner
  - reglas:
    - no borrar agenda con eventos futuros
    - no editar evento pasado
    - delete evento bloqueado por directriz
- Unit tests:
  - scopes visibleTo
  - validaciones de fechas


## Performance & scalability

- Eventos se consultan por rango y por company_id.
- Índices en starts_at, ends_at, company_id, schedule_id.
- Para cargas grandes:
  - limitar rango máximo (ej. 2-3 meses por request) si fuese necesario
  - paginación solo en vista “lista”


## Risks & mitigations
- Riesgo: filtrado incorrecto de eventos (leaks multiempresa).
  - Mitigación: policies + scopes + tests.
- Riesgo: compartir agendas sin roles claros.
  - Mitigación: pivot role obligatorio y policy basada en role.
- Riesgo: UI “bonita” que ignora reglas de edición/borrado.
  - Mitigación: backend manda errores claros y UI los muestra via FlashMessage.


## Deliverables (archivos)
- Backend:
  - Models: Schedule, ScheduleEvent
  - Migrations (3): schedules, schedule_user, schedule_events
  - Controllers: ScheduleController, ScheduleEventController
  - Requests: 5 FormRequests
  - Policies: ya creadas (no tocar)
  - Routes: admin group
  - Seed/permissions: añadir permisos schedule + schedule_events
- Frontend:
  - Pages/Schedule/Index.jsx
  - Componentes: Sidebar, Calendar wrapper, Modals (agenda/event/users)
  - Servicios: scheduleApi.js o equivalente para fetch events


## Notes for tasks.md
- Las policies ya existen y NO deben sobrescribirse.
- Tasks deben exigir que controllers y queries se guíen por:
  - SchedulePolicy
  - ScheduleEventPolicy
- Toda query debe aplicar:
  - company_id = currentCompany
  - accesibilidad por owner o pivot
- Respetar reglas:
  - no editar eventos pasados
  - no borrar agendas con eventos futuros
  - borrado de eventos condicionado por CompanySetting