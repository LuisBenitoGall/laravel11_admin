# Proposal: Data Tables Pattern Unification (Inertia + React + Bootstrap)

## Summary

Unificar la estructura de los listados tipo “Data Table” en el ERP mediante un contrato estándar backend → frontend y una vista base reutilizable. El objetivo es eliminar variaciones de “shape” (por ejemplo users, contacts, companies) y reducir duplicación en vistas Index, exportación y gestión de filtros/ordenación/paginación.

La propuesta introduce un contenedor único table en Inertia y una clave estándar rows para los datos paginados, acompañada de queryParams, permissions, columnPreferences, adhocFilters y activeFiltersLegend.


## Motivation / Problem

Situación actual:
- Las vistas Index de distintos dominios comparten un 80–90% del código, pero:
  - varía el nombre de la colección (users, companies, contacts, …).
  - los endpoints de exportación no siempre devuelven la misma clave.
  - se mezclan props “globales” y props de tabla sin una frontera clara.
- Esto provoca:
  - duplicación y divergencia de implementaciones.
  - bugs por inconsistencias en keys (especialmente export y filtrado masivo).
  - dificultad para migrar/mejorar useTableManagement y componentes compartidos.
  - coste alto para crear una nueva tabla “estándar”.


## Goals

- Establecer un contrato único de datos para Data Tables:
  - table.rows como colección estándar.
  - table.queryParams como estado de filtros/sort/paginación.
  - table.permissions, table.columnPreferences, table.adhocFilters, table.activeFiltersLegend.
- Reducir la complejidad de las vistas Index: que sean instancias de una estructura base con configuración de columnas y acciones.
- Estandarizar exportación: endpoint filteredData devuelve { rows: [...] }.
- Facilitar migraciones progresivas: adaptar tablas existentes sin reescribir todo.
- Garantizar coherencia multiempresa y permisos en el flujo estándar.


## Non-goals

- No se rediseña el UI/UX completo (solo se unifica el contrato y estructura base).
- No se elimina la lógica específica de dominios (joins, agregados, columnas custom).
- No se impone el uso de builder mode, show panel, bulk actions en todas las tablas.
- No se refactoriza todo el sistema de permisos (solo se normaliza su exposición a la UI).


## Proposed Design
1) Contrato backend → frontend (Inertia)

Cada listado debe devolver:
- table.id (ej: tblContacts)
- table.rows = Resource::collection($paginator)
- table.queryParams = querystring actual normalizado (request()->query() ?: [])
- table.permissions = permisos calculados para la pantalla
- table.columnPreferences = preferencias de columnas por usuario y tabla
- table.adhocFilters (si aplica) = configuración UI filtros avanzados
- table.activeFiltersLegend (si aplica) = leyenda de filtros activos

Datos específicos del dominio quedan fuera de table (combos, flags, builderMode, etc.).

2) Estandarización de la clave de colección
- En todas las pantallas: rows
- En todos los endpoints de exportación: { rows: ... }

Esto elimina filteredDataKey y la necesidad de parametrizar el nombre de la colección por tabla.

3) Frontend: vista base y hook estándar
- La vista Index debe:
  - leer table como fuente de verdad
  - renderizar controles comunes (ColumnFilter, RecordsPerPage, Exporter, AdHocFiltersDropdown)
  - renderizar FilterRow, SortControl, Pagination
- useTableManagement debe operar sobre table.id, table.queryParams y devolver tableQueryParams y handlers.

4) Migration path
Migración incremental por módulos:
- Paso 1: adaptar backend para enviar table.rows + table.queryParams en 1 pantalla de referencia (por ejemplo CrmContact).
- Paso 2: adaptar frontend Index a consumir table.*.
- Paso 3: estandarizar exportación (filteredData → { rows: ... }).
- Paso 4: extender al resto de listados.


## Implementation Plan (High-level)

1) Create/Update docs
- spec.md (ya hecho)
- proposal.md (este documento)
- tasks.md con tareas y DoD por etapa

2) Reference implementation
- Migrar una tabla representativa (CrmContact) para validar el patrón:
  - tiene filtros, adhoc, exportación, builderMode, show panel.

3) Hook and components alignment
- Ajustar useTableManagement para:
  - consumir queryParams desde table
  - no depender de nombres de colección variables
- Ajustar TableExporter para asumir { rows: [...] }.

4) Rollout
- Migrar listados por prioridad (frecuencia de uso / complejidad).
- Documentar “before/after” y checklist de adopción.


## Backwards Compatibility

Durante la migración:
- Se permite mantener temporalmente props legacy en raíz (ej: permissions, adhocFilters) si algún componente todavía los espera.
- Objetivo final: todos los componentes consumen table.*.
- Si una vista aún no migró:
  - puede seguir usando users/companies/contacts hasta su adaptación.


## Risks & Mitigations

- Riesgo: divergencia de shape en exportación
  - Mitigación: contrato estricto { rows: ... } + tests básicos por endpoint.
- Riesgo: useTableManagement depende de props legacy
  - Mitigación: refactor incremental con compat layer (fallback a legacy si table no existe).
- Riesgo: tablas con requisitos “raros”
  - Mitigación: patrón define core + extensiones (builder/show/bulk), sin forzar a todos.
- Riesgo: aumento de payload
  - Mitigación: solo incluir en table lo necesario; combos pesados cacheados.


## Success Criteria

- Crear una tabla nueva requiere:
  - definir columns[]
  - implementar index() con table.*
  - implementar filteredData() con { rows: ... }
  - sin pelearse con claves users/contacts/companies
- Index.jsx reduce duplicación: estructura base casi idéntica entre módulos.
- Exportación funciona en todas las tablas sin configuración por clave.
- Menos bugs por inconsistencias de payload.


## Open Questions (para cerrar en tasks)

- ¿Nombre definitivo del “data key”? Se propone rows. Alternativas: items. (Decisión: rows por alineación con tablas).
- ¿Los permisos deberían exponerse como permissions o can? (Se mantiene permissions por compatibilidad; can podría ser evolución).
- ¿Dónde persistir queryParams además de querystring? (Por ahora querystring; session solo si hay necesidad clara).