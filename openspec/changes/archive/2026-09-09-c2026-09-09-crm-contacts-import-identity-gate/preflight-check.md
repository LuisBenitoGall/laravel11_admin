# Preflight check — c2026-09-09-crm-contacts-import-identity-gate

## Resultado

**Listo para implementación** (no bloqueado). Open Questions de negocio cerradas en explore/design.

## Dominio

- [x] Portero persona-only: name / user_email / teléfono E.164 ES.
- [x] `Anónimo` solo en create; no overwrite; no match por teléfono.
- [x] 57 filas solo-empresa del Excel de evidencia siguen fallando (a propósito).

## Scope

- [x] Solo `importStore` UI Excel. No Artisan, no CrmAccount resolution, no change stale `crm-contacts-import`.
- [x] Misma vista Import; solo copy i18n.

## Datos

- [x] Sin migraciones. Impacto: filas que hoy se rechazan por name vacío y pasen el portero.
- [x] Users existentes no se reescriben a Anónimo.

## Autorización

- [x] Sigue `crm-contacts.create` y `CompanyContext`. Sin permisos nuevos.

## UI

- [x] Sin pantallas/componentes nuevos. Reporte failed_rows reutilizado.
- [x] Gap: no existe `template_implementation_handoff.md`; handoff se genera en este change.

## Testing

- [x] Feature PHPUnit (escenarios 3.1–3.8). Playwright no requerido.

## Bloqueos

- Ninguno de negocio.
