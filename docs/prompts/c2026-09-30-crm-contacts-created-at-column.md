# Prompt para 10-architecture

Change: c2026-09-30-crm-contacts-created-at-column
Rule: aplica 10-architecture
Module: CRM / listado de contactos (`/admin/crm-contacts`)
Skills: .cursor/skills/openspec-new-change/SKILL.md, .cursor/skills/openspec-ff-change/SKILL.md, .cursor/skills/openspec-continue-change/SKILL.md
AgentSkills: none
Capabilities: crm-contacts-index-created-at

Summary:
En la tabla de contactos CRM falta ver la fecha de alta del usuario y filtrarla en la misma vista. Hay que añadir una columna Fecha alta inmediatamente a la izquierda de Imagen, con datepicker de rango, resultados en el mismo índice, y ocultable con el selector de columnas ya existente. El resto de la tabla no se rediseña. La fecha se muestra con el formato del idioma de sesión.

Goals:
- Añadir la columna de fecha de alta en `resources/js/Pages/Admin/CrmContact/Index.jsx` inmediatamente antes de `avatar` (Imagen), no donde está el comentario tras `full_name`.
- Mostrar `users.created_at` con el formato del idioma de sesión (`LocaleTrait` índice `[4]`: `es`/`ca` → `d/m/Y`; `en` → `Y/m/d`), el mismo criterio que ya aplica `UserResource` al campo `created_at`.
- Incluir datepicker de rango en esa columna (`filter: 'date'` + `dateKeys: ['date_from', 'date_to']`) vía `FilterRow` existente; el cambio de fechas MUST recargar el mismo índice (contactos o, si comparte vista, leads) conservando el resto de query params (incl. builder si aplica).
- La columna MUST ser ocultable con `ColumnFilter` / `visibleColumns` (mismo mecanismo que el resto de columnas). No inventar otro control de visibilidad.
- Incluir `users.created_at` en el SELECT (y `groupBy` coherente) de `CrmContactController` dataQuery: hoy no está en el select agrupado; sin eso el Resource no tiene fecha fiable.
- Añadir `created_at` a `allowedSortFields` y ordenar por `users.created_at` si `sort: true` (hoy el allowlist no lo incluye; la columna comentada y `/admin/users` sí ordenan).
- Conservar columnas actuales, Acciones, builder, ad-hoc filters, `crm_contact_created_at` de leads, paginación, export.
- Tests Feature: payload `created_at` formateado según locale `es` vs `en`; filtro `date_from`/`date_to` reduce el listado en la misma vista.

NonGoals:
- No rediseñar ni extraer la tabla. No cambiar columnas existentes ni Acciones ni Imagen.
- No cambiar `renderCellContent.jsx` de forma global. No migrar el contrato `table` del índice.
- No usar `crm_contacts.created_at` / `crm_contact_created_at` / `__('contacto_fecha_alta')` como esta columna. Esa fecha CRM de leads MUST quedar como está.
- No tocar el filtro ad-hoc `created_between`.
- No migraciones. No backfill. No cambiar `UserResource` salvo que Architecture demuestre que el valor actual no sirve (hoy ya formatea con `$locale[4]`).
- No migrar `UserColumnPreference` de `tblContacts` (u otro `table.id` que envíe el controller).
- No Playwright. No implementar código de producción en el rol 10.
- Change distinto de `c2026-09-30-marketing-lists-created-at-column`.

