# Implementation handoff

Gap: no existe `openspec/prompts/template_implementation_handoff.md` en el repo. Este fichero cubre las secciones exigidas por `openspec/prompts/template_prompts.md`.

## Change

- Ruta: `openspec/changes/c2026-08-13-crm-users-data-standards/`
- Comando: `/opsx-apply` (agente 20 / Implementation)
- **No archivar** este change. Archive es rol 30 tras verify.

## Scope y fases (en este orden)

1. `app/Support/DataStandards/*` + tests unitarios.
2. Escritura: mutators User, CrmAccount, Phone delega, `importStore` / `ImportContactRowNormalizer`.
3. Comando `data:normalize-crm-users` (dry-run default, `--apply`, `--company`, `--chunk`, informe).
4. Export fechas en `TableExporter` / columnas.
5. Feature tests. Marcar `tasks.md` `[x]` sin reescribir el contrato.

## Leer primero

- `openspec/prompts/data_standards_crm_users_v1.md`
- `openspec/changes/c2026-08-13-crm-users-data-standards/design.md`
- `openspec/changes/c2026-08-13-crm-users-data-standards/specs/crm-users-data-standards/spec.md`
- `openspec/changes/c2026-08-13-crm-users-data-standards/tasks.md`
- `app/Models/Phone.php`, `app/Models/User.php` (mutators email/nif)
- `app/Http/Controllers/Admin/CrmContactController.php` (`importStore`)
- `app/Support/ImportContactRowNormalizer.php`
- `resources/js/Components/TableExporter.jsx`

## Patrones

- E.164: extraer de `Phone::toE164OrNull`, no copiar una tercera implementación.
- Artisan+dry-run: comandos `crm:import-*` / Promote.
- Controllers delgados; lógica en Support/Services; `company_id` / `CompanyContext`.
- PHP 8.2, Laravel 11, PHPUnit Feature. Sin librerías UI nuevas.

## UI

- No pantallas nuevas, no componentes ad hoc, no Title Case en export.
- Fechas export: `dd/mm/yyyy`.

## Checks obligatorios

- Unit de cada normalizer.
- Feature: dry-run no escribe; apply idempotente; skip colisión; skip unparseable; `--company` no cruza; skip maestro; import = alta manual.
- Pint si se toca PHP.
- No inventar merge, `--orphans`, morph phones en Account, ni tocar `crm_contacts` textos.

## Cómo actualizar tasks.md

- Marcar `- [x]` al completar.
- Subtareas solo si se descubre trabajo necesario; no cambiar reglas de spec/design.
- Si hay ambigüedad: nota bajo la tarea, dejar pendiente, devolver a Architecture (A/B).
