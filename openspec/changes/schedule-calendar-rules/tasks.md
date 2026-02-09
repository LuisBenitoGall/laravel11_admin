## 1. Backend — validaciones de eventos

- [x] 1.1 Actualizar `ScheduleEventStoreRequest` y `ScheduleEventUpdateRequest` para validar que `ends_at` no sea anterior a `starts_at`.
- [x] 1.2 Añadir regla para eventos con hora (no `all_day`) que exija un mínimo de 15 minutos entre `starts_at` y `ends_at`.
- [x] 1.3 Ajustar mensajes de error de validación para que indiquen claramente el problema de fechas/horas.

## 2. Frontend — flujo de creación de eventos

- [x] 2.1 En la vista de agenda, impedir la apertura/guardado de eventos si no existe ninguna agenda disponible; mostrar SweetAlert con `debes crear una agenda antes de guardar eventos`.
- [x] 2.2 Añadir validación de coherencia de fecha/hora en el formulario de eventos (fin no anterior a inicio y al menos 15 minutos de diferencia) como ayuda inmediata al usuario.
- [x] 2.3 Alinear la visualización de errores de formulario con las nuevas reglas (mensajes bajo campos o notificación coherente con el resto del módulo).

## 3. Verificación

- [ ] 3.1 Probar que, sin agendas, cualquier intento de crear evento muestra el SweetAlert y no persiste datos.
- [ ] 3.2 Probar que el backend rechaza eventos con fin antes de inicio o con menos de 15 minutos de diferencia, incluso si el frontend falla.
- [ ] 3.3 Añadir/actualizar tests automatizados de agenda que cubran estas validaciones críticas.


