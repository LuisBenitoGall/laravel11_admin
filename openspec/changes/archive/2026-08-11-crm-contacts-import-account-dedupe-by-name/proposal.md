## Why

La importación de contactos CRM desde Excel solo reutiliza `CrmAccount` por `tax_id` (`company_nif`). Cuando el NIF falta o no coincide, se crea una cuenta nueva aunque el nombre de empresa sea el mismo, lo que genera duplicados en producción. Hay que endurecer la resolución en import: NIF primero y, si no hay match, `normalized_name` antes de crear.

## What Changes

- Ampliar la resolución de `CrmAccount` en `CrmContactController@importStore`:
  1. Match por `company_id` de sesión + `tax_id` (prioridad NIF).
  2. Si no hay match y hay nombre → match por `company_id` + `normalized_name` (`Str::slug` del nombre).
  3. Solo entonces crear cuenta nueva.
- En conflicto NIF→cuenta A y nombre normalizado→cuenta B: reutilizar **A** (NIF gana); no fallar la fila.
- Alcance limitado al import `.xls/.xlsx`. Sin unicidad de nombre en altas/ediciones manuales. Sin limpieza/merge de duplicados históricos. Sin tocar `companies` / `companies.slug`.

## Capabilities

### New Capabilities

- `crm-contacts-import-account-resolution`: reglas de búsqueda/reutilización/creación de `CrmAccount` durante la importación Excel de contactos CRM (criterios `tax_id` y `normalized_name`, prioridad NIF, scope multiempresa).

### Modified Capabilities

- (ninguna en `openspec/specs/`; el contrato previo del import vive solo en `openspec/changes/crm-contacts-import/`, no archivado como spec canónica).

## Impact

- Backend: `app/Http/Controllers/Admin/CrmContactController.php` (`importStore`, bloque de resolución de cuenta).
- Modelo/campos: `crm_accounts.tax_id`, `crm_accounts.normalized_name`, filtro `company_id` de sesión (`CompanyContext`).
- Tests Feature mínimos de los escenarios de resolución.
- Sin cambios de UI, permisos, rutas, template Excel, tabla `companies`, ni constraints únicos en BD.
