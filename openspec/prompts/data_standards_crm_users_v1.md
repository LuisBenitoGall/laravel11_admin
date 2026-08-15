# Prompt para 10-architecture

Change: 2026-08-13-crm-users-data-standards
Rule: aplica 10-architecture
Module: CRM / Users (no hay spec canónica única; capability nueva)
Skills: .cursor/skills/openspec-new-change/SKILL.md, .cursor/skills/openspec-ff-change/SKILL.md, .cursor/skills/openspec-continue-change/SKILL.md
AgentSkills: none
Capabilities: crm-users-data-standards

Summary:
Unificar la forma canónica de emails, teléfonos, NIF, nombres de persona, textos de cuenta y fechas en users, crm_accounts y adjuntos (phones, user_emails) para que vistas admin y exports XLS/CSV salgan limpios. Aplica a datos nuevos (create/update/import) y viejos (comando Artisan de backfill con dry-run). El cliente quiere persistir el canónico en BD, no solo maquillar el Excel.

Goals:
- Definir un catálogo normativo por tipo de campo (email, E.164, NIF, person name, account name, text cleanup, date, slug) y una capa PHP reutilizable (`DataStandards` o equivalente) usada por escritura, import y comando.
- Aplicar las mismas reglas hacia delante en create/update de User y CrmAccount, mutators existentes, `CrmContactController@importStore` y sync de phones.
- Entregar un comando de producción idempotente (`--dry-run`, apply, `--company=` opcional, chunks) que reescriba históricos y genere informe de cambios/skips.
- Política skip+reporte: colisión UNIQUE o valor no parseable → no aplicar ese campo, no borrar, no merge.
- Alinear vistas y export (`TableExporter`) al canónico de BD; fechas de export `dd/mm/yyyy`; no reaplicar Title Case en export.
- Tests unitarios por tipo de campo y Feature de escritura + comando (dry-run, apply, skip, scope company).

NonGoals:
- No normalizar textos de `crm_contacts` (`position`, `department`, `observations`, `cost_center`). `crm_contacts` solo sirve de join a `user_id` para acotar users por empresa.
- No tocar `user_addresses`, tabla tenant `companies`, notas, avatares, tablas `*_tmp` de Dynamics, resto del ERP.
- No Title Case ni cambio de mayúsculas legales en `crm_accounts.name` / `tradename` (solo trim/whitespace).
- No merge de duplicados de cuentas ni constraints/índices únicos nuevos.
- No reabrir ni modificar el change `crm-contacts-import-account-dedupe-by-name` (solo alinear `normalized_name` en backfill con `Str::slug` tras trim).
- No UI ad hoc, no nuevas pantallas de “limpieza”, no librerías de UI nuevas.
- No inventar reglas de negocio no listadas aquí.

Notes:
- Inventario v1 (columnas reales):
  - `users`: `name`, `surname`, `email`, `nif`, `birthday` (NO password, firma, salutation).
  - `crm_accounts`: `name`, `tradename`, `tax_id`, `nif`, `website`, `main_email`, `main_phone`, `billing_*`, `shipping_*`; recalcular `normalized_name = Str::slug(name)` tras trim del name (matching; no cambia casing del name).
  - Adjuntos: `phones.e164` (morph User), `user_emails.email`.
- Mutators ya existentes: `User::setEmailAttribute` (lower+trim), `User::setNifAttribute` (upper+trim). El backfill cubre filas históricas que los bypassearon; la capa nueva debe consolidarse con ellos, no duplicar reglas divergentes.
- Teléfonos: libphonenumber, E.164 internacional, `default_region ES` si no hay `+`. Reutilizar `Phone::toE164OrNull` / `normalizeItems`. No parseable → skip+reporte, no borrar.
- Colisiones: `users` UNIQUE (`email`,`deleted_at`) y `nif`; dos `phones` del mismo owner con el mismo `e164`. Skip del cambio conflictivo + informe. El comando no mergea.
- Scope comando (invariante multiempresa): con `--company=` solo users ligados a esa empresa vía `crm_contacts.user_id` o `user_companies`; cuentas filtradas por `company_id`. Sin flag: iterar por empresas. Nunca reescribir un user de otra empresa cuando el scope es una empresa. Propuesta cerrada: users huérfanos (sin `user_companies` ni `crm_contacts`) NO se incluyen sin `--company` salvo A/B documentado.
- Cuentas `CrmAccount::isLinkedToMaster()`: el boot bloquea mutar `name`/`tradename`/`nif`. Backfill MUST skip esos campos fiscales y reportarlos; no forzar el candado.
- Partículas Title Case (personas, lista mínima a fijar en design, no ampliar sin negocio): `de`, `del`, `la`, `las`, `los`, `y`, `e`, `da`, `di`, `van`, `von`. No romper `Mc` / `O'`. Siglas de 2–3 letras MAYÚSCULAS se conservan si el valor original ya es sigla; no inventar detección agresiva.
- Export: `resources/js/Components/TableExporter.jsx` (SheetJS + file-saver). Mostrar canónico; fechas `dd/mm/yyyy`; no Title Case extra.
- Gap: el template pide `/openspec/prompts/template_implementation_handoff.md` y ese fichero **no existe** hoy. Architecture MUST generar igual `implementation-handoff.md` con las secciones exigidas en `template_prompts.md` y anotar el gap; NO inventar un skill ni crear esa plantilla global salvo tarea explícita de docs.

