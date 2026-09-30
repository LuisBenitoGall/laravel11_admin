## Context

El índice Inertia `Admin/MarketingList/Index` define `columns` como `name`, `members_count`, `created_by` y ahora `created_at`. Acciones es un `<th>`/`<td>` fijo a la derecha. `MarketingListResource` ya envía `created_at` con `Carbon::parse(...)->format($locale[4])` (`es`/`ca`: `d/m/Y`; `en`: `Y/m/d`). `dataQuery` ya ordena y filtra `created_at` con `date_from`/`date_to` (mismo mapa que users). La UI MUST exponer el DatePicker de rango con el estándar de Fecha alta en `/admin/users`.

`renderCellContent` trata keys que coinciden con `created_at` como ISO y pinta `dd/MM/yyyy` fijo. El Resource no manda ISO. Brief: `docs/prompts/c2026-09-30-marketing-lists-created-at-column.md`.

## Goals / Non-Goals

**Goals:**

- Columna fecha de creación a la izquierda de Acciones.
- Formato según locale de sesión (string del Resource).
- Sort UI sobre el campo ya permitido.
- Filtro de rango de fechas con el estándar de `/admin/users` (Fecha alta).
- i18n `fecha_creacion` (completar `en.json`).
- Feature del payload por locale y del filtro `date_from`/`date_to`.

**Non-Goals:**

- Cambio global de `renderCellContent`.
- Migrar contrato a `table.rows`.
- Migraciones, Resource, `dataQuery`, Acciones, columnas existentes, prefs de columnas, Playwright.

## Decisions

1. **Posición**  
   Último item de `columns`. Acciones sigue fuera del array. No reordenar Lista/Miembros/Autor.

2. **Celda: `column.render` passthrough**  
   `{ key: 'created_at', ..., render: ({ value }) => (value == null || value === '' ? '' : String(value)) }`.  
   `renderCellContent` ejecuta `column.render` primero; así no entra en el branch ISO/`dd/MM/yyyy`.  
   **Descartado:** cambiar `renderCellContent` global (NonGoal).  
   **Descartado:** copiar User Index con `filter: 'date'` **y** sin `render` (rompe `en`). El filtro sí se copia; el passthrough de celda se mantiene.  
   **Descartado:** key distinta (`formatted_created_at`) — el Resource ya usa `created_at`.

3. **Resource intacto**  
   El valor actual cumple `LocaleTrait` `[4]` sin hora. Show/Edit siguen con `formatted_created_at` + `H:i:s`.

4. **Sort sí, filtro de rango sí (estándar users)**  
   Decisión de usuario (2026-09-30): el filtro MUST ser funcional como Fecha alta en `/admin/users`.  
   Columna: `filter: 'date'`, `dateKeys: ['date_from', 'date_to']`, `placeholder: __('fecha_creacion')`. `FilterRow` pinta el DatePicker de rango y hace `router.get` con esos query params. `dataQuery` ya aplica `created_at` con `date_from`/`date_to` (mismo mapa que `UserController`). Sin DatePicker ad hoc ni keys nuevas. Se mantiene `column.render` passthrough.

5. **Label**  
   `label: __('fecha_creacion')`. Añadir `"fecha_creacion": "Creation date"` (o equivalente) en `lang/en.json`. No nueva clave.

6. **ColumnFilter / export**  
   La key entra en `allColumnKeys` y TableExporter. CSV exporta el string ya localizado. Prefs guardadas sin `created_at`: columna oculta hasta que el usuario la active (`useTableManagement`); no migrar prefs.

7. **Tests**  
   Feature: GET índice autenticado con empresa en sesión; `created_at` de cada lista en el JSON/Inertia no es ISO; con locale `es` cumple `d/m/Y`; con `en` cumple `Y/m/d`.  
   Feature: `date_from`/`date_to` filtran por `marketing_lists.created_at`. Playwright no.

## Risks / Trade-offs

- **[Riesgo]** Olvidar `column.render` → fechas `en` mal pintadas. **Mitigación:** design + tests de locale `en`.  
- **[Riesgo]** Prefs antiguas ocultan la columna. **Mitigación:** esperado; ColumnFilter.  
- **[Trade-off]** Prefs antiguas ocultan también el DatePicker de esa columna. **Mitigación:** mismo `useTableManagement` que el resto del admin.

## Migration Plan

- Deploy de front + `en.json` + tests. Sin schema. Rollback: quitar el item de `columns` y la clave `en`.

## Open Questions

Ninguna. Filtro cerrado: sí, estándar Fecha alta de `/admin/users`.
