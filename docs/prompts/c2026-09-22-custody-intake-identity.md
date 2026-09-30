# Prompt para 10-architecture

Change: c2026-09-22-custody-intake-identity
Rule: aplica 10-architecture
Module: Logística / custodia de piezas RFT (oleada 0: identidad del entregador + cliente operativo)
Skills: .cursor/skills/openspec-new-change/SKILL.md, .cursor/skills/openspec-ff-change/SKILL.md, .cursor/skills/openspec-continue-change/SKILL.md
AgentSkills: none
Capabilities: custody-intake-identity

Summary:
RFT custodia tapices y alfombras ajenos. Antes del albarán de recogida hay que resolver quién entrega (empresa o particular), reutilizar perfil existente o crear uno, y dejarlo como cliente de RFT en `customer_providers`. El tenant custodio es la empresa en sesión. CRM no define la relación; solo se espeja en altas nuevas (`crm_accounts` / `crm_contacts`).

Goals:
- Adaptar `customer_providers` para cliente empresa XOR particular: `customer_id` nullable, `user_customer_id` FK `users.id` nullable, XOR, uniques `(customer_id, provider_id, deleted_at)` y `(user_customer_id, provider_id, deleted_at)`. `provider_id` sigue siendo siempre empresa (RFT).
- Flujo de resolución: elegir tipo Empresa | Particular → buscar por email y/o NIF en `companies` o `users` → 0 matches alta; 1 match del tipo elegido seleccionar; match en ambos lados (user y company) → conflicto en UI y el administrador elige.
- Perfil existente: solo `firstOrCreate` de `customer_providers` (RFT = `provider_id`). MUST NOT crear ni actualizar `crm_accounts` / `crm_contacts`.
- Alta empresa: `Company::saveCompany` con valores por defecto tipo anónimo para campos obligatorios del alta; espejo `crm_accounts` (`company_id` = RFT, `linked_company_id` = nueva empresa); CP con `customer_id`.
- Alta particular: `User` suelto (sin `user_companies` obligatorio); espejo `crm_contacts` (`company_id` = RFT, `user_id`); CP con `user_customer_id`.
- Revelación por `users.email` / `users.nif` / `companies.nif` (y email de empresa si existe en el modelo). No revelar por tablas CRM.
- Tests Feature del XOR, firstOrCreate idempotente, espejo CRM solo en alta, conflicto, y que el existente no toca CRM.

NonGoals:
- No albarán de recogida/recepción, no tracking, no alta de `products` (`owner_user_id` / `company_owner_id` aún no).
- No fases de taller, valoración, reparación, PDA, foto/firma, albarán de devolución, Holded, email al cliente.
- No usar `crm_accounts` / `crm_contacts` como identidad operativa ni como dueño de pieza.
- No fusionar perfiles en conflicto; no inventar empresa fantasma para un particular.
- No rediseñar el listado completo de clientes/proveedores (sí no romper el lado empresa–empresa existente).
- No cambiar `convertToCustomerProvider` de CRM salvo compatibilidad (filas company–company siguen igual).
- No implementar código de producción en este rol.

Notes:
- Exploración y decisiones: conversación explore + doc `Funciones App Logística almacén RFT julio 2026`. Custodio = `company_id` de sesión, no el dueño.
- `customer_providers` hoy: `customer_id` y `provider_id` NOT NULL → `companies`; unique par; CHECK `customer_id <> provider_id`; helpers `relationBetween` / `sideForCompanyPair` solo entienden pares de empresas.
- Alta cliente actual (`storeCustomer`) usa `Company::saveCompany` + CP. `CustomerStoreRequest` exige hoy `name`, `tradename`, `nif`. Design MUST inventariar sentinelas “anónimo” para esos campos (y slug/unicidad NIF) sin inventar un NIF que colisione; si hace falta A/B de sentinela, documentarlo, no improvisar en apply.
- `CrmAccount::saveAccount($request, $scopeCompanyId, $linkedCompanyId)` es el patrón de espejo empresa.
- `CrmContact` se ancla a `user_id` + `company_id` (tenant RFT). Particular suelto: no crear `user_companies` con RFT.
- Relación de nombres (siguiente oleada, no este change): pieza `owner_user_id` ↔ CP `user_customer_id`; pieza `company_owner_id` ↔ CP `customer_id`.
- Gap: no existe `openspec/prompts/template_implementation_handoff.md`. Generar `implementation-handoff.md` igual; no crear esa plantilla global. Briefs de Architecture viven en `docs/prompts/` (copia de `openspec/prompts/`).
- Slug OpenSpec MUST empezar por letra: `c2026-09-22-custody-intake-identity`.

