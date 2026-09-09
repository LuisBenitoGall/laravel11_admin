## Context

Patrón Data Tables unificado (Inertia + React + Bootstrap). Spec canónica: `openspec/specs/core/patterns/data_tables_spec/spec.md`. Change legacy `2026-01-15_data-tables` (proposal + tasks epic) no era apply-ready. Decisión de producto (2026-09-09): **opción 2** — cerrar contrato (hook/exporter/guía); CrmContact ya es referencia; rollout = changes futuros.

Estado factual:
- `CrmContactController@index` envía `table.{id,rows,queryParams,permissions,columnPreferences,adhocFilters,activeFiltersLegend}`.
- `filteredData` responde `{ rows: UserResource::collection(...) }`.
- `CrmContact/Index.jsx` deriva de `table`.
- `useTableManagement.extractRows` aún prioriza `filteredDataKey` / `entityName` y **no** `payload.rows` primero → riesgo en export cuando la clave es `rows`.
- Otros Indexes (Users, CrmAccount, …) siguen legacy; **no** se migran en este change.

## Goals / Non-Goals

**Goals:**
- Contrato `table.*` / `rows` confirmado y operable en hook + exporter.
- Guía + checklist DoD para adoptar el patrón en changes futuros.
- Compat legacy temporal (vistas no migradas no se rompen).

**Non-Goals:**
- Migrar listados existentes (Users, Companies, Products, Orders, …).
- Eliminar por completo `filteredDataKey` / claves variables en todo el repo.
- Rediseño UI/UX de tablas.
- Cambiar Policies/permisos Spatie.

## Decisions

1. **Fuente de verdad del contrato**  
   La canónica `data_tables_spec` manda. Este change no redefine claves; las confirma: `table.rows`, `table.queryParams`, `table.permissions`, `table.columnPreferences`, `table.adhocFilters`, `table.activeFiltersLegend`, más `table.id` (y `meta` opcional).

2. **Referencia CrmContact = hecha**  
   T1 del epic legacy se considera implementada. Implementation solo toca CrmContact si el ajuste del hook exige un cambio mínimo de props (p. ej. pasar permissions desde `table`).

3. **`useTableManagement` — orden de extracción**  
   En `extractRows` / `filteredData`:  
   1) `payload.rows` (array o `{ data: [] }`)  
   2) `filteredDataKey` si se pasa (compat)  
   3) `entityName` / kebab→snake (compat)  
   4) autodetection legacy  
   Preferir `table.permissions` y prefs de `table.columnPreferences` cuando el caller las aporte o cuando `usePage().props.table` exista; fallback a `props.permissions` / `props.columnPreferences`.

4. **TableExporter**  
   `fetchData` ya normaliza array / `{ data }`. Debe seguir funcionando cuando el hook devuelve el array plano de filas **o** cuando se le pase el payload `{ rows }`. No reaplicar Title Case; fechas según reglas ya existentes (`birthday` / `export: 'date'`).

5. **Guía**  
   Documento corto `migration_guide.md` (o sección en la canónica) con: shape `index` / `filteredData`, qué va dentro/fuera de `table`, checklist DoD por tabla. Sin tutorial largo.

6. **Rollout diferido**  
   Cada listado futuro = change propio (o lote pequeño explícito). Este change **no** incluye tareas de migración de dominio.

7. **Alternativas descartadas**  
   - Epic único T5/T6 en este change: demasiado amplio; bloquea apply.  
   - Solo archivar el legacy sin change nuevo: se pierde checklist de cierre del contrato.  
   - Forzar migración de todos los Indexes ahora: fuera de la opción 2 acordada.

## Risks / Trade-offs

- **[Riesgo]** Compat legacy alarga la doble verdad → **Mitigación**: orden `rows` primero; documentar deprecación de `filteredDataKey`; cleanup en change futuro cuando no queden usos.  
- **[Riesgo]** Export CrmContact ya frágil si `extractRows` no ve `rows` → **Mitigación**: tarea explícita + test/manual verify export.  
- **[Trade-off]** Permisos siguen a veces en raíz Inertia por compat; objetivo final `table.permissions` sin romper Indexes legacy.

## Migration Plan

- Sin schema DB. Deploy: JS (hook/exporter) + doc.  
- Rollback: revertir hook.  
- Tras merge: abrir changes de migración por listado según prioridad de negocio.

## Open Questions

Ninguna bloqueante. Opción 2 confirmada por el usuario (2026-09-09).