Notes:
- Petición: pauta de la columna de listas (fecha visible, formato por idioma, filtro datepicker, ocultable); posición a la izquierda de Imagen en `/admin/crm-contacts`.
- En `Index.jsx` hay una columna `created_at` **comentada** tras `full_name` con `fecha_alta`, `sort`, `filter: 'date'`, `dateKeys: ['date_from', 'date_to']`. MUST descomentar/reubicar **antes de `avatar`**, no reactivar en la posición antigua.
- `UserResource`: `'created_at' => Carbon::parse($this->created_at)->format($locale[4])`. Label: `__('fecha_alta')` (existe en `lang/es.json` y `lang/en.json`).
- Backend ya filtra `date_from`/`date_to` sobre `users.created_at`. Falta la UI. Sort: `allowedSortFields = ['full_name', 'name', 'surname', 'email']` — hay que incluir `created_at`.
- Query select agrupado **no** incluye `users.created_at`. Design MUST añadirlo al SELECT y al `groupBy` (mismo criterio que `users.id`/`name`/`email`) para SQLite/MySQL.
- Riesgo técnico: `renderCellContent` trata keys `created_at` como ISO y pinta `dd/MM/yyyy` fijo. El Resource no manda ISO. Design MUST pintar el string del Resource (`column.render` passthrough), igual que el change de marketing lists. No copiar User/Product Index a ciegas.
- Misma página Index para `/admin/crm-contacts` y `/admin/crm-leads` (`$leads` por segmento). Insertar antes de `avatar` muestra la columna en ambos modos. En leads el orden queda: … `crm_contact_created_at`, `created_at`, `avatar`. No excluir leads salvo que se pida.
- Preferencias: si hay prefs guardadas sin `created_at`, la columna nace oculta hasta activarla en ColumnFilter. Comportamiento actual; no migrar prefs.
- Ocultar la columna oculta cabecera, celda y datepicker (`d-none` si no está en `visibleColumns`). No inventar limpieza de `date_from`/`date_to` al ocultar.
- Slug OpenSpec MUST empezar por letra: `c2026-09-30-crm-contacts-created-at-column`.
- Gap: no existe `openspec/prompts/template_implementation_handoff.md`. Briefs en `docs/prompts/` (plantilla `openspec/prompts/template_prompts.md`).
- Changes activos paralelos: custody intake; marketing-lists created-at. Este es independiente.

ReferencePatterns:
- Backend reference: `CrmContactController` dataQuery (filtro `date_from`/`date_to` sobre `users.created_at`; SELECT/groupBy); `UserResource` `created_at`.
- Frontend reference: `CrmContact/Index.jsx` (comentario de columna + `avatar` último); `FilterRow` DatePicker; `ColumnFilter`.
- Tests reference: Feature CRM contacts existentes (`tests/Feature/CrmContactTest.php`); PHPUnit del repo.
- UI reference: datepicker de `/admin/users` (`filter: 'date'` + `dateKeys`). Celda sin re-formatear: `crm_contact_created_at` en `renderCellContent.jsx`. Change de listas: `docs/prompts/c2026-09-30-marketing-lists-created-at-column.md`.

UIContract:
- Si hay UI, respetar convenciones `openspec/_global/` (este repo no tiene `docs/frontend/ui-contract.md` / `component-manifest.md`; no inventarlos).
- No crear UI ad hoc. Reutilizar `FilterRow` DatePicker, `SortControl`, `ColumnFilter`, `renderCellContent` (con `render` de columna).
- Datepicker: `dateFormat` / locale ya los toma `FilterRow` de `languages[6]` / `props.locale`.
- i18n con `__()`. Cabecera: `__('fecha_alta')`. No clave nueva.

DataImpact:
- No schema/migración. SELECT/groupBy de la query de listado incluye `users.created_at` (lectura). Sin backfill.

AuthorizationImpact:
- No authorization impact expected

TestingImpact:
- Feature: índice `/admin/crm-contacts` incluye `created_at` formateado `d/m/Y` con locale `es` y `Y/m/d` con locale `en` (no ISO).
- Feature: `date_from`/`date_to` filtra por `users.created_at` y devuelve el mismo índice (Inertia), no otra ruta.
- Feature opcional: sort `created_at` no cae al default `full_name`.
- No Playwright. No permisos nuevos.

PlaywrightImpact:
- Required: no
- Reason: columna + filtro Header Filter en tabla admin existente; cubrible con Feature HTTP/Inertia.
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
- Fases: SELECT/groupBy + sort allowlist → columna Index (antes de avatar, render passthrough, filter date) → tests locale y filtro. No archivar.
- Leer primero: este brief, `Index.jsx`, `CrmContactController` dataQuery, `UserResource`, `renderCellContent.jsx`, `FilterRow.jsx`.
- Implementation no archiva. Marcar `tasks.md` `[x]` sin reescribir contrato.

Preflight:
- Crear `preflight-check.md`.
- Cubrir dominio, scope, datos, autorización, UI, testing y bloqueos.
- Bloquear si se pretende re-formatear en el front con `dd/MM/yyyy` fijo, o si se usa `crm_contact_created_at` como esta columna, o si no se añade `users.created_at` al SELECT.

