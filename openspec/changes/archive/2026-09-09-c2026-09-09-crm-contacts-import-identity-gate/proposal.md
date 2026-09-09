## Why

La importación Excel de contactos CRM rechaza cualquier fila con `name` vacío (`Fila sin nombre.`), aunque tenga email o teléfono de persona. En un fichero real (483 filas) eso dejó 119 fuera, 62 de ellas recuperables. El portero debe ser identidad de persona (nombre, email o teléfono válido), no el nombre obligatorio.

## What Changes

- Tras normalizar la fila, procesarla si hay `name` no vacío **o** `user_email` no vacío **o** al menos un `user_phone1`/`user_phone2` parseable a E.164 (región ES).
- Si pasa el portero, `name` vacío y hay que **crear** User: persistir `users.name = Anónimo`. No pisar el nombre de un User existente.
- Si faltan los tres criterios: no insertar User/CrmContact/CrmAccount; `failed_rows` con motivo i18n nuevo (no “Fila sin nombre.”).
- `company_email` / `company_phone` no cuentan. `user_nif` solo no basta. Teléfono no parseable no cuenta.
- Matching de User sigue siendo email, luego NIF; no buscar por teléfono.
- Actualizar copy de condiciones (`import_condiciones_texto`) y clave de error.
- Solo POST Excel de la UI (`importStore`). No Artisan, no resolución de CrmAccount, no change stale `crm-contacts-import`.

## Capabilities

### New Capabilities

- `crm-contacts-import-row-identity`: portero de identidad de persona en import Excel, placeholder `Anónimo` en alta y copy i18n de fallo/condiciones.

### Modified Capabilities

- (ninguna en `openspec/specs/`; el contrato viejo “name required” vive en `openspec/changes/crm-contacts-import` y no se edita en caliente.)

## Impact

- Backend: `CrmContactController@importStore` (corte ~name vacío).
- i18n: `lang/es.json`, `lang/en.json`; vista `Import.jsx` (texto de condiciones, mismo reporte).
- Tests Feature: patrón `CrmContactsImportAccountDedupeTest`.
- Sin migraciones, sin permisos nuevos, sin match por teléfono, sin morph/cuenta.
