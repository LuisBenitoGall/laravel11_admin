## 1. Alinear el flag

- [x] 1.1 En `User/Create.jsx`, cambiar `send_password` por `send_pwd` en `useForm`, `name` del checkbox y `setData`
- [x] 1.2 No cambiar `UserController::store` salvo que el test demuestre que el flag boolean de Inertia no pasa el `input('send_pwd')` (entonces documentar; no reescribir el mailer)
- [x] 1.3 No tocar `ModalUserCreate`, `PasswordResetLinkController` ni `emails.send-user-password`

## 2. Tests

- [x] 2.1 Feature: POST `users.store` (alta nueva, con email) y `send_pwd` true → se envía `emails.send-user-password` al email del usuario (`Mail::fake`)
- [x] 2.2 Feature: misma alta con `send_pwd` false o ausente → no se envía correo de password

## 3. Verificación

- [x] 3.1 Ejecutar los tests de este change y comprobar que pasan
- [x] 3.2 `/opsx-verify` o checklist vs spec/design/tasks sin bloqueos
