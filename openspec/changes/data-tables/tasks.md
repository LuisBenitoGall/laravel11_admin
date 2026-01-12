# Tasks: Data Tables Pattern Unification

## Agent instructions (cuando aplique)

- Tras completar una tarea, marca su checkbox como completado (`[x]`) en este archivo.
- No marques tareas si no se cumple el criterio “Done”.
- Si durante la ejecución se detecta que una tarea necesita cambios de alcance o decisiones nuevas:
  - no la marques
  - añade una nota bajo la tarea con el bloqueo y la decisión pendiente.
- Si se completa parcialmente, deja el checkbox sin marcar y añade nota con lo pendiente.

## Epic: Data Tables Pattern (Backend + Frontend) 

Objetivo

Estandarizar y unificar el patrón de Data Tables mediante un contrato table.* y una clave única rows, reduciendo duplicación y eliminando variaciones por dominio.


## T0. Preparación y decisión de contrato

Descripción:
- Fijar naming definitivo del contrato para evitar “dobles verdades” durante meses.

Acciones
- [ ] Confirmar claves estándar:
  - table.rows
  - table.queryParams
  - table.permissions
  - table.columnPreferences
  - table.adhocFilters
  - table.activeFiltersLegend

- Definition of Done:
  - Contrato final anotado en spec.md y aceptado como regla del proyecto.


## T1. Reference implementation (CrmContact)

### T1.1 Backend: adaptar index() a table.*

Acciones:
- [ ] Encapsular datos de tabla en table:
  - id, rows, queryParams, permissions, columnPreferences, adhocFilters, activeFiltersLegend
- [ ] Mantener fuera de table:
  - combos (salutations, contact_types, etc.)
  - flags (leads, builderMode, builderList)
- [ ] Asegurar que rows es Resource::collection($paginator).

- Definition of Done:
  - Admin/CrmContact/Index recibe table completo y funciona sin leer props legacy.

### T1.2 Backend: adaptar filteredData() a { rows: ... }

Acciones:
- [ ] Cambiar JSON para devolver:
  - { rows: UserResource::collection($users) }
- [ ] Eliminar claves variables (users, contacts, etc.).
- [ ] Mantener cache key existente (ajustar si usa el nombre anterior).

- Definition of Done:
  - Exporter/SelectAll masivo obtiene filas desde rows y no requiere filteredDataKey.

### T1.3 Frontend: adaptar CrmContact/Index.jsx

Acciones:
- [ ] Cambiar firma: recibir table en lugar de rows/queryParams/adhocFilters/activeFiltersLegend sueltos.
- [ ] Derivar:
  - rows = table.rows
  - queryParams = table.queryParams
  - adhocFilters = table.adhocFilters
  - legendItems = table.activeFiltersLegend
  - tableId = table.id
- [ ] Corregir shadowing: evitar const rows = await filteredData(...) (usar allRows).
- [ ] Usar rows?.data || [] y null guards.

- Definition of Done:
  - La vista renderiza y opera exactamente igual que antes:
    - filtros, sort, paginación, column filter, export, legend, builder mode.
  - No depende de usePage().props.adhocFilters ni usePage().props.activeFiltersLegend.


## T2. Hook: useTableManagement compat + normalización

Descripción:
- Reducir parámetros obligatorios y soportar table.*.

Acciones: 
- [ ] Aceptar queryParams desde table.queryParams.
- [ ] Mantener fallback legacy si se usa en vistas aún no migradas.
- [ ] Eliminar dependencia de filteredDataKey:
  - asumir que el endpoint devuelve { rows: ... }.
- [ ] Asegurar que permissions se obtienen desde table.permissions o fallback legacy.

- Definition of Done:
  - useTableManagement funciona para:
    - vistas migradas (table.*)
    - vistas legacy (hasta que se migren)
  - No requiere filteredDataKey.


## T3. Componentes: exportación y filtros avanzados

### T3.1 TableExporter

Acciones:
- [ ] Asegurar que el callback fetchData espera que el endpoint devuelva { rows: ... }.
- [ ] Si hoy el exporter espera un array plano, adaptar para soportar:
  - rows.data (Resource collection)
  - o rows como array (si algún endpoint aún lo hace, temporalmente)

- Definition of Done:
  - Exportación funciona con el contrato { rows: ResourceCollection }.

### T3.2 AdHocFiltersDropdown y ActiveFiltersLegend

Acciones:
- [ ] Confirmar que ambos consumen queryParams y no dependen de props globales.
- [ ] Asegurar que los handlers (remove badge, apply filter) reconstruyen querystring de forma consistente.

- Definition of Done:
  - Filtros adhoc + legend operan sin depender de keys fuera de table.*.


## T4. Migration guide y checklist

Descripción:
- Formalizar el proceso para que futuras tablas se creen siguiendo el patrón.

Acciones:
- [ ] Añadir guía breve:
  - cómo estructurar index() y filteredData()
  - cómo estructurar Index.jsx
  - qué props van dentro/fuera de table
- [ ] Añadir checklist DoD por tabla.

- Definition of Done:
  - Documento añadido en data_tables_spec/ (puede ser migration_guide.md o integrado en spec.md).


## T5. Rollout: migración progresiva de listados existentes

Descripción:
- Migrar listados al contrato table.* según prioridad.

Candidatos típicos:
- Users
- Companies
- Products
- Orders
- Cualquier Index con export y filtros

Acciones (por cada tabla)
- [ ] Backend:
  - mover payload a table.*
  - filteredData() → { rows: ... }
- [ ] Frontend:
  - Index consume table.*
  - ajustar useTableManagement params mínimos

- Definition of Done (por tabla):
  - Paginación OK
  - Sort OK
  - Header filters OK
  - AdHoc filters + legend OK (si aplica)
  - Column preferences OK
  - Export OK
  - Permisos OK
  - Scope company OK


## T6. Limpieza final (cuando todas estén migradas)

Acciones:
- [ ] Eliminar soporte legacy en useTableManagement (si ya no se usa).
- [ ] Eliminar claves antiguas en endpoints de exportación.
- [ ] Consolidar tests básicos (si existen) para:
  - allowed sort fields
  - company scope
  - response shape

- Definition of Done:
  - El proyecto ya no usa colecciones con nombre variable en Inertia (users, contacts, etc.) para tablas.
  - Exportación siempre devuelve { rows: ... }.
  - El contrato table.* es el único vigente.