# Prompt para 10-architecture

Change: c2026-09-30-users-create-send-password
Rule: aplica 10-architecture
Module: Users / alta admin (`/admin/users/create`)
Skills: .cursor/skills/openspec-new-change/SKILL.md, .cursor/skills/openspec-ff-change/SKILL.md, .cursor/skills/openspec-continue-change/SKILL.md
AgentSkills: none
Capabilities: users-create-send-password

Summary:
Al crear un usuario en `/admin/users/create` y marcar «Enviar password al usuario», no se envía el correo. La recuperación de contraseña sí funciona: el mailer no es el fallo. El formulario Inertia envía `send_password`; `UserController::store` solo lee `send_pwd`. El checkbox nunca dispara `Mail::send`.

Goals:
- Hacer que el checkbox de `/admin/users/create` active el envío ya existente (`Mail::send` a `emails.send-user-password` cuando el flag es verdadero y `side != 'crm-accounts'`).
- Alinear el nombre del campo con el contrato actual del backend: `send_pwd` (el mismo que `ModalUserCreate.jsx`).
- Tests Feature: con flag verdadero y email, se invoca el envío (Mail fake); con flag falso, no.

NonGoals:
- No cambiar el flujo de recuperación (`Password::sendResetLink` / `PasswordResetLinkController`).
- No cambiar plantilla `emails.send-user-password`, from, subject ni SMTP.
- No enviar password en altas `side == 'crm-accounts'` (condición ya existente).
- No rediseñar Create.jsx ni UserStoreRequest salvo el campo del flag.
- No migraciones. No Playwright. No implementar en el rol 10.
- Independiente de los changes de columnas marketing-lists / crm-contacts / custody.

Notes:
- Evidencia: `Create.jsx` `useForm({ send_password: false })` y checkbox `name="send_password"`.
- Evidencia: `UserController::store` ~L689–703 `if ($request->input('send_pwd') && $request->side != 'crm-accounts')`.
- Evidencia: `ModalUserCreate.jsx` ya usa `send_pwd: false`.
- Recuperación: `PasswordResetLinkController` → `Password::sendResetLink`. Camino distinto; por eso el email “funciona” allí.
- `UserStoreRequest` no valida el flag; no hace falta regla nueva de negocio.
- Slug OpenSpec MUST empezar por letra: `c2026-09-30-users-create-send-password`.
- Gap: no existe `openspec/prompts/template_implementation_handoff.md`. Briefs en `docs/prompts/` (plantilla `openspec/prompts/template_prompts.md`).

ReferencePatterns:
- Backend reference: `app/Http/Controllers/Admin/UserController.php` (`store`, bloque Envío de password).
- Frontend reference: `resources/js/Pages/Admin/User/Create.jsx`; contrato correcto en `resources/js/Components/modals/ModalUserCreate.jsx` (`send_pwd`).
- Tests reference: Feature de users / Mail::fake del repo si existe.
- UI reference: mismo checkbox; solo el name/estado del form.

UIContract:
- Si hay UI, respetar `openspec/_global/` (no hay `docs/frontend/ui-contract.md`; no inventarlo).
- No crear UI ad hoc. Mismo checkbox `__('usuario_envio_password')`.
- i18n sin claves nuevas.

DataImpact:
- No data impact expected

AuthorizationImpact:
- No authorization impact expected (`users.create` igual).

TestingImpact:
- Feature: POST `users.store` desde el shape de Create (sin `user_id`) con `send_pwd` true → `Mail::assertSent` / assert enviado a `emails.send-user-password` (o `Mail::assertQueued` si el test usa queue; el código actual es `Mail::send` síncrono).
- Feature: `send_pwd` false o ausente → no se envía.
- No Playwright.

PlaywrightImpact:
- Required: no
- Reason: bug de nombre de campo; Feature con Mail fake basta.
- Flows to cover:
  - none
- Roles/users:
  - none
- Destructive flows allowed: no
- Notes:
  - none

ImplementationHandoff:
- Crear `implementation-handoff.md`. Plantilla de handoff **no existe**; cubrir viñetas de `openspec/prompts/template_prompts.md`.
- Ruta del change; `/opsx-apply`. No archivar.
- Fase: alinear `Create.jsx` a `send_pwd` + test Mail fake.
- Leer primero: este brief, `Create.jsx`, `UserController::store`, `ModalUserCreate.jsx`.

Preflight:
- Crear `preflight-check.md`.
- Bloquear si se pretende reescribir el mailer o el reset de password.

RequiredGeneratedArtifacts:
- `proposal.md`
- `design.md` (obligatorio: mismatch `send_password` vs `send_pwd`)
- `tasks.md`
- specs (`specs/users-create-send-password/spec.md`)
- `preflight-check.md`
- `implementation-handoff.md`

AgentBoundaries:
- 10-architecture no implementa código de producción.
- 10-architecture no modifica lógica real del sistema.
- 10-architecture no archiva changes.
- 10-architecture no resuelve ambigüedades inventando reglas de negocio.
- Flujo: `/opsx-new` + `/opsx-ff` hasta apply-ready.

Body:

## ADDED Requirements

### Requirement: Enviar password al crear usuario desde /admin/users/create
Cuando un operador crea un usuario en `/admin/users/create` y marca «Enviar password al usuario», el sistema MUST enviar el correo de password ya definido en `UserController::store` (vista `emails.send-user-password`, destinatario el email del usuario). El flag MUST usar el mismo nombre que el backend (`send_pwd`).

#### Scenario: Checkbox marcado
**WHEN** se hace POST de alta nueva (sin `user_id`) con `send_pwd` verdadero y email del usuario
**THEN** se envía el correo de password a ese email
**AND** el cuerpo usa la contraseña generada en el store

#### Scenario: Checkbox no marcado
**WHEN** se crea un usuario sin `send_pwd` verdadero
**THEN** no se envía el correo de password de alta

## MODIFIED Requirements

(none)

## REMOVED Requirements

(none)

## Open Questions

- (ninguna). El fallo es el nombre del campo; no el SMTP.

## Expected Architecture Output

El agente debe entregar:

1. Resumen del change.
2. Ruta `openspec/changes/c2026-09-30-users-create-send-password/`.
3. Artefactos: proposal, design, tasks, spec, preflight, handoff.
4. Decisión: `Create.jsx` envía `send_pwd` como el modal y el controller.
5. Riesgo: no tocar recuperación de password.
6. Listo para implementación.
7. Próximo paso: `/opsx-apply`. No implementar PHP/React en el rol 10.
