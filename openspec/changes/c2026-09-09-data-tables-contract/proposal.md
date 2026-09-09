## Why

El change legacy `2026-01-15_data-tables` quedó inválido para el CLI (underscores / nombre con dígito), sin `design.md` ni specs delta, y con un epic T5/T6 (migrar todos los listados + limpiar legacy) demasiado amplio. Ya existe la spec canónica `openspec/specs/core/patterns/data_tables_spec/spec.md` y CrmContact es la referencia en código (`table.*` + `filteredData` → `{ rows }`). Hace falta un change apply-ready que cierre el **contrato operativo** (hook, exporter, guía) sin el rollout masivo.

## What Changes

- Confirmar el contrato `table.*` / `rows` = canónica existente (sin reinventar).
- Dar por cerrada la referencia CrmContact (ya en producción de código); solo gaps reales si aparecen en verify.
- Ajustar `useTableManagement` para preferir `payload.rows`, compat legacy temporal, y `table.permissions` / `table.columnPreferences` cuando existan.
- Alinear `TableExporter` / `fetchData` al contrato `{ rows }` (incl. Resource `data`).
- Añadir guía breve + checklist DoD bajo `openspec/specs/core/patterns/data_tables_spec/` (o anexo del change syncable).
- **Fuera de alcance:** migración de Users/Companies/Products/Orders y demás Indexes; eliminación total del soporte legacy (changes futuros por dominio).

## Capabilities

### New Capabilities

- (ninguna capability de dominio nueva)

### Modified Capabilities

- `data-tables-pattern`: delta sobre la canónica — preferencia `rows` en el hook/export, capa compat, guía de adopción. El rollout por listado queda como cambios posteriores.

## Impact

- Frontend: `resources/js/Hooks/useTableManagement.jsx`, `TableExporter` (si hace falta), posiblemente consumo de permisos/prefs desde `table` en CrmContact si el hook lo exige.
- Docs: guía/checklist junto a `data_tables_spec`.
- Supersede: `openspec/changes/2026-01-15_data-tables` (archivar como superseded).
- Sin migraciones, sin permisos Spatie nuevos, sin UI nueva de listados.
