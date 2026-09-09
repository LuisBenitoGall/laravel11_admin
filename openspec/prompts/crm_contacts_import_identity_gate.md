# Prompt para 10-architecture

Change: c2026-09-09-crm-contacts-import-identity-gate
Rule: aplica 10-architecture
Module: CRM / importación Excel de contactos
Skills: .cursor/skills/openspec-new-change/SKILL.md, .cursor/skills/openspec-ff-change/SKILL.md, .cursor/skills/openspec-continue-change/SKILL.md
AgentSkills: none
Capabilities: crm-contacts-import-row-identity

Summary:
La importación Excel de contactos CRM rechaza cualquier fila con `name` vacío (`Fila sin nombre.`), aunque tenga email o teléfono de persona. En un fichero real (483 filas) eso dejó 119 fuera. El portero pasa a: al menos uno de nombre, email de persona o teléfono de persona válido. Si pasa y el nombre está vacío, el User nuevo se crea con `Anónimo`. Si faltan los tres, la fila sigue en el reporte de no procesadas.

Goals:
- Sustituir el rechazo “name obligatorio” en `CrmContactController@importStore` por un portero de identidad de persona: `name` no vacío **o** `user_email` no vacío **o** al menos un teléfono de persona parseable a E.164 (región por defecto ES).
- Si la fila pasa el portero y `name` queda vacío tras normalizar, persistir `users.name = Anónimo` **solo al crear** un User nuevo.
- Si faltan los tres criterios, no insertar User/CrmContact/CrmAccount de esa fila; incluirla en `failed_rows` con motivo i18n nuevo (ya no “Fila sin nombre.”).
- Actualizar el texto de condiciones de la vista de importación (`import_condiciones_texto`) para explicar la regla.
- Tests Feature del portero (pasa / falla), placeholder `Anónimo` solo en alta, no overwrite de User existente, teléfono no parseable, NIF solo no basta, `company_email`/`company_phone` no cuentan.

NonGoals:
- No contar `company_email` ni `company_phone` como identidad de la fila (decisión A). Esas columnas siguen mapeando solo a la cuenta, como hoy.
- No buscar ni reutilizar User por teléfono. Matching sigue siendo: `user_email` y, si no hay match, `user_nif`. Sin email ni NIF → se crea User nuevo aunque el teléfono ya exista (incluye reimportaciones).
- Un NIF de usuario solo (sin nombre, sin `user_email`, sin teléfono de persona válido) NO basta para guardar.
- No tocar comandos Artisan (`ImportCrmContacts*`, `PromoteCrm*`, Dynamics, extra). Solo el POST Excel de la UI.
- No cambiar resolución de `CrmAccount` (NIF → `normalized_name` → crear). No reabrir `openspec/changes/crm-contacts-import` ni el change archivado de dedupe de cuentas.
- No migraciones, no constraints nuevos, no merge de duplicados, no alta/edición manual de User/CrmContact.
- No UI ad hoc: misma pantalla `Import.jsx`, mismo listado de filas no procesadas; solo copy i18n.
- No inventar reglas no listadas aquí.

Notes:
- Evidencia del Excel `Entrega 1_Plantilla_Nuevo CRM.xlsx` (483 datos + cabecera): 119 filas con `name` vacío; 62 tienen `user_email` o `user_phone1`/`user_phone2`; 57 no tienen ninguno de esos y **todas** tienen `company_email` y/o `company_phone`. Con la decisión A esas 57 **deben seguir fallando**. 0 filas sin nombre tenían `user_nif` o `surname`.
- Portero **después** de `ImportContactRowNormalizer::normalizeRow`. Valores en blanco / solo espacios = ausentes.
- Columnas de identidad de persona (únicas que cuentan):
  - nombre: `name`
  - email: `user_email` (tras `EmailNormalizer`; no vacío)
  - teléfono: `user_phone1` y/o `user_phone2`, con la misma validez E.164/ES que ya usa `rowHasAtLeastOneValidPhoneNumber` / `Phone::toE164OrNull`. Texto presente pero no parseable **no cuenta**.
