# Implementation handoff

Gap: no existe `openspec/prompts/template_implementation_handoff.md` en el repo. Este fichero cubre las secciones de `openspec/prompts/template_prompts.md`.

## Change

- Ruta: `openspec/changes/c2026-09-09-crm-contacts-import-identity-gate/`
- Comando: `/opsx-apply` (agente 20 / Implementation)
- **No archivar** este change. Archive es rol 30 tras verify.

## Scope y fases (en este orden)

1. Portero en `importStore` (antes de la transacción).
2. Placeholder `Anónimo` solo en create de User.
3. i18n (`import_sin_identidad` o equivalente + `import_condiciones_texto`) es/en.
4. Feature tests (harness `CrmContactsImportAccountDedupeTest`).
5. Marcar `tasks.md` `[x]` sin reescribir el contrato.

## Leer primero

- `openspec/prompts/crm_contacts_import_identity_gate.md`
- `openspec/changes/c2026-09-09-crm-contacts-import-identity-gate/design.md`
- `openspec/changes/c2026-09-09-crm-contacts-import-identity-gate/specs/crm-contacts-import-row-identity/spec.md`
- `openspec/changes/c2026-09-09-crm-contacts-import-identity-gate/tasks.md`
- `app/Http/Controllers/Admin/CrmContactController.php` (`importStore`, `rowHasAtLeastOneValidPhoneNumber`)
- `resources/js/Pages/Admin/CrmContact/Import.jsx`
- `lang/es.json` (`import_sin_nombre`, `import_condiciones_texto`)
- `tests/Feature/CrmContactsImportAccountDedupeTest.php`

## Patrones

- Reutilizar `rowHasAtLeastOneValidPhoneNumber`; no nueva librería de teléfonos.
- Matching User: email luego nif; no query por phone.
- Controllers delgados; i18n con `__()`.
- PHPUnit Feature + `RefreshDatabase`. PHP 8.2 / Laravel 11.

## UI

- Copy i18n only. No componentes ad hoc. Mismo reporte Fila / Motivo / Datos.

## Checks obligatorios

- Los 8 escenarios Feature de `tasks.md` §3.
- Grep: el corte del portero no debe seguir emitiendo `import_sin_nombre`.
- No tocar resolución CrmAccount, Artisan CRM, ni el change `crm-contacts-import`.

## Cómo actualizar tasks.md

- Marcar `- [x]` al completar.
- Si hay ambigüedad: nota bajo la tarea, dejar pendiente, devolver a Architecture (A/B).
