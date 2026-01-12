- 06/01/2026:
# TAREA: Implementar módulo Schedule (Agendas + Eventos) según spec/proposal/tasks

Estás trabajando en un ERP multiempresa (Laravel 11 + Inertia + React + Bootstrap). PHP 8.2 y Node 22.18.

## ARCHIVOS A LEER ANTES DE CODIFICAR (OBLIGATORIO)
1) `openspec/specs/modules/schedule/spec.md`
2) `openspec/changes/modules/schedule/proposal.md`
3) `openspec/changes/modules/schedule/tasks.md`

Regla: si alguno no existe o no coincide con este prompt, DETÉN la ejecución y solicita la corrección (no continúes con suposiciones).
No uses documentación externa como fuente principal. El contrato está en openspec.

## FUENTE DE VERDAD
Implementa el módulo siguiendo las rutas anteriores. No uses otras versiones. No inventes reglas.


## REGLAS GLOBALES (OBLIGATORIAS)
- Multiempresa estricta: toda query/operación debe aplicar `company_id = currentCompany` (CompanyContext o session('currentCompany')).
- Nunca permitir operar sobre recursos de otra empresa aunque el usuario tenga permisos en otra.
- Soft-delete SIEMPRE en `schedules` y `schedule_events`.
- El calendario SOLO muestra eventos de agendas seleccionadas. Si `schedule_ids` viene vacío en el endpoint de eventos, devolver `[]`.
- Solo el owner puede editar una agenda y gestionar compartición (además de permisos).
- Guíate taxativamente por los siguientes archivos de convenciones globales de organización de archivos y reglas de layout:
  - openspec/_global/ui-form-components.md (reglas de formularios).
  - openspec/_global/admin-layout-conventions.md (reglas de layout del admin).


## POLICIES (YA CREADAS: NO SOBRESCRIBIR)
- `app/Policies/SchedulePolicy.php`
- `app/Policies/ScheduleEventPolicy.php`

Obligatorio:
- NO sobrescribas estos archivos.
- Solo adapta referencias necesarias por cambios de nombres (p.ej. `owner_user_id` -> `owner_id`) y asegúrate de que concuerdan con los modelos/relaciones finales.
- Controllers deben usar `$this->authorize(...)` en todas las acciones CRUD.
- Listados deben filtrar por `company_id=currentCompany` y accesibilidad (owner o pivot).
- Respetar reglas: no editar eventos pasados (`ends_at < now()`), no borrar agendas con eventos futuros (`ends_at > now()`), borrado de eventos condicionado por CompanySetting (`schedule_events_allow_delete`) si existe.

## FORM COMPONENTS POLICY (OBLIGATORIA)
- Todos los formularios DEBEN construirse exclusivamente con componentes existentes en `resources/js/components`.
- PROHIBIDO usar directamente `<input>`, `<select>`, `<textarea>`, `<button>` en páginas/forms (salvo dentro de los componentes UI).
- Errores de validación deben mostrarse mediante `InputError.jsx` y el patrón estándar con Inertia `errors`.

Componentes disponibles (usar siempre):
- Text input: `TextInput.jsx`
- Checkbox: `Checkbox.jsx`
- Color: `ColorPicker.jsx`
- Botones: `PrimaryButton.jsx`, `SecondaryButton.jsx`, `DangerButton.jsx`
- Select: `SelectInput.jsx`
- Select con búsqueda: `SelectSearch.jsx`
- Usuarios autocomplete: `UserSearch.jsx`
- Textarea/WYSIWYG: `Textarea.jsx`
- Fecha form: `DatePickerToForm.jsx`
- Fecha filtros tablas: `DatePicker.jsx`
- File: `FileInput.jsx`
- Multiple file: `DropzoneGallery.jsx`
- Radio: `RadioButton.jsx`
- Ubicación anidada: `LocationSelects.jsx`

STOP-THE-LINE:
- Si se necesita un control sin componente existente, DETÉN el desarrollo del formulario y crea primero el componente en `resources/js/components` (props + ejemplo), luego continúa.

## NOMENCLATURA IMPORTANTE
- Campo del owner en schedules: `owner_id` (NO `owner_user_id`).
- Requests deben seguir convención: Modelo + Acción.
  - `ScheduleStoreRequest`, `ScheduleUpdateRequest`
  - `ScheduleAuthorizedUsersSyncRequest` (o nombre equivalente siguiendo Modelo+Acción)
  - `ScheduleEventStoreRequest`, `ScheduleEventUpdateRequest`
