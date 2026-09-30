# Preflight check — c2026-09-22-custody-intake-identity

## Resultado

**Listo para implementación.** Open Questions del brief cerradas en `design.md` (NIF sentinela = null; UI = logística mínima; particular sin email/nif permitido).

## Dominio

- [x] Custodio = sesión. Cliente = company XOR user. CRM solo alta.
- [x] Sin albarán ni products.

## Scope

- [x] Migración CP, ensure, resolución, UI mínima, tests.
- [x] `convertToCustomerProvider` y listado customers empresa no se rediseñan.

## Datos

- [x] `customer_id` nullable + `user_customer_id`. Sin backfill.
- [x] Sentinelas: Anónimo / nif null (unique companies.nif permite NULL).

## Autorización

- [x] Reutilizar create customers/users + módulo logistics. Policy CP ampliada.

## UI

- [x] Una pantalla logística. `openspec/_global/`. Sin UI contract docs.

## Testing

- [x] Feature PHPUnit. Playwright no.

## Bloqueos

- Ninguno.
