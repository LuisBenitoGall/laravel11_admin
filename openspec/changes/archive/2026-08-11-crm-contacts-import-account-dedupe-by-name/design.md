## Context

La importación Excel de contactos CRM (`CrmContactController@importStore`) resuelve `CrmAccount` solo por `tax_id` dentro del `company_id` de sesión. Si no hay NIF o no hay match, y hay nombre de empresa, crea siempre una cuenta nueva. Eso duplica cuentas con el mismo nombre normalizado. El contrato previo está en `openspec/changes/crm-contacts-import/`; el código afectado es el bloque ~L1167–1190 de `importStore`. Columnas Excel `company` / `company_nif` → `crm_accounts` (`name`, `normalized_name`, `tax_id`), no la tabla `companies`.

## Goals / Non-Goals

**Goals:**

- En import, reutilizar `CrmAccount` existente por NIF; si no, por `normalized_name` (`Str::slug`); solo entonces crear.
- Prioridad NIF ante conflicto con match por nombre.
- Mantener scope multiempresa (`CompanyContext` / `company_id` de sesión).
- Tests Feature que cubran los escenarios del spec.

**Non-Goals:**

- Unicidad de nombre en altas/ediciones manuales de cuentas.
- Índice/constraint único en BD.
- Limpieza o merge de duplicados históricos.
- Cambios en `companies` / `companies.slug`.
- Reactivar la columna Excel `account` (código comentado).
- Cambios de UI, permisos, rutas o template.

## Decisions

1. **Punto de cambio único: `importStore`**  
   Se ajusta solo el bloque de resolución de `CrmAccount` en `CrmContactController@importStore`. No se introduce Service/Action salvo que Implementation encuentre duplicación inasumible; el alcance pedía cambio mínimo.

2. **Algoritmo de resolución (acordado)**  
   - Si `company_nif` ≠ '' → `CrmAccount::where(company_id, sesión)->where(tax_id, nif)->first()`. Match → reutilizar.  
   - Si no hubo match y `company` ≠ '' → `$normalized = Str::slug($companyName)`; buscar `where(company_id, sesión)->where(normalized_name, $normalized)`. Match → reutilizar.  
   - Si no hubo match en ninguno y hay datos de empresa (nombre o nif según lógica actual de entrada al bloque) → crear con el mapeo actual (`name`, `normalized_name`, `tax_id`, billing_*, phones/emails, owner/created_by).  
   - Conflicto NIF→A y nombre→B: usar **A**; no fallar la fila.

3. **Normalización = `Str::slug` existente**  
   Misma función que ya asigna `normalized_name` al crear. No nueva regla de CIF ni comparación case-insensitive adicional sobre el slug (el slug ya es canónico).

4. **Alternativas descartadas**  
   - Match por `companies.slug`: el import no escribe en `companies`; el análogo es `crm_accounts.normalized_name`.  
   - Índice único `(company_id, normalized_name)`: no pedido; rompería altas manuales con mismo nombre y NIF distintos.  
   - Reactivar columna `account`: fuera de alcance; decisión previa de negocio (desactivado 2026-06-11).  
   - Fallar fila en conflicto NIF vs nombre: rechazado; prioridad NIF siempre.

5. **Sin actualización de campos de cuenta en match**  
   Al reutilizar por NIF o por nombre, no se exige actualizar billing_* / name de la cuenta existente en este change (comportamiento actual en match por NIF). Si se reutiliza por nombre y la fila trae un NIF nuevo no coincidente con otra cuenta, no se reescribe el `tax_id` de la cuenta existente en este change (evitar efectos laterales no pedidos). Documentado como trade-off.

## Risks / Trade-offs

- **[Riesgo]** Duplicados históricos siguen existiendo → **Mitigación**: limpieza manual fuera de este change; el import deja de crear nuevos por nombre.  
- **[Riesgo]** Varias cuentas ya comparten el mismo `normalized_name` → `first()` es no determinista → **Mitigación**: aceptable temporalmente; la limpieza manual reduce el conjunto; no se añade “fail if multiple” en este change.  
- **[Trade-off]** Reutilizar por nombre sin volcar NIF de la fila puede dejar cuentas sin `tax_id` aunque la fila lo traiga y no matchee otra cuenta: prioridad es no mutar cuentas existentes sin requisito explícito.  
- **[Riesgo]** NIF con formato distinto (espacios/guiones) sigue sin unificar → **Mitigación**: fuera de alcance; solo `ImportContactRowNormalizer` actual (trim/espacios).

## Migration Plan

- Despliegue: solo código PHP + tests; sin migraciones.  
- Rollback: revertir el cambio en `importStore`.  
- Datos: sin scripts de migrate/merge.

## Open Questions

- Ninguna bloqueante. Decisiones de negocio cerradas en el prompt Architecture (`openspec/prompts/crm_contacts_import_account_dedupe_normalized_name.md`).