- Placeholder persistido: literal `Anónimo` (valor de negocio en BD, no i18n del locale). `PersonNameNormalizer` no debe deformarlo. No usar `Anonymous` ni cadena vacía.
- User existente (match por email o NIF): MUST NOT sobrescribir `name` con `Anónimo` ni vaciarlo. El código actual ya no muta el User encontrado; mantenerlo.
- `Anónimo` solo en **create** de User. El portero no considera el placeholder: se evalúa el `name` de la fila, no el valor que se vaya a persistir.
- Código actual del corte: `CrmContactController@importStore` ~L1138–1143 (`$name === ''` → `__('import_sin_nombre')`).
- Copy propuesto (Architecture puede ajustar redacción, no el significado):
  - Error de fila: sustituir o dejar de usar `import_sin_nombre` (“Fila sin nombre.”) por una clave que diga que faltan nombre, email y teléfono. Incluir `lang/es.json` y `lang/en.json` (si el proyecto mantiene ambas).
  - Condiciones: ampliar `import_condiciones_texto` con que cada fila necesita al menos nombre, `user_email` o teléfono de persona (`user_phone1` / `user_phone2`).
- Gap: no existe `openspec/prompts/template_implementation_handoff.md`. Architecture MUST generar igual `implementation-handoff.md` con las viñetas de `template_prompts.md` y anotar el gap; no crear esa plantilla global.
- Change stale `crm-contacts-import` (18/21, spec no promovida a `openspec/specs/`): NO continuarlo. Nuevo change. Capability nueva (mismo patrón que `crm-contacts-import-account-resolution`). El requisito viejo “name required” se reformula aquí; no editar en caliente el change antiguo.

ReferencePatterns:
- Backend reference: `app/Http/Controllers/Admin/CrmContactController.php` (`importStore`, `syncImportPhonesForUser`, `rowHasAtLeastOneValidPhoneNumber`); `app/Support/ImportContactRowNormalizer.php`; `app/Models/Phone.php` (E.164, default ES); `app/Models/User.php` (mutator name).
- Frontend reference: `resources/js/Pages/Admin/CrmContact/Import.jsx` (texto `__('import_condiciones_texto')` y tabla de `failed_rows`; no rediseñar).
- Tests reference: `tests/Feature/CrmContactsImportAccountDedupeTest.php` (mismo harness de XLSX + Super Admin + empresa en sesión).
- UI reference: misma vista Import; componentes actuales (`PrimaryButton`, layout admin). Sin pantallas nuevas.

UIContract:
- No pantallas nuevas ni componentes nuevos.
- `docs/frontend/ui-contract.md` y `docs/frontend/component-manifest.md` pueden no existir; no inventarlos. Convenciones: `openspec/_global/`.
- No improvisar tablas, botones, inputs, selects, modales ni estados visuales locales.
- El reporte de filas no procesadas (columnas Fila / Motivo / Datos) se reutiliza; solo cambia el motivo i18n cuando falla el portero.
- Claves i18n; sin literales hardcodeados en JSX/PHP visibles.

DataImpact:
- Sin migraciones ni cambios de schema.
- Impacto solo en filas Excel que hoy se descartan por nombre vacío y que a partir de ahora cumplan el portero: se crearán User (`name=Anónimo` si venía vacío), CrmContact y, si hay datos de empresa, CrmAccount según reglas vigentes.
- Users ya existentes no se reescriben a `Anónimo` por un Excel sin nombre.
- Las ~57 filas solo-empresa del fichero de evidencia seguirán sin persistirse. No data impact expected on schema.

AuthorizationImpact:
- Sin cambio: GET/POST import siguen con permiso `crm-contacts.create`.
- Multiempresa: `CompanyContext` / empresa en sesión, igual que hoy.
- No policies, Gates ni permisos nuevos.
- No authorization impact expected. Casos 403: los mismos que hoy.

TestingImpact:
- Feature PHPUnit (obligatorio), patrón `CrmContactsImportAccountDedupeTest`:
  - Fila con `name` vacío + `user_email` → se procesa; User nuevo con `name=Anónimo` si no había match.
  - Fila con `name` vacío + `user_phone1` válido ES → se procesa; User `Anónimo`; phone sincronizado.
  - Fila con `name` vacío + `user_email` de un User existente → se reutiliza; `name` del existente NO pasa a `Anónimo`.
  - Fila sin name, sin `user_email`, teléfono no parseable → `failed_rows`, sin insert.
  - Fila sin name/email/teléfono persona, con `company_email` y/o `company_phone` → `failed_rows`, sin insert.
  - Fila solo `user_nif` (sin los tres) → `failed_rows`.
  - Fila con los tres vacíos → `failed_rows` y motivo de la clave i18n nueva (no el texto viejo “Fila sin nombre.”).
  - Fila con `name` informado → comportamiento previo (no forzar `Anónimo`).
