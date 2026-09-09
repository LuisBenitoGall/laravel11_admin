## 1. Portero e identidad en importStore

- [x] 1.1 Sustituir el corte `$name === ''` en `importStore` por el portero: name no vacío OR user_email no vacío OR `rowHasAtLeastOneValidPhoneNumber` (user_phone1/2); fallar antes de la transacción
- [x] 1.2 Motivo de fallo: nueva clave i18n (p. ej. `import_sin_identidad`); no usar `import_sin_nombre` para este corte; `company_*` y `user_nif` solo no abren el portero
- [x] 1.3 En create de User, si name de fila vacío persistir literal `Anónimo`; no asignar name si el User ya existía; si name de fila informado, usarlo (no forzar Anónimo)

## 2. Copy i18n y vista

- [x] 2.1 Añadir clave de motivo en `lang/es.json` y `lang/en.json`
- [x] 2.2 Ampliar `import_condiciones_texto` (es + en) con la regla de al menos nombre, user_email o teléfono de persona; `Import.jsx` sigue usando esa clave (sin UI nueva)

## 3. Tests

- [x] 3.1 Feature: name vacío + user_email → procesa; User nuevo `Anónimo` si no hay match
- [x] 3.2 Feature: name vacío + user_phone1 válido ES → procesa; User `Anónimo`; phone sync
- [x] 3.3 Feature: name vacío + user_email de User existente → reutiliza; name no pasa a Anónimo
- [x] 3.4 Feature: name vacío + email vacío + teléfono no parseable → failed_rows, sin insert
- [x] 3.5 Feature: sin identidad persona + company_email/phone → failed_rows, sin insert
- [x] 3.6 Feature: solo user_nif → failed_rows
- [x] 3.7 Feature: tres vacíos → failed_rows con motivo de la clave nueva (no “Fila sin nombre.”)
- [x] 3.8 Feature: name informado → no forzar Anónimo (comportamiento previo)

## 4. Verificación

- [x] 4.1 Ejecutar tests añadidos/actualizados y comprobar que pasan
- [x] 4.2 `/opsx-verify` (o checklist vs spec/design/tasks) sin hallazgos bloqueantes
  - Checklist: portero name|email|phone ES; `Anónimo` solo en create; i18n `import_sin_identidad` + condiciones; tests 8/8 OK. Hand-off formal a agente 30 si se desea auditoría adicional.
