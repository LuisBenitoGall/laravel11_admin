# Tasks: Schedule module

## 0. Instrucciones globales (obligatorias)

- Stack: Laravel 11 + Inertia + React + Bootstrap, PHP 8.2, Node 22.18.
- Este módulo debe cumplir taxativamente las siguientes archivos: 
  - openspec/_global/ui-form-components.md (reglas de formularios).
  - openspec/_global/admin-layout-conventions.md (reglas de layout del admin).
- Multiempresa estricta: toda operación y query debe aplicar company_id = currentCompany.
- El módulo solo funciona si:
  - la empresa en sesión tiene activado module_schedule (según tu sistema de módulos)
  - el usuario tiene permiso module_schedule
- Soft-delete siempre en schedules y schedule_events.
- El calendario solo muestra eventos de las agendas seleccionadas (si no hay seleccionadas, devuelve []).
- Edición de agenda y gestión de compartición: solo owner (además de permisos).

### Formularios (UI components)
- Antes de crear/editar un formulario:
  - localizar los componentes ya existentes en resources/js/Components/Form/* (o tu ruta real)
  - reutilizar TextInput, SelectInput, TextareaInput, CheckboxInput, DateTimeInput, etc.
- Si falta uno:
  - crear XInput.jsx y documentar su uso con ejemplo mínimo
  - solo después retomar la pantalla

### Policies ya creadas (NO sobrescribir)
- app/Policies/SchedulePolicy.php
- app/Policies/ScheduleEventPolicy.php

No regenerar desde cero ni “inventar” reglas nuevas. La implementación debe guiarse por ellas:
- usar authorize() en acciones CRUD
- filtrar listados por company_id = currentCompany y accesibilidad (owner o pivot)
- respetar reglas: no editar eventos pasados, no borrar agendas con eventos futuros, borrado de eventos condicionado por CompanySetting


## 1. Database & Models

### [ ] Task 1.1 — Migration schedules
Crear tabla schedules con:
- id
- company_id (index, required, FK tabla companies)
- owner_id (index, required, FK tabla users) 
- name (string 255, required)
- description (text nullable)
- color (string nullable, formato #RRGGBB)
- status (boolean default true)
- timestamps + softDeletes()

### [ ] Task 1.2 — Migration pivot schedule_user
Crear tabla pivot schedule_user con:
- schedule_id (index)
- user_id (index)
- role (string required)
  - No usar enums.
  - Los roles permitidos (owner|editor|viewer) deben definirse y gestionarse mediante un trait reutilizable (constantes + helpers), usado por Schedule/ScheduleEvent/Policies según aplique.
- timestamps
- unique (schedule_id, user_id)

#### [ ] Task 1.2.a — Crear trait de roles de schedule
Crear app/Concerns/Traits/HasScheduleRoles.php 
Incluir:
- constantes: ROLE_OWNER, ROLE_EDITOR, ROLE_VIEWER
- public static function scheduleRoles(): array
- public static function isValidScheduleRole(string $role): bool
- (opcional) normalizador: normalizeScheduleRole($role) (lowercase + trim)

### [ ] Task 1.3 — Migration schedule_events
Crear tabla schedule_events con:
- id
- company_id (index, required) denormalizado
- schedule_id (index, required)
- created_by (index, required)
- title (string 255, required)
- description (text nullable)
- location (string nullable)
- starts_at (datetime, index, required)
- ends_at (datetime, index, required)
- all_day (boolean default false)
- status (string nullable, opcional v1)
- timestamps + softDeletes()

### [ ] Task 1.4 — Model Schedule
Crear App\Models\Schedule
Relaciones:
- company()
- owner() (belongsTo User con FK owner_id)
- events() (hasMany ScheduleEvent)
- authorizedUsers() (belongsToMany User con pivot role + timestamps)
Scope obligatorio:
- scopeVisibleTo($query, User $user) (owner o pivot)

### [ ] Task 1.5 — Model ScheduleEvent
Crear App\Models\ScheduleEvent
Relaciones:
- schedule()
- company()
- createdBy() (belongsTo User con FK created_by)

### [ ] Task 1.6 — Ajuste de Policies existentes a owner_id
- Revisar SchedulePolicy y ScheduleEventPolicy y sustituir referencias a owner_user_id por owner_id.
- Verificar que las relaciones usadas por policy existen (authorizedUsers() o users() según convención final).
- Mantener lógica existente (no “rediseñar”), solo adaptar nombres/campos.


## 2. Permissions (Spatie)

Importante: no crear a ciegas. Antes, comprobar si ya existen en permissions.

### [ ] Task 2.1 — Registrar permisos (idempotente)
- Asegurar existencia del permiso:
  - module_schedule
- Asegurar existencia de permisos de agendas:
  - schedules.index, schedules.show, schedules.create, schedules.update, schedules.destroy, schedules.search
- Asegurar existencia de permisos de eventos (con guion):
  - schedule-events.index, schedule-events.show, schedule-events.create, schedule-events.update, schedule-events.destroy, schedule-events.search
- Implementación:
  - En el seeder/command de permisos, usar firstOrCreate (o equivalente) para evitar duplicados.

### [ ] Task 2.2 - Alinear Policies/Controllers con nomenclatura
- Donde se use can(...), usar schedule-events.* (no schedule_events.*) en eventos.
- Mantener schedules.* para agendas.


## 3. Backend HTTP Layer

### 3.1 FormRequests (nomenclatura Modelo + Acción)
#### [ ] Task 3.1 — Crear ScheduleStoreRequest
- Validar: name, description?, color?, status?, authorized_users?
- color regex: ^#([0-9a-fA-F]{6})$

#### [ ] Task 3.2 — Crear ScheduleUpdateRequest
- Igual que store, permitiendo update parcial si aplica

#### [ ] Task 3.3 — Crear request para compartición
- Crear ScheduleAuthorizedUsersSyncRequest (o el nombre exacto que uses, pero siguiendo “Schedule + Acción”)
- Validar array de usuarios:
  - authorized_users: [{ user_id, role }]
  - role in viewer|editor (owner no editable vía pivot)
- Validar que los usuarios pertenecen a la empresa en sesión (según tu relación users↔companies)

#### [ ] Task 3.4 — Crear ScheduleEventStoreRequest
- Validar: title, starts_at, ends_at (after_or_equal:starts_at), all_day?, description?, location?

#### [ ] Task 3.5 — Crear ScheduleEventUpdateRequest
- Validación similar a store

### 3.2. Controllers
#### [ ] Task 3.6 — ScheduleController@index (Inertia)
- authorize('viewAny', Schedule::class)
- Cargar agendas visibles:
  - Schedule::query()->where('company_id', currentCompany)->visibleTo(user)
- Devolver a Inertia:
  - agendas (campos mínimos + can por agenda si lo usas)
  - permisos globales útiles (opcional)

#### [ ] Task 3.7 — ScheduleController@store
- authorize('create', Schedule::class)
- Crear con company_id=currentCompany y owner_id=auth()->id()
- (Opcional recomendado) reflejar owner también en pivot con role owner
- Redirigir a edit o volver a index dejando seleccionada la nueva agenda

#### [ ] Task 3.8 — ScheduleController@update
- authorize('update', $schedule) (solo owner lo permite la policy)
- Persistir cambios

#### [ ] Task 3.9 — ScheduleController@destroy
- authorize('delete', $schedule) (policy bloquea si hay eventos futuros)
- Soft-delete

#### [ ] Task 3.10 — ScheduleController@updateAuthorizedUsers
- authorize('manageAuthorizedUsers', $schedule)
- Sincronizar pivot:
  - add/remove/update roles
  - impedir asignar owner por aquí
- Confirmar que usuarios pertenecen a la empresa

#### [ ] Task 3.11 — ScheduleEventController@index (JSON por rango)
- authorize('viewAny', ScheduleEvent::class)
- Params: start, end, schedule_ids[]
- Regla: si schedule_ids vacío → devolver []
- Filtrar:
  - company_id=currentCompany
  - schedule_id in schedule_ids
  - schedule visible al usuario (owner/pivot)
  - solape con rango: starts_at < end AND ends_at > start
- Responder formato FullCalendar:
  - id, title, start, end, allDay, extendedProps {schedule_id, location, description, can...}

#### [ ] Task 3.12 — ScheduleEventController@store (nested)
- Ruta: POST schedules/{schedule}/events
- authorize('create', [ScheduleEvent::class, $schedule])
- Crear evento con:
  - company_id=currentCompany
  - created_by=auth()->id()
  - schedule_id=$schedule->id

#### [ ] Task 3.13 — ScheduleEventController@update
- authorize('update', $event) (policy bloquea pasados)
- Actualizar

#### [ ] Task 3.14 — ScheduleEventController@destroy
- authorize('delete', $event) (policy + CompanySetting)
- Soft-delete


## 4. Routes

### [ ] Task 4.1 — Rutas admin (agendas)
- GET admin/schedules → schedules.index
- POST admin/schedules → schedules.store
- PUT admin/schedules/{schedule} → schedules.update
- DELETE admin/schedules/{schedule} → schedules.destroy
- PUT admin/schedules/{schedule}/authorized-users → schedules.authorized-users.update

### [ ] Task 4.2 — Rutas admin (eventos)
- GET admin/schedule-events → schedule-events.index (JSON)
- POST admin/schedules/{schedule}/events → schedule-events.store
- PUT admin/schedule-events/{event} → schedule-events.update
- DELETE admin/schedule-events/{event} → schedule-events.destroy

Ajustar nombres de rutas según convención del proyecto, pero mantener la separación.


## 5. Frontend (Inertia + React + Bootstrap)

### [ ] Task 5.1 — resources/js/Pages/Schedule/Index.jsx
- Sidebar:
  - listado agendas accesibles
  - checkbox/toggle por agenda → selectedScheduleIds
  - botón “Nueva agenda”
  - “Editar agenda” solo si schedule.can.update (owner) + permiso
- Main:
  - calendario con selector de vista día/semana/mes/lista
  - navegación temporal
- Persistencia:
  - guardar selectedScheduleIds en localStorage por companyId + userId
- Fetch eventos:
  - en datesSet y al cambiar selección → llamar API
  - si selectedScheduleIds vacío → no pedir (o pedir y recibir []) y mostrar hint

### [ ] Task 5.2 — Integrar FullCalendar
- Instalar:
  - @fullcalendar/react
  - @fullcalendar/daygrid
  - @fullcalendar/timegrid
  - @fullcalendar/list
  - @fullcalendar/interaction
- Conectar callbacks:
  - datesSet → fetch por rango
  - select → modal create event (si habilitado)
  - eventClick → modal edit

### [ ] Task 5.3 — Modales
- ScheduleFormModal (create/edit)
- AuthorizedUsersModal (pivot roles)
- EventFormModal (create/edit)
- Mostrar errores con FlashMessage (no SweetAlert)

### [x] Task 5.4 — Navegación del calendario
- Incluir botones de navegación prev/next para desplazarse entre años, meses y semanas
- Botones implementados en el header del calendario junto al botón "Hoy"
- Utilizar métodos `calendarApi.prev()` y `calendarApi.next()` de FullCalendar

### [x] Task 5.5 — Traducciones del calendario
- Configurar FullCalendar para usar el locale de la sesión (es, ca, en)
- Importar locales de FullCalendar: `@fullcalendar/core/locales/es`, `ca`, `en-gb`
- Configurar `locale` y `buttonText` en el componente FullCalendar
- Los textos del calendario (meses, días, botones) se muestran según el locale activo

### [x] Task 5.6 — Bloqueo de eventos en fechas pasadas
- Validar en `handleNewEvent` que la fecha de inicio no sea anterior a hoy
- Comparar solo fechas (resetear horas a 00:00:00) para permitir eventos del día actual
- Mostrar alerta usando `useSweetAlert` si se intenta crear evento en fecha pasada
- Bloquear la apertura del modal de creación si la fecha es pasada

### [x] Task 5.7 — Botón eliminar agenda
- Añadir botón de eliminación en cada agenda del sidebar
- Condiciones para mostrar el botón:
  - Usuario tiene permiso `schedules.destroy`
  - Usuario es owner de la agenda (`schedule.owner_id === userId`)
- Utilizar `useSweetAlert` con `showConfirm` para confirmar eliminación
- Usar botón con clase `btn-outline-danger` de Bootstrap para mantener consistencia con otros botones
- Tras confirmación, ejecutar `router.delete` a la ruta `schedules.destroy`
- El botón se muestra solo cuando se cumplen ambas condiciones (permiso + owner)

### [x] Task 5.8 — Fecha dinámica en header del calendario
- Añadir fecha dinámica formateada en el header del calendario
- Posición: centrada horizontalmente entre el selector de vistas y el desplazador de fecha
- La fecha cambia dinámicamente según la vista y navegación del calendario:
  - **Vista Día**: muestra fecha del día visible (dd/mm/yyyy)
  - **Vista Semana**: muestra intervalo de fechas (dd/mm - dd/mm/yyyy)
  - **Vista Mes**: muestra mes y año (ej: "Enero 2026")
  - **Vista Lista**: muestra intervalo de fechas (dd/mm - dd/mm/yyyy)
- Implementación:
  - Estado `currentDateRange` para almacenar rango visible actual
  - Actualizar en `handleDatesSet` cuando cambia la vista o navegación
  - Función `formatCurrentDate()` que formatea según la vista actual
  - Actualizar también al cambiar vista o usar botones prev/next/today
- Formato respeta el locale de la sesión (es, ca, en)
- Estilo: texto con `fw-semibold` para destacar la fecha

### [x] Task 5.9 — Controles de agenda en línea
- Unificar los controles de editar, agregar usuario y eliminar en una sola fila horizontal
- Todos los botones deben mostrarse en un único contenedor `d-flex gap-1`
- Condiciones de visibilidad:
  - Botón "Editar": visible si `schedule.can?.update`
  - Botón "Usuarios autorizados": visible si `schedule.can?.manageAuthorizedUsers`
  - Botón "Eliminar": visible si `permissions?.['schedules.destroy']` y `schedule.owner_id === userId`
- El contenedor solo se muestra si al menos uno de los botones es visible
- Añadir atributos `title` a cada botón para mejorar la accesibilidad
- Mantener los estilos existentes: `btn-outline-primary`, `btn-outline-secondary`, `btn-outline-danger`


## 6. QA & Tests

### [ ] Task 6.1 — Feature tests mínimos
- no acceso cross-company (agendas y eventos)
- viewer no crea/edita/borra eventos
- editor crea/edita/borra eventos (si directriz lo permite)
- owner edita agenda y gestiona compartición
- no borrar agenda con eventos futuros
- no editar evento pasado
- schedule-events.index devuelve [] si schedule_ids vacío


## 7. Checklist final

### [ ] Task 7.1 — Verificación de policies
- Controllers usan authorize() en todas las acciones
- Policies alineadas con owner_id
- Permisos de eventos usan schedule-events.*

### [ ] Task 7.2 — Verificación de scoping
- Toda query con company_id=currentCompany
- Accesibilidad siempre por owner o pivot

### [ ] Task 7.3 — Verificación UX
- Calendario solo muestra agendas seleccionadas
- Soft-delete aplicado y UI no “resucita” registros borrados