- No tests de componente React nuevos (solo clave i18n).
- Playwright/E2E: no (ver PlaywrightImpact).

PlaywrightImpact:
- Required: no
- Reason: el valor está en la regla de persistencia del POST; la UI de resultado ya existe. Cubre Feature HTTP, no un flujo E2E nuevo.
- Flows to cover:
  - none
- Roles/users:
  - none
- Destructive flows allowed: no
- Notes:
  - Importar Excel crea users/contactos; no automatizar E2E destructivo. PHPUnit con `RefreshDatabase`.

ImplementationHandoff:
- Crear `implementation-handoff.md` dentro del change. El fichero plantilla `/openspec/prompts/template_implementation_handoff.md` **no existe**: generar el handoff cubriendo las viñetas de `template_prompts.md` (orientado a Implementation / Claude Code) y anotar el gap.
- Debe incluir ruta real del change.
- Debe indicar comando recomendado `/opsx-apply`.
- Debe limitar scope y fases: portero en `importStore` → placeholder `Anónimo` en create → i18n vista/reporte → tests Feature.
- Debe indicar archivos a leer primero: este prompt, spec delta, `CrmContactController@importStore`, `Import.jsx`, `lang/es.json`, `CrmContactsImportAccountDedupeTest.php`.
- Debe indicar patrones de referencia.
- Debe incluir reglas UI (copy i18n only).
- Debe incluir checks obligatorios (PHPUnit de los escenarios).
- Debe indicar cómo actualizar `tasks.md` (marcar `[x]` sin reescribir contrato).
- Debe indicar explícitamente que Implementation no debe archivar el change.

Preflight:
- Crear `preflight-check.md` dentro del change.
- Debe validar si el change está listo para implementación.
- Debe cubrir dominio, scope, datos, autorización, UI, testing y bloqueos.
- Open Questions de negocio: cerradas en explore. Si Architecture detecta hueco nuevo, documentar A/B o bloquear; no inventar.

RequiredGeneratedArtifacts:
- `proposal.md`
- `design.md` (obligatorio: orden del portero vs persistencia, validez E.164, `Anónimo` solo en create, exclusión company_*, matching sin teléfono)
- `tasks.md`
- specs afectadas (`specs/crm-contacts-import-row-identity/spec.md` o kebab equivalente)
- `preflight-check.md`
- `implementation-handoff.md`

AgentBoundaries:
- 10-architecture no implementa código de producción.
- 10-architecture no modifica lógica real del sistema.
- 10-architecture no archiva changes.
- 10-architecture no resuelve ambigüedades inventando reglas de negocio.
- Si falta información, debe documentar pregunta, alternativa o bloqueo.
- Flujo sugerido: `/opsx-new` + `/opsx-ff` o `/opsx-continue` hasta apply-ready. No reutilizar el change `crm-contacts-import`.

Body:

## ADDED Requirements

### Requirement: Portero de identidad de fila en import Excel
Durante el POST de importación de contactos CRM (`.xls`/`.xlsx`), tras normalizar la fila, el sistema MUST procesarla si y solo si se cumple al menos uno de: (1) `name` no vacío; (2) `user_email` no vacío; (3) `user_phone1` o `user_phone2` parseable a E.164 con región por defecto ES. `company_email` y `company_phone` MUST NOT satisfacer el portero. `user_nif` solo MUST NOT satisfacer el portero. Un teléfono con texto no parseable MUST NOT satisfacer el portero. Este requisito aplica solo a `importStore`, no a comandos Artisan.

#### Scenario: Fila sin nombre con email de persona
**WHEN** una fila tiene `name` vacío y `user_email` no vacío
**THEN** la fila se procesa (no entra en no procesadas por identidad)
**AND** si no hay User por email/NIF se crea uno

#### Scenario: Fila sin nombre con teléfono de persona válido
**WHEN** una fila tiene `name` vacío, `user_email` vacío y `user_phone1` o `user_phone2` válido E.164/ES
**THEN** la fila se procesa
**AND** se crea un User nuevo si no hay match por email/NIF (sin buscar por teléfono)

#### Scenario: Fila sin los tres criterios
**WHEN** una fila no tiene `name`, ni `user_email`, ni teléfono de persona válido
**THEN** no se persiste User, CrmContact ni CrmAccount de esa fila
**AND** aparece en el listado de filas no procesadas con el motivo i18n de identidad incompleta

