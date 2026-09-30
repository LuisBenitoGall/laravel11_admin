# Prompt para 10-architecture

Change: c2026-09-30-marketing-lists-created-at-column
Rule: aplica 10-architecture
Module: Marketing / listado de listas (`/admin/marketing-lists`)
Skills: .cursor/skills/openspec-new-change/SKILL.md, .cursor/skills/openspec-ff-change/SKILL.md, .cursor/skills/openspec-continue-change/SKILL.md
AgentSkills: none
Capabilities: marketing-lists-index-created-at

Summary:
En la tabla de listas de marketing falta ver cuándo se creó cada lista. Hay que añadir una columna de fecha de creación inmediatamente a la izquierda de Acciones. El resto de la tabla (estructura, filtros actuales, sort, paginación, export, show, acciones, Brevo, preferencias de columnas) no se rediseña. La fecha se muestra con el formato del idioma de sesión.

Goals:
- Añadir una columna de fecha de creación del listado en `resources/js/Pages/Admin/MarketingList/Index.jsx`, como último item de `columns`, de modo que quede a la izquierda de la columna Acciones (Acciones sigue fuera del array, como hoy).
- Mostrar `marketing_lists.created_at` con el formato de fecha del idioma seleccionado (`LocaleTrait` índice `[4]`: `es`/`ca` → `d/m/Y`; `en` → `Y/m/d`), el mismo criterio que ya aplica `MarketingListResource` al campo `created_at`.
- Conservar ShowRegister, ColumnFilter, RecordsPerPage, TableExporter, FilterRow de columnas actuales, sort, paginación, StatusButton, Brevo y acciones de editar/eliminar.
- Filtro de rango de fechas en la columna nueva, funcional como Fecha alta de `/admin/users` (`filter: 'date'` + `dateKeys: ['date_from', 'date_to']`).
- Completar i18n de la cabecera: clave existente `fecha_creacion` en `lang/es.json`; falta en `lang/en.json` (añadir equivalencia, no otra clave de negocio).
- Tests Feature que cubran presencia/formato de la fecha en el payload del índice según locale de sesión, y el filtro `date_from`/`date_to`.

NonGoals:
- No rediseñar ni extraer la tabla. No cambiar columnas existentes (`name`, `members_count`, `created_by`) ni la columna Acciones.
- No cambiar `renderCellContent.jsx` de forma global. No cambiar el contrato Inertia del índice (`lists`, no migrar a `table.rows` en este change).
- No migraciones. `created_at` ya existe. No backfill. No tocar `formatted_created_at` de Show/Edit (fecha+hora).
- No cambiar `MarketingListResource` salvo que Architecture demuestre que el valor actual no sirve para la celda (hoy ya formatea con `$locale[4]`).
- No cambiar `dataQuery` salvo habilitar en UI el sort y el filtro de rango que **ya** permite (`allowedSortFields` incluye `created_at`; `date_from`/`date_to` ya cableados).
- No migrar `UserColumnPreference` de `tblMarketingLists`.
- No Playwright. No implementar código de producción en el rol 10.

Notes:
- Petición: columna de fecha de creación a la izquierda de Acciones; no tocar lo que ya funciona; formato según idioma.
- `columns` hoy: `name`, `members_count`, `created_by`. Acciones es `<th>`/`<td>` fijo al final.
- `MarketingListResource::toArray`: `'created_at' => Carbon::parse($this->created_at)->format($locale[4])`. Show/Edit usan `formatted_created_at` con `$locale[4].' H:i:s'`. El índice pide fecha, no hora.
- Riesgo técnico (no regla de negocio): `renderCellContent` trata keys `created_at` como ISO y pinta `dd/MM/yyyy` fijo. El Resource **no** manda ISO. Re-formatear en el front rompería `en` (`Y/m/d`). Design MUST exigir pintar el string del Resource (p. ej. `column.render` que devuelve `value`) sin parsear de nuevo.
- Sort: `MarketingListController::dataQuery` ya permite `created_at`. Activar `sort: true` en la columna nueva usa maquinaria existente; no es un sort nuevo en backend.
- Preferencias: si el usuario tiene `tblMarketingLists` guardado sin `created_at`, ColumnFilter la deja oculta hasta que la active. Comportamiento actual de `useTableManagement`; no inventar migración de prefs.
- Slug OpenSpec MUST empezar por letra: `c2026-09-30-marketing-lists-created-at-column`.
- Gap: no existe `openspec/prompts/template_implementation_handoff.md`. Generar `implementation-handoff.md` igual. Briefs en `docs/prompts/` (plantilla `openspec/prompts/template_prompts.md`).
- Change activo paralelo: `c2026-09-22-custody-intake-identity`. Este change es independiente.

