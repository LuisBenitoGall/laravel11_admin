## Context

`CrmContact/Index.jsx` comparte contactos y leads. `columns` termina en `avatar`. Hay una columna `created_at` **comentada** tras `full_name` (`fecha_alta`, sort, `filter: 'date'`, `dateKeys: ['date_from', 'date_to']`). El dataQuery ya filtra `date_from`/`date_to` sobre `users.created_at`, pero el SELECT agrupado no incluye esa columna y `allowedSortFields` no admite `created_at`. `UserResource` formatea `created_at` con `LocaleTrait[4]`. Brief: `docs/prompts/c2026-09-30-crm-contacts-created-at-column.md`.

## Goals / Non-Goals

**Goals:**

- Columna Fecha alta a la izquierda de Imagen.
- Datepicker de rango en la misma vista; ocultable con ColumnFilter.
- SELECT/groupBy de `users.created_at`; sort allowlist.
- Formato por locale vía Resource + `column.render`.
- Tests Feature locale y filtro.

**Non-Goals:**

- `crm_contact_created_at` / ad-hoc `created_between`.
- Cambio global de `renderCellContent`. Migrar prefs. Playwright. Marketing lists change.

## Decisions

1. **Posición**  
   Insertar el item `created_at` inmediatamente antes de `avatar`. Quitar o no reactivar el comentario tras `full_name`. En leads: … `crm_contact_created_at`, `created_at`, `avatar`. Misma página para `/admin/crm-leads`; no excluir.

2. **Fecha = `users.created_at`**  
   No `MIN(cc.created_at)`. El filtro backend ya usa `users.created_at`. Label `__('fecha_alta')`.

3. **SELECT y groupBy**  
   Añadir `'users.created_at'` al `select([...])` y al `groupBy(...)` junto a id/name/surname/email/status.  
   **Descartado:** fiarse de dependencia funcional de PK (rompe SQLite tests).

4. **Sort**  
   `allowedSortFields` incluye `created_at`. Si `sort_field === 'created_at'`, `orderBy('users.created_at', $sortDirection)` (no concatenar como full_name).

5. **Filtro UI**  
   `filter: 'date'`, `dateKeys: ['date_from', 'date_to']`. `FilterRow` DatePicker hace `router.get` a `indexRoute` (default interno: `users.index`). MUST pasar `indexRoute={indexRouteName}` (`crm-contacts.index` / `crm-leads.index`) y `queryParams={queryParamsForNav}` para permanecer en la misma vista y conservar builder. Text filters sí usan `SearchFieldChanged`; el datepicker no.

6. **Celda: `column.render` passthrough**  
   Pintar `String(value)` si hay valor. Evita `dd/MM/yyyy` fijo de `renderCellContent` para keys `created_at`. Resource intacto.

7. **Visibilidad**  
   `allColumnKeys` incluye `created_at`. ColumnFilter existente. Prefs antiguas: columna oculta hasta activarla. No limpiar query de fechas al ocultar.

8. **Tests**  
   Feature índice crm-contacts: locale `es` → `d/m/Y`; `en` → `Y/m/d`; `date_from`/`date_to` filtra. Sort opcional: `sort_field=created_at` no cae a `full_name`. Playwright no.

## Risks / Trade-offs

- **[Riesgo]** SELECT sin `created_at` → fechas nulas/basura. **Mitigación:** tarea explícita SELECT+groupBy.  
- **[Riesgo]** Sin `column.render` → `en` mal. **Mitigación:** design + test locale `en`.  
- **[Riesgo]** Prefs ocultan la columna. **Mitigación:** esperado.  
- **[Trade-off]** Leads muestra dos fechas (CRM y user). **Mitigación:** pedido es user `fecha_alta`; no fusionar.

## Migration Plan

- Deploy código. Sin schema. Rollback: revertir columna, SELECT y allowlist.

## Open Questions

Ninguna.