#### Scenario: Solo datos de empresa no bastan
**WHEN** una fila sin identidad de persona tiene `company_email` y/o `company_phone` (y opcionalmente `company`)
**THEN** la fila se marca como no procesada por identidad
**AND** no se crea cuenta ni contacto a partir de esa fila

#### Scenario: NIF de usuario solo no basta
**WHEN** una fila tiene `user_nif` y no tiene `name`, `user_email` ni teléfono de persona válido
**THEN** la fila se marca como no procesada por identidad

#### Scenario: Teléfono no parseable no cuenta
**WHEN** una fila sin `name` ni `user_email` tiene `user_phone1`/`user_phone2` con texto que no parsea a E.164/ES
**THEN** la fila se marca como no procesada por identidad
**AND** no se inserta el registro

### Requirement: Placeholder Anónimo al crear User sin nombre
Si la fila pasa el portero y `name` está vacío tras normalizar, y el sistema MUST crear un User nuevo (no hubo match por email ni NIF), MUST persistir `users.name` con el literal `Anónimo`. Si hubo match de User existente, MUST NOT cambiar su `name`. Si la fila trae `name` no vacío, MUST persistir ese nombre (normalizado), nunca sustituirlo por `Anónimo`.

#### Scenario: Alta sin nombre
**WHEN** una fila pasa el portero, `name` está vacío y no existe User por email/NIF
**THEN** el User creado tiene `name` igual a `Anónimo`

#### Scenario: Match no pisa el nombre
**WHEN** una fila pasa el portero con `name` vacío y `user_email` de un User ya existente con otro nombre
**THEN** se reutiliza ese User
**AND** su `name` permanece el que ya tenía

### Requirement: Copy de condiciones y motivo de fallo
La vista de importación MUST explicar que cada fila necesita al menos nombre, email de persona o teléfono de persona. El motivo en filas no procesadas por este portero MUST dejar de ser únicamente “Fila sin nombre.” y MUST indicar que faltan nombre, email y teléfono. Claves i18n; `es` y `en` si el repo traduce ambas.

#### Scenario: Usuario lee las condiciones
**WHEN** el usuario abre GET `crm-contacts/import`
**THEN** el texto de condiciones menciona la regla de al menos uno de los tres campos de persona

#### Scenario: Motivo en el reporte
**WHEN** una fila falla el portero
**THEN** el campo Motivo del reporte usa la nueva clave i18n (no el literal viejo “Fila sin nombre.”)

## MODIFIED Requirements

### Requirement: Proceso de guardado — name ya no es required de la fila
En el contrato original de importación (`openspec/changes/crm-contacts-import`, “name (required)” en User a partir de la columna `name`), la columna `name` del Excel deja de ser obligatoria. El User sigue teniendo `name` NOT NULL: se toma de la fila o, en alta sin nombre, de `Anónimo`. El resto del proceso (match email/NIF, resolución de cuenta, contacto, phones, `company_id` de sesión) no cambia.

#### Scenario: Fila sin email ni nif con nombre
**WHEN** una fila tiene `name` informado y no tiene email ni nif
**THEN** se crea un User nuevo con ese name (como hoy)
**AND** se permiten homónimos sin email/nif

#### Scenario: Fila sin email ni nif sin nombre pero con teléfono válido
**WHEN** una fila no tiene email ni nif, `name` vacío y teléfono de persona válido
**THEN** se crea un User nuevo con `name=Anónimo`
**AND** no se reutiliza otro User solo porque el teléfono coincida

## REMOVED Requirements

(none — no se elimina el reporte de fallos ni el name en User; se relaja el origen del name)

## Open Questions

(none — cerradas en explore: columnas A; placeholder `Anónimo`; NIF solo no; sin match por teléfono; teléfono no parseable no cuenta; solo Excel UI; copy sí)

## Expected Architecture Output

El agente debe entregar:

1. Resumen del change creado o actualizado.
2. Ruta del change (`openspec/changes/c2026-09-09-crm-contacts-import-identity-gate/` o el slug final).
3. Artefactos generados (`proposal.md`, `design.md`, `tasks.md`, spec delta, `preflight-check.md`, `implementation-handoff.md`).
4. Decisiones principales (portero persona-only, E.164, `Anónimo` solo create, sin match teléfono, solo `importStore`).
5. Riesgos o bloqueos (57 filas solo-empresa seguirán fallando, a propósito; gap plantilla handoff; no tocar change stale).
6. Si el change queda listo para implementación (preflight OK o bloqueado por X).
7. Próximo paso recomendado: `/opsx-apply` (agente 20). No implementar PHP/React en el rol 10.
