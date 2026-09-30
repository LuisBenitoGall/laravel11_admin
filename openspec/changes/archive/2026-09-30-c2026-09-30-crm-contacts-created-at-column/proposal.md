## Why

En `/admin/crm-contacts` no se ve ni se filtra la fecha de alta del usuario. El operador necesita esa columna a la izquierda de Imagen, con datepicker en la misma vista y ocultable como el resto. `date_from`/`date_to` ya filtran `users.created_at`; falta la UI y que el SELECT agrupe esa fecha.

## What Changes

- Columna Fecha alta (`users.created_at`) en `CrmContact/Index.jsx`, inmediatamente antes de `avatar`. No reactivar el comentario tras `full_name`.
- Datepicker de rango (`filter: 'date'`, `dateKeys: ['date_from', 'date_to']`) vía `FilterRow`; recarga el mismo índice.
- Ocultable con `ColumnFilter` existente.
- `users.created_at` en SELECT y `groupBy` de dataQuery; `created_at` en `allowedSortFields`.
- Celda: string del Resource (`LocaleTrait` `[4]`); no re-formatear en el front.
- Tests Feature de formato por locale y del filtro de rango.
- Sin migraciones; sin tocar `crm_contact_created_at` ni ad-hoc `created_between`.

## Capabilities

### New Capabilities

- `crm-contacts-index-created-at`: columna Fecha alta localizada, filtrable y ocultable en el índice de contactos CRM.

### Modified Capabilities

- (ningún cambio de requisitos en specs canónicas de builder/`crm-contacts-listado`, salvo conservar `preserveParams` si el filtro toca la query.)

## Impact

- Frontend: `resources/js/Pages/Admin/CrmContact/Index.jsx`.
- Backend: `CrmContactController` dataQuery (SELECT/groupBy + sort allowlist). Resource intacto.
- Tests Feature PHPUnit del índice Inertia.
- Prefs `tblContacts`: usuarios con prefs antiguas no ven la columna hasta activarla.
