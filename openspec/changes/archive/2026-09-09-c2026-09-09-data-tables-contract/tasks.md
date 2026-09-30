## 0. Contrato (confirmado — Architecture)

- [x] 0.1 Confirmar claves estándar = canónica `openspec/specs/core/patterns/data_tables_spec/spec.md`: `table.id`, `table.rows`, `table.queryParams`, `table.permissions`, `table.columnPreferences`, `table.adhocFilters`, `table.activeFiltersLegend` (+ `meta` opcional)
- [x] 0.2 Dar por hecha la referencia CrmContact (`index` + `filteredData` + Index.jsx ya en `table.*` / `{ rows }`); no reimplementar salvo gap mínimo por el hook
- [x] 0.3 Diferir rollout de otros listados y cleanup legacy global a changes futuros (opción 2)

## 1. Hook useTableManagement

- [x] 1.1 Priorizar `payload.rows` (array o `{ data }`) en `extractRows` / `filteredData` antes de `filteredDataKey` y `entityName`
- [x] 1.2 Mantener fallbacks legacy (`filteredDataKey`, entityName, autodetection) para Indexes no migrados
- [x] 1.3 Preferir permisos/prefs desde `table` cuando estén disponibles; fallback a `usePage().props` legacy
- [x] 1.4 Verificar export CrmContact (o test/manual) obtiene filas sin `filteredDataKey` de dominio

## 2. TableExporter / consumo

- [x] 2.1 Asegurar que con el array que devuelve el hook (o payload `{ rows }`) la export Excel/PDF sigue OK
- [x] 2.2 Confirmar que AdHocFiltersDropdown / ActiveFiltersLegend en CrmContact no dependen de props globales fuera de `table.*` (ajustar solo si hay gap real)

## 3. Guía y checklist

- [x] 3.1 Añadir `openspec/specs/core/patterns/data_tables_spec/migration_guide.md` (o sección equivalente) con shape backend/frontend y props in/out de `table`
- [x] 3.2 Incluir checklist DoD por tabla (paginación, sort, header filters, adhoc+legend, column prefs, export, permisos, company scope)

## 4. Verificación

- [x] 4.1 Smoke: listado CrmContact (filtros/sort/paginación/export) tras el cambio de hook
- [x] 4.2 Smoke: al menos un Index legacy que use `filteredDataKey` no regresa
- [x] 4.3 `/opsx-verify` (o checklist vs design/tasks) sin hallazgos bloqueantes

## Fuera de este change (no implementar)

- Migración Users / Companies / Products / Orders / otros Indexes a `table.*`
- Eliminar por completo `filteredDataKey` y claves variables en todo el repo