ReferencePatterns:
- Backend reference: `app/Support/ImportContactRowNormalizer.php`; `app/Models/Phone.php` (`toE164OrNull`, `default_region ES`); mutators email/nif en `app/Models/User.php`; `app/Http/Controllers/Admin/CrmContactController.php` (`importStore`, sync phones); comandos `app/Console/Commands/ImportCrmContacts*.php` / `PromoteCrm*` (Artisan + dry-run).
- Frontend reference: `resources/js/Components/TableExporter.jsx`; listados `resources/js/Pages/Admin/CrmContact/Index.jsx`, `resources/js/Pages/Admin/User/` (export existente, no rediseñar).
- Tests reference: `tests/Feature/` de CRM/users si existen; patrón PHPUnit Feature del repo (`./vendor/bin/phpunit`).
- UI reference: ninguna pantalla nueva; reutilizar tablas/export actuales.

UIContract:
- Este change NO introduce pantallas nuevas. Si se toca frontend, solo formato de celdas/fechas en export o props ya existentes.
- No crear componentes en `resources/js/shared/ui`.
- No improvisar tablas, botones, inputs, selects, modales ni estados visuales locales.
- Mensajes de comando: CLI (y i18n solo si el repo ya traduce output Artisan; si no, castellano en el comando y documentarlo). Flashes de import: claves i18n existentes o nuevas mínimas.
- `docs/frontend/ui-contract.md` y `docs/frontend/component-manifest.md` pueden no existir en este repo; no inventarlos. Usar `openspec/_global/` si hace falta copy/UI.

DataImpact:
- Sí: reescritura de valores existentes vía comando (users, crm_accounts, phones, user_emails).
- Sin migraciones de schema salvo que Architecture justifique una tabla/archivo de informe; no columnas nuevas de “normalized_*” extra (excepto recálculo de `crm_accounts.normalized_name` ya existente).
- Impacto UNIQUE: skip+reporte, sin drop/alter de índices.
- Cuentas enlazadas a maestro: skip campos fiscales.
- No limpieza/merge de duplicados históricos de cuentas.

AuthorizationImpact:
- Comando Artisan de ops (ejecución en servidor / Super Admin ops). No nuevas rutas HTTP salvo que Architecture las justifique y las deje fuera o como NonGoal.
- Import Excel sigue permiso `crm-contacts.create`.
- Create/update User/CrmAccount: permisos y policies actuales, sin cambio de matriz Spatie.
- Scope `company_id` / `CompanyContext` en escritura HTTP; comando respeta `--company=` como arriba.
- No authorization impact esperado en Gates nuevas. Casos 403: los mismos que hoy en CRUD/import.

TestingImpact:
- Unit: cada normalizer (email, E.164, NIF, person name+partículas, account name sin casing, text cleanup, date parse, slug).
- Feature escritura: create/update user y account aplican reglas; import XLS aplica las mismas (email/NIF/phone/account name trim).
- Feature comando: dry-run no escribe; apply escribe; segunda pasada ≈ 0 cambios; skip colisión email/nif/e164; skip teléfono/fecha no parseable; `--company=` no cruza empresas; skip `isLinkedToMaster` en campos fiscales.
- Frontend/typecheck/lint: solo si se toca `TableExporter` (formato fecha); no tests de componente nuevos salvo que el export cambie contrato.
- Playwright/E2E: no (ver PlaywrightImpact).

PlaywrightImpact:
- Required: no
- Reason: el valor está en persistencia + CLI + Feature HTTP; no hay flujo UI nuevo de limpieza.
- Flows to cover:
  - none
- Roles/users:
  - none
- Destructive flows allowed: no
- Notes:
  - El comando `--apply` es destructivo de valores (no de filas); cubrirlo con Feature/PHPUnit, no con Playwright contra producción.

