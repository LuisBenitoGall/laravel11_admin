## 1. Persistencia customer_providers

- [x] 1.1 Migración: `customer_id` nullable; `user_customer_id` FK users nullable; XOR; unique `(user_customer_id, provider_id, deleted_at)`; conservar unique empresa–empresa y CHECK distinct cuando hay `customer_id`
- [x] 1.2 Modelo `CustomerProvider`: fillable, relaciones, `ensure`/`firstOrCreate` XOR, helper `isMyCustomerUser`; no romper `relationBetween` / `sideForCompanyPair`
- [x] 1.3 Policy: autorizar filas con `user_customer_id` cuando `provider_id` es la sesión

## 2. Resolución y altas

- [x] 2.1 Búsqueda por tipo + email/NIF (normalizers); detectar conflicto cruzado user/company; no consultar CRM
- [x] 2.2 Existente: solo asegurar CP (`provider_id` = sesión); cero writes CRM
- [x] 2.3 Alta empresa: `saveCompany` name/tradename `Anónimo`, nif null, sin auto_link; `saveAccount` con `linked_company_id`; asegurar CP `customer_id`
- [x] 2.4 Alta particular: User suelto (`Anónimo` si no hay name), sin `user_companies`; `CrmContact` en sesión; asegurar CP `user_customer_id`

## 3. UI y rutas

- [x] 3.1 Pantalla Inertia mínima bajo logística (tipo, email/NIF, resultados, conflicto, alta/confirmación); i18n; sin albarán
- [x] 3.2 Rutas + middleware empresa en sesión; permisos `customers.create` / `users.create` según rama y módulo logistics si aplica; sin permisos Spatie nuevos

## 4. Tests

- [x] 4.1 Feature: CP empresa (regresión) y CP particular (XOR)
- [x] 4.2 Feature: existente asegura CP y no crea CRM
- [x] 4.3 Feature: alta empresa (company + account linked + CP) y alta user (sin user_companies + contact + CP)
- [x] 4.4 Feature: conflicto user+company no auto-elige; idempotencia CP

## 5. Verificación

- [x] 5.1 PHPUnit de este change en verde
- [x] 5.2 `/opsx-verify` o checklist vs spec/design/tasks sin bloqueos
