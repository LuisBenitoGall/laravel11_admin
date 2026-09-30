# Prompt → Agent 10 Architecture
# Change propuesto: crm-contacts-import-account-dedupe-by-name

## 1. Contexto y objetivo

En la importación de contactos CRM vía Excel (`admin/crm-contacts/import` → `CrmContactController@importStore`), hoy solo se deduplican cuentas (`CrmAccount`) por `tax_id` (`company_nif`). Si el NIF viene vacío o no coincide, se crea una cuenta nueva aunque el nombre de empresa sea el mismo, generando duplicados. Objetivo: mantener el NIF como primer criterio e añadir un segundo criterio por `normalized_name` (slug del nombre) antes de crear una cuenta nueva, de modo que en la importación no se generen cuentas con el mismo nombre normalizado dentro de la empresa de sesión.

## 2. Fuentes de verdad

- Contrato/diseño actual del import: `openspec/changes/crm-contacts-import/` (`proposal.md`, `design.md`, `tasks.md`, `specs/crm-contacts-import/spec.md`).
- Código actual de resolución: `app/Http/Controllers/Admin/CrmContactController.php` método `importStore` (bloque CrmAccount ~L1167–1190).
- Normalización de filas: `app/Support/ImportContactRowNormalizer.php`.
- Modelo: `app/Models/CrmAccount.php` (`normalized_name`, `tax_id`, scope `company_id`).
- Rules: `.cursor/rules/00-project.mdc`, `.cursor/rules/10-architecture.mdc`.
- Contexto producto: `openspec/project.md`.
- Convenciones UI (si el change toca copy/i18n de resultado de import): `openspec/_global/`.

Nota factual: las columnas Excel `company` / `company_nif` alimentan `crm_accounts`, no la tabla `companies`. El campo análogo a `companies.slug` en esta entidad es `crm_accounts.normalized_name`.

## 3. Alcance

### Qué SÍ documentar / contratar (Architecture)

- Nuevo change OpenSpec (slug kebab sugerido: `crm-contacts-import-account-dedupe-by-name` o el que valide `openspec new change`).
- Actualizar/definir delta de spec sobre la regla de resolución de `CrmAccount` en import.
- Design: algoritmo exacto, multiempresa (`company_id` de sesión), prioridad NIF vs nombre, uso de `Str::slug`.
- Tasks ejecutables para Implementation (20): cambio en `importStore` (y tests mínimos), sin rediseñar el resto del import.
- Criterios de aceptación / escenarios Given-When-Then.

### Regla de negocio acordada (cerrar en design/spec, no reinventar)

1. Si `company_nif` ≠ vacío → buscar `CrmAccount` donde `company_id = sesión` AND `tax_id = company_nif`. Si existe → reutilizar ese id (**prioridad NIF siempre**).
2. Si no hubo match por NIF y `company` ≠ vacío → `normalized = Str::slug(company)`; buscar donde `company_id = sesión` AND `normalized_name = normalized`. Si existe → reutilizar ese id.
3. Si no hubo match en (1) ni (2) y hay datos de empresa → crear `CrmAccount` nueva (comportamiento de alta actual: name, normalized_name, tax_id, billing_*, etc.).
4. Conflicto: NIF matchea cuenta A y el nombre normalizado matchea cuenta B distinta → **usar A** (NIF gana); no fallar la fila por ese motivo.
5. Alcance **solo import XLS/XLSX**. No imponer unicidad de nombre en altas/ediciones manuales de cuentas (sigue permitido mismo nombre con NIF distintos fuera del import).
6. **No** planificar limpieza/merge de duplicados ya existentes en BD (se hará manualmente fuera de este change).
7. Normalización: la ya usada (`Str::slug`); no inventar otra regla.

### Qué NO tocar (salvo que Architecture detecte dependencia inevitable y la deje explícita en design)

- Tabla `companies` / `companies.slug` (no es destino de este import).
- Altas/ediciones manuales de `CrmAccount` / UI de cuentas.
- Constraint/índice único global en BD (no pedido; solo lógica de import).
- Limpieza o scripts de merge de duplicados históricos.
- Flujo de User / CrmContact salvo el `crm_account_id` resultante de la resolución.
- Columna Excel `account` (lógica comentada / desactivada): no reactivarla en este change salvo decisión A/B documentada y aprobada.
- Stack, librerías nuevas, cambios de permisos.

## 4. Requisitos verificables (criterios Done del diseño)

Architecture deja el change apply-ready cuando:

- [ ] Existe change bajo `openspec/changes/<slug>/` con `proposal.md`, `design.md`, `tasks.md` y spec delta coherentes.
- [ ] Spec describe los 3 pasos de resolución + prioridad NIF en conflicto + alcance solo-import.
- [ ] Design cita el método/archivo a modificar y descarta alternativas (p. ej. unicidad BD, match por `companies.slug`, reactivar columna `account`).
- [ ] `tasks.md` incluye: implementar resolución en `importStore`; tests Feature mínimos (NIF match; nombre match sin NIF; crear si no hay match; NIF gana frente a nombre distinto; scope por `company_id`); sin tarea de limpieza de datos.
- [ ] Ambigüedades residuales (si las hay) aparecen como tareas “Confirmar…” A/B, no como huecos silenciosos.
- [ ] Hand-off explícito a agente 20 (`/opsx-apply`), sin código de producción escrito por Architecture.

Escenarios mínimos a reflejar en spec (para que Testing/30 los pueda verificar después):

- Fila con `company_nif` existente → no crea cuenta; reutiliza.
- Fila sin NIF (o NIF no encontrado) y `company` cuyo slug ya existe en sesión → no crea; reutiliza por `normalized_name`.
- Fila sin NIF y nombre nuevo → crea una cuenta.
- Fila cuyo NIF es de cuenta A y cuyo nombre slug es de cuenta B → reutiliza A.
- Misma regla acotada a `company_id` de sesión (sin cruzar empresas).

## 5. Entrega (lo que Architecture debe devolver)

- Rutas de artefactos creados/actualizados bajo `openspec/changes/<slug>/`.
- Resumen de decisiones (prioridad NIF, 2º criterio `normalized_name`, solo import, sin cleanup).
- Checklist Done del diseño (según `10-architecture.mdc`).
- Hand-off: listo para `/opsx-apply` (agente 20) o bloqueado por X.

Flujo sugerido: `/opsx-new` + `/opsx-ff` o `/opsx-continue` hasta apply-ready. No implementar PHP/React en este rol.
