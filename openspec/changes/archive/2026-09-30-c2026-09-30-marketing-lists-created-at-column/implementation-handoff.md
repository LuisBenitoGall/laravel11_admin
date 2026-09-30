# Implementation handoff

Gap: no existe `openspec/prompts/template_implementation_handoff.md`. Viñetas según `openspec/prompts/template_prompts.md`.

## Change

- Ruta: `openspec/changes/c2026-09-30-marketing-lists-created-at-column/`
- Comando: `/opsx-apply`
- **No archivar.**

## Fases

1. Columna `created_at` al final de `columns` en Index + `render` passthrough + filtro date estándar users.
2. `fecha_creacion` en `lang/en.json`.
3. Feature locale `es`/`en` y Feature `date_from`/`date_to`. Marcar `tasks.md` `[x]`.

## Leer primero

- `docs/prompts/c2026-09-30-marketing-lists-created-at-column.md`
- `design.md`, `specs/marketing-lists-index-created-at/spec.md`, `tasks.md`
- `resources/js/Pages/Admin/MarketingList/Index.jsx`
- `app/Http/Resources/MarketingListResource.php`
- `resources/js/Utils/renderCellContent.jsx`

## Patrones

- Último item de `columns` = izquierda de Acciones.
- `column.render` primero en `renderCellContent`; no copiar Product/User Index a ciegas.
- i18n `__()`. PHP 8.2 / Laravel 11 / PHPUnit Feature.

## UI

- Sin componentes nuevos. Filtro `filter: 'date'` + `dateKeys` como Fecha alta de users. No tocar Acciones ni columnas existentes.

## Checks

- Escenarios Feature de `tasks.md` §2.
- Grep: no cambiar `renderCellContent` global ni el Resource.

## tasks.md

Marcar `[x]`. Dudas → nota + Architecture. No reescribir spec/design.