- Permisos compuestos usan GUION `-` (no `_`) para eventos:
  - `schedule-events.index|show|create|update|destroy|search`
- Antes de crear permisos, comprobar si ya existen en tabla `permissions` (idempotente: usar `firstOrCreate` o equivalente).

## IMPLEMENTACIÓN (CHECKLIST)
Ejecuta las tareas en este orden y marca cambios con commits lógicos:

### 1) Migrations
- Crear migrations para:
  - `schedules` (company_id, owner_id, name, description, color, status, softDeletes)
  - pivot `schedule_user` (schedule_id, user_id, role string required, timestamps, unique)
    - NO enums. Roles gestionados por trait (constantes + helpers).
  - `schedule_events` (company_id, schedule_id, created_by, title, description, location, starts_at, ends_at, all_day, status, softDeletes)
- Índices según tasks.

### 2) Trait de roles
- Crear trait (ej. `app/Support/Traits/HasScheduleRoles.php` o ubicación equivalente) con:
  - constantes ROLE_OWNER/ROLE_EDITOR/ROLE_VIEWER
  - `scheduleRoles(): array`
  - `isValidScheduleRole(string $role): bool`
  - (opcional) normalizador
- Usarlo donde aplique (validación request, pivot sync, policies si lo consideras).

### 3) Models
- Crear `Schedule` y `ScheduleEvent` con relaciones:
  - Schedule: company(), owner() (FK owner_id), events(), authorizedUsers() pivot role + timestamps
  - Scope `visibleTo(User $user)` (owner o pivot)
  - Event: schedule(), company(), createdBy()
- SoftDeletes habilitado.
- Asegurar que las policies pueden consultar `authorizedUsers()` (o adapta policy a la relación final).

### 4) Permissions
- Asegurar (idempotente) permisos:
  - `module_schedule`
  - `schedules.*`
  - `schedule-events.*`
- Verificar que policies/controllers usan `schedule-events.*` (guion).

### 5) Controllers + Requests
- Crear FormRequests con validaciones:
  - color hex, fechas coherentes, roles válidos (vía trait)
- Crear `ScheduleController`:
  - index/store/update/destroy/updateAuthorizedUsers
  - usar authorize() en todas
- Crear `ScheduleEventController`:
  - index JSON por rango:
    - si schedule_ids vacío => []
    - filtrar por company + schedule_ids + accesibilidad
    - solape rango: starts_at < end AND ends_at > start
  - store nested bajo schedule (authorize create [ScheduleEvent::class, $schedule])
  - update/destroy con authorize()

### 6) Routes
- Añadir rutas admin:
  - schedules CRUD + authorized-users sync
  - schedule-events index/update/destroy + store nested

### 7) Frontend
- Crear `resources/js/Pages/Schedule/Index.jsx`:
  - Sidebar agendas accesibles con checkboxes para seleccionar
  - Persistir selección en localStorage por companyId+userId
  - Calendario con FullCalendar (día/semana/mes/lista)
  - Fetch eventos al cambiar rango o selección
  - Si selección vacía: no eventos + hint
- Modales:
  - ScheduleFormModal, AuthorizedUsersModal, EventFormModal
  - Usar SOLO componentes de `resources/js/components`
  - Errores via `InputError` / `FlashMessage` (no SweetAlert)

### 8) Tests (mínimos)
- Feature tests:
  - no cross-company
  - roles viewer/editor/owner
  - no delete schedule con eventos futuros
  - no update evento pasado
  - delete evento condicionado por CompanySetting (si existe)
  - schedule-events.index devuelve [] si schedule_ids vacío

## ENTREGA
- Implementación completa con archivos creados y cableados (migrations, models, requests, controllers, routes, frontend).
- No dejar TODOs sin explicar.
- No introducir HTML inputs crudos en formularios.
- No sobrescribir policies; solo ajustar owner_id y relación si procede.


---------------------------------------------------------

- 07/01/2026:
# REFACTOR: Alinear módulo Schedule con convenciones globales (sin romper nada)

Proyecto: Laravel 11 + Inertia + React + Bootstrap (PHP 8.2, Node 22.18)

## ARCHIVOS A LEER ANTES DE MODIFICAR CÓDIGO (OBLIGATORIO)
1) `openspec/_global/admin-layout-conventions.md`
2) `openspec/specs/modules/schedule/spec.md`
3) `openspec/changes/modules/schedule/proposal.md`
4) `openspec/changes/modules/schedule/tasks.md`

Regla: si alguno no existe o contradice este prompt, DETÉN y reporta el problema. No improvises.