ImplementationHandoff:
- Crear `implementation-handoff.md` dentro del change. El fichero plantilla `/openspec/prompts/template_implementation_handoff.md` **no existe** en el repo: generar el handoff igualmente cubriendo las viñetas de `template_prompts.md` (orientado a Implementation / Claude Code) y anotar el gap.
- Debe incluir ruta real del change.
- Debe indicar comando recomendado `/opsx-apply`.
- Debe limitar scope y fases (normalizers → escritura → comando → export mínimo).
- Debe indicar archivos que Implementation debe leer primero (este prompt, design, spec, Phone.php, User mutators, importStore, TableExporter).
- Debe indicar patrones de referencia.
- Debe incluir reglas UI (no pantallas nuevas).
- Debe incluir checks obligatorios (tests listados, dry-run documentado).
- Debe indicar cómo actualizar `tasks.md` (marcar `[x]` sin reescribir contrato).
- Debe indicar explícitamente que Implementation no debe archivar el change.

Preflight:
- Crear `preflight-check.md` dentro del change.
- Debe validar si el change está listo para implementación.
- Debe cubrir dominio, scope, datos, autorización, UI, testing y bloqueos.
- Si queda abierta alguna Open Question de negocio, marcar el change como bloqueado o dejar tarea “Confirmar…” A/B, nunca un hueco silencioso.

RequiredGeneratedArtifacts:
- `proposal.md`
- `design.md` (obligatorio: algoritmo, catálogo de campos, skip, scope, linked master, partículas)
- `tasks.md`
- specs afectadas (`specs/crm-users-data-standards/spec.md` o el nombre kebab de la capability)
- `preflight-check.md`
- `implementation-handoff.md`

AgentBoundaries:
- 10-architecture no implementa código de producción.
- 10-architecture no modifica lógica real del sistema.
- 10-architecture no archiva changes.
- 10-architecture no resuelve ambigüedades inventando reglas de negocio.
- Si falta información, debe documentar pregunta, alternativa o bloqueo.
- Flujo sugerido: `/opsx-new` + `/opsx-ff` o `/opsx-continue` hasta apply-ready.

Body:

## ADDED Requirements

### Requirement: Catálogo canónico por tipo de campo
El sistema MUST normalizar los campos del inventario v1 según tipo, de forma idéntica en escritura HTTP, import Excel y comando de backfill.

- Email (`users.email`, `user_emails.email`, `crm_accounts.main_email`): trim, minúsculas, colapsar espacios; sin saltos/control chars.
- Teléfono (`phones.e164`, `crm_accounts.main_phone`): E.164 vía libphonenumber; región por defecto ES si no hay `+`.
- NIF (`users.nif`, `crm_accounts.tax_id` / `nif`): trim, mayúsculas; quitar espacios internos y guiones.
- Nombre de persona (`users.name`, `users.surname`): Title Case ES con la lista mínima de partículas del Notes; trim/whitespace.
- Nombre de cuenta (`crm_accounts.name`, `tradename`): trim y colapsar whitespace; MUST NOT cambiar casing.
- Texto de cuenta (`website`, `billing_*`, `shipping_*` salvo country_code): trim, colapsar whitespace, quitar control chars. `*_country_code`: upper ISO si hay valor.
- Fecha (`users.birthday`): persistir date canónica parseable; export `dd/mm/yyyy`.
- Slug de cuenta: `normalized_name = Str::slug(name)` tras trim de `name`.

#### Scenario: Email a minúsculas
**WHEN** se guarda o backfillea un email con mayúsculas o espacios
**THEN** el valor persistido es el email recortado en minúsculas

#### Scenario: Teléfono a E.164 con default ES
**WHEN** se guarda o backfillea un teléfono nacional sin `+` parseable como ES
**THEN** el valor canónico es E.164 (p. ej. `+34…`)

#### Scenario: Razón social conserva mayúsculas
**WHEN** una cuenta tiene `name` en mayúsculas legales
**THEN** tras normalizar solo se recortan espacios; el casing del `name` no cambia

#### Scenario: Nombre de persona con partícula
**WHEN** un `surname` es `DE LA TORRE` o equivalente
**THEN** el valor persistido usa Title Case con partícula en minúsculas según la lista fijada en design

### Requirement: Escritura hacia delante unificada
Create/update de User y CrmAccount, mutators, sync de `phones` y `CrmContactController@importStore` MUST usar la misma capa de normalizers. MUST NOT dejar reglas divergentes entre import y UI.

#### Scenario: Import y alta manual coinciden
**WHEN** el mismo email/NIF/teléfono/nombre entra por formulario y por Excel
**THEN** el valor persistido es idéntico (misma función de normalización)

