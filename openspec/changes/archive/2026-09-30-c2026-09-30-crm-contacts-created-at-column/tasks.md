## 1. Query y sort

- [x] 1.1 En `CrmContactController` dataQuery, añadir `users.created_at` al SELECT y al `groupBy` (junto a id/name/surname/email/status)
- [x] 1.2 Incluir `created_at` en `allowedSortFields` y ordenar por `users.created_at` cuando `sort_field` es `created_at`
- [x] 1.3 No cambiar el filtro `date_from`/`date_to` existente sobre `users.created_at`; no tocar ad-hoc `created_between` ni `crm_contact_created_at`

## 2. Columna UI

- [x] 2.1 En `CrmContact/Index.jsx`, insertar `created_at` inmediatamente antes de `avatar`: `label: __('fecha_alta')`, `sort: true`, `filter: 'date'`, `dateKeys: ['date_from', 'date_to']`, `render` passthrough del string del Resource
- [x] 2.2 Eliminar o no reactivar el comentario de columna tras `full_name`; no tocar otras columnas, Acciones ni `crm_contact_created_at` de leads
- [x] 2.3 No modificar `renderCellContent.jsx` global ni `UserResource`
- [x] 2.4 Pasar `indexRoute={indexRouteName}` (y `indexParams`) a `FilterRow` para que el DatePicker recargue `/admin/crm-contacts` (o leads), no `/admin/users`

## 3. Tests

- [x] 3.1 Feature: índice `/admin/crm-contacts` con locale `es` (o `ca`) incluye `created_at` en formato `d/m/Y`, no ISO
- [x] 3.2 Feature: mismo índice con locale `en` incluye `created_at` en formato `Y/m/d`
- [x] 3.3 Feature: `date_from`/`date_to` filtra por `users.created_at` y responde el mismo índice Inertia

## 4. Verificación

- [x] 4.1 Ejecutar los tests de este change y comprobar que pasan
- [x] 4.2 `/opsx-verify` o checklist vs spec/design/tasks sin bloqueos
