# Implementation handoff

Gap: no existe `openspec/prompts/template_implementation_handoff.md`. Viñetas según `docs/prompts/template_prompts.md`.

## Change

- Ruta: `openspec/changes/c2026-09-22-custody-intake-identity/`
- Comando: `/opsx-apply`
- **No archivar.**

## Fases

1. Migración + modelo/policy CP.
2. Búsqueda + Ensure (existente sin CRM).
3. Altas saveCompany / User + espejo CRM.
4. UI logística mínima.
5. Tests. Marcar `tasks.md` `[x]`.

## Leer primero

- `docs/prompts/c2026-09-22-custody-intake-identity.md`
- `design.md`, `specs/custody-intake-identity/spec.md`, `tasks.md`
- `app/Models/CustomerProvider.php`, `Company::saveCompany`, `CrmAccount::saveAccount`, `CustomerStoreRequest`

## Patrones

- `firstOrCreate` como `storeCustomer`.
- Normalizers DataStandards para email/NIF.
- Inertia + Bootstrap admin. i18n `__()`.
- PHP 8.2 / Laravel 11 / PHPUnit Feature.

## UI

- Sin albarán, sin componentes ad hoc si existen equivalentes.
- Conflicto: listar ambos y exigir elección.

## Checks

- Escenarios Feature de `tasks.md` §4.
- Filas CP empresa–empresa intactas.
- Grep: flujo existente no escribe CRM.

## tasks.md

Marcar `[x]`. Dudas → nota + Architecture. No reescribir spec/design.
