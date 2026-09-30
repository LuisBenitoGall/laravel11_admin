## ADDED Requirements

### Requirement: Columna fecha de alta en el listado de contactos
La vista `/admin/crm-contacts` MUST mostrar una columna con la fecha de alta del usuario (`users.created_at`) inmediatamente a la izquierda de la columna Imagen. Las demás columnas y Acciones MUST conservar su función actual. La columna MUST poder ocultarse y mostrarse con el selector de columnas existente.

#### Scenario: Posición de la columna
- **WHEN** un usuario autorizado abre `/admin/crm-contacts`
- **THEN** ve la columna Fecha alta inmediatamente a la izquierda de Imagen
- **AND** el resto de columnas conservan su función actual

#### Scenario: Columna ocultable
- **WHEN** el usuario desactiva la columna en el selector de columnas
- **THEN** no se muestran cabecera, filtro ni celdas de esa columna
- **AND** el resto de la tabla sigue funcionando

#### Scenario: Sort por fecha de alta
- **WHEN** el usuario ordena por la columna Fecha alta
- **THEN** el listado se ordena por `users.created_at`

### Requirement: Filtro datepicker en la misma vista
La columna MUST incluir un datepicker de rango (`date_from` / `date_to`). Aplicar el rango MUST filtrar por `users.created_at` y MUST recargar la misma ruta índice conservando el resto de query params (incluidos `marketing_list_id` y `build_marketing_list` si el modo builder está activo).

#### Scenario: Filtro por rango
- **WHEN** el usuario elige un rango en el datepicker de Fecha alta
- **THEN** el índice se recarga en la misma ruta con `date_from` y/o `date_to`
- **AND** las filas cumplen `users.created_at` dentro de ese rango

### Requirement: Formato de fecha según idioma de sesión
La celda MUST mostrar `created_at` con `LocaleTrait` índice `[4]` (`es`/`ca`: `d/m/Y`; `en`: `Y/m/d`). Si el resource envía ese string, la celda MUST pintarlo tal cual y MUST NOT sustituirlo por un `dd/MM/yyyy` fijo del frontend. La cabecera MUST usar `__('fecha_alta')`. El listado MUST seleccionar `users.created_at` en la query agrupada para que el valor exista.

#### Scenario: Locale español o catalán
- **WHEN** el locale de sesión es `es` o `ca`
- **THEN** la fecha de alta se muestra con formato `d/m/Y`

#### Scenario: Locale inglés
- **WHEN** el locale de sesión es `en`
- **THEN** la fecha de alta se muestra con formato `Y/m/d`

#### Scenario: Valor ya localizado no se re-formatea
- **WHEN** el resource envía `created_at` ya formateado con `LocaleTrait` índice `[4]`
- **THEN** la celda muestra ese valor
- **AND** MUST NOT sustituirlo por un `dd/MM/yyyy` fijo del frontend
