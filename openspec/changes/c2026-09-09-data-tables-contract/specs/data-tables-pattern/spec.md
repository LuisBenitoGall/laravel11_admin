## MODIFIED Requirements

### Requirement: Extracción estándar de filas desde filteredData

El cliente de tablas (`useTableManagement` y cualquier `fetchData` de exportación) MUST obtener las filas prioritariamente desde la clave `rows` del JSON de `filteredData` (array de filas o colección Resource con `data`). MAY conservar fallbacks legacy (`filteredDataKey`, nombre de entidad, autodetection) solo mientras existan vistas no migradas. MUST NOT depender de una clave de dominio distinta de `rows` en vistas que ya usan el contrato `table.*`.

#### Scenario: Export con contrato rows

- **WHEN** el endpoint `filteredData` responde `{ "rows": [ ... ] }` o `{ "rows": { "data": [ ... ] } }`
- **THEN** la exportación obtiene el listado de filas sin configurar `filteredDataKey` de dominio

#### Scenario: Vista legacy sigue funcionando

- **WHEN** un Index no migrado aún pasa `filteredDataKey` (p. ej. `accounts`)
- **THEN** el hook sigue extrayendo filas por esa clave (compat temporal)

### Requirement: Guía de adopción del patrón table.*

El repositorio MUST documentar cómo adoptar el patrón: estructura de `index()` con `table.*`, `filteredData()` → `{ rows }`, qué props van dentro/fuera de `table`, y un checklist DoD por tabla (paginación, sort, filtros cabecera, adhoc+legend si aplica, column preferences, export, permisos, scope company). La guía MUST alinearse con `openspec/specs/core/patterns/data_tables_spec/spec.md` y MUST NOT exigir migrar todos los listados en un solo change.

#### Scenario: Equipo crea o migra una tabla

- **WHEN** se implementa un listado nuevo o se migra uno existente en un change dedicado
- **THEN** la guía/checklist es suficiente para cumplir el contrato sin reinventar claves

## ADDED Requirements

### Requirement: Alcance de este change (sin rollout masivo)

Este change MUST NOT migrar Indexes de otros dominios (Users, Companies, Products, Orders, etc.) ni eliminar el soporte legacy global. El listado CrmContact se considera la referencia ya adoptada del contrato `table.*`.

#### Scenario: Fuera de alcance explícito

- **WHEN** se evalúa el DoD de este change
- **THEN** no se exige que Users u otros Indexes consuman `table.*`
