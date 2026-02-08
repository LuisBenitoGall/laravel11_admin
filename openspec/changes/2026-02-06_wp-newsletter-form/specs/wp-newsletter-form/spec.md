# Spec: Endpoint WP newsletter-form

Los escenarios siguientes se cubren con tests en `tests/Feature/WpNewsletterFormTest.php`.

## ADDED Requirements

### Requirement: Recepción y validación del formulario

El endpoint POST `/api/wp/newsletter-form` acepta los campos del formulario WordPress y valida que el email esté presente y sea válido.

#### Scenario: Petición sin email

- **WHEN** el cliente envía POST sin `field_email` o con valor vacío
- **THEN** la respuesta tiene código HTTP 400
- **AND** el cuerpo JSON contiene `success: false` y un mensaje de error (ej. "Missing email")

#### Scenario: Petición con email inválido

- **WHEN** el cliente envía POST con `field_email` en formato no válido
- **THEN** la respuesta tiene código HTTP 400
- **AND** el cuerpo JSON contiene `success: false` y un mensaje de error (ej. "Invalid email format")

#### Scenario: Petición válida con todos los campos

- **WHEN** el cliente envía POST con `field_email` válido y opcionalmente `field_nombre`, `field_apellidos`, `field_producto`, `field_servicio`, `lang`
- **THEN** la validación pasa y el flujo continúa (no se responde 400 por estos campos)

---

### Requirement: Usuario existente o nuevo

El sistema debe disponer de un usuario asociado al email recibido; si no existe, se crea.

#### Scenario: Email no existe en users

- **WHEN** el email recibido no existe en la tabla `users`
- **THEN** se crea un nuevo registro en `users` con nombre, apellidos, email, contraseña aleatoria, `isAdmin = false`, `status = 0`
- **AND** ese usuario se usa en los pasos siguientes

#### Scenario: Email ya existe en users

- **WHEN** el email recibido ya existe en la tabla `users`
- **THEN** se reutiliza ese usuario
- **AND** no se crea un segundo usuario con el mismo email

---

### Requirement: Contacto CRM

Para el usuario resuelto (existente o nuevo), debe existir un contacto CRM para la empresa del controlador; si no existe, se crea.

#### Scenario: No existe contacto CRM para el usuario en la empresa

- **WHEN** no existe registro en `crm_contacts` con `company_id` del contexto y `user_id` del usuario
- **THEN** se crea un nuevo contacto con `contact_type = 'newl'`, `status = 1`, `acceptance = now`
- **AND** ese contacto se usa para guardar el mensaje y, si aplica, la lista de marketing

#### Scenario: Ya existe contacto CRM

- **WHEN** ya existe un contacto en `crm_contacts` para ese `company_id` y `user_id`
- **THEN** se reutiliza ese contacto
- **AND** no se crea un segundo contacto para el mismo par company/user

---

### Requirement: Mensaje de contacto

Se debe guardar un mensaje asociado al contacto con los datos de producto y servicio del formulario.

#### Scenario: Guardar mensaje con producto y servicio

- **WHEN** el contacto CRM está resuelto (existente o recién creado)
- **THEN** se crea un registro en `crm_contact_messages` con:
  - `crm_contact_id` del contacto
  - `title` identificativo (ej. "Newsletter form")
  - `message` con producto y servicio (formato serializado/JSON)
  - `origin` que identifique el formulario y el idioma (ej. "Formulario newsletterForm es")

---

### Requirement: Lista de marketing

El usuario debe quedar incluido en la lista de marketing con slug definido en el método (`newsletter-envio`), comprobando antes si ya está.

#### Scenario: Lista existe y usuario no está en la lista

- **WHEN** existe una lista en `marketing_lists` con `slug = 'newsletter-envio'` y el usuario no está en `marketing_list_users` para esa lista
- **THEN** se inserta un registro en `marketing_list_users` vinculando `marketing_list_id` de esa lista y `user_id` del usuario
- **AND** se devuelve respuesta 200 con `success: true`

#### Scenario: Usuario ya está en la lista

- **WHEN** el usuario ya tiene un registro en `marketing_list_users` para la lista `newsletter-envio`
- **THEN** no se inserta un duplicado
- **AND** se devuelve respuesta 200 con `success: true`

#### Scenario: Lista newsletter-envio no existe

- **WHEN** no existe ninguna lista con `slug = 'newsletter-envio'`
- **THEN** se registra un warning en log (ya existente)
- **AND** la respuesta al cliente sigue siendo 200 con `success: true` (el resto del flujo se completó; solo falla el alta en lista)

---

### Requirement: Notificación al administrador en error

Si en cualquier paso del flujo (usuario, contacto, mensaje, lista) se produce una excepción no controlada, el administrador debe ser notificado y el cliente debe recibir una respuesta de error segura.

#### Scenario: Excepción durante el flujo

- **WHEN** ocurre una excepción (p. ej. error de base de datos, timeout) en cualquiera de los pasos de newsletterForm
- **THEN** el error se registra en log con contexto suficiente (endpoint, datos recibidos anonimizados si aplica, mensaje de excepción)
- **AND** se envía una notificación al administrador (canal definido en design: email, notificación Laravel, etc.)
- **AND** la respuesta al cliente es JSON con `success: false` y código HTTP 5xx (500 o 503)
- **AND** el cuerpo de la respuesta no expone detalles internos (stack trace, mensajes de BD, etc.)

#### Scenario: Flujo completo sin excepciones

- **WHEN** todos los pasos se ejecutan correctamente
- **THEN** no se notifica al administrador
- **AND** la respuesta es 200 con `success: true`
