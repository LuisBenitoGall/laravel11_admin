# Implementation handoff

Gap: no existe `openspec/prompts/template_implementation_handoff.md`. Viñetas según `openspec/prompts/template_prompts.md`.

## Change

- Ruta: `openspec/changes/c2026-09-30-crm-contacts-created-at-column/`
- Comando: `/opsx-apply`
- **No archivar.**

## Fases

1. SELECT/groupBy `users.created_at` + allowlist sort.
2. Columna antes de `avatar` + datepicker + `render` passthrough.
3. Feature locale y filtro. Marcar `tasks.md` `[x]`.

## Leer primero

- `docs/prompts/c2026-09-30-crm-contacts-created-at-column.md`
- `design.md`, `specs/crm-contacts-index-created-at/spec.md`, `tasks.md`
- `resources/js/Pages/Admin/CrmContact/Index.jsx`
- `app/Http/Controllers/Admin/CrmContactController.php` (dataQuery)
- `app/Http/Resources/UserResource.php`
- `resources/js/Utils/renderCellContent.jsx`

## Patrones

- No reactivar el comentario tras `full_name`.
- `FilterRow` date + `preserveParams` builder.
- No copiar User Index a ciegas (doble format). PHP 8.2 / Laravel 11 / PHPUnit Feature.

## UI

- Sin componentes nuevos. No tocar Acciones ni `crm_contact_created_at`.

## Checks

- Escenarios Feature de `tasks.md` §3.
- Grep: no cambiar `renderCellContent` global ni `UserResource`.

## tasks.md

Marcar `[x]`. Dudas → nota + Architecture. No reescribir spec/design.
