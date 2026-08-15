## ADDED Requirements

### Requirement: Resolución de CrmAccount en import Excel por tax_id y normalized_name

Durante el POST de importación de contactos CRM (`.xls`/`.xlsx`), cuando una fila aporta datos de empresa (`company` y/o `company_nif`), el backend MUST resolver `CrmAccount` dentro del `company_id` de la empresa en sesión según este orden:

1. Si `company_nif` no está vacío, MUST buscar una cuenta con el mismo `tax_id` y `company_id` de sesión. Si existe, MUST reutilizar ese id (**prioridad NIF**).
2. Si no hubo match por NIF y `company` no está vacío, MUST calcular `normalized_name` con `Str::slug(company)` y buscar una cuenta con ese `normalized_name` y `company_id` de sesión. Si existe, MUST reutilizar ese id.
3. Solo si no hubo match en (1) ni (2) y proceda crear cuenta según la entrada al bloque de empresa, MUST crear una `CrmAccount` nueva con el mapeo vigente (name, normalized_name, tax_id, billing_*, main_phone, main_email, owner/auditoría).

Si el NIF coincide con la cuenta A y el nombre normalizado coincide con una cuenta B distinta, el sistema MUST reutilizar A y MUST NOT fallar la fila por ese conflicto.

Esta regla MUST aplicarse solo al flujo de importación Excel. MUST NOT imponerse unicidad de nombre en altas/ediciones manuales de cuentas. MUST NOT incluir limpieza automática de duplicados existentes.

#### Scenario: Reutiliza por tax_id existente

- **WHEN** una fila de importación incluye `company_nif` que ya existe en `crm_accounts` para la empresa en sesión
- **THEN** no se crea una `CrmAccount` nueva
- **AND** el contacto usa el `crm_account_id` de la cuenta encontrada por `tax_id`

#### Scenario: Reutiliza por normalized_name si no hay match de NIF

- **WHEN** una fila no tiene NIF coincidente (vacío o no encontrado) y el `Str::slug(company)` coincide con `normalized_name` de una cuenta de la empresa en sesión
- **THEN** no se crea una `CrmAccount` nueva
- **AND** el contacto usa el `crm_account_id` de la cuenta encontrada por `normalized_name`

#### Scenario: Crea cuenta solo si no hay match por NIF ni por nombre

- **WHEN** una fila aporta datos de empresa y no existe match por `tax_id` ni por `normalized_name` en la empresa en sesión
- **THEN** se crea una `CrmAccount` nueva con name, normalized_name (`Str::slug`), tax_id y campos de facturación/contacto mapeados desde la fila

#### Scenario: Prioridad NIF ante conflicto con nombre

- **WHEN** el `company_nif` de la fila corresponde a la cuenta A y el nombre normalizado de la fila corresponde a la cuenta B distinta (misma empresa de sesión)
- **THEN** se reutiliza la cuenta A
- **AND** no se crea una cuenta nueva
- **AND** la fila no se marca como fallida por ese conflicto

#### Scenario: Scope multiempresa

- **WHEN** existe una cuenta en otra empresa (otro `company_id`) con el mismo `tax_id` o el mismo `normalized_name` que la fila
- **THEN** esa cuenta no se reutiliza
- **AND** la búsqueda solo considera cuentas con el `company_id` de la empresa en sesión
