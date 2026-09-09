# crm-contacts-import-row-identity

## Purpose

Portero de identidad en la importación Excel de contactos CRM: procesar filas con al menos nombre, email de persona o teléfono de persona válido (E.164/ES); alta sin nombre con placeholder `Anónimo`; copy i18n de condiciones y motivo de fallo.

## Requirements

### Requirement: Portero de identidad de fila en import Excel

Durante el POST de importación de contactos CRM (`.xls`/`.xlsx`), tras normalizar la fila, el sistema MUST procesarla si y solo si se cumple al menos uno de: (1) `name` no vacío; (2) `user_email` no vacío; (3) `user_phone1` o `user_phone2` parseable a E.164 con región por defecto ES. `company_email` y `company_phone` MUST NOT satisfacer el portero. `user_nif` solo MUST NOT satisfacer el portero. Un teléfono con texto no parseable MUST NOT satisfacer el portero. Este requisito aplica solo a `CrmContactController@importStore`, no a comandos Artisan.

#### Scenario: Fila sin nombre con email de persona

- **WHEN** una fila tiene `name` vacío y `user_email` no vacío
- **THEN** la fila se procesa (no entra en no procesadas por identidad)
- **AND** si no hay User por email/NIF se crea uno

#### Scenario: Fila sin nombre con teléfono de persona válido

- **WHEN** una fila tiene `name` vacío, `user_email` vacío y `user_phone1` o `user_phone2` válido E.164/ES
- **THEN** la fila se procesa
- **AND** se crea un User nuevo si no hay match por email/NIF (sin buscar por teléfono)

#### Scenario: Fila sin los tres criterios

- **WHEN** una fila no tiene `name`, ni `user_email`, ni teléfono de persona válido
- **THEN** no se persiste User, CrmContact ni CrmAccount de esa fila
- **AND** aparece en el listado de filas no procesadas con el motivo i18n de identidad incompleta

#### Scenario: Solo datos de empresa no bastan

- **WHEN** una fila sin identidad de persona tiene `company_email` y/o `company_phone` (y opcionalmente `company`)
- **THEN** la fila se marca como no procesada por identidad
- **AND** no se crea cuenta ni contacto a partir de esa fila

#### Scenario: NIF de usuario solo no basta

- **WHEN** una fila tiene `user_nif` y no tiene `name`, `user_email` ni teléfono de persona válido
- **THEN** la fila se marca como no procesada por identidad

#### Scenario: Teléfono no parseable no cuenta

- **WHEN** una fila sin `name` ni `user_email` tiene `user_phone1`/`user_phone2` con texto que no parsea a E.164/ES
- **THEN** la fila se marca como no procesada por identidad
- **AND** no se inserta el registro

### Requirement: Placeholder Anónimo al crear User sin nombre

Si la fila pasa el portero y `name` está vacío tras normalizar, y el sistema MUST crear un User nuevo (no hubo match por email ni NIF), MUST persistir `users.name` con el literal `Anónimo`. Si hubo match de User existente, MUST NOT cambiar su `name`. Si la fila trae `name` no vacío, MUST persistir ese nombre (normalizado), nunca sustituirlo por `Anónimo`.

#### Scenario: Alta sin nombre

- **WHEN** una fila pasa el portero, `name` está vacío y no existe User por email/NIF
- **THEN** el User creado tiene `name` igual a `Anónimo`

#### Scenario: Match no pisa el nombre

- **WHEN** una fila pasa el portero con `name` vacío y `user_email` de un User ya existente con otro nombre
- **THEN** se reutiliza ese User
- **AND** su `name` permanece el que ya tenía

### Requirement: Copy de condiciones y motivo de fallo

La vista de importación MUST explicar que cada fila necesita al menos nombre, email de persona o teléfono de persona. El motivo en filas no procesadas por este portero MUST dejar de ser únicamente “Fila sin nombre.” y MUST indicar que faltan nombre, email y teléfono. Claves i18n en `lang/es.json` y `lang/en.json`.

#### Scenario: Usuario lee las condiciones

- **WHEN** el usuario abre GET `crm-contacts/import`
- **THEN** el texto de condiciones menciona la regla de al menos uno de los tres campos de persona

#### Scenario: Motivo en el reporte

- **WHEN** una fila falla el portero
- **THEN** el campo Motivo del reporte usa la nueva clave i18n (no el literal viejo “Fila sin nombre.”)

### Requirement: Proceso de guardado — name ya no es required de la fila

En el contrato de importación, la columna `name` del Excel deja de ser obligatoria. El User sigue teniendo `name` NOT NULL: se toma de la fila o, en alta sin nombre, de `Anónimo`. El resto del proceso (match email/NIF, resolución de cuenta, contacto, phones, `company_id` de sesión) no cambia.

#### Scenario: Fila sin email ni nif con nombre

- **WHEN** una fila tiene `name` informado y no tiene email ni nif
- **THEN** se crea un User nuevo con ese name (como hoy)
- **AND** se permiten homónimos sin email/nif

#### Scenario: Fila sin email ni nif sin nombre pero con teléfono válido

- **WHEN** una fila no tiene email ni nif, `name` vacío y teléfono de persona válido
- **THEN** se crea un User nuevo con `name=Anónimo`
- **AND** no se reutiliza otro User solo porque el teléfono coincida
