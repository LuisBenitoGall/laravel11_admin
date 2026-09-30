## Why

Al crear un usuario en `/admin/users/create` y marcar «Enviar password al usuario», no se envía el correo. La recuperación de contraseña sí funciona: no es un fallo de SMTP. El formulario manda `send_password` y el store solo lee `send_pwd`, así que `Mail::send` nunca se ejecuta.

## What Changes

- `Create.jsx` usa `send_pwd` (mismo contrato que `ModalUserCreate` y `UserController::store`).
- El checkbox marcado dispara el envío ya existente (`emails.send-user-password`).
- Tests Feature con Mail fake: flag true envía; flag false no.
- Sin cambios de mailer, plantilla, reset de password ni `UserStoreRequest` salvo el nombre del campo en el form.

## Capabilities

### New Capabilities

- `users-create-send-password`: el flag de alta en `/admin/users/create` activa el correo de password existente.

### Modified Capabilities

- (ninguna spec canónica de este flujo en `openspec/specs/`.)

## Impact

- Frontend: `resources/js/Pages/Admin/User/Create.jsx` (`useForm` + checkbox).
- Backend: sin cambio de lógica de `Mail::send` si el flag llega como `send_pwd`.
- Tests Feature PHPUnit (`Mail::fake`).
- No toca `PasswordResetLinkController`.