## OBJETIVO
Refactorizar lo ya generado del módulo Schedule para cumplir las nuevas convenciones globales, aplicando SOLO cambios necesarios (idempotente). 
Antes de tocar nada, haz auditoría: detecta qué reglas ya están cumplidas y cuáles no.

## REGLAS CRÍTICAS (NO NEGOCIABLES)
- NO sobrescribir ni rediseñar las policies existentes.
- NO cambiar lógica de negocio ni comportamiento, salvo ajustes estrictamente necesarios por convenciones (imports, rutas, layout, propiedades, etc.).
- Cambios mínimos: si una regla ya está aplicada, NO hacer nada ahí.

## CONVENCIONES A APLICAR (desde admin-layout-conventions.md)
Verifica y ajusta si falta:
1) Controllers:
   - Namespace: `App\Http\Controllers\Admin` (salvo que el spec diga otra cosa).
   - Deben declarar SIEMPRE:
     - `private string $module = '[slug-modulo]';`
     - `private string $option = '[slug-modulo-castellano]';`
     - `protected array $permissions = [];`
   - IMPORTANTE: si estas propiedades ya existen, no duplicarlas.
   - Si existen con otro tipo (sin tipado), respeta el estilo del proyecto, pero asegúrate de que existan y estén inicializadas.
   - Valores:
     - Si ya hay valores coherentes, respétalos.
     - Si están en blanco o placeholders, asigna valores razonables:
       - ScheduleController: module = `schedule`, option = `agendas`
       - ScheduleEventController: module = `schedule`, option = `agendas`
       - ScheduleEventTypeController: module = `schedule`, option = `agendas` (salvo que el proyecto use option distinta para tipos; en ese caso usa la existente en menús/traducciones si está disponible).

2) Pages (Inertia React):
   - Por defecto deben alojarse en `resources/js/Pages/Admin/[Model]/`
   - Deben declarar siempre `const actions = [];` (aunque esté vacío).
   - Estructura de return obligatoria (según global):
     - `AdminAuthenticatedLayout user={auth.user} title={title} subtitle={subtitle} actions={actions}`
     - `<Head title={title} />`
     - `<div className="contents">...</div>`

## AUDITORÍA PREVIA (OBLIGATORIA)
Antes de modificar:
- Localiza los controllers del módulo:
  - `ScheduleController`
  - `ScheduleEventController`
  - `ScheduleEventTypeController`
  Verifica namespace y propiedades requeridas.
- Localiza las Pages del módulo:
  - Index y Partials/Modals (ScheduleFormModal, EventFormModal, AuthorizedUsersModal)
  Verifica:
  - ruta actual (si ya están en `Pages/Admin/Schedule`, no mover)
  - `const actions = [];`
  - estructura de layout en Index.jsx (y en Pages si aplica)
- Revisa imports que puedan romperse si hay movimiento de archivos (actualiza rutas si es necesario).
- Identifica qué puntos ya están cumplidos y NO los toques.

## EJECUCIÓN (CAMBIOS MÍNIMOS)
Aplica únicamente lo que falte:

### A) Controllers
- Si algún controller no está bajo `App\Http\Controllers\Admin`, mover/actualizar namespace (solo si NO está ya correcto).
- Añadir las 3 propiedades si faltan.
- No tocar métodos ni authorize() salvo para mantener compilación si cambian imports.

### B) Pages
- Si la ruta no cumple `resources/js/Pages/Admin/Schedule/`, mover solo si realmente está fuera.
- Asegurar que `Index.jsx` declara `const actions = [];` y que el return cumple el layout global.
- No meter HTML inputs crudos si hay formularios. Mantener componentes en `resources/js/components` (no reimplementar formularios).

### C) Sanidad
- Asegurar que compila: imports de `Head`, `AdminAuthenticatedLayout`, y rutas relativas correctas a Partials.
- Si hay referencias a rutas antiguas después de mover archivos, corregirlas.

## CRITERIOS DE ACEPTACIÓN
- Controllers del módulo en namespace Admin y con las 3 propiedades declaradas (sin duplicados).
- Pages del módulo en `resources/js/Pages/Admin/Schedule/` (si no lo estaban) y `Index.jsx` con `const actions = [];`.
- `Index.jsx` retorna la estructura exacta del layout global.
- Cero cambios de lógica de negocio.
- El módulo sigue funcionando y compilando.

## ENTREGA
- Haz los cambios necesarios y deja el repo consistente.
- Si encuentras que ya está todo cumplido, no cambies nada y reporta “sin cambios necesarios”.
- No reformatees archivos enteros: cambios mínimos y localizados.