ReferencePatterns:
- Backend reference: `app/Models/CustomerProvider.php`; `app/Http/Controllers/Admin/CustomerProviderController.php` (`storeCustomer`, `firstOrCreate`); `app/Models/Company.php` (`saveCompany`); `app/Http/Requests/CustomerStoreRequest.php`; `app/Models/CrmAccount.php` (`saveAccount`); alta contacto en `CrmContactController` / `crm_contacts.user_id`.
- Frontend reference: altas de cliente/usuario existentes (`resources/js/Pages/Admin/` customers / users); no pantallas de albarán.
- Tests reference: Feature de customers/users/CRM si existen; PHPUnit del repo.
- UI reference: formularios admin Bootstrap/Inertia actuales; un paso de tipo + búsqueda + conflicto + alta mínima.

UIContract:
- Si hay UI, respetar convenciones `openspec/_global/` (este repo no tiene `docs/frontend/ui-contract.md` / `component-manifest.md`; no inventarlos).
- No improvisar tablas, botones, inputs, selects, modales ni estados visuales locales si ya existen en el admin.
- UI de esta oleada: tipo Empresa/Particular, campos email/NIF, resultados o conflicto, confirmación de existente o alta. Sin wizard de albarán.
- i18n con `__()`. Sin literales hardcodeados visibles.

DataImpact:
- Migración `customer_providers`: `customer_id` nullable; `user_customer_id` nullable FK users; CHECK XOR; unique `(user_customer_id, provider_id, deleted_at)`. Filas actuales (empresa–empresa) no se reescriben.
- Altas nuevas: `companies` + `crm_accounts` o `users` + `crm_contacts` + fila CP.
- Sin `products` en este change.

AuthorizationImpact:
- Reutilizar permisos de creación de clientes/usuarios si encajan (`customers.create`, `users.create` / equivalentes). Si el flujo vive bajo logística, documentar permiso de módulo `logistics` + el de create; no inventar matriz Spatie nueva salvo tarea explícita.
- Scope: `provider_id` y espejo CRM = empresa en sesión (`CompanyContext`).
- Policies `CustomerProviderPolicy`: ampliar o añadir camino user-cliente sin romper el par empresas.
- 403: sin permiso de create / sin empresa en sesión (mismo patrón que el resto del admin).

TestingImpact:
- Feature: CP empresa (regresión `customer_id` + `provider_id`).
- Feature: CP particular (`user_customer_id`, `customer_id` null).
- Feature: XOR / rechazo de ambos o ninguno.
- Feature: existente → CP sí, CRM no crece.
- Feature: alta empresa → company + crm_account linked + CP; alta user → user sin user_companies + crm_contact + CP.
- Feature: email/NIF en user y company → respuesta de conflicto (no auto-elige).
- Feature: segunda vez mismo dueño → no duplica CP.
- Unit/model: helpers de “es mi cliente” para user.
- Playwright: no (ver PlaywrightImpact).

PlaywrightImpact:
- Required: no
- Reason: el valor está en persistencia, XOR y espejo CRM; la UI es un formulario admin cubrible con Feature HTTP/Inertia.
- Flows to cover:
  - none
- Roles/users:
  - none
- Destructive flows allowed: no
- Notes:
  - Altas crean companies/users; tests con `RefreshDatabase`.

ImplementationHandoff:
- Crear `implementation-handoff.md` dentro del change. Plantilla `/openspec/prompts/template_implementation_handoff.md` **no existe**; cubrir las viñetas de `docs/prompts/template_prompts.md` y anotar el gap.
- Ruta real del change; comando `/opsx-apply`.
- Fases: migración CP → asegurar cliente (existente/alta) → espejo CRM solo alta → UI mínima tipo/búsqueda/conflicto → tests.
- Leer primero: este brief, design, spec, `CustomerProvider`, `saveCompany`, `saveAccount`, `CustomerStoreRequest`.
- Implementation no archiva el change. Marcar `tasks.md` `[x]` sin reescribir contrato.

Preflight:
- Crear `preflight-check.md`.
- Cubrir dominio, scope, datos, autorización, UI, testing y bloqueos.
- Sentinelas de `saveCompany`: si no se pueden fijar sin negocio, tarea “Confirmar…” A/B, no bloqueo silencioso.

RequiredGeneratedArtifacts:
- `proposal.md`
- `design.md` (obligatorio: XOR, unique, conflicto, sentinelas saveCompany, espejo CRM solo alta, helpers CP)
- `tasks.md`
- specs (`specs/custody-intake-identity/spec.md` o kebab equivalente)
- `preflight-check.md`
- `implementation-handoff.md`

