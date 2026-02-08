# Change: Endpoint WP newsletter-form — documentar y notificar errores al administrador

## Summary

Documentar el comportamiento del endpoint **POST `/api/wp/newsletter-form`** (formulario WordPress → usuario → contacto CRM → mensaje → lista de marketing) y completar la funcionalidad con **notificación al administrador** cuando ocurra cualquier error durante el proceso.

## Contexto actual

- **Ruta:** `Route::post('/wp/newsletter-form', [WpFormController::class, 'newsletterForm'])->name('wp.newsletter-form')->defaults('lang', 'es')`
- **Origen:** Formulario en un sitio WordPress que envía datos al ERP vía API.
- **Implementación existente:** `WpFormController::newsletterForm()` ya realiza:
  1. Validación mínima (email obligatorio y formato).
  2. Usuario: búsqueda por email; si no existe, creación.
  3. Contacto CRM: búsqueda por `company_id` + `user_id`; si no existe, creación (tipo `newl`).
  4. Mensaje: guardado en `crm_contact_messages` con producto/servicio en JSON.
  5. Lista de marketing: lista con slug `newsletter-envio`; si el usuario no está, se inserta en `marketing_list_users`.
- **Gap:** Si en cualquier paso ocurre una excepción (BD, validación, etc.), el cliente recibe un 500 y no hay ningún aviso explícito al administrador. Solo existe un `Log::warning` cuando la lista de marketing no existe.

## Motivation / Problem

- El flujo es crítico para captar leads desde el sitio web; los fallos deben ser visibles para el equipo.
- Sin notificación al administrador, los errores pueden pasar desapercibidos hasta que alguien reporte el fallo o revise logs.

## Alcance (Scope)

**Incluido:**

1. **Documentación OpenSpec**
   - Proposal (este archivo), specs (requisitos/escenarios), design (decisión de notificación), tasks.
   - Dejar el comportamiento del endpoint definido como contrato para futuros cambios y tests.

2. **Comportamiento ya implementado (solo documentar)**
   - Campos de entrada: `field_nombre`, `field_apellidos`, `field_email`, `field_producto`, `field_servicio`; `lang` opcional.
   - Flujo: usuario → contacto CRM → mensaje → lista `newsletter-envio` (comprobar si ya está antes de insertar).

3. **Nuevo: manejo de errores y notificación**
   - Envolver la lógica de `newsletterForm` en try/catch.
   - Ante excepción: registrar en log (contexto suficiente) y notificar al administrador (canal a definir en design: email, notificación Laravel, etc.).
   - Respuesta al cliente: en caso de error, devolver JSON con `success: false` y código HTTP adecuado (500 o 503), sin exponer detalles internos.

**Fuera de alcance (en este change):**

- Cambiar campos del formulario o la lista de marketing (slug `newsletter-envio` sigue fija en el método).
- Añadir autenticación al endpoint (sigue siendo público para el formulario WP).
- Refactorizar otros métodos de `WpFormController` (contact, newsletter, felipao).

## Impact

- `app/Http/Controllers/Admin/WpFormController.php`: añadir try/catch y llamada a notificación en error.
- `config/wp_forms.php`: configuración `error_notify_email` para notificación por correo.
- `tests/Feature/WpNewsletterFormTest.php`: tests del endpoint (validación 400, flujo 200, respuesta 500 en excepción).
- `openspec/changes/2026-02-06_wp-newsletter-form/`: proposal, specs, design, tasks.

## Capabilities

### Documented (existing)

- **wp-newsletter-form**: Recibe datos del formulario WordPress, asegura usuario y contacto CRM, guarda mensaje con producto/servicio y añade el usuario a la lista de marketing `newsletter-envio` si no está; responde JSON `{ success: true }` o error 400 por validación.

### Modified

- **wp-newsletter-form**: En caso de error inesperado durante el proceso, se registra el error y se notifica al administrador; la API responde con `success: false` y código 5xx sin detalles internos.
