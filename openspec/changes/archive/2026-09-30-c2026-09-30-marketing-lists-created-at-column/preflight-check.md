# Preflight check — c2026-09-30-marketing-lists-created-at-column

## Resultado

**Listo para implementación.** Open Question del filtro cerrada en design: sí (estándar `/admin/users`).

## Dominio

- [x] Columna fecha de creación a la izquierda de Acciones.
- [x] Formato `LocaleTrait[4]` vía Resource; no re-parse `dd/MM/yyyy` en el front.

## Scope

- [x] Solo Index + `en.json` + tests. Sin rediseño de tabla.
- [x] Filtro de fechas = estándar Fecha alta `/admin/users`. Sort UI sobre campo ya permitido.

## Datos

- [x] Sin migraciones. `created_at` ya existe.

## Autorización

- [x] No authorization impact expected.

## UI

- [x] Misma tabla `tblMarketingLists`. `column.render` passthrough.
- [x] Gap: no existe `template_implementation_handoff.md`; handoff en este change.

## Testing

- [x] Feature PHPUnit locale `es`/`en` y filtro `date_from`/`date_to`. Playwright no.

## Bloqueos

- Ninguno.
