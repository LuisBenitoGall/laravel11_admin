## Why

Los datos de usuarios, cuentas CRM y adjuntos (teléfonos, emails extra) están sucios y heterogéneos (casing, NIF con guiones, teléfonos no E.164, espacios/control chars, fechas mal tipadas). Eso sale en vistas admin y exports XLS/CSV y rompe matching. Hay que persistir un canónico en BD para datos nuevos y viejos, no maquillar solo el Excel.

## What Changes

- Catálogo normativo por tipo de campo (email, E.164, NIF, nombre de persona, nombre de cuenta sin Title Case, texto, fecha, slug) y capa PHP reutilizable.
- Escritura hacia delante unificada: create/update User y CrmAccount, mutators, import Excel de contactos, sync de `phones`.
- Comando Artisan de backfill de producción: `--dry-run`, apply, `--company=` opcional, chunks, informe de cambios/skips.
- Skip+reporte si hay colisión UNIQUE o valor no parseable; no merge, no borrar.
- Export/listados alineados al canónico; fechas de export `dd/mm/yyyy`; sin reaplicar Title Case.
- Recálculo de `crm_accounts.normalized_name` (`Str::slug` tras trim) en backfill; no reabre el change de dedupe de import.

## Capabilities

### New Capabilities

- `crm-users-data-standards`: estándares de datos v1 para users, crm_accounts, phones (User) y user_emails; escritura, import, comando de backfill, skip/reporte y formato de export.

### Modified Capabilities

- (ninguna en `openspec/specs/`; no modificar `crm-contacts-import-account-dedupe-by-name`.)

## Impact

- Backend: nueva capa `app/Support/DataStandards/` (o equivalente); mutators `User`; `Phone`; `CrmAccount` (incl. skip `isLinkedToMaster`); `CrmContactController@importStore`; comando Artisan nuevo.
- Datos: reescritura de valores existentes (no schema). UNIQUE `users.email`+`deleted_at`, `users.nif`, `phones` owner+e164.
- Frontend mínimo: `TableExporter` / columnas de fecha en listados User/CrmContact si aplica.
- Tests Unit + Feature (escritura, import, comando). Sin Playwright. Sin rutas HTTP nuevas ni permisos Spatie nuevos.
