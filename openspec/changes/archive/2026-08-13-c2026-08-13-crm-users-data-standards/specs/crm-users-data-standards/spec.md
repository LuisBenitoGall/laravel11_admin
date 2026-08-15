## ADDED Requirements

### Requirement: Catálogo canónico por tipo de campo

El sistema MUST normalizar el inventario v1 con las mismas funciones en escritura HTTP, import Excel y comando de backfill.

- Email (`users.email`, `user_emails.email`, `crm_accounts.main_email`): trim, minúsculas, colapsar espacios, sin caracteres de control.
- Teléfono (`phones.e164`, `crm_accounts.main_phone`): E.164 (libphonenumber); región por defecto ES si no hay prefijo `+`.
- NIF (`users.nif`, `crm_accounts.tax_id`, `crm_accounts.nif`): quitar espacios y guiones, mayúsculas.
- Nombre de persona (`users.name`, `users.surname`): Title Case UTF-8; partículas en minúsculas si no son el primer token (`de`, `del`, `la`, `las`, `los`, `y`, `e`, `da`, `di`, `van`, `von`); preservar prefijo `Mc` / `O'`; conservar MAYÚSCULAS en tokens de 2–3 letras que ya eran todo mayúsculas.
- Nombre de cuenta (`crm_accounts.name`, `tradename`): trim y colapsar whitespace; MUST NOT cambiar casing.
- Texto de cuenta (`website`, `billing_*`, `shipping_*` salvo country_code): trim, colapsar whitespace, quitar control chars. `*_country_code`: mayúsculas ISO si hay valor.
- Fecha (`users.birthday`): persistir `Y-m-d` si es parseable.
- Slug: `crm_accounts.normalized_name` MUST ser `Str::slug` del `name` persistido (tras las reglas de name aplicables).

#### Scenario: Email a minúsculas

- **WHEN** se guarda o backfillea un email con mayúsculas o espacios
- **THEN** el valor persistido es el email recortado en minúsculas

#### Scenario: Teléfono a E.164 con default ES

- **WHEN** se guarda o backfillea un teléfono nacional sin `+` parseable como ES
- **THEN** el valor canónico es E.164 (prefijo `+34` cuando corresponda)

#### Scenario: Razón social conserva mayúsculas

- **WHEN** una cuenta tiene `name` en mayúsculas legales
- **THEN** tras normalizar solo se recortan espacios y el casing del `name` no cambia

#### Scenario: Nombre de persona con partícula

- **WHEN** un `surname` es `DE LA TORRE` o equivalente
- **THEN** el valor persistido usa Title Case con las partículas de la lista en minúsculas

### Requirement: Escritura hacia delante unificada

Create/update de User y CrmAccount, mutators de User, sync de `phones` e `importStore` MUST usar la misma capa de normalizers. MUST NOT dejar reglas divergentes entre import y UI.

#### Scenario: Import y alta manual coinciden

- **WHEN** el mismo email, NIF, teléfono o nombre entra por formulario y por Excel
- **THEN** el valor persistido es idéntico

### Requirement: Comando de backfill de producción

MUST existir `php artisan data:normalize-crm-users` idempotente. Sin `--apply` MUST ser dry-run (no escribe). `--apply` persiste solo campos sin colisión ni fallo de parseo. `--company=` acota el universo. `--chunk=` pagina. MUST emitir informe (stdout y fichero bajo `storage/logs/`) con before/after y action. Segunda ejecución `--apply` MUST no reescribir valores ya canónicos.

#### Scenario: Dry-run no muta

- **WHEN** se ejecuta el comando sin `--apply` sobre datos sucios
- **THEN** no hay UPDATE en BD
- **AND** el informe incluye antes/después y skips

#### Scenario: Apply idempotente

- **WHEN** se ejecuta `--apply` y luego `--apply` otra vez
- **THEN** la segunda pasada reporta cero actualizaciones (salvo skips estables)

### Requirement: Skip y reporte en colisión o no parseable

Si el valor canónico chocaría con UNIQUE existente o no es parseable, el sistema MUST dejar el valor original de ese campo, MUST NOT borrar la fila ni vaciar el campo, y MUST registrar skip en el informe. MUST NOT fusionar entidades. Otros campos de la misma fila MAY actualizarse.

#### Scenario: Email que colisiona

- **WHEN** normalizar el email del user A produciría el mismo email único que el user B
- **THEN** no se cambia el email de A
- **AND** el informe registra colisión

#### Scenario: Teléfono no parseable

- **WHEN** un `phones.e164` o `main_phone` no se puede parsear a E.164
- **THEN** el valor no se borra ni se vacía
- **AND** el informe lo lista como no parseable

### Requirement: Scope multiempresa del comando

Con `--company=` el comando MUST limitar cuentas a ese `company_id` y users a los ligados por `crm_contacts.user_id` o `user_companies` de esa empresa. MUST NOT modificar users ni cuentas de otra empresa. Sin flag MUST iterar empresas con la misma regla y deduplicar user IDs. Users sin `user_companies` ni `crm_contacts` MUST NOT incluirse.

#### Scenario: No cruza empresas

- **WHEN** `--company=X` y existe la misma suciedad en empresa Y
- **THEN** solo se informan o aplican cambios del universo de X

### Requirement: Cuentas enlazadas a maestro

Si la cuenta está enlazada a maestro, el backfill MUST NOT persistir `name`, `tradename`, `nif` ni `tax_id`; MUST skip y reportar. El backfill MAY actualizar `main_email`, `main_phone`, `website` y direcciones. El backfill MAY recalcular `normalized_name` con `Str::slug` del `name` persistido sin mutar `name`.

#### Scenario: Skip fiscal en cuenta enlazada

- **WHEN** una cuenta enlazada tiene `name` con espacios extra
- **THEN** no se persiste el `name` recortado
- **AND** el informe registra skip por maestro

### Requirement: Vistas y export alineados al canónico

Listados admin y export XLS/CSV MUST mostrar los valores persistidos. Fechas en export (`birthday` y columnas marcadas como fecha) MUST formatearse `dd/mm/yyyy`. MUST NOT reaplicar Title Case ni cambiar casing de personas o cuentas en el fichero.

#### Scenario: Export de fecha

- **WHEN** el usuario exporta un listado que incluye `birthday`
- **THEN** la celda sale en formato `dd/mm/yyyy` a partir de la fecha canónica en BD

### Requirement: Teléfono de cuenta solo escalar

La normalización de teléfono de `CrmAccount` MUST aplicarse al campo escalar `main_phone`. MUST NOT crear ni sincronizar `phones` morph sobre la cuenta.

#### Scenario: Main phone de cuenta

- **WHEN** una cuenta tiene `main_phone` parseable
- **THEN** se persiste E.164 en `main_phone`
- **AND** no se crea un registro `phones` cuyo phoneable sea la cuenta
