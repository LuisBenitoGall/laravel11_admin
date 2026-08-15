# Preflight check — c2026-08-13-crm-users-data-standards

## Resultado

**Listo para implementación** (no bloqueado). Open Questions del prompt cerradas en `design.md`.

## Dominio

- [x] Inventario v1 acotado: users (name, surname, email, nif, birthday), crm_accounts (name/tradename/tax_id/nif/website/main_email/main_phone/billing_*/shipping_*/normalized_name), phones User, user_emails.
- [x] `crm_contacts` textos fuera de alcance (solo join).
- [x] No merge, no Title Case de razones sociales, no `companies` tenant.

## Scope

- [x] HTTP create/update + import + comando; sin rutas HTTP nuevas.
- [x] `--company=` y exclusión de huérfanos definidos.
- [x] Change hermano de dedupe import no se reabre.

## Datos

- [x] Sin migración de schema; reescritura de valores; informe en `storage/logs/`.
- [x] UNIQUE: skip por campo, no alter de índices.
- [x] `isLinkedToMaster`: skip name/tradename/nif/tax_id; slug desde name persistido.

## Autorización

- [x] Comando Artisan ops; CRUD/import permisos actuales; sin Spatie nuevo.

## UI

- [x] Sin pantallas nuevas; solo formato fecha en export (`TableExporter`).
- [x] Gap: `docs/frontend/ui-contract.md` no existe; no se inventa.

## Testing

- [x] Unit normalizers + Feature escritura/import/comando; Playwright no requerido.

## Bloqueos

- Ninguno de negocio.
- Gap documentado: no existe `openspec/prompts/template_implementation_handoff.md`; el handoff se genera igual en este change.