### Requirement: Comando de backfill de producción
MUST existir un comando Artisan idempotente con `--dry-run` (por defecto o flag explícito documentado en design), modo apply, `--company=` opcional y proceso por chunks. Dry-run MUST listar cambios y skips sin escribir. Apply MUST persistir solo campos sin colisión ni fallo de parseo. Una segunda ejecución apply MUST no reescribir valores ya canónicos.

#### Scenario: Dry-run no muta
**WHEN** se ejecuta el comando en dry-run sobre datos sucios
**THEN** no hay UPDATE en BD y el informe incluye antes/después y skips

#### Scenario: Apply idempotente
**WHEN** se ejecuta apply y luego apply otra vez
**THEN** la segunda pasada reporta cero cambios (salvo skips estables)

### Requirement: Skip y reporte en colisión o no parseable
Si el valor normalizado chocaría con UNIQUE existente o no es parseable (teléfono, fecha), el sistema MUST dejar el valor original, MUST NOT borrar la fila ni el campo, y MUST incluir el caso en el informe (dry-run y apply). MUST NOT fusionar entidades.

#### Scenario: Email que colisiona
**WHEN** normalizar el email del user A produciría el mismo email único que el user B
**THEN** no se cambia el email de A y el informe registra colisión

#### Scenario: Teléfono no parseable
**WHEN** un `phones.e164` o `main_phone` no se puede parsear a E.164
**THEN** el valor no se borra ni se vacía y el informe lo lista como no parseable

### Requirement: Scope multiempresa del comando
Con `--company=` el comando MUST limitar cuentas a ese `company_id` y users a los ligados por `crm_contacts.user_id` o `user_companies` de esa empresa. MUST NOT modificar users ni cuentas de otra empresa. Sin flag, MUST iterar empresas con la misma regla por tenant. Users huérfanos (sin empresa ni contacto) MUST NOT incluirse (propuesta cerrada; ver Open Questions).

#### Scenario: No cruza empresas
**WHEN** `--company=X` y existe la misma suciedad en empresa Y
**THEN** solo se informan/aplican cambios del universo de X

### Requirement: Cuentas enlazadas a maestro
Si `CrmAccount` está enlazada a maestro (`isLinkedToMaster`), el backfill y la escritura MUST NOT mutar campos fiscales bloqueados (`name`, `tradename`, `nif`); MUST skip y reportar. Otros campos no bloqueados del inventario (p. ej. `main_email`, `main_phone`, direcciones si el boot no los candada) siguen las reglas generales.

#### Scenario: Skip fiscal en cuenta enlazada
**WHEN** una cuenta enlazada tiene `name` con espacios extra
**THEN** no se persiste el name recortado y el informe registra skip por maestro

### Requirement: Vistas y export alineados al canónico
Listados admin y export XLS/CSV MUST mostrar los valores persistidos. Fechas en export MUST usarse como `dd/mm/yyyy`. MUST NOT reaplicar Title Case ni otra capa de presentación que altere casing de personas o cuentas en el fichero.

#### Scenario: Export de fecha
**WHEN** el usuario exporta un listado que incluye `birthday`
**THEN** la celda sale en formato `dd/mm/yyyy` a partir de la fecha canónica en BD

## MODIFIED Requirements

(none — no hay spec canónica de este catálogo en `openspec/specs/`. No modificar `openspec/changes/crm-contacts-import-account-dedupe-by-name`.)

## REMOVED Requirements

(none)

## Open Questions

- Users sin `user_companies` ni `crm_contacts` cuando el comando corre sin `--company`: la propuesta cerrada es **no incluirlos**. Si ops necesita un flag `--orphans`, documentar A/B en design y no implementarlo por defecto.
- `crm_accounts.main_phone` es escalar; el morph `phones` está en User, no en CrmAccount. Confirmar en design: v1 normaliza solo el escalar `main_phone` de la cuenta (además de `phones` del User). No inventar morph de phones sobre Account.
- Lista exacta de partículas Title Case: usar la lista mínima del Notes salvo que negocio la amplíe por escrito.

## Expected Architecture Output

El agente debe entregar:

1. Resumen del change creado o actualizado.
2. Ruta del change.
3. Artefactos generados (`proposal.md`, `design.md`, `tasks.md`, spec delta, `preflight-check.md`, `implementation-handoff.md`).
4. Decisiones principales (catálogo, skip, scope, E.164/ES, no Title Case de cuentas, comando).
5. Riesgos o bloqueos (UNIQUE, maestro enlazado, gap de plantilla handoff).
6. Si el change queda listo para implementación (preflight OK o bloqueado por X).
7. Próximo paso recomendado: `/opsx-apply` (agente 20). No implementar PHP/React en el rol 10.
