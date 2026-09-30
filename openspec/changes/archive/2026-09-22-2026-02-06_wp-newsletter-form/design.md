# Design: WP newsletter-form — manejo de errores y notificación

## Context

- El endpoint `newsletterForm` ya implementa el flujo usuario → contacto CRM → mensaje → lista de marketing.
- No hay try/catch global; una excepción en cualquier paso devuelve la respuesta de error por defecto de Laravel (500 con stack en debug) y no hay aviso explícito al administrador.
- El proyecto usa Laravel 11, tiene `Mail::send` en algún controlador y existe `App\Notifications\LoginCodeNotification`; no hay un canal estándar aún para "errores de integración WP".

## Goals / Non-Goals

**Goals:**

- Registrar todos los errores del flujo con contexto suficiente para depuración.
- Notificar al administrador cuando falle el flujo (sin depender de que alguien mire los logs).
- Responder al cliente con un 5xx y `success: false` sin exponer detalles internos.

**Non-Goals:**

- No implementar reintentos automáticos ni colas para este endpoint (queda para otro change si se requiere).
- No cambiar el contrato de entrada/salida del endpoint más allá de asegurar una respuesta de error consistente en caso de excepción.

## Decisions

### Decision 1: Envolver la lógica en try/catch

- Todo el flujo actual de `newsletterForm` (validación de entrada, usuario, contacto, mensaje, lista) se mantiene igual.
- Se envuelve en un `try { ... } catch (\Throwable $e) { ... }`.
- En el `catch`:
  1. `Log::error()` con mensaje, contexto (request sanitizado: sin passwords, con tipo de formulario y lang) y excepción.
  2. Llamada a un mecanismo de notificación al administrador (ver siguiente decisión).
  3. `return response()->json(['success' => false, 'error' => '...'], 500);` con mensaje genérico (ej. "An error occurred") para no filtrar información sensible.

- Las respuestas 400 por validación (email faltante o inválido) se mantienen fuera del try/catch para no considerarlas "errores del proceso" que requieran notificación.

### Decision 2: Canal de notificación al administrador

- **Opción A — Log + correo a admin:** Usar `Log::error()` siempre y, en el mismo `catch`, enviar un correo a una dirección de administrador (configurable, p. ej. `config('mail.admin_notifications')` o `config('app.wp_form_error_notify_email')`). Ventaja: simple, no requiere UI. Desventaja: depende de SMTP.
- **Opción B — Notificación Laravel (database/mail):** Crear `App\Notifications\WpFormErrorNotification` y notificar a un usuario "admin" (por rol o por id configurado). Ventaja: reutiliza el sistema de notificaciones y se puede ver en el panel. Desventaja: hay que definir a qué usuario(s) notificar y si el panel ya muestra notificaciones.
- **Opción C — Solo Log (mínimo):** Solo `Log::error()` con contexto; el equipo revisa logs o un sistema externo (Sentry, etc.) los agrega. Ventaja: cero dependencias nuevas. Desventaja: no hay aviso proactivo en el producto.

**Recomendación para este change:** Implementar **Log siempre** + **opción A (email al admin)** si existe configuración; si no, dejar solo Log y documentar que se puede añadir después un `config('app.wp_form_error_notify_email')` y el envío de correo. Así el cambio es acotado y no obliga a tocar roles/notificaciones en BD.

- Config sugerida: `config/app.php` o nuevo `config/wp_forms.php` con clave `error_notify_email` (nullable). Si está definida y no vacía, en el `catch` se envía un correo con asunto tipo "Error en formulario WP newsletter-form" y cuerpo con mensaje de excepción y contexto (sin datos sensibles). Se puede usar `Mail::raw()` o una vista mínima.

### Decision 3: Contenido del mensaje de notificación

- Incluir: nombre del endpoint (`newsletterForm`), timestamp, mensaje de la excepción, código de excepción.
- No incluir: stack trace completo en el email (sí en el log), datos completos del request (sí se puede incluir "lang" y que el email estaba presente, sin mostrar el email si se considera sensible; o anonimizado).
- Objetivo: que el admin sepa que hubo un fallo y pueda ir al log para más detalle.

### Decision 4: Código HTTP en error

- Usar **500** para cualquier excepción no recuperable en este endpoint. Si en el futuro se distinguen errores de infraestructura (BD caída, etc.) se podría devolver 503; por ahora 500 es suficiente y coherente con "algo falló en el servidor".

---

## Resumen de implementación

1. **WpFormController::newsletterForm()**
   - Tras validar email (y devolver 400 si falla), abrir `try { ... }`.
   - Dentro del try: lógica actual (user, contact, message, marketing list).
   - `catch (\Throwable $e)`: Log::error, notificación (email si config existe), return JSON 500.
2. **Config**
   - Añadir en `config/app.php` o en `config/wp_forms.php` (nuevo) la clave `wp_form_error_notify_email` (nullable string).
3. **Email (si se implementa opción A)**
   - En el catch, si `config('app.wp_form_error_notify_email')` (o la clave elegida) tiene valor, enviar un correo con asunto y cuerpo mínimos (ver Decision 3).
4. **Tests (opcional en este change)**
   - Test que simule una excepción (p. ej. fallo al guardar) y compruebe que se hace Log::error y que la respuesta es 500 con `success: false`. Test de notificación (que se llame al envío de correo o que se registre la intención) si se añade.
