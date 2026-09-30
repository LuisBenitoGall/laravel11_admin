## Why

En `/admin/marketing-lists` no se ve cuándo se creó cada lista. El operador necesita esa fecha en la tabla, a la izquierda de Acciones, sin rediseñar el listado. El resource ya envía `created_at` formateado por idioma de sesión; falta exponerlo en la columna.

## What Changes

- Columna de fecha de creación en `MarketingList/Index.jsx`, último item de `columns` (queda a la izquierda de Acciones).
- Cabecera `__('fecha_creacion')`; completar la clave en `lang/en.json` (ya existe en `es.json`).
- Sort de la columna nueva con el `created_at` que `dataQuery` ya permite.
- Filtro de rango de fechas con el estándar de Fecha alta en `/admin/users` (`filter: 'date'` + `dateKeys: ['date_from', 'date_to']`). `dataQuery` ya aplica esos params.
- Celda: pintar el string del Resource (`LocaleTrait` `[4]`). No re-formatear en el front a `dd/MM/yyyy` fijo.
- Tests Feature del payload del índice por locale (`es` vs `en`) y del filtro de fechas.
- Sin migraciones, sin cambio de Resource salvo que el valor actual no sirva, sin tocar Acciones ni columnas existentes.

## Capabilities

### New Capabilities

- `marketing-lists-index-created-at`: columna de fecha de creación localizada en el índice de listas de marketing.

### Modified Capabilities

- (ninguna spec canónica de este listado en `openspec/specs/`.)

## Impact

- Frontend: `resources/js/Pages/Admin/MarketingList/Index.jsx` (array `columns`).
- i18n: `lang/en.json` (`fecha_creacion`).
- Backend: sin cambio de query salvo que el sort de UI use el campo ya permitido. Resource intacto.
- Tests Feature PHPUnit del índice Inertia.
- Preferencias `tblMarketingLists`: usuarios con prefs guardadas no verán la columna hasta activarla; no se migran prefs.