RequiredGeneratedArtifacts:
- `proposal.md`
- `design.md` (obligatorio: SELECT `users.created_at`, sort allowlist, `column.render`, posición antes de avatar, datepicker FilterRow)
- `tasks.md`
- specs (`specs/crm-contacts-index-created-at/spec.md` o kebab equivalente)
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

### Requirement: Columna fecha de alta en el listado de contactos
La vista `/admin/crm-contacts` MUST mostrar, en la tabla de contactos, una columna con la fecha de alta del usuario (`users.created_at`). Esa columna MUST estar inmediatamente a la izquierda de la columna Imagen. Las demás columnas y Acciones MUST conservar su función actual. La columna MUST poder ocultarse y mostrarse con el selector de columnas existente.

#### Scenario: Posición de la columna
**WHEN** un usuario autorizado abre `/admin/crm-contacts`
**THEN** ve la columna Fecha alta inmediatamente a la izquierda de Imagen
**AND** el resto de columnas conservan su función actual

#### Scenario: Columna ocultable
**WHEN** el usuario desactiva la columna en el selector de columnas
**THEN** no se muestran cabecera, filtro ni celdas de esa columna
**AND** el resto de la tabla sigue funcionando

### Requirement: Filtro datepicker en la misma vista
La columna MUST incluir un datepicker de rango (`date_from` / `date_to`) como las Fecha alta de `/admin/users`. Aplicar el rango MUST filtrar el listado por `users.created_at` y MUST permanecer en la misma vista (misma ruta índice, mismos demás params).

#### Scenario: Filtro por rango
**WHEN** el usuario elige un rango en el datepicker de Fecha alta
**THEN** el índice se recarga en la misma ruta con `date_from` y/o `date_to`
**AND** las filas cumplen `users.created_at` dentro de ese rango

### Requirement: Formato de fecha según idioma de sesión
La celda MUST mostrar `created_at` con `LocaleTrait` índice `[4]` (`es`/`ca`: `d/m/Y`; `en`: `Y/m/d`). Si el resource envía ese string, la celda MUST pintarlo tal cual y MUST NOT sustituirlo por un `dd/MM/yyyy` fijo del frontend. La cabecera MUST usar `__('fecha_alta')`.

#### Scenario: Locale español o catalán
**WHEN** el locale de sesión es `es` o `ca`
**THEN** la fecha de alta se muestra con formato `d/m/Y`

#### Scenario: Locale inglés
**WHEN** el locale de sesión es `en`
**THEN** la fecha de alta se muestra con formato `Y/m/d`

#### Scenario: Valor ya localizado no se re-formatea
**WHEN** el resource envía `created_at` ya formateado con `LocaleTrait` índice `[4]`
**THEN** la celda muestra ese valor
**AND** MUST NOT sustituirlo por un `dd/MM/yyyy` fijo del frontend

## MODIFIED Requirements

(none en specs canónicas distintas de este listado. No reabrir `crm-contacts-listado` / builder salvo que el filtro rompa `preserveParams`; en ese caso MUST conservar `marketing_list_id` y `build_marketing_list`.)

## REMOVED Requirements

(none)

## Open Questions

- (ninguna de negocio). Sort: sí, como la columna comentada y `/admin/users`; requiere allowlist backend. Fecha: `users.created_at`, no `crm_contacts.created_at`.

## Expected Architecture Output

El agente debe entregar:

1. Resumen del change creado o actualizado.
2. Ruta del change (`openspec/changes/c2026-09-30-crm-contacts-created-at-column/` o el slug final válido).
3. Artefactos: `proposal.md`, `design.md`, `tasks.md`, spec delta, `preflight-check.md`, `implementation-handoff.md`.
4. Decisiones: posición antes de Imagen, `users.created_at` en SELECT, datepicker FilterRow, `column.render`, sort allowlist, no confundir con `crm_contact_created_at`.
5. Riesgos: SELECT sin `created_at`; doble formateo front; prefs que ocultan la key; leads comparte Index.
6. Si el change queda listo para implementación (preflight OK o bloqueado por X).
7. Próximo paso: `/opsx-apply` (agente 20). No implementar PHP/React en el rol 10.
