## ADDED Requirements

### Requirement: Enviar password al crear usuario desde /admin/users/create
Cuando un operador crea un usuario en `/admin/users/create` y marca «Enviar password al usuario», el sistema MUST enviar el correo de password ya definido en `UserController::store` (vista `emails.send-user-password`, destinatario el email del usuario). El flag MUST llamarse `send_pwd`. MUST NOT enviarse si el flag no es verdadero. MUST NOT enviarse cuando `side` es `crm-accounts` (regla existente).

#### Scenario: Checkbox marcado
- **WHEN** se hace POST de alta nueva (sin `user_id`) con `send_pwd` verdadero y email del usuario
- **THEN** se envía el correo de password a ese email
- **AND** el cuerpo usa la contraseña generada en el store

#### Scenario: Checkbox no marcado
- **WHEN** se crea un usuario sin `send_pwd` verdadero
- **THEN** no se envía el correo de password de alta
