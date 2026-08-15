# Prompt para 10-architecture

Change: <dd-mm-yyyy>-<modelo-principal>-<accion-semantica>
Rule: aplica 10-architecture
Module: <specs/modulo-afectado> # opcional
Skills: <docs/skills/skill-1.md>, <docs/skills/skill-2.md> # opcional
AgentSkills: <.agents/skill-1>, <.agents/skill-2> # opcional
Capabilities: <capability-1>, <capability-2> # solo si aplica a specs/capacidades globales

Summary:
<Breve contexto del cambio, unas 40-70 palabras. Debe explicar qué se quiere conseguir y por qué.>

Goals:
- <Objetivo funcional/técnico 1>
- <Objetivo funcional/técnico 2>
- <Objetivo funcional/técnico 3>

NonGoals:
- <Qué NO debe tocarse>
- <Qué queda explícitamente fuera de alcance>
- <Qué comportamiento existente no debe modificarse>
- <Qué módulos/capas no deben verse afectados>

Notes:
- <Información adicional útil, no central>
- <Restricciones conocidas>
- <Decisiones previas>
- <Riesgos o dependencias>

ReferencePatterns:
- Backend reference: <ruta de módulo/backend similar o “none”>
- Frontend reference: <ruta de módulo/frontend similar o “none”>
- Tests reference: <ruta de tests similares o “none”>
- UI reference: <ruta de componente/pantalla similar o “none”>

UIContract:
- Si el cambio toca frontend, debe respetar `docs/frontend/ui-contract.md`.
- Si el cambio toca frontend, debe consultar `docs/frontend/component-manifest.md`.
- Los módulos funcionales deben usar componentes comunes de `resources/js/shared/ui`.
- No se permite crear UI ad hoc si existe componente común.
- Si falta un componente común, debe quedar como tarea explícita y documentarse como UI gap.
- No improvisar tablas, botones, inputs, selects, modales ni estados visuales locales.

DataImpact:
- <Indicar si hay migraciones, columnas, relaciones, índices, constraints o impacto en datos existentes>
- <Si no aplica, escribir: No data impact expected>

AuthorizationImpact:
- <Permisos esperados>
- <Policies/Gates/Middleware afectados>
- <Reglas por instancia si aplican>
- <Casos 403 esperados>
- <Si no aplica, escribir: No authorization impact expected>

TestingImpact:
- <Tests backend esperados>
- <Tests frontend/typecheck/lint esperados>
- <Tests Playwright/E2E esperados si aplica>
- <Casos negativos/permisos/validaciones a cubrir>
- <Si no aplica algún tipo de test, justificar brevemente>

PlaywrightImpact:
- Required: <yes/no>
- Reason: <por qué se requiere o por qué no>
- Flows to cover:
  - <flujo 1>
  - <flujo 2>
- Roles/users:
  - <rol/usuario 1>
  - <rol/usuario 2>
- Destructive flows allowed: <yes/no>
- Notes:
  - <restricciones de entorno, datos o permisos>

ImplementationHandoff:
- Crear `implementation-handoff.md` dentro del change, utiliza el template: /openspec/prompts/template_implementation_handoff.md
- Debe estar orientado a Claude Code.
- Debe incluir ruta real del change.
- Debe indicar comando recomendado `/opsx-apply`.
- Debe limitar scope y fases.
- Debe indicar archivos que Claude debe leer primero.
- Debe indicar patrones de referencia.
- Debe incluir reglas UI si hay frontend.
- Debe incluir checks obligatorios.
- Debe indicar cómo actualizar `tasks.md`.
- Debe indicar explícitamente que Claude Code no debe archivar el change.

Preflight:
- Crear `preflight-check.md` dentro del change.
- Debe validar si el change está listo para implementación.
- Debe cubrir dominio, scope, datos, autorización, UI, testing y bloqueos.
- Si hay ambigüedad relevante, marcar el change como bloqueado.

RequiredGeneratedArtifacts:
- `proposal.md`
- `design.md` si hay decisiones no triviales
- `tasks.md`
- specs afectadas
- `preflight-check.md`
- `implementation-handoff.md`

AgentBoundaries:
- 10-architecture no implementa código de producción.
- 10-architecture no modifica lógica real del sistema.
- 10-architecture no archiva changes.
- 10-architecture no resuelve ambigüedades inventando reglas de negocio.
- Si falta información, debe documentar pregunta, alternativa o bloqueo.

Body:

## ADDED Requirements

### Requirement: <Nombre claro del nuevo requisito>
<Descripción en lenguaje natural de lo nuevo que se quiere añadir. Debe expresar comportamiento observable, no implementación interna.>

#### Scenario: <Nombre de escenario 1>
**WHEN** <condición de entrada o acción del usuario/sistema>
**THEN** <resultado esperado verificable>

#### Scenario: <Nombre de escenario 2>
**WHEN** <condición de entrada o acción del usuario/sistema>
**THEN** <resultado esperado verificable>

## MODIFIED Requirements

### Requirement: <Nombre del requisito EXISTENTE que se modifica>
<Breve explicación de qué cambia respecto a la spec global existente.>

#### Scenario: <Nombre de escenario existente o nuevo>
**WHEN** <condición de entrada incluyendo el nuevo matiz>
**THEN** <resultado esperado actualizado>

## REMOVED Requirements

### Requirement: <Nombre del requisito que se elimina>
<Explicación de por qué deja de aplicar. Usar solo si realmente se elimina comportamiento existente.>

## Open Questions

- <Pregunta 1 si hay ambigüedad>
- <Pregunta 2 si hay decisión pendiente>

## Expected Architecture Output

El agente debe entregar:

1. Resumen del change creado o actualizado.
2. Ruta del change.
3. Artefactos generados.
4. Decisiones principales.
5. Riesgos o bloqueos.
6. Si el change queda listo para implementación.
7. Próximo paso recomendado para Claude Code.