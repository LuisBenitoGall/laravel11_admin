## 1. Rutas e integración bajo admin

- [x] 1.1 Asegurar que las rutas de integración Google (status, connect, callback, disconnect) estén dentro del grupo con prefix admin y middleware auth, y que los nombres de ruta sean `admin.integrations.google.status`, `admin.integrations.google.connect`, `admin.integrations.google.callback`, `admin.integrations.google.disconnect` (usar subgrupo con `->name('admin.')` si hace falta)
- [x] 1.2 Registrar GET para status y POST o DELETE para disconnect apuntando a métodos del GoogleCalendarController

## 2. Endpoints status y disconnect

- [x] 2.1 Implementar método `status` en GoogleCalendarController: GET que devuelva JSON con `connected` (bool), `email` (string|null), `last_synced_at` (string|null) según la integración del user_id + company_id actual
- [x] 2.2 Implementar método `disconnect` en GoogleCalendarController: desactivar (`is_enabled = false`) o eliminar el registro de GoogleCalendarIntegration del usuario/empresa actual; respuesta idempotente si ya no hay integración activa

## 3. Mapeo Schedule → google_calendar_id

- [x] 3.1 Crear migración que añada columna `google_calendar_id` (string, nullable) a la tabla `schedules`
- [x] 3.2 Añadir `google_calendar_id` al `$fillable` del modelo Schedule y exponerlo en la API/Inertia cuando se listen o editen agendas
- [x] 3.3 En el flujo de edición de agenda (ScheduleFormModal o equivalente), permitir al usuario elegir o escribir el `google_calendar_id` para esa agenda (opcional: listar calendarios del usuario desde Google Calendar API y mostrar selector)

## 4. Cliente Google Calendar API

- [x] 4.1 Crear servicio o clase que, dado un GoogleCalendarIntegration, refresque el access_token si está expirado (usar refresh_token) y exponga un cliente autenticado para Google Calendar API v3
- [x] 4.2 Implementar en el servicio: listar eventos de un calendario en un rango de fechas (timeMin/timeMax)
- [x] 4.3 Implementar en el servicio: crear evento en un calendario y devolver el id del evento creado
- [x] 4.4 Implementar en el servicio: actualizar evento por id y eliminar evento por id

## 5. Sincronización — lectura desde Google

- [x] 5.1 Para cada Schedule del usuario con `google_calendar_id` y con integración Google activa, obtener eventos del calendario en el rango de sincronización (p. ej. rango visible del calendario o último mes + futuro)
- [x] 5.2 Por cada evento de Google: si no existe `schedule_event` con ese `google_event_id`, crear uno en el Schedule correspondiente con título, fechas, descripción, `google_event_id`, `google_calendar_id`; si existe, comparar `updated` (Google) con `updated_at` (local) y si Google es más reciente actualizar el `schedule_event`
- [x] 5.3 Asignar `company_id`, `schedule_id`, `created_by` (usuario actual) a los eventos creados desde Google

## 6. Sincronización — escritura hacia Google

- [x] 6.1 Para cada Schedule con `google_calendar_id`, obtener eventos locales (schedule_events) de ese schedule que no tengan `google_event_id`; crear cada uno en Google y guardar el `google_event_id` devuelto en el `schedule_event`
- [x] 6.2 Para eventos locales que ya tengan `google_event_id`: comparar `updated_at` local con `updated` del evento en Google; si el local es más reciente, enviar actualización a Google Calendar API
- [x] 6.3 Al eliminar un `schedule_event` que tenga `google_event_id`, eliminar también el evento en Google (ScheduleEventController::destroy llama a GoogleCalendarService::deleteEvent)

## 7. Acción de sincronización manual

- [x] 7.1 Exponer endpoint o acción (p. ej. POST `admin/integrations/google/sync`) que ejecute el flujo de sincronización: (1) lectura desde Google (tareas 5.x), (2) escritura hacia Google (tareas 6.x), y actualice `last_synced_at` en la integración
- [x] 7.2 Asegurar que solo se sincronicen agendas visibles para el usuario y que el usuario tenga integración Google activa; si no está conectado, devolver error o 4xx apropiado

## 8. Frontend — modal y botón Sincronizar

- [x] 8.1 Verificar que el modal de Google Calendar en Schedule/Index.jsx use las rutas `route('admin.integrations.google.status')`, `route('admin.integrations.google.connect')`, `route('admin.integrations.google.disconnect')` y que conecte/desconecte/estado funcione correctamente
- [x] 8.2 Añadir botón "Sincronizar ahora" en la UI de la agenda (o en el modal de Google) que llame al endpoint de sync; mostrar estado de carga mientras sincroniza
- [x] 8.3 Tras una sincronización exitosa, refrescar la lista de eventos del calendario (FullCalendar) y actualizar el indicador de última sincronización; si el usuario no está conectado, el botón Sincronizar debe estar deshabilitado o no mostrarse

## 9. Verificación

- [ ] 9.1 Probar flujo completo: conectar con Google, asignar calendar_id a una agenda, sincronizar, comprobar que eventos de Google aparecen en la agenda y que eventos creados en la app aparecen en Google
- [ ] 9.2 Probar resolución de conflictos: editar el mismo evento en Google y en la app; sincronizar y comprobar que gana la última modificación