ReferencePatterns:
- Backend reference: `app/Http/Resources/MarketingListResource.php` (`created_at` + `LocaleTrait::languages`); `app/Http/Controllers/Admin/MarketingListController.php` (`index`, `dataQuery` sort `created_at`).
- Frontend reference: `resources/js/Pages/Admin/MarketingList/Index.jsx` (array `columns` + Acciones fija).
- Tests reference: Feature Inertia/PHPUnit del admin; `tests/Feature/BrevoMarketingListExportTest.php` solo como vecino del módulo, no como patrón de columna.
- UI reference: misma tabla `tblMarketingLists`; no componente nuevo. Patrón de celda que **no** re-formatea: `crm_contact_created_at` en `renderCellContent.jsx` / `CrmContact/Index.jsx` (string del servidor). No copiar Product/User Index a ciegas (`key: created_at` + `filter: date` dispara el format `dd/MM/yyyy` del front).

UIContract:
- Si hay UI, respetar convenciones `openspec/_global/` (este repo no tiene `docs/frontend/ui-contract.md` / `component-manifest.md`; no inventarlos).
- No crear UI ad hoc. Reutilizar cabecera, `SortControl`, `FilterRow`, `renderCellContent` (con `render` de columna si hace falta), ColumnFilter.
- No improvisar tabla, botones, inputs ni Acciones.
- i18n con `__()`. Cabecera: `__('fecha_creacion')`. Completar `lang/en.json`.

DataImpact:
- No data impact expected

AuthorizationImpact:
- No authorization impact expected

TestingImpact:
- Feature: índice Inertia incluye `created_at` en cada fila del resource, formateado con el locale de sesión (`es` vs `en`).
- Feature o aserción: el valor no es ISO crudo si el Resource sigue formateando.
- Feature: `date_from`/`date_to` filtran por `created_at`.
- No tests de Playwright.
- No tests de permisos nuevos (no hay).

PlaywrightImpact:
- Required: no
- Reason: una columna en tabla admin existente; el formato sale del Resource y se cubre con Feature HTTP/Inertia.
- Flows to cover:
  - none
- Roles/users:
  - none
- Destructive flows allowed: no
- Notes:
  - none

ImplementationHandoff:
- Crear `implementation-handoff.md` dentro del change. Plantilla `/openspec/prompts/template_implementation_handoff.md` **no existe**; cubrir las viñetas de `openspec/prompts/template_prompts.md` y anotar el gap.
- Ruta real del change; comando `/opsx-apply`.
- Fases: columna en Index → i18n en → tests de formato por locale. No archivar.
- Leer primero: este brief, `Index.jsx`, `MarketingListResource.php`, `renderCellContent.jsx`.
- Implementation no archiva el change. Marcar `tasks.md` `[x]` sin reescribir contrato.

Preflight:
- Crear `preflight-check.md`.
- Cubrir dominio, scope, datos, autorización, UI, testing y bloqueos.
- Bloquear si se pretende re-formatear en el front con `dd/MM/yyyy` fijo.

RequiredGeneratedArtifacts:
- `proposal.md`
- `design.md` (obligatorio: cómo mostrar la fecha localizada sin pasar por el format fijo de `renderCellContent`)
- `tasks.md`
- specs (`specs/marketing-lists-index-created-at/spec.md` o kebab equivalente)
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

### Requirement: Columna fecha de creación en el listado de listas
La vista `/admin/marketing-lists` MUST mostrar, en la tabla de listados, una columna con la fecha de creación de cada lista. Esa columna MUST estar inmediatamente a la izquierda de la columna Acciones.

#### Scenario: Posición de la columna
**WHEN** un usuario autorizado abre el índice de listas de marketing
**THEN** ve la columna de fecha de creación a la izquierda de Acciones
**AND** las columnas Lista, Miembros, Autor y Acciones conservan su función actual

#### Scenario: Formato según idioma de sesión
**WHEN** el locale de sesión es `es` o `ca`
**THEN** la fecha de creación se muestra con formato `d/m/Y`
**WHEN** el locale de sesión es `en`
**THEN** la fecha de creación se muestra con formato `Y/m/d`

#### Scenario: Valor ya localizado no se re-formatea a un patrón fijo
**WHEN** el resource envía `created_at` ya formateado con `LocaleTrait` índice `[4]`
**THEN** la celda muestra ese valor
**AND** MUST NOT sustituirlo por un `dd/MM/yyyy` fijo del frontend

## MODIFIED Requirements

(none en specs canónicas de `openspec/specs/` para este listado.)

## REMOVED Requirements

(none)

## Open Questions

- Filtro de rango: **cerrado**. Sí, mismo estándar que Fecha alta en `/admin/users`.

## Expected Architecture Output

El agente debe entregar:

1. Resumen del change creado o actualizado.
2. Ruta del change (`openspec/changes/c2026-09-30-marketing-lists-created-at-column/` o el slug final válido).
3. Artefactos: `proposal.md`, `design.md`, `tasks.md`, spec delta, `preflight-check.md`, `implementation-handoff.md`.
4. Decisiones: posición, formato por locale vía Resource, no re-parse en `renderCellContent` global, filtro sí/no según Open Question.
5. Riesgos: doble formateo en el front; prefs de columnas que ocultan la key nueva.
6. Si el change queda listo para implementación (preflight OK o bloqueado por X).
7. Próximo paso: `/opsx-apply` (agente 20). No implementar PHP/React en el rol 10.