AgentBoundaries:
- 10-architecture no implementa código de producción.
- 10-architecture no modifica lógica real del sistema.
- 10-architecture no archiva changes.
- 10-architecture no resuelve ambigüedades inventando reglas de negocio.
- Si falta información, debe documentar pregunta, alternativa o bloqueo.
- Flujo: `/opsx-new` + `/opsx-ff` o `/opsx-continue` hasta apply-ready.

Body:

## ADDED Requirements

### Requirement: Cliente operativo empresa XOR particular
`customer_providers` MUST permitir que el cliente sea una empresa (`customer_id`) o un particular (`user_customer_id`), nunca ambos ni ninguno. `provider_id` MUST ser una empresa. Las filas empresa–empresa existentes MUST seguir válidas.

#### Scenario: Relación con empresa cliente
**WHEN** se asegura cliente empresa X frente a RFT
**THEN** existe una fila con `customer_id = X`, `provider_id = RFT` y `user_customer_id` null

#### Scenario: Relación con particular
**WHEN** se asegura cliente user U frente a RFT
**THEN** existe una fila con `user_customer_id = U`, `provider_id = RFT` y `customer_id` null

### Requirement: Resolución de perfil que entrega
El operador MUST elegir Empresa o Particular y buscar por email y/o NIF en `companies` o `users`. Cero matches MUST permitir alta. Un match del tipo elegido MUST permitir seleccionar. Si el mismo criterio revela un user y una company, el sistema MUST mostrar conflicto y MUST NOT elegir solo.

#### Scenario: Conflicto user y company
**WHEN** el NIF o email coincide con un `users` y una `companies`
**THEN** la UI lista ambos candidatos
**AND** el administrador elige uno
**AND** no se fusionan registros

#### Scenario: Existente no toca CRM
**WHEN** se selecciona un perfil ya existente y se asegura como cliente
**THEN** se crea o reutiliza `customer_providers`
**AND** no se inserta ni actualiza `crm_accounts` ni `crm_contacts` por este flujo

### Requirement: Alta nueva con espejo CRM
Si se crea empresa, MUST usarse `Company::saveCompany` con defaults tipo anónimo en campos obligatorios, MUST crearse `crm_accounts` ligado (`linked_company_id`) en el tenant RFT, y MUST crearse la fila CP. Si se crea particular, MUST crearse `users` sin exigir `user_companies`, MUST crearse `crm_contacts` en RFT, y MUST crearse la fila CP con `user_customer_id`.

#### Scenario: Nueva empresa
**WHEN** no hay match y el operador crea empresa
**THEN** hay company + crm_account con `linked_company_id` + CP `customer_id`

#### Scenario: Nuevo particular suelto
**WHEN** no hay match y el operador crea particular
**THEN** hay user sin vínculo `user_companies` obligatorio + crm_contact + CP `user_customer_id`

### Requirement: Asegurar cliente es idempotente
Una segunda resolución del mismo dueño frente a RFT MUST reutilizar la fila `customer_providers` y MUST NOT duplicarla.

#### Scenario: Segunda pieza futuro mismo dueño
**WHEN** el mismo user o company ya es cliente de RFT
**THEN** `firstOrCreate` (o equivalente) no crea una segunda fila activa

## MODIFIED Requirements

(none en `openspec/specs/` canónicas. El comportamiento empresa–empresa de clientes actuales MUST conservarse.)

## REMOVED Requirements

(none)

## Open Questions

- Sentinelas exactos de `saveCompany` (`name`, `tradename`, `nif` únicos): Architecture MUST inventariar constraints y proponer valores en design; si el NIF sentinela choca con unique, A/B en design (p. ej. NIF vacío si se relaja validación en este flujo vs NIF reservado).
- ¿La UI de este change es pantalla propia bajo logística o se incrusta en clientes/usuarios? Si no hay decisión, design elige pantalla mínima bajo logística (sin albarán) y lo deja explícito.

## Expected Architecture Output

El agente debe entregar:

1. Resumen del change creado o actualizado.
2. Ruta del change (`openspec/changes/c2026-09-22-custody-intake-identity/` o el slug final válido).
3. Artefactos: `proposal.md`, `design.md`, `tasks.md`, spec delta, `preflight-check.md`, `implementation-handoff.md`.
4. Decisiones: XOR CP, conflicto admin, CRM solo alta, user suelto, saveCompany + sentinelas.
5. Riesgos: unique NIF/slug, listados de clientes que solo JOIN companies, policies.
6. Si el change queda listo para implementación (preflight OK o bloqueado por X).
7. Próximo paso: `/opsx-apply` (agente 20). No implementar PHP/React en el rol 10.
