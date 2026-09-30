# Spec: Importación de contactos CRM (XLS/XLSX)

## ADDED Requirements

### Requirement: Acción de importación en el listado de contactos

En la vista del listado de contactos CRM (`admin/crm-contacts`) MUST existir una acción con texto i18n `contactos_importar` e icono `la-file-import` que enlace a la vista de importación. La acción SHALL mostrarse solo a usuarios con permiso `crm-contacts.create`.

#### Scenario: Usuario con permiso ve la acción Importar

- **WHEN** el usuario tiene permiso `crm-contacts.create` y accede al listado de contactos
- **THEN** se muestra en las acciones del layout un botón/enlace con texto traducido por `contactos_importar` e icono `la-file-import`
- **AND** al activarlo se navega a la ruta GET de importación (p. ej. `crm-contacts/import`)

#### Scenario: Usuario sin permiso no ve la acción

- **WHEN** el usuario no tiene permiso `crm-contacts.create`
- **THEN** la acción "Importar contactos" no se muestra en el listado
- **AND** el acceso directo a la URL de importación (GET o POST) SHALL ser bloqueado (middleware de permiso) con respuesta de no autorizado o redirección acorde al proyecto

---

### Requirement: Rutas de importación

MUST existir una ruta GET para mostrar el formulario de importación y una ruta POST para enviar el archivo. Ambas SHALL estar protegidas por el permiso `crm-contacts.create`. La ruta GET SHALL ser `crm-contacts/import` (o equivalente bajo el prefijo admin del proyecto).

#### Scenario: GET import muestra el formulario

- **WHEN** un usuario con permiso `crm-contacts.create` realiza GET a la ruta de importación
- **THEN** se renderiza la vista con el formulario de importación (texto explicativo, enlace al template, input file)

#### Scenario: POST import sin permiso es rechazado

- **WHEN** un usuario sin permiso `crm-contacts.create` intenta POST a la ruta de almacenar importación
- **THEN** el servidor responde con error de autorización o redirección y no procesa el archivo

---

### Requirement: Vista de importación con condiciones y template

La vista de importación SHALL incluir: (1) texto explicativo en i18n con las condiciones para importar (formato .xls/.xlsx, peso máximo 2 MB, máximo 1000 filas); (2) un enlace de descarga al template Excel oficial; (3) formulario con input type file para subir el archivo. El layout y componentes SHALL seguir el consenso de otras vistas admin (p. ej. Index/Edit de CrmContact o User).

#### Scenario: Usuario ve condiciones y puede descargar template

- **WHEN** el usuario accede a la vista de importación
- **THEN** se muestra texto que explica formato admitido (.xls y .xlsx), tamaño máximo 2 MB y máximo 1000 filas
- **AND** existe un enlace o botón que permite descargar el template con las columnas: name, surname, user_email, user_nif, position, department, observations, company, company_nif, company_city, company_postal_code, company_street, company_phone, company_email

#### Scenario: Formulario con input file

- **WHEN** el usuario está en la vista de importación
- **THEN** se muestra un formulario con un input type="file" que acepta el archivo a importar
- **AND** la validación en JS SHALL comprobar formato (extensiones/mime) y tamaño máximo antes de permitir el envío o mostrar error claro

---

### Requirement: Validación en cliente del archivo

La vista SHALL realizar validación en JavaScript del archivo antes del envío: formato permitido (.xls, .xlsx) y tamaño máximo 2 MB. Si la validación falla, SHALL mostrarse un mensaje claro al usuario y SHALL poder impedirse el envío del formulario.

#### Scenario: Archivo con formato no permitido

- **WHEN** el usuario selecciona un archivo que no es .xls ni .xlsx
- **THEN** se muestra un mensaje de error indicando el formato requerido
- **AND** el envío del formulario puede bloquearse o advertirse antes de enviar

#### Scenario: Archivo que supera el tamaño máximo

- **WHEN** el usuario selecciona un archivo mayor a 2 MB
- **THEN** se muestra un mensaje indicando el límite de tamaño
- **AND** el envío puede bloquearse o advertirse

---

### Requirement: Proceso de guardado e integridad de datos

El backend SHALL validar el archivo (formato, peso, número de filas ≤ 1000). SHALL normalizar los datos (trim, minúsculas donde aplique, saneamiento de caracteres conflictivos). Para cada fila: (1) crear u obtener User por email o nif; si no hay email ni nif se crea igual (puede haber nombres repetidos). Campos user: name (required), surname, email, nif, isAdmin false, status true. (2) Crear u obtener CrmAccount por tax_id (company_nif); mapeo: company→name, normalized_name (slug de name), company_nif→tax_id, company_city→billing_city, company_postal_code→billing_postal_code, company_street→billing_street, company_phone→main_phone, company_email→main_email. (3) Si no existe CrmContact para ese user_id (y company_id de sesión), crear con company_id de sesión, user_id, crm_account_id si existe, position, department, observations. company_id SHALL ser siempre la empresa en sesión.

#### Scenario: Fila con email existente no crea usuario duplicado

- **WHEN** una fila del archivo contiene un email que ya existe en users
- **THEN** se utiliza el usuario existente (no se crea otro)
- **AND** se crea o actualiza el crm_contact asociado si corresponde

#### Scenario: Fila sin email ni nif crea usuario siempre

- **WHEN** una fila no tiene email ni nif
- **THEN** se crea un nuevo user con name (required) y el resto opcionales
- **AND** se permite que existan varios usuarios con mismo nombre y apellidos si carecen de email y nif

#### Scenario: Cuenta por tax_id

- **WHEN** una fila tiene company y/o company_nif
- **THEN** se busca crm_account por tax_id (company_nif); si no existe se crea con los campos mapeados (name, normalized_name, tax_id, billing_*, main_phone, main_email)
- **AND** el crm_contact creado o actualizado usa ese crm_account_id

---

### Requirement: Feedback durante y después del proceso

Durante el envío del formulario (POST) la vista SHALL mostrar un indicador de progreso (spinner o barra) con un texto tranquilizador. Al finalizar, SHALL mostrarse un mensaje de éxito o de error. Si hubiera filas que no se pudieron procesar, SHALL mostrarse en pantalla un listado de esas filas indicando que no se han podido procesar.

#### Scenario: Progreso durante el envío

- **WHEN** el usuario envía el formulario de importación
- **THEN** se muestra un spinner o barra de progreso y un texto que indique que se está procesando
- **AND** el usuario no puede reenviar el formulario mientras dura el proceso (o el estado está deshabilitado)

#### Scenario: Resultado con filas no procesadas

- **WHEN** el proceso termina y alguna fila no pudo procesarse
- **THEN** se muestra un mensaje de resultado (éxito parcial o error) y un listado de las filas no procesadas
- **AND** se indica claramente que esas filas no se han podido procesar (con motivo o número de fila si aplica)
