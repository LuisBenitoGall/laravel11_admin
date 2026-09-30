## ADDED Requirements

### Requirement: Cliente operativo empresa XOR particular

`customer_providers` MUST permitir que el cliente sea una empresa (`customer_id`) o un particular (`user_customer_id`), nunca ambos ni ninguno. `provider_id` MUST ser una empresa. Las filas empresa–empresa existentes MUST seguir válidas.

#### Scenario: Relación con empresa cliente

- **WHEN** se asegura cliente empresa X frente a la empresa en sesión (RFT)
- **THEN** existe una fila con `customer_id = X`, `provider_id = RFT` y `user_customer_id` null

#### Scenario: Relación con particular

- **WHEN** se asegura cliente user U frente a la empresa en sesión
- **THEN** existe una fila con `user_customer_id = U`, `provider_id = RFT` y `customer_id` null

### Requirement: Resolución de perfil que entrega

El operador MUST elegir Empresa o Particular y buscar por email y/o NIF en `users` y `companies` (empresa: `nif`; particular: `email` y/o `nif`). Cero matches MUST permitir alta. Un match solo del tipo elegido MUST permitir seleccionar. Si el mismo criterio revela un user y una company, el sistema MUST mostrar conflicto y MUST NOT elegir solo. MUST NOT fusionar registros. MUST NOT revelar por tablas CRM.

#### Scenario: Conflicto user y company

- **WHEN** el NIF o email coincide con un `users` y una `companies`
- **THEN** la UI lista ambos candidatos
- **AND** el administrador elige uno
- **AND** no se fusionan registros

#### Scenario: Existente no toca CRM

- **WHEN** se selecciona un perfil ya existente y se asegura como cliente
- **THEN** se crea o reutiliza `customer_providers`
- **AND** no se inserta ni actualiza `crm_accounts` ni `crm_contacts` por este flujo

### Requirement: Alta nueva con espejo CRM

Si se crea empresa, MUST usarse `Company::saveCompany` con `name` y `tradename` tipo `Anónimo` y `nif` null, MUST crearse `crm_accounts` con `company_id` de sesión y `linked_company_id` de la nueva empresa, y MUST crearse la fila CP con `customer_id`. Si se crea particular, MUST crearse `users` sin exigir `user_companies`, `name` `Anónimo` si no hay nombre, MUST crearse `crm_contacts` en la sesión, y MUST crearse la fila CP con `user_customer_id`.

#### Scenario: Nueva empresa

- **WHEN** no hay match y el operador crea empresa
- **THEN** hay company + crm_account con `linked_company_id` + CP `customer_id`

#### Scenario: Nuevo particular suelto

- **WHEN** no hay match y el operador crea particular
- **THEN** hay user sin vínculo `user_companies` obligatorio + crm_contact + CP `user_customer_id`

### Requirement: Asegurar cliente es idempotente

Una segunda resolución del mismo dueño frente a la empresa en sesión MUST reutilizar la fila `customer_providers` activa y MUST NOT duplicarla.

#### Scenario: Segunda vez el mismo dueño

- **WHEN** el mismo user o company ya es cliente de la empresa en sesión
- **THEN** no se crea una segunda fila activa de `customer_providers`

### Requirement: UI mínima de resolución bajo logística

MUST existir una pantalla admin Inertia bajo logística (sin albarán) que permita elegir tipo, buscar por email/NIF, resolver conflicto, confirmar existente o crear. Textos i18n.

#### Scenario: Operador abre la resolución

- **WHEN** un usuario autorizado con empresa en sesión abre la pantalla de identidad de entrega
- **THEN** puede elegir Empresa o Particular e iniciar búsqueda o alta
