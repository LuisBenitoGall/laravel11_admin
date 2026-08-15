## 1. Implementación backend

- [x] 1.1 En `CrmContactController@importStore`, tras el match por `tax_id` (si hay `company_nif`), si `$crmAccount === null` y hay `company`, buscar `CrmAccount` por `company_id` de sesión + `normalized_name = Str::slug(company)` y reutilizar si existe
- [x] 1.2 Mantener creación de `CrmAccount` solo cuando no hubo match por NIF ni por `normalized_name`; conservar mapeo actual de campos al crear
- [x] 1.3 Garantizar prioridad NIF: si el NIF matchea cuenta A, no sustituir por un match de nombre a cuenta B; no marcar la fila como fallida por ese conflicto
- [x] 1.4 No mutar campos de una cuenta reutilizada (name/tax_id/billing_*) en este change; no tocar `companies`, UI, permisos ni columna Excel `account`

## 2. Tests

- [x] 2.1 Feature: fila con `company_nif` existente reutiliza cuenta y no crea otra
- [x] 2.2 Feature: fila sin match de NIF y `Str::slug(company)` existente reutiliza por `normalized_name`
- [x] 2.3 Feature: sin match por NIF ni nombre crea una cuenta nueva
- [x] 2.4 Feature: NIF de cuenta A + nombre slug de cuenta B reutiliza A
- [x] 2.5 Feature: misma `tax_id`/`normalized_name` en otro `company_id` no se reutiliza (scope sesión)

## 3. Verificación

- [x] 3.1 Ejecutar tests añadidos/actualizados y comprobar que pasan
- [x] 3.2 `/opsx-verify` del change (o checklist manual vs spec/design/tasks) sin hallazgos bloqueantes
  - Checklist manual: resolución NIF → normalized_name → create; prioridad NIF; sin mutar cuenta reutilizada; solo `importStore`; tests 2.1–2.5 verdes (`CrmContactsImportAccountDedupeTest`). Hand-off a `/opsx-verify` formal (agente 30) si se quiere auditoría adicional.
