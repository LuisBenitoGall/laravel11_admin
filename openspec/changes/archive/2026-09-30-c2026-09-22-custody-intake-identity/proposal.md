## Why

RFT custodia piezas ajenas. Antes del albarán hay que saber quién entrega (empresa o particular), reutilizar o crear el perfil, y dejarlo como **cliente operativo** de la empresa en sesión. Hoy `customer_providers` solo admite cliente empresa; un particular no cabe. CRM no debe definir esa relación.

## What Changes

- `customer_providers`: `customer_id` nullable; `user_customer_id` (FK users) nullable; XOR; unique `(user_customer_id, provider_id, deleted_at)`. `provider_id` sigue siendo empresa (RFT).
- Flujo: tipo Empresa | Particular → buscar email/NIF en `companies`/`users` → alta, selección o **conflicto** (admin elige; no fusión).
- Existente: solo `firstOrCreate` CP. No tocar CRM.
- Alta empresa: `saveCompany` con defaults anónimos + `crm_accounts` (`linked_company_id`) + CP `customer_id`.
- Alta particular: User suelto (sin `user_companies`) + `crm_contacts` + CP `user_customer_id`.
- UI mínima (logística, sin albarán): tipo, búsqueda, conflicto, alta/confirmación.
- Conservar filas y flujos empresa–empresa actuales.

## Capabilities

### New Capabilities

- `custody-intake-identity`: resolución del entregador, cliente XOR en `customer_providers`, espejo CRM solo en altas nuevas.

### Modified Capabilities

- (ninguna spec canónica en `openspec/specs/`; clientes empresa–empresa se conservan.)

## Impact

- Migración `customer_providers`; modelo/helpers/policy.
- Acción de asegurar cliente; `saveCompany` / `saveAccount` / alta User + CrmContact.
- Pantalla admin mínima Inertia bajo logística.
- Tests Feature (XOR, idempotencia, CRM solo alta, conflicto).
- Sin `products`, sin albarán, sin `convertToCustomerProvider` salvo compatibilidad.
