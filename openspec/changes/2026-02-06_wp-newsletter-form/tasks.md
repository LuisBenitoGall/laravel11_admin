# Tasks: WP newsletter-form — documentar y notificar errores

## 1. Documentación OpenSpec

- [x] 1.1 Crear proposal en `openspec/changes/2026-02-06_wp-newsletter-form/proposal.md`
- [x] 1.2 Crear spec en `openspec/changes/2026-02-06_wp-newsletter-form/specs/wp-newsletter-form/spec.md`
- [x] 1.3 Crear design en `openspec/changes/2026-02-06_wp-newsletter-form/design.md`
- [x] 1.4 Crear tasks en `openspec/changes/2026-02-06_wp-newsletter-form/tasks.md`

## 2. Configuración

- [x] 2.1 Añadir clave de configuración para email de notificación de errores (p. ej. `wp_form_error_notify_email` en `config/app.php` o nuevo `config/wp_forms.php`)

## 3. Controlador y manejo de errores

- [x] 3.1 En `WpFormController::newsletterForm()`, mantener la validación de email al inicio y las respuestas 400 fuera del try
- [x] 3.2 Envolver el flujo (usuario → contacto → mensaje → lista) en try/catch (\Throwable)
- [x] 3.3 En el catch: registrar Log::error con contexto (endpoint, request sanitizado, excepción)
- [x] 3.4 En el catch: si existe config de email de notificación, enviar correo al administrador con asunto y cuerpo mínimos (sin stack ni datos sensibles en el cuerpo)
- [x] 3.5 En el catch: devolver response JSON con `success: false` y código 500, mensaje genérico para el cliente

## 4. Tests

- [x] 4.1 Añadir `tests/Feature/WpNewsletterFormTest.php` con:
  - test 400 cuando falta o está vacío el email
  - test 400 cuando el email es inválido
  - test 200 y creación de user, contacto CRM y mensaje con datos válidos
  - test 200 y reutilización de usuario existente cuando el email ya existe
  - test 500 cuando ocurre una excepción (p. ej. FK por empresa inexistente)

## 5. Verificación manual

- [ ] 5.1 Comprobar que una petición válida sigue devolviendo 200 con `success: true`
- [ ] 5.2 Comprobar que en caso de error se hace log, se envía email si está configurado y se responde 500 con `success: false`
