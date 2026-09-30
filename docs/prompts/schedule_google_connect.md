- 08/02/2026:

Conectar agenda con Google Calendar. Hay que completar la conexión de la agenda (resources/js/Pages/Admin/Schedule/Index.jsx y ScheduleController) para poder guardar y leer eventos del calendario de Google. Ahora mismo ya existe el modal para introducir el email pero no es funcional aún.
Revisa todo el código existente y complétalo con lo necesario para conectarlo a Google Calendar.
Como siempre aclara previamente conmigo cualquier duda al respecto.


------------------------------------------------------------------------------------------------------

Respondo tus preguntas:

1. Alcance de la sincronización
¿Qué quieres en esta primera versión?
Solo lectura: mostrar en la agenda los eventos del calendario de Google (y opcionalmente guardarlos en schedule_events).
Solo escritura: al crear/editar eventos en la agenda, crearlos también en Google.
Bidireccional: leer de Google y escribir a Google (con reglas que habría que definir: qué calendario, qué agendas locales se mapean, etc.).

RESPUESTA: bidireccional. Vayamos definiendo las reglas. Tu me las presentas por relevancia y yo decido.

2. Mapeo agenda ↔ calendario de Google
¿Cada “agenda” (Schedule) tiene su propia conexión/contenedor en Google, o una sola conexión por usuario/empresa que sincroniza con un único calendario de Google (p. ej. “primary”)?

RESPUESTA: se conecta el usuario, no la empresa, aunque el usuario pueda utilizar algunos calendarios de su empresa. Respecto a la conexión, ¿cual resulta más eficiente?

3. Rutas con prefijo admin.
El frontend usa admin.integrations.google.*. Las rutas actuales se registran como integrations.google.connect (sin admin.). ¿Prefieres que añadamos las nuevas rutas (status, disconnect) con nombre admin.integrations.google.status (y similares) para que coincidan con el frontend, o que cambiemos el frontend para usar los nombres sin admin.?

RESPUESTA: las rutas deben seguir integradas en el grupo admin, los usuarios no se pueden conectar al calendario sin estar registrados y logueados.


------------------------------------------------------------------------------------------------------

Respondo a las reglas de sincronización bidireccional (por relevancia)

1) Granularidad de la conexión
Opción A — Una conexión por usuario (recomendada): un OAuth por usuario; el usuario elige uno o varios calendarios de su cuenta para sincronizar. Más simple, menos tokens y menos confusión.
Opción B — Una conexión por agenda (Schedule): cada Schedule podría mapear a un calendario distinto; más flexible pero más complejo (e.g. varios OAuth o un OAuth con múltiples calendar_id).
Recomendación: A (una conexión por usuario).

RESPUESTA: opción A

2) Mapeo agenda local ↔ calendario de Google
Opción A — Un calendario Google por usuario: todos los eventos de las agendas visibles del usuario se leen/escriben en un solo calendario (p. ej. "primary").
Opción B — Un calendario Google por Schedule: cada Schedule tiene un google_calendar_id (o "primary"); lectura/escritura por agenda.
Recomendación: B si quieres separar por agenda; A si quieres una única “vista” en Google.

RESPUESTA: opción B

3) Origen de verdad en conflictos
Si el mismo evento se edita en la app y en Google: ¿cuál gana? Opciones: “última modificación gana”, “siempre Google gana” o “siempre app gana”. Recomendación: “última modificación gana” usando updated_at o equivalente.

RESPUESTA: tu recomendación, última modificación gana

4) Identificación de eventos sincronizados
Guardar google_event_id (y opcionalmente google_calendar_id) en schedule_events para no duplicar y poder actualizar/borrar en Google. Necesario para bidireccional.

RESPUESTA: haz los cambios necesarios en la tabla schedule_events para guardar google_event_id. Te dejo aquí la estructura actual de la tabla. Me entregas la migration y yo haré el migrate.

CREATE TABLE `schedule_events` (
	`id` BIGINT(20) UNSIGNED NOT NULL AUTO_INCREMENT,
	`company_id` BIGINT(20) UNSIGNED NOT NULL,
	`schedule_id` BIGINT(20) UNSIGNED NOT NULL,
	`created_by` BIGINT(20) UNSIGNED NOT NULL,
	`title` VARCHAR(255) NOT NULL COLLATE 'utf8mb4_unicode_ci',
	`description` TEXT NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
	`location` VARCHAR(255) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
	`starts_at` DATETIME NOT NULL,
	`ends_at` DATETIME NOT NULL,
	`all_day` TINYINT(1) NOT NULL DEFAULT '0',
	`status` VARCHAR(255) NULL DEFAULT NULL COLLATE 'utf8mb4_unicode_ci',
	`deleted_at` TIMESTAMP NULL DEFAULT NULL,
	`created_at` TIMESTAMP NULL DEFAULT NULL,
	`updated_at` TIMESTAMP NULL DEFAULT NULL,
	PRIMARY KEY (`id`) USING BTREE,
	INDEX `schedule_events_company_id_index` (`company_id`) USING BTREE,
	INDEX `schedule_events_schedule_id_index` (`schedule_id`) USING BTREE,
	INDEX `schedule_events_created_by_index` (`created_by`) USING BTREE,
	INDEX `schedule_events_starts_at_index` (`starts_at`) USING BTREE,
	INDEX `schedule_events_ends_at_index` (`ends_at`) USING BTREE,
	INDEX `schedule_events_range_index` (`schedule_id`, `starts_at`, `ends_at`) USING BTREE,
	CONSTRAINT `schedule_events_company_id_foreign` FOREIGN KEY (`company_id`) REFERENCES `admin11_db`.`companies` (`id`) ON UPDATE RESTRICT ON DELETE CASCADE,
	CONSTRAINT `schedule_events_created_by_foreign` FOREIGN KEY (`created_by`) REFERENCES `admin11_db`.`users` (`id`) ON UPDATE RESTRICT ON DELETE CASCADE,
	CONSTRAINT `schedule_events_schedule_id_foreign` FOREIGN KEY (`schedule_id`) REFERENCES `admin11_db`.`schedules` (`id`) ON UPDATE RESTRICT ON DELETE CASCADE
)
COLLATE='utf8mb4_unicode_ci'
ENGINE=InnoDB;

5) Frecuencia de sincronización
Opciones: manual (botón “Sincronizar ahora”), en tiempo real (webhooks/push de Google), o periódica (cron cada X minutos). Recomendación: manual + opcional cron para no depender de infra de push al inicio.

RESPUESTA: adelante con tu recomendación.


------------------------------------------------------------------------------------------------------

- 09/02/2026:

Algunas reglas para el calendario / agenda:

- No se pueden generar eventos sin existir al menos una agenda. Utilizar sweet alert para poner un aviso a un usuario que quiere crear un evento sin existir agenda: 'debes crear una agenda antes de guardar eventos'.
- Al generar un evento la fecha de finalización no puede ser anterior a la fecha de inicio. También la hora de finalización no puede ser igual o anterior a la hora fin. Al menos debe haber un intervalo de 15 minutos.
- 