## Context

Oleada 0 de custodia RFT (brief `docs/prompts/c2026-09-22-custody-intake-identity.md`). `customer_providers` es par `customer_id`+`provider_id` NOT NULL → `companies`. Alta cliente (`storeCustomer`) usa `saveCompany` + CP. CRM `convertToCustomerProvider` exige `linked_company_id`. Este change no pasa por CRM para la relación; CRM solo espeja **altas nuevas**.

`companies.nif` es unique global y **nullable**. `companies.slug` no es único. `CustomerStoreRequest` exige name, tradename, nif en el alta de cliente clásica; este flujo relaja nif (null).

No hay email en el modelo `Company`; revelación empresa = `nif` (y `name` opcional en búsqueda, no como factor de conflicto user/company). Particular: `users.email`, `users.nif`.

## Goals / Non-Goals

**Goals:** XOR en CP; resolver perfil; asegurar cliente; espejo CRM solo en create; UI mínima; tests.

**Non-Goals:** Albarán, tracking, `products`/dueño de pieza, taller, PDA, Holded, rediseño del índice de clientes, fusión de perfiles.

## Decisions

1. **Schema CP**  
   - `customer_id` nullable (FK companies).  
   - `user_customer_id` nullable (FK users, restrict/nullOnDelete alineado a users).  
   - CHECK: `(customer_id IS NULL) <> (user_customer_id IS NULL)` (XOR).  
   - Unique existente `(customer_id, provider_id, deleted_at)` se mantiene (varios NULL `customer_id` + mismo provider: en MySQL/SQLite NULL no colisionan entre sí de forma fiable → el unique de particulares es el nuevo).  
   - Unique nuevo `(user_customer_id, provider_id, deleted_at)`.  
   - CHECK `customer_id <> provider_id` cuando `customer_id` IS NOT NULL.  
   - Filas actuales no se migran de datos.

2. **Asegurar cliente**  
   Servicio/Action `EnsureSessionProviderCustomer` (nombre libre): `provider_id` = `CompanyContext`. Idempotente. Entrada: company XOR user. No escribe CRM.

3. **Resolución**  
   - Tipo `company` | `user`.  
   - Criterios: email y/o NIF normalizados (`EmailNormalizer`, `NifNormalizer`).  
   - Empresa: buscar `companies.nif`. (Company no tiene email.)  
   - Particular: `users.email` y/o `users.nif`.  
   - Si el operador eligió un tipo y solo hay match en el **otro** tipo → conflicto (mismo criterio cruzado).  
   - Si hay match en ambos lados → conflicto; admin elige uno.  
   - 0 matches del tipo elegido y 0 en el otro → alta.  
   - 1 match del tipo elegido y 0 en el otro → seleccionar.

4. **Existente**  
   `Ensure…` only. Cero inserts CRM.

5. **Alta empresa — sentinelas**  
   `saveCompany` con:  
   - `name` = `Anónimo` (o `Anónimo` + sufijo corto si se quiere distinguir en UI; slug `anonimo` no es unique).  
   - `tradename` = mismo que `name`.  
   - `nif` = **null** (unique lo permite; evita NIF inventado).  
   - `with_account` = true (plan `free` como hoy).  
   - `auto_link` = false (no UserCompany del operador salvo que el request lo pida; este flujo no).  
   Luego `CrmAccount::saveAccount` con `linkedCompanyId` = nueva company, `company_id` = sesión. Luego Ensure CP `customer_id`.  
   Este flujo **no** usa `CustomerStoreRequest` (nif required); FormRequest propio.

6. **Alta particular**  
   User: `name` = `Anónimo` si no hay nombre; email/nif los del formulario si vienen (pueden ir vacíos si la revelación no los trajo — design: alta mínima exige al menos un identificador futuro o acepta anónimo total). **Cerrado:** si no hay email ni nif, se crea igual (user suelto, name Anónimo), alineado a import. Sin `user_companies`. `CrmContact` `company_id` sesión, `user_id`. Ensure CP `user_customer_id`.

7. **UI**  
   Pantalla mínima bajo **logística** (ruta tipo `logistics/intake-identity` o `custody/intake-identity`), no incrustada en customers. Sin wizard de albarán. Permisos: `customers.create` **o** `users.create` según rama; además módulo `logistics` si la ruta está bajo `ModuleSetted`. No nueva matriz Spatie.

8. **Helpers**  
   `isMyCustomerUser(int $providerId, int $userId)` además de los de empresa. `sideForCompanyPair` no se usa para particulares.

9. **Policy**  
   `CustomerProviderPolicy`: view/update si `provider_id` = sesión y (customer company visible o user_customer). Create vía Ensure en sesión.

10. **Listados customers.index**  
    No rediseñar. Pueden no mostrar particulares. Tarea: no romper JOIN empresas. Listar user-clientes = oleada posterior.

11. **Alternativas descartadas**  
    - Cliente particular como company fantasma.  
    - Revelar por CRM.  
    - NIF sentinela tipo `ANON-uuid` (ensucia unique fiscal).  
    - Auto-elegir en conflicto.

## Risks / Trade-offs

- **[Riesgo]** Varias companies con `nif` null: búsqueda por NIF no las distingue → **Mitigación**: alta anónima no se “encuentra” por NIF; se selecciona por listado/id si se reabre.  
- **[Riesgo]** `users.email` unique: dos anónimos sin email OK si email nullable.  
- **[Riesgo]** Índice clientes oculta particulares → **Mitigación**: NonGoal; documentado.  
- **[Riesgo]** SQLite tests vs unique con NULL → **Mitigación**: Feature cubre XOR en app, no solo índice.

## Migration Plan

- Una migración CP. Rollback: drop `user_customer_id`, revert nullable `customer_id` solo si no hay filas con `customer_id` null.  
- Deploy código + UI. Sin backfill.

## Open Questions

Cerradas: sentinela NIF = null; UI = pantalla logística mínima; particular sin email/nif permitido (Anónimo).
