# marketing-lists-index-created-at Specification

## Purpose
TBD - created by archiving change c2026-09-30-marketing-lists-created-at-column. Update Purpose after archive.
## Requirements
### Requirement: Columna fecha de creación en el listado de listas
La vista `/admin/marketing-lists` MUST mostrar, en la tabla de listados, una columna con la fecha de creación de cada lista. Esa columna MUST estar inmediatamente a la izquierda de la columna Acciones. Las columnas Lista, Miembros, Autor y Acciones MUST conservar su función actual. La columna MUST incluir el filtro de rango de fechas del estándar admin (`filter: 'date'` + `dateKeys: ['date_from', 'date_to']`), el mismo patrón que Fecha alta en `/admin/users`. El backend MUST filtrar `marketing_lists.created_at` con esos query params (ya cableados en `dataQuery`).

#### Scenario: Posición de la columna
- **WHEN** un usuario autorizado abre el índice de listas de marketing
- **THEN** ve la columna de fecha de creación a la izquierda de Acciones
- **AND** las columnas Lista, Miembros, Autor y Acciones conservan su función actual

#### Scenario: Sort por fecha de creación
- **WHEN** el usuario ordena por la columna de fecha de creación
- **THEN** el listado se ordena por `marketing_lists.created_at` (campo ya permitido en el backend)

#### Scenario: Filtro de rango de fechas
- **WHEN** el usuario elige un rango en el DatePicker de la columna fecha de creación
- **THEN** el índice recarga con `date_from` y `date_to`
- **AND** solo se listan las listas cuyo `created_at` cae en ese rango (inclusive, día completo)

### Requirement: Formato de fecha según idioma de sesión
La celda MUST mostrar `created_at` con el formato de `LocaleTrait` índice `[4]` del locale de sesión (`es`/`ca`: `d/m/Y`; `en`: `Y/m/d`). Si el resource envía ese string ya formateado, la celda MUST pintarlo tal cual y MUST NOT sustituirlo por un `dd/MM/yyyy` fijo del frontend. La cabecera MUST usar `__('fecha_creacion')` (clave existente en `es`; MUST existir equivalencia en `en`).

#### Scenario: Locale español o catalán
- **WHEN** el locale de sesión es `es` o `ca`
- **THEN** la fecha de creación se muestra con formato `d/m/Y`

#### Scenario: Locale inglés
- **WHEN** el locale de sesión es `en`
- **THEN** la fecha de creación se muestra con formato `Y/m/d`

#### Scenario: Valor ya localizado no se re-formatea
- **WHEN** el resource envía `created_at` ya formateado con `LocaleTrait` índice `[4]`
- **THEN** la celda muestra ese valor
- **AND** MUST NOT sustituirlo por un `dd/MM/yyyy` fijo del frontend

